import fetchJsonp from 'fetch-jsonp';

export default class DarkSky {
  constructor(apiKey) {
    this.baseUrl = 'https://api.darksky.net/';
    this.apiKey = apiKey;
  }

  forecast(latitude, longitude, options, callback) {
    const url = `${this.baseUrl}forecast/${this.apiKey}/${latitude},${longitude}`;

    // TODO: Process options

    fetchJsonp(url)
      .then(function(response) {
        return response.json();
      }).then(function(json) {
        callback(null, json);
      }).catch(function(ex) {
        callback(ex);
      });
  }
}
