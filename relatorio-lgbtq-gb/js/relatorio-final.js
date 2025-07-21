// Função utilitária para ler CSV local (precisa de servidor local para funcionar)
async function lerCSV(path) {
    try {
        const resp = await fetch(path);
        if (!resp.ok) throw new Error('Arquivo não encontrado: ' + path);
        const texto = await resp.text();
        const linhas = texto.trim().split('\n');
        const colunas = linhas[0].split(',');
        return linhas.slice(1).map(linha => {
            const valores = linha.split(',');
            const obj = {};
            colunas.forEach((col, i) => {
                obj[col.trim()] = valores[i] ? valores[i].trim() : '';
            });
            return obj;
        });
    } catch (e) {
        console.error('Erro ao ler CSV:', path, e);
        return [];
    }
}

const palette = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#ffb347', '#00f2fe', '#ff6a00', '#c471f5'
];

function calcularMediana(array) {
    if (!array.length) return 0;
    const sorted = array.slice().sort((a, b) => a - b);
    const meio = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
        ? (sorted[meio - 1] + sorted[meio]) / 2 
        : sorted[meio];
}

function calcularDesvioPadrao(array) {
    if (!array.length) return 0;
    const media = array.reduce((a, b) => a + b, 0) / array.length;
    const variancia = array.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / array.length;
    return Math.sqrt(variancia);
}

function calcularQuartis(array) {
    if (!array.length) return {q1: 0, q3: 0};
    const sorted = array.slice().sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    return { q1, q3 };
}

function aguardarJStat(callback) {
    if (window.jStat) {
        callback();
    } else {
        setTimeout(() => aguardarJStat(callback), 100);
    }
}

