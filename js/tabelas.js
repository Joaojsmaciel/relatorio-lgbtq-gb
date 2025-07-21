// Função utilitária para ler CSV local
async function lerCSV(path) {
    const resp = await fetch(path);
    const texto = await resp.text();
    const linhas = texto.trim().split('\n').filter(l => l.trim() !== '');
    const colunas = linhas[0].split(',').map(col => col.trim().replace(/\r/g, ''));
    return {
        colunas,
        dados: linhas.slice(1).map(linha => {
            const valores = linha.split(',').map(v => v.trim().replace(/\r/g, ''));
            const obj = {};
            colunas.forEach((col, i) => {
                obj[col] = (i < valores.length && valores[i] !== undefined) ? valores[i] : '';
            });
            return obj;
        })
    };
}

function preencherTabela(id, colunas, dados) {
    const tabela = document.getElementById(id);
    if (!tabela) return;
    let thead = '<thead><tr>' + colunas.map(col => `<th>${col}</th>`).join('') + '</tr></thead>';
    let tbody = '<tbody>' + dados.map(linha =>
        '<tr>' + colunas.map(col => `<td>${linha[col]}</td>`).join('') + '</tr>'
    ).join('') + '</tbody>';
    tabela.innerHTML = thead + tbody;
}

async function carregarTabelas() {
    const arquivos = [
        { id: 'tabela-causaobito', path: '../data/CausaObito.csv' },
        { id: 'tabela-brasil', path: '../data/homicidios_brasil.csv' },
        { id: 'tabela-grupo', path: '../data/homicidios_grupo.csv' },
        { id: 'tabela-local', path: '../data/homicidios_local.csv' },
        { id: 'tabela-raca', path: '../data/homicidios_raca.csv' }
    ];
    for (const arq of arquivos) {
        const { colunas, dados } = await lerCSV(arq.path);
        preencherTabela(arq.id, colunas, dados);
    }
}

document.addEventListener('DOMContentLoaded', carregarTabelas); 