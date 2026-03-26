// Simulador AFD — paso a paso en 3 fases por transición
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const byId = (id) => document.getElementById(id);

function parseList(input) {
  if (!input) return [];
  const raw = input.includes('\n') ? input.split(/\r?\n/) : input.split(',');
  return raw.map(s => s.trim()).filter(Boolean);
}
function unique(arr){ return Array.from(new Set(arr)); }

class State{
  constructor(name, isInitial=false, isFinal=false){
    this.name = name;
    this.isInitial = isInitial;
    this.isFinal = isFinal;
    this.transitions = new Map();
  }
  addTransition(symbol, to){ this.transitions.set(symbol, to); }
  getNext(symbol){ return this.transitions.get(symbol); }
}
class DFA{
  constructor(){
    this.states = new Map();
    this.initial = null;
    this.alphabet = [];
  }
  reset(){ this.states.clear(); this.initial = null; this.alphabet = []; }
  addState(name,{initial=false,final=false}={}){
    if(!this.states.has(name)){
      this.states.set(name, new State(name, initial, final));
    }
    const st = this.states.get(name);
    if(initial){ this.initial = st; st.isInitial = true; }
    if(final){ st.isFinal = true; }
    return st;
  }
  addTransition(from, symbol, to){
    const a = this.states.get(from), b = this.states.get(to);
    if(!a || !b) throw new Error(`Transición inválida: ${from},${symbol},${to}`);
    a.addTransition(symbol, b);
  }
  runChain(chain){
    let current = this.initial; const path = [current?.name ?? '?'];
    for(const s of chain){
      const next = current?.getNext(s);
      if(!next) return {accepted:false, path, ended: current?.name ?? '?'};
      current = next; path.push(current.name);
    }
    return {accepted: !!current?.isFinal, path, ended: current?.name ?? '?'};
  }
}

let cy = null;
function initCy(){
  if(cy){ cy.destroy(); }
  cy = cytoscape({
    container: document.getElementById('cy'),
    style: [
      { selector: 'node', style: {
        'label': 'data(label)',
        'text-valign':'center',
        'text-halign':'center',
        'background-color':'#61bffc',
        'width': 56,
        'height': 56,
        'color':'#0b1021',          // color del texto de los nodos
        'font-size':'14px',
        'border-width': 'data(border)',
        'border-color':'#f59e0b'
      }},
      { selector: 'edge', style: {
        'label':'data(label)',
        'width': 3,
        'line-color':'#94a3b8',
        'target-arrow-color':'#94a3b8',
        'target-arrow-shape':'triangle',
        'curve-style':'bezier',
        'control-point-step-size': 60,   // separa aristas paralelas
        'text-rotation':'autorotate',
        'font-size':'18px',              // ← MÁS GRANDE
        'color':'#e5e7eb',               // ← texto claro en el label
        'text-background-opacity': 0.95, // ← cajita detrás del label
        'text-background-color':'#0b1021',
        'text-background-shape':'round',
        'text-background-padding': 3
      }},
      { selector: '.active', style: { 'background-color':'#FFD700' } },
      { selector: '.active-edge', style: {
        'line-color':'#ff7a18',
        'target-arrow-color':'#ff7a18'
      }},
      { selector: '.final', style: { 'border-width': 4 } }
    ],
    layout: { name:'cose', animate:true }
  });
}

function drawDFA(dfa){
  initCy();
  const elements = [];
  for(const st of dfa.states.values()){
    elements.push({ group:'nodes', data:{ id:st.name, label:st.name, border: st.isFinal ? 4 : 0 } });
  }
  for(const st of dfa.states.values()){
    for(const [sym, to] of st.transitions){
      elements.push({ group:'edges', data:{ id:`${st.name}-${to.name}-${sym}`, source:st.name, target:to.name, label:sym } });
    }
  }
  cy.add(elements);
  cy.layout({ name:'cose', animate:true }).run();
}
function highlightNode(id, on=true){
  const n = cy.getElementById(id);
  if(n) n.toggleClass('active', on);
}
function highlightEdge(from,to,sym,on=true){
  const e = cy.getElementById(`${from}-${to}-${sym}`);
  if(e) e.toggleClass('active-edge', on);
}
function resetHighlights(){
  if(!cy) return;
  cy.nodes().removeClass('active');
  cy.edges().removeClass('active-edge');
}

function renderTransitionsTable(dfa){
  const head = byId('head-simbolos');
  const body = byId('body-transiciones');
  head.innerHTML = '<th>Estado</th>' + dfa.alphabet.map(a=>`<th>${a}</th>`).join('');
  body.innerHTML = '';
  for(const st of dfa.states.values()){
    const tds = dfa.alphabet.map(a=> (st.getNext(a)?.name ?? '—'));
    const tr = document.createElement('tr');
    tr.id = `row-${st.name}`;
    tr.innerHTML = `<td>${st.name}</td>` + tds.map(x=>`<td>${x}</td>`).join('');
    body.appendChild(tr);
  }
}
function highlightRow(stateName){
  $$('#body-transiciones tr').forEach(tr => tr.style.backgroundColor = '');
  const tr = byId(`row-${stateName}`);
  if(tr) tr.style.backgroundColor = '#1f2a44';
}

