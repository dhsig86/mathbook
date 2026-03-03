// gerador.js - Funções comuns para todas as páginas
// Depende: html2canvas, jsPDF (devem estar incluídos no HTML)

// Variáveis que serão inicializadas em cada página
let pageLeft, pageRight, zoomContainer, zoomSpan, levelListDiv, paramPanel;
let currentZoom = 0.7; // valor padrão, pode ser sobrescrito
let itemsPerPage = 8;

// Inicializa referências DOM (chamar após o carregamento)
function initRefs() {
    pageLeft = document.getElementById('pageLeft');
    pageRight = document.getElementById('pageRight');
    zoomContainer = document.getElementById('zoomContainer');
    zoomSpan = document.getElementById('zoomValue');
    levelListDiv = document.getElementById('levelList');
    paramPanel = document.getElementById('paramPanel');
}

// Ajusta zoom da pré-visualização
function adjustZoom(delta) {
    currentZoom = Math.min(1.2, Math.max(0.4, currentZoom + delta));
    zoomContainer.style.transform = `scale(${currentZoom})`;
    if (zoomSpan) zoomSpan.innerText = Math.round(currentZoom * 100) + '%';
}

// Constrói uma página (esquerda ou direita)
function buildPage(container, level, pageNum, items) {
    container.innerHTML = '';

    // Cabeçalho
    const header = document.createElement('div');
    header.className = 'page-header';
    header.innerHTML = `
        <div>
            <h3>${level?.title || ''}</h3>
            <p>${level?.instruction || ''}</p>
        </div>
        <div class="text-right">
            <div class="text-[0.5rem] font-bold text-slate-400">DATA: ___/___/___ TEMPO: ___ min</div>
            <div class="border border-slate-900 px-2 py-0.5 mt-1 min-w-[120px]">
                <span class="text-[0.5rem] font-bold">NOME:</span>
                <span class="ml-2 text-[0.5rem]">____________________</span>
            </div>
        </div>
    `;
    container.appendChild(header);

    // Grid de exercícios
    const grid = document.createElement('div');
    grid.className = 'exercise-grid';
    container.appendChild(grid);

    // Rodapé
    const footer = document.createElement('div');
    footer.className = 'page-footer';
    footer.innerHTML = `<span>PÁG ${pageNum}</span>`;
    container.appendChild(footer);

    // Preenche linhas
    items.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'exercise-row';

        const num = document.createElement('span');
        num.className = 'exercise-number';
        num.innerText = (idx + 1);
        row.appendChild(num);

        const content = document.createElement('div');
        content.className = 'exercise-content';

        // Renderiza conforme o tipo (mesmo switch de antes)
        switch (item.type) {
            case 'quantity':
                let circles = '';
                for (let i = 0; i < item.value; i++) circles += '<span class="circle-placeholder"></span>';
                content.innerHTML = `<span class="text-2xl font-black w-6">${item.value}</span> ${circles} <span class="answer-line"></span>`;
                break;
            case 'math':
                content.innerHTML = `<span class="text-base font-light italic">${item.operand1} ${item.operator} ${item.operand2} =</span> <span class="answer-line"></span>`;
                break;
            case 'sequence':
                const seq = item.sequence.map(v => v === '__' ? '___' : v).join(' · ');
                content.innerHTML = `<span class="text-sm bg-slate-50 px-1">${seq}</span> <span class="answer-line"></span>`;
                break;
            case 'tens':
                const numVal = item.number;
                const tens = Math.floor(numVal / 10);
                const units = numVal % 10;
                let blocks = `<span class="text-sm font-bold mr-1">${numVal} =</span>`;
                for (let i = 0; i < tens; i++) blocks += '<span class="tens-block blue"></span>';
                if (tens > 0 && units > 0) blocks += '<span class="mx-0.5">+</span>';
                for (let i = 0; i < units; i++) blocks += '<span class="tens-block yellow"></span>';
                content.innerHTML = blocks + '<span class="answer-line ml-1"></span>';
                break;
            case 'compare':
                content.innerHTML = `<span class="text-sm bg-slate-50 px-1">${item.pair[0]} _ ${item.pair[1]}</span> <span class="answer-line"></span>`;
                break;
            case 'neighbors':
                content.innerHTML = `<span class="text-sm">____ , ${item.center} , ____</span> <span class="answer-line"></span>`;
                break;
            case 'trace':
                content.innerHTML = `<span class="text-3xl font-black text-slate-300 border-2 border-dashed border-slate-300 px-1">${item.char}</span> <span class="flex-1 border-b-2 border-dotted border-slate-300 mx-1"></span> <span class="trace-cell"></span>`;
                break;
            case 'syllable':
                content.innerHTML = `<span class="text-xl font-bold text-slate-500 border-r pr-1 mr-1">${item.syllable}</span> <span class="answer-line w-6"></span> <span class="answer-line w-6"></span>`;
                break;
            case 'word':
                const partsHtml = item.parts.map(p => `<span class="bg-slate-100 border px-1 text-sm">${p}</span>`).join('<span class="mx-0.5">+</span>');
                content.innerHTML = `<div class="flex items-center gap-0.5">${partsHtml}</div> <span class="w-16 border-b-4 border-double border-slate-400 ml-2"></span>`;
                break;
            default:
                content.innerHTML = `<span class="text-slate-300">?</span>`;
        }

        row.appendChild(content);
        grid.appendChild(row);
    });
}

// Gera PDF a partir do elemento #a4-sheet
function generatePDF() {
    const originalTransform = zoomContainer.style.transform;
    zoomContainer.style.transform = 'scale(1)';

    setTimeout(() => {
        const element = document.getElementById('a4-sheet');
        html2canvas(element, {
            scale: 4,
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: false,
            useCORS: true,
            windowWidth: 1123,
            windowHeight: 794,
            onclone: (clonedDoc) => {
                const sheet = clonedDoc.getElementById('a4-sheet');
                if (sheet) sheet.style.boxShadow = 'none';
            }
        }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            pdf.save(`kumon_${new Date().toISOString().slice(0,10)}.pdf`);

            zoomContainer.style.transform = originalTransform;
        }).catch(error => {
            alert('Erro ao gerar PDF: ' + error);
            zoomContainer.style.transform = originalTransform;
        });
    }, 100);
}

// Função auxiliar para atualizar o select de linhas (deve ser chamada no onchange)
function onLinesPerPageChange(select) {
    itemsPerPage = parseInt(select.value);
    if (typeof refreshPreview === 'function') refreshPreview();
}
