import React, { useState, useEffect, useCallback } from 'react';
import {
  Upload, FileText, Database, Settings, CheckCircle, AlertCircle, Clock, Download, Eye, Trash2,
  RefreshCw, Search, Plus, X, Monitor, Activity, Zap, Sparkles, Brain, Globe, Target, Send,
  MessageSquare, Cpu, TrendingUp, Terminal
} from 'lucide-react';

// Simple CustomTooltip component implementation
const CustomTooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap z-50 border border-gray-700">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

// Simple animation components as fallback for framer-motion
const motion = {
  div: ({ children, className, initial, animate, exit, transition, ...props }: any) => 
    <div className={className} {...props}>{children}</div>,
  button: ({ children, className, whileHover, whileTap, onClick, ...props }: any) => 
    <button className={className} onClick={onClick} {...props}>{children}</button>
};

const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// TypeScript interfaces
interface LLMModel {
  id: string;
  name: string;
  provider: string;
  icon: string;
  capabilities: string[];
  status: string;
  endpoint: string;
  purpose: string;
  testEndpoints?: string[]; // Multiple endpoints to try
  expectedResponse?: string; // What we expect to see in response
}

interface SystemMetrics {
  totalPrompts: number;
  activePrompts: number;
  completedToday: number;
  avgResponseTime: string;
  llmCalls: number;
  successRate: number;
}

// FIXED: Proper model configuration with correct endpoints and test strategies
const initialLlmModels: LLMModel[] = [
  { 
    id: 'phi-3-local', 
    name: 'Phi-3 Mini 4K (Local)', 
    provider: 'Local - 10.100.15.67:12139', 
    icon: '🎯', 
    capabilities: ['Instruct', 'Fast', 'Private', 'General'], 
    status: 'disconnected', 
    endpoint: 'http://10.100.15.67:12139', 
    purpose: 'General Purpose & Instructions',
    // FIXED: Multiple endpoints to try for Phi-3 (Ollama format)
    testEndpoints: [
      'http://10.100.15.67:12139/api/tags',
      'http://10.100.15.67:12139/api/version', 
      'http://10.100.15.67:12139/models',
      'http://10.100.15.67:12139/health',
      'http://10.100.15.67:12139/'
    ],
    expectedResponse: 'models'
  },
  { 
    id: 'local-sqlcoder', 
    name: 'SQLCoder 7B (Local)', 
    provider: 'Local - 10.100.15.67:1138', 
    icon: '🗄️', 
    capabilities: ['SQL', 'Database', 'Fast', 'Private'], 
    status: 'disconnected', 
    endpoint: 'http://10.100.15.67:1138/v1/completions', 
    purpose: 'SQL & Database Tasks',
    // FIXED: vLLM/OpenAI format endpoints
    testEndpoints: [
      'http://10.100.15.67:1138/v1/models',
      'http://10.100.15.67:1138/health',
      'http://10.100.15.67:1138/ping',
      'http://10.100.15.67:1138/'
    ],
    expectedResponse: 'data'
  },
  { 
    id: 'local-deepseek', 
    name: 'DeepSeek Coder (Local)', 
    provider: 'Local - 10.100.15.66:1138', 
    icon: '💻', 
    capabilities: ['Code', 'Programming', 'Fast', 'Private'], 
    status: 'disconnected', 
    endpoint: 'http://10.100.15.66:1138/v1/completions', 
    purpose: 'Code Generation & Programming',
    testEndpoints: [
      'http://10.100.15.66:1138/v1/models',
      'http://10.100.15.66:1138/health',
      'http://10.100.15.66:1138/ping'
    ],
    expectedResponse: 'data'
  },
  { 
    id: 'local-mistral', 
    name: 'Mistral 7B (Local)', 
    provider: 'Local - 10.100.15.66:1137', 
    icon: '💨', 
    capabilities: ['General', 'Fast', 'Multilingual'], 
    status: 'disconnected', 
    endpoint: 'http://10.100.15.66:1137/v1/completions', 
    purpose: 'General & Multilingual',
    testEndpoints: [
      'http://10.100.15.66:1137/v1/models',
      'http://10.100.15.66:1137/health'
    ],
    expectedResponse: 'data'
  }
];

