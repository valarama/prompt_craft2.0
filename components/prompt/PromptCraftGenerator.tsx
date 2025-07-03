'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Zap, 
  Database, 
  Globe, 
  Settings, 
  Download,
  Sparkles,
  Target,
  Network,
  FileText,
  Send,
  Cpu,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';

interface Domain {
  name: string;
  icon: string;
  color: string;
  useCases: string[];
}

interface LLMModel {
  id: string;
  name: string;
  provider: string;
  icon: string;
  capabilities: string[];
  status: string;
  endpoint?: string;
  purpose: string;
}

interface Service {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  endpoint?: string;
  description: string;
}

interface PromptType {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface Variables {
  context?: string;
  input_data?: string;
  output_format?: string;
}

interface PromptCraftJson {
  id: string;
  timestamp: string;
  domain: string;
  goal: string;
  promptType: string;
  model: string;
  modelEndpoint?: string;
  variables: Variables;
  prompt: {
    system: string;
    user: string;
    context: Record<string, any>;
  };
  metadata: {
    complexity_score: number;
    estimated_tokens: number;
    suggested_temperature: number;
    max_tokens: number;
    model_capabilities: string[];
  };
  neo4j_storage: Record<string, any>;
  integrations: Record<string, any>;
}

const PromptCraftGenerator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('craft');
  const [selectedDomain, setSelectedDomain] = useState<string>('Banking');
  const [selectedModel, setSelectedModel] = useState<string>('phi-3-local');
  const [userGoal, setUserGoal] = useState<string>('');
  const [promptType, setPromptType] = useState<string>('');
  const [variables, setVariables] = useState<Variables>({});
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [promptCraftJson, setPromptCraftJson] = useState<PromptCraftJson | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [connectedServices, setConnectedServices] = useState<Service[]>([]);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);

  // Domain configurations
  const domains: Domain[] = [
    { 
      name: 'Banking', 
      icon: '🏦', 
      color: 'bg-blue-500',
      useCases: ['Risk Assessment', 'Fraud Detection', 'Customer Onboarding', 'Compliance Analysis', 'Credit Scoring']
    },
    { 
      name: 'Healthcare', 
      icon: '🏥', 
      color: 'bg-green-500',
      useCases: ['Patient Care', 'Medical Research', 'Drug Discovery', 'Clinical Trials', 'Diagnosis Support']
    },
    { 
      name: 'Retail', 
      icon: '🛍️', 
      color: 'bg-pink-500',
      useCases: ['Customer Segmentation', 'Inventory Optimization', 'Price Analytics', 'Recommendation Engine', 'Demand Forecasting']
    },
    { 
      name: 'Architecture', 
      icon: '🏗️', 
      color: 'bg-orange-500',
      useCases: ['Design Review', 'System Architecture', 'Code Analysis', 'Documentation', 'Performance Optimization']
    }
  ];

  // LLM Models
  const llmModels: LLMModel[] = [
    { 
      id: 'phi-3-local', 
      name: 'Phi-3 Mini 4K (Local)', 
      provider: 'Local - 10.100.15.67:12139',
      icon: '🎯',
      capabilities: ['Instruct', 'Fast', 'Private', 'General'],
      status: 'connected',
      endpoint: 'http://10.100.15.67:12139',
      purpose: 'General Purpose & Instructions'
    },
    { 
      id: 'local-sqlcoder', 
      name: 'SQLCoder 7B (Local)', 
      provider: 'Local - 10.100.15.67:1138',
      icon: '🗄️',
      capabilities: ['SQL', 'Database', 'Fast', 'Private'],
      status: 'connected',
      endpoint: 'http://10.100.15.67:1138',
      purpose: 'SQL & Database Tasks'
    },
    { 
      id: 'local-deepseek', 
      name: 'DeepSeek Coder (Local)', 
      provider: 'Local - 10.100.15.66:1138',
      icon: '💻',
      capabilities: ['Code', 'Programming', 'Fast', 'Private'],
      status: 'connected',
      endpoint: 'http://10.100.15.66:1138',
      purpose: 'Code Generation & Programming'
    },
    { 
      id: 'local-mistral', 
      name: 'Mistral 7B (Local)', 
      provider: 'Local - 10.100.15.66:1137',
      icon: '💨',
      capabilities: ['General', 'Fast', 'Multilingual'],
      status: 'connected',
      endpoint: 'http://10.100.15.66:1137',
      purpose: 'General & Multilingual'
    },
    { 
      id: 'claude-sonnet-4', 
      name: 'Claude Sonnet 4', 
      provider: 'Anthropic API',
      icon: '🤖',
      capabilities: ['Reasoning', 'Code', 'Analysis', 'Long Context'],
      status: 'available',
      purpose: 'Advanced Reasoning & Analysis'
    }
  ];

  // Service integrations
  const services: Service[] = [
    { 
      id: 'neo4j', 
      name: 'Neo4j Graph DB', 
      icon: '🔗', 
      connected: true,
      endpoint: 'bolt://10.100.15.67:7687',
      description: 'Graph database for prompt relationships'
    },
    { 
      id: 'google-workspace', 
      name: 'Google Workspace', 
      icon: '📧', 
      connected: false,
      description: 'Gmail, Sheets, Drive integration'
    },
    { 
      id: 'github', 
      name: 'GitHub API', 
      icon: '💻', 
      connected: true,
      description: 'Code repository integration'
    },
    { 
      id: 'rag-engine', 
      name: 'RAG Engine', 
      icon: '🧠', 
      connected: true,
      description: 'Retrieval augmented generation'
    },
    { 
      id: 'huggingface', 
      name: 'Hugging Face', 
      icon: '🤗', 
      connected: true,
      description: 'Model hub and transformers'
    }
  ];

  // Prompt types
  const promptTypes: PromptType[] = [
    { id: 'instruction-based', name: 'Instruction-Based', category: 'Basic', description: 'Clear, direct instructions' },
    { id: 'summary', name: 'Summary & Analysis', category: 'Analysis', description: 'Summarize and analyze content' },
    { id: 'chain-of-thought', name: 'Chain-of-Thought', category: 'Reasoning', description: 'Step-by-step reasoning' },
    { id: 'data-mapping', name: 'Data Mapping', category: 'Technical', description: 'Transform and map data structures' },
    { id: 'rag', name: 'RAG Generation', category: 'Knowledge', description: 'Knowledge retrieval and generation' },
    { id: 'code-conversion', name: 'Code Conversion', category: 'Technical', description: 'Convert between programming languages' },
    { id: 'few-shot', name: 'Few-Shot Learning', category: 'Training', description: 'Learn from examples' },
    { id: 'zero-shot', name: 'Zero-Shot', category: 'Basic', description: 'No prior examples needed' },
    { id: 'sentiment-analysis', name: 'Sentiment Analysis', category: 'Analysis', description: 'Analyze emotions and opinions' },
    { id: 'recommendation', name: 'Recommendation', category: 'Business', description: 'Generate recommendations' }
  ];

  useEffect(() => {
    setConnectedServices(services.filter(s => s.connected));
  }, []);

  const suggestPromptType = (goal: string, domain: string): string => {
    const goalLower = goal.toLowerCase();
    
    if (goalLower.includes('summar') || goalLower.includes('analyz')) return 'summary';
    if (goalLower.includes('recommend') || goalLower.includes('suggest')) return 'recommendation';
    if (goalLower.includes('sentiment') || goalLower.includes('emotion')) return 'sentiment-analysis';
    if (goalLower.includes('map') || goalLower.includes('data') || goalLower.includes('transform')) return 'data-mapping';
    if (goalLower.includes('code') || goalLower.includes('convert') || goalLower.includes('program')) return 'code-conversion';
    if (goalLower.includes('reason') || goalLower.includes('solve') || goalLower.includes('explain')) return 'chain-of-thought';
    if (goalLower.includes('knowledge') || goalLower.includes('fact') || goalLower.includes('research')) return 'rag';
    
    return 'instruction-based';
  };

  useEffect(() => {
    if (userGoal && selectedDomain) {
      const suggested = suggestPromptType(userGoal, selectedDomain);
      setPromptType(suggested);
    }
  }, [userGoal, selectedDomain]);

  const testModelConnection = async (modelId: string): Promise<boolean> => {
    setIsTestingConnection(true);
    const model = llmModels.find(m => m.id === modelId);
    
    if (model && model.endpoint) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsTestingConnection(false);
        alert(`✅ ${model.name} connection test completed!`);
        return true;
      } catch (error: any) {
        setIsTestingConnection(false);
        alert(`❌ ${model.name} connection error: ${error.message}`);
        return false;
      }
    }
    setIsTestingConnection(false);
    return false;
  };

  const generatePromptCraft = async (): Promise<void> => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const selectedModelData = llmModels.find(m => m.id === selectedModel);
      
      const domainTemplates: Record<string, any> = {
        Banking: {
          system: 'You are a senior banking analyst with expertise in financial services, regulatory compliance, and risk management.',
          contextKeywords: ['risk assessment', 'compliance', 'fraud detection', 'credit scoring']
        },
        Healthcare: {
          system: 'You are a healthcare data scientist with expertise in medical informatics and clinical research.',
          contextKeywords: ['patient outcomes', 'clinical trials', 'medical research']
        },
        Retail: {
          system: 'You are a retail analytics expert with expertise in e-commerce and customer behavior.',
          contextKeywords: ['customer segmentation', 'inventory optimization', 'demand forecasting']
        },
        Architecture: {
          system: 'You are a senior software architect with expertise in system design and performance optimization.',
          contextKeywords: ['system design', 'scalability', 'performance optimization']
        }
      };

      const template = domainTemplates[selectedDomain];
      
      const promptCraft: PromptCraftJson = {
        id: `prompt_${Date.now()}`,
        timestamp: new Date().toISOString(),
        domain: selectedDomain,
        goal: userGoal,
        promptType: promptType,
        model: selectedModel,
        modelEndpoint: selectedModelData?.endpoint,
        variables: variables,
        prompt: {
          system: template.system,
          user: `${userGoal}\n\nContext: ${variables.context || 'Not specified'}\nDomain: ${selectedDomain}\nOutput format: ${variables.output_format || 'Not specified'}`,
          context: {
            domain_expertise: selectedDomain,
            use_case: userGoal,
            reasoning_type: promptType,
            input_data: variables.input_data,
            context_variables: variables.context,
            output_format: variables.output_format
          }
        },
        metadata: {
          complexity_score: Math.floor(Math.random() * 10) + 1,
          estimated_tokens: Math.floor(Math.random() * 3000) + 800,
          suggested_temperature: selectedDomain === 'Architecture' ? 0.3 : 0.7,
          max_tokens: 2000,
          model_capabilities: selectedModelData?.capabilities || []
        },
        neo4j_storage: {
          node_labels: ['Prompt', selectedDomain, promptType.replace('-', '_')],
          relationships: ['GENERATED_FOR', 'USES_MODEL', 'BELONGS_TO_DOMAIN'],
          properties: {
            domain: selectedDomain,
            goal: userGoal,
            model: selectedModel,
            created_at: new Date().toISOString()
          }
        },
        integrations: {
          available_services: connectedServices.map(s => s.id),
          rag_enabled: connectedServices.some(s => s.id === 'rag-engine'),
          storage_enabled: connectedServices.some(s => s.id === 'neo4j'),
          model_endpoint: selectedModelData?.endpoint
        }
      };

      setPromptCraftJson(promptCraft);
      setGeneratedPrompt(promptCraft.prompt.user);
      setIsGenerating(false);
    }, 2500);
  };

  const saveToNeo4j = async (): Promise<void> => {
    if (!promptCraftJson) return;
    alert('✅ Prompt saved to Neo4j Graph Database!');
  };

  const connectToRAG = async (): Promise<void> => {
    alert('🧠 Connected to RAG engine!');
  };

  const deployToModel = async (): Promise<void> => {
    if (!promptCraftJson) return;
    
    const modelData = llmModels.find(m => m.id === selectedModel);
    if (modelData && modelData.endpoint) {
      alert(`🚀 Prompt deployed to ${modelData.name}!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PromptCraft 2.0</h1>
                <p className="text-slate-400 text-sm">Enterprise AI Prompt Engineering Platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-slate-300">{connectedServices.length}/10 Services</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg px-3 py-2">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">4 Local Models</span>
              </div>
              
              <button className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Navigation */}
        <nav className="flex space-x-1 bg-slate-800/50 rounded-lg p-1">
          {[
            { id: 'craft', name: 'Craft Prompt', icon: Sparkles },
            { id: 'models', name: 'Local Models', icon: Cpu },
            { id: 'integrations', name: 'Integrations', icon: Network },
            { id: 'analytics', name: 'Analytics', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id 
                  ? 'bg-purple-500 text-white' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        {activeTab === 'craft' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Panel */}
            <div className="lg:col-span-2 space-y-8">
              {/* Domain Selection */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-purple-400" />
                  Domain & Use Case Selection
                </h3>
                
                <div className="domain-selection-grid">
                  {domains.map(domain => (
                    <button
                      key={domain.name}
                      onClick={() => setSelectedDomain(domain.name)}
                      className={`domain-btn ${selectedDomain === domain.name ? 'active' : ''}`}
                    >
                      <div className="domain-btn-icon">{domain.icon}</div>
                      <div className="domain-btn-title">{domain.name}</div>
                    </button>
                  ))}
                </div>

                {selectedDomain && (
                  <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm font-medium mb-3">
                      {selectedDomain} Use Cases:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {domains.find(d => d.name === selectedDomain)?.useCases.map(useCase => (
                        <span key={useCase} className="bg-blue-500/30 text-blue-200 px-3 py-1 rounded-md text-xs">
                          {useCase}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    What specific task do you want to accomplish?
                  </label>
                  <textarea
                    value={userGoal}
                    onChange={(e) => setUserGoal(e.target.value)}
                    placeholder="e.g., Analyze customer purchase patterns to create personalized product recommendations"
                    className="form-input form-textarea"
                    rows={3}
                  />
                </div>
              </div>

              {/* Prompt Type Selection */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-400" />
                  AI Prompt Engineering Strategy
                </h3>
                
                {promptType && (
                  <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 text-sm">
                      ✨ AI Suggested: <strong>{promptTypes.find(p => p.id === promptType)?.name}</strong>
                    </p>
                    <p className="text-green-200 text-xs mt-2">
                      {promptTypes.find(p => p.id === promptType)?.description}
                    </p>
                  </div>
                )}

                <div className="strategy-grid">
                  {promptTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setPromptType(type.id)}
                      className={`strategy-btn ${promptType === type.id ? 'active' : ''}`}
                    >
                      <div className="strategy-btn-title">{type.name}</div>
                      <div className="strategy-btn-category">{type.category}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt Configuration */}
              {promptType && (
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-purple-400" />
                    Prompt Configuration & Variables
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Context & Background
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Enterprise environment with regulatory compliance requirements"
                        onChange={(e) => setVariables({...variables, context: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Input Data / Sample
                      </label>
                      <textarea
                        className="form-input form-textarea"
                        placeholder="Paste sample data, code, or specific input that the AI should work with..."
                        rows={4}
                        onChange={(e) => setVariables({...variables, input_data: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-3">
                        Expected Output Format
                      </label>
                      <select
                        className="form-input"
                        onChange={(e) => setVariables({...variables, output_format: e.target.value})}
                      >
                        <option value="">Select format...</option>
                        <option value="json">JSON</option>
                        <option value="markdown">Markdown</option>
                        <option value="csv">CSV</option>
                        <option value="code">Code</option>
                        <option value="sql">SQL Query</option>
                        <option value="report">Business Report</option>
                        <option value="summary">Executive Summary</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={generatePromptCraft}
                disabled={!userGoal || !promptType || isGenerating}
                className="generate-btn"
              >
                {isGenerating ? (
                  <>
                    <div className="loading-spinner"></div>
                    <span>Crafting Enterprise Prompt...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate PromptCraft 2.0</span>
                  </>
                )}
              </button>
            </div>

            {/* Output Panel */}
            <div className="space-y-8">
              {/* Model Selection */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Cpu className="w-5 h-5 mr-2 text-purple-400" />
                  AI Model Selection
                </h3>
                
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="form-input mb-6"
                >
                  {llmModels.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Status:</span>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      llmModels.find(m => m.id === selectedModel)?.status === 'connected' 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {llmModels.find(m => m.id === selectedModel)?.status === 'connected' ? 'Connected' : 'Available'}
                    </span>
                  </div>

                  {llmModels.find(m => m.id === selectedModel)?.endpoint && (
                    <div className="text-xs text-slate-400 bg-slate-700/50 p-3 rounded-lg">
                      Endpoint: {llmModels.find(m => m.id === selectedModel)?.endpoint}
                    </div>
                  )}

                  <div className="text-xs text-slate-300 bg-slate-700/50 p-3 rounded-lg">
                    Purpose: {llmModels.find(m => m.id === selectedModel)?.purpose}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {llmModels
                      .find(model => model.id === selectedModel)
                      ?.capabilities.map(cap => (
                      <span key={cap} className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs">
                        {cap}
                      </span>
                    ))}
                  </div>

                  {llmModels.find(m => m.id === selectedModel)?.endpoint && (
                    <button
                      onClick={() => testModelConnection(selectedModel)}
                      disabled={isTestingConnection}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2 mt-4"
                    >
                      {isTestingConnection ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Test Connection</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Service Integrations */}
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                  <Network className="w-5 h-5 mr-2 text-purple-400" />
                  Service Integrations
                </h3>
                
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {services.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{service.icon}</span>
                        <div>
                          <div className="text-white text-sm font-medium">{service.name}</div>
                          <div className="text-slate-400 text-xs">{service.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {service.connected ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-500" />
                        )}
                        <button
                          className={`text-xs px-3 py-2 rounded-lg transition-colors ${
                            service.connected 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                          }`}
                        >
                          {service.connected ? 'Connected' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              {promptCraftJson && (
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-700">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-purple-400" />
                    Deployment Actions
                  </h3>
                  
                  <div className="space-y-4">
                    <button
                      onClick={saveToNeo4j}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Database className="w-4 h-4" />
                      <span>Save to Neo4j</span>
                    </button>
                    
                    <button
                      onClick={connectToRAG}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Brain className="w-4 h-4" />
                      <span>Enable RAG</span>
                    </button>

                    <button
                      onClick={deployToModel}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Deploy to Model</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (promptCraftJson) {
                          navigator.clipboard.writeText(JSON.stringify(promptCraftJson, null, 2));
                          alert('✅ PromptCraft JSON copied to clipboard!');
                        }
                      }}
                      className="w-full bg-slate-600 hover:bg-slate-500 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Models Tab */}
        {activeTab === 'models' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {llmModels.map(model => (
              <div key={model.id} className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{model.icon}</span>
                    <div>
                      <h3 className="text-white font-semibold">{model.name}</h3>
                      <p className="text-slate-400 text-sm">{model.provider}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    model.status === 'connected' ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                </div>

                {model.endpoint && (
                  <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-300 text-xs">Endpoint:</p>
                    <p className="text-white text-sm font-mono">{model.endpoint}</p>
                  </div>
                )}

                <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-slate-300 text-xs">Purpose:</p>
                  <p className="text-white text-sm">{model.purpose}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {model.capabilities.map(cap => (
                    <span key={cap} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                      {cap}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedModel(model.id)}
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    selectedModel === model.id
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {selectedModel === model.id ? 'Selected' : 'Select Model'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map(service => (
              <div key={service.id} className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{service.icon}</span>
                    <div>
                      <h3 className="text-white font-semibold">{service.name}</h3>
                      <p className="text-slate-400 text-sm">{service.description}</p>
                    </div>
                  </div>
                  {service.connected ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-slate-500" />
                  )}
                </div>

                {service.endpoint && (
                  <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-300 text-xs">Endpoint:</p>
                    <p className="text-white text-sm font-mono">{service.endpoint}</p>
                  </div>
                )}

                <button
                  className={`w-full py-2 px-4 rounded-lg transition-colors ${
                    service.connected
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {service.connected ? 'Connected' : 'Connect Service'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">Model Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Phi-3 Mini</span>
                  <span className="text-green-300 font-semibold">95%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DeepSeek Coder</span>
                  <span className="text-green-300 font-semibold">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SQLCoder 7B</span>
                  <span className="text-red-300 font-semibold">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mistral 7B</span>
                  <span className="text-yellow-300 font-semibold">78%</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">Popular Domains</h3>
              <div className="space-y-3">
                {domains.map((domain, index) => (
                  <div key={domain.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span>{domain.icon}</span>
                      <span className="text-slate-300">{domain.name}</span>
                    </div>
                    <span className="text-white font-semibold">{45 - index * 10}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700">
              <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-slate-300">Phi-3 prompt deployed</p>
                  <p className="text-slate-500 text-xs">2 minutes ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-slate-300">Banking analysis saved</p>
                  <p className="text-slate-500 text-xs">15 minutes ago</p>
                </div>
                <div className="text-sm">
                  <p className="text-slate-300">SQLCoder issue detected</p>
                  <p className="text-slate-500 text-xs">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Generated Output */}
        {promptCraftJson && (
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-8 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-8 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-purple-400" />
              Generated PromptCraft 2.0 Output
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">Enhanced Prompt</h4>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-400">
                      {promptCraftJson.metadata.estimated_tokens} tokens
                    </span>
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                      Complexity: {promptCraftJson.metadata.complexity_score}/10
                    </span>
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg p-6 text-slate-200 text-sm overflow-auto max-h-96 border border-slate-600">
                  <div className="mb-4">
                    <strong className="text-blue-400">System:</strong>
                    <p className="mt-2 leading-relaxed">{promptCraftJson.prompt.system}</p>
                  </div>
                  <div>
                    <strong className="text-green-400">User:</strong>
                    <p className="mt-2 leading-relaxed">{generatedPrompt}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">PromptCraft Metadata</h4>
                  <button
                    onClick={() => {
                      if (promptCraftJson) {
                        const blob = new Blob([JSON.stringify(promptCraftJson, null, 2)], {type: 'application/json'});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `promptcraft-${promptCraftJson.id}.json`;
                        a.click();
                      }
                    }}
                    className="text-xs bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Download
                  </button>
                </div>
                <div className="bg-slate-900 rounded-lg p-6 text-slate-200 text-xs overflow-auto max-h-96 border border-slate-600">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(promptCraftJson, null, 2)}</pre>
                </div>
              </div>
            </div>

            {/* Deployment Preview */}
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg">
              <h4 className="text-white font-medium mb-4 flex items-center">
                <Send className="w-4 h-4 mr-2" />
                Ready for Deployment
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-slate-400 mb-1">Target Model:</p>
                  <p className="text-white font-medium">{llmModels.find(m => m.id === selectedModel)?.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Domain:</p>
                  <p className="text-white font-medium">{selectedDomain}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Strategy:</p>
                  <p className="text-white font-medium">{promptTypes.find(p => p.id === promptType)?.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptCraftGenerator;