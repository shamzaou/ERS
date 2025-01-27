import { BaseAgent } from './BaseAgent';

export class EmergencyDispatcher extends BaseAgent {
  constructor() {
    super({
      name: 'Emergency Dispatcher',
      goal: 'Efficiently coordinate emergency response and vehicle dispatch',
      backstory: 'Expert emergency dispatcher with deep knowledge of UAE geography and emergency protocols.'
    });
  }

  async dispatchVehicle(emergency) {
    return this.executeTask({
      description: `Dispatch vehicle for emergency: ${JSON.stringify(emergency)}`
    });
  }
}

export class RouteOptimizer extends BaseAgent {
  constructor() {
    super({
      name: 'Route Optimizer',
      goal: 'Calculate optimal routes considering traffic and priorities',
      backstory: 'Traffic flow specialist with expertise in UAE road networks'
    });
  }

  async calculateRoute(origin, destination, priority) {
    return this.executeTask({
      description: `Calculate optimal route from ${JSON.stringify(origin)} to ${JSON.stringify(destination)} with priority ${priority}`
    });
  }
}

export class VehicleManager extends BaseAgent {
  constructor() {
    super({
      name: 'Vehicle Manager',
      goal: 'Manage emergency vehicle fleet status and availability',
      backstory: 'Fleet management expert with real-time tracking experience'
    });
  }

  async updateVehicleStatus(vehicleId, status, location) {
    return this.executeTask({
      description: `Update status for vehicle ${vehicleId} to ${status} at location ${JSON.stringify(location)}`
    });
  }
}