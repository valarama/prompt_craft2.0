import { NextApiRequest, NextApiResponse } from 'next';

interface TestConnectionRequest {
  modelId: string;
  endpoint: string;
}

interface TestConnectionResponse {
  success: boolean;
  latency?: number;
  error?: string;
  status: 'connected' | 'disconnected';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestConnectionResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed',
      status: 'disconnected'
    });
  }

  const { modelId, endpoint }: TestConnectionRequest = req.body;

  if (!modelId || !endpoint) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing modelId or endpoint',
      status: 'disconnected'
    });
  }

  try {
    const startTime = Date.now();
    let testUrl = '';
    const testOptions: RequestInit = {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // Increased to 10 second timeout
    };

    // Use appropriate API endpoints for each model
    if (modelId === 'phi-3-local') {
      // For Ollama/Phi-3, use the /api/tags endpoint which is the standard Ollama endpoint
      testUrl = `${endpoint}/api/tags`;
      console.log(`Testing Phi-3 at: ${testUrl}`);
    } else if (modelId === 'distilbart-local') {
      // For DistilBART, test the /models endpoint
      testUrl = `${endpoint}/models`;
      console.log(`Testing DistilBART at: ${testUrl}`);
    } else if (modelId.includes('sqlcoder') || modelId.includes('deepseek') || modelId.includes('mistral')) {
      // For v1/completions endpoints, test the /models endpoint
      if (endpoint.includes('/v1/completions')) {
        testUrl = endpoint.replace('/v1/completions', '/models');
      } else {
        testUrl = `${endpoint}/models`;
      }
      console.log(`Testing ${modelId} at: ${testUrl}`);
    } else {
      testUrl = endpoint;
    }

    console.log(`Testing connection to ${modelId} at ${testUrl}`);

    const response = await fetch(testUrl, testOptions);
    const latency = Date.now() - startTime;

    console.log(`Response for ${modelId}: Status ${response.status}, Latency ${latency}ms`);

    if (response.ok) {
      // Try to read response body for additional info
      let responseText = '';
      try {
        responseText = await response.text();
        console.log(`Response body for ${modelId}:`, responseText.substring(0, 200));
      } catch (e) {
        console.log(`Could not read response body for ${modelId}:`, e);
      }

      return res.status(200).json({
        success: true,
        latency,
        status: 'connected'
      });
    } else {
      console.log(`Failed response for ${modelId}: ${response.status} ${response.statusText}`);
      return res.status(200).json({
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        status: 'disconnected'
      });
    }

  } catch (error) {
    console.error(`Connection test failed for ${modelId}:`, error);
    
    // Provide more specific error messages
    let errorMessage = 'Connection failed';
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Connection timeout (10s)';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Connection refused - service may be down';
      } else if (error.message.includes('ENOTFOUND')) {
        errorMessage = 'Host not found';
      } else {
        errorMessage = error.message;
      }
    }
    
    return res.status(200).json({
      success: false,
      error: errorMessage,
      status: 'disconnected'
    });
  }
}
