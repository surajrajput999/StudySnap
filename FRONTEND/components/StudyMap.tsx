'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon asset paths for Next.js builds
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';
const customIcon = L.icon({
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface LocationPin {
  lat: number;
  lng: number;
  name: string;
}

export default function StudyMap() {
  const [position, setPosition] = useState<[number, number]>([28.6139, 77.2090]); // Default to New Delhi
  const [pins, setPins] = useState<LocationPin[]>([
    { lat: 28.6139, lng: 77.2090, name: "Central Library Study Zone" },
    { lat: 28.6230, lng: 77.2150, name: "Student Co-Working Library" }
  ]);
  const [newPinName, setNewPinName] = useState('');
  const [showAddForm, setShowAddForm] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Attempt to locate student's actual coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {
          // Fallback to default
        }
      );
    }
  }, []);

  function MapClickHandler() {
    useMapEvents({
      click(e) {
        setShowAddForm([e.latlng.lat, e.latlng.lng]);
        setNewPinName('');
      },
    });
    return null;
  }

  const handleAddPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (showAddForm && newPinName.trim()) {
      setPins([...pins, { lat: showAddForm[0], lng: showAddForm[1], name: newPinName.trim() }]);
      setPosition([showAddForm[0], showAddForm[1]]);
      setShowAddForm(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div style={{ height: '240px', width: '100%', borderRadius: '16px', overflow: 'hidden' }}>
        <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler />
          {pins.map((pin, idx) => (
            <Marker key={idx} position={[pin.lat, pin.lng]} icon={customIcon}>
              <Popup>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>📍 {pin.name}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddPin} style={{
          display: 'flex', gap: '8px', padding: '10px', borderRadius: '8px',
          backgroundColor: 'var(--surface-variant)', alignItems: 'center'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>
            New Zone:
          </span>
          <input 
            type="text" 
            placeholder="Library / Cafe / Desk" 
            value={newPinName}
            onChange={(e) => setNewPinName(e.target.value)}
            style={{
              flexGrow: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--outline)',
              fontSize: '12px', backgroundColor: 'var(--surface)', color: 'var(--on-surface)'
            }}
            required
            autoFocus
          />
          <button type="submit" className="md3-btn md3-btn-primary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', boxShadow: 'none' }}>
            Pin
          </button>
          <button type="button" onClick={() => setShowAddForm(null)} className="md3-btn md3-btn-text" style={{ padding: '6px', fontSize: '11px' }}>
            Cancel
          </button>
        </form>
      )}
      <span style={{ fontSize: '11px', color: 'var(--outline)', fontStyle: 'italic', textAlign: 'center' }}>
        👉 Click anywhere on the map to add your custom "Study Zone" marker.
      </span>
    </div>
  );
}
