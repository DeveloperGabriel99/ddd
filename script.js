// --- Definitions ---
const skillsDef = [
  ["Acrobacia","des"],["Arcanismo","int"],["Atletismo","for"],["Atuação","car"],["Enganação","car"],
  ["Furtividade","des"],["História","int"],["Intimidação","car"],["Intuição","sab"],["Investigação","int"],
  ["Lidar com Animais","sab"],["Medicina","sab"],["Natureza","int"],["Percepção","sab"],["Persuasão","car"],
  ["Prestidigitação","des"],["Religião","int"],["Sobrevivência","sab"]
];
function modFromScore(score){ const s=parseInt(score||0,10); return Math.floor((s-10)/2); }
function fmtMod(n){ return (n>=0? "+"+n: n.toString()); }

function renderSkills(){
  const wrap = document.getElementById('skills');
  wrap.innerHTML = '';
  skillsDef.forEach(([name,ab])=>{
    const line = document.createElement('div');
    line.className = 'skill';
    line.innerHTML = `<input type="checkbox" data-skill="${name}" data-ability-ref="${ab}"> ${name} <span class="val mono" data-skill-mod="${name}">+0</span>`;
    wrap.appendChild(line);
  });
}

function recalc(){
  // ability modifiers
  document.querySelectorAll('.abilityV').forEach(box=>{
    const input = box.querySelector('.score');
    const modEl = box.querySelector('[data-mod]');
    const m = modFromScore(input.value);
    modEl.textContent = fmtMod(m);
  });
  const prof = parseInt(document.getElementById('prof-bonus').value||0,10);
  ['for','des','con','int','sab','car'].forEach(k=>{
    const score = document.querySelector(`.abilityV[data-ability="${k}"] .score`).value;
    let m = modFromScore(score);
    const chk = document.querySelector(`[data-save="${k}"]`);
    if(chk && chk.checked) m += prof;
    const el = document.querySelector(`[data-save-mod="${k}"]`); if(el) el.textContent = fmtMod(m);
  });
  skillsDef.forEach(([name,ab])=>{
    const score = document.querySelector(`.abilityV[data-ability="${ab}"] .score`).value;
    let m = modFromScore(score);
    const chk = document.querySelector(`[data-skill="${name}"]`);
    if(chk && chk.checked) m += prof;
    const el = document.querySelector(`[data-skill-mod="${name}"]`); if(el) el.textContent = fmtMod(m);
  });
  const sab = document.querySelector('.abilityV[data-ability="sab"] .score').value;
  const intS = document.querySelector('.abilityV[data-ability="int"] .score').value;
  document.getElementById('passive-perception').value = 10 + modFromScore(sab) + (document.querySelector('[data-skill="Percepção"]').checked? prof:0);
  document.getElementById('passive-insight').value = 10 + modFromScore(sab) + (document.querySelector('[data-skill="Intuição"]').checked? prof:0);
  document.getElementById('passive-investigation').value = 10 + modFromScore(intS) + (document.querySelector('[data-skill="Investigação"]').checked? prof:0);
  const des = document.querySelector('.abilityV[data-ability="des"] .score').value;
  document.getElementById('initiative').value = modFromScore(des);

  // spell DC/ATK if ability set
  const abi = (document.getElementById('spell-abi')?.value||'').trim().toLowerCase();
  const map = {int:'int', inteligencia:'int', sab:'sab', sabedoria:'sab', car:'car', carisma:'car'};
  const key = map[abi];
  if(key){
    const sc = parseInt(document.querySelector(`.abilityV[data-ability="${key}"] .score`).value||0,10);
    const m = modFromScore(sc);
    const profB = parseInt(document.getElementById('prof-bonus').value||0,10);
    const dcEl = document.getElementById('spell-dc'); if(dcEl) dcEl.value = 8 + profB + m;
    const atkEl = document.getElementById('spell-atk'); if(atkEl) atkEl.value = profB + m;
  }
}

function addAttack(){
  const tb = document.getElementById('attacks');
  const tr = document.createElement('tr');
  tr.innerHTML = `<td><input type="text" placeholder="Espada longa"></td>
  <td><input type="text" class="mono" placeholder="+5"></td>
  <td><input type="text" class="mono" placeholder="1d8+3 cortante"></td>
  <td><input type="text" placeholder="Versátil"></td>`;
  tb.appendChild(tr);
}

function renderSpellsGrid(){
  const wrap = document.getElementById('spells-grid');
  if(!wrap) return;
  let html = '';
  for(let n=0;n<=9;n++){
    html += `<div class="spell-card" data-lvl="${n}">
      <div class="spell-head2">
        <div class="lv-badge">${n}</div>
        ${n===0?`<div class="spell-title"><div class="label">Truques</div><input id="title0" type="text"></div>`:
        `<div class="pill2"><div class="mini"><div class="label">Total de Espaços</div><input id="s${n}" type="number" class="mono" value="0"></div><div class="mini"><div class="label">Espaços Gastos</div><input id="u${n}" type="number" class="mono" value="0"></div></div>`}
      </div>
      ${n>0?`<div class="spell-title"><div class="label">Nome da Magia</div><input id="title${n}" type="text"></div>`:''}
      <div class="dots" id="list${n}">
        ${Array.from({length:14}).map(()=>`<div class='row'><div class='dot'></div><input type='text'></div>`).join('')}
      </div>
    </div>`;
  }
  wrap.innerHTML = html;
}