const dfa = new DFA();
let currentStateName = null;
let currentChainIdx = 0;
let stepSequence = []; // [{from,to,sym}]
let currentStepIdx = 0; // índice de transición
let subStep = 0;        // 0 estado, 1 arista, 2 destino
let paused = false;
let autoDelay = 800;    // ms por subpaso

function applyDefinitionFromInputs(){
  const alphabet = unique(parseList(byId('inp-simbolos').value.replace(/\s+/g,'')));
  const states   = unique(parseList(byId('inp-estados').value));
  const initial  = byId('inp-inicial').value.trim();
  const finals   = unique(parseList(byId('inp-finales').value));
  if(!alphabet.length) return alert('Defina al menos un símbolo.');
  if(!states.length) return alert('Defina al menos un estado.');
  if(!initial) return alert('Defina el estado inicial.');
  if(!states.includes(initial)) return alert('El estado inicial no existe.');
  for(const f of finals){ if(!states.includes(f)) return alert(`Estado final inexistente: ${f}`); }

  dfa.reset(); dfa.alphabet = alphabet;
  for(const s of states){
    dfa.addState(s, { initial: s===initial, final: finals.includes(s) });
  }
  const lines = parseList(byId('inp-transiciones').value.replace(/\r/g,''));
  for(const line of lines){
    const parts = line.split(',').map(x=>x.trim()).filter(Boolean);
    if(parts.length !== 3){ return alert(`Transición inválida: "${line}"`); }
    const [from, sym, to] = parts;
    if(!dfa.states.has(from) || !dfa.states.has(to)) return alert(`Estado inexistente en: ${line}`);
    if(!alphabet.includes(sym)) return alert(`Símbolo fuera del alfabeto en: ${line}`);
    dfa.addTransition(from, sym, to);
  }
  drawDFA(dfa);
  renderTransitionsTable(dfa);
  resetHighlights();
  alert('Definición aplicada.');
}

function parseChainsInput(){
  const raw = byId('inp-cadenas').value;
  if(!raw.trim()) return [];
  const lines = raw.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const chains = [];
  for(const line of lines){
    const arr = line.includes(',') ? line.split(',').map(s=>s.trim()) : line.split('');
    const onlyAlphabet = arr.every(s => dfa.alphabet.includes(s));
    if(!onlyAlphabet) { alert(`Cadena contiene símbolos fuera del alfabeto: ${line}`); return []; }
    chains.push(arr);
  }
  return chains;
}

function renderResultsTable(results){
  const tbody = byId('tabla-resultados').querySelector('tbody');
  tbody.innerHTML = '';
  results.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.className = r.accepted ? 'accepted' : 'rejected';
    const badge = r.accepted ? '<span class="badge ok">ACEPTADA</span>' : '<span class="badge bad">RECHAZADA</span>';
    tr.innerHTML = `<td>${i+1}</td><td>${r.chain.join(',')}</td><td>${r.path.join(' → ')}</td><td>${badge}</td>`;
    tbody.appendChild(tr);
  });
}




function simulateAll(){
  if(!dfa.initial) return alert('Aplique la definición del AFD primero.');
  const chains = parseChainsInput(); if(!chains.length) return;
  const results = chains.map(chain => {
    const res = dfa.runChain(chain);
    return { chain, path: res.path, accepted: res.accepted };
  });
  renderResultsTable(results);
  currentChainIdx = 0;
}


function buildStepSequenceForChain(chain){
  stepSequence = []; currentStateName = dfa.initial?.name ?? null;
  if(!currentStateName) return false;
  for(const sym of chain){
    const from = currentStateName;
    const next = dfa.states.get(from)?.getNext(sym);
    if(!next){ alert(`Sin transición desde ${from} con símbolo "${sym}"`); return false; }
    stepSequence.push({from, to: next.name, sym});
    currentStateName = next.name;
  }
  currentStateName = dfa.initial.name;
  currentStepIdx = 0;
  subStep = 0;
  return true;
}

function renderUpTo(stepIdx, phase){
  resetHighlights();
  let state = dfa.initial.name;
  highlightNode(state, true);
  highlightRow(state);

  for(let i=0;i<stepIdx;i++){
    const {from,to,sym} = stepSequence[i];
    highlightNode(from, false);
    highlightEdge(from,to,sym, false);
    highlightNode(to, true);
    highlightRow(to);
    state = to;
  }

  if(stepIdx < stepSequence.length){
    const {from,to,sym} = stepSequence[stepIdx];
    if(phase >= 1){
      highlightEdge(from,to,sym, true);
    }
    if(phase >= 2){
      highlightNode(from, false);
      highlightEdge(from,to,sym, false);
      highlightNode(to, true);
      highlightRow(to);
      state = to;
    }
  }
  currentStateName = state;
}

function startStepByStep(){
  if(!dfa.initial) return alert('Aplique la definición del AFD primero.');
  const chains = parseChainsInput(); if(!chains.length) return;
  const chain = chains[currentChainIdx] ?? chains[0];
  const ok = buildStepSequenceForChain(chain);
  if(!ok) return;
  activeChain = chain;
  paused = false;
  renderUpTo(0, 0);
  scheduleNextTick();
}

function scheduleNextTick(){
  if(paused) return;
  setTimeout(tickStep, autoDelay);
}

function tickStep(){
  if(paused) return;

  // fin total
  if(currentStepIdx >= stepSequence.length && subStep === 0){
    const res = dfa.runChain(activeChain || []);
    explainOutcome(activeChain || [], res.path, res.accepted);
    return;
  }

  subStep = (subStep + 1) % 3;

  if(subStep === 1){
    renderUpTo(currentStepIdx, 1);
  } else if(subStep === 2){
    renderUpTo(currentStepIdx, 2);
  } else {
    currentStepIdx++;
    if(currentStepIdx >= stepSequence.length){
      const res = dfa.runChain(activeChain || []);
      explainOutcome(activeChain || [], res.path, res.accepted);
      return;
    }
    renderUpTo(currentStepIdx, 0);
  }
  scheduleNextTick();
}


window.addEventListener('DOMContentLoaded', () => {
  initCy();
  byId('menu-abrir').onclick = () => byId('file-open').click();
  byId('menu-nuevo').onclick = () => { byId('btn-limpiar').click(); };
  byId('menu-guardar').onclick = saveToFile;
  byId('menu-salir').onclick = () => location.reload();
  byId('menu-ayuda').onclick = () => byId('dlg-ayuda').showModal();
  byId('menu-acerca').onclick = () => byId('dlg-acerca').showModal();
  $$('.dropdown-content [data-example]').forEach(btn => btn.addEventListener('click', () => loadExample(btn.dataset.example)));

  byId('btn-aplicar').onclick = applyDefinitionFromInputs;
  byId('btn-limpiar').onclick = () => {
    ['inp-simbolos','inp-estados','inp-inicial','inp-finales','inp-transiciones','inp-cadenas']
      .forEach(id => byId(id).value = '');
    dfa.reset(); initCy();
    byId('tabla-resultados').querySelector('tbody').innerHTML = '';
    byId('head-simbolos').innerHTML = '<th>Estado</th>';
    byId('body-transiciones').innerHTML = '';
    resetHighlights();
  };

  byId('btn-simular').onclick = simulateAll;
  byId('btn-paso').onclick = startStepByStep;
  byId('btn-pausa').onclick = () => { paused = true; };
  byId('btn-continuar').onclick = () => { if(paused){ paused = false; scheduleNextTick(); } };
  byId('btn-retroceder').onclick = stepBack;
  byId('file-open').addEventListener('change', handleOpenFile);
});

function stepBack(){
  if(currentStepIdx === 0 && subStep === 0){
    renderUpTo(0,0);
    return;
  }
  if(subStep === 0){
    currentStepIdx = Math.max(0, currentStepIdx - 1);
    subStep = 2;
    renderUpTo(currentStepIdx, subStep);
  } else {
    subStep -= 1;
    renderUpTo(currentStepIdx, subStep);
  }
}

