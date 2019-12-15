import axios from 'axios';

const search = async ({
  endpoint,
  latitude,
  longitude,
  searchRadius = 2000,
}) => {
  const url = `${endpoint}?lng=${longitude}&lat=${latitude}&r=${searchRadius}`;
  
  try {
    const response = await axios.get(url);
    const { data } = response;
    return data;
  } catch(err) {
    console.error(err);
    return false;
  }
};

export default {
  search
};
