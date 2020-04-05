import React from 'react';
import { motion } from 'framer-motion';
import { MdSettings as SettingsIcon } from 'react-icons/md';

const SettingsToggle = ({
  onClick,
}) => (
  <motion.button
    className="button-settings"
    onClick={onClick}
    initial={{ opacity: 0.5 }}
    whileHover={{ opacity: 1 }}
  >
    <SettingsIcon />
  </motion.button>
);

export default SettingsToggle;
