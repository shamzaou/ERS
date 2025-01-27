// src/agents/BaseAgent.js
export class BaseAgent {
  constructor(config) {
    this.name = config.name;
    this.goal = config.goal;
    this.backstory = config.backstory;
  }

  async initialize() {
    this.apiKey = await window.electron.env.get('REACT_APP_SAMBANOVA_API_KEY');
    this.apiBaseUrl = 'https://api.sambanova.ai/v1/';
  }

  async executeTask(task) {
    try {
      if (!this.apiKey) {
        await this.initialize();
      }

      const response = await fetch(`${this.apiBaseUrl}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'Meta-Llama-3.1-8B-Instruct',
          messages: [
            { role: 'system', content: this.backstory },
            { role: 'user', content: task.description }
          ],
          temperature: 0.7,
          top_p: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Log responses using electron API
      await this.logResponse(task, data);
      
      return data.choices[0].message.content;
    } catch (error) {
      console.error(`Agent ${this.name} error:`, error);
      throw error;
    }
  }

  async logResponse(task, response) {
    try {
      const timestamp = new Date().toISOString();
      const logEntry = `
Time: ${timestamp}
Task: ${JSON.stringify(task)}
Response: ${JSON.stringify(response)}
----------------------------------------
`;
      
      const logPath = `logs/${this.name.toLowerCase()}-${timestamp.split('T')[0]}.log`;
      await window.electron.fileSystem.writeFile(logPath, logEntry);
    } catch (error) {
      console.error('Error logging response:', error);
    }
  }
}