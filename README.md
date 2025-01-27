# UAE Emergency Response Optimization System

An AI-powered system for optimizing emergency response times and coordination in the UAE using SambaNova's high-performance AI platform.

## 🚨 Problem Statement

Emergency response vehicles in the UAE currently face several challenges:

- Traffic congestion causing response delays
- Limited coordination between multiple emergency vehicles
- Basic traffic light control only at individual intersections
- Reactive rather than proactive traffic management
- Inefficient route selection

## 💡 Solution

Our system revolutionizes emergency response through:

- AI-powered route optimization and traffic prediction
- Proactive traffic management along entire response routes
- Multi-agent coordination for emergency vehicles
- Intelligent "green corridor" creation through smart traffic light management
- Real-time visualization and monitoring

## 🔑 Key Features

- **Emergency Vehicle Management**
  - Automatic dispatch of nearest available vehicle
  - Real-time location tracking
  - Route visualization
  - Arrival time estimation

- **Route Optimization**
  - AI-powered route calculation
  - Traffic-aware pathfinding
  - Coordinated traffic light control

- **Real-time Visualization**
  - Interactive map interface
  - Vehicle tracking
  - Traffic light states
  - Route display

## 🛠️ Technical Stack

- **Frontend**
  - React
  - Mapbox GL JS
  - Tailwind CSS
  - Lucide React Icons

- **Backend**
  - Electron
  - Node.js
  - Socket.IO
  - SUMO (Simulation of Urban MObility)

- **AI Platform**
  - SambaNova API
  - Multi-agent coordination system

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm
- Git
- Mapbox API key
- SambaNova API key

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd uae-emergency-response
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   REACT_APP_MAPBOX_TOKEN=your_mapbox_token
   REACT_APP_SAMBANOVA_API_KEY=your_sambanova_api_key
   ```

4. **Run the application**
   ```bash
   npm run electron:dev
   ```
   This command will start both the React development server and the Electron application.

## 🏗️ Project Structure

```
uae-emergency-response/
├── src/
│   ├── agents/             # AI agent implementations
│   ├── components/         # React components
│   ├── services/          # Backend services
│   └── config/            # Configuration files
├── public/                # Static assets
└── main.js              # Electron main process files
```

## 🤖 AI Agents

The system utilizes three specialized AI agents:

1. **Emergency Dispatcher**
   - Coordinates emergency response
   - Assigns vehicles based on location and priority

2. **Route Optimizer**
   - Calculates optimal routes
   - Considers traffic conditions and priority levels

3. **Vehicle Manager**
   - Manages fleet status
   - Tracks vehicle availability and location

## 🔄 Real-time Updates

The system provides real-time updates through Socket.IO for:
- Vehicle locations
- Emergency status
- Traffic conditions
- Route optimization

## 🗺️ Map Features

- Interactive map visualization
- Real-time vehicle tracking
- Emergency location markers
- Route visualization
- Traffic condition overlay

## 📈 Performance Monitoring

The system includes monitoring for:
- Response times
- Vehicle utilization
- Route efficiency
- System status

## 🔒 Security

- Secure API key management
- WebSocket security measures
- CSP headers for Mapbox integration

## 📝 License

Private

## 👥 Contributing

sngantch@student.42abudhabi.ae
desteve@student.42abudhabi.ae

## 📧 Contact

shamzaou@student.42abudhabi.ae