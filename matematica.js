// matematica.js - Lógica específica para Matemática
(function() {
    // ---------- BANCO DE DADOS ----------
    const LevelLibrary = {
        matematica: [
            { id: 'm1', title: 'M1 · Quantidade', type: 'quantity', numbers: [1,2,3,4,5], instruction: 'Pinte a quantidade de círculos.' },
            { id: 'm2', title: 'M2 · Adição', type: 'math', operator: '+', operand: 1, range: [1,9], instruction: 'Resolva as adições.' },
            { id: 'm3', title: 'M3 · Sequências', type: 'sequence', sequences: [[1,2,'__',4,5],[5,6,7,'__',9],[8,'__',10]], instruction: 'Complete a sequência.' },
            { id: 'm4', title: 'M4 · Dezenas', type: 'tens', numbers: [11,12,13,14,15,16,17,18,19], instruction: 'Pinte os grupos de 10 e unidades.' },
            { id: 'm5', title: 'M5 · Comparação', type: 'compare', pairs: [[3,5],[7,2],[4,4],[6,9]], instruction: 'Circule o maior (ou igual).' },
            { id: 'm6', title: 'M6 · Subtração', type: 'math', operator: '-', operand: 1, range: [2,10], instruction: 'Resolva as subtrações.' },
            { id: 'm7', title: 'M7 · Vizinhos', type: 'neighbors', centers: [5,10,15,18], instruction: 'Escreva o antes e depois.' }
        ]
    };

    // ---------- ESTADO LOCAL ----------
    let currentLevelId = 'm2';
    let itemsPerPage = 8;   // será sincronizado com o select
    let currentZoom = 0.7;   // pode ser usado internamente, mas o zoom é controlado pelo KumonGen

    // Elementos DOM específicos da página
    const pageLeft = document.getElementById('pageLeft');
    const pageRight = document.getElementById('pageRight');
    const levelListDiv = document.getElementById('levelList');
    const paramPanel = document.getElementById('paramPanel');
    const zoomSpan = document.getElementById('zoomValue');
    const zoomContainer = document.getElementById('zoomContainer');

    // Parâmetros customizáveis (valores padrão)
    let customParams = {
        // quantity
        qtyNumbers: [1,2,3,4,5],
        qtyRepeat: 2,
        // math
        operator: '+',
        operand: 1,
        min: 1,
        max: 9,
        allowNegative: false,
        // sequence
        seqFixed: true,
        seqStep: 1,
        seqLength: 5,
        seqCount: 4,
        // tens
        tensNumbers: [11,12,13,14,15,16,17,18,19],
        // compare
        compPairs: [[3,5],[7,2],[4,4],[6,9]],
        compRandom: false,
        compMin: 1,
        compMax: 10,
        compCount: 4,
        // neighbors
        neighborCenters: [5,10,15,18]
    };

    // ---------- FUNÇÕES DE GERAÇÃO DE ITENS POR TIPO ----------
    function generateItemsForLevel(level) {
        if (!level) return [];

        let baseItems = [];

        switch (level.type) {
            case 'quantity':
                customParams.qtyNumbers.forEach(n => {
                    for (let i = 0; i < customParams.qtyRepeat; i++) {
                        baseItems.push({ type: 'quantity', value: n });
                    }
                });
                break;

            case 'math':
                for (let i = 0; i < itemsPerPage * 2; i++) {
                    let a = Math.floor(Math.random() * (customParams.max - customParams.min + 1)) + customParams.min;
                    if (customParams.operator === '-' && !customParams.allowNegative) {
                        a = Math.max(a, customParams.operand);
                    }
                    baseItems.push({
                        type: 'math',
                        operand1: a,
                        operator: customParams.operator,
                        operand2: customParams.operand
                    });
                }
                return baseItems; // já tem tamanho exato

            case 'sequence':
                if (customParams.seqFixed) {
                    baseItems = level.sequences.map(seq => ({ type: 'sequence', sequence: seq }));
                } else {
                    for (let s = 0; s < customParams.seqCount; s++) {
                        let start = Math.floor(Math.random() * 5) + 1;
                        let seq = [];
                        for (let j = 0; j < customParams.seqLength; j++) {
                            if (j === 2) seq.push('__');
                            else seq.push(start + j * customParams.seqStep);
                        }
                        baseItems.push({ type: 'sequence', sequence: seq });
                    }
                }
                break;

            case 'tens':
                customParams.tensNumbers.forEach(n => {
                    baseItems.push({ type: 'tens', number: n });
                    baseItems.push({ type: 'tens', number: n });
                });
                break;

            case 'compare':
                if (customParams.compRandom) {
                    for (let i = 0; i < customParams.compCount; i++) {
                        let a = Math.floor(Math.random() * (customParams.compMax - customParams.compMin + 1)) + customParams.compMin;
                        let b = Math.floor(Math.random() * (customParams.compMax - customParams.compMin + 1)) + customParams.compMin;
                        baseItems.push({ type: 'compare', pair: [a, b] });
                    }
                } else {
                    customParams.compPairs.forEach(p => {
                        baseItems.push({ type: 'compare', pair: p });
                    });
                }
                break;

            case 'neighbors':
                customParams.neighborCenters.forEach(c => {
                    baseItems.push({ type: 'neighbors', center: c });
                    baseItems.push({ type: 'neighbors', center: c });
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
        const level = LevelLibrary.matematica.find(l => l.id === currentLevelId);
        if (!level) return;

        let html = '';

        switch (level.type) {
            case 'quantity':
                html = `
                    <div class="param-control">
                        <div class="param-row">
                            <label>Números (separados por vírgula):</label>
                            <input type="text" id="qtyNumbers" value="${customParams.qtyNumbers.join(',')}" class="w-24">
                        </div>
                        <div class="param-row">
                            <label>Repetições:</label>
                            <input type="number" id="qtyRepeat" value="${customParams.qtyRepeat}" min="1" max="5" class="w-16">
                        </div>
                    </div>
                `;
                break;

            case 'math':
                html = `
                    <div class="param-control">
                        <div class="param-row">
                            <label>Operador:</label>
                            <select id="mathOperator">
                                <option value="+" ${customParams.operator === '+' ? 'selected' : ''}>+</option>
                                <option value="-" ${customParams.operator === '-' ? 'selected' : ''}>-</option>
                            </select>
                        </div>
                        <div class="param-row">
                            <label>Valor:</label>
                            <input type="number" id="mathOperand" value="${customParams.operand}" min="1" max="20" class="w-16">
                        </div>
                        <div class="param-row">
                            <label>Mínimo:</label>
                            <input type="number" id="mathMin" value="${customParams.min}" min="1" max="50" class="w-16">
                        </div>
                        <div class="param-row">
                            <label>Máximo:</label>
                            <input type="number" id="mathMax" value="${customParams.max}" min="1" max="50" class="w-16">
                        </div>
                        <div class="param-row checkbox-row">
                            <label>Permitir negativo (subtração)?</label>
                            <input type="checkbox" id="mathAllowNegative" ${customParams.allowNegative ? 'checked' : ''}>
                        </div>
                    </div>
                `;
                break;

            case 'sequence':
                html = `
                    <div class="param-control">
                        <div class="param-row checkbox-row">
                            <label>Usar sequências fixas</label>
                            <input type="checkbox" id="seqFixed" ${customParams.seqFixed ? 'checked' : ''}>
                        </div>
                        <div class="param-row">
                            <label>Passo (se aleatório):</label>
                            <input type="number" id="seqStep" value="${customParams.seqStep}" min="1" max="5" class="w-16">
                        </div>
                        <div class="param-row">
                            <label>Comprimento:</label>
                            <input type="number" id="seqLength" value="${customParams.seqLength}" min="3" max="7" class="w-16">
                        </div>
                        <div class="param-row">
                            <label>Quantidade (se aleatório):</label>
                            <input type="number" id="seqCount" value="${customParams.seqCount}" min="2" max="8" class="w-16">
                        </div>
                    </div>
                `;
                break;

            case 'tens':
                html = `
                    <div class="param-control">
                        <div class="param-row">
                            <label>Números (ex: 11,12,13...):</label>
                            <input type="text" id="tensNumbers" value="${customParams.tensNumbers.join(',')}" class="w-32">
                        </div>
                    </div>
                `;
                break;

            case 'compare':
                html = `
                    <div class="param-control">
                        <div class="param-row checkbox-row">
                            <label>Gerar aleatório</label>
                            <input type="checkbox" id="compRandom" ${customParams.compRandom ? 'checked' : ''}>
                        </div>
                        <div class="param-row">
                            <label>Pares fixos (ex: 3,5;7,2):</label>
                            <input type="text" id="compPairs" value="${customParams.compPairs.map(p => p.join(',')).join(';')}" class="w-32">
                        </div>
                        <div class="param-row">
                            <label>Mín (aleatório):</label>
                            <input type="number" id="compMin" value="${customParams.compMin}" min="1" max="20" class="w-16">
                        </div>
                        <div class="param-row">
                            <label>Máx (aleatório):</label>
                            <input type="number" id="compMax" value="${customParams.compMax}" min="1" max="20" class="w-16">
                        </div>
                        <div class="param-row">
                            <label>Quantidade (aleatório):</label>
                            <input type="number" id="compCount" value="${customParams.compCount}" min="2" max="10" class="w-16">
                        </div>
                    </div>
                `;
                break;

            case 'neighbors':
                html = `
                    <div class="param-control">
                        <div class="param-row">
                            <label>Centros (ex: 5,10,15):</label>
                            <input type="text" id="neighborCenters" value="${customParams.neighborCenters.join(',')}" class="w-32">
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
            if (type === 'math') {
                const op = document.getElementById('mathOperator');
                const operand = document.getElementById('mathOperand');
                const min = document.getElementById('mathMin');
                const max = document.getElementById('mathMax');
                const allowNeg = document.getElementById('mathAllowNegative');
                if (op) op.addEventListener('change', (e) => customParams.operator = e.target.value);
                if (operand) operand.addEventListener('change', (e) => customParams.operand = parseInt(e.target.value) || 1);
                if (min) min.addEventListener('change', (e) => customParams.min = parseInt(e.target.value) || 1);
                if (max) max.addEventListener('change', (e) => customParams.max = parseInt(e.target.value) || 1);
                if (allowNeg) allowNeg.addEventListener('change', (e) => customParams.allowNegative = e.target.checked);
            }
            if (type === 'sequence') {
                const fixed = document.getElementById('seqFixed');
                const step = document.getElementById('seqStep');
                const len = document.getElementById('seqLength');
                const cnt = document.getElementById('seqCount');
                if (fixed) fixed.addEventListener('change', (e) => customParams.seqFixed = e.target.checked);
                if (step) step.addEventListener('change', (e) => customParams.seqStep = parseInt(e.target.value) || 1);
                if (len) len.addEventListener('change', (e) => customParams.seqLength = parseInt(e.target.value) || 5);
                if (cnt) cnt.addEventListener('change', (e) => customParams.seqCount = parseInt(e.target.value) || 4);
            }
            if (type === 'tens') {
                const tens = document.getElementById('tensNumbers');
                if (tens) tens.addEventListener('change', (e) => {
                    customParams.tensNumbers = e.target.value.split(',').map(Number).filter(n => n >= 11 && n <= 19);
                });
            }
            if (type === 'compare') {
                const random = document.getElementById('compRandom');
                const pairs = document.getElementById('compPairs');
                const min = document.getElementById('compMin');
                const max = document.getElementById('compMax');
                const cnt = document.getElementById('compCount');
                if (random) random.addEventListener('change', (e) => customParams.compRandom = e.target.checked);
                if (pairs) pairs.addEventListener('change', (e) => {
                    customParams.compPairs = e.target.value.split(';').map(part => part.split(',').map(Number)).filter(p => p.length === 2);
                });
                if (min) min.addEventListener('change', (e) => customParams.compMin = parseInt(e.target.value) || 1);
                if (max) max.addEventListener('change', (e) => customParams.compMax = parseInt(e.target.value) || 1);
                if (cnt) cnt.addEventListener('change', (e) => customParams.compCount = parseInt(e.target.value) || 4);
            }
            if (type === 'neighbors') {
                const centers = document.getElementById('neighborCenters');
                if (centers) centers.addEventListener('change', (e) => {
                    customParams.neighborCenters = e.target.value.split(',').map(Number).filter(n => !isNaN(n));
                });
            }
        }, 50);
    }

    // ---------- RENDERIZAÇÃO DA LISTA DE NÍVEIS ----------
    function renderLevelList() {
        const levels = LevelLibrary.matematica;
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
        const level = LevelLibrary.matematica.find(l => l.id === currentLevelId);
        if (!level) return;

        const allItems = generateItemsForLevel(level);
        const leftItems = allItems.slice(0, itemsPerPage);
        const rightItems = allItems.slice(itemsPerPage, itemsPerPage * 2);

        KumonGen.buildPage(pageLeft, level, 1, leftItems);
        KumonGen.buildPage(pageRight, level, 2, rightItems);
    }

    // ---------- INICIALIZAÇÃO ----------
    function init() {
        // Inicializa referências do gerador
        KumonGen.initRefs();

        renderLevelList();
        updateParamPanel();
        refreshPreview();

        // Sincroniza itemsPerPage com o select
        const linesSelect = document.getElementById('linesPerPage');
        if (linesSelect) {
            linesSelect.addEventListener('change', (e) => {
                itemsPerPage = parseInt(e.target.value);
                refreshPreview();
            });
        }

        // Exibe zoom inicial
        if (zoomSpan) zoomSpan.innerText = Math.round(currentZoom * 100) + '%';
        if (zoomContainer) zoomContainer.style.transform = `scale(${currentZoom})`;
    }

    // Expõe funções necessárias globalmente (para os botões)
    window.adjustZoom = KumonGen.adjustZoom;
    window.generatePDF = () => KumonGen.generatePDF('a4-sheet');
    window.refreshPreview = refreshPreview;

    // Inicia tudo quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
