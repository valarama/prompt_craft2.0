import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload, FileText, Database, Settings, Play, CheckCircle, AlertCircle, Clock, Download, Eye, Trash2,
  RefreshCw, Search, Plus, X, Monitor, Activity, Zap, Sparkles, Brain, Globe, Network, Target, Send,
  MessageSquare, Cpu, TrendingUp, GitBranch, Cloud, Server, Shield, Key, Link, Wifi, WifiOff
} from 'lucide-react';

// Enhanced TypeScript interfaces with full integration support
interface MCPConnection {
  id: string;
  name: string;
  protocol: 'stdio' | 'sse' | 'websocket';
  endpoint: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  capabilities: string[];
  lastHeartbeat?: string;
  metadata?: Record<string, any>;
}

interface GitHubIntegration {
  id: string;
  username: string;
  repository: string;
  branch: string;
  accessToken: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  permissions: string[];
}

interface Neo4jConnection {
  uri: string;
  username: string;
  password: string;
  database: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  version?: string;
  lastQuery?: string;
  connectionPool?: {
    active: number;
    idle: number;
    max: number;
  };
}

interface GoogleServicesConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
  services: {
    drive: boolean;
    sheets: boolean;
    gmail: boolean;
    cloud: boolean;
  };
  status: 'connected' | 'disconnected' | 'error';
  quotaUsage?: Record<string, number>;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  service: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
}

interface ConnectionHealth {
  neo4j: { status: string; latency?: number; error?: string };
  github: { status: string; rateLimit?: number; error?: string };
  google: { status: string; quotaRemaining?: number; error?: string };
  mcp: { status: string; activeConnections?: number; error?: string };
}

// Enhanced data structures
const initialLlmModels = [
  { 
    id: 'phi-3-local', 
    name: 'Phi-3 Mini 4K (Local)', 
    provider: 'Local - 10.100.15.67:12139', 
    icon: '🎯', 
    capabilities: ['Instruct', 'Fast', 'Private', 'General'], 
    status: 'connected', 
    endpoint: 'http://10.100.15.67:12139', 
    purpose: 'General Purpose & Instructions',
    mcpEnabled: true,
    authentication: 'none'
  },
  { 
    id: 'local-sqlcoder', 
    name: 'SQLCoder 7B (Local)', 
    provider: 'Local - 10.100.15.67:1138', 
    icon: '🗄️', 
    capabilities: ['SQL', 'Database', 'Fast', 'Private'], 
    status: 'connected', 
    endpoint: 'http://10.100.15.67:1138', 
    purpose: 'SQL & Database Tasks',
    mcpEnabled: true,
    authentication: 'api_key'
  },
  { 
    id: 'local-deepseek', 
    name: 'DeepSeek Coder (Local)', 
    provider: 'Local - 10.100.15.66:1138', 
    icon: '💻', 
    capabilities: ['Code', 'Programming', 'Fast', 'Private'], 
    status: 'connected', 
    endpoint: 'http://10.100.15.66:1138', 
    purpose: 'Code Generation & Programming',
    mcpEnabled: true,
    authentication: 'bearer_token'
  },
  { 
    id: 'local-mistral', 
    name: 'Mistral 7B (Local)', 
    provider: 'Local - 10.100.15.66:1137', 
    icon: '💨', 
    capabilities: ['General', 'Fast', 'Multilingual'], 
    status: 'connected', 
    endpoint: 'http://10.100.15.66:1137', 
    purpose: 'General & Multilingual',
    mcpEnabled: false,
    authentication: 'none'
  }
];

// Enhanced error handling service
class ErrorHandlingService {
  private errors: ErrorLog[] = [];
  private listeners: ((errors: ErrorLog[]) => void)[] = [];
  
  logError(service: string, message: string, error?: Error, context?: Record<string, any>) {
    const errorLog: ErrorLog = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level: 'error',
      service,
      message,
      stack: error?.stack,
      context
    };
    
    this.errors.unshift(errorLog);
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(0, 100);
    }
    
    this.notifyListeners();
    console.error(`[${service}] ${message}`, error, context);
  }
  
  logWarning(service: string, message: string, context?: Record<string, any>) {
    const errorLog: ErrorLog = {
      id: `warning_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level: 'warning',
      service,
      message,
      context
    };
    
    this.errors.unshift(errorLog);
    this.notifyListeners();
    console.warn(`[${service}] ${message}`, context);
  }
  
  logInfo(service: string, message: string, context?: Record<string, any>) {
    const errorLog: ErrorLog = {
      id: `info_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      service,
      message,
      context
    };
    
    this.errors.unshift(errorLog);
    this.notifyListeners();
    console.info(`[${service}] ${message}`, context);
  }
  
  subscribe(listener: (errors: ErrorLog[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.errors]));
  }
  
  getErrors() {
    return [...this.errors];
  }
  
  clearErrors() {
    this.errors = [];
    this.notifyListeners();
  }
}

// MCP Protocol Service
class MCPService {
  private connections: Map<string, MCPConnection> = new Map();
  private errorHandler: ErrorHandlingService;
  
  constructor(errorHandler: ErrorHandlingService) {
    this.errorHandler = errorHandler;
  }
  
  async connectToMCPServer(config: {
    name: string;
    protocol: 'stdio' | 'sse' | 'websocket';
    endpoint: string;
    capabilities?: string[];
  }): Promise<MCPConnection> {
    try {
      this.errorHandler.logInfo('MCP', `Connecting to ${config.name} via ${config.protocol}`, config);
      
      // Simulate MCP connection based on protocol
      const connection: MCPConnection = {
        id: `mcp_${Date.now()}`,
        name: config.name,
        protocol: config.protocol,
        endpoint: config.endpoint,
        status: 'connecting',
        capabilities: config.capabilities || [],
        lastHeartbeat: new Date().toISOString()
      };
      
      this.connections.set(connection.id, connection);
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      connection.status = 'connected';
      connection.capabilities = [
        'prompts/list',
        'prompts/get',
        'resources/list',
        'resources/read',
        'tools/list',
        'tools/call',
        'logging/setLevel'
      ];
      
      this.errorHandler.logInfo('MCP', `Successfully connected to ${config.name}`, {
        connectionId: connection.id,
        capabilities: connection.capabilities
      });
      
      return connection;
    } catch (error) {
      this.errorHandler.logError('MCP', `Failed to connect to ${config.name}`, error as Error, config);
      throw error;
    }
  }
  
  async sendMCPRequest(connectionId: string, method: string, params?: any): Promise<any> {
    const connection = this.connections.get(connectionId);
    if (!connection || connection.status !== 'connected') {
      throw new Error(`MCP connection ${connectionId} not available`);
    }
    
    try {
      this.errorHandler.logInfo('MCP', `Sending request: ${method}`, { connectionId, params });
      
      // Simulate MCP request/response
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const mockResponse = {
        id: Date.now(),
        result: {
          method,
          params,
          response: `Mock response for ${method}`,
          timestamp: new Date().toISOString()
        }
      };
      
      connection.lastHeartbeat = new Date().toISOString();
      return mockResponse;
    } catch (error) {
      this.errorHandler.logError('MCP', `MCP request failed: ${method}`, error as Error, { connectionId, params });
      throw error;
    }
  }
  
  getConnections(): MCPConnection[] {
    return Array.from(this.connections.values());
  }
  
  disconnect(connectionId: string) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = 'disconnected';
      this.errorHandler.logInfo('MCP', `Disconnected from ${connection.name}`, { connectionId });
    }
  }
}

// Neo4j Service
class Neo4jService {
  private config: Neo4jConnection;
  private errorHandler: ErrorHandlingService;
  
  constructor(config: Neo4jConnection, errorHandler: ErrorHandlingService) {
    this.config = config;
    this.errorHandler = errorHandler;
  }
  
