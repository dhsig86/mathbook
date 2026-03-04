// ingles.js - Lógica específica para Inglês
(function() {
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
                title: 'I2 · Simple Words (CVC)',
                type: 'wordbuilding',
                words: [
                    { word: 'CAT', parts: ['C','A','T'] },
                    { word: 'DOG', parts: ['D','O','G'] },
                    { word: 'SUN', parts: ['S','U','N'] },
                    { word: 'CAR', parts: ['C','A','R'] },
                    { word: 'BED', parts: ['B','E','D'] },
                    { word: 'FAN', parts: ['F','A','N'] },
                    { word: 'HAT', parts: ['H','A','T'] },
                    { word: 'LEG', parts: ['L','E','G'] },
                    { word: 'MOON', parts: ['M','O','O','N'] },
                    { word: 'FISH', parts: ['F','I','S','H'] }
                ],
                instruction: 'Put the letters together.'
            },
            {
                id: 'i3',
                title: 'I3 · Common Words',
                type: 'wordbuilding',
                words: [
                    { word: 'HOUSE', parts: ['H','OU','SE'] },
                    { word: 'TRAIN', parts: ['T','RAI','N'] },
                    { word: 'PLANE', parts: ['P','LA','NE'] },
                    { word: 'SMALL', parts: ['S','MA','LL'] },
                    { word: 'GREEN', parts: ['G','R','EE','N'] },
                    { word: 'BLACK', parts: ['B','LA','CK'] }
                ],
                instruction: 'Form the word.'
            },
            {
                id: 'i4',
                title: 'I4 · Phonics (short vowels)',
                type: 'syllables',
                syllables: ['AT', 'ET', 'IT', 'OT', 'UT', 'AN', 'EN', 'IN', 'ON', 'UN'],
                instruction: 'Read and copy.'
            },
            {
                id: 'i5',
                title: 'I5 · Numbers (1-10)',
                type: 'quantity',
                numbers: [1,2,3,4,5,6,7,8,9,10],
                instruction: 'Count and write the number.'
            }
        ]
    };

    // ---------- ESTADO LOCAL ----------
    let currentLevelId = 'i1';
    let itemsPerPage = 8;
    let currentZoom = 0.7;

    // Elementos DOM (serão obtidos no init)
    let pageLeft, pageRight, levelListDiv, paramPanel, zoomSpan, zoomContainer;

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
            { word: 'FAN', parts: ['F','A','N'] },
            { word: 'HAT', parts: ['H','A','T'] },
            { word: 'LEG', parts: ['L','E','G'] },
            { word: 'MOON', parts: ['M','O','O','N'] },
            { word: 'FISH', parts: ['F','I','S','H'] }
        ],
        wordRepeat: 2,
        syllableList: ['AT', 'ET', 'IT', 'OT', 'UT', 'AN', 'EN', 'IN', 'ON', 'UN'],
        syllableRepeat: 2,
        qtyNumbers: [1,2,3,4,5,6,7,8,9,10],
        qtyRepeat: 2
    };

    // ---------- FUNÇÕES DE GERAÇÃO DE ITENS ----------
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

            case 'syllables':
                customParams.syllableList.forEach(syllable => {
                    for (let i = 0; i < customParams.syllableRepeat; i++) {
                        baseItems.push({ type: 'syllable', syllable: syllable });
                    }
                });
                break;

            case 'quantity':
                customParams.qtyNumbers.forEach(n => {
                    for (let i = 0; i < customParams.qtyRepeat; i++) {
                        baseItems.push({ type: 'quantity', value: n });
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

    // ---------- PAINEL DE PARÂMETROS ----------
    function updateParamPanel() {
        const level = LevelLibrary.ingles.find(l => l.id === currentLevelId);
        if (!level || !paramPanel) return;

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
                            <label>Repeats:</label>
                            <input type="number" id="traceRepeat" value="${customParams.traceRepeat}" min="1" max="5" class="w-16">
                        </div>
                    </div>
                `;
                break;

            case 'wordbuilding':
                let wordString = customParams.wordList.map(w => `${w.word}:${w.parts.join(',')}`).join('; ');
                html = `
                    <div class="param-control">
                        <div class="param-row">
                            <label>Words (WORD:part1,part2):</label>
                            <input type="text" id="wordList" value="${wordString}" class="w-32">
                        </div>
                        <div class="param-row">
                            <label>Repeats:</label>
                            <input type="number" id="wordRepeat" value="${customParams.wordRepeat}" min="1" max="5" class="w-16">
                        </div>
                    </div>
                `;
                break;

            case 'syllables':
                html = `
                    <div class="param-control">
                        <div class="param-row">
                            <label>Syllables (comma separated):</label>
                            <input type="text" id="syllableList" value="${customParams.syllableList.join(',')}" class="w-32">
                        </div>
                        <div class="param-row">
                            <label>Repeats:</label>
                            <input type="number" id="syllableRepeat" value="${customParams.syllableRepeat}" min="1" max="5" class="w-16">
                        </div>
                    </div>
                `;
                break;

            case 'quantity':
                html = `
                    <div class="param-control">
                        <div class="param-row">
                            <label>Numbers (comma separated):</label>
                            <input type="text" id="qtyNumbers" value="${customParams.qtyNumbers.join(',')}" class="w-32">
                        </div>
                        <div class="param-row">
                            <label>Repeats:</label>
                            <input type="number" id="qtyRepeat" value="${customParams.qtyRepeat}" min="1" max="5" class="w-16">
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
            if (type === 'quantity') {
                const inpNumbers = document.getElementById('qtyNumbers');
                const inpRepeat = document.getElementById('qtyRepeat');
                if (inpNumbers) inpNumbers.addEventListener('change', (e) => {
                    customParams.qtyNumbers = e.target.value.split(',').map(Number).filter(n => !isNaN(n));
                });
                if (inpRepeat) inpRepeat.addEventListener('change', (e) => {
                    customParams.qtyRepeat = parseInt(e.target.value) || 2;
                });
            }
        }, 50);
    }

    function renderLevelList() {
        if (!levelListDiv) return;
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

    function refreshPreview() {
        const level = LevelLibrary.ingles.find(l => l.id === currentLevelId);
        if (!level) return;

        const allItems = generateItemsForLevel(level);
        const leftItems = allItems.slice(0, itemsPerPage);
        const rightItems = allItems.slice(itemsPerPage, itemsPerPage * 2);

        KumonGen.buildPage(pageLeft, level, 1, leftItems);
        KumonGen.buildPage(pageRight, level, 2, rightItems);
    }

    function init() {
        pageLeft = document.getElementById('pageLeft');
        pageRight = document.getElementById('pageRight');
        levelListDiv = document.getElementById('levelList');
        paramPanel = document.getElementById('paramPanel');
        zoomSpan = document.getElementById('zoomValue');
        zoomContainer = document.getElementById('zoomContainer');

        KumonGen.initRefs();

        renderLevelList();
        updateParamPanel();
        refreshPreview();

        const linesSelect = document.getElementById('linesPerPage');
        if (linesSelect) {
            linesSelect.addEventListener('change', (e) => {
                itemsPerPage = parseInt(e.target.value);
                refreshPreview();
            });
        }

        if (zoomSpan) zoomSpan.innerText = Math.round(currentZoom * 100) + '%';
        if (zoomContainer) zoomContainer.style.transform = `scale(${currentZoom})`;
    }

    window.adjustZoom = KumonGen.adjustZoom;
    window.generatePDF = () => KumonGen.generatePDF('a4-sheet');
    window.refreshPreview = refreshPreview;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
