import { State } from './State';

export interface RunResult {
    accepted: boolean;
    path: string[];
    ended: string;
}

export class DFA {
    public states: Map<string, State>;
    public initial: State | null;
    public alphabet: string[];

    constructor() {
        this.states = new Map();
        this.initial = null;
        this.alphabet = [];
    }

    reset() {
        this.states.clear();
        this.initial = null;
        this.alphabet = [];
    }

    addState(name: string, options: { initial?: boolean, final?: boolean } = {}) {
        if (!this.states.has(name)) {
            this.states.set(name, new State(name, options.initial, options.final));
        }
        const st = this.states.get(name)!;
        if (options.initial) {
            this.initial = st;
            st.isInitial = true;
        }
        if (options.final) {
            st.isFinal = true;
        }
        return st;
    }

    addTransition(from: string, symbol: string, to: string) {
        const a = this.states.get(from);
        const b = this.states.get(to);
        if (!a || !b) throw new Error(`Transición inválida: ${from}, ${symbol}, ${to}`);
        a.addTransition(symbol, b);
    }

    runChain(chain: string[]): RunResult {
        let current = this.initial;
        const path = [current?.name ?? '?'];
        
        for (const s of chain) {
            const next = current?.getNext(s);
            if (!next) return { accepted: false, path, ended: current?.name ?? '?' };
            current = next;
            path.push(current.name);
        }
        return { accepted: !!current?.isFinal, path, ended: current?.name ?? '?' };
    }
}
