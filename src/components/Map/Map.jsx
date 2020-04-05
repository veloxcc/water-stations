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
import mapCache from './map-cache';

import Popup from './Popup';
import MapSettings from './MapSettings';

import 'mapbox-gl/dist/mapbox-gl.css';
import './map.css';

const Map = ({
  coords,
  defaultZoom = 13,
  menuOpened = false,
}) => {
  const defaultViewport = {
    zoom: defaultZoom,
    minZoom: defaultZoom - 1,
    width: '100%',
    height: '100%',
    clickRadius: 8,
  };
  const [userLocation, setUserLocation] = useState();
  const [searchRadius, setSearchRadius] = useState(1000);
  const [viewport, setViewport] = useState(defaultViewport);
  const [mapStyle, setMapStyle] = useState(defaultMapStyle);
  const [interactiveLayerIds, setInteractiveLayerIds] = useState([]);
  const [popup, setPopup] = useState();
  const [panning, setPanning] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [ref, setRef] = useState(React.createRef());

  const updateMapStyle = data => {
    mapCache.add(data);
    const newMapStyle = createNewMapStyle(mapCache.data);
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

  const searchByRadius = async () => {
    const { latitude, longitude } = userLocation;
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
    const searchOptions = {
      sw: bounds.getSouthWest(),
      ne: bounds.getNorthEast()
    };
    const result = await mapService.searchByBox(searchOptions);

    if (result)
      updateMapStyle(result);
  };

  const handleViewportChange = viewState => setViewport(viewState);

  const handleInteractionStateChange = interactionState => {
    const { isPanning, isZooming } = interactionState;

    if (isPanning === undefined && isZooming === undefined)
      return;

    if (
      isPanning === false && panning === true ||
      isZooming === false && zooming === true
    )
      searchByBoundingBox();

    setZooming(isZooming);
    setPanning(isPanning);
  };

  const resetViewport = () => {
    const { latitude, longitude } = coords;

    setViewport({
      ...viewport,
      zoom: defaultViewport.zoom,
      latitude,
      longitude,
    });
  };

  useEffect(() => {
    setInteractiveLayerIds([pointLayer.get('id')]);
  }, []);

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
    if (userLocation)
      searchByRadius();
  }, [userLocation, searchRadius]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <MapSettings
        menuOpened={menuOpened}
        onSearchRadiusChange={radius => setSearchRadius(radius)}
        onReset={resetViewport}
      />
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
            locationArea={popup.area_name}
            locationName={popup.name}
            operationInfo={popup.operation}
            onClose={() => setPopup(null)}
          />
        )}
      </ReactMapGL>
    </div>
  );
}

export default Map;
