import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import type { Core } from 'cytoscape';
import { DFA } from '../core/DFA';
import { StepSequence } from '../hooks/useSimulator';

interface GraphViewerProps {
  dfa: DFA;
  currentStateName: string | null;
  stepSequence: StepSequence[];
  currentStepIdx: number;
  subStep: number;
}

export const GraphViewer: React.FC<GraphViewerProps> = ({ dfa, currentStateName, stepSequence, currentStepIdx, subStep }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  // Initialize and update graph data
  useEffect(() => {
    if (!containerRef.current) return;

    const elements: any[] = [];
    dfa.states.forEach(st => {
      elements.push({ group: 'nodes', data: { id: st.name, label: st.name, border: st.isFinal ? 4 : 0 } });
    });
    dfa.states.forEach(st => {
      st.transitions.forEach((to, sym) => {
        elements.push({ group: 'edges', data: { id: `${st.name}-${to.name}-${sym}`, source: st.name, target: to.name, label: sym } });
      });
    });

    if (cyRef.current) cyRef.current.destroy();

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        { selector: 'node', style: {
          'label': 'data(label)',
          'text-valign': 'center', 'text-halign': 'center',
          'background-color': '#61bffc', 'width': 56, 'height': 56,
          'color': '#0b1021', 'font-size': '14px',
          'border-width': 'data(border)', 'border-color': '#f59e0b'
        }},
        { selector: 'edge', style: {
          'label': 'data(label)', 'width': 3,
          'line-color': '#94a3b8', 'target-arrow-color': '#94a3b8',
          'target-arrow-shape': 'triangle', 'curve-style': 'bezier',
          'control-point-step-size': 60, 'text-rotation': 'autorotate',
          'font-size': '18px', 'color': '#e5e7eb',
          'text-background-opacity': 0.95, 'text-background-color': '#0b1021',
          'text-background-shape': 'round', 'text-background-padding': 3
        }},
        { selector: '.active', style: { 'background-color': '#FFD700', 'border-color': '#d97706' } },
        { selector: '.active-edge', style: { 'line-color': '#ff7a18', 'target-arrow-color': '#ff7a18', 'width': 4 } },
        { selector: '.final', style: { 'border-width': 4 } }
      ],
      layout: { name: 'cose', animate: true }
    });

    return () => { if (cyRef.current) cyRef.current.destroy(); };
  }, [dfa]);

  // Handle Highlights without full re-render
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().removeClass('active');
    cy.edges().removeClass('active-edge');

    // Highlight path up to current step
    let state = dfa.initial?.name;
    if (state) cy.getElementById(state).addClass('active');

    for (let i = 0; i < currentStepIdx; i++) {
        const { from, to, sym } = stepSequence[i];
        cy.getElementById(from).removeClass('active');
        cy.getElementById(`${from}-${to}-${sym}`).removeClass('active-edge');
        cy.getElementById(to).addClass('active');
        state = to;
    }

    if (currentStepIdx < stepSequence.length) {
        const { from, to, sym } = stepSequence[currentStepIdx];
        if (subStep >= 1) cy.getElementById(`${from}-${to}-${sym}`).addClass('active-edge');
        if (subStep >= 2) {
            cy.getElementById(from).removeClass('active');
            cy.getElementById(`${from}-${to}-${sym}`).removeClass('active-edge');
            cy.getElementById(to).addClass('active');
        }
    }
  }, [currentStepIdx, subStep, stepSequence, dfa]);

  return <div ref={containerRef} className="w-full h-[500px] bg-slate-50 border border-slate-200 rounded-2xl shadow-inner" />;
};