  async connect(): Promise<void> {
    try {
      this.config.status = 'connecting';
      this.errorHandler.logInfo('Neo4j', 'Connecting to database', { uri: this.config.uri });
      
      // Simulate connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.config.status = 'connected';
      this.config.version = '5.15.0';
      this.config.connectionPool = { active: 2, idle: 3, max: 10 };
      
      this.errorHandler.logInfo('Neo4j', 'Successfully connected to database', {
        version: this.config.version,
        database: this.config.database
      });
    } catch (error) {
      this.config.status = 'error';
      this.errorHandler.logError('Neo4j', 'Failed to connect to database', error as Error, this.config);
      throw error;
    }
  }
  
  async savePrompt(promptData: any): Promise<string> {
    if (this.config.status !== 'connected') {
      await this.connect();
    }
    
    try {
      const query = `
        CREATE (p:Prompt {
          id: $id,
          domain: $domain,
          goal: $goal,
          promptType: $promptType,
          systemPrompt: $systemPrompt,
          userPrompt: $userPrompt,
          timestamp: $timestamp,
          metadata: $metadata
        })
        RETURN p.id as id
      `;
      
      this.errorHandler.logInfo('Neo4j', 'Saving prompt to database', { promptId: promptData.id });
      
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 300));
      this.config.lastQuery = new Date().toISOString();
      
      this.errorHandler.logInfo('Neo4j', 'Prompt saved successfully', { promptId: promptData.id });
      return promptData.id;
    } catch (error) {
      this.errorHandler.logError('Neo4j', 'Failed to save prompt', error as Error, { promptData });
      throw error;
    }
  }
  
  async getPrompts(filters?: any): Promise<any[]> {
    if (this.config.status !== 'connected') {
      await this.connect();
    }
    
    try {
      this.errorHandler.logInfo('Neo4j', 'Fetching prompts from database', filters);
      
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 200));
      this.config.lastQuery = new Date().toISOString();
      
      const mockPrompts = [
        {
          id: 'prompt_1',
          domain: 'Banking',
          goal: 'Risk assessment analysis',
          promptType: 'chain-of-thought',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'prompt_2',
          domain: 'Healthcare',
          goal: 'Patient diagnosis support',
          promptType: 'rag',
          timestamp: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      
      this.errorHandler.logInfo('Neo4j', 'Successfully fetched prompts', { count: mockPrompts.length });
      return mockPrompts;
    } catch (error) {
      this.errorHandler.logError('Neo4j', 'Failed to fetch prompts', error as Error, filters);
      throw error;
    }
  }
  
  getStatus(): Neo4jConnection {
    return { ...this.config };
  }
}

// GitHub Service
class GitHubService {
  private config: GitHubIntegration;
  private errorHandler: ErrorHandlingService;
  
  constructor(config: GitHubIntegration, errorHandler: ErrorHandlingService) {
    this.config = config;
    this.errorHandler = errorHandler;
  }
  
  async connect(): Promise<void> {
    try {
      this.config.status = 'connecting';
      this.errorHandler.logInfo('GitHub', 'Connecting to GitHub API', { 
        username: this.config.username,
        repository: this.config.repository
      });
      
      // Simulate GitHub API connection
      await new Promise(resolve => setTimeout(resolve, 800));
      
      this.config.status = 'connected';
      this.config.permissions = ['read', 'write', 'admin'];
      this.config.lastSync = new Date().toISOString();
      
      this.errorHandler.logInfo('GitHub', 'Successfully connected to GitHub', {
        permissions: this.config.permissions
      });
    } catch (error) {
      this.config.status = 'error';
      this.errorHandler.logError('GitHub', 'Failed to connect to GitHub', error as Error, this.config);
      throw error;
    }
  }
  
  async savePromptToRepo(promptData: any, path: string): Promise<void> {
    if (this.config.status !== 'connected') {
      await this.connect();
    }
    
    try {
      this.errorHandler.logInfo('GitHub', 'Saving prompt to repository', { 
        path,
        promptId: promptData.id
      });
      
      // Simulate GitHub API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.config.lastSync = new Date().toISOString();
      this.errorHandler.logInfo('GitHub', 'Prompt saved to repository successfully', { path });
    } catch (error) {
      this.errorHandler.logError('GitHub', 'Failed to save prompt to repository', error as Error, { 
        path,
        promptData
      });
      throw error;
    }
  }
  
  async getRepositoryInfo(): Promise<any> {
    if (this.config.status !== 'connected') {
      await this.connect();
    }
    
    try {
      // Simulate GitHub API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        name: this.config.repository,
        fullName: `${this.config.username}/${this.config.repository}`,
        branch: this.config.branch,
        lastCommit: new Date().toISOString(),
        size: '2.5 MB',
        files: 142
      };
    } catch (error) {
      this.errorHandler.logError('GitHub', 'Failed to get repository info', error as Error);
      throw error;
    }
  }
  
  getStatus(): GitHubIntegration {
    return { ...this.config };
  }
}

// Google Services
class GoogleService {
  private config: GoogleServicesConfig;
  private errorHandler: ErrorHandlingService;
  
  constructor(config: GoogleServicesConfig, errorHandler: ErrorHandlingService) {
    this.config = config;
    this.errorHandler = errorHandler;
  }
  
  async connect(): Promise<void> {
    try {
      this.config.status = 'connecting';
      this.errorHandler.logInfo('Google', 'Connecting to Google services');
      
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      this.config.status = 'connected';
      this.config.accessToken = 'mock_access_token_' + Date.now();
      this.config.quotaUsage = {
        drive: 45,
        sheets: 23,
        gmail: 67,
        cloud: 12
      };
      
      this.errorHandler.logInfo('Google', 'Successfully connected to Google services', {
        enabledServices: Object.entries(this.config.services)
          .filter(([_, enabled]) => enabled)
          .map(([service]) => service)
      });
    } catch (error) {
      this.config.status = 'error';
      this.errorHandler.logError('Google', 'Failed to connect to Google services', error as Error);
      throw error;
    }
  }
  
  async saveToGoogleSheets(promptData: any, spreadsheetId: string): Promise<void> {
    if (this.config.status !== 'connected') {
      await this.connect();
    }
    
    try {
      this.errorHandler.logInfo('Google Sheets', 'Saving prompt to spreadsheet', { 
        spreadsheetId,
        promptId: promptData.id
      });
      
      // Simulate Sheets API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      this.errorHandler.logInfo('Google Sheets', 'Prompt saved to spreadsheet successfully');
    } catch (error) {
      this.errorHandler.logError('Google Sheets', 'Failed to save to spreadsheet', error as Error, {
        spreadsheetId,
        promptData
      });
      throw error;
    }
  }
  
  async saveToGoogleDrive(promptData: any, folderId?: string): Promise<string> {
    if (this.config.status !== 'connected') {
      await this.connect();
    }
    
    try {
      this.errorHandler.logInfo('Google Drive', 'Saving prompt to Drive', { 
        folderId,
        promptId: promptData.id
      });
      
      // Simulate Drive API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const fileId = 'drive_file_' + Date.now();
      this.errorHandler.logInfo('Google Drive', 'Prompt saved to Drive successfully', { fileId });
      return fileId;
    } catch (error) {
      this.errorHandler.logError('Google Drive', 'Failed to save to Drive', error as Error, {
        folderId,
        promptData
      });
      throw error;
    }
  }
  
  getStatus(): GoogleServicesConfig {
    return { ...this.config };
  }
}

// Connection Health Monitor
class HealthMonitor {
  private errorHandler: ErrorHandlingService;
  private healthStatus: ConnectionHealth = {
    neo4j: { status: 'disconnected' },
    github: { status: 'disconnected' },
    google: { status: 'disconnected' },
    mcp: { status: 'disconnected' }
  };
  
