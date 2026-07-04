import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.100.203:5000/api',
});

export const getPrestataires = async () => {
  const res = await api.get('/prestataires');
  return res.data;
};
