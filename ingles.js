// ingles.js - Lógica específica para Inglês

// ---------- BANCO DE DADOS ----------
const LevelLibrary = {
    ingles: [
        {
            id: 'i1',
            title: 'I1 · Alphabet (trace)',
            type: 'trace',
            letters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
            instruction: 'Trace the letters.'
        },
        {
            id: 'i2',
            title: 'I2 · Simple words (3-4 letters)',
            type: 'wordbuilding',
            words: [
                { word: 'CAT', parts: ['C','A','T'] },
                { word: 'DOG', parts: ['D','O','G'] },
                { word: 'SUN', parts: ['S','U','N'] },
                { word: 'CAR', parts: ['C','A','R'] },
                { word: 'BED', parts: ['B','E','D'] },
                { word: 'BAG', parts: ['B','A','G'] },
                { word: 'HAT', parts: ['H','A','T'] },
                { word: 'FOG', parts: ['F','O','G'] },
                { word: 'LEG', parts: ['L','E','G'] },
                { word: 'ARM', parts: ['A','R','M'] }
            ],
            instruction: 'Put the letters together to form the word.'
        },
        {
            id: 'i3',
            title: 'I3 · Sight words',
            type: 'wordbuilding',
            words: [
                { word: 'THE', parts: ['T','H','E'] },
                { word: 'AND', parts: ['A','N','D'] },
                { word: 'FOR', parts: ['F','O','R'] },
                { word: 'YOU', parts: ['Y','O','U'] },
                { word: 'ARE', parts: ['A','R','E'] }
            ],
            instruction: 'Form the sight word.'
        }
    ]
};

// ---------- ESTADO ----------
let currentLevelId = 'i1';
let itemsPerPage = 8;
let currentZoom = 0.7;

// Parâmetros customizáveis
let customParams = {
    traceLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
    traceRepeat: 2,
    wordList: [
        { word: 'CAT', parts: ['C','A','T'] },
        { word: 'DOG', parts: ['D','O','G'] },
        { word: 'SUN', parts: ['S','U','N'] },
        { word: 'CAR', parts: ['C','A','R'] },
        { word: 'BED', parts: ['B','E','D'] },
        { word: 'BAG', parts: ['B','A','G'] },
        { word: 'HAT', parts: ['H','A','T'] },
        { word: 'FOG', parts: ['F','O','G'] },
        { word: 'LEG', parts: ['L','E','G'] },
        { word: 'ARM', parts: ['A','R','M'] }
    ],
    wordRepeat: 2
};

// ---------- FUNÇÕES DE GERAÇÃO DE ITENS POR TIPO ----------
function generateItemsForLevel(level) {
    if (!level) return [];

    let baseItems = [];

    switch (level.type) {
        case 'trace':
            customParams.traceLetters.forEach(letter => {
                for (let i = 0; i < customParams.traceRepeat; i++) {
                    baseItems.push({ type: 'trace', char: letter });
                }
            });
            break;

        case 'wordbuilding':
            customParams.wordList.forEach(wordObj => {
                for (let i = 0; i < customParams.wordRepeat; i++) {
                    baseItems.push({ type: 'word', word: wordObj.word, parts: wordObj.parts });
                }
            });
            break;

        default:
            return Array(itemsPerPage * 2).fill({ type: 'unknown' });
    }

    const target = itemsPerPage * 2;
    if (baseItems.length === 0) return Array(target).fill({ type: 'unknown' });
    let result = [];
    for (let i = 0; i < target; i++) {
        result.push({ ...baseItems[i % baseItems.length] });
    }
    return result;
}

