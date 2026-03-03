// portugues.js - Lógica específica para Português

// ---------- BANCO DE DADOS ----------
const LevelLibrary = {
    portugues: [
        {
            id: 'p1',
            title: 'P1 · Alfabeto (traçado)',
            type: 'trace',
            letters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
            instruction: 'Cubra o pontilhado e treine a letra.'
        },
        {
            id: 'p2',
            title: 'P2 · Sílabas simples',
            type: 'syllables',
            syllables: [
                'BA','BE','BI','BO','BU','CA','CE','CI','CO','CU',
                'DA','DE','DI','DO','DU','FA','FE','FI','FO','FU',
                'GA','GE','GI','GO','GU','JA','JE','JI','JO','JU',
                'LA','LE','LI','LO','LU','MA','ME','MI','MO','MU',
                'NA','NE','NI','NO','NU','PA','PE','PI','PO','PU',
                'RA','RE','RI','RO','RU','SA','SE','SI','SO','SU',
                'TA','TE','TI','TO','TU','VA','VE','VI','VO','VU',
                'ZA','ZE','ZI','ZO','ZU'
            ],
            instruction: 'Leia e copie as sílabas.'
        },
        {
            id: 'p3',
            title: 'P3 · Palavras curtas (2 sílabas)',
            type: 'wordbuilding',
            words: [
                { word: 'BOLA', parts: ['BO','LA'] },
                { word: 'CASA', parts: ['CA','SA'] },
                { word: 'DADO', parts: ['DA','DO'] },
                { word: 'FOCA', parts: ['FO','CA'] },
                { word: 'GATO', parts: ['GA','TO'] },
                { word: 'JACA', parts: ['JA','CA'] },
                { word: 'LIMA', parts: ['LI','MA'] },
                { word: 'MALA', parts: ['MA','LA'] },
                { word: 'NOVE', parts: ['NO','VE'] },
                { word: 'PATO', parts: ['PA','TO'] },
                { word: 'RATO', parts: ['RA','TO'] },
                { word: 'SAPO', parts: ['SA','PO'] },
                { word: 'TATU', parts: ['TA','TU'] },
                { word: 'VACA', parts: ['VA','CA'] }
            ],
            instruction: 'Junte as sílabas e forme a palavra.'
        },
        {
            id: 'p4',
            title: 'P4 · Palavras com 3 ou 4 sílabas',
            type: 'wordbuilding',
            words: [
                { word: 'BANANA', parts: ['BA','NA','NA'] },
                { word: 'CADEIRA', parts: ['CA','DEI','RA'] },
                { word: 'DINOSSAURO', parts: ['DI','NOS','SAU','RO'] },
                { word: 'FABRICA', parts: ['FA','BRI','CA'] },
                { word: 'GALINHA', parts: ['GA','LI','NHA'] },
                { word: 'JABUTI', parts: ['JA','BU','TI'] },
                { word: 'LARANJA', parts: ['LA','RAN','JA'] },
                { word: 'MADEIRA', parts: ['MA','DEI','RA'] },
                { word: 'NARIZ', parts: ['NA','RIZ'] },
                { word: 'PAPAGAIO', parts: ['PA','PA','GAI','O'] }
            ],
            instruction: 'Junte as sílabas e forme a palavra.'
        }
    ]
};

// ---------- ESTADO ----------
let currentLevelId = 'p1';
let itemsPerPage = 8;   // será sincronizado com o select
let currentZoom = 0.7;

