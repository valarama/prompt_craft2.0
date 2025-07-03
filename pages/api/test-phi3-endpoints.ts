import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const phi3Endpoint = 'http://10.100.15.67:12139';
  
  const endpointsToTest = [
    '/models',
    '/api/tags', 
    '/health',
    '/api/version',
    ''
  ];
  
  const results = [];
  
  for (const endpoint of endpointsToTest) {
    const testUrl = phi3Endpoint + endpoint;
    try {
      console.log(`Testing: ${testUrl}`);
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });
      
      results.push({
        endpoint: testUrl,
        status: response.status,
        ok: response.ok,
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      });
      
    } catch (error) {
      results.push({
        endpoint: testUrl,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  res.status(200).json({
    message: 'Phi-3 endpoint test results',
    results
  });
}
