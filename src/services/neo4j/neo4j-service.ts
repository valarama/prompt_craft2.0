import neo4j, { Driver, Session } from 'neo4j-driver';

export interface PromptRecord {
  uuid: string;
  domain: string;
  goal: string;
  promptType: string;
  model: string;
  variables: Record<string, string>;
  systemPrompt: string;
  userPrompt: string;
  metadata: any;
  timestamp: string;
  userId: string;
}

export class Neo4jService {
  private driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      process.env.NEO4J_URI || 'bolt://10.100.15.67:7687',
      neo4j.auth.basic(
        process.env.NEO4J_USER || 'neo4j',
        process.env.NEO4J_PASSWORD || 'MIT@2025'
      )
    );
  }

  async savePrompt(prompt: PromptRecord): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `
        CREATE (p:Prompt {
          uuid: $uuid,
          domain: $domain,
          goal: $goal,
          promptType: $promptType,
          model: $model,
          variables: $variables,
          systemPrompt: $systemPrompt,
          userPrompt: $userPrompt,
          metadata: $metadata,
          timestamp: $timestamp,
          userId: $userId
        })
        `,
        prompt
      );
    } finally {
      await session.close();
    }
  }

  async getPromptsByDomain(domain: string): Promise<PromptRecord[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        'MATCH (p:Prompt {domain: $domain}) RETURN p ORDER BY p.timestamp DESC LIMIT 10',
        { domain }
      );
      
      return result.records.map(record => record.get('p').properties);
    } finally {
      await session.close();
    }
  }

  async getPromptByUuid(uuid: string): Promise<PromptRecord | null> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        'MATCH (p:Prompt {uuid: $uuid}) RETURN p',
        { uuid }
      );
      
      if (result.records.length > 0) {
        return result.records[0].get('p').properties;
      }
      return null;
    } finally {
      await session.close();
    }
  }

  async getAllPrompts(): Promise<PromptRecord[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        'MATCH (p:Prompt) RETURN p ORDER BY p.timestamp DESC LIMIT 50'
      );
      
      return result.records.map(record => record.get('p').properties);
    } finally {
      await session.close();
    }
  }

  async deletePrompt(uuid: string): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        'MATCH (p:Prompt {uuid: $uuid}) DELETE p',
        { uuid }
      );
    } finally {
      await session.close();
    }
  }

  async close(): Promise<void> {
    await this.driver.close();
  }
}
