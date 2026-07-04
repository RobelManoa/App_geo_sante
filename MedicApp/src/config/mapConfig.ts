export default {
  // Configuration OpenStreetMap
  OSM_CONFIG: {
    tileServer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    defaultZoom: 15,
    defaultCenter: {
      lat: -18.8792, 
      lng: 47.5079
    }
  },

  // Configuration de l'API
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.203:5000/api',
  UPLOADS_PATH: '/uploads'
}