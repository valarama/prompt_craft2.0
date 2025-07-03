// Add this to your existing navigation tabs array:
{
  { id: 'prompts', label: 'Craft Prompts', icon: Sparkles },
  { id: 'models', label: 'Local Models', icon: Cpu },
  { id: 'diagnostics', label: 'Diagnostics', icon: Activity }, // ADD THIS LINE
  { id: 'sessions', label: 'Processing History', icon: Clock },
  { id: 'connections', label: 'Integrations', icon: Database },
  { id: 'upload', label: 'Data Processing', icon: Upload },
  { id: 'metrics', label: 'Analytics', icon: Activity }
}

// Add this import at the top of your main platform component:
import DiagnosticsTab from './components/DiagnosticsTab';

// Add this tab content in your main content switch/conditional:
{activeTab === 'diagnostics' && (
  <DiagnosticsTab />
)}

// That's it! The diagnostics tab is now integrated with:
// ✅ Real-time connection testing for Phi-3 and DistilBART
// ✅ Actual HTTP-based endpoint testing 
// ✅ Auto-refresh every 30 seconds for running models
// ✅ Quick-fix commands with copy-to-clipboard
// ✅ Comprehensive diagnostics workflow
// ✅ Connection health summary with live metrics
