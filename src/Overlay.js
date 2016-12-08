import React, { Component } from 'react';
import MapboxClient from 'mapbox';

import { MAPBOX_ACCESS_TOKEN } from './constants';
import Weather from './Weather';

import './Overlay.css';

class Overlay extends Component {
  constructor(props) {
    super(props);

    this.mapboxClient = new MapboxClient(MAPBOX_ACCESS_TOKEN);

    this.state = {
      mapCenter: props.mapCenter,
      address: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      mapCenter: nextProps.mapCenter
    }, this.updateAddress.bind(this));
  }

  render() {
    return (
      <div className='Overlay'>
        <Weather mapCenter={this.state.mapCenter} />
        <h3 className='Address'>{this.state.address}</h3>
      </div>
    );
  }

  updateAddress() {
    let address = '';

    const location = {
      latitude: this.state.mapCenter[0],
      longitude: this.state.mapCenter[1]
    };

    this.mapboxClient.geocodeReverse(location, function (error, response) {
      if (error) {
        return console.log('Geocode Error: ', error);
      }

      if (response.features && response.features.length > 0) {
        address = response.features[0].place_name;
      }

      this.setState({ address });
    }.bind(this));
  }
}

export default Overlay;
