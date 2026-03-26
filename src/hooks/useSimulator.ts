import { useState, useRef, useCallback, useEffect } from 'react';
import { DFA } from '../core/DFA';

export interface StepSequence {
  from: string;
  to: string;
  sym: string;
}

export const useSimulator = () => {
  const [dfa, setDfa] = useState<DFA>(new DFA());
  const [activeChain, setActiveChain] = useState<string[]>([]);
  const [stepSequence, setStepSequence] = useState<StepSequence[]>([]);
  
  const [currentStateName, setCurrentStateName] = useState<string | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [subStep, setSubStep] = useState(0); // 0: initial node, 1: edge, 2: target node
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [autoDelay, setAutoDelay] = useState(800);
  
  const [results, setResults] = useState<{ chain: string[], path: string[], accepted: boolean }[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const applyDefinition = (alphabet: string[], states: string[], initial: string, finals: string[], transitions: string[][]) => {
    const newDfa = new DFA();
    newDfa.alphabet = alphabet;
    states.forEach(s => {
      newDfa.addState(s, { initial: s === initial, final: finals.includes(s) });
    });
    transitions.forEach(([from, sym, to]) => {
       if (from && sym && to) newDfa.addTransition(from, sym, to);
    });
    setDfa(newDfa);
    setResults([]);
    setCurrentStateName(null);
    setIsSimulating(false);
  };

  const simulateAll = (chains: string[][]) => {
    if (!dfa.initial) return;
    const newResults = chains.map(chain => {
      const res = dfa.runChain(chain);
      return { chain, path: res.path, accepted: res.accepted };
    });
    setResults(newResults);
  };

  const prepareStepSequence = (chain: string[]) => {
    if (!dfa.initial) return false;
    const seq: StepSequence[] = [];
    let curr = dfa.initial.name;
    for (const sym of chain) {
      const next = dfa.states.get(curr)?.getNext(sym);
      if (!next) return false; // Rejected midway
      seq.push({ from: curr, to: next.name, sym });
      curr = next.name;
    }
    setStepSequence(seq);
    setCurrentStateName(dfa.initial.name);
    setCurrentStepIdx(0);
    setSubStep(0);
    setActiveChain(chain);
    setIsSimulating(true);
    setPaused(false);
    return true;
  };

  const tickStep = useCallback(() => {
    if (paused || !isSimulating) return;

    if (currentStepIdx >= stepSequence.length && subStep === 0) {
      setIsSimulating(false);
      const res = dfa.runChain(activeChain);
      setResults(prev => [...prev, { chain: activeChain, path: res.path, accepted: res.accepted }]);
      return;
    }

    setSubStep((prev) => (prev + 1) % 3);

    if (subStep === 2) {
      setCurrentStepIdx(prev => prev + 1);
      if (currentStepIdx + 1 < stepSequence.length) {
         setCurrentStateName(stepSequence[currentStepIdx + 1].from);
      } else {
         setCurrentStateName(stepSequence[currentStepIdx].to); // final node
      }
    }
  }, [paused, isSimulating, currentStepIdx, subStep, stepSequence, activeChain, dfa]);

  useEffect(() => {
    if (isSimulating && !paused) {
      timerRef.current = setTimeout(tickStep, autoDelay);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isSimulating, paused, tickStep, autoDelay]);

  return {
    dfa, applyDefinition,
    simulateAll, prepareStepSequence,
    activeChain, stepSequence,
    currentStateName, currentStepIdx, subStep,
    isSimulating, paused, setPaused,
    autoDelay, setAutoDelay,
    results
  };
};
