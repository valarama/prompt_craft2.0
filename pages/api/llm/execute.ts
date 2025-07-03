// pages/api/llm/execute.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { promptCraft } = req.body;
    
    // Get endpoint based on model
    const modelEndpoints = {
      'sqlcoder-7b-local': process.env.SQLCODER_ENDPOINT || 'http://10.100.15.67:1138/v1/completions',
      'deepseek-coder-local': process.env.DEEPSEEK_ENDPOINT || 'http://10.100.15.66:1138/v1/completions',
      'mistral-7b-local': process.env.MISTRAL_ENDPOINT || 'http://10.100.15.66:1137/v1/completions'
    };

    const endpoint = modelEndpoints[promptCraft.model as keyof typeof modelEndpoints] || modelEndpoints['sqlcoder-7b-local'];
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // Call your LLM
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptCraft.prompt.user,
          max_tokens: promptCraft.metadata.max_tokens || 400,
          temperature: promptCraft.metadata.suggested_temperature || 0.7
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`LLM API returned ${response.status}`);
      }

      const data = await response.json();
      
      res.status(200).json({
        success: true,
        response: data.choices[0].text,
        model_used: promptCraft.model,
        endpoint_used: endpoint,
        tokens_used: data.usage
      });
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - LLM took too long to respond');
      }
      throw error;
    }

  } catch (error: any) {
    console.error('LLM execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