  constructor(errorHandler: ErrorHandlingService) {
    this.errorHandler = errorHandler;
  }
  
  async checkAllConnections(services: {
    neo4j?: Neo4jService;
    github?: GitHubService;
    google?: GoogleService;
    mcp?: MCPService;
  }): Promise<ConnectionHealth> {
    this.errorHandler.logInfo('HealthMonitor', 'Starting health check for all services');
    
    try {
      // Check Neo4j
      if (services.neo4j) {
        const neo4jStatus = services.neo4j.getStatus();
        this.healthStatus.neo4j = {
          status: neo4jStatus.status,
          latency: Math.random() * 100 + 50,
          error: neo4jStatus.status === 'error' ? 'Connection failed' : undefined
        };
      }
      
      // Check GitHub
      if (services.github) {
        const githubStatus = services.github.getStatus();
        this.healthStatus.github = {
          status: githubStatus.status,
          rateLimit: Math.floor(Math.random() * 5000) + 1000,
          error: githubStatus.status === 'error' ? 'API error' : undefined
        };
      }
      
      // Check Google
      if (services.google) {
        const googleStatus = services.google.getStatus();
        this.healthStatus.google = {
          status: googleStatus.status,
          quotaRemaining: Math.floor(Math.random() * 10000) + 5000,
          error: googleStatus.status === 'error' ? 'Auth error' : undefined
        };
      }
      
      // Check MCP
      if (services.mcp) {
        const mcpConnections = services.mcp.getConnections();
        this.healthStatus.mcp = {
          status: mcpConnections.length > 0 ? 'connected' : 'disconnected',
          activeConnections: mcpConnections.filter(c => c.status === 'connected').length
        };
      }
      
      this.errorHandler.logInfo('HealthMonitor', 'Health check completed', this.healthStatus);
      return this.healthStatus;
    } catch (error) {
      this.errorHandler.logError('HealthMonitor', 'Health check failed', error as Error);
      throw error;
    }
  }
  
  getHealth(): ConnectionHealth {
    return { ...this.healthStatus };
  }
}

