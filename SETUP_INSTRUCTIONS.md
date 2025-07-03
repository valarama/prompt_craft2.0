# PromptCraft 2.0 Setup Instructions

## Dependencies Installation

The project requires these key dependencies for full functionality:

### Required Dependencies
- `@radix-ui/react-tooltip` - For enhanced tooltips
- `framer-motion` - For smooth animations
- `chart.js` & `react-chartjs-2` - For interactive charts

### Installation Methods

#### Method 1: Using npm (Recommended)
```bash
npm install
```

#### Method 2: Install specific packages individually
```bash
npm install @radix-ui/react-tooltip
npm install framer-motion  
npm install chart.js react-chartjs-2
```

#### Method 3: Using yarn
```bash
yarn install
```

### PowerShell Execution Policy (Windows)
If you encounter PowerShell execution policy errors:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or run commands through cmd:
```cmd
cmd /c "npm install"
```

## Current Features Working Without Dependencies

The application includes fallback implementations that work without the full dependencies:

### ✅ Tooltip Component
- **With @radix-ui**: Advanced tooltip with positioning, delays, and portal rendering
- **Fallback**: Simple CSS-based tooltip with hover states

### ✅ Animation Components  
- **With framer-motion**: Smooth page transitions, hover effects, and complex animations
- **Fallback**: CSS-based transitions and simple hover effects

### ✅ Analytics Charts
- **With chart.js**: Interactive line charts, tooltips, and data visualization
- **Fallback**: CSS-based bar charts with statistics cards

## Running the Application

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Implemented

- ✅ Responsive design with Tailwind CSS
- ✅ Custom tooltip system (with fallback)
- ✅ Real-time LLM model status checking
- ✅ Enhanced error messages with dismiss functionality
- ✅ Animated tab transitions (with fallback)
- ✅ Analytics dashboard with charts (with fallback)
- ✅ Domain-specific prompt engineering
- ✅ Multi-LLM support with local endpoints
- ✅ Modern glassmorphic UI design

## Next Steps

1. Install dependencies using one of the methods above
2. Configure your LLM endpoints in the application
3. Set up Neo4j connection (optional)
4. Customize domains and prompt types as needed

The application is production-ready with or without the advanced dependencies!
