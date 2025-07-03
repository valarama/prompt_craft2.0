from diagrams import Diagram
from diagrams.c4 import SystemBoundary, Relationship
from diagrams.onprem.database import Neo4J
from diagrams.generic.storage import Storage
from diagrams.generic.compute import Rack
from diagrams.programming.framework import FastAPI
from diagrams.programming.framework import React

# Custom relationship style for clarity
def blue_relationship(label):
    return Relationship(label, color="blue", style="bold", fontsize="9")

# Helper function to format node labels
def format_label(name, details):
    return f"{name}\n{details}"

# Diagram configuration for compact, aligned layout
graph_attr = {
    "splines": "ortho",      # Orthogonal edges for clean lines
    "fontsize": "10",        # Slightly larger font for readability
    "labelfontsize": "12",   # Larger, bold title
    "labelfontname": "bold", # Bold title
    "labeljust": "c",        # Center the title
    "pad": "0.3",            # Reduced padding for compactness
    "nodesep": "0.5",        # Consistent node separation
    "ranksep": "0.4",        # Reduced rank separation for tighter layout
}

node_attr = {
    "fontsize": "9",     # Smaller font for nodes
    "width": "2.0",      # Uniform width for text boxes
    "height": "1.2",     # Uniform height for text boxes
}

with Diagram(
    "PromptCraft 2.0 - Backend Integration",
    direction="LR",  # Left-to-Right for PPT-friendly layout
    show=False,
    filename="promptcraft_backend_integration",
    graph_attr=graph_attr,
    node_attr=node_attr
):
    # Frontend
    frontend = React(format_label("Next.js Frontend", "React + TypeScript\nPrompt Tasks"))

    with SystemBoundary("Integration Layer", fillcolor="lightgreen"):
        neo4j_server = Neo4J(format_label("Neo4j DB", "Port: 7687\nPrompts & Analytics\nneo4j-driver"))
        llm_api = FastAPI(format_label("LLM API", "FastAPI\n/api/llm/execute\nPPOA & Inference"))
        rag_engine = Rack(format_label("RAG Engine", "localhost:8000\nVector DB"))
        file_storage = Storage(format_label("Local Storage", "JSON Configs\nPrompt Templates"))

    # Data Flow Connections
    frontend >> blue_relationship("Sends Tasks") >> llm_api
    llm_api >> blue_relationship("Processes Prompts") >> rag_engine
    rag_engine >> blue_relationship("Retrieves/Stores") >> neo4j_server
    neo4j_server >> blue_relationship("Provides Data") >> rag_engine
    llm_api >> blue_relationship("Saves Results") >> neo4j_server
    llm_api >> blue_relationship("Reads/Writes") >> file_storage