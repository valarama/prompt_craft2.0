export interface GitLabProject {
  id: number;
  name: string;
  path: string;
  web_url: string;
  description: string;
  last_activity_at: string;
}

export interface GitLabFile {
  id: string;
  name: string;
  type: 'tree' | 'blob';
  path: string;
  mode: string;
}

export class GitLabService {
  private baseUrl = process.env.GITLAB_URL || 'https://gitlab.com/api/v4';
  private token = process.env.GITLAB_TOKEN || '';

  async getProjects(): Promise<GitLabProject[]> {
    const response = await fetch(`${this.baseUrl}/projects?membership=true&per_page=20`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch GitLab projects');
    }

    return response.json();
  }

  async getProjectFiles(projectId: string, path: string = ''): Promise<GitLabFile[]> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/repository/tree?path=${encodeURIComponent(path)}&per_page=50`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch repository files');
    }

    return response.json();
  }

  async getFileContent(projectId: string, filePath: string, ref: string = 'main'): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/repository/files/${encodeURIComponent(filePath)}/raw?ref=${ref}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch file content');
    }

    return response.text();
  }

  async searchProjects(query: string): Promise<GitLabProject[]> {
    const response = await fetch(
      `${this.baseUrl}/projects?search=${encodeURIComponent(query)}&membership=true&per_page=10`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search projects');
    }

    return response.json();
  }

  async getProjectCommits(projectId: string, limit: number = 10): Promise<any[]> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/repository/commits?per_page=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch project commits');
    }

    return response.json();
  }

  async createPromptFile(projectId: string, fileName: string, content: string, commitMessage: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/projects/${projectId}/repository/files/${encodeURIComponent(fileName)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branch: 'main',
          content: content,
          commit_message: commitMessage
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create file in GitLab');
    }
  }
}
