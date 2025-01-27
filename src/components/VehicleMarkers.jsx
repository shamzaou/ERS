// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

const VehicleMarkers = ({ map, vehicles }) => {
  const markersRef = useRef({});

  useEffect(() => {
    if (!map) return;

    // Update or create markers for each vehicle
    vehicles.forEach(vehicle => {
      if (!markersRef.current[vehicle.id]) {
        // Create marker element
        const el = document.createElement('div');
        el.className = 'vehicle-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = getVehicleColor(vehicle.type);
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <div>
              <strong>${vehicle.id}</strong><br/>
              Type: ${vehicle.type}<br/>
              Status: ${vehicle.status}
            </div>
          `);

        // Create and store marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat(vehicle.location)
          .setPopup(popup)
          .addTo(map);

        markersRef.current[vehicle.id] = marker;
      } else {
        // Update existing marker
        markersRef.current[vehicle.id].setLngLat(vehicle.location);
      }
    });

    // Remove markers for vehicles that no longer exist
    Object.keys(markersRef.current).forEach(markerId => {
      if (!vehicles.find(v => v.id === markerId)) {
        markersRef.current[markerId].remove();
        delete markersRef.current[markerId];
      }
    });

    // Cleanup function
    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
    };
  }, [map, vehicles]);

  // Helper function to get marker color based on vehicle type
  const getVehicleColor = (type) => {
    switch (type) {
      case 'Ambulance':
        return '#ef4444'; // red
      case 'Police':
        return '#3b82f6'; // blue
      case 'Fire Truck':
        return '#f97316'; // orange
      default:
        return '#6b7280'; // gray
    }
  };

  return null; // This is a utility component, no need to render anything
};

export default VehicleMarkers;