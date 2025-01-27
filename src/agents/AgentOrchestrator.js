import { EmergencyDispatcher, RouteOptimizer, VehicleManager } from './specializedAgents';

export class AgentOrchestrator {
  constructor() {
    this.dispatcher = new EmergencyDispatcher();
    this.routeOptimizer = new RouteOptimizer();
    this.vehicleManager = new VehicleManager();
  }

  async handleEmergency(emergency) {
    try {
      const dispatchResult = await this.dispatcher.dispatchVehicle(emergency);
      const dispatchData = JSON.parse(dispatchResult);

      const routeResult = await this.routeOptimizer.calculateRoute(
        dispatchData.selectedVehicle.currentLocation,
        emergency.location,
        dispatchData.priorityLevel
      );
      const routeData = JSON.parse(routeResult);

      await this.vehicleManager.updateVehicleStatus(
        dispatchData.selectedVehicle.id,
        'Dispatched',
        dispatchData.selectedVehicle.currentLocation
      );

      return {
        dispatch: dispatchData,
        route: routeData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Orchestrator error:', error);
      throw error;
    }
  }
}