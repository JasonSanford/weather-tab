const myTokenDontStealPlz = 'pk.eyJ1IjoiamNzYW5mb3JkIiwiYSI6InRJMHZPZFUifQ.F4DMGoNgU3r2AWLY0Eni-w';

const maps = [
  {
    id: 1,
    name: 'Streets',
    mapboxId: 'mapbox/streets-v8',
    token: myTokenDontStealPlz
  }, {
    id: 2,
    name: 'Light',
    mapboxId: 'mapbox/light-v9',
    token: myTokenDontStealPlz
  }, {
    id: 3,
    name: 'Outdoors',
    mapboxId: 'mapbox/outdoors-v9',
    token: myTokenDontStealPlz
  }, {
    id: 4,
    name: 'Satellite',
    mapboxId: 'mapbox/satellite-streets-v9',
    token: myTokenDontStealPlz
  }, {
    id: 5,
    name: 'Dark',
    mapboxId: 'mapbox/dark-v9',
    token: myTokenDontStealPlz
  }
];

export class TileMap {
  static byId(id) {
    let map;

    for (let _map of maps) {
      if (_map.id === id) {
        map = _map;
        break;
      }
    }

    return map;
  }

  static random() {
    return maps[Math.floor(Math.random() * maps.length)];
  }

  static all() {
    return maps;
  }
}
