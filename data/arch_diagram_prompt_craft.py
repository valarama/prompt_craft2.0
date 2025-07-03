from diagrams import Diagram
from diagrams.c4 import Person, Container, SystemBoundary, Relationship
from diagrams.onprem.database import Neo4J
from diagrams.programming.framework import React
from diagrams.programming.language import Javascript, Typescript
from diagrams.onprem.compute import Server
from diagrams.onprem.network import Nginx
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack

def format_label(name, details):
    """Helper function to format node labels."""
    return f"{name}\n{details}"

with Diagram("PromptCraft 2.0 - Actual Architecture", direction="TB", show=False, filename="promptcraft_real_architecture"):

    # 👤 Users
    user = Person("User", "Prompt Engineer\nData Analyst")

    # 🌐 Next.js Frontend (Your Windows Machine)
    with SystemBoundary("Frontend - Windows (localhost:3000)"):
        browser = Container("Browser\nChrome/Edge", "Modern UI with Glass Morphism")
        nextjs_app = Container("Next.js App\nReact + TypeScript", "PromptCraftGenerator Component\nDomain Intelligence\nTailwind CSS")
        api_routes = Container("API Routes\nNext.js API", "/api/llm/execute\n/api/integrations/neo4j\n/api/integrations/status")
        promptcraft_engine = Container("PromptCraft Engine\nTypeScript Core", "Domain Templates\nVariable Injection\nJSON Generation\nModel Selection Logic")

    # 🤖 Your Local LLM Infrastructure
    with SystemBoundary("Local LLM Servers"):
        with SystemBoundary("Server 1 (10.100.15.67)"):
            sqlcoder = Server(format_label("SQLCoder 7B", "Port: 1138\nBanking + SQL Analysis\nThreads: 8, Context: 2048"))
            neo4j_server = Neo4J(format_label("Neo4j Database", "Port: 7687\nPrompt Storage\nRelationships\nAnalytics"))

        with SystemBoundary("Server 2 (10.100.15.66)"):
            deepseek = Server(format_label("DeepSeek Coder 1.3B", "Port: 1138\nCode Generation\nTechnical Prompts"))
            mistral = Server(format_label("Mistral 7B", "Port: 1137\nHealthcare Analysis\nReasoning Tasks"))

        loadbalancer = Nginx(format_label("LLM Load Balancer", "llm-loadbalancer.local\nMulti-Model Routing\nHigh Availability"))

    # 🔄 Integration Services (Your Setup)
    with SystemBoundary("Integration Layer"):
        rag_engine = Container(format_label("RAG Engine", "localhost:8000\nVector Database\nKnowledge Retrieval"))
        dq_pipeline = Container(format_label("7D-DQ Pipeline", "Python + Neo4j\nData Quality Integration\nExisting Pipeline"))
        file_storage = Storage(format_label("Local Storage", "JSON Configs\nPrompt Templates\nExport Files"))

    # 🔗 Flow Connections
    user >> Relationship("Accesses") >> browser
    browser >> Relationship("HTTP Requests") >> nextjs_app
    nextjs_app >> Relationship("Component Rendering") >> browser
    nextjs_app >> Relationship("API Calls") >> api_routes
    api_routes >> Relationship("Business Logic") >> promptcraft_engine
    promptcraft_engine >> Relationship("Banking + SQL Tasks") >> sqlcoder
    promptcraft_engine >> Relationship("Code Generation") >> deepseek  
    promptcraft_engine >> Relationship("Healthcare Analysis") >> mistral
    promptcraft_engine >> Relationship("Load Balanced Requests") >> loadbalancer
    loadbalancer >> Relationship("Routes to") >> sqlcoder
    loadbalancer >> Relationship("Routes to") >> deepseek
    loadbalancer >> Relationship("Routes to") >> mistral
    promptcraft_engine >> Relationship("Stores Prompts") >> neo4j_server
    promptcraft_engine >> Relationship("Exports JSON") >> file_storage
    promptcraft_engine >> Relationship("Context Enhancement") >> rag_engine
    neo4j_server >> Relationship("DQ Data Source") >> dq_pipeline
    dq_pipeline >> Relationship("Feeds Data") >> neo4j_server
    sqlcoder >> Relationship("LLM Response") >> promptcraft_engine
    deepseek >> Relationship("LLM Response") >> promptcraft_engine
    mistral >> Relationship("LLM Response") >> promptcraft_engine
    promptcraft_engine >> Relationship("JSON Response") >> api_routes
    api_routes >> Relationship("HTTP Response") >> nextjs_app
