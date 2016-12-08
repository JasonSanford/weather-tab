import React, { Component } from 'react';
import { Map, TileLayer } from 'react-leaflet';
import { Button, Glyphicon, Modal } from 'react-bootstrap';
import ToggleButton from 'react-toggle-button';
import classNames from 'classnames';

import * as constants from './constants'
import { backgrounds } from './backgrounds';
import { maps } from './maps';
import * as storage from './storage';
import Overlay from './Overlay';

import './App.css';

const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];

const randomMap = maps[Math.floor(Math.random() * maps.length)];
const tileUrl = `https://api.mapbox.com/styles/v1/${randomMap}/tiles/256/{z}/{x}/{y}@2x?access_token=${constants.MAPBOX_ACCESS_TOKEN}`

class App extends Component {
  constructor() {
    super();

    this.positionSuccess           = this.positionSuccess.bind(this);
    this.openModal                 = this.openModal.bind(this);
    this.closeModal                = this.closeModal.bind(this);
    this.onMouseOverSettingsButton = this.onMouseOverSettingsButton.bind(this);
    this.onMouseOutSettingsButton  = this.onMouseOutSettingsButton.bind(this);
    this.onMapMoveEnd              = this.onMapMoveEnd.bind(this);

    const location = storage.getItem('lastLocation', constants.DEFAULT_LOCATION);
    const zoom = storage.getItem('zoom', 13);
    const showMap = storage.getItem('showMap', true);
    const geolocation = storage.getItem('geolocation', true);

    this.state = {
      showMap,
      geolocation,
      location,
      zoom,
      showModal: false,
      settingsButtonHovered: false
    };

    if (geolocation) {
      this.updateLocation();
    }
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
    let location = [position.coords.latitude, position.coords.longitude]

    this.setState({ location });
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

    storage.setItem('geolocation', geolocation);

    this.setState({ geolocation }, function () {
      if (geolocation) {
        this.updateLocation();
      }
    }.bind(this));
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
              <div className='col-md-4 col-md-offset-2 Setting'>
                <div className='well'>
                  <div className='ToggleContainer'>
                    <ToggleButton
                      className='Toggle'
                      value={this.state.showMap}
                      onToggle={this.onToggleShowMap.bind(this)}
                      thumbStyle={{borderRadius: 2}}
                      trackStyle={{borderRadius: 2}} />
                  </div>
                  <p>Show Map?</p>
                </div>
              </div>
              <div className='col-md-4 Setting'>
                <div className='well'>
                  <div className='ToggleContainer'>
                    <ToggleButton
                      value={this.state.geolocation}
                      onToggle={this.onToggleGeolocation.bind(this)}
                      thumbStyle={{borderRadius: 2}}
                      trackStyle={{borderRadius: 2}} />
                  </div>
                  <p>Geolocation?</p>
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
      return (
        <Map
          center={this.state.location}
          zoom={this.state.zoom}
          zoomControl={false}
          className='WeatherMap'
          onMoveEnd={this.onMapMoveEnd}>
          <TileLayer
            url={tileUrl}
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
        </Map>
      );
    }
  }
}

export default App;