// ---------- PAINEL DE PARÂMETROS DINÂMICO ----------
function updateParamPanel() {
    const level = LevelLibrary.ingles.find(l => l.id === currentLevelId);
    if (!level) return;

    let html = '';

    switch (level.type) {
        case 'trace':
            html = `
                <div class="param-control">
                    <div class="param-row">
                        <label>Letters (comma separated):</label>
                        <input type="text" id="traceLetters" value="${customParams.traceLetters.join(',')}" class="w-32">
                    </div>
                    <div class="param-row">
                        <label>Repetitions:</label>
                        <input type="number" id="traceRepeat" value="${customParams.traceRepeat}" min="1" max="5" class="w-16">
                    </div>
                </div>
            `;
            break;

        case 'wordbuilding':
            // Formato: WORD:part1,part2,part3; WORD2:part1,part2
            let wordString = customParams.wordList.map(w => `${w.word}:${w.parts.join(',')}`).join('; ');
            html = `
                <div class="param-control">
                    <div class="param-row">
                        <label>Words (WORD:part1,part2):</label>
                        <input type="text" id="wordList" value="${wordString}" class="w-32">
                    </div>
                    <div class="param-row">
                        <label>Repetitions:</label>
                        <input type="number" id="wordRepeat" value="${customParams.wordRepeat}" min="1" max="5" class="w-16">
                    </div>
                </div>
            `;
            break;

        default:
            html = '<div class="text-slate-400">No additional parameters.</div>';
    }

    paramPanel.innerHTML = html;
    attachParamEvents(level.type);
}

function attachParamEvents(type) {
    setTimeout(() => {
        if (type === 'trace') {
            const inpLetters = document.getElementById('traceLetters');
            const inpRepeat = document.getElementById('traceRepeat');
            if (inpLetters) inpLetters.addEventListener('change', (e) => {
                customParams.traceLetters = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            });
            if (inpRepeat) inpRepeat.addEventListener('change', (e) => {
                customParams.traceRepeat = parseInt(e.target.value) || 2;
            });
        }
        if (type === 'wordbuilding') {
            const inpWords = document.getElementById('wordList');
            const inpRepeat = document.getElementById('wordRepeat');
            if (inpWords) inpWords.addEventListener('change', (e) => {
                // formato "WORD:part1,part2; WORD2:part1,part2"
                const parts = e.target.value.split(';').map(s => s.trim());
                const newWords = [];
                parts.forEach(p => {
                    const [word, rest] = p.split(':');
                    if (word && rest) {
                        const letters = rest.split(',').map(s => s.trim());
                        newWords.push({ word: word.trim(), parts: letters });
                    }
                });
                if (newWords.length > 0) customParams.wordList = newWords;
            });
            if (inpRepeat) inpRepeat.addEventListener('change', (e) => {
                customParams.wordRepeat = parseInt(e.target.value) || 2;
            });
        }
    }, 50);
}

// ---------- RENDERIZAÇÃO DA LISTA DE NÍVEIS ----------
function renderLevelList() {
    const levels = LevelLibrary.ingles;
    let html = '';
    levels.forEach(lvl => {
        const active = (lvl.id === currentLevelId) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 hover:border-slate-200';
        html += `<button onclick="selectLevel('${lvl.id}')" class="w-full text-left p-3 rounded-xl border-2 transition-all ${active}">
            <div class="text-xs font-bold ${lvl.id === currentLevelId ? 'text-indigo-700' : 'text-slate-600'}">${lvl.title}</div>
        </button>`;
    });
    levelListDiv.innerHTML = html;
}

window.selectLevel = function(id) {
    currentLevelId = id;
    renderLevelList();
    updateParamPanel();
    refreshPreview();
};

// ---------- REFRESH PREVIEW ----------
function refreshPreview() {
    const level = LevelLibrary.ingles.find(l => l.id === currentLevelId);
    if (!level) return;

    const allItems = generateItemsForLevel(level);
    const leftItems = allItems.slice(0, itemsPerPage);
    const rightItems = allItems.slice(itemsPerPage, itemsPerPage * 2);

    buildPage(pageLeft, level, 1, leftItems);
    buildPage(pageRight, level, 2, rightItems);
}

// ---------- INICIALIZAÇÃO ----------
function initIngles() {
    initRefs(); // do gerador.js
    renderLevelList();
    updateParamPanel();
    refreshPreview();
    zoomSpan.innerText = Math.round(currentZoom * 100) + '%';
    zoomContainer.style.transform = `scale(${currentZoom})`;

    document.getElementById('linesPerPage').addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        refreshPreview();
    });
}

// Expõe funções necessárias globalmente
window.adjustZoom = adjustZoom;
window.generatePDF = generatePDF;
window.refreshPreview = refreshPreview;
window.initIngles = initIngles;