async function prepararRelatorio() {
    // Lê os dados
    const [dadosGrupo, dadosBrasil, dadosCausaObito] = await Promise.all([
        lerCSV('../data/homicidios_grupo.csv'),
        lerCSV('../data/homicidios_brasil.csv'),
        lerCSV('../data/CausaObito.csv')
    ]);

    // EDA: linhas e colunas
    document.getElementById('n-linhas').textContent = dadosBrasil.length || '-';
    document.getElementById('n-colunas').textContent = dadosBrasil[0] ? Object.keys(dadosBrasil[0]).length : '-';

    // Gráfico EDA: homicídios por ano
    if (dadosBrasil.length && window.Chart) {
        const anos = [...new Set(dadosBrasil.map(d => d.ano))].sort();
        const homicidiosAno = anos.map(ano => {
            const soma = dadosBrasil.filter(d => d.ano === ano).reduce((acc, d) => acc + Number(d.homicidios), 0);
            return soma;
        });
        new Chart(document.getElementById('grafico-eda').getContext('2d'), {
            type: 'line',
            data: {
                labels: anos,
                datasets: [{
                    label: 'Homicídios por Ano',
                    data: homicidiosAno,
                    borderColor: palette[0],
                    backgroundColor: palette[0],
                    borderWidth: 3,
                    fill: false,
                    pointRadius: 4,
                    pointBackgroundColor: palette[0]
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    } else {
        document.getElementById('grafico-eda').replaceWith('Dados insuficientes para gráfico.');
    }

    // Boxplot: homicídios por grupo
    if (dadosGrupo.length && window.Chart) {
        const grupos = [...new Set(dadosGrupo.map(d => d.grupo))];
        const datasetsBox = grupos.map((grupo, i) => {
            const dados = dadosGrupo.filter(d => d.grupo === grupo && d.homicidios !== 'NA' && d.homicidios !== '').map(d => Number(d.homicidios));
            if (dados.length === 0) return null;
            const { q1, q3 } = calcularQuartis(dados);
            const mediana = calcularMediana(dados);
            const min = Math.min(...dados);
            const max = Math.max(...dados);
            return {
                label: grupo,
                data: [min, q1, mediana, q3, max],
                backgroundColor: palette[i % palette.length],
                borderColor: palette[i % palette.length],
                borderWidth: 2
            };
        }).filter(Boolean);
        new Chart(document.getElementById('boxplot-relatorio').getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Mínimo', 'Q1', 'Mediana', 'Q3', 'Máximo'],
                datasets: datasetsBox
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    } else {
        document.getElementById('boxplot-relatorio').replaceWith('Dados insuficientes para boxplot.');
    }

    // Gráfico de pizza: causas de óbito
    if (dadosCausaObito.length && window.Chart) {
        const causas = [...new Set(dadosCausaObito.map(d => d.causa_obito))];
        const somaPorCausa = causas.map(causa => dadosCausaObito.filter(d => d.causa_obito === causa).reduce((acc, d) => acc + Number(d.homicidios), 0));
        new Chart(document.getElementById('grafico-pizza-relatorio').getContext('2d'), {
            type: 'pie',
            data: {
                labels: causas,
                datasets: [{
                    data: somaPorCausa,
                    backgroundColor: palette.slice(0, causas.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
        });
    } else {
        document.getElementById('grafico-pizza-relatorio').replaceWith('Dados insuficientes para gráfico de pizza.');
    }

    // Tabela dinâmica: homicídios por ano e grupo
    const tbody = document.getElementById('pivot-table-relatorio');
    tbody.innerHTML = '';
    if (dadosGrupo.length) {
        const anos = [...new Set(dadosGrupo.map(d => d.ano))].sort();
        const grupos = [...new Set(dadosGrupo.map(d => d.grupo))];
        anos.forEach(ano => {
            grupos.forEach(grupo => {
                const soma = dadosGrupo.filter(d => d.ano === ano && d.grupo === grupo && d.homicidios !== 'NA' && d.homicidios !== '').reduce((acc, d) => acc + Number(d.homicidios), 0);
                if (soma > 0) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td>${ano}</td><td>${grupo}</td><td>${soma}</td>`;
                    tbody.appendChild(tr);
                }
            });
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="3">Dados insuficientes para tabela dinâmica.</td></tr>';
    }

    // Teste de hipótese: diferença de médias entre "Gay" e "Trans ou Travesti"
    aguardarJStat(() => {
        if (dadosGrupo.length && window.jStat) {
            const dadosGay = dadosGrupo.filter(d => d.grupo === 'Gay' && d.homicidios !== 'NA' && d.homicidios !== '').map(d => Number(d.homicidios));
            const dadosTrans = dadosGrupo.filter(d => d.grupo === 'Trans ou Travesti' && d.homicidios !== 'NA' && d.homicidios !== '').map(d => Number(d.homicidios));
            const mediaGay = dadosGay.reduce((a, b) => a + b, 0) / (dadosGay.length || 1);
            const mediaTrans = dadosTrans.reduce((a, b) => a + b, 0) / (dadosTrans.length || 1);
            const desvioGay = calcularDesvioPadrao(dadosGay);
            const desvioTrans = calcularDesvioPadrao(dadosTrans);
            const nGay = dadosGay.length;
            const nTrans = dadosTrans.length;
            const t = (mediaGay - mediaTrans) / Math.sqrt((desvioGay ** 2 / (nGay || 1)) + (desvioTrans ** 2 / (nTrans || 1)));
            // p-valor aproximado (bilateral)
            const p = 2 * (1 - jStat.studentt.cdf(Math.abs(t), Math.min(nGay, nTrans) - 1));
            const resultado = `Média Gay: ${mediaGay.toFixed(2)} | Média Trans/Travesti: ${mediaTrans.toFixed(2)}<br>t = ${t.toFixed(2)} | p-valor = ${p.toExponential(2)}<br>${p < 0.05 ? '<b>Diferença significativa</b>' : 'Não há diferença significativa'}`;
            document.getElementById('resultado-teste').innerHTML = resultado;
        } else {
            document.getElementById('resultado-teste').innerHTML = 'Dados insuficientes para teste de hipótese.';
        }
    });
}

// Carregar jStat para cálculo do p-valor
(function(){
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jstat/1.9.4/jstat.min.js';
    script.onload = function() { console.log('jStat carregado'); };
    document.head.appendChild(script);
})();

document.addEventListener('DOMContentLoaded', prepararRelatorio); 