// Main Component
const PromptCraftPlatform: React.FC = () => {
  // Enhanced state management
  const [activeTab, setActiveTab] = useState<string>('prompts');
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [connectionHealth, setConnectionHealth] = useState<ConnectionHealth | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Service instances
  const errorHandlerRef = useRef<ErrorHandlingService>(new ErrorHandlingService());
  const [neo4jService, setNeo4jService] = useState<Neo4jService | null>(null);
  const [githubService, setGithubService] = useState<GitHubService | null>(null);
  const [googleService, setGoogleService] = useState<GoogleService | null>(null);
  const [mcpService, setMcpService] = useState<MCPService | null>(null);
  const [healthMonitor, setHealthMonitor] = useState<HealthMonitor | null>(null);
  
  // Configuration states
  const [neo4jConfig, setNeo4jConfig] = useState<Neo4jConnection>({
    uri: 'bolt://10.100.15.67:7687',
    username: 'neo4j',
    password: 'MIT@2025',
    database: 'neo4j',
    status: 'disconnected'
  });
  
  const [githubConfig, setGithubConfig] = useState<GitHubIntegration>({
    id: 'github_main',
    username: '',
    repository: 'promptcraft-prompts',
    branch: 'main',
    accessToken: '',
    status: 'disconnected',
    permissions: []
  });
  
  const [googleConfig, setGoogleConfig] = useState<GoogleServicesConfig>({
    clientId: '',
    clientSecret: '',
    refreshToken: '',
    services: {
      drive: true,
      sheets: true,
      gmail: false,
      cloud: false
    },
    status: 'disconnected'
  });
  
  const [mcpConnections, setMcpConnections] = useState<MCPConnection[]>([]);
  
  // Original prompt craft states
  const [selectedDomain, setSelectedDomain] = useState<string>('Banking');
  const [selectedModel, setSelectedModel] = useState<string>('phi-3-local');
  const [userGoal, setUserGoal] = useState<string>('');
  const [promptType, setPromptType] = useState<string>('');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [promptCraftJson, setPromptCraftJson] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  // Initialize services
  useEffect(() => {
    const errorHandler = errorHandlerRef.current;
    
    // Subscribe to error logs
    const unsubscribe = errorHandler.subscribe(setErrorLogs);
    
    // Initialize services
    const neo4j = new Neo4jService(neo4jConfig, errorHandler);
    const github = new GitHubService(githubConfig, errorHandler);
    const google = new GoogleService(googleConfig, errorHandler);
    const mcp = new MCPService(errorHandler);
    const health = new HealthMonitor(errorHandler);
    
    setNeo4jService(neo4j);
    setGithubService(github);
    setGoogleService(google);
    setMcpService(mcp);
    setHealthMonitor(health);
    
    errorHandler.logInfo('System', 'PromptCraft Platform initialized');
    
    return unsubscribe;
  }, []);
  
  // Enhanced connection management
  const connectAllServices = async () => {
    if (!neo4jService || !githubService || !googleService || !mcpService || !healthMonitor) {
      setStatusMessage('❌ Services not initialized');
      return;
    }
    
    setIsConnecting(true);
    setStatusMessage('🔄 Connecting to all services...');
    
    try {
      // Connect to Neo4j
      if (neo4jConfig.uri && neo4jConfig.username && neo4jConfig.password) {
        await neo4jService.connect();
      }
      
      // Connect to GitHub
      if (githubConfig.username && githubConfig.accessToken) {
        await githubService.connect();
      }
      
      // Connect to Google Services
      if (googleConfig.clientId && googleConfig.clientSecret) {
        await googleService.connect();
      }
      
      // Connect to MCP servers
      const mcpConfigs = [
        {
          name: 'Local Phi-3',
          protocol: 'sse' as const,
          endpoint: 'http://10.100.15.67:12139/mcp'
        },
        {
          name: 'DeepSeek Coder',
          protocol: 'websocket' as const,
          endpoint: 'ws://10.100.15.66:1138/mcp'
        }
      ];
      
      const connections = await Promise.allSettled(
        mcpConfigs.map(config => mcpService.connectToMCPServer(config))
      );
      
      const successfulConnections = connections
        .filter((result): result is PromiseFulfilledResult<MCPConnection> => result.status === 'fulfilled')
        .map(result => result.value);
      
      setMcpConnections(successfulConnections);
      
      // Update health status
      const health = await healthMonitor.checkAllConnections({
        neo4j: neo4jService,
        github: githubService,
        google: googleService,
        mcp: mcpService
      });
      
      setConnectionHealth(health);
      setStatusMessage('✅ All services connected successfully!');
      
    } catch (error) {
      errorHandlerRef.current.logError('System', 'Failed to connect services', error as Error);
      setStatusMessage('❌ Failed to connect some services');
    } finally {
      setIsConnecting(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };
  
  // Enhanced prompt generation with full integrations
  const generatePromptCraft = useCallback(async () => {
    if (!userGoal) {
      setStatusMessage('Please enter what you want to accomplish');
      return;
    }
    
    if (!selectedDomain) {
      setStatusMessage('Please select a domain');
      return;
    }
    
    setIsGenerating(true);
    setStatusMessage('🔄 Generating enhanced prompt...');
    
    try {
      errorHandlerRef.current.logInfo('PromptCraft', 'Starting prompt generation', {
        domain: selectedDomain,
        goal: userGoal,
        promptType
      });
      
      // Build dynamic prompt with integrations
      const buildEnhancedSystemPrompt = () => {
        let systemPrompt = `You are an expert AI assistant specialized in ${selectedDomain.toLowerCase()}`;
        
        // Add MCP capabilities if connected
        if (mcpConnections.length > 0) {
          systemPrompt += ` with access to Model Context Protocol (MCP) services for enhanced capabilities`;
        }
        
        // Add Neo4j context if connected
        if (neo4jService?.getStatus().status === 'connected') {
          systemPrompt += ` and connection to a Neo4j graph database for contextual knowledge`;
        }
        
        // Add integration-specific context
        if (variables.context) {
          systemPrompt += `\n\nContext: ${variables.context}`;
        }
        
        return systemPrompt + '. You have access to advanced capabilities through integrated services and can provide comprehensive, accurate responses.';
      };

      const buildEnhancedUserPrompt = () => {
        let prompt = `Task: ${userGoal}`;
        
        if (variables.input_data) {
          prompt += `\n\nInput Data:\n${variables.input_data}`;
        }
        
        if (variables.output_format) {
          prompt += `\n\nPlease provide your response in ${variables.output_format} format.`;
        }
        
        // Add prompt-type specific instructions
        const promptTypeInstructions = {
          'chain-of-thought': '\n\nPlease think through this step-by-step and show your reasoning process.',
          'summary': '\n\nPlease provide a concise summary with key insights and recommendations.',
          'data-mapping': '\n\nPlease analyze the data structure and provide transformation recommendations.',
          'sentiment-analysis': '\n\nPlease analyze the sentiment and emotional tone.',
          'recommendation': '\n\nPlease provide specific recommendations with clear justification.',
          'rag': '\n\nPlease provide comprehensive information based on your knowledge and available context.',
          'code-conversion': '\n\nPlease provide clean, well-documented code with explanations.'
        };
        
        if (promptType && promptTypeInstructions[promptType as keyof typeof promptTypeInstructions]) {
          prompt += promptTypeInstructions[promptType as keyof typeof promptTypeInstructions];
        }
        
        return prompt;
      };

      // Create enhanced prompt craft object
      const promptCraft = {
        id: `prompt_${Date.now()}`,
        timestamp: new Date().toISOString(),
        domain: selectedDomain,
        goal: userGoal,
        promptType: promptType || 'instruction-based',
        model: selectedModel,
        variables,
        prompt: {
          system: buildEnhancedSystemPrompt(),
          user: buildEnhancedUserPrompt(),
          context: {
            domain_expertise: selectedDomain,
            use_case: userGoal,
            integrations: {
              neo4j: neo4jService?.getStatus().status === 'connected',
              github: githubService?.getStatus().status === 'connected',
              google: googleService?.getStatus().status === 'connected',
              mcp: mcpConnections.filter(c => c.status === 'connected').length
            }
          }
        },
        metadata: {
          complexity_score: Math.min(10, 
            Math.floor(userGoal.length / 30) + 
            (variables.context ? 2 : 0) + 
            (variables.input_data ? 3 : 0) + 
            (variables.output_format ? 1 : 0) + 3
          ),
          estimated_tokens: Math.floor(
            (buildEnhancedSystemPrompt().length + buildEnhancedUserPrompt().length) / 4
          ),
          suggested_temperature: promptType === 'code-conversion' ? 0.3 : 0.7,
          max_tokens: variables.input_data ? 3000 : 2000,
          integrations_used: {
            neo4j: neo4jService?.getStatus().status === 'connected',
            github: githubService?.getStatus().status === 'connected',
            google: googleService?.getStatus().status === 'connected',
            mcp: mcpConnections.length
          }
        }
      };

      setPromptCraftJson(promptCraft);
      
      // Auto-save to connected services
      await savePromptToIntegrations(promptCraft);
      
      setStatusMessage('✅ Prompt generated and saved successfully!');
      errorHandlerRef.current.logInfo('PromptCraft', 'Prompt generated successfully', {
        promptId: promptCraft.id,
        complexity: promptCraft.metadata.complexity_score
      });
      
    } catch (error) {
      errorHandlerRef.current.logError('PromptCraft', 'Failed to generate prompt', error as Error);
      setStatusMessage('❌ Failed to generate prompt');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusMessage(''), 5000);
    }
  }, [userGoal, selectedDomain, promptType, selectedModel, variables, mcpConnections, neo4jService, githubService, googleService]);

  // Save prompt to all connected integrations
  const savePromptToIntegrations = async (promptData: any) => {
    const promises: Promise<any>[] = [];
    
    // Save to Neo4j
    if (neo4jService?.getStatus().status === 'connected') {
      promises.push(
        neo4jService.savePrompt(promptData).catch(error => 
          errorHandlerRef.current.logError('Neo4j', 'Failed to save prompt', error)
        )
      );
    }
    
    // Save to GitHub
    if (githubService?.getStatus().status === 'connected') {
      const path = `prompts/${promptData.domain.toLowerCase()}/${promptData.id}.json`;
      promises.push(
        githubService.savePromptToRepo(promptData, path).catch(error =>
          errorHandlerRef.current.logError('GitHub', 'Failed to save prompt', error)
        )
      );
    }
    
    // Save to Google Drive
    if (googleService?.getStatus().status === 'connected' && googleConfig.services.drive) {
      promises.push(
        googleService.saveToGoogleDrive(promptData).catch(error =>
          errorHandlerRef.current.logError('Google Drive', 'Failed to save prompt', error)
        )
      );
    }
    
    // Save to Google Sheets
    if (googleService?.getStatus().status === 'connected' && googleConfig.services.sheets) {
      promises.push(
        googleService.saveToGoogleSheets(promptData, 'default_spreadsheet').catch(error =>
          errorHandlerRef.current.logError('Google Sheets', 'Failed to save prompt', error)
        )
      );
    }
    
    await Promise.allSettled(promises);
  };

  // Enhanced MCP integration
  const sendMCPRequest = async (method: string, params?: any) => {
    if (!mcpService || mcpConnections.length === 0) {
      setStatusMessage('❌ No MCP connections available');
      return;
    }
    
    try {
      const activeConnection = mcpConnections.find(c => c.status === 'connected');
      if (!activeConnection) {
        throw new Error('No active MCP connections');
      }
      
      setStatusMessage('🔄 Sending MCP request...');
      const response = await mcpService.sendMCPRequest(activeConnection.id, method, params);
      
      setStatusMessage('✅ MCP request successful');
      errorHandlerRef.current.logInfo('MCP', 'Request completed successfully', { method, response });
      
      return response;
    } catch (error) {
      errorHandlerRef.current.logError('MCP', 'MCP request failed', error as Error, { method, params });
      setStatusMessage('❌ MCP request failed');
      throw error;
    } finally {
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Load prompts from Neo4j
  const loadPromptsFromNeo4j = async () => {
    if (!neo4jService || neo4jService.getStatus().status !== 'connected') {
      setStatusMessage('❌ Neo4j not connected');
      return [];
    }
    
    try {
      setStatusMessage('🔄 Loading prompts from Neo4j...');
      const prompts = await neo4jService.getPrompts();
      setStatusMessage(`✅ Loaded ${prompts.length} prompts from Neo4j`);
      return prompts;
    } catch (error) {
      errorHandlerRef.current.logError('Neo4j', 'Failed to load prompts', error as Error);
      setStatusMessage('❌ Failed to load prompts from Neo4j');
      return [];
    } finally {
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // GitHub repository management
  const syncWithGitHub = async () => {
    if (!githubService || githubService.getStatus().status !== 'connected') {
      setStatusMessage('❌ GitHub not connected');
      return;
    }
    
    try {
      setStatusMessage('🔄 Syncing with GitHub...');
      const repoInfo = await githubService.getRepositoryInfo();
      setStatusMessage(`✅ Synced with ${repoInfo.fullName}`);
      errorHandlerRef.current.logInfo('GitHub', 'Repository sync completed', repoInfo);
    } catch (error) {
      errorHandlerRef.current.logError('GitHub', 'Failed to sync with repository', error as Error);
      setStatusMessage('❌ Failed to sync with GitHub');
    } finally {
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Health check functionality
  const performHealthCheck = async () => {
    if (!healthMonitor) {
      setStatusMessage('❌ Health monitor not available');
      return;
    }
    
    try {
      setStatusMessage('🔄 Performing health check...');
      const health = await healthMonitor.checkAllConnections({
        neo4j: neo4jService,
        github: githubService,
        google: googleService,
        mcp: mcpService
      });
      
      setConnectionHealth(health);
      
      const healthyServices = Object.values(health).filter(service => service.status === 'connected').length;
      const totalServices = Object.keys(health).length;
      
      setStatusMessage(`✅ Health check complete: ${healthyServices}/${totalServices} services healthy`);
    } catch (error) {
      errorHandlerRef.current.logError('HealthMonitor', 'Health check failed', error as Error);
      setStatusMessage('❌ Health check failed');
    } finally {
      setTimeout(() => setStatusMessage(''), 5000);
    }
  };

  // Error management
  const clearErrorLogs = () => {
    errorHandlerRef.current.clearErrors();
    setStatusMessage('✅ Error logs cleared');
    setTimeout(() => setStatusMessage(''), 2000);
  };

  // Render connection status badge
  const ConnectionBadge: React.FC<{ status: string; label: string }> = ({ status, label }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'connected': return 'bg-green-500 text-white';
        case 'connecting': return 'bg-yellow-500 text-white';
        case 'error': return 'bg-red-500 text-white';
        default: return 'bg-gray-500 text-white';
      }
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
        {label}: {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced Header with Connection Status */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">PromptCraft Enterprise Platform</h1>
                <p className="text-purple-300 text-sm">Full Integration: Neo4j • GitHub • Google • MCP Protocol</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status Indicators */}
              <div className="flex flex-wrap gap-2">
                <ConnectionBadge 
                  status={neo4jService?.getStatus().status || 'disconnected'} 
                  label="Neo4j" 
                />
                <ConnectionBadge 
                  status={githubService?.getStatus().status || 'disconnected'} 
                  label="GitHub" 
                />
                <ConnectionBadge 
                  status={googleService?.getStatus().status || 'disconnected'} 
                  label="Google" 
                />
                <ConnectionBadge 
                  status={mcpConnections.some(c => c.status === 'connected') ? 'connected' : 'disconnected'} 
                  label={`MCP (${mcpConnections.filter(c => c.status === 'connected').length})`}
                />
              </div>
              
              <button 
                onClick={connectAllServices}
                disabled={isConnecting}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 mr-2" />
                    Connect All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation with Integration Status */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex space-x-1 bg-black/20 backdrop-blur-lg rounded-xl p-1 mb-8">
          {[
            { id: 'prompts', label: 'Craft Prompts', icon: Sparkles },
            { id: 'integrations', label: 'Integrations', icon: Network },
            { id: 'mcp', label: 'MCP Protocol', icon: Server },
            { id: 'github', label: 'GitHub Sync', icon: GitBranch },
            { id: 'database', label: 'Neo4j Graph', icon: Database },
            { id: 'monitoring', label: 'System Health', icon: Activity },
            { id: 'logs', label: 'Error Logs', icon: AlertCircle }
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

        {/* Status Message Display */}
        {statusMessage && (
          <div className={`border rounded-lg p-4 mb-6 flex items-center justify-between backdrop-blur-sm ${
            statusMessage.includes('✅') 
              ? 'bg-green-500/20 border-green-500/30' 
              : statusMessage.includes('❌')
              ? 'bg-red-500/20 border-red-500/30'
              : 'bg-blue-500/20 border-blue-500/30'
          }`}>
            <div className="flex items-center space-x-3">
              {statusMessage.includes('✅') ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : statusMessage.includes('❌') ? (
                <AlertCircle className="w-5 h-5 text-red-400" />
              ) : (
                <Clock className="w-5 h-5 text-blue-400" />
              )}
              <p className={
                statusMessage.includes('✅') ? 'text-green-300' : 
                statusMessage.includes('❌') ? 'text-red-300' : 'text-blue-300'
              }>
                {statusMessage}
              </p>
            </div>
            <button 
              onClick={() => setStatusMessage('')} 
              className="text-white/60 hover:text-white/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Sections */}
        <div className="space-y-6">
          {/* Prompts Tab - Enhanced with Integrations */}
          {activeTab === 'prompts' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Domain Selection */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2" />
                    Domain & Use Case Selection
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { name: 'Banking', icon: '🏦', useCases: ['Risk Assessment', 'Fraud Detection', 'Compliance'] },
                      { name: 'Healthcare', icon: '🏥', useCases: ['Diagnosis Support', 'Research', 'Patient Care'] },
                      { name: 'Technology', icon: '💻', useCases: ['Code Review', 'Architecture', 'DevOps'] },
                      { name: 'Research', icon: '🔬', useCases: ['Data Analysis', 'Literature Review', 'Insights'] }
                    ].map(domain => (
                      <button
                        key={domain.name}
                        onClick={() => setSelectedDomain(domain.name)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          selectedDomain === domain.name
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                        }`}
                      >
                        <div className="text-2xl mb-2">{domain.icon}</div>
                        <div className="font-medium text-sm">{domain.name}</div>
                      </button>
                    ))}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      What specific task do you want to accomplish?
                    </label>
                    <textarea
                      value={userGoal}
                      onChange={(e) => setUserGoal(e.target.value)}
                      placeholder="e.g., Create a comprehensive risk assessment framework with real-time monitoring and automated alerts"
                      className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500/50 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Enhanced Configuration with Integration Options */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Advanced Configuration & Integration Context
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Context & Background
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Enterprise environment with regulatory compliance requirements and real-time data processing"
                        value={variables.context || ''}
                        onChange={(e) => setVariables({ ...variables, context: e.target.value })}
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Input Data / Sample
                      </label>
                      <textarea
                        placeholder="Paste sample data, code, database schemas, or specific input that the AI should work with..."
                        value={variables.input_data || ''}
                        onChange={(e) => setVariables({ ...variables, input_data: e.target.value })}
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500/50 resize-none"
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                          Output Format
                        </label>
                        <select
                          value={variables.output_format || ''}
                          onChange={(e) => setVariables({ ...variables, output_format: e.target.value })}
                          className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
                        >
                          <option value="">Select format...</option>
                          <option value="json">JSON</option>
                          <option value="markdown">Markdown</option>
                          <option value="csv">CSV</option>
                          <option value="code">Code</option>
                          <option value="sql">SQL Query</option>
                          <option value="cypher">Cypher Query</option>
                          <option value="report">Business Report</option>
                          <option value="api_spec">API Specification</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                          Prompt Strategy
                        </label>
                        <select
                          value={promptType}
                          onChange={(e) => setPromptType(e.target.value)}
                          className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500/50"
                        >
                          <option value="">Select strategy...</option>
                          <option value="instruction-based">Instruction-Based</option>
                          <option value="chain-of-thought">Chain-of-Thought</option>
                          <option value="rag">RAG Generation</option>
                          <option value="code-conversion">Code Conversion</option>
                          <option value="data-mapping">Data Mapping</option>
                          <option value="sentiment-analysis">Sentiment Analysis</option>
                          <option value="recommendation">Recommendation</option>
                        </select>
                      </div>
                    </div>

                    {/* Integration-specific options */}
                    <div className="border-t border-purple-500/20 pt-4">
                      <h3 className="text-lg font-medium text-white mb-3">Integration Enhancement Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={variables.use_neo4j === 'true'}
                            onChange={(e) => setVariables({ 
                              ...variables, 
                              use_neo4j: e.target.checked ? 'true' : 'false' 
                            })}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="text-white text-sm">Enhance with Neo4j graph context</span>
                        </label>
                        
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={variables.use_mcp === 'true'}
                            onChange={(e) => setVariables({ 
                              ...variables, 
                              use_mcp: e.target.checked ? 'true' : 'false' 
                            })}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="text-white text-sm">Use MCP protocol capabilities</span>
                        </label>
                        
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={variables.auto_save === 'true'}
                            onChange={(e) => setVariables({ 
                              ...variables, 
                              auto_save: e.target.checked ? 'true' : 'false' 
                            })}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="text-white text-sm">Auto-save to all integrations</span>
                        </label>
                        
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={variables.version_control === 'true'}
                            onChange={(e) => setVariables({ 
                              ...variables, 
                              version_control: e.target.checked ? 'true' : 'false' 
                            })}
                            className="w-4 h-4 text-purple-600 rounded"
                          />
                          <span className="text-white text-sm">Enable version control</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Enhanced Generation Panel */}
              <div className="space-y-6">
                {/* Model Selection with MCP Status */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <Cpu className="w-5 h-5 mr-2" />
                    Local LLM & MCP Integration
                  </h2>
                  
                  <div className="space-y-3">
                    {initialLlmModels.map(model => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          selectedModel === model.id
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-slate-600 bg-white/5 hover:border-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{model.icon}</span>
                            <span className="font-medium text-white text-sm">{model.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${model.status === 'connected' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                            {model.mcpEnabled && (
                              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">MCP</span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-slate-400 mb-2">{model.provider}</div>
                        <div className="text-xs text-slate-300">{model.purpose}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhanced Generation Panel */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white">Generate Enhanced Prompt</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={loadPromptsFromNeo4j}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center"
                      >
                        <Database className="w-4 h-4 mr-1" />
                        Load
                      </button>
                      <button
                        onClick={performHealthCheck}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm flex items-center"
                      >
                        <Activity className="w-4 h-4 mr-1" />
                        Health
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={generatePromptCraft}
                    disabled={!userGoal || !selectedDomain || isGenerating}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium py-4 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center mb-4"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Generating Enhanced Prompt...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate with Integrations
                      </>
                    )}
                  </button>

                  {(!userGoal || !selectedDomain) && (
                    <p className="text-sm text-slate-400 text-center">
                      Complete the configuration to generate enhanced prompts
                    </p>
                  )}

                  {/* Integration Status Summary */}
                  <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                    <h3 className="text-white font-medium mb-2">Active Integrations</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Neo4j Graph DB:</span>
                        <span className={neo4jService?.getStatus().status === 'connected' ? 'text-green-400' : 'text-red-400'}>
                          {neo4jService?.getStatus().status || 'disconnected'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">GitHub Repository:</span>
                        <span className={githubService?.getStatus().status === 'connected' ? 'text-green-400' : 'text-red-400'}>
                          {githubService?.getStatus().status || 'disconnected'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Google Services:</span>
                        <span className={googleService?.getStatus().status === 'connected' ? 'text-green-400' : 'text-red-400'}>
                          {googleService?.getStatus().status || 'disconnected'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">MCP Connections:</span>
                        <span className={mcpConnections.filter(c => c.status === 'connected').length > 0 ? 'text-green-400' : 'text-red-400'}>
                          {mcpConnections.filter(c => c.status === 'connected').length} active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Generated Prompt Display with Enhanced Features */}
          {activeTab === 'prompts' && promptCraftJson && (
            <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Enhanced PromptCraft with Integrations
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                    onClick={() => {
                      const dataStr = JSON.stringify(promptCraftJson, null, 2);
                      const dataBlob = new Blob([dataStr], {type: 'application/json'});
                      const url = URL.createObjectURL(dataBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `enhanced_prompt_${promptCraftJson.domain.toLowerCase()}_${Date.now()}.json`;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export Enhanced JSON
                  </button>
                  
                  <button 
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                    onClick={syncWithGitHub}
                  >
                    <GitBranch className="w-4 h-4 mr-1" />
                    Sync to GitHub
                  </button>
                  
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center"
                    onClick={() => sendMCPRequest('prompts/test', { promptId: promptCraftJson.id })}
                  >
                    <Server className="w-4 h-4 mr-1" />
                    Test via MCP
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-white mb-2">Enhanced System Prompt</h3>
                  <div className="bg-slate-800 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                      {promptCraftJson.prompt.system}
                    </pre>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">Enhanced User Prompt</h3>
                  <div className="bg-slate-800 p-4 rounded-lg max-h-64 overflow-y-auto">
                    <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                      {promptCraftJson.prompt.user}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Enhanced Metadata Display */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Complexity</div>
                  <div className="text-xl font-bold text-white">{promptCraftJson.metadata.complexity_score}/10</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Est. Tokens</div>
                  <div className="text-xl font-bold text-white">{promptCraftJson.metadata.estimated_tokens}</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Integrations</div>
                  <div className="text-xl font-bold text-green-400">
                    {Object.values(promptCraftJson.metadata.integrations_used).filter(Boolean).length}
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">MCP Ready</div>
                  <div className="text-xl font-bold text-blue-400">
                    {promptCraftJson.metadata.integrations_used.mcp > 0 ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-sm text-slate-400">Auto-Saved</div>
                  <div className="text-xl font-bold text-purple-400">
                    {variables.auto_save === 'true' ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Configuration Tab */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">Service Integrations Configuration</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Neo4j Configuration */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Neo4j Graph Database
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      neo4jService?.getStatus().status === 'connected' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {neo4jService?.getStatus().status || 'disconnected'}
                    </span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">Connection URI</label>
                      <input
                        type="text"
                        value={neo4jConfig.uri}
                        onChange={(e) => setNeo4jConfig({...neo4jConfig, uri: e.target.value})}
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                        placeholder="bolt://localhost:7687"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-purple-300 mb-2">Username</label>
                        <input
                          type="text"
                          value={neo4jConfig.username}
                          onChange={(e) => setNeo4jConfig({...neo4jConfig, username: e.target.value})}
                          className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-purple-300 mb-2">Password</label>
                        <input
                          type="password"
                          value={neo4jConfig.password}
                          onChange={(e) => setNeo4jConfig({...neo4jConfig, password: e.target.value})}
                          className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">Database</label>
                      <input
                        type="text"
                        value={neo4jConfig.database}
                        onChange={(e) => setNeo4jConfig({...neo4jConfig, database: e.target.value})}
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                        placeholder="neo4j"
                      />
                    </div>
                    
                    <button
                      onClick={() => neo4jService?.connect()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                    >
                      Test Neo4j Connection
                    </button>
                  </div>
                </div>

                {/* GitHub Configuration */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <GitBranch className="w-5 h-5 mr-2" />
                    GitHub Integration
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      githubService?.getStatus().status === 'connected' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {githubService?.getStatus().status || 'disconnected'}
                    </span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">Username</label>
                      <input
                        type="text"
                        value={githubConfig.username}
                        onChange={(e) => setGithubConfig({...githubConfig, username: e.target.value})}
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                        placeholder="your-github-username"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">Repository</label>
                      <input
                        type="text"
                        value={githubConfig.repository}
                        onChange={(e) => setGithubConfig({...githubConfig, repository: e.target.value})}
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                        placeholder="promptcraft-prompts"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">Access Token</label>
                      <input
                        type="password"
                        value={githubConfig.accessToken}
                        onChange={(e) => setGithubConfig({...githubConfig, accessToken: e.target.value})}
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                        placeholder="ghp_xxxxxxxxxxxx"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">Branch</label>
                      <input
                        type="text"
                        value={githubConfig.branch}
                        onChange={(e) => setGithubConfig({...githubConfig, branch: e.target.value})}
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                        placeholder="main"
                      />
                    </div>
                    
                    <button
                      onClick={() => githubService?.connect()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                    >
                      Test GitHub Connection
                    </button>
                  </div>
                </div>

                {/* Google Services Configuration */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Cloud className="w-5 h-5 mr-2" />
                    Google Services
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      googleService?.getStatus().status === 'connected' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {googleService?.getStatus().status || 'disconnected'}
                    </span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">Client ID</label>
                      <input
                        type="text"
                        value={googleConfig.clientId}
                        onChange={(e) => setGoogleConfig({...googleConfig, clientId: e.target.value})}
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                        placeholder="your-client-id.googleusercontent.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">Client Secret</label>
                      <input
                        type="password"
                        value={googleConfig.clientSecret}
                        onChange={(e) => setGoogleConfig({...googleConfig, clientSecret: e.target.value})}
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">Enabled Services</label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(googleConfig.services).map(([service, enabled]) => (
                          <label key={service} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={enabled}
                              onChange={(e) => setGoogleConfig({
                                ...googleConfig,
                                services: {...googleConfig.services, [service]: e.target.checked}
                              })}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                            <span className="text-white text-sm capitalize">{service}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => googleService?.connect()}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                    >
                      Connect Google Services
                    </button>
                  </div>
                </div>

                {/* MCP Connections Status */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Server className="w-5 h-5 mr-2" />
                    MCP Protocol Connections
                    <span className="ml-2 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">
                      {mcpConnections.filter(c => c.status === 'connected').length} active
                    </span>
                  </h3>
                  
                  <div className="space-y-3">
                    {mcpConnections.length === 0 ? (
                      <p className="text-slate-400 text-sm">No MCP connections established</p>
                    ) : (
                      mcpConnections.map(connection => (
                        <div key={connection.id} className="bg-slate-800/50 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{connection.name}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              connection.status === 'connected' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {connection.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            Protocol: {connection.protocol} | Endpoint: {connection.endpoint}
                          </div>
                          <div className="text-xs text-slate-300 mt-1">
                            Capabilities: {connection.capabilities.join(', ')}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      // Auto-initialize MCP connections
                      const mcpConfigs = [
                        { name: 'Local Phi-3', protocol: 'sse' as const, endpoint: 'http://10.100.15.67:12139/mcp' },
                        { name: 'DeepSeek Coder', protocol: 'websocket' as const, endpoint: 'ws://10.100.15.66:1138/mcp' }
                      ];
                      
                      Promise.allSettled(
                        mcpConfigs.map(config => mcpService?.connectToMCPServer(config))
                      ).then(results => {
                        const successful = results
                          .filter((result): result is PromiseFulfilledResult<MCPConnection> => result.status === 'fulfilled')
                          .map(result => result.value);
                        setMcpConnections(successful);
                      });
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mt-4"
                  >
                    Initialize MCP Connections
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MCP Protocol Tab */}
          {activeTab === 'mcp' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">Model Context Protocol (MCP) Management</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* MCP Server Management */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">MCP Server Connections</h3>
                  
                  <div className="space-y-4">
                    {mcpConnections.map(connection => (
                      <div key={connection.id} className="bg-slate-800/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-white font-medium">{connection.name}</h4>
                            <p className="text-slate-400 text-sm">{connection.endpoint}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              connection.status === 'connected' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {connection.status}
                            </span>
                            <button
                              onClick={() => mcpService?.disconnect(connection.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-slate-400">Protocol</div>
                            <div className="text-white uppercase">{connection.protocol}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Capabilities</div>
                            <div className="text-white">{connection.capabilities.length}</div>
                          </div>
                          <div>
                            <div className="text-slate-400">Last Heartbeat</div>
                            <div className="text-white">
                              {connection.lastHeartbeat ? new Date(connection.lastHeartbeat).toLocaleTimeString() : 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <div className="text-slate-400 text-xs mb-1">Available Capabilities:</div>
                          <div className="flex flex-wrap gap-1">
                            {connection.capabilities.map(capability => (
                              <span key={capability} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                                {capability}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {mcpConnections.length === 0 && (
                      <div className="text-center text-slate-400 py-8">
                        <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No MCP connections established</p>
                        <p className="text-sm">Click "Initialize MCP Connections" in the Integrations tab</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* MCP Request Testing */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">MCP Request Testing</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">Method</label>
                      <select className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-2 text-white">
                        <option value="prompts/list">prompts/list</option>
                        <option value="prompts/get">prompts/get</option>
                        <option value="resources/list">resources/list</option>
                        <option value="resources/read">resources/read</option>
                        <option value="tools/list">tools/list</option>
                        <option value="tools/call">tools/call</option>
                        <option value="logging/setLevel">logging/setLevel</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">Parameters (JSON)</label>
                      <textarea
                        className="w-full bg-white/5 border border-purple-500/20 rounded-lg px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:border-purple-500/50 resize-none"
                        rows={4}
                        placeholder='{"name": "example", "value": "test"}'
                      />
                    </div>
                    
                    <button
                      onClick={() => sendMCPRequest('prompts/list')}
                      disabled={mcpConnections.filter(c => c.status === 'connected').length === 0}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send MCP Request
                    </button>
                    
                    {mcpConnections.filter(c => c.status === 'connected').length === 0 && (
                      <p className="text-sm text-slate-400 text-center">
                        Connect to an MCP server to test requests
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GitHub Tab */}
          {activeTab === 'github' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">GitHub Repository Management</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Repository Status */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <GitBranch className="w-5 h-5 mr-2" />
                    Repository Status
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      githubService?.getStatus().status === 'connected' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {githubService?.getStatus().status || 'disconnected'}
                    </span>
                  </h3>
                  
                  {githubService?.getStatus().status === 'connected' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400">Repository</div>
                          <div className="text-white">{githubConfig.username}/{githubConfig.repository}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Branch</div>
                          <div className="text-white">{githubConfig.branch}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Last Sync</div>
                          <div className="text-white">
                            {githubConfig.lastSync ? new Date(githubConfig.lastSync).toLocaleString() : 'Never'}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-400">Permissions</div>
                          <div className="text-white">{githubConfig.permissions.join(', ')}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <button
                          onClick={syncWithGitHub}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Sync Repository
                        </button>
                        
                        <button
                          onClick={() => {
                            if (promptCraftJson) {
                              const path = `prompts/${promptCraftJson.domain.toLowerCase()}/${promptCraftJson.id}.json`;
                              githubService?.savePromptToRepo(promptCraftJson, path);
                            }
                          }}
                          disabled={!promptCraftJson}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Save Current Prompt to GitHub
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 py-8">
                      <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>GitHub not connected</p>
                      <p className="text-sm">Configure GitHub in the Integrations tab</p>
                    </div>
                  )}
                </div>

                {/* Repository Files */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Repository Structure</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <FileText className="w-4 h-4" />
                      <span>README.md</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <FileText className="w-4 h-4" />
                      <span>prompts/</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300 ml-4">
                      <FileText className="w-4 h-4" />
                      <span>banking/</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300 ml-4">
                      <FileText className="w-4 h-4" />
                      <span>healthcare/</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300 ml-4">
                      <FileText className="w-4 h-4" />
                      <span>technology/</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <FileText className="w-4 h-4" />
                      <span>schemas/</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-300">
                      <FileText className="w-4 h-4" />
                      <span>templates/</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-400 text-xs mb-1">Recent Commits</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-300">Added banking risk assessment</span>
                        <span className="text-slate-500">2 hours ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Updated healthcare templates</span>
                        <span className="text-slate-500">1 day ago</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Initial repository setup</span>
                        <span className="text-slate-500">3 days ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Neo4j Database Tab */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">Neo4j Graph Database Management</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Database Status */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Database Status
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      neo4jService?.getStatus().status === 'connected' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {neo4jService?.getStatus().status || 'disconnected'}
                    </span>
                  </h3>
                  
                  {neo4jService?.getStatus().status === 'connected' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-400">Database</div>
                          <div className="text-white">{neo4jConfig.database}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Version</div>
                          <div className="text-white">{neo4jService.getStatus().version || 'Unknown'}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">URI</div>
                          <div className="text-white">{neo4jConfig.uri}</div>
                        </div>
                        <div>
                          <div className="text-slate-400">Last Query</div>
                          <div className="text-white">
                            {neo4jService.getStatus().lastQuery ? new Date(neo4jService.getStatus().lastQuery!).toLocaleTimeString() : 'Never'}
                          </div>
                        </div>
                      </div>
                      
                      {neo4jService.getStatus().connectionPool && (
                        <div className="p-3 bg-slate-800/50 rounded-lg">
                          <div className="text-slate-400 text-xs mb-2">Connection Pool</div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-slate-400">Active</div>
                              <div className="text-white">{neo4jService.getStatus().connectionPool!.active}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Idle</div>
                              <div className="text-white">{neo4jService.getStatus().connectionPool!.idle}</div>
                            </div>
                            <div>
                              <div className="text-slate-400">Max</div>
                              <div className="text-white">{neo4jService.getStatus().connectionPool!.max}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <button
                          onClick={loadPromptsFromNeo4j}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Load Prompts from Graph
                        </button>
                        
                        <button
                          onClick={() => {
                            if (promptCraftJson) {
                              neo4jService?.savePrompt(promptCraftJson);
                            }
                          }}
                          disabled={!promptCraftJson}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
                        >
                          <Database className="w-4 h-4 mr-2" />
                          Save Current Prompt to Graph
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 py-8">
                      <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Neo4j not connected</p>
                      <p className="text-sm">Configure Neo4j in the Integrations tab</p>
                    </div>
                  )}
                </div>

                {/* Graph Schema */}
                <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-semibold text-white mb-4">Graph Schema</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Node Types</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-slate-300">Prompt - Core prompt entities</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="text-slate-300">Domain - Business domains</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-slate-300">Model - LLM models</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-slate-300">User - System users</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">Relationships</h4>
                      <div className="space-y-1 text-sm text-slate-300">
                        <div>BELONGS_TO - Prompt → Domain</div>
                        <div>GENERATED_BY - Prompt → User</div>
                        <div>USES_MODEL - Prompt → Model</div>
                        <div>EXECUTED_ON - Prompt → Model</div>
                        <div>SIMILAR_TO - Prompt → Prompt</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">Sample Cypher Query</h4>
                      <div className="bg-slate-800 p-3 rounded text-xs text-slate-300 font-mono">
                        MATCH (p:Prompt)-[:BELONGS_TO]->(d:Domain)<br/>
                        WHERE d.name = 'Banking'<br/>
                        RETURN p.goal, p.timestamp<br/>
                        ORDER BY p.timestamp DESC<br/>
                        LIMIT 10
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* System Health Monitoring Tab */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">System Health Monitoring</h2>
                <button
                  onClick={performHealthCheck}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Health Check
                </button>
              </div>
              
              {connectionHealth && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Neo4j Health */}
                  <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Neo4j</h3>
                      <div className={`w-3 h-3 rounded-full ${
                        connectionHealth.neo4j.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status</span>
                        <span className={connectionHealth.neo4j.status === 'connected' ? 'text-green-400' : 'text-red-400'}>
                          {connectionHealth.neo4j.status}
                        </span>
                      </div>
                      {connectionHealth.neo4j.latency && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Latency</span>
                          <span className="text-white">{connectionHealth.neo4j.latency.toFixed(1)}ms</span>
                        </div>
                      )}
                      {connectionHealth.neo4j.error && (
                        <div className="text-red-400 text-xs mt-2">{connectionHealth.neo4j.error}</div>
                      )}
                    </div>
                  </div>

                  {/* GitHub Health */}
                  <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">GitHub</h3>
                      <div className={`w-3 h-3 rounded-full ${
                        connectionHealth.github.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status</span>
                        <span className={connectionHealth.github.status === 'connected' ? 'text-green-400' : 'text-red-400'}>
                          {connectionHealth.github.status}
                        </span>
                      </div>
                      {connectionHealth.github.rateLimit && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Rate Limit</span>
                          <span className="text-white">{connectionHealth.github.rateLimit}</span>
                        </div>
                      )}
                      {connectionHealth.github.error && (
                        <div className="text-red-400 text-xs mt-2">{connectionHealth.github.error}</div>
                      )}
                    </div>
                  </div>

                  {/* Google Health */}
                  <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Google</h3>
                      <div className={`w-3 h-3 rounded-full ${
                        connectionHealth.google.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status</span>
                        <span className={connectionHealth.google.status === 'connected' ? 'text-green-400' : 'text-red-400'}>
                          {connectionHealth.google.status}
                        </span>
                      </div>
                      {connectionHealth.google.quotaRemaining && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Quota</span>
                          <span className="text-white">{connectionHealth.google.quotaRemaining}</span>
                        </div>
                      )}
                      {connectionHealth.google.error && (
                        <div className="text-red-400 text-xs mt-2">{connectionHealth.google.error}</div>
                      )}
                    </div>
                  </div>

                  {/* MCP Health */}
                  <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">MCP</h3>
                      <div className={`w-3 h-3 rounded-full ${
                        connectionHealth.mcp.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status</span>
                        <span className={connectionHealth.mcp.status === 'connected' ? 'text-green-400' : 'text-red-400'}>
                          {connectionHealth.mcp.status}
                        </span>
                      </div>
                      {connectionHealth.mcp.activeConnections !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Active</span>
                          <span className="text-white">{connectionHealth.mcp.activeConnections}</span>
                        </div>
                      )}
                      {connectionHealth.mcp.error && (
                        <div className="text-red-400 text-xs mt-2">{connectionHealth.mcp.error}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* System Metrics */}
              <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-semibold text-white mb-4">System Metrics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">
                      {Object.values(connectionHealth || {}).filter(service => service.status === 'connected').length}
                    </div>
                    <div className="text-slate-400">Services Online</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">
                      {mcpConnections.filter(c => c.status === 'connected').length}
                    </div>
                    <div className="text-slate-400">MCP Connections</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">
                      {errorLogs.filter(log => log.level === 'error').length}
                    </div>
                    <div className="text-slate-400">Active Errors</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">System Error Logs</h2>
                <button
                  onClick={clearErrorLogs}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Logs
                </button>
              </div>
              
              <div className="bg-black/20 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {errorLogs.length === 0 ? (
                    <div className="text-center text-slate-400 py-8">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No error logs found</p>
                      <p className="text-sm">System is running smoothly</p>
                    </div>
                  ) : (
                    errorLogs.map(log => (
                      <div key={log.id} className={`p-4 rounded-lg border ${
                        log.level === 'error' ? 'bg-red-500/10 border-red-500/30' :
                        log.level === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-blue-500/10 border-blue-500/30'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            {log.level === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                            {log.level === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-400" />}
                            {log.level === 'info' && <CheckCircle className="w-5 h-5 text-blue-400" />}
                            <div>
                              <span className={`font-medium ${
                                log.level === 'error' ? 'text-red-300' :
                                log.level === 'warning' ? 'text-yellow-300' :
                                'text-blue-300'
                              }`}>
                                [{log.service}] {log.message}
                              </span>
                            </div>
                          </div>
                          <span className="text-slate-400 text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        
                        {log.context && (
                          <div className="text-xs text-slate-400 mt-2">
                            Context: {JSON.stringify(log.context, null, 2)}
                          </div>
                        )}
                        
                        {log.stack && (
                          <details className="mt-2">
                            <summary className="text-xs text-slate-400 cursor-pointer">Stack Trace</summary>
                            <pre className="text-xs text-slate-500 mt-2 whitespace-pre-wrap">
                              {log.stack}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptCraftPlatform;