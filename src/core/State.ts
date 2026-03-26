export interface ITransition {
    symbol: string;
    to: State;
}

export class State {
    public name: string;
    public isInitial: boolean;
    public isFinal: boolean;
    public transitions: Map<string, State>;

    constructor(name: string, isInitial = false, isFinal = false) {
        this.name = name;
        this.isInitial = isInitial;
        this.isFinal = isFinal;
        this.transitions = new Map();
    }

    addTransition(symbol: string, to: State) {
        this.transitions.set(symbol, to);
    }

    getNext(symbol: string): State | undefined {
        return this.transitions.get(symbol);
    }
}