function clearAll(){
  document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(el=>{
    if(el.id==='prof-bonus') el.value=2; else if(el.classList.contains('score')) el.value=10; else if(el.id&&el.id.startsWith('passive-')) el.value=10; else el.value='';
  });
  document.querySelectorAll('input[type="checkbox"]').forEach(el=> el.checked=false);
  const tb = document.getElementById('attacks'); if(tb){ tb.innerHTML=''; addAttack(); addAttack(); addAttack(); }
  renderSpellsGrid();
  recalc();
}

document.addEventListener('input', e=>{
  if(e.target.matches('.score, #prof-bonus, [data-save], [data-skill], #spell-abi')) recalc();
});

function prefillAurelio(){
  const set = (id, val)=>{ const el=document.getElementById(id); if(el) el.value=val; };
  set('char-name','Aurélio da Chama Santa');
  set('class-level','Clérigo 1');
  set('background','Acólito');
  set('race','Draconato (Vermelho)');
  set('alignment','Leal Bom');
  set('xp',0);

  // Atributos
  const setScore=(k,v)=>{ const el=document.querySelector(`.abilityV[data-ability="${k}"] .score`); if(el) el.value=v; };
  setScore('for',15);
  setScore('des',10);
  setScore('con',14);
  setScore('int',12);
  setScore('sab',16);
  setScore('car',13);
  set('prof-bonus',2);

  // Saves proficient: Sabedoria, Carisma (Clérigo)
  const chk=(sel)=>{ const el=document.querySelector(sel); if(el) el.checked=true; };
  chk('[data-save="sab"]');
  chk('[data-save="car"]');

  // Perícias: Religião, Intuição
  chk('[data-skill="Religião"]');
  chk('[data-skill="Intuição"]');

  // Combate
  set('ac',18);
  set('speed','9 m');
  set('hp-max',10);
  set('hp-current',10);
  set('hp-temp',0);
  set('hit-dice','1d8');

  // Ataques
  const tb = document.getElementById('attacks');
  if(tb){
    tb.innerHTML = '';
    tb.insertAdjacentHTML('beforeend', `<tr><td><input type="text" value="Maça"></td><td><input type="text" class="mono" value="+4"></td><td><input type="text" class="mono" value="1d6+2 concussão"></td><td><input type="text" value="Corpo a corpo"></td></tr>`);
    tb.insertAdjacentHTML('beforeend', `<tr><td><input type="text" value="Ataque de Magia"></td><td><input type="text" class="mono" value="+5"></td><td><input type="text" class="mono" value="Varia"></td><td><input type="text" value="Conjuração"></td></tr>`);
    tb.insertAdjacentHTML('beforeend', `<tr><td><input type="text" value="Sopro Dracônico"></td><td><input type="text" class="mono" value="—"></td><td><input type="text" class="mono" value="2d6 fogo (cone 4,5 m, CD 13)"></td><td><input type="text" value="1 descanso curto"></td></tr>`);
  }

  // Equipamentos
  const eq = [
    'Maça',
    'Escudo com símbolo sagrado da chama',
    'Cota de malha',
    'Pacote de sacerdote (incenso, vestes, textos sagrados, etc.)'
  ].join('\n');
  set('equipment', eq);

  // Outras proficiências & Idiomas
  const profText = [
    'Armaduras: leves, médias, escudos',
    'Armas: simples',
    'Testes de Resistência: Sabedoria, Carisma',
    'Idiomas: Comum, Dracônico, Celestial'
  ].join('\n');
  const profEl = document.getElementById('proficiencies'); if(profEl) profEl.value = profText;

  // Personalidade
  set('traits','Sempre busca ajudar os necessitados.');
  set('ideals','O fogo da fé deve iluminar até os lugares mais sombrios.');
  set('bonds','O templo que o acolheu é sua verdadeira família.');
  set('flaws','Fanatismo — acredita demais em seu destino sagrado.');

  // História
  set('backstory','Aurélio foi criado em um templo consagrado ao fogo sagrado. Desde pequeno acreditava ser escolhido para carregar a chama divina dos deuses da luz. Sua fé ardente se mistura ao seu sangue dracônico, tornando-o uma figura tanto temida quanto respeitada.\nEle é disciplinado, justo e movido pela convicção de purificar as trevas com fogo sagrado.');

  // Características & Talentos
  const features = [
    'Habilidades Raciais — Draconato (Vermelho):',
    '- Ancestral Dracônico: Fogo',
    '- Arma de Sopro: cone 4,5 m, Destreza CD 13, 2d6 fogo (1 descanso curto/long)',
    '- Resistência a Fogo',
    '',
    'Habilidades de Classe — Clérigo (Domínio da Luz):',
    '- Truque Bônus: Luz',
    '- Canalizar Divindade: Raio da Alvorada (a partir do nível 2)',
    '- Conjurador: Sabedoria; Preparação: Sabedoria + nível de clérigo'
  ].join('\n');
  set('features', features);

  // Magias
  set('spell-class','Clérigo');
  set('spell-abi','Sabedoria');
  const cantrips = ['Luz','Chama Sagrada','Taumaturgia'];
  const lvl1 = ['Cura pelas Mãos','Escudo da Fé','Raio Guiador'];
  const fillList=(listId,names)=>{
    const inputs = document.querySelectorAll(`#${listId} input`);
    names.forEach((name,idx)=>{ if(inputs[idx]) inputs[idx].value = name; });
  };
  // Ensure grid exists before filling
  fillList('list0', cantrips);
  fillList('list1', lvl1);
  const s1=document.getElementById('s1'); if(s1) s1.value=2;
  const u1=document.getElementById('u1'); if(u1) u1.value=0;
}

window.addEventListener('DOMContentLoaded', ()=>{
  renderSkills();
  renderSpellsGrid();
  prefillAurelio();
  recalc();
});


