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

    const location = storage.getItem('lastLocation', constants.DEFAULT_LOCATION)

    this.state = {
      showMap: storage.getItem('showMap', true),
      location: location,
      mapCenter: location,
      showModal: false,
      settingsButtonHovered: false
    };

    this.updateLocation();
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

    storage.setItem('lastLocation', location);

    this.setState({
      location: location
    });
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

    this.setState({
      mapCenter: [center.lat, center.lng]
    });
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
          show={this.state.showModal}
          onHide={this.closeModal}>
          <Modal.Body>
            <h2>Settings</h2>
            <ToggleButton
              value={this.state.showMap}
              onToggle={this.onToggleShowMap.bind(this)}
              thumbStyle={{borderRadius: 2}}
              trackStyle={{borderRadius: 2}} />
            Show Map?
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.closeModal}>
              <Glyphicon glyph='remove' />
              Close
            </Button>
          </Modal.Footer>
        </Modal>
        <Overlay mapCenter={this.state.mapCenter} />
      </div>
    );
  }

  renderMap() {
    if (this.state.showMap) {
      return (
        <Map
          center={this.state.location}
          zoom={13}
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
