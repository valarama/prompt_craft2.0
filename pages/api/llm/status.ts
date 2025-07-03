// pages/api/llm/status.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const endpoints = {
      'SQLCoder 7B': process.env.SQLCODER_ENDPOINT || 'http://10.100.15.67:1138/v1/completions',
      'DeepSeek Coder': process.env.DEEPSEEK_ENDPOINT || 'http://10.100.15.66:1138/v1/completions',
      'Mistral 7B': process.env.MISTRAL_ENDPOINT || 'http://10.100.15.66:1137/v1/completions'
    };

    const statusChecks = await Promise.allSettled(
      Object.entries(endpoints).map(async ([name, endpoint]) => {
        try {
          // Simple health check with minimal prompt
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: 'Hello',
              max_tokens: 1,
              temperature: 0.1
            }),
            signal: AbortSignal.timeout(5000) // 5 second timeout
          });

          return {
            name,
            endpoint,
            status: response.ok ? 'connected' : 'error',
            response_time: Date.now()
          };
        } catch (error) {
          return {
            name,
            endpoint,
            status: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    const results = statusChecks.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        const [name, endpoint] = Object.entries(endpoints)[index];
        return {
          name,
          endpoint,
          status: 'error',
          error: result.reason
        };
      }
    });

    res.status(200).json({
      success: true,
      services: results,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

