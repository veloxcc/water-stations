import axios from 'axios';

const endpointBaseUrl = process.env.ENDPOINT_BASE_URL || '';
const serviceEndpoint = `${endpointBaseUrl}/api/water-stations`;
const endpointSearchByRadius = `${serviceEndpoint}/searchByRadius`;
const endpointSearchByBox = `${serviceEndpoint}/searchByBox`;

const searchByRadius = async ({
  latitude,
  longitude,
  searchRadius = 2000,
}) => {
  const url = `${endpointSearchByRadius}?lng=${longitude}&lat=${latitude}&r=${searchRadius}`;
  
  try {
    const response = await axios.get(url);
    const { data } = response;
    return data;
  } catch(err) {
    console.error(err);
    return false;
  }
};

const searchByBox = async ({ sw, ne }) => {
  const url = `${endpointSearchByBox}?sw=${sw.lng},${sw.lat}&ne=${ne.lng},${ne.lat}`;

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
  searchByRadius,
  searchByBox
};
