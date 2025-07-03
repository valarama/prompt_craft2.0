import { NextApiRequest, NextApiResponse } from 'next';

interface DebugResponse {
  timestamp: string;
  environment: Record<string, string | undefined>;
  endpoints: Record<string, string>;
  rawTest?: {
    url: string;
    status?: number;
    error?: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DebugResponse>
) {
  const timestamp = new Date().toISOString();
  
  // Get all environment variables
  const environment = {
    PHI3_ENDPOINT: process.env.PHI3_ENDPOINT,
    DISTILBART_ENDPOINT: process.env.DISTILBART_ENDPOINT,
    NEXT_PUBLIC_PHI3_ENDPOINT: process.env.NEXT_PUBLIC_PHI3_ENDPOINT,
    NEXT_PUBLIC_DISTILBART_ENDPOINT: process.env.NEXT_PUBLIC_DISTILBART_ENDPOINT,
    NODE_ENV: process.env.NODE_ENV
  };

  // Test endpoints
  const endpoints = {
    phi3_from_env: process.env.NEXT_PUBLIC_PHI3_ENDPOINT || 'not set',
    distilbart_from_env: process.env.NEXT_PUBLIC_DISTILBART_ENDPOINT || 'not set',
    phi3_hardcoded: 'http://10.100.15.67:12139',
    distilbart_hardcoded: 'http://10.100.15.67:12140'
  };

  let rawTest;
  
  // If it's a POST request, test the specific endpoint
  if (req.method === 'POST' && req.body.testUrl) {
    try {
      console.log(`Debug: Testing ${req.body.testUrl}`);
      const testResponse = await fetch(req.body.testUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      rawTest = {
        url: req.body.testUrl,
        status: testResponse.status
      };
    } catch (error) {
      rawTest = {
        url: req.body.testUrl,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  return res.status(200).json({
    timestamp,
    environment,
    endpoints,
    rawTest
  });
}
