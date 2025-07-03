<<<<<<< HEAD
# PromptCraft 2.0
PromptCraft 2.0 is a comprehensive platform for generating, validating, and managing AI-powered prompts. This tool supports multi-domain use cases, including Banking, Healthcare, Architecture, and Technology, with built-in features for dynamic prompt suggestions, LangChain integration, and Neo4j-based data storage.

🚀 Features
Prompt Generation
Domain-specific prompts with smart type suggestions.

Variable templating and contextual management.

Supports PromptCraft JSON format for seamless integrations.

LLM Integration
Multi-LLM support: Claude, GPT-4, Gemini, and Local DeepSeek.

Flexible API-based model configuration.

Data Storage
Integrated with Neo4j for:

Prompt storage.

Relationship mapping.

Historical tracking and analytics.

📦 Architecture
Modules
Frontend:
Built on Next.js, featuring:

PromptCraftEngine for prompt generation.

LLMRouter for managing API calls.

Neo4jService for seamless database interactions.

Backend (Optional):

Python utilities for existing DQ pipelines.

Integration-ready for 7D-DQ projects.

🛠️ How to Use
Install dependencies


npm install
Start the application


npm run dev
Interact with the tool:

Enter a task or query.

View recommended prompt types.

Generate and validate prompts dynamically.

🌟 USP
Comparison with Market Tools
PromptCraft 2.0 excels with:

Dynamic Rule Validation.

Comprehensive GenAI Workflows.

Seamless LangChain and Neo4j integration.

🧑‍💻 Developers
Modular architecture ensures scalability and extensibility.

Domain expertise templates are configurable via JSON.

Fully documented codebase with examples.

For enhancements, contact Ramamurthy Valavandan at ramamurthy.valavandan@mastechdigital.com.
=======
# PromptCraft 2.0 🚀

**Enterprise AI Prompt Engineering Platform**

A sophisticated Next.js application for crafting, testing, and deploying AI prompts across multiple LLM models with enterprise-grade features including local model integration, Neo4j storage, and RAG capabilities.

