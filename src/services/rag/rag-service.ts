export interface RAGWorkspace {
  id: string;
  name: string;
  documents: string[];
  created: string;
}

export interface RAGDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  processed: boolean;
  workspace: string;
  uploadTime: string;
}

export class RAGService {
  private apiUrl = process.env.RAG_ENDPOINT || 'http://localhost:8080/api/rag';

  async processDocument(file: File, workspace: string = 'promptcraft-workspace'): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('workspace', workspace);

    const response = await fetch(`${this.apiUrl}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to process document with RAG');
    }
  }

  async createWorkspace(name: string): Promise<RAGWorkspace> {
    const response = await fetch(`${this.apiUrl}/workspace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    if (!response.ok) {
      throw new Error('Failed to create RAG workspace');
    }

    return response.json();
  }

  async queryWorkspace(query: string, workspace: string = 'promptcraft-workspace'): Promise<string> {
    const response = await fetch(`${this.apiUrl}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, workspace })
    });

    if (!response.ok) {
      throw new Error('Failed to query RAG workspace');
    }

    const result = await response.json();
    return result.answer || result.response || '';
  }

  async generatePromptFromContext(goal: string, context: string, domain: string): Promise<string> {
    const response = await fetch(`${this.apiUrl}/generate-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, context, domain })
    });

    if (!response.ok) {
      throw new Error('Failed to generate prompt from RAG context');
    }

    const result = await response.json();
    return result.prompt || result.generatedPrompt || '';
  }

  async getWorkspaces(): Promise<RAGWorkspace[]> {
    const response = await fetch(`${this.apiUrl}/workspaces`);

    if (!response.ok) {
      throw new Error('Failed to get RAG workspaces');
    }

    return response.json();
  }

  async getWorkspaceDocuments(workspace: string): Promise<RAGDocument[]> {
    const response = await fetch(`${this.apiUrl}/workspace/${workspace}/documents`);

    if (!response.ok) {
      throw new Error('Failed to get workspace documents');
    }

    return response.json();
  }

  async searchSimilar(query: string, workspace: string = 'promptcraft-workspace', limit: number = 5): Promise<any[]> {
    const response = await fetch(`${this.apiUrl}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, workspace, limit })
    });

    if (!response.ok) {
      throw new Error('Failed to search similar documents');
    }

    const result = await response.json();
    return result.results || [];
  }
}
