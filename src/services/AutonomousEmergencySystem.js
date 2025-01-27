// src/services/AutonomousEmergencySystem.js
import { AgentOrchestrator } from '../agents/AgentOrchestrator';

class AutonomousEmergencySystem {
  constructor() {
    this.orchestrator = new AgentOrchestrator();
    this.isRunning = false;
    this.updateInterval = 5000; // 5 seconds
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.runMainLoop();
    this.emitStateUpdate({ type: 'SYSTEM_STATUS', payload: 'RUNNING' });
  }

  stop() {
    this.isRunning = false;
    this.emitStateUpdate({ type: 'SYSTEM_STATUS', payload: 'STOPPED' });
  }

  async runMainLoop() {
    while (this.isRunning) {
      try {
        // Simulate checking for new emergencies
        await this.checkForNewEmergencies();
        await new Promise(resolve => setTimeout(resolve, this.updateInterval));
      } catch (error) {
        console.error('Error in main loop:', error);
      }
    }
  }

  async checkForNewEmergencies() {
    // In a real system, this would connect to emergency detection systems
    // For demo, randomly generate emergencies
    if (Math.random() < 0.2) { // 20% chance of new emergency
      const emergency = this.generateMockEmergency();
      await this.handleEmergency(emergency);
    }
  }

  generateMockEmergency() {
    const types = ['Medical Emergency', 'Fire Emergency', 'Police Emergency'];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
      id: Date.now(),
      type,
      location: [
        54.3773 + (Math.random() - 0.5) * 0.1,
        24.4539 + (Math.random() - 0.5) * 0.1
      ],
      severity: 'high',
      description: `New ${type.toLowerCase()} reported`
    };
  }

  async handleEmergency(emergency) {
    try {
      const result = await this.orchestrator.handleEmergency(emergency);
      this.emitStateUpdate({
        type: 'NEW_EMERGENCY_RESPONSE',
        payload: {
          ...emergency,
          eta: `${Math.round(result.route.estimatedTime)} minutes`
        }
      });
    } catch (error) {
      console.error('Error handling emergency:', error);
    }
  }

  emitStateUpdate(update) {
    const event = new CustomEvent('emergency-system-update', { 
      detail: update 
    });
    window.dispatchEvent(event);
  }
}

export default new AutonomousEmergencySystem();