// Parâmetros customizáveis
let customParams = {
    traceLetters: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
    traceRepeat: 2,
    syllableList: [
        'BA','BE','BI','BO','BU','CA','CE','CI','CO','CU',
        'DA','DE','DI','DO','DU','FA','FE','FI','FO','FU',
        'GA','GE','GI','GO','GU','JA','JE','JI','JO','JU',
        'LA','LE','LI','LO','LU','MA','ME','MI','MO','MU',
        'NA','NE','NI','NO','NU','PA','PE','PI','PO','PU',
        'RA','RE','RI','RO','RU','SA','SE','SI','SO','SU',
        'TA','TE','TI','TO','TU','VA','VE','VI','VO','VU',
        'ZA','ZE','ZI','ZO','ZU'
    ],
    syllableRepeat: 2,
    wordList: [
        { word: 'BOLA', parts: ['BO','LA'] },
        { word: 'CASA', parts: ['CA','SA'] },
        { word: 'DADO', parts: ['DA','DO'] },
        { word: 'FOCA', parts: ['FO','CA'] },
        { word: 'GATO', parts: ['GA','TO'] },
        { word: 'JACA', parts: ['JA','CA'] },
        { word: 'LIMA', parts: ['LI','MA'] },
        { word: 'MALA', parts: ['MA','LA'] },
        { word: 'NOVE', parts: ['NO','VE'] },
        { word: 'PATO', parts: ['PA','TO'] },
        { word: 'RATO', parts: ['RA','TO'] },
        { word: 'SAPO', parts: ['SA','PO'] },
        { word: 'TATU', parts: ['TA','TU'] },
        { word: 'VACA', parts: ['VA','CA'] }
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

        case 'syllables':
            customParams.syllableList.forEach(syllable => {
                for (let i = 0; i < customParams.syllableRepeat; i++) {
                    baseItems.push({ type: 'syllable', syllable: syllable });
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

    // Garante o tamanho exato (cíclico)
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
    const level = LevelLibrary.portugues.find(l => l.id === currentLevelId);
    if (!level) return;

    let html = '';

    switch (level.type) {
        case 'trace':
            html = `
                <div class="param-control">
                    <div class="param-row">
                        <label>Letras (separadas por vírgula):</label>
                        <input type="text" id="traceLetters" value="${customParams.traceLetters.join(',')}" class="w-32">
                    </div>
                    <div class="param-row">
                        <label>Repetições:</label>
                        <input type="number" id="traceRepeat" value="${customParams.traceRepeat}" min="1" max="5" class="w-16">
                    </div>
                </div>
            `;
            break;

        case 'syllables':
            html = `
                <div class="param-control">
                    <div class="param-row">
                        <label>Sílabas (separadas por vírgula):</label>
                        <input type="text" id="syllableList" value="${customParams.syllableList.join(',')}" class="w-32">
                    </div>
                    <div class="param-row">
                        <label>Repetições:</label>
                        <input type="number" id="syllableRepeat" value="${customParams.syllableRepeat}" min="1" max="5" class="w-16">
                    </div>
                </div>
            `;
            break;

        case 'wordbuilding':
            // Para simplificar, permitimos editar como lista de "palavra:parte1,parte2"
            // Ex: BOLA:BO,LA; CASA:CA,SA
            let wordString = customParams.wordList.map(w => `${w.word}:${w.parts.join(',')}`).join('; ');
            html = `
                <div class="param-control">
                    <div class="param-row">
                        <label>Palavras (formato PALAVRA:par1,par2):</label>
                        <input type="text" id="wordList" value="${wordString}" class="w-32">
                    </div>
                    <div class="param-row">
                        <label>Repetições:</label>
                        <input type="number" id="wordRepeat" value="${customParams.wordRepeat}" min="1" max="5" class="w-16">
                    </div>
                </div>
            `;
            break;

        default:
            html = '<div class="text-slate-400">Sem parâmetros adicionais.</div>';
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
        if (type === 'syllables') {
            const inpSyl = document.getElementById('syllableList');
            const inpRepeat = document.getElementById('syllableRepeat');
            if (inpSyl) inpSyl.addEventListener('change', (e) => {
                customParams.syllableList = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
            });
            if (inpRepeat) inpRepeat.addEventListener('change', (e) => {
                customParams.syllableRepeat = parseInt(e.target.value) || 2;
            });
        }
        if (type === 'wordbuilding') {
            const inpWords = document.getElementById('wordList');
            const inpRepeat = document.getElementById('wordRepeat');
            if (inpWords) inpWords.addEventListener('change', (e) => {
                // formato "PALAVRA:par1,par2; PALAVRA2:par1,par2"
                const parts = e.target.value.split(';').map(s => s.trim());
                const newWords = [];
                parts.forEach(p => {
                    const [word, rest] = p.split(':');
                    if (word && rest) {
                        const syls = rest.split(',').map(s => s.trim());
                        newWords.push({ word: word.trim(), parts: syls });
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
    const levels = LevelLibrary.portugues;
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
    const level = LevelLibrary.portugues.find(l => l.id === currentLevelId);
    if (!level) return;

    const allItems = generateItemsForLevel(level);
    const leftItems = allItems.slice(0, itemsPerPage);
    const rightItems = allItems.slice(itemsPerPage, itemsPerPage * 2);

    buildPage(pageLeft, level, 1, leftItems);
    buildPage(pageRight, level, 2, rightItems);
}

// ---------- INICIALIZAÇÃO ----------
function initPortugues() {
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
window.initPortugues = initPortugues;
