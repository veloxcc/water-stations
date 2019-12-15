import React, { useEffect, useState } from 'react';
import ReactMapGL, { NavigationControl } from 'react-map-gl';

import {
  defaultMapStyle,
  pointLayer,
  circleLayer,
  userLocationLayer,
  makeFeatureCollection
} from './map-style';

import mapService from './map-service';

import Popup from './Popup';

import 'mapbox-gl/dist/mapbox-gl.css';
import './map.css';

const Map = ({
  endpoint,
  coords,
  defaultSearchRadius = 2500,
  defaultZoom = 13,
}) => {
  const defaultViewport = {
    zoom: defaultZoom,
  };
  const [userLocation, setUserLocation] = useState();
  const [searchRadius, setSearchRadius] = useState(defaultSearchRadius);
  const [viewport, setViewport] = useState(defaultViewport);
  const [mapStyle, setMapStyle] = useState(defaultMapStyle);
  const [interactiveLayerIds, setInteractiveLayerIds] = useState([]);
  const [popup, setPopup] = useState();

  const updateMapStyle = data => {
    const newMapStyle = createNewMapStyle(data);
    setMapStyle(newMapStyle);
  }

  const createNewMapStyle = data => {
    const { latitude, longitude } = userLocation;

    const stationsSource = makeFeatureCollection(data);
    const radiusSource = makeFeatureCollection([{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    }]);
    const userLocationSource = makeFeatureCollection([{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    }]);

    const mapLayers = defaultMapStyle.get('layers');

    const newMapStyle = mapStyle
      .setIn(['sources', 'water-stations'], stationsSource)
      .setIn(['sources', 'search-radius'], radiusSource)
      .setIn(['sources', 'user-location'], userLocationSource)
      .set('layers',
        mapLayers.push(...[pointLayer, userLocationLayer, circleLayer(searchRadius, latitude)])
      );

    return newMapStyle;
  }

  const handleMarkerClick = evt => {
    const { features } = evt;

    if (features.length > 0) {
      const feature = features[0];
      const props = {
        ...feature.geometry,
        ...feature.properties,
      };
      setPopup(props);
    }
  };

  const handleUserLocationChange = async () => {
    const { latitude, longitude } = userLocation;
    const result = await mapService.search({
      latitude,
      longitude,
      endpoint,
      searchRadius,
    });

    if (result)
      updateMapStyle(result);
  };

  useEffect(() => {
    if (coords) {
      const { latitude, longitude } = coords;

      setViewport({
        ...viewport,
        latitude,
        longitude,
      });

      setUserLocation({
        latitude,
        longitude,
      });
    }
  }, [coords]);

  useEffect(() => {
    setInteractiveLayerIds([pointLayer.get('id')]);
  }, []);

  useEffect(() => {
    if (userLocation)
      handleUserLocationChange();
  }, [userLocation]);

  return (
    <ReactMapGL
      {...viewport}
      width="100%"
      height="100%"
      mapStyle={mapStyle}
      onViewportChange={v => setViewport(v)}
      getCursor={({isHovering}) => isHovering ? 'pointer' : 'default'}
      onClick={handleMarkerClick}
      interactiveLayerIds={interactiveLayerIds}
      clickRadius={6}
    >
      {popup && (
        <Popup
          tipSize={5}
          longitude={popup.coordinates[0]}
          latitude={popup.coordinates[1]}
          closeOnClick={false}
          locationArea={popup.geo_local_area}
          locationName={popup.name}
          operationInfo={popup.in_operation}
          onClose={() => setPopup(null)}
        />
      )}
      <NavigationControl
        className="control-navigation"
        showCompass={false}
      />
    </ReactMapGL>
  );
}

export default Map;
