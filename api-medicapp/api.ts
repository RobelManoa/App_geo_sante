import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

export const getPrestataires = async () => {
  const res = await api.get('/prestataires');
  return res.data;
};
