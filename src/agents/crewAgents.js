import axios from 'axios';
import { Agent, Crew, Task } from 'crewai';
import * as process from 'process';
require('dotenv').config();
window.process = process;

// SambaNova API Configuration
const SAMBANOVA_API_BASE_URL = 'https://api.sambanova.ai/v1/chat/completions';
const SAMBANOVA_API_KEY = process.env.SAMBANOVA_API_KEY; // SambaNova API key
const SAMBANOVA_PROJECT_ID = process.env.SAMBANOVA_PROJECT_ID;
const SAMBANOVA_ENDPOINT_ID = process.env.SAMBANOVA_ENDPOINT_ID;
const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN;

// Custom CrewAI Model Class for SambaNova API
class SambanavaModel {
  constructor(modelName) {
    this.modelName = modelName;
  }

  async call(messages) {
    try {
      const response = await axios.post(
        SAMBANOVA_API_BASE_URL,
        {
          model: this.modelName,
          messages: messages,
          stream: false, // Set to true if you want streaming
          max_tokens: 1000,
          temperature: 0.7,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${SAMBANOVA_API_KEY}`,
            'Content-Type': 'application/json',
            'SNova-Project-Id': SAMBANOVA_PROJECT_ID,
            'SNova-Endpoint-Id': SAMBANOVA_ENDPOINT_ID
          }
        }
      );

      // Extract the AI's response from the API response
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('SambaNova API Call Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

// Agent creation using SambaNova
const createSambanavaAgent = (agentConfig) => {
  return new Agent({
    ...agentConfig,
    model: new SambanavaModel(agentConfig.model),
    async executeTask(task) {
      // Prepare messages for API call
      const messages = [
        { role: 'system', content: agentConfig.backstory },
        { role: 'user', content: JSON.stringify(task.inputs) }
      ];

      // Call the model with prepared messages
      const result = await this.model.call(messages);

      // Parse the result (you might need to adjust this based on your specific use case)
      try {
        return JSON.parse(result);
      } catch {
        return result;
      }
    }
  });
};

// Dispatcher Agent
const dispatcherAgent = new createSambanavaAgent({
  name: 'Dispatcher',
  goal: 'Efficiently assign emergency vehicles to incidents',
  backstory: 'Expert in emergency response coordination with deep knowledge of UAE geography',
  allowDelegation: true,
  model: 'Meta-Llama-3.1-8B-Instruct',
  async executeTask(task) {
    const { location, type, description } = task.inputs;

    const availableVehicles = await this.getAvailableVehicles();
    const emergencyAssessment = await this.assessEmergency(type, description);
    const vehicleEstimates = await this.calculateVehicleEstimates(availableVehicles, location);
    const optimalVehicle = this.selectOptimalVehicle(vehicleEstimates, emergencyAssessment);
    await this.dispatchVehicle(optimalVehicle, location);

    return optimalVehicle;
  },
  async getAvailableVehicles() {
    const availableVehicles = await vehicleManager.execute({
      task: 'Get available vehicles',
    });

    return availableVehicles;
  },
  async assessEmergency(type, description) {
    const emergencyAssessment = await emergencyAssessor.execute({
      task: 'Assess emergency',
      inputs: { type, description },
    });

    return emergencyAssessment;
  },
  async calculateVehicleEstimates(vehicles, incidentLocation) {
    const vehicleEstimates = await Promise.all(
      vehicles.map(async (vehicle) => {
        const estimatedTime = await this.estimateTravelTime(vehicle.location, incidentLocation);
        return { ...vehicle, estimatedTime };
      })
    );

    return vehicleEstimates;
  },
  async estimateTravelTime(vehicleLocation, incidentLocation) {
    const distance = this.calculateDistance(vehicleLocation, incidentLocation);
    const speed = 60; // km/h
    const estimatedTime = distance / speed;

    return estimatedTime;
  },
  calculateDistance(location1, location2) {
    const [lat1, lon1] = location1;
    const [lat2, lon2] = location2;

    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  },
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  },
  selectOptimalVehicle(vehicleEstimates, emergencyAssessment) {
    const { severity, resourceRequirements } = emergencyAssessment;

    const optimalVehicle = vehicleEstimates.reduce((optimal, vehicle) => {
      const score = this.calculateVehicleScore(vehicle, severity, resourceRequirements);
      return score > optimal.score ? { ...vehicle, score } : optimal;
    }, { score: -Infinity });

    return optimalVehicle;
  },
  calculateVehicleScore(vehicle, severity, resourceRequirements) {
    const { estimatedTime, type } = vehicle;
    const { [type]: requiredResources } = resourceRequirements;

    const timeScore = 1 / estimatedTime;
    const resourceScore = Object.keys(requiredResources).every(
      (resource) => vehicle[resource] >= requiredResources[resource]
    ) ? 1 : 0;

    const severityWeights = {
      high: 1,
      medium: 0.75,
      low: 0.5,
    };

    const score = timeScore * resourceScore * severityWeights[severity];

    return score;
  },
  async dispatchVehicle(vehicle, location) {
    await vehicleManager.execute({
      task: 'Dispatch vehicle',
      inputs: { vehicleId: vehicle.id, location },
    });
  },
});

// Route Optimization Agent
const routeOptimizer = new createSambanavaAgent({
  name: 'Route Optimizer',
  goal: 'Calculate optimal routes considering traffic and priorities',
  backstory: 'Traffic flow specialist with expertise in UAE road networks',
  allowDelegation: true,
  model: 'Meta-Llama-3.1-8B-Instruct',
  async executeTask(task) {
    const { origin, destination, priority } = task.inputs;

    const optimalRoute = await this.calculateOptimalRoute(origin, destination, priority);

    return optimalRoute;
  },
  async calculateOptimalRoute(origin, destination, priority) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}`;

    const params = {
      access_token: mapboxToken,
      annotations: 'duration,distance',
      overview: 'full',
      geometries: 'geojson',
      steps: true,
      alternatives: true,
    };

    if (priority === 'high') {
      params.traffic = 'live';
    }

    try {
      const response = await axios.get(url, { params });
      const routes = response.data.routes;

      const optimalRoute = routes.reduce((optimal, route) => {
        const score = this.calculateRouteScore(route, priority);
        return score < optimal.score ? { ...route, score } : optimal;
      }, { score: Infinity });

      return optimalRoute;
    } catch (error) {
      console.error('Error calculating optimal route:', error);
      throw error;
    }
  },
  calculateRouteScore(route, priority) {
    const { duration, distance } = route;

    const priorityWeights = {
      high: { duration: 1, distance: 0 },
      medium: { duration: 0.7, distance: 0.3 },
      low: { duration: 0.4, distance: 0.6 },
    };

    const { duration: durationWeight, distance: distanceWeight } = priorityWeights[priority];

    const score = duration * durationWeight + distance * distanceWeight;

    return score;
  },
});

// Vehicle Manager Agent
const vehicleManager = new createSambanavaAgent({
  name: 'Vehicle Manager',
  goal: 'Track and manage emergency vehicle fleet status and availability',
  backstory: 'Fleet management expert with real-time tracking experience',
  allowDelegation: true,
  model: 'Meta-Llama-3.1-8B-Instruct',
  vehicles: [
    { id: 'AMB-001', type: 'Ambulance', status: 'Available', location: [55.2708, 25.2048], crew: ['John Doe', 'Jane Smith'] },
    { id: 'POL-003', type: 'Police', status: 'Available', location: [55.2808, 25.2148], crew: ['Mike Johnson', 'Emily Brown'] },
    { id: 'FIRE-002', type: 'Fire Truck', status: 'Available', location: [55.2608, 25.1948], crew: ['David Wilson', 'Sarah Davis'] },
  ],
  async executeTask(task) {
    if (task.task === 'Get available vehicles') {
      return await this.getAvailableVehicles();
    } else if (task.task === 'Dispatch vehicle') {
      const { vehicleId, location } = task.inputs;
      await this.dispatchVehicle(vehicleId, location);
    } else if (task.task === 'Update vehicle status') {
      const { vehicleId, status, location } = task.inputs;
      await this.updateVehicleStatus(vehicleId, status, location);
    } else if (task.task === 'Get vehicle by id') {
      const { vehicleId } = task.inputs;
      return await this.getVehicleById(vehicleId);
    } else if (task.task === 'Get vehicles by type') {
      const { type } = task.inputs;
      return await this.getVehiclesByType(type);
    }
  },
  async getAvailableVehicles() {
    return this.vehicles.filter(vehicle => vehicle.status === 'Available');
  },
  async dispatchVehicle(vehicleId, location) {
    const vehicle = await this.getVehicleById(vehicleId);
    if (vehicle) {
      vehicle.status = 'Dispatched';
      vehicle.location = location;
      console.log(`Vehicle ${vehicleId} dispatched to location [${location}]`);
    } else {
      console.log(`Vehicle ${vehicleId} not found`);
    }
  },
  async updateVehicleStatus(vehicleId, status, location) {
    const vehicle = await this.getVehicleById(vehicleId);
    if (vehicle) {
      vehicle.status = status;
      vehicle.location = location;
      console.log(`Vehicle ${vehicleId} status updated to ${status} at location [${location}]`);
    } else {
      console.log(`Vehicle ${vehicleId} not found`);
    }
  },
  async getVehicleById(vehicleId) {
    return this.vehicles.find(vehicle => vehicle.id === vehicleId);
  },
  async getVehiclesByType(type) {
    return this.vehicles.filter(vehicle => vehicle.type === type);
  },
});

// Emergency Assessment Agent
const emergencyAssessor = new createSambanavaAgent({
  name: 'Emergency Assessor',
  goal: 'Analyze emergency severity and resource requirements',
  backstory: 'Emergency response specialist with incident classification expertise',
  allowDelegation: true,
  model: 'Meta-Llama-3.1-8B-Instruct',
  async executeTask(task) {
    const { type, description } = task.inputs;

    const severity = await this.assessSeverity(type, description);
    const resourceRequirements = await this.determineResourceRequirements(type, severity);

    return { severity, resourceRequirements };
  },
  async assessSeverity(type, description) {
    const keywords = description.toLowerCase().split(' ');
    const severityRules = {
      high: ['critical', 'life-threatening', 'severe', 'multiple', 'large-scale', 'catastrophic'],
      medium: ['urgent', 'serious', 'significant', 'widespread'],
      low: ['minor', 'small-scale', 'localized', 'contained'],
    };

    for (const [severity, rules] of Object.entries(severityRules)) {
      if (keywords.some(keyword => rules.includes(keyword))) {
        return severity;
      }
    }

    return 'low';
  },
  async determineResourceRequirements(type, severity) {
    const resourceMatrix = {
      "Medical": {
        high: { ambulances: 4, paramedics: 8, helicopter: 1 },
        medium: { ambulances: 2, paramedics: 4 },
        low: { ambulances: 1, paramedics: 2 },
      },
      "Fire": {
        high: { fireTrucks: 6, firefighters: 24, helicopter: 1 },
        medium: { fireTrucks: 3, firefighters: 12 },
        low: { fireTrucks: 1, firefighters: 4 },
      },
      "Police": {
        high: { policeCars: 8, officers: 16, helicopter: 1 },
        medium: { policeCars: 4, officers: 8 },
        low: { policeCars: 2, officers: 4 },
      },
    };

    return resourceMatrix[type][severity];
  },
});

// Traffic Controller Agent
const trafficController = new createSambanavaAgent({
  name: 'Traffic Controller',
  goal: 'Proactively clear traffic along the emergency vehicle route',
  backstory: 'Experienced traffic management coordinator with expertise in UAE road infrastructure',
  allowDelegation: true,
  model: 'Meta-Llama-3.1-8B-Instruct',
  async executeTask(task) {
    const { route, vehicleId } = task.inputs;

    await this.clearTrafficAlongRoute(route);
    await this.updateTrafficLights(route);
    await this.notifyVehicle(vehicleId, 'Route cleared');

    return 'Traffic cleared for vehicle ' + vehicleId;
  },
  async clearTrafficAlongRoute(route) {
    // Implement logic to communicate with traffic management systems
    // and clear the traffic along the given route
    // This may involve sending notifications, updating traffic signs, etc.
    console.log('Clearing traffic along route:', route);
    // Simulated delay for demonstration purposes
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
  async updateTrafficLights(route) {
    // Implement logic to control traffic lights along the route
    // to give priority to the emergency vehicle
    console.log('Updating traffic lights along route:', route);
    // Simulated delay for demonstration purposes
    await new Promise(resolve => setTimeout(resolve, 1000));
  },
  async notifyVehicle(vehicleId, message) {
    // Implement logic to send notifications or updates to the emergency vehicle
    console.log('Notifying vehicle', vehicleId, ':', message);
  },
});

// Create tasks for each agent
const assessEmergency = new Task({
  description: 'Analyze emergency details and determine severity level and resource requirements',
  agent: emergencyAssessor,
  inputs: {
    type: 'The type of emergency (e.g., Medical, Fire, Police)',
    description: 'A description of the emergency situation',
  },
  outputs: {
    severity: 'The assessed severity level of the emergency (high, medium, low)',
    resourceRequirements: 'The determined resource requirements for the emergency',
  },
});

const findOptimalVehicle = new Task({
  description: 'Select the most appropriate vehicle based on location, estimated travel time, and resource requirements',
  agent: dispatcherAgent,
  inputs: {
    location: 'The location of the emergency incident',
    type: 'The type of emergency (e.g., Medical, Fire, Police)',
    description: 'A description of the emergency situation',
  },
  outputs: {
    optimalVehicle: 'The selected optimal vehicle for the emergency response',
  },
});

const calculateRoute = new Task({
  description: 'Calculate optimal route considering traffic conditions and emergency priority',
  agent: routeOptimizer,
  inputs: {
    origin: 'The origin coordinates of the route',
    destination: 'The destination coordinates of the route',
    priority: 'The priority level of the emergency (high, medium, low)',
  },
  outputs: {
    optimalRoute: 'The calculated optimal route for the emergency vehicle',
  },
});

const manageVehicleStatus = new Task({
  description: 'Update and track vehicle status throughout the response',
  agent: vehicleManager,
  inputs: {
    vehicleId: 'The ID of the vehicle to update',
    status: 'The new status of the vehicle (e.g., Dispatched, En Route, On Scene, Available)',
    location: 'The current location coordinates of the vehicle',
  },
});

const clearTraffic = new Task({
  description: 'Clear traffic along the emergency vehicle route',
  agent: trafficController,
  inputs: {
    route: 'The optimal route calculated for the emergency vehicle',
    vehicleId: 'The ID of the emergency vehicle',
  },
  outputs: {
    message: 'A message indicating the status of traffic clearing',
  },
});

// Create the emergency response crew
const emergencyResponseCrew = new Crew({
  name: 'Emergency Response Crew',
  agents: [dispatcherAgent, routeOptimizer, vehicleManager, emergencyAssessor, trafficController],
  tasks: [assessEmergency, findOptimalVehicle, calculateRoute, manageVehicleStatus, clearTraffic],
  description: 'A crew of AI agents collaborating to optimize emergency response in the UAE',
  verbose: true,
});

export {
  createSambanavaAgent,
  dispatcherAgent,
  routeOptimizer,
  vehicleManager,
  emergencyAssessor,
  trafficController,
};

export default emergencyResponseCrew;
