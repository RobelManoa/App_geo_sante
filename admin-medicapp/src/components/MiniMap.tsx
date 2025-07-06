// components/MiniMap.tsx
import React, { useEffect, useRef, useState } from "react";
import "./MiniMap.css";

interface Prestataire {
  nom: string;
  ville: string;
  localisation: {
    latitude: number;
    longitude: number;
  };
  specialite?: string;
  telephone?: string;
  categorie?: string;
  adresse?: string;
}

interface Props {
  prestataires: Prestataire[];
  height?: string;
  showControls?: boolean;
}

export default function MiniMap({ 
  prestataires, 
  height = "400px", 
  showControls = true 
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedPrestataire, setSelectedPrestataire] = useState<Prestataire | null>(null);
  const [zoom, setZoom] = useState(6);
  const [center, setCenter] = useState({ lat: -18.8792, lng: 47.5079 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });

  // Filtrer les prestataires avec des coordonnées valides
  const validPrestataires = prestataires.filter(p => 
    p.localisation?.latitude && p.localisation?.longitude
  );

  // Centrer la carte sur Madagascar et les prestataires
  useEffect(() => {
    if (validPrestataires.length > 0) {
      const lats = validPrestataires.map(p => p.localisation.latitude);
      const lngs = validPrestataires.map(p => p.localisation.longitude);
      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
      setCenter({ lat: centerLat, lng: centerLng });
      setZoom(validPrestataires.length === 1 ? 10 : 7);
    } else {
      // Centrer sur Madagascar par défaut
      setCenter({ lat: -18.8792, lng: 47.5079 });
      setZoom(6);
    }
    // Reset map offset when center changes
    setMapOffset({ x: 0, y: 0 });
  }, [validPrestataires]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 1, 18));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 1, 3));

  // Navigation handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setMapOffset(newOffset);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    setZoom(prev => Math.max(3, Math.min(18, prev + delta)));
  };

  const getTileUrl = (x: number, y: number, z: number) => {
    return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
  };

  const calculateTileCoordinates = (lat: number, lng: number, zoom: number) => {
    const n = Math.pow(2, zoom);
    const xtile = Math.floor((lng + 180) / 360 * n);
    const ytile = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n);
    return { x: xtile, y: ytile };
  };

  const getMarkerPosition = (lat: number, lng: number) => {
    const centerTile = calculateTileCoordinates(center.lat, center.lng, zoom);
    const markerTile = calculateTileCoordinates(lat, lng, zoom);
    const tileSize = 256;
    
    const x = (markerTile.x - centerTile.x) * tileSize;
    const y = (markerTile.y - centerTile.y) * tileSize;
    
    return { 
      x: x + 50 + mapOffset.x, 
      y: y + 50 + mapOffset.y 
    };
  };

  // Générer plus de tuiles pour un meilleur affichage
  const generateTiles = () => {
    const tiles = [];
    const centerTile = calculateTileCoordinates(center.lat, center.lng, zoom);
    
    // Générer une grille 7x7 pour un meilleur affichage avec navigation
    for (let row = -3; row <= 3; row++) {
      for (let col = -3; col <= 3; col++) {
        const tileX = centerTile.x + col;
        const tileY = centerTile.y + row;
        
        tiles.push({
          key: `${row}-${col}`,
          src: getTileUrl(tileX, tileY, zoom),
          style: {
            left: `${(col + 3) * 256 + mapOffset.x}px`,
            top: `${(row + 3) * 256 + mapOffset.y}px`,
          }
        });
      }
    }
    
    return tiles;
  };

  return (
    <div className="mini-map-container" style={{ height }}>
      <div 
        className="map-wrapper"
        ref={mapRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="map-background">
          {/* Carte OpenStreetMap améliorée */}
          <div className="map-tiles">
            {generateTiles().map((tile) => (
              <img
                key={tile.key}
                src={tile.src}
                alt=""
                className="map-tile"
                style={tile.style}
                onError={(e) => {
                  // Fallback en cas d'erreur de chargement
                  e.currentTarget.style.display = 'none';
                }}
              />
            ))}
          </div>
        </div>

        {/* Marqueurs des prestataires */}
        {validPrestataires.map((prestataire, index) => {
          const position = getMarkerPosition(
            prestataire.localisation.latitude, 
            prestataire.localisation.longitude
          );
          
          return (
            <div
              key={index}
              className={`map-marker ${selectedPrestataire?.nom === prestataire.nom ? 'active' : ''}`}
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPrestataire(prestataire);
              }}
            >
              <div className="marker-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            </div>
          );
        })}

        {/* Contrôles de zoom */}
        {showControls && (
          <div className="map-controls">
            <button 
              className="control-btn zoom-in" 
              onClick={handleZoomIn}
              title="Zoom avant"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
            <button 
              className="control-btn zoom-out" 
              onClick={handleZoomOut}
              title="Zoom arrière"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
            </button>
            <button 
              className="control-btn reset-map" 
              onClick={() => {
                setMapOffset({ x: 0, y: 0 });
                setZoom(6);
                setCenter({ lat: -18.8792, lng: 47.5079 });
              }}
              title="Réinitialiser la carte"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
              </svg>
            </button>
          </div>
        )}

        {/* Popup d'information */}
        {selectedPrestataire && (
          <div className="map-popup">
            <div className="popup-header">
              <h3>{selectedPrestataire.nom}</h3>
              <button 
                className="popup-close"
                onClick={() => setSelectedPrestataire(null)}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
            <div className="popup-content">
              <p className="popup-ville">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {selectedPrestataire.ville}
              </p>
              {selectedPrestataire.categorie && (
                <p className="popup-specialite">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                  {selectedPrestataire.categorie}
                </p>
              )}
              {selectedPrestataire.telephone && (
                <p className="popup-telephone">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  {selectedPrestataire.telephone}
                </p>
              )}
              {selectedPrestataire.adresse && (
                <p className="popup-adresse">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {selectedPrestataire.adresse}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Légende */}
        <div className="map-legend">
          <div className="legend-item">
            <div className="legend-marker"></div>
            <span>Prestataires de santé ({validPrestataires.length})</span>
          </div>
        </div>

        {/* Indicateur de chargement si pas de prestataires */}
        {validPrestataires.length === 0 && (
          <div className="map-no-data">
            <div className="no-data-content">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <p>Aucun prestataire avec localisation trouvé</p>
            </div>
          </div>
        )}

        {/* Instructions de navigation */}
        <div className="map-instructions">
          <p>🖱️ Cliquez et glissez pour naviguer • 🔍 Molette pour zoomer</p>
        </div>
      </div>
    </div>
  );
}
