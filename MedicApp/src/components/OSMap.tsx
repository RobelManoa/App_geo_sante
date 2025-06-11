import React from 'react';
import { WebView } from 'react-native-webview';
import mapConfig from '../config/mapConfig';

interface Props {
  latitude: number;
  longitude: number;
  zoom?: number;
  markerText?: string;
}

const OSMap: React.FC<Props> = ({ 
  latitude = mapConfig.OSM_CONFIG.defaultCenter.lat,
  longitude = mapConfig.OSM_CONFIG.defaultCenter.lng,
  zoom = mapConfig.OSM_CONFIG.defaultZoom,
  markerText = 'Location'
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <style>
          body { margin:0; padding:0; }
          #map { height:100vh; width:100vw; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <script>
          const map = L.map('map').setView([${latitude}, ${longitude}], ${zoom});
          
          L.tileLayer('${mapConfig.OSM_CONFIG.tileServer}', {
            attribution: '${mapConfig.OSM_CONFIG.attribution}'
          }).addTo(map);

          const marker = L.marker([${latitude}, ${longitude}]).addTo(map);
          marker.bindPopup('${markerText}').openPopup();
        </script>
      </body>
    </html>
  `;

  return (
    <WebView
      source={{ html }}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      style={{ flex: 1 }}
    />
  );
};

export default OSMap;