function handleOpenFile(ev){
  const file = ev.target.files?.[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => { loadFromTxtFormat(String(reader.result)); };
  reader.readAsText(file);
}
function loadFromTxtFormat(txt){
  const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let step = null, alphabet=[], states=[], initial='', finals=[], transitionsRaw=[], chains=[];
  for(const line of lines){
    if(line.toLowerCase().startsWith('simbolos')){ step='sym'; alphabet = parseList(line.split(':')[1]??''); continue; }
    if(line.toLowerCase().startsWith('estados:')){ step='states'; states = parseList(line.split(':')[1]??''); continue; }
    if(line.toLowerCase().startsWith('estado inicial')){ step='initial'; initial = (line.split(':')[1]??'').trim(); continue; }
    if(line.toLowerCase().startsWith('estados de aceptación') || line.toLowerCase().startsWith('estados de aceptacion')){
      step='finals'; finals = parseList(line.split(':')[1]??''); continue;
    }
    if(line.toLowerCase().startsWith('transiciones')){ step='trans'; continue; }
    if(line.toLowerCase().startsWith('cadenas a analizar')){ step='chains'; continue; }
    if(step==='trans'){ transitionsRaw.push(line); }
    else if(step==='chains'){ chains.push(line); }
  }
  byId('inp-simbolos').value = alphabet.join(',');
  byId('inp-estados').value = states.join(',');
  byId('inp-inicial').value = initial;
  byId('inp-finales').value = finals.join(',');
  let transTripletas = [];
  if(transitionsRaw.length && transitionsRaw[0].includes(',')){
    const containsArrow = transitionsRaw.some(x => x.includes('->') || x.split(',').length===3);
    if(containsArrow){
      for(const t of transitionsRaw){
        if(t.includes('->') && t.includes('=')){
          const [left,right] = t.split('=');
          const [from, sym] = left.split('->');
          transTripletas.push([from.trim(), sym.trim(), right.trim()]);
        }else if(t.split(',').length===3){
          transTripletas.push(t.split(',').map(s=>s.trim()));
        }
      }
    }else{
      const matrix = transitionsRaw.map(l => l.split(',').map(s=>s.trim()));
      states.forEach((st, rowIdx) => {
        (matrix[rowIdx]||[]).forEach((dest, colIdx) => {
          const sym = alphabet[colIdx];
          if(sym && dest) transTripletas.push([st, sym, dest]);
        });
      });
    }
  }
  byId('inp-transiciones').value = transTripletas.map(t=>t.join(',')).join('\n');
  byId('inp-cadenas').value = chains.join('\n');
  applyDefinitionFromInputs();
}

function saveToFile(){
  const alphabet = byId('inp-simbolos').value.trim();
  const states = byId('inp-estados').value.trim();
  const initial = byId('inp-inicial').value.trim();
  const finals = byId('inp-finales').value.trim();
  const trans = byId('inp-transiciones').value.trim().split(/\r?\n/).filter(Boolean);
  const chains = byId('inp-cadenas').value.trim().split(/\r?\n/).filter(Boolean);
  let content = `Simbolos: ${alphabet}
Estados: ${states}
Estado inicial: ${initial}
Estados de aceptación: ${finals}
Transiciones:
`;
  for(const t of trans){ content += t + '\n'; }
  content += `Cadenas a analizar:\n` + (chains.join('\n') || '') + '\n';
  const blob = new Blob([content], {type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'DFA_configuracion.txt';
  a.click();
  URL.revokeObjectURL(a.href);
}

function loadExample(key){
  const examples = {
    e1: { sym: '0,1', states: 'Q0,Q1,Q2,Q3', init: 'Q0', finals: 'Q0',
      trans: `Q0,0,Q2
Q0,1,Q1
Q1,0,Q3
Q1,1,Q0
Q2,0,Q0
Q2,1,Q3
Q3,0,Q1
Q3,1,Q1`,
      chains: `1,0,0,1
1,1,1
0,0` },
    e2: { sym: 'a,b', states: 'p,q,r', init: 'p', finals: 'q',
      trans: `p,a,q
p,b,r
q,a,q
q,b,r
r,a,r
r,b,r`,
      chains: `a,a,a,b,b,a,a
a
b,a` },
    e3: { sym: 'x,y', states: 'q0,q1,q2', init: 'q0', finals: 'q0,q2',
      trans: `q0,x,q0
q0,y,q1
q1,x,q1
q1,y,q2
q2,x,q2
q2,y,q2`,
      chains: `x,x,y,x,y
y,y
x` }
  };
  const ex = examples[key];
  if(!ex) return;
  byId('inp-simbolos').value = ex.sym;
  byId('inp-estados').value = ex.states;
  byId('inp-inicial').value = ex.init;
  byId('inp-finales').value = ex.finals;
  byId('inp-transiciones').value = ex.trans;
  byId('inp-cadenas').value = ex.chains;
  applyDefinitionFromInputs();
}


function setStatus(html, kind){ // kind: 'ok' | 'bad' | undefined
  const box = document.getElementById('status');
  if(!box) return;
  box.classList.remove('ok','bad');
  if(kind) box.classList.add(kind);
  box.innerHTML = html;
}

function explainOutcome(chainArr, pathArr, accepted){
  const cadena = chainArr.join(',');
  const recorrido = pathArr.join(' → ');
  const estadoFinal = pathArr[pathArr.length - 1];
  if(accepted){
    setStatus(
      ` <b>ACEPTADA</b>. La cadena <b>${cadena}</b> consumió todos los símbolos y terminó en el estado final <b>${estadoFinal}</b>. <br>Recorrido: ${recorrido}`,
      'ok'
    );
  }else{
    setStatus(
      ` <b>RECHAZADA</b>. La cadena <b>${cadena}</b> terminó en el estado <b>${estadoFinal}</b>, que no es de aceptación. <br>Recorrido: ${recorrido}`,
      'bad'
    );
  }
}
