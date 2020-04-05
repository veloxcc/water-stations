require('dotenv').config();

import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import { geolocated } from 'react-geolocated';

import Map from './components/Map';
import Notification from './components/Notification';
import SettingsToggle from './components/SettingsToggle';

import 'milligram';
import './styles.css';

const googleTrackingId = process.env.GOOGLE_TRACKING_ID || '';

ReactGA.initialize(googleTrackingId);

const App = props => {
  const [menuOpened, setMenuOpened] = useState(false);

  return (
    <div className="container">
      <header>
        <div className="row">
          <div className="column">
            <div
              className="header-overlay"
            >
              <a href="/">velox.cc</a> / water-stations
              {props.coords && <SettingsToggle onClick={() => setMenuOpened(!menuOpened)} />}
            </div>
          </div>
        </div>
      </header>
      <div className="row">
        <div className="column">
          <div className="body-overlay">
            {!props.isGeolocationAvailable && (
              <Notification type="warning">
              <b>Warning: </b>This application requires the use of location services, but it 
              appears you device or browser does not support location services.
              </Notification>
            )}

            {!props.isGeolocationEnabled && props.positionError && (
              <Notification type="warning">
                <b>Warning:</b> This application requires the use of location services, please 
                enable them on your device to use this application.
              </Notification>
            )}
          </div>
          {props.coords && (
            <div className="map-overlay">
              <Map
                coords={props.coords}
                menuOpened={menuOpened}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const GeolocatedApp = geolocated({
  positionOptions: {
    enableHighAccuracy: false,
  },
  userDecisionTimeout: 5000,
})(App);

const mountNode = document.getElementById('app');
ReactDOM.render(<GeolocatedApp />, mountNode);
