from diagrams import Diagram
from diagrams.c4 import SystemBoundary, Relationship
from diagrams.onprem.compute import Server
from diagrams.onprem.network import Nginx

# Custom relationship style for clarity
def blue_relationship(label):
    return Relationship(label, color="blue", style="bold", fontsize="10")

# Helper function to format node labels
def format_label(name, details):
    return f"{name}\n{details}"

# Diagram configuration for compact, aligned layout
graph_attr = {
    "splines": "ortho",      # Orthogonal edges for clean lines
    "fontsize": "15",        # Larger font for readability
    "labelfontsize": "12",   # Larger, bold title
    "labelfontname": "bold", # Bold title
    "labeljust": "c",        # Center the title
    "pad": "0.4",            # Slightly increased padding for clarity
    "nodesep": "0.6",        # Increased node separation
    "ranksep": "0.5",        # Increased rank separation
}

node_attr = {
    "fontsize": "12",        # Larger font for nodes
    "width": "2.5",          # Increased width for better text fit
    "height": "1.5",         # Increased height for better text fit
}

with Diagram(
    "PromptCraft 2.0 - LLM Infrastructure",
    direction="TB",  # Top-to-Bottom for PPT-friendly layout
    show=False,
    filename="promptcraft_llm_infra",
    graph_attr=graph_attr,
    node_attr=node_attr
):
    # Frontend
    with SystemBoundary("Local LLM Servers", fillcolor="lightgreen"):
        with SystemBoundary("Server 1 (10.100.15.67)"):
            llama_3_2 = Server(format_label("Llama-3.2-3B-Instruct", "Port: 1138\nBanking + Healthcare\nThreads: 8, Context: 2048"))
            phi_3 = Server(format_label("Phi-3-mini-4k-instruct", "Port: 1139\nGeneral Prompt Gen\n128K Context"))

        with SystemBoundary("Server 2 (10.100.15.66)"):
            qwen2_5 = Server(format_label("Qwen2.5-7B-Instruct", "Port: 1138\nCoding + Math\nHigh HumanEval"))
            codellama = Server(format_label("CodeLlama-7B-Instruct", "Port: 1137\nCode Gen + Reasoning"))

        loadbalancer = Nginx(format_label("LLM Load Balancer", "llm-loadbalancer.local\nMulti-Model Routing\nHigh Availability"))

    # Data Flow Connections
    loadbalancer >> blue_relationship("Routes to") >> llama_3_2
    loadbalancer >> blue_relationship("Routes to") >> phi_3
    loadbalancer >> blue_relationship("Routes to") >> qwen2_5
    loadbalancer >> blue_relationship("Routes to") >> codellama