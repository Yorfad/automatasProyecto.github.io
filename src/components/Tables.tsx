// No global react
import { DFA } from '../core/DFA';

export const ResultsLog: React.FC<{ results: { chain: string[], path: string[], accepted: boolean }[] }> = ({ results }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Resultados de Simulación</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                        <th className="px-4 py-3">Cadena</th>
                        <th className="px-4 py-3">Recorrido</th>
                        <th className="px-4 py-3">Resultado</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((r, i) => (
                        <tr key={i} className={`border-b border-slate-100 ${r.accepted ? 'bg-emerald-50/50' : 'bg-rose-50/50'}`}>
                            <td className="px-4 py-3 font-mono font-medium">{r.chain.join(',')}</td>
                            <td className="px-4 py-3 text-slate-600">{r.path.join(' → ')}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${r.accepted ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                    {r.accepted ? 'ACEPTADA' : 'RECHAZADA'}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {results.length === 0 && (
                        <tr><td colSpan={3} className="px-4 py-8 text-center text-slate-400">Sin simulaciones recientes...</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export const TransitionTable: React.FC<{ dfa: DFA, currentStateName: string | null }> = ({ dfa, currentStateName }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Matriz de Transiciones</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                    <tr>
                        <th className="px-4 py-3 text-left">Estado</th>
                        {dfa.alphabet.map(a => <th key={a} className="px-4 py-3">{a}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {Array.from(dfa.states.values()).map(st => (
                        <tr key={st.name} className={`border-b border-slate-50 ${currentStateName === st.name ? 'bg-amber-100/50 font-bold' : ''}`}>
                            <td className="px-4 py-3 text-left">
                                {st.name} {st.isInitial && <span className="text-blue-500 ml-1">(Ini)</span>} {st.isFinal && <span className="text-emerald-500 ml-1">(Fin)</span>}
                            </td>
                            {dfa.alphabet.map(a => (
                                <td key={a} className="px-4 py-3 text-slate-600">{st.getNext(a)?.name || '—'}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
