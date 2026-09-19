// CONFIGURAÇÕES DA ROLETA EUROPEIA (BETANO)
const vermelhos = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

// Mapa dos vizinhos da roleta europeia (para calcular números próximos)
const vizinhosMesa = {
  0: [26, 32], 1: [20, 33], 2: [21, 25], 3: [26, 35], 4: [19, 21],
  5: [10, 24], 6: [27, 34], 7: [28, 29], 8: [11, 23], 9: [22, 31],
  10: [5, 23], 11: [8, 30], 12: [28, 35], 13: [27, 36], 14: [20, 31],
  15: [19, 32], 16: [24, 33], 17: [25, 34], 18: [6, 22], 19: [4, 15],
  20: [1, 14], 21: [2, 4], 22: [9, 18], 23: [8, 10], 24: [5, 16],
  25: [2, 17], 26: [0, 3], 27: [6, 13], 28: [7, 12], 29: [7, 18],
  30: [11, 36], 31: [9, 14], 32: [0, 15], 33: [1, 16], 34: [6, 17],
  35: [3, 12], 36: [13, 30]
};

let historico = [];
let vitorias = 0;
let derrotas = 0;

// Atalho da tecla Enter
document.getElementById('numInput').addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    adicionarNumero();
  }
});

function getCor(num) {
  if (num === 0) return 'verde';
  return vermelhos.includes(num) ? 'vermelho' : 'preto';
}

function getDuzia(num) {
  if (num === 0) return 0;
  if (num <= 12) return 1;
  if (num <= 24) return 2;
  return 3;
}

function getColuna(num) {
  if (num === 0) return 0;
  if ([1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].includes(num)) return 1;
  if ([2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].includes(num)) return 2;
  return 3;
}

function adicionarNumero() {
  const input = document.getElementById('numInput');
  const val = parseInt(input.value);

  if (isNaN(val) || val < 0 || val > 36) {
    alert('Mestre, insira um número válido entre 0 e 36.');
    return;
  }

  historico.unshift(val);
  input.value = '';
  input.focus();

  atualizarHistoricoUI();
  analisarEPrever();
}

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

// MOTOR DE PALPITE DIRETO EM NÚMEROS
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

  const ult = historico[0]; // Último número sorteado
  const penult = historico[1];
  const antepenult = historico[2];

  let numeroAlvo = 17; // Número padrão para o palpite
  let protecao = [];

  // Estratégia 1: Calcular com base nos vizinhos de roleta do último número
  if (vizinhosMesa[ult]) {
    numeroAlvo = vizinhosMesa[ult][0];
    protecao = [vizinhosMesa[ult][1], 0];
  }

  // Estratégia 2: Se repetiu cor ou paridade, buscar inversão nos números chaves
  if (getCor(ult) === getCor(penult) && getCor(penult) === getCor(antepenult)) {
    // Escolhe um número forte da cor oposta
    numeroAlvo = getCor(ult) === 'vermelho' ? 20 : 19;
    protecao = [numeroAlvo === 20 ? 31 : 27, 0];
  }

  // Montagem da indicação direta
  const corAlvo = getCor(numeroAlvo).toUpperCase();
  const textoPalpite = `🎲 APOSTA SECA: NÚMERO ${numeroAlvo} (${corAlvo})`;
  const textoProtecao = `Proteger nos números: ${protecao.join(', ')}`;

  predText.innerText = textoPalpite;
  details.innerText = textoProtecao;
  details.style.display = 'block';
  feedbackGroup.style.display = 'flex';
}

function registrarFeedback(acertou) {
  if (acertou) {
    vitorias++;
  } else {
    derrotas++;
  }

  const total = vitorias + derrotas;
  const taxa = total > 0 ? ((vitorias / total) * 100).toFixed(0) : 0;

  document.getElementById('scoreWin').innerText = vitorias;
  document.getElementById('scoreLoss').innerText = derrotas;
  document.getElementById('scoreRate').innerText = `${taxa}%`;

  document.getElementById('feedbackGroup').style.display = 'none';
  document.getElementById('predictionText').innerText = "Aguardando próxima jogada do Mestre...";
  document.getElementById('analysisDetails').style.display = 'none';
}
