// Função utilitária para ler CSV local (precisa de servidor local para funcionar)
async function lerCSV(path) {
    const resp = await fetch(path);
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
}

// Paleta de cores sólidas e vivas
const palette = [
    '#667eea', // azul
    '#764ba2', // roxo
    '#f093fb', // rosa
    '#f5576c', // vermelho
    '#4facfe', // azul claro
    '#43e97b', // verde
    '#ffb347', // laranja
    '#00f2fe', // ciano
    '#ff6a00', // laranja escuro
    '#c471f5', // lilás
];

// Funções auxiliares para cálculos estatísticos
function calcularMediana(array) {
    const sorted = array.slice().sort((a, b) => a - b);
    const meio = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 
        ? (sorted[meio - 1] + sorted[meio]) / 2 
        : sorted[meio];
}

function calcularDesvioPadrao(array) {
    const media = array.reduce((a, b) => a + b, 0) / array.length;
    const variancia = array.reduce((acc, val) => acc + Math.pow(val - media, 2), 0) / array.length;
    return Math.sqrt(variancia);
}

function calcularQuartis(array) {
    const sorted = array.slice().sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    return { q1, q3 };
}

// Função para processar e preparar os dados reais
async function prepararDadosReais() {
    // Lê todos os arquivos necessários
    const [dadosGrupo, dadosBrasil, dadosLocal, dadosRaca] = await Promise.all([
        lerCSV('../data/homicidios_grupo.csv'),
        lerCSV('../data/homicidios_brasil.csv'),
        lerCSV('../data/homicidios_local.csv'),
        lerCSV('../data/homicidios_raca.csv')
    ]);

    // 1. Homicídios por grupo ao longo dos anos
    const grupos = [...new Set(dadosGrupo.map(d => d.grupo))];
    // Usar apenas anos que existem em todos os datasets principais
    const anosGrupo = [...new Set(dadosGrupo.map(d => d.ano))].sort();
    const anosBrasil = [...new Set(dadosBrasil.map(d => d.ano))].sort();
    const anosRaca = [...new Set(dadosRaca.map(d => d.ano))].sort();
    
    // Encontrar anos comuns entre os datasets
    const anosComuns = anosGrupo.filter(ano => 
        anosBrasil.includes(ano) && anosRaca.includes(ano)
    ).sort();
    
    // Usar anos comuns ou, se não houver, usar anos do grupo (mais completo)
    const anos = anosComuns.length > 0 ? anosComuns : anosGrupo;
    
    // Log para debug - mostrar anos disponíveis
    console.log('Anos disponíveis nos dados:', {
        grupo: anosGrupo,
        brasil: anosBrasil,
        raca: anosRaca,
        comuns: anosComuns,
        usados: anos
    });
    const dadosPorGrupoAno = grupos.map((grupo, idx) => {
        return {
            grupo,
            cor: palette[idx % palette.length],
            dados: anos.map(ano => {
                const item = dadosGrupo.find(d => d.grupo === grupo && d.ano === ano);
                return item ? Number(item.homicidios) : 0;
            })
        };
    });

    // 2. Proporção por localidade e ano
    const locais = [...new Set(dadosLocal.map(d => d.local))];
    const anosLocal = [...new Set(dadosLocal.map(d => d.ano))].sort();
    const dadosPorLocalAno = locais.map((local, idx) => {
        return {
            local,
            cor: palette[idx % palette.length],
            dados: anosLocal.map(ano => {
                const item = dadosLocal.find(d => d.local === local && d.ano === ano);
                return item ? Number(item.prop_homicidios_total) : 0;
            })
        };
    });

    // 3. Distribuição por raça/cor (dados reais)
    const racas = [...new Set(dadosRaca.map(d => d.raca_cor))];
    const dadosRacaProcessados = racas.map((raca, idx) => {
        const dadosRacaAno = anos.map(ano => {
            const item = dadosRaca.find(d => d.raca_cor === raca && d.ano === ano);
            return item ? Number(item.homicidios) : 0;
        });
        return {
            raca,
            cor: palette[idx % palette.length],
            dados: dadosRacaAno
        };
    });

    // 4. Dados de causa de óbito para boxplot
    const dadosCausaObito = await lerCSV('../data/CausaObito.csv');
    
    // 5. Preparar dados para estatísticas descritivas (agora globais)
    const homicidiosBrasilTodosAnos = dadosBrasil.map(d => Number(d.homicidios)).filter(v => !isNaN(v));
    const estatisticasAnuais = [{
        periodo: anos.length > 1 ? anos[0] + ' - ' + anos[anos.length - 1] : anos[0],
        media: homicidiosBrasilTodosAnos.reduce((a, b) => a + b, 0) / homicidiosBrasilTodosAnos.length,
        mediana: calcularMediana(homicidiosBrasilTodosAnos),
        desvioPadrao: calcularDesvioPadrao(homicidiosBrasilTodosAnos),
        minimo: Math.min(...homicidiosBrasilTodosAnos),
        maximo: Math.max(...homicidiosBrasilTodosAnos)
    }];

    // 6. Preparar dados para intervalo de confiança (agora usando dados reais)
    const homicidiosBrasil = dadosBrasil.map(d => Number(d.homicidios)).filter(v => !isNaN(v));
    const media = homicidiosBrasil.reduce((a, b) => a + b, 0) / homicidiosBrasil.length;
    const desvioPadrao = calcularDesvioPadrao(homicidiosBrasil);
    const erroPadrao = desvioPadrao / Math.sqrt(homicidiosBrasil.length);
    const z = 1.96; // 95%
    const limiteInferior = media - z * erroPadrao;
    const limiteSuperior = media + z * erroPadrao;
    const dadosIntervaloConfiancaProcessados = [{
        grupo: 'Média dos anos',
        media: media,
        limiteInferior: limiteInferior,
        limiteSuperior: limiteSuperior
    }];

    // 7. Preparar dados para tabela dinâmica
    const tabelaDinamica = anos.map(ano => {
        const dadosAno = dadosCausaObito.filter(d => d.ano === ano);
        const total = dadosAno.reduce((sum, d) => sum + Number(d.homicidios), 0);
        return {
            ano,
            armaFogo: dadosAno.find(d => d.causa_obito === 'Arma de Fogo')?.homicidios || 0,
            armaBranca: dadosAno.find(d => d.causa_obito === 'Arma Branca')?.homicidios || 0,
            espancamento: dadosAno.find(d => d.causa_obito === 'Espancamento')?.homicidios || 0,
            asfixia: dadosAno.find(d => d.causa_obito === 'Asfixia')?.homicidios || 0,
            outros: dadosAno.find(d => d.causa_obito === 'Outros')?.homicidios || 0,
            total
        };
    });

    // 8. Preparar dados para gráfico de pizza
    const dadosPizza = dadosCausaObito.reduce((acc, item) => {
        const causa = item.causa_obito;
        if (!acc[causa]) acc[causa] = 0;
        acc[causa] += Number(item.homicidios);
        return acc;
    }, {});

    return { 
        anos, grupos, dadosPorGrupoAno, anosLocal, locais, dadosPorLocalAno, 
        racas, dadosRacaProcessados, dadosCausaObito, estatisticasAnuais, 
        dadosIntervaloConfiancaProcessados, tabelaDinamica, dadosPizza 
    };
}

