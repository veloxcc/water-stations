import React from 'react';
import { motion } from 'framer-motion';

const container = {
  hidden: { height: 0 },
  visible: {
    height: 'auto',
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

// TODO: adjust delay
const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  },
};

const MapSettings = ({
  menuOpened,
  searchRadius,
  onSearchRadiusChange,
  onReset,
}) => (
  <motion.div
    className="menu"
    variants={container}
    initial="hidden"
    animate={menuOpened ? 'visible' : 'hidden'}
  >
    <div className="menu-container">
      <motion.div
        className="settings-control"
        variants={item}
      >
        <label htmlFor="settings-input-search">Distance:</label>
        <select
          id="settings-input-search"
          defaultValue={searchRadius}
          onChange={e => onSearchRadiusChange(e.target.value)}
        >
          <option value="1000">1 KM</option>
          <option value="2500">2.5 KM</option>
          <option value="5000">5 KM</option>
        </select>
      </motion.div>
      <motion.div
        className="settings-control"
        variants={item}
      >
        <button className="settings-button-reset" onClick={onReset}>Reset</button>
      </motion.div>
    </div>
  </motion.div>
);

export default MapSettings;
