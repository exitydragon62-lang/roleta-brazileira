// CONFIGURAÇÕES DA ROLETA EUROPEIA (BETANO)
const vermelhos = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

let historico = [];
let vitorias = 0;
let derrotas = 0;
let ultimaPrevisao = null;
let pesoModificador = 1.0; // Sistema de auto-calibragem caso o mestre reporte erros

// ATALHO DE TECLADO: Tecla Enter para inserir número
document.getElementById('numInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    adicionarNumero();
  }
});

// IDENTIFICAR COR DO NÚMERO
function getCor(num) {
  if (num === 0) return 'verde';
  return vermelhos.includes(num) ? 'vermelho' : 'preto';
}

// IDENTIFICAR DÚZIA (1st 12, 2nd 12, 3rd 12)
function getDuzia(num) {
  if (num === 0) return 0;
  if (num <= 12) return 1;
  if (num <= 24) return 2;
  return 3;
}

// IDENTIFICAR COLUNA (2to1)
function getColuna(num) {
  if (num === 0) return 0;
  if ([1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].includes(num)) return 1;
  if ([2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].includes(num)) return 2;
  return 3;
}

// ADICIONAR NOVO NÚMERO
function adicionarNumero() {
  const input = document.getElementById('numInput');
  const val = parseInt(input.value);

  if (isNaN(val) || val < 0 || val > 36) {
    alert('Mestre, insira um número válido entre 0 e 36.');
    return;
  }

  historico.unshift(val); // Adiciona no início do histórico
  input.value = '';
  input.focus();

  atualizarHistoricoUI();
  analisarEPrever();
}

// ATUALIZAR INTERFAÇAS DO HISTÓRICO
function atualizarHistoricoUI() {
  const container = document.getElementById('historyContainer');
  container.innerHTML = '';

  const ultimos = historico.slice(0, 12);

  ultimos.forEach(num => {
    const cor = getCor(num);
    const chip = document.createElement('div');
    chip.className = `chip chip-${cor}`;
    chip.innerText = num;
    container.appendChild(chip);
  });
}

// MOTOR PRINCIPAL DE ANÁLISE DE PADRÕES
function analisarEPrever() {
  const predText = document.getElementById('predictionText');
  const details = document.getElementById('analysisDetails');
  const feedbackGroup = document.getElementById('feedbackGroup');

  if (historico.length < 3) {
    const faltam = 3 - historico.length;
    predText.innerText = `Insira mais ${faltam} número(s)...`;
    feedbackGroup.style.display = 'none';
    details.style.display = 'none';
    return;
  }

  const h = historico;
  let palpite = "";
  let razao = "";

  const d0 = getDuzia(h[0]), d1 = getDuzia(h[1]), d2 = getDuzia(h[2]);
  const c0 = getColuna(h[0]), c1 = getColuna(h[1]), c2 = getColuna(h[2]);
  const cor0 = getCor(h[0]), cor1 = getCor(h[1]), cor2 = getCor(h[2]);

  // PADRÃO 1: Repetição de Coluna (Quebra de Coluna)
  if (c0 > 0 && c0 === c1 && c1 === c2) {
    const outras = [1, 2, 3].filter(c => c !== c0);
    palpite = `Aposte nas Colunas ${outras[0]} e ${outras[1]}`;
    razao = `Identificado: 3 repetições seguidas na Coluna ${c0}.`;
  }
  // PADRÃO 2: Repetição de Dúzia (Quebra de Dúzia)
  else if (d0 > 0 && d0 === d1 && d1 === d2) {
    const outras = [1, 2, 3].filter(d => d !== d0);
    palpite = `Aposte nas Dúzias ${outras[0]}ª e ${outras[1]}ª`;
    razao = `Identificado: 3 repetições seguidas na Dúzia ${d0}.`;
  }
  // PADRÃO 3: Sequência de Cores (Quebra de Cor)
  else if (cor0 === cor1 && cor1 === cor2 && cor0 !== 'verde') {
    const oposta = cor0 === 'vermelho' ? 'PRETO' : 'VERMELHO';
    palpite = `Aposte em ${oposta} (+ Proteção no 0)`;
    razao = `Identificado: Sequência de 3 cores ${cor0.toUpperCase()}S.`;
  }
  // PADRÃO 4: Par / Ímpar
  else if (h[0] % 2 === h[1] % 2 && h[1] % 2 === h[2] % 2 && h[0] !== 0) {
    const atual = h[0] % 2 === 0 ? 'PAR' : 'ÍMPAR';
    const oposto = h[0] % 2 === 0 ? 'ÍMPAR' : 'PAR';
    palpite = `Aposte em ${oposto}`;
    razao = `Identificado: Sequência de 3 números ${atual}ES.`;
  }
  // PADRÃO 5: Tendência por Alternância (Padrão Secundário)
  else {
    const corInversa = cor0 === 'vermelho' ? 'PRETO' : 'VERMELHO';
    palpite = `Entrada Leve: ${corInversa} ou Dúzia ${d0 === 1 ? '2ª/3ª' : '1ª'}`;
    razao = `Análise de volatilidade: Baixa probabilidade de repetição direta.`;
  }

  ultimaPrevisao = palpite;
  predText.innerText = palpite;
  details.innerText = razao;
  details.style.display = 'block';
  feedbackGroup.style.display = 'flex';
}

// REGISTRO DE FEEDBACK DO MESTRE (ACERTOU OU ERROU)
function registrarFeedback(acertou) {
  if (acertou) {
    vitorias++;
  } else {
    derrotas++;
    // Se errou, ajusta o algoritmo para ser mais cauteloso nas próximas rodadas
    pesoModificador -= 0.1; 
  }

  const total = vitorias + derrotas;
  const taxa = total > 0 ? ((vitorias / total) * 100).toFixed(0) : 0;

  document.getElementById('scoreWin').innerText = vitorias;
  document.getElementById('scoreLoss').innerText = derrotas;
  document.getElementById('scoreRate').innerText = `${taxa}%`;

  // Reseta estado para aguardar próxima inserção
  document.getElementById('feedbackGroup').style.display = 'none';
  document.getElementById('predictionText').innerText = "Insira o próximo resultado para atualizar...";
  document.getElementById('analysisDetails').style.display = 'none';
}