// Gráfico 1: Homicídios por grupo ao longo dos anos
function graficoGrupoTempo(ctx, anos, grupos, dadosPorGrupoAno) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: anos,
            datasets: dadosPorGrupoAno.map((g, i) => ({
                label: g.grupo,
                data: g.dados,
                borderColor: g.cor,
                backgroundColor: g.cor,
                borderWidth: 3,
                fill: false,
                pointRadius: 4,
                pointBackgroundColor: g.cor
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Gráfico 2: Proporção por localidade e ano (stacked bar)
function graficoProporcaoLocalAno(ctx, anos, locais, dadosPorLocalAno) {
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: anos,
            datasets: dadosPorLocalAno.map((l, i) => ({
                label: l.local,
                data: l.dados,
                backgroundColor: l.cor
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: {
                x: { stacked: true },
                y: { stacked: true, beginAtZero: true }
            }
        }
    });
}

// Gráfico 3: Distribuição por raça/cor ao longo do tempo
function graficoDistribuicaoRaca(ctx, anos, racas, dadosRacaProcessados) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: anos,
            datasets: dadosRacaProcessados.map((r, i) => ({
                label: r.raca,
                data: r.dados,
                borderColor: r.cor,
                backgroundColor: r.cor,
                borderWidth: 3,
                fill: false,
                pointRadius: 4,
                pointBackgroundColor: r.cor
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Função para popular o select de anos
function popularSelectAnoBoxplot(anos) {
    const select = document.getElementById('ano-boxplot');
    select.innerHTML = '';
    anos.forEach(ano => {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        select.appendChild(option);
    });
}

// Função para criar gráfico de barras por causa de óbito para 2019
function graficoBoxplot2019(ctx, dadosCausaObito) {
    const causas = [...new Set(dadosCausaObito.map(d => d.causa_obito))];
    const dados2019 = dadosCausaObito.filter(d => d.ano === '2019' || d.ano === 2019);
    const data = causas.map(causa => {
        const item = dados2019.find(d => d.causa_obito === causa);
        return item ? Number(item.homicidios) : 0;
    });
    if (window.boxplotChart) {
        window.boxplotChart.destroy();
    }
    window.boxplotChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: causas,
            datasets: [{
                label: 'Homicídios por Causa de Óbito (2019)',
                data: data,
                backgroundColor: causas.map((_, i) => palette[i % palette.length])
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { stacked: false },
                y: { beginAtZero: true }
            }
        }
    });
}

// Gráfico 5: Intervalo de confiança
function graficoIntervaloConfianca(ctx, dadosIntervaloConfianca) {
    console.log('Criando gráfico de intervalo de confiança com dados:', dadosIntervaloConfianca);
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dadosIntervaloConfianca.map(d => d.grupo),
            datasets: [{
                label: 'Média',
                data: dadosIntervaloConfianca.map(d => d.media),
                backgroundColor: '#667eea',
                borderColor: '#667eea',
                borderWidth: 2
            }, {
                label: 'Limite Inferior',
                data: dadosIntervaloConfianca.map(d => d.limiteInferior),
                backgroundColor: '#f093fb',
                borderColor: '#f093fb',
                borderWidth: 2
            }, {
                label: 'Limite Superior',
                data: dadosIntervaloConfianca.map(d => d.limiteSuperior),
                backgroundColor: '#f5576c',
                borderColor: '#f5576c',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Gráfico 6: Pizza de causas de óbito
function graficoPizza(ctx, dadosPizza) {
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(dadosPizza),
            datasets: [{
                data: Object.values(dadosPizza),
                backgroundColor: palette.slice(0, Object.keys(dadosPizza).length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// Função para preencher tabela de estatísticas
function preencherTabelaEstatisticas(estatisticasAnuais) {
    const tbody = document.getElementById('stats-table-body');
    tbody.innerHTML = '';
    
    estatisticasAnuais.forEach(stat => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stat.periodo}</td>
            <td>${stat.media.toFixed(2)}</td>
            <td>${stat.mediana.toFixed(2)}</td>
            <td>${stat.desvioPadrao.toFixed(2)}</td>
            <td>${stat.minimo}</td>
            <td>${stat.maximo}</td>
        `;
        tbody.appendChild(row);
    });
}

// Inicialização
async function inicializarAnaliseDetalhada() {
    try {
        const { 
            anos, grupos, dadosPorGrupoAno, anosLocal, locais, dadosPorLocalAno, 
            racas, dadosRacaProcessados, dadosCausaObito, estatisticasAnuais, 
            dadosIntervaloConfiancaProcessados, tabelaDinamica, dadosPizza 
        } = await prepararDadosReais();
        
        console.log('Dados carregados:', { anos, grupos: grupos.length, locais: locais.length });
        
        // Gráficos existentes
        if (document.getElementById('homicidios-grupo-tempo')) {
            graficoGrupoTempo(document.getElementById('homicidios-grupo-tempo').getContext('2d'), anos, grupos, dadosPorGrupoAno);
        }
        
        if (document.getElementById('proporcao-local-ano')) {
            graficoProporcaoLocalAno(document.getElementById('proporcao-local-ano').getContext('2d'), anosLocal, locais, dadosPorLocalAno);
        }
        
        if (document.getElementById('heatmap-grupo-raca')) {
            graficoDistribuicaoRaca(document.getElementById('heatmap-grupo-raca').getContext('2d'), anos, racas, dadosRacaProcessados);
        }
        
        // Novos gráficos
        if (document.getElementById('boxplot-causa-obito')) {
            graficoBoxplot2019(document.getElementById('boxplot-causa-obito').getContext('2d'), dadosCausaObito);
        }
        
        if (document.getElementById('intervalo-confianca')) {
            graficoIntervaloConfianca(document.getElementById('intervalo-confianca').getContext('2d'), dadosIntervaloConfiancaProcessados);
        }
        
        if (document.getElementById('pizza-causa-obito')) {
            graficoPizza(document.getElementById('pizza-causa-obito').getContext('2d'), dadosPizza);
        }
        
        // Tabelas
        if (document.getElementById('stats-table-body')) {
            preencherTabelaEstatisticas(estatisticasAnuais);
        }
        
        console.log('Todos os gráficos foram inicializados com sucesso!');
        
    } catch (error) {
        console.error('Erro ao inicializar análise detalhada:', error);
    }
}

document.addEventListener('DOMContentLoaded', inicializarAnaliseDetalhada); 