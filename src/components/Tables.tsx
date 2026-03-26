// No global react
import { DFA } from '../core/DFA';

export const ResultsLog: React.FC<{ results: { chain: string[], path: string[], accepted: boolean }[] }> = ({ results }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mt-6 transition-colors duration-300">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100 transition-colors">Resultados de Simulación</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 transition-colors">
                    <tr>
                        <th className="px-4 py-3">Cadena</th>
                        <th className="px-4 py-3">Recorrido</th>
                        <th className="px-4 py-3">Resultado</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((r, i) => (
                        <tr key={i} className={`border-b border-slate-100 dark:border-slate-800 transition-colors ${r.accepted ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : 'bg-rose-50/50 dark:bg-rose-900/10'}`}>
                            <td className="px-4 py-3 font-mono font-medium dark:text-slate-300">{r.chain.join(',')}</td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{r.path.join(' → ')}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${r.accepted ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-400'}`}>
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
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mt-6 transition-colors duration-300">
        <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-slate-100 transition-colors">Matriz de Transiciones</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
                <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700/50 transition-colors">
                    <tr>
                        <th className="px-4 py-3 text-left">Estado</th>
                        {dfa.alphabet.map(a => <th key={a} className="px-4 py-3">{a}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {Array.from(dfa.states.values()).map(st => (
                        <tr key={st.name} className={`border-b border-slate-50 dark:border-slate-800/50 transition-colors ${currentStateName === st.name ? 'bg-amber-100/50 dark:bg-amber-900/20 font-bold dark:text-amber-400' : 'dark:text-slate-300'}`}>
                            <td className="px-4 py-3 text-left">
                                {st.name} {st.isInitial && <span className="text-blue-500 dark:text-blue-400 ml-1">(Ini)</span>} {st.isFinal && <span className="text-emerald-500 dark:text-emerald-400 ml-1">(Fin)</span>}
                            </td>
                            {dfa.alphabet.map(a => (
                                <td key={a} className={`px-4 py-3 ${currentStateName === st.name ? '' : 'text-slate-600 dark:text-slate-400'}`}>{st.getNext(a)?.name || '—'}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
