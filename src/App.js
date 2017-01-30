import React, { Component } from 'react';
import { Map, TileLayer, Marker, AttributionControl } from 'react-leaflet';
import { Button, Glyphicon, Modal } from 'react-bootstrap';
import Radio from 'rc-radio';
import classNames from 'classnames';
import L from 'leaflet';

import * as constants from './constants'
import { backgrounds } from './backgrounds';
import { TileMap } from './tilemap';
import * as storage from './storage';
import Overlay from './Overlay';

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
    const showMap = (mapId != 0);
    const mapTileUrl = this.getMapTileUrl(mapId);

    this.state = {
      showMap,
      location,
      zoom,
      mapTileUrl,
      mapId,
      userLocation: null,
      showModal: false,
      settingsButtonHovered: false
    };

    this.updateLocation();
  }

  getMapTileUrl(mapId) {
    if (mapId == 0) {
      return null;
    }

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
    const location = lastLocation;
    const zoom = event.target.getZoom();

    storage.setItem('lastLocation', lastLocation);
    storage.setItem('zoom', zoom);

    this.setState({ location, lastLocation, zoom });
  }

  openModal(event) {
    event.preventDefault();
    this.setState({showModal: true});
  }

  closeModal() {
    this.setState({showModal: false});
  }

  onMapChange(event) {
    const mapId = event.target.value;
    const showMap = (mapId != 0);
    const mapTileUrl = this.getMapTileUrl(mapId);

    storage.setItem('mapId', mapId);

    this.setState({ mapId, mapTileUrl, showMap });
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
            <h2>Base Map</h2>
            <div className='row'>
              <div className='col-md-4 col-md-offset-4 Setting'>
                <div className='well'>
                  <label key={'random'}>
                    <Radio
                      value={'random'}
                      checked={this.state.mapId === 'random'}
                      onChange={this.onMapChange.bind(this)} />
                    Random
                  </label>
                  {
                    TileMap.all().map(function (tileMap) {
                      return (
                        <label key={tileMap.id}>
                          <Radio
                            value={tileMap.id}
                            checked={this.state.mapId === tileMap.id}
                            onChange={this.onMapChange.bind(this)} />
                          {tileMap.name}
                        </label>
                      );
                    }.bind(this))
                  }
                  <label key={'0'}>
                    <Radio
                      value={0}
                      checked={this.state.mapId == 0}
                      onChange={this.onMapChange.bind(this)} />
                    None
                  </label>
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

      if (this.state.userLocation) {
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
          onMoveEnd={this.onMapMoveEnd}
          attributionControl={false}>
          <AttributionControl
            prefix={'Weather Powered By <a target="_blank" href="https://darksky.net/poweredby/">Dark Sky</a>'} />
          <TileLayer
            url={this.state.mapTileUrl}
            attribution='© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>' />
          {marker}
        </Map>
      );
    }
  }
}

export default App;
