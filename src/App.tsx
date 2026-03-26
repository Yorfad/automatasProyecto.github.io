import { useEffect } from 'react';
import { useSimulator } from './hooks/useSimulator';
import { Controls } from './components/Controls';
import { GraphViewer } from './components/GraphViewer';
import { ResultsLog, TransitionTable } from './components/Tables';
import { Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from './components/ThemeContext';

function App() {
  const sim = useSimulator();
  const { theme, toggleTheme } = useTheme();

  // Load defaults on mount
  useEffect(() => {
    sim.applyDefinition(
      ['0', '1'],
      ['Q0', 'Q1', 'Q2'],
      'Q0',
      ['Q1', 'Q2'],
      [
        ['Q0', '0', 'Q1'], ['Q0', '1', 'Q0'],
        ['Q1', '0', 'Q1'], ['Q1', '1', 'Q2'],
        ['Q2', '0', 'Q2'], ['Q2', '1', 'Q0']
      ]
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center transition-colors">
              <Settings className="w-8 h-8 mr-3 text-blue-600 dark:text-blue-400" /> Simulador de Autómatas (React)
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Validación interactiva de Lenguajes Estructurados y DFA</p>
          </div>
          <button onClick={toggleTheme} className="p-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-amber-400 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col">
            <Controls 
              onApply={sim.applyDefinition}
              onSimulateAll={sim.simulateAll}
              onStartStepByStep={sim.prepareStepSequence}
              paused={sim.paused}
              setPaused={sim.setPaused}
              isSimulating={sim.isSimulating}
            />
          </div>

          <div className="lg:col-span-8 flex flex-col">
            <GraphViewer 
              dfa={sim.dfa}
              currentStateName={sim.currentStateName}
              stepSequence={sim.stepSequence}
              currentStepIdx={sim.currentStepIdx}
              subStep={sim.subStep}
            />
            
            <TransitionTable 
              dfa={sim.dfa} 
              currentStateName={sim.currentStateName} 
            />
            
            <ResultsLog results={sim.results} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