![PromptCraft 2.0](https://img.shields.io/badge/PromptCraft-2.0-purple)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)

## ✨ Features

### 🎯 **Domain-Specific Prompt Engineering**
- **Banking**: Risk Assessment, Fraud Detection, Compliance Analysis
- **Healthcare**: Patient Care, Medical Research, Clinical Trials
- **Retail**: Customer Segmentation, Inventory Optimization, Price Analytics
- **Architecture**: System Design, Code Analysis, Performance Optimization

### 🤖 **Multi-Model Support**
- **Local Models**: Phi-3 Mini, SQLCoder 7B, DeepSeek Coder, Mistral 7B
- **Cloud APIs**: Claude Sonnet 4, OpenAI GPT models
- **Real-time Connection Testing**
- **Model-specific Optimization**

### 🧠 **Advanced Prompt Strategies**
- Instruction-Based Prompting
- Chain-of-Thought Reasoning
- Few-Shot & Zero-Shot Learning
- RAG (Retrieval Augmented Generation)
- Sentiment Analysis
- Data Mapping & Code Conversion

### 🔗 **Enterprise Integrations**
- **Neo4j Graph Database** - Prompt relationship storage
- **RAG Engine** - Knowledge retrieval and augmentation
- **GitHub API** - Code repository integration
- **Google Workspace** - Document and email integration
- **Hugging Face** - Model hub access

### 📊 **Analytics & Monitoring**
- Model Performance Tracking
- Domain Usage Analytics
- Real-time Activity Monitoring
- Deployment Success Metrics

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Custom Component Library
- **Icons**: Lucide React
- **Database**: Neo4j (Graph Database)
- **AI Models**: Local LLMs + Cloud APIs
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/valarama/prompt_craft2.0.git
   cd prompt_craft2.0
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Local Model Endpoints
   PHI3_ENDPOINT=http://10.100.15.67:12139
   SQLCODER_ENDPOINT=http://10.100.15.67:1138
   DEEPSEEK_ENDPOINT=http://10.100.15.66:1138
   MISTRAL_ENDPOINT=http://10.100.15.66:1137
   
   # Neo4j Configuration
   NEO4J_URI=bolt://10.100.15.67:7687
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=your_password
   
   # API Keys (Optional)
   ANTHROPIC_API_KEY=your_anthropic_key
   OPENAI_API_KEY=your_openai_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### 1. **Select Domain & Use Case**
Choose your industry domain (Banking, Healthcare, Retail, Architecture) and see relevant use cases.

### 2. **Define Your Goal**
Describe the specific task you want to accomplish with AI.

### 3. **Choose Prompt Strategy**
Select from advanced prompting techniques - the system will suggest the best strategy based on your goal.

### 4. **Configure Variables**
- Set context and background information
- Provide sample input data
- Specify expected output format

### 5. **Select AI Model**
Choose from local models or cloud APIs based on your requirements.

### 6. **Generate & Deploy**
Create your optimized prompt and deploy it directly to your chosen model.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js UI   │────│  PromptCraft    │────│   AI Models     │
│   Components    │    │    Engine       │    │  (Local/Cloud)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Tailwind CSS │    │   Neo4j Graph   │    │   RAG Engine    │
│   + Components  │    │    Database     │    │   Integration   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Configuration

### Local Model Setup
Configure your local LLM endpoints in the component:

```typescript
const llmModels: LLMModel[] = [
  {
    id: 'phi-3-local',
    name: 'Phi-3 Mini 4K (Local)',
    endpoint: 'http://your-local-ip:port',
    // ... other config
  }
];
```

### Service Integrations
Enable/disable services in the configuration:

```typescript
const services: Service[] = [
  {
    id: 'neo4j',
    name: 'Neo4j Graph DB',
    connected: true,
    endpoint: 'bolt://your-neo4j-endpoint:7687'
  }
];
```

## 📁 Project Structure

```
prompt_craft2.0/
├── components/
│   └── prompt/
│       └── PromptCraftGenerator.tsx    # Main component
├── pages/
│   ├── _app.tsx                        # App configuration
│   └── index.tsx                       # Homepage
├── styles/
│   ├── globals.css                     # Global styles
│   └── components.css                  # Component styles
├── types/                              # TypeScript definitions
├── lib/                                # Utility functions
├── hooks/                              # Custom React hooks
└── data/                               # Static data files
```

## 🎨 Styling System

The project uses a custom CSS component system built on Tailwind CSS:

- **Domain Selection**: `.domain-selection-grid`, `.domain-btn`
- **Strategy Selection**: `.strategy-grid`, `.strategy-btn`
- **Form Components**: `.form-input`, `.form-textarea`
- **Buttons**: `.generate-btn`, `.btn-primary`
- **Status Indicators**: `.status-connected`, `.status-available`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Lucide React** for beautiful icons
- **Tailwind CSS** for utility-first styling
- **Next.js Team** for the amazing framework
- **Local LLM Community** for model integrations
# 🚀 PromptCraft 2.0

**Enterprise AI Prompt Engineering Platform with MCP & Multi-LLM Support**

![PromptCraft 2.0](https://img.shields.io/badge/PromptCraft-2.0-purple)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)

---

> 🆕 **v2.0 Highlights**:
>
> - ✅ Supports **MCP (Model Context Protocol)** for structured prompt logic
> - ✅ Built-in diagnostics, error feedback, and model connection testing
> - ✅ Neo4j graph DB integration for prompt versioning & analytics
> - ✅ Plug-and-play with **local LLMs** (Phi-3, SQLCoder, Mistral, DeepSeek)
> - ✅ GitHub & Google integrations for prompt sync & sharing

---

## ✨ Key Features

- **Domain-Aware Prompting**: Templates for Banking, Healthcare, Retail, Architecture
- **Multi-Model Support**: Local + Cloud LLMs via configurable endpoints
- **MCP-Enabled**: Prompts carry context, metadata, and versioning
- **Neo4j Graph Storage**: Track prompt lineage, usage, relationships
- **RAG-Friendly**: Integrates easily with Retrieval-Augmented Generation pipelines
- **Export & Deploy**: Save to GitHub, Google Drive, or internal tools

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide Icons
- **Infra**: Neo4j, LangChain-ready, Custom Prompt JSON Format
- **LLMs**: Works with Local Inference & APIs (Claude, GPT, DeepSeek, etc.)

---

## 🚀 Quick Start

```bash
git clone https://github.com/valarama/prompt_craft2.0.git
cd prompt_craft2.0
npm install
cp .env.example .env.local
npm run dev

## 📞 Support

For support, email valarama@example.com or open an issue on GitHub.

---

**Built with ❤️ for the AI Engineering Community**
>>>>>>> 5cb6e81 (Initial commit: PromptCraft 2.0 Enterprise AI Prompt Engineering Platform)
