// ingles.js - Lógica específica para Inglês com interface amigável
(function() {
    // ---------- BANCO DE DADOS ----------
    const LevelLibrary = {
        ingles: [
            {
                id: 'i1',
                title: 'I1 · Alphabet (trace)',
                type: 'trace',
                instruction: 'Select the letters to trace.'
            },
            {
                id: 'i2',
                title: 'I2 · CVC Words (3 letters)',
                type: 'wordbuilding',
                instruction: 'Build CVC words (consonant-vowel-consonant).'
            },
            {
                id: 'i3',
                title: 'I3 · Easy words (4-5 letters)',
                type: 'wordbuilding',
                instruction: 'Build simple words.'
            }
        ]
    };

    // ---------- ESTADO LOCAL ----------
    let currentLevelId = 'i1';
    let itemsPerPage = 8;
    let currentZoom = 0.7;

    // Elementos DOM
    let pageLeft, pageRight, levelListDiv, paramPanel, zoomSpan, zoomContainer;

    // ---------- PARÂMETROS CUSTOMIZÁVEIS ----------
    let customParams = {
        // Para trace
        traceSelected: [],  // será preenchido com todas as letras no init
        traceRepeat: 2,
        // Para wordbuilding (níveis I2 e I3)
        wordList: [
            // CVC words (I2)
            { word: 'CAT', parts: ['C','A','T'] },
            { word: 'DOG', parts: ['D','O','G'] },
            { word: 'SUN', parts: ['S','U','N'] },
            { word: 'CAR', parts: ['C','A','R'] },
            { word: 'BED', parts: ['B','E','D'] },
            { word: 'HAT', parts: ['H','A','T'] },
            { word: 'FOG', parts: ['F','O','G'] },
            { word: 'LEG', parts: ['L','E','G'] },
            { word: 'PIG', parts: ['P','I','G'] },
            { word: 'BUS', parts: ['B','U','S'] },
            // 4-5 letter words (I3)
            { word: 'BIRD', parts: ['B','IR','D'] },
            { word: 'FISH', parts: ['F','I','SH'] },
            { word: 'TREE', parts: ['T','R','EE'] },
            { word: 'BOOK', parts: ['B','OO','K'] },
            { word: 'HOUSE', parts: ['H','OU','SE'] },
            { word: 'CLOCK', parts: ['C','LO','CK'] },
            { word: 'SNAKE', parts: ['S','NA','KE'] },
            { word: 'FLOWER', parts: ['F','LO','WER'] },
            { word: 'TRAIN', parts: ['T','R','AI','N'] },
            { word: 'PLANE', parts: ['P','L','A','NE'] }
        ],
        wordRepeat: 2
    };

    // ---------- FUNÇÕES DE GERAÇÃO DE ITENS ----------
    function generateItemsForLevel(level) {
        if (!level) return [];

        let baseItems = [];

        switch (level.type) {
            case 'trace':
                customParams.traceSelected.forEach(letter => {
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

    // ---------- PAINEL DE PARÂMETROS ----------
    function updateParamPanel() {
        const level = LevelLibrary.ingles.find(l => l.id === currentLevelId);
        if (!level || !paramPanel) return;

        let html = '';

        switch (level.type) {
            case 'trace':
                html = renderTracePanel();
                break;
            case 'wordbuilding':
                html = renderWordPanel();
                break;
            default:
                html = '<div class="text-slate-400">No additional parameters.</div>';
        }

        paramPanel.innerHTML = html;
        attachParamEvents(level.type);
    }

    function renderTracePanel() {
        // Alfabeto completo com K e W
        const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        let checkboxes = '';
        allLetters.forEach(letter => {
            const checked = customParams.traceSelected.includes(letter) ? 'checked' : '';
            checkboxes += `
                <label class="inline-flex items-center gap-1 mr-2 mb-1">
                    <input type="checkbox" class="trace-letter" value="${letter}" ${checked}>
                    <span class="text-xs">${letter}</span>
                </label>
            `;
        });

        return `
            <div class="param-control">
                <div class="mb-2">
                    <label class="block text-xs font-bold mb-1">Letters to trace:</label>
                    <div class="bg-white p-2 rounded max-h-40 overflow-y-auto border border-slate-200">
                        ${checkboxes}
                    </div>
                </div>
                <div class="param-row">
                    <label>Repetitions:</label>
                    <input type="number" id="traceRepeat" value="${customParams.traceRepeat}" min="1" max="5" class="w-16">
                </div>
                <div class="flex flex-wrap gap-2 mt-1">
                    <button id="selectAllTrace" class="text-xs bg-slate-200 px-2 py-1 rounded hover:bg-slate-300">Select all</button>
                    <button id="clearAllTrace" class="text-xs bg-slate-200 px-2 py-1 rounded hover:bg-slate-300">Clear</button>
                    <button id="randomTrace" class="text-xs bg-slate-200 px-2 py-1 rounded hover:bg-slate-300">Random</button>
                </div>
            </div>
        `;
    }

    function renderWordPanel() {
        let wordItems = '';
        customParams.wordList.forEach((w, index) => {
            wordItems += `
                <div class="flex items-center justify-between bg-slate-100 p-1 mb-1 rounded">
                    <span class="text-xs font-bold">${w.word}</span>
                    <span class="text-xs text-slate-600">[${w.parts.join(' ')}]</span>
                    <button class="remove-word text-red-500 hover:text-red-700" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });

        return `
            <div class="param-control">
                <div class="mb-2">
                    <label class="block text-xs font-bold mb-1">Word list:</label>
                    <div id="wordListContainer" class="bg-white p-2 rounded max-h-40 overflow-y-auto border border-slate-200">
                        ${wordItems || '<div class="text-slate-400 text-xs">No words</div>'}
                    </div>
                </div>
                <div class="border-t border-slate-200 my-2 pt-2">
                    <label class="block text-xs font-bold mb-1">Add new word:</label>
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input type="text" id="newWord" placeholder="Word (e.g., CAT)" class="flex-1 text-xs border rounded px-2 py-1">
                        <input type="text" id="newParts" placeholder="Parts separated by space (e.g., C A T)" class="flex-1 text-xs border rounded px-2 py-1">
                        <button id="addWordBtn" class="bg-red-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-700 whitespace-nowrap">
                            <i class="fas fa-plus mr-1"></i>Add
                        </button>
                    </div>
                </div>
                <div class="param-row">
                    <label>Repetitions:</label>
                    <input type="number" id="wordRepeat" value="${customParams.wordRepeat}" min="1" max="5" class="w-16">
                </div>
            </div>
        `;
    }

    function attachParamEvents(type) {
        setTimeout(() => {
            if (type === 'trace') {
                // Checkboxes
                document.querySelectorAll('.trace-letter').forEach(cb => {
                    cb.addEventListener('change', (e) => {
                        const letter = e.target.value;
                        if (e.target.checked) {
                            if (!customParams.traceSelected.includes(letter)) {
                                customParams.traceSelected.push(letter);
                            }
                        } else {
                            customParams.traceSelected = customParams.traceSelected.filter(l => l !== letter);
                        }
                    });
                });

                // Select all
                document.getElementById('selectAllTrace')?.addEventListener('click', () => {
                    document.querySelectorAll('.trace-letter').forEach(cb => {
                        cb.checked = true;
                        const letter = cb.value;
                        if (!customParams.traceSelected.includes(letter)) {
                            customParams.traceSelected.push(letter);
                        }
                    });
                });

                // Clear
                document.getElementById('clearAllTrace')?.addEventListener('click', () => {
                    document.querySelectorAll('.trace-letter').forEach(cb => {
                        cb.checked = false;
                    });
                    customParams.traceSelected = [];
                });

                // Random (select ~50%)
                document.getElementById('randomTrace')?.addEventListener('click', () => {
                    const selected = [];
                    document.querySelectorAll('.trace-letter').forEach(cb => {
                        const random = Math.random() > 0.5;
                        cb.checked = random;
                        if (random) selected.push(cb.value);
                    });
                    customParams.traceSelected = selected;
                });

                const repeat = document.getElementById('traceRepeat');
                if (repeat) repeat.addEventListener('change', (e) => {
                    customParams.traceRepeat = parseInt(e.target.value) || 2;
                });
            }

            if (type === 'wordbuilding') {
                // Add word
                document.getElementById('addWordBtn')?.addEventListener('click', () => {
                    const wordInput = document.getElementById('newWord');
                    const partsInput = document.getElementById('newParts');
                    if (wordInput.value.trim() && partsInput.value.trim()) {
                        const newWord = {
                            word: wordInput.value.trim().toUpperCase(),
                            parts: partsInput.value.trim().split(/\s+/).map(p => p.toUpperCase())
                        };
                        customParams.wordList.push(newWord);
                        wordInput.value = '';
                        partsInput.value = '';
                        updateParamPanel();
                    } else {
                        alert('Please fill both word and parts!');
                    }
                });

                // Remove word (delegation)
                const container = document.getElementById('wordListContainer');
                if (container) {
                    container.addEventListener('click', (e) => {
                        if (e.target.closest('.remove-word')) {
                            const btn = e.target.closest('.remove-word');
                            const index = btn.getAttribute('data-index');
                            if (index !== null) {
                                customParams.wordList.splice(parseInt(index), 1);
                                updateParamPanel();
                            }
                        }
                    });
                }

                const repeat = document.getElementById('wordRepeat');
                if (repeat) repeat.addEventListener('change', (e) => {
                    customParams.wordRepeat = parseInt(e.target.value) || 2;
                });
            }
        }, 50);
    }

    function renderLevelList() {
        if (!levelListDiv) return;
        const levels = LevelLibrary.ingles;
        let html = '';
        levels.forEach(lvl => {
            const active = (lvl.id === currentLevelId) ? 'border-red-500 bg-red-50' : 'border-slate-100 hover:border-red-200';
            html += `<button onclick="selectLevel('${lvl.id}')" class="w-full text-left p-3 rounded-xl border-2 transition-all ${active}">
                <div class="text-xs font-bold ${lvl.id === currentLevelId ? 'text-red-700' : 'text-slate-600'}">${lvl.title}</div>
            </button>`;
        });
        levelListDiv.innerHTML = html;
    }

    window.selectLevel = function(id) {
        currentLevelId = id;
        if (id === 'i1' && customParams.traceSelected.length === 0) {
            customParams.traceSelected = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        }
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

        if (customParams.traceSelected.length === 0) {
            customParams.traceSelected = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        }

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
