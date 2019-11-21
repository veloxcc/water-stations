import React from 'react';
import { Popup as PopupBase } from 'react-map-gl';

const Popup = ({
  tipSize = 5,
  longitude,
  latitude,
  locationArea,
  locationName,
  operationInfo,
  onClose,
}) => (
  <PopupBase
    tipSize={tipSize}
    longitude={longitude}
    latitude={latitude}
    closeOnClick={false}
    onClose={onClose}
  >
    <div className="popup-container">
      <h2>{locationArea}</h2>
      {locationName && (
        <p>{locationName}</p>
      )}
      {operationInfo && (
        <p>{`In operation: ${operationInfo}`}</p>
      )}
      <a href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=bicycling`} target="_blank">Directions here</a>
    </div>
  </PopupBase>
);

export default Popup;
