import { fromJS } from 'immutable';
import MAP_STYLE from './map-style-basic-v8.json';

export const makeFeatureCollection = data => {
  const collection = {
    type: 'FeatureCollection',
    features: data,
  };
  return fromJS({
    type: 'geojson',
    data: collection,
  });
};

export const pointLayer = fromJS({
  id: 'point',
  source: 'water-stations',
  type: 'circle',
  paint: {
    'circle-radius': 6,
    'circle-color': '#7100b0'
  }
});

export const userLocationLayer = fromJS({
  id: 'user-location',
  source: 'user-location',
  type: 'circle',
  paint: {
    'circle-radius': 8,
    'circle-color': '#007cbf'
  }
});

const metersToPixelsAtMaxZoom = (meters, latitude) => meters / 0.075 / Math.cos(latitude * Math.PI / 180);

export const circleLayer = (radiusInMeters, latitude) => (
  fromJS({
    id: 'circle',
    source: 'search-radius',
    type: 'circle',
    paint: {
      'circle-radius': {
        stops: [
          [0, 0],
          [20, metersToPixelsAtMaxZoom(radiusInMeters, latitude)]
        ],
        base: 2
      },
      'circle-color': '#ff0000',
      'circle-opacity': 0.055
    }
  })
);

export const defaultMapStyle = fromJS(MAP_STYLE);
