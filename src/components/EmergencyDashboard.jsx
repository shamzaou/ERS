import React, { useEffect, useRef, useState } from 'react';
import { Siren, Clock, AlertTriangle, Activity, ArrowLeft, RefreshCw, Send } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_CONFIG } from '../agents/config';
import 'mapbox-gl/dist/mapbox-gl.css';
import autonomousSystem from '../services/AutonomousEmergencySystem';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const EmergencyDashboard = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState('RUNNING');
  const [selectedVehicles, setSelectedVehicles] = useState(new Set());
  const [vehicles, setVehicles] = useState([
    { id: 'AMB-001', type: 'Ambulance', status: 'En Route', location: [54.3773, 24.4839] },
    { id: 'POL-003', type: 'Police', status: 'Available', location: [54.3873, 24.4639] },
    { id: 'FIRE-002', type: 'Fire Truck', status: 'Responding', location: [54.3673, 24.4639] }
  ]);
  const [emergencies, setEmergencies] = useState([
    { id: 1, type: 'Medical Emergency', eta: '4 minutes', location: [54.3500, 24.4670] },
    { id: 2, type: 'Fire Emergency', eta: '7 minutes', location: [54.4130, 24.4350] },
    { id: 3, type: 'Police Emergency', eta: '3 minutes', location: [54.3710, 24.4470] }
  ]);

  // Handle vehicle selection
  const toggleVehicleSelection = (vehicleId) => {
    setSelectedVehicles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vehicleId)) {
        newSet.delete(vehicleId);
      } else {
        newSet.add(vehicleId);
      }
      return newSet;
    });
  };

  // Manual control handlers
  const handleRecallVehicles = () => {
    console.log('Recalling vehicles:', Array.from(selectedVehicles));
  };

  const handleRerouteVehicles = () => {
    console.log('Rerouting vehicles:', Array.from(selectedVehicles));
  };

  const handleDispatchVehicles = () => {
    console.log('Dispatching vehicles:', Array.from(selectedVehicles));
  };

  // Clock update effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Autonomous system initialization
  useEffect(() => {
    // Start the autonomous system
    autonomousSystem.start();
    setSystemStatus('RUNNING');

    // Listen for system updates
    const handleSystemUpdate = (event) => {
      const update = event.detail;
      
      switch (update.type) {
        case 'NEW_EMERGENCY_RESPONSE':
          setEmergencies(prev => [...prev, update.payload]);
          break;
        case 'VEHICLE_UPDATE':
          setVehicles(prev => 
            prev.map(v => v.id === update.payload.id ? update.payload : v)
          );
          break;
        case 'SYSTEM_STATUS':
          setSystemStatus(update.payload);
          break;
        default:
          break;
      }
    };

    window.addEventListener('emergency-system-update', handleSystemUpdate);

    return () => {
      autonomousSystem.stop();
      window.removeEventListener('emergency-system-update', handleSystemUpdate);
    };
  }, []);

  // Map initialization and marker management
  useEffect(() => {
    if (!map.current && mapContainer.current) {
      mapContainer.current.innerHTML = '';
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [54.3773, 24.4539],
        zoom: 12
      });

      map.current.addControl(new mapboxgl.NavigationControl());
    }

    // Update emergency markers
    emergencies.forEach(emergency => {
      if (!markersRef.current[`emergency-${emergency.id}`]) {
        const el = document.createElement('div');
        el.className = 'emergency-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        
        if (emergency.type.includes('Medical')) {
          el.innerHTML = `<img src="/medical.svg" alt="medical" style="width: 100%; height: 100%;" />`;
        } else if (emergency.type.includes('Fire')) {
          el.innerHTML = `<img src="/fire.svg" alt="fire" style="width: 100%; height: 100%;" />`;
        } else if (emergency.type.includes('Police')) {
          el.innerHTML = `<img src="/police.svg" alt="police" style="width: 100%; height: 100%;" />`;
        }

        const marker = new mapboxgl.Marker(el)
          .setLngLat(emergency.location)
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div>
              <strong>${emergency.type}</strong><br/>
              ETA: ${emergency.eta}
            </div>
          `))
          .addTo(map.current);

        markersRef.current[`emergency-${emergency.id}`] = marker;
      }
    });

    // Update vehicle markers
    vehicles.forEach(vehicle => {
      const markerId = `vehicle-${vehicle.id}`;
      if (!markersRef.current[markerId]) {
        const el = document.createElement('div');
        el.className = 'vehicle-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = 
          vehicle.type === 'Ambulance' ? '#ef4444' : 
          vehicle.type === 'Police' ? '#3b82f6' : '#f97316';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';

        const marker = new mapboxgl.Marker(el)
          .setLngLat(vehicle.location)
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div>
              <strong>${vehicle.id}</strong><br/>
              Type: ${vehicle.type}<br/>
              Status: ${vehicle.status}
            </div>
          `))
          .addTo(map.current);

        markersRef.current[markerId] = marker;
      } else {
        // Update existing marker position
        markersRef.current[markerId].setLngLat(vehicle.location);
      }
    });

    return () => {
      if (map.current) {
        Object.values(markersRef.current).forEach(marker => marker.remove());
        markersRef.current = {};
        map.current.remove();
        map.current = null;
      }
    };
  }, [vehicles, emergencies]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100">
      <nav className="bg-white shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Siren className="text-red-600" size={24} />
            <h1 className="text-xl font-bold">UAE Emergency Response System</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              systemStatus === 'RUNNING' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <Activity size={16} />
              <span>System {systemStatus}</span>
            </div>
            <Clock size={20} />
            <span>{currentTime.toLocaleTimeString('en-AE', { timeZone: 'Asia/Dubai' })} GST</span>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden">
        {/* Left sidebar - System Statistics and Manual Mode */}
        <div className="w-64 bg-white shadow-md p-4 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h2 className="font-semibold mb-2">System Overview</h2>
              <div className="space-y-2">
                {['Medical', 'Fire', 'Police'].map(type => (
                  <div key={type} className="bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{type}</span>
                      <span className="text-sm text-slate-500">
                        {emergencies.filter(e => e.type.startsWith(type)).length} Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Mode Control Panel */}
            <div className="border-t pt-6">
              <h2 className="font-semibold mb-3">Manual Mode</h2>
              <div className="space-y-2">
                <button
                  onClick={handleRecallVehicles}
                  disabled={selectedVehicles.size === 0}
                  className={`w-full flex items-center justify-center space-x-2 p-2 rounded-lg ${
                    selectedVehicles.size === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  <ArrowLeft size={16} />
                  <span>Recall Vehicle</span>
                </button>
                
                <button
                  onClick={handleRerouteVehicles}
                  disabled={selectedVehicles.size === 0}
                  className={`w-full flex items-center justify-center space-x-2 p-2 rounded-lg ${
                    selectedVehicles.size === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  <RefreshCw size={16} />
                  <span>Reroute Vehicle</span>
                </button>
                
                <button
                  onClick={handleDispatchVehicles}
                  disabled={selectedVehicles.size === 0}
                  className={`w-full flex items-center justify-center space-x-2 p-2 rounded-lg ${
                    selectedVehicles.size === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  <Send size={16} />
                  <span>Dispatch Vehicle</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main map area */}
        <div className="flex-1 p-4 flex flex-col overflow-hidden">
          <div className="bg-white rounded-lg shadow-md flex-1 p-4 relative flex flex-col">
            <div ref={mapContainer} className="flex-1 rounded-lg" />
            
            <div className="border-t border-gray-200 mt-4 mb-2" />
            
            {/* Emergency feed */}
            <div className="h-28 flex-shrink-0">
              <div className="flex overflow-x-auto space-x-4 pb-2">
                {emergencies.map((emergency) => (
                  <div key={emergency.id} className="flex-shrink-0 bg-slate-200 rounded-lg p-4 w-72">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="text-red-600" />
                      <h3 className="font-semibold">Emergency #{emergency.id}</h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Type:</span>
                        <span className="font-medium">{emergency.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ETA:</span>
                        <span className="font-medium">{emergency.eta}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

       {/* Right sidebar - Updated Vehicle Status with selection */}
       <div className="w-72 bg-white shadow-md p-4 overflow-y-auto relative">
          <div className="space-y-4">
            <h2 className="font-semibold">Vehicle Status</h2>
            <div className="space-y-2">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => toggleVehicleSelection(vehicle.id)}
                  className={`bg-slate-50 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedVehicles.has(vehicle.id)
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{vehicle.id}</span>
                    <span className={`text-sm ${
                      vehicle.status === 'Available' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                  <span className="text-sm text-slate-500">{vehicle.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 w-[calc(100%-2rem)] bg-white p-4 shadow-md rounded-lg border border-gray-200">
            <h2 className="font-semibold mb-2">Map Legend</h2>
            <div className="space-y-2">
              {[
                { type: 'Ambulance', color: '#ef4444' },
                { type: 'Police', color: '#3b82f6' },
                { type: 'Fire Truck', color: '#f97316' },
              ].map((item) => (
                <div key={item.type} className="flex items-center space-x-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyDashboard;