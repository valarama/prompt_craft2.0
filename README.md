 🚀 PromptCraft 2.0

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

- **Domain-Aware Prompting** for Banking, Healthcare, Retail, Architecture
- **Multi-Model LLM Support** (Local & Cloud)
- **Contextual Prompt Strategies** (Instruction, Chain-of-Thought, Few-shot, RAG)
- **Neo4j + LangChain Integration**
- **Real-time Health Diagnostics**
- **GitHub + Google Workspace Exports**
- **PromptCraft JSON Format for standardization**

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide Icons
- **Infra**: Neo4j, Local LLMs, LangChain-ready
- **Models**: GPT, Claude, Phi-3, SQLCoder, DeepSeek, Mistral
- **Deployment**: Vercel-ready or run locally

---

## 🚀 Quick Start

```bash
git clone https://github.com/valarama/prompt_craft2.0.git
cd prompt_craft2.0
npm install
cp .env.example .env.local
npm run dev
🌐 Example .env.local

# Local Model Endpoints
PHI3_ENDPOINT=http://localhost:12139
SQLCODER_ENDPOINT=http://localhost:1138
DEEPSEEK_ENDPOINT=http://localhost:1138
MISTRAL_ENDPOINT=http://localhost:1137

# Neo4j
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# Optional LLM API Keys
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
🛑 Important: Do NOT commit your .env.local or any API keys. Use Git ignore.

📁 Folder Structure
pgsql
Copy
Edit
prompt_craft2.0/
├── components/
│   └── prompt/PromptCraftGenerator.tsx
├── pages/
│   ├── index.tsx
│   └── api/
├── types/
├── lib/
├── hooks/
├── data/
├── styles/
└── .github/workflows/

🧠 MCP Support
PromptCraft uses Model Context Protocol (MCP) to:

Generate context-rich prompt JSON

Include domain, task, and model metadata

Enable version control via GitHub

Work seamlessly across models and services

🧪 Diagnostics & Monitoring
Real-time model health checks

Endpoint testing + fallback

Prompt generation success rates

Neo4j + API service logs

🎨 Styling System
Tailwind-based CSS structure:

.generate-btn, .form-input, .domain-btn

.status-connected, .status-error

.grid-cols-prompt, .prompt-output-block

🤝 Contributing

git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
Then open a Pull Request. We welcome contributions!

📄 License
MIT © 2025
Author: Ramamurthy Valavandan
📧 ramamurthy.valavandan@mastechdigital.com

🙏 Acknowledgments
Neo4j for Graph DB support

Tailwind CSS + Lucide Icons

Local LLM community: Phi, DeepSeek, Mistral

LangChain & PromptFlow contributors

Built with ❤️ for the AI & GenAI Engineering Community


## ✅ What to Do Now

1. Replace your `README.md` file with the content above.
2. Then run:

```bash
git add README.md
git commit -m "📄 Clean final README with MCP v2.0, localhost setup, no secrets"
git push origin main
