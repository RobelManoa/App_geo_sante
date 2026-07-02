import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_PRESTATAIRES_API_URL ||
    'http://localhost:5000/api/prestataires',
  timeout: 10000,
});

export default api;
