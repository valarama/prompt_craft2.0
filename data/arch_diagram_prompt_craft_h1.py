from diagrams import Diagram, Cluster
from diagrams.c4 import Person, Container, SystemBoundary, Relationship

# Custom relationship style for clarity
def blue_relationship(label):
    return Relationship(label, color="blue", style="bold", fontsize="10")

# Diagram configuration for compact, aligned layout
graph_attr = {
    "splines": "ortho",  # Orthogonal edges for clean lines
    "fontsize": "9",     # Smaller font for PPT compatibility
    "pad": "0.3",        # Reduced padding for compactness
    "nodesep": "0.5",    # Consistent node separation
    "ranksep": "0.4",    # Reduced rank separation for tighter layout
}

node_attr = {
    "fontsize": "9",     # Smaller font for nodes
    "width": "2.0",      # Uniform width for text boxes
    "height": "1.2",     # Uniform height for text boxes
}

with Diagram(
    "PromptCraft 2.0 - Frontend Architecture",
    direction="LR",  # Left-to-Right for PPT-friendly layout
    show=False,
    filename="promptcraft_frontend",
    graph_attr=graph_attr,
    node_attr=node_attr
):
    # User Interaction
    user = Person("User", "Prompt Engineer\nor Analyst")
    browser = Container("Web Browser", "Accesses\npromptcraft.local")

    # Frontend Application and Development Workflow
    with SystemBoundary("Frontend", fillcolor="lightblue"):
        nextjs_app = Container(
            "Next.js App",
            "React + TypeScript",
            "Prompt Generator,\nDomain Logic,\nTailwind CSS"
        )
        frontend_development = Container(
            "Dev Workflow",
            "Node.js + NPM",
            "npm install,\nnpm run dev"
        )

    # API Layers
    with SystemBoundary("API Layer", fillcolor="lightgreen"):
        api_routes_llm = Container(
            "LLM API",
            "Next.js Routes",
            "/api/llm/execute"
        )
        api_routes_integrations = Container(
            "Integrations API",
            "Next.js Routes",
            "/api/integrations/*"
        )

    # Connections with clear relationships
    user >> blue_relationship("Accesses") >> browser
    browser >> blue_relationship("Renders") >> nextjs_app
    nextjs_app >> blue_relationship("Uses") >> frontend_development
    nextjs_app >> blue_relationship("Calls") >> api_routes_llm
    nextjs_app >> blue_relationship("Calls") >> api_routes_integrations