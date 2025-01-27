export const sambaNovaAPI = {
    async call(messages, config = {}) {
      const response = await fetch(`${SAMBANOVA_CONFIG.API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SAMBANOVA_CONFIG.API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model || 'Meta-Llama-3.1-8B-Instruct',
          messages,
          temperature: config.temperature || 0.7,
          top_p: 0.1
        })
      });
  
      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data.choices[0].message.content;
    }
  };