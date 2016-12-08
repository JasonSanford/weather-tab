import React, { Component } from 'react';
import distance from 'turf-distance';
import { Glyphicon } from 'react-bootstrap';

import DarkSky from './darksky'
import { DARKSKEY_KEY } from './constants';

import './Weather.css';

const MIN_DISTANCE_FOR_UPDATE = 5;  // kilometers

class Weather extends Component {
  constructor(props) {
    super(props);

    this.haveMadeInitialFetch = false;
    this.darkSkyClient = new DarkSky(DARKSKEY_KEY);

    this.state = {
      temperature: null,
      summary: '',
      mapCenter: props.mapCenter
    };
  }

  componentWillReceiveProps(nextProps) {
    const weShouldUpdateWeather = this.shouldFetchFreshWeather(nextProps.mapCenter);

    if (weShouldUpdateWeather) {
      this.setState({
        mapCenter: nextProps.mapCenter
      }, function () {
        this.updateWeather();
      }.bind(this));
    }
  }

  shouldFetchFreshWeather(nextMapCenter) {
    if (!this.haveMadeInitialFetch) {
      return true;
    }

    const currentPoint = {
      type: 'Feature',
      properties: null,
      geometry: {
        type: 'Point',
        coordinates: [this.state.mapCenter[1], this.state.mapCenter[0]]
      }
    };

    const nextPoint = {
      type: 'Feature',
      properties: null,
      geometry: {
        type: 'Point',
        coordinates: [nextMapCenter[1], nextMapCenter[0]]
      }
    };

    const dist = distance(currentPoint, nextPoint);  // kilometers

    return dist > MIN_DISTANCE_FOR_UPDATE;
  }

  render() {
    const temp = this.renderTemperature();

    return (
      <div className='Weather'>
        <h2 className='Temperature'>{temp}</h2>
        <h3 className='Summary'>{this.state.summary}</h3>
      </div>
    );
  }

  renderTemperature() {
    if (this.state.temperature) {
      return this.state.temperature;
    } else {
      return (
        <Glyphicon
          glyph='refresh'
          className='fa-spin' />
      );
    }
  }

  updateWeather() {
    this.haveMadeInitialFetch = true;

    this.darkSkyClient.forecast(this.state.mapCenter[0], this.state.mapCenter[1], {}, function (error, response) {
      if (error) {
        return console.log('Forecast Error: ', error);
      }

      let temp, summary = '';

      if (response.currently) {
        if (response.currently.temperature) {
          temp = parseInt(response.currently.temperature, 10);
        }

        if (response.currently.summary) {
          summary = response.currently.summary;
        }
      }

      this.setState({
        temperature: temp,
        summary: summary
      });
    }.bind(this))
  }
}

export default Weather;
