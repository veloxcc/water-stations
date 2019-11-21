import React, { useEffect, useState } from 'react';
import ReactMapGL, { NavigationControl } from 'react-map-gl';
import axios from 'axios';

import { defaultMapStyle, pointLayer, circleLayer, makeFeatureCollection } from './map-style.js';

import Popup from './Popup';

import 'mapbox-gl/dist/mapbox-gl.css';
import './map.css';

const Map = ({
  endpoint,
  coords,
}) => {
  const defaultViewport = {
    zoom: 13,
  };
  const [userLocation, setUserLocation] = useState();
  const [searchRadius, setSearchRadius] = useState(2500);
  const [viewport, setViewport] = useState(defaultViewport);
  const [mapStyle, setMapStyle] = useState(defaultMapStyle);
  const [interactiveLayerIds, setInteractiveLayerIds] = useState([]);
  const [popup, setPopup] = useState();

  const fetchData = async () => {
    const { latitude, longitude } = userLocation;
    const url = `${endpoint}?lng=${longitude}&lat=${latitude}&r=${searchRadius}`;
    
    try {
      const response = await axios.get(url);
      const { data } = response;
      updateMapStyle(data);
    } catch(err) {
      console.error(err);
    }
  }

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

    const mapLayers = defaultMapStyle.get('layers');

    const newMapStyle = mapStyle
      .setIn(['sources', 'water-stations'], stationsSource)
      .setIn(['sources', 'search-radius'], radiusSource)
      .set('layers', mapLayers.push(...[pointLayer, circleLayer(searchRadius, latitude)]));

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
    if (userLocation) fetchData();
  }, [userLocation]);

  return (
    <ReactMapGL
      {...viewport}
      width="100%"
      height="100%"
      mapStyle={mapStyle}
      onViewportChange={v => setViewport(v)}
      getCursor={({isHovering, isDragging}) => isHovering ? 'pointer' : 'default'}
      onClick={handleMarkerClick}
      interactiveLayerIds={interactiveLayerIds}
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