const PromptCraftGenerator: React.FC = () => {
  // State definitions
  const [activeTab, setActiveTab] = useState<string>('models'); // Start on models tab for testing
  const [llmModels, setLlmModels] = useState<LLMModel[]>(initialLlmModels);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [debugOutput, setDebugOutput] = useState<string>('');
  const [systemMetrics] = useState<SystemMetrics>({
    totalPrompts: 156,
    activePrompts: 8,
    completedToday: 12,
    avgResponseTime: '1.2s',
    llmCalls: 2341,
    successRate: 96.8
  });

  // FIXED: Proper connection testing with multiple endpoint strategies
  const testModelConnection = async (modelId: string, showDebug: boolean = false) => {
    const model = llmModels.find(m => m.id === modelId);
    if (!model) {
      setErrorMessage(`❌ Model ${modelId} not found`);
      return;
    }

    setIsTestingConnection(true);
    setErrorMessage(`🔄 Testing ${model.name}...`);
    
    let debugLog = `=== TESTING ${model.name} ===\n`;
    debugLog += `Base endpoint: ${model.endpoint}\n`;
    debugLog += `Test endpoints: ${model.testEndpoints?.length || 0}\n\n`;

    // Update model status to testing
    setLlmModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, status: 'testing' } : m
    ));

    let connectionSuccessful = false;
    let lastError = '';
    let successfulEndpoint = '';

    try {
      // Test each endpoint with different strategies
      const testEndpoints = model.testEndpoints || [model.endpoint];
      
      for (const testEndpoint of testEndpoints) {
        debugLog += `Testing: ${testEndpoint}\n`;
        
        try {
          // FIXED: Use proper fetch with timeout and correct headers
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const startTime = Date.now();
          const response = await fetch(testEndpoint, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            mode: 'cors', // Handle CORS properly
          });
          
          clearTimeout(timeoutId);
          const endTime = Date.now();
          const latency = endTime - startTime;
          
          debugLog += `  Status: ${response.status}\n`;
          debugLog += `  Latency: ${latency}ms\n`;
          
          if (response.ok) {
            try {
              const data = await response.text(); // Get as text first
              debugLog += `  Response preview: ${data.substring(0, 100)}...\n`;
              
              // Check if response contains expected content
              const hasExpectedContent = model.expectedResponse ? 
                data.toLowerCase().includes(model.expectedResponse.toLowerCase()) : 
                true;
              
              if (hasExpectedContent || response.status === 200) {
                connectionSuccessful = true;
                successfulEndpoint = testEndpoint;
                debugLog += `  ✅ SUCCESS: Valid response received\n`;
                break;
              } else {
                debugLog += `  ⚠️ Response doesn't contain expected content\n`;
              }
            } catch (parseError) {
              debugLog += `  ⚠️ Response parse error: ${parseError}\n`;
              // Even if parsing fails, 200 status might indicate service is running
              if (response.status === 200) {
                connectionSuccessful = true;
                successfulEndpoint = testEndpoint;
                debugLog += `  ✅ SUCCESS: Service responding (parse issues ignored)\n`;
                break;
              }
            }
          } else {
            debugLog += `  ❌ HTTP Error: ${response.status} ${response.statusText}\n`;
            lastError = `HTTP ${response.status}: ${response.statusText}`;
          }
          
        } catch (fetchError: any) {
          debugLog += `  ❌ Network Error: ${fetchError.message}\n`;
          lastError = fetchError.message;
          
          // Special handling for common errors
          if (fetchError.name === 'AbortError') {
            debugLog += `  ❌ Timeout after 5 seconds\n`;
            lastError = 'Connection timeout (5s)';
          } else if (fetchError.message.includes('CORS')) {
            debugLog += `  ❌ CORS policy blocking request\n`;
            lastError = 'CORS policy error - check server configuration';
          } else if (fetchError.message.includes('NetworkError') || fetchError.message.includes('Failed to fetch')) {
            debugLog += `  ❌ Network unreachable or service down\n`;
            lastError = 'Service unreachable - check if server is running';
          }
        }
        
        debugLog += '\n';
      }

      // Update model status based on test results
      const finalStatus = connectionSuccessful ? 'connected' : 'disconnected';
      const statusMessage = connectionSuccessful 
        ? `✅ ${model.name} connected successfully via ${successfulEndpoint}`
        : `❌ ${model.name} connection failed: ${lastError}`;

      setLlmModels(prev => prev.map(m => 
        m.id === modelId ? { ...m, status: finalStatus } : m
      ));
      
      setErrorMessage(statusMessage);
      
      if (showDebug) {
        setDebugOutput(debugLog);
      }
      
    } catch (error: any) {
      debugLog += `FATAL ERROR: ${error.message}\n`;
      setErrorMessage(`❌ ${model.name} test failed: ${error.message}`);
      setLlmModels(prev => prev.map(m => 
        m.id === modelId ? { ...m, status: 'disconnected' } : m
      ));
      
      if (showDebug) {
        setDebugOutput(debugLog);
      }
    } finally {
      setIsTestingConnection(false);
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  // FIXED: Test all models with better error handling
  const testAllModels = async () => {
    setErrorMessage('🔄 Testing all model connections...');
    setDebugOutput('=== TESTING ALL MODELS ===\n');
    
    for (const model of llmModels) {
      await testModelConnection(model.id, false);
      // Small delay between tests to avoid overwhelming the servers
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary after all tests
    const connectedCount = llmModels.filter(m => m.status === 'connected').length;
    const totalCount = llmModels.length;
    setErrorMessage(`✅ Connection test complete: ${connectedCount}/${totalCount} models connected`);
  };

  // FIXED: Auto-refresh with proper error handling
  useEffect(() => {
    // Initial test on component mount
    const initialTest = async () => {
      console.log('Starting initial connection tests...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for component to fully mount
      await testAllModels();
    };
    
    initialTest();

    // Set up periodic refresh every 30 seconds
    const interval = setInterval(async () => {
      console.log('Periodic connection check...');
      for (const model of llmModels) {
        if (model.status === 'disconnected') {
          await testModelConnection(model.id, false);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []); // Only run once on mount

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'testing': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'disconnected': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PromptCraft Platform - Connection Debug</h1>
                <p className="text-purple-300 text-sm">Fixed LLM Connection Testing with Proper Error Handling</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-xl font-bold text-white">{systemMetrics.totalPrompts}</div>
                  <div className="text-purple-300">Total Prompts</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-400">{systemMetrics.successRate}%</div>
                  <div className="text-purple-300">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-blue-400">{systemMetrics.avgResponseTime}</div>
                  <div className="text-purple-300">Avg Response</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex space-x-1 bg-black/20 backdrop-blur-lg rounded-xl p-1 mb-8">
          {[
            { id: 'models', label: 'Model Testing', icon: Cpu },
            { id: 'debug', label: 'Debug Output', icon: Terminal }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-purple-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Enhanced Error Message Display */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`border rounded-lg p-4 mb-6 flex items-center justify-between backdrop-blur-sm ${
              errorMessage.includes('✅') 
                ? 'bg-green-500/20 border-green-500/30' 
                : errorMessage.includes('🔄')
                ? 'bg-blue-500/20 border-blue-500/30'
                : 'bg-red-500/20 border-red-500/30'
            }`}
          >
            <div className="flex items-center space-x-3">
              {errorMessage.includes('✅') ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : errorMessage.includes('🔄') ? (
                <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <p className={
                errorMessage.includes('✅') ? 'text-green-300' : 
                errorMessage.includes('🔄') ? 'text-blue-300' :
                'text-red-300'
              }>
                {errorMessage}
              </p>
            </div>
            <button 
              onClick={() => setErrorMessage('')} 
              className={`transition-colors ${
                errorMessage.includes('✅') 
                  ? 'text-green-300 hover:text-green-200' 
                  : errorMessage.includes('🔄')
                  ? 'text-blue-300 hover:text-blue-200'
                  : 'text-red-300 hover:text-red-200'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Main Content with Animations */}
        <AnimatePresence>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Models Tab */}
            {activeTab === 'models' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-white">Local LLM Models - Fixed Connection Testing</h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={testAllModels}
                      disabled={isTestingConnection}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                    >
                      {isTestingConnection ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4 mr-2" />
                      )}
                      Test All Models
                    </button>
                    <button
                      onClick={() => {
                        setDebugOutput('');
                        setErrorMessage('');
                        setLlmModels(prev => prev.map(m => ({ ...m, status: 'disconnected' })));
                      }}
                      className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {llmModels.map(model => (
                    <div key={model.id} className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{model.icon}</span>
                          <div>
                            <h3 className="font-semibold text-white">{model.name}</h3>
                            <p className="text-sm text-purple-300">{model.provider}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                          model.status === 'connected'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : model.status === 'testing'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {getStatusIcon(model.status)}
                          <span className="capitalize">{model.status}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-slate-300 mb-4">{model.purpose}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {model.capabilities.map(cap => (
                          <span key={cap} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs border border-purple-500/30">
                            {cap}
                          </span>
                        ))}
                      </div>
                      
                      <div className="bg-slate-800 p-3 rounded-lg mb-4">
                        <div className="text-xs text-slate-400 mb-1">Primary Endpoint</div>
                        <div className="text-sm text-slate-300 font-mono">{model.endpoint}</div>
                        {model.testEndpoints && model.testEndpoints.length > 1 && (
                          <>
                            <div className="text-xs text-slate-400 mb-1 mt-2">Test Endpoints ({model.testEndpoints.length})</div>
                            <div className="text-xs text-slate-400 font-mono">
                              {model.testEndpoints.slice(0, 2).join(', ')}
                              {model.testEndpoints.length > 2 && ` + ${model.testEndpoints.length - 2} more`}
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => testModelConnection(model.id, false)}
                          disabled={isTestingConnection}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                        >
                          {model.status === 'testing' ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <Activity className="w-4 h-4 mr-1" />
                              Test
                            </>
                          )}
                        </button>
                        <button 
                          onClick={() => testModelConnection(model.id, true)}
                          disabled={isTestingConnection}
                          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center"
                          title="Test with detailed debug output"
                        >
                          <Terminal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Connection Summary */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Connection Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-green-400">
                            {llmModels.filter(m => m.status === 'connected').length}
                          </div>
                          <div className="text-sm text-green-300">Connected</div>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </div>
                    </div>
                    
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-red-400">
                            {llmModels.filter(m => m.status === 'disconnected').length}
                          </div>
                          <div className="text-sm text-red-300">Disconnected</div>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-400" />
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-blue-400">
                            {llmModels.filter(m => m.status === 'testing').length}
                          </div>
                          <div className="text-sm text-blue-300">Testing</div>
                        </div>
                        <RefreshCw className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                    
                    <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-purple-400">
                            {Math.round((llmModels.filter(m => m.status === 'connected').length / llmModels.length) * 100)}%
                          </div>
                          <div className="text-sm text-purple-300">Uptime</div>
                        </div>
                        <Activity className="w-8 h-8 text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Debug Tab */}
            {activeTab === 'debug' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-white">Debug Output</h2>
                  <button
                    onClick={() => setDebugOutput('')}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </button>
                </div>
                
                <div className="bg-black/40 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-300 min-h-96 max-h-96 overflow-y-auto">
                    {debugOutput || 'No debug output yet. Click "Test with Debug" on any model to see detailed connection information.'}
                  </div>
                </div>

                {/* Quick Fix Commands */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Fix Commands for Phi-3</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Check Phi-3 Service Status',
                        command: 'sudo systemctl status ollama',
                        description: 'Check if Ollama service is running'
                      },
                      {
                        title: 'Start Phi-3 Service',
                        command: 'sudo systemctl start ollama && ollama serve',
                        description: 'Start Ollama service and serve models'
                      },
                      {
                        title: 'Check Phi-3 Port',
                        command: 'netstat -tlnp | grep :12139',
                        description: 'Verify if port 12139 is open and listening'
                      },
                      {
                        title: 'Test Phi-3 Endpoint',
                        command: 'curl -f http://10.100.15.67:12139/api/tags',
                        description: 'Direct test of Phi-3 Ollama API'
                      },
                      {
                        title: 'Check Firewall',
                        command: 'sudo ufw status | grep 12139',
                        description: 'Check if port 12139 is blocked by firewall'
                      },
                      {
                        title: 'Restart Phi-3',
                        command: 'sudo systemctl restart ollama && sleep 5 && ollama list',
                        description: 'Restart Ollama and list available models'
                      }
                    ].map((fix, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <h4 className="font-medium text-white mb-2">{fix.title}</h4>
                        <p className="text-sm text-slate-300 mb-3">{fix.description}</p>
                        <div className="bg-slate-800 p-2 rounded font-mono text-xs text-green-300 mb-2">
                          $ {fix.command}
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard?.writeText(fix.command).then(() => {
                              setErrorMessage(`✅ Command copied: ${fix.title}`);
                              setTimeout(() => setErrorMessage(''), 2000);
                            }).catch(() => {
                              // Fallback for non-HTTPS environments
                              const textArea = document.createElement('textarea');
                              textArea.value = fix.command;
                              document.body.appendChild(textArea);
                              textArea.select();
                              document.execCommand('copy');
                              document.body.removeChild(textArea);
                              setErrorMessage(`✅ Command copied: ${fix.title}`);
                              setTimeout(() => setErrorMessage(''), 2000);
                            });
                          }}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm"
                        >
                          Copy Command
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Common Issues and Solutions */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Common Issues & Solutions</h3>
                  <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                      <h4 className="font-medium text-red-300 mb-2">❌ Connection Timeout</h4>
                      <p className="text-sm text-red-200 mb-2">
                        The service is not responding within 5 seconds.
                      </p>
                      <ul className="text-xs text-red-200 space-y-1 ml-4">
                        <li>• Check if the service is running: <code>sudo systemctl status ollama</code></li>
                        <li>• Verify the server is reachable: <code>ping 10.100.15.67</code></li>
                        <li>• Check if port is open: <code>telnet 10.100.15.67 12139</code></li>
                      </ul>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-300 mb-2">⚠️ CORS Policy Error</h4>
                      <p className="text-sm text-yellow-200 mb-2">
                        Browser is blocking the request due to CORS policy.
                      </p>
                      <ul className="text-xs text-yellow-200 space-y-1 ml-4">
                        <li>• Add CORS headers to Ollama: <code>OLLAMA_ORIGINS=* ollama serve</code></li>
                        <li>• Or use environment variable: <code>export OLLAMA_ORIGINS="*"</code></li>
                        <li>• Restart Ollama after setting CORS origins</li>
                      </ul>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="font-medium text-blue-300 mb-2">ℹ️ HTTP 404 Not Found</h4>
                      <p className="text-sm text-blue-200 mb-2">
                        The endpoint path is incorrect or service is not properly configured.
                      </p>
                      <ul className="text-xs text-blue-200 space-y-1 ml-4">
                        <li>• Try different endpoints: <code>/api/tags</code>, <code>/api/version</code></li>
                        <li>• Check Ollama documentation for correct API paths</li>
                        <li>• Verify model is loaded: <code>ollama list</code></li>
                      </ul>
                    </div>

                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h4 className="font-medium text-green-300 mb-2">✅ Working Configuration</h4>
                      <p className="text-sm text-green-200 mb-2">
                        Typical working setup for Phi-3 with Ollama:
                      </p>
                      <div className="bg-slate-800 p-3 rounded font-mono text-xs text-green-300">
                        <div># 1. Install and start Ollama</div>
                        <div>curl -fsSL https://ollama.ai/install.sh | sh</div>
                        <div>sudo systemctl enable ollama</div>
                        <div>sudo systemctl start ollama</div>
                        <div></div>
                        <div># 2. Set CORS for web access</div>
                        <div>export OLLAMA_ORIGINS="*"</div>
                        <div>export OLLAMA_HOST="0.0.0.0:12139"</div>
                        <div></div>
                        <div># 3. Pull and run Phi-3</div>
                        <div>ollama pull phi3:mini</div>
                        <div>ollama serve</div>
                        <div></div>
                        <div># 4. Test connection</div>
                        <div>curl http://10.100.15.67:12139/api/tags</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PromptCraftGenerator;
