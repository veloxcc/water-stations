import React from 'react';

const classTypes = {
  default: 'notification--default',
  warning: 'notification--warning',
  alert: 'notification--alert',
};

const Notification = ({
  children,
  type = 'default',
  className,
  ...other
}) => (
  <div
    className={['notification', classTypes[type], className].join(' ').trim()}
    {...other}
  >
    {children}
  </div>
);

export default Notification;
