import React, { Component } from 'react';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { Button, Glyphicon, Modal } from 'react-bootstrap';
import Checkbox from 'rc-checkbox';
import Radio from 'rc-radio';
import ToggleButton from 'react-toggle-button';
import classNames from 'classnames';
import L from 'leaflet';

import * as constants from './constants'
import { backgrounds } from './backgrounds';
import { TileMap } from './tilemap';
import * as storage from './storage';
import Overlay from './Overlay';

import 'rc-checkbox/assets/index.css';
import './App.css';

const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];

class App extends Component {
  constructor() {
    super();

    this.positionSuccess           = this.positionSuccess.bind(this);
    this.openModal                 = this.openModal.bind(this);
    this.closeModal                = this.closeModal.bind(this);
    this.onMouseOverSettingsButton = this.onMouseOverSettingsButton.bind(this);
    this.onMouseOutSettingsButton  = this.onMouseOutSettingsButton.bind(this);
    this.onMapMoveEnd              = this.onMapMoveEnd.bind(this);

    this.userLocationIcon = L.divIcon({
      className: 'LocationIcon',
      iconSize: [20, 20]
    });

    const mapId = storage.getItem('mapId', 'random');

    const location = storage.getItem('lastLocation', constants.DEFAULT_LOCATION);
    const zoom = storage.getItem('zoom', 13);
    const showMap = storage.getItem('showMap', true);
    const geolocation = storage.getItem('geolocation', true);
    const mapTileUrl = this.getMapTileUrl(mapId);

    this.state = {
      showMap,
      geolocation,
      location,
      zoom,
      mapTileUrl,
      randomMap: (mapId === 'random'),
      mapId: (mapId === 'random' ? 1 : mapId),
      userLocation: null,
      showModal: false,
      settingsButtonHovered: false
    };

    if (geolocation) {
      this.updateLocation();
    }
  }

  getMapTileUrl(mapId) {
    const map = (mapId === 'random') ? TileMap.random() : TileMap.byId(mapId);

    return `https://api.mapbox.com/styles/v1/${map.mapboxId}/tiles/256/{z}/{x}/{y}@2x?access_token=${map.token}`
  }

  updateLocation() {
    const positionOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 1000 * 60 * 10
    };

    window.navigator.geolocation.getCurrentPosition(this.positionSuccess,
                                                    this.positionError,
                                                    positionOptions)
  }

  positionSuccess(position) {
    let location = [position.coords.latitude, position.coords.longitude];
    let userLocation = location;

    this.setState({ location, userLocation });
  }

  positionError(error) {
    console.log('Geolocation error:');
    console.log(error);
  }

  onMouseOverSettingsButton() {
    this.setState({
      settingsButtonHovered: true
    });
  }

  onMouseOutSettingsButton() {
    this.setState({
      settingsButtonHovered: false
    });
  }

  onMapMoveEnd(event) {
    const center = event.target.getCenter();
    const lastLocation = [center.lat, center.lng];
    const zoom = event.target.getZoom();

    storage.setItem('lastLocation', lastLocation);
    storage.setItem('zoom', zoom);

    this.setState({ lastLocation, zoom });
  }

  openModal(event) {
    event.preventDefault();
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
  }

  onToggleShowMap(value) {
    const showMap = !value;

    storage.setItem('showMap', showMap);

    this.setState({ showMap });
  }

  onToggleGeolocation(value) {
    const geolocation = !value;
    const userLocation = null;

    storage.setItem('geolocation', geolocation);

    this.setState({ geolocation, userLocation }, function () {
      if (geolocation) {
        this.updateLocation();
      }
    }.bind(this));
  }

  onChangeRandomMap(event) {
    const checked = event.target.checked;
    const mapId = checked ? 'random' : this.state.mapId;
    const mapTileUrl = this.getMapTileUrl(mapId);

    storage.setItem('mapId', mapId);

    this.setState({
      randomMap: checked,
      mapTileUrl
    });
  }

  onMapChange(event) {
    const mapId = event.target.value;
    const mapTileUrl = this.getMapTileUrl(mapId);

    storage.setItem('mapId', mapId);

    this.setState({ mapId, mapTileUrl });
  }

  render() {
    let settingsButtonClassName = classNames({
      'SettingsButton': true,
      'fa-spin': this.state.settingsButtonHovered
    });

    const map = this.renderMap();

    return (
      <div className='App' style={{backgroundImage: randomBackground}}>
        <Glyphicon
          glyph='cog'
          className={settingsButtonClassName}
          onMouseOver={this.onMouseOverSettingsButton}
          onMouseOut={this.onMouseOutSettingsButton}
          onClick={this.openModal} />
        {map}
        <Modal
          className='Settings'
          show={this.state.showModal}
          onHide={this.closeModal}>
          <Modal.Body>
            <h2>Settings</h2>
            <div className='row'>
              <div className='col-md-4 Setting text-centered'>
                <div className='well'>
                  <h4>Show Map</h4>
                  <div className='ToggleContainer'>
                    <ToggleButton
                      className='Toggle'
                      value={this.state.showMap}
                      onToggle={this.onToggleShowMap.bind(this)}
                      thumbStyle={{borderRadius: 2}}
                      trackStyle={{borderRadius: 2}} />
                  </div>
                </div>
              </div>
              <div className='col-md-4 Setting middle text-centered'>
                <div className='well'>
                  <h4>Geolocation</h4>
                  <div className='ToggleContainer'>
                    <ToggleButton
                      value={this.state.geolocation}
                      onToggle={this.onToggleGeolocation.bind(this)}
                      thumbStyle={{borderRadius: 2}}
                      trackStyle={{borderRadius: 2}} />
                  </div>
                </div>
              </div>
              <div className='col-md-4 Setting text-left'>
                <div className='well'>
                  <h4>Base Map</h4>
                  <label>
                    <Checkbox
                      disabled={!this.state.showMap}
                      checked={this.state.randomMap}
                      onChange={this.onChangeRandomMap.bind(this)} />
                    &nbsp;
                    Random
                  </label>
                  <hr />
                  {
                    TileMap.all().map(function (tileMap) {
                      return (
                        <label key={tileMap.id}>
                          <Radio
                            value={tileMap.id}
                            checked={this.state.mapId === tileMap.id}
                            onChange={this.onMapChange.bind(this)}
                            disabled={!this.state.showMap || this.state.randomMap} />
                          &nbsp;
                          {tileMap.name}
                        </label>
                      );
                    }.bind(this))
                  }
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeModal}>
              <Glyphicon glyph='remove' />
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Overlay location={this.state.location} />
      </div>
    );
  }

  renderMap() {
    if (this.state.showMap) {
      let marker;

      if (this.state.geolocation && this.state.userLocation) {
        marker = (
          <Marker
            position={this.state.userLocation}
            icon={this.userLocationIcon}
            clickable={false} />
        );
      }

      return (
        <Map
          center={this.state.location}
          zoom={this.state.zoom}
          zoomControl={false}
          className='WeatherMap'
          onMoveEnd={this.onMapMoveEnd}>
          <TileLayer
            url={this.state.mapTileUrl}
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
          {marker}
        </Map>
      );
    }
  }
}

export default App;
