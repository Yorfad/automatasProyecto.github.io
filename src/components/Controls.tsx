import { useState } from 'react';
import { Play, Pause, SkipForward, PlayCircle } from 'lucide-react';

interface ControlsProps {
    onApply: (alphabet: string[], states: string[], initial: string, finals: string[], transitions: string[][]) => void;
    onSimulateAll: (chains: string[][]) => void;
    onStartStepByStep: (chain: string[]) => void;
    paused: boolean;
    setPaused: (val: boolean) => void;
    isSimulating: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ onApply, onSimulateAll, onStartStepByStep, paused, setPaused, isSimulating }) => {
    const [simbolos, setSimbolos] = useState('0,1');
    const [estados, setEstados] = useState('Q0,Q1,Q2');
    const [inicial, setInicial] = useState('Q0');
    const [finales, setFinales] = useState('Q1,Q2');
    const [transiciones, setTransiciones] = useState('Q0,0,Q1\nQ0,1,Q0\nQ1,0,Q1\nQ1,1,Q2\nQ2,0,Q2\nQ2,1,Q0');
    const [cadenas, setCadenas] = useState('1,0,1\n0,0,1,1');

    const handleApply = () => {
        const alph = simbolos.split(',').map(s => s.trim()).filter(Boolean);
        const stts = estados.split(',').map(s => s.trim()).filter(Boolean);
        const fns = finales.split(',').map(s => s.trim()).filter(Boolean);
        const trans = transiciones.split('\n').map(l => l.split(',').map(s => s.trim())).filter(t => t.length === 3);
        onApply(alph, stts, inicial.trim(), fns, trans);
    };

    const handleSimulateAll = () => {
        const parsed = cadenas.split('\n').filter(Boolean).map(l => l.includes(',') ? l.split(',').map(s=>s.trim()) : l.split(''));
        onSimulateAll(parsed);
    };

    const handleStepByStep = () => {
        const parsed = cadenas.split('\n').filter(Boolean).map(l => l.includes(',') ? l.split(',').map(s=>s.trim()) : l.split(''));
        if (parsed.length > 0) onStartStepByStep(parsed[0]);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Definición del AFD</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Alfabeto (coma)</label>
                    <input type="text" value={simbolos} onChange={e => setSimbolos(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 focus:ring focus:ring-blue-200 outline-none" placeholder="0,1" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Estados (coma)</label>
                    <input type="text" value={estados} onChange={e => setEstados(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 focus:ring focus:ring-blue-200 outline-none" placeholder="Q0,Q1" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Estado Inicial</label>
                    <input type="text" value={inicial} onChange={e => setInicial(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 focus:ring focus:ring-blue-200 outline-none" placeholder="Q0" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Estados Finales</label>
                    <input type="text" value={finales} onChange={e => setFinales(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 focus:ring focus:ring-blue-200 outline-none" placeholder="Q1" />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Transiciones (origen,simbolo,destino por línea)</label>
                <textarea value={transiciones} onChange={e => setTransiciones(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 focus:ring focus:ring-blue-200 outline-none h-28 font-mono text-sm" />
            </div>

            <button onClick={handleApply} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition shadow-sm mb-6">
                Aplicar Definición
            </button>

            <h2 className="text-xl font-bold mb-4 text-slate-800 border-t pt-6">Simulación</h2>
            <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Cadenas a procesar</label>
                <textarea value={cadenas} onChange={e => setCadenas(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50 focus:ring focus:ring-blue-200 outline-none h-20 font-mono text-sm" />
            </div>

            <div className="flex flex-wrap gap-2">
                <button onClick={handleSimulateAll} className="flex-1 bg-slate-800 text-white font-semibold py-2 px-3 rounded-lg hover:bg-slate-900 transition flex items-center justify-center text-sm shadow-sm" disabled={isSimulating}>
                    <SkipForward className="w-4 h-4 mr-2" /> Todas
                </button>
                <button onClick={handleStepByStep} className="flex-1 bg-emerald-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center text-sm shadow-sm" disabled={isSimulating}>
                    <PlayCircle className="w-4 h-4 mr-2" /> Paso a Paso
                </button>
                {isSimulating && (
                    <button onClick={() => setPaused(!paused)} className={`flex w-auto px-4 font-semibold py-2 rounded-lg transition text-white text-sm shadow-sm ${paused ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'}`}>
                        {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                )}
            </div>
        </div>
    );
};
