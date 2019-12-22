import React, { useEffect, useState } from 'react';
import ReactMapGL from 'react-map-gl';

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
  coords,
  defaultSearchRadius = 2500,
  defaultZoom = 13,
}) => {
  const defaultViewport = {
    zoom: defaultZoom,
    minZoom: defaultZoom - 1,
    width: '100%',
    height: '100%',
    clickRadius: 6,
  };
  const [userLocation, setUserLocation] = useState();
  const [searchRadius, setSearchRadius] = useState(defaultSearchRadius);
  const [viewport, setViewport] = useState(defaultViewport);
  const [mapStyle, setMapStyle] = useState(defaultMapStyle);
  const [interactiveLayerIds, setInteractiveLayerIds] = useState([]);
  const [popup, setPopup] = useState();
  const [panning, setPanning] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [ref, setRef] = useState(React.createRef());

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

  const searchByRadius = async (latitude, longitude) => {
    const result = await mapService.searchByRadius({
      latitude,
      longitude,
      searchRadius,
    });

    if (result)
      updateMapStyle(result);
  };

  const searchByBoundingBox = async (sw, ne) => {
    const bounds = ref.getMap().getBounds();
    const bottomLeftCoords = bounds.getSouthWest(); 
    const upperRightCoords = bounds.getNorthEast();
    const searchOptions = { sw: bottomLeftCoords, ne: upperRightCoords };
    const result = await mapService.searchByBox(searchOptions);

    if (result)
      updateMapStyle(result);
  };

  const handleViewportChange = viewState => setViewport(viewState);

  const handleInteractionStateChange = interactionState => {
    const { isPanning, isZooming } = interactionState;

    if (isPanning === undefined && isZooming === undefined)
      return;
    
    if (isPanning === false && panning === true)
      searchByBoundingBox();

    if (isZooming === false && zooming === true)
      searchByBoundingBox();

    setZooming(isZooming);
    setPanning(isPanning);
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
    if (userLocation) {
      const { latitude, longitude } = userLocation; 
      searchByRadius(latitude, longitude);
    }
  }, [userLocation]);

  return (
    <ReactMapGL
      {...viewport}
      mapStyle={mapStyle}
      onViewportChange={handleViewportChange}
      onInteractionStateChange={handleInteractionStateChange}
      getCursor={({isHovering}) => isHovering ? 'pointer' : 'default'}
      onClick={handleMarkerClick}
      interactiveLayerIds={interactiveLayerIds}
      ref={ref => setRef(ref)}
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
    </ReactMapGL>
  );
}

export default Map;
