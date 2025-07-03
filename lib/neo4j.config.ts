export const neo4jConfig = {
  uri: 'bolt://10.100.15.67:7687',
  user: 'neo4j',
  password: 'MIT@2025',
  database: 'neo4j',
  
  // Connection pool settings for better performance
  maxConnectionPoolSize: 100,
  connectionAcquisitionTimeout: 60000, // 60 seconds
  connectionTimeout: 5000, // 5 seconds
  maxTransactionRetryTime: 30000, // 30 seconds
  
  // Retry configuration for failed connections
  retrySettings: {
    maxRetries: 3,
    retryDelayMs: 1000,
    backoffMultiplier: 2,
  },
  
  // Database-specific settings
  promptCraftDatabase: {
    promptCollection: 'prompts',
    domainCollection: 'domains',
    modelCollection: 'models',
    userCollection: 'users',
  },
  
  // Node labels for PromptCraft data model
  nodeLabels: {
    PROMPT: 'Prompt',
    DOMAIN: 'Domain',
    MODEL: 'Model',
    USER: 'User',
    EXECUTION: 'Execution',
    RESULT: 'Result',
  },
  
  // Relationship types for graph connections
  relationships: {
    GENERATED_BY: 'GENERATED_BY',
    BELONGS_TO: 'BELONGS_TO',
    EXECUTED_ON: 'EXECUTED_ON',
    PRODUCED: 'PRODUCED',
    USES_MODEL: 'USES_MODEL',
    HAS_DOMAIN: 'HAS_DOMAIN',
    CREATED_BY: 'CREATED_BY',
  },
};

// Environment-specific configuration
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...neo4jConfig,
        uri: process.env.NEO4J_URI || neo4jConfig.uri,
        user: process.env.NEO4J_USER || neo4jConfig.user,
        password: process.env.NEO4J_PASSWORD || neo4jConfig.password,
        database: process.env.NEO4J_DATABASE || neo4jConfig.database,
      };
    case 'development':
    default:
      return neo4jConfig;
  }
};

// Connection status types for UI display
export type Neo4jConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error' | 'retrying';

// Connection health check configuration
export const healthCheckConfig = {
  intervalMs: 30000, // Check every 30 seconds
  timeoutMs: 5000,   // 5 second timeout for health checks
  query: 'RETURN 1 as health_check',
};
