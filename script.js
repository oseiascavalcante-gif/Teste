const perguntas = [
    "Você precisa de ajustes de contraste para ler com clareza?",
    "Você utiliza leitores de tela durante a navegação?",
    "Sente facilidade para navegar usando comandos do mouse?",
    "Deseja salvar suas respostas ao final?"
];

let indiceAtual = 0;
const respostas = [];
let encerrado = false;
let nivelZoomAtual = 1.0;

const elementoPergunta = document.getElementById('texto-pergunta');
const logContainer = document.getElementById('log-container');
const listaRespostas = document.getElementById('lista-respostas');
const btnTema = document.getElementById('btn-tema');
const regua = document.getElementById('regua-leitura');

/* NAVEGAÇÃO DE TELAS COM FOCO ACESSÍVEL */
function navegarPara(idDaTela) {
    const secoes = document.querySelectorAll('.tela-conteudo');
    secoes.forEach(sec => sec.style.display = 'none');

    const telaDestino = document.getElementById(idDaTela);
    if (telaDestino) {
        telaDestino.style.display = 'block';
        const titulo = telaDestino.querySelector('h2');
        if (titulo) {
            titulo.setAttribute('tabindex', '-1');
            titulo.focus();
            falarTexto(`Tela: ${titulo.textContent}`);
        }
    }
}

/* REGUA DE LEITURA (ACOMPANHA O MOUSE) */
document.addEventListener('mousemove', (e) => {
    if (regua.style.display === 'block') {
        regua.style.top = `${e.clientY - 20}px`;
    }
});

function alternarReguaLeitura() {
    const ativa = regua.style.display === 'block';
    regua.style.display = ativa ? 'none' : 'block';
    falarTexto(ativa ? "Régua de leitura desativada" : "Régua de leitura ativada");
}

/* FONTE PARA DISLEXIA */
function alternarFonteDislexia() {
    document.body.classList.toggle('fonte-dislexia');
    const ativa = document.body.classList.contains('fonte-dislexia');
    localStorage.setItem('fonteDislexia', ativa);
    falarTexto(ativa ? "Fonte para dislexia ativada" : "Fonte padrão ativada");
}

/* ZOOM E TEMA */
function alterarZoom(delta) {
    nivelZoomAtual = Math.min(Math.max(nivelZoomAtual + delta, 0.8), 1.6);
    document.documentElement.style.setProperty('--escala-zoom', nivelZoomAtual);
    falarTexto(`Zoom em ${Math.round(nivelZoomAtual * 100)} porcento`);
}

function redefinirZoom() {
    nivelZoomAtual = 1.0;
    document.documentElement.style.setProperty('--escala-zoom', nivelZoomAtual);
    falarTexto("Zoom redefinido");
}

function alternarTema() {
    const temaAtual = document.documentElement.getAttribute('data-tema');
    if (temaAtual === 'claro') {
        document.documentElement.removeAttribute('data-tema');
        btnTema.textContent = '☀️ Modo Claro';
        localStorage.setItem('tema', 'escuro');
        falarTexto("Modo escuro ativado");
    } else {
        document.documentElement.setAttribute('data-tema', 'claro');
        btnTema.textContent = '🌙 Modo Escuro';
        localStorage.setItem('tema', 'claro');
        falarTexto("Modo claro ativado");
    }
}

/* SÍNTESE DE VOZ E QUESTIONÁRIO */
function falarTexto(texto) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const mensagem = new SpeechSynthesisUtterance(texto);
        mensagem.lang = 'pt-BR';
        window.speechSynthesis.speak(mensagem);
    }
}

function atualizarPergunta() {
    if (indiceAtual < perguntas.length) {
        const proxima = perguntas[indiceAtual];
        elementoPergunta.textContent = proxima;
        falarTexto(proxima);
    } else {
        exibirResultados();
    }
}

function registrarResposta(resposta) {
    if (indiceAtual < perguntas.length && !encerrado) {
        respostas.push({ pergunta: perguntas[indiceAtual], resposta: resposta });
        falarTexto(`Resposta: ${resposta}`);
        indiceAtual++;
        setTimeout(atualizarPergunta, 800);
    }
}

window.addEventListener('keydown', (e) => {
    if (encerrado) return;
    const tecla = e.key.toLowerCase();
    if (tecla === 's' || e.key === 'ArrowRight') registrarResposta('SIM');
    else if (tecla === 'n' || e.key === 'ArrowLeft') registrarResposta('NÃO');
});

function exibirResultados() {
    encerrado = true;
    document.querySelector('.pergunta-card').style.display = 'none';
    logContainer.style.display = 'block';
    logContainer.focus();
    listaRespostas.innerHTML = '';
    falarTexto("Questionário concluído.");
    
    respostas.forEach((item) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${item.pergunta}</strong>: ${item.resposta}`;
        listaRespostas.appendChild(li);
    });
}

/* CARREGAR PREFERÊNCIAS SALVAS */
window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('tema') === 'claro') alternarTema();
    if (localStorage.getItem('fonteDislexia') === 'true') alternarFonteDislexia();
    atualizarPergunta();
});
