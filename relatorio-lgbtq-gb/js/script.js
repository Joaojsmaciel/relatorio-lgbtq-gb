// Dados simulados baseados nos arquivos CSV do projeto
// Em um projeto real, você carregaria os dados via fetch() dos arquivos CSV

const dadosHomicidios = {
    brasil: [
        { ano: 2017, homicidios: 445 },
        { ano: 2018, homicidios: 420 },
        { ano: 2019, homicidios: 401 },
        { ano: 2020, homicidios: 237 },
        { ano: 2021, homicidios: 316 },
        { ano: 2022, homicidios: 273 }
    ],
    grupo: [
        { grupo: "Gays", homicidios: 156, prop: 25.3 },
        { grupo: "Travestis", homicidios: 123, prop: 19.9 },
        { grupo: "Mulheres Trans", homicidios: 98, prop: 15.9 },
        { grupo: "Lésbicas", homicidios: 45, prop: 7.3 },
        { grupo: "Homens Trans", homicidios: 12, prop: 1.9 },
        { grupo: "Bissexuais", homicidios: 8, prop: 1.3 },
        { grupo: "Outros", homicidios: 175, prop: 28.4 }
    ],
    local: [
        { local: "São Paulo", homicidios: 89, prop: 14.4 },
        { local: "Rio de Janeiro", homicidios: 67, prop: 10.9 },
        { local: "Bahia", homicidios: 45, prop: 7.3 },
        { local: "Minas Gerais", homicidios: 38, prop: 6.2 },
        { local: "Pernambuco", homicidios: 34, prop: 5.5 },
        { local: "Outros", homicidios: 343, prop: 55.7 }
    ],
    raca: [
        { raca_cor: "Preta", homicidios: 234, prop: 38.0 },
        { raca_cor: "Parda", homicidios: 189, prop: 30.7 },
        { raca_cor: "Branca", homicidios: 156, prop: 25.3 },
        { raca_cor: "Amarela", homicidios: 23, prop: 3.7 },
        { raca_cor: "Indígena", homicidios: 14, prop: 2.3 }
    ],
    causaObito: [
        { causa_obito: "Arma de Fogo", homicidios: 289, prop: 46.9 },
        { causa_obito: "Arma Branca", homicidios: 156, prop: 25.3 },
        { causa_obito: "Espancamento", homicidios: 89, prop: 14.4 },
        { causa_obito: "Asfixia", homicidios: 45, prop: 7.3 },
        { causa_obito: "Outros", homicidios: 37, prop: 6.0 }
    ]
};

// Função para ler CSV local
async function lerCSV(path) {
    const resp = await fetch(path);
    const texto = await resp.text();
    const linhas = texto.trim().split('\n').filter(l => l.trim() !== '');
    const colunas = linhas[0].split(',').map(c => c.trim());
    return linhas.slice(1).map(linha => {
        const valores = linha.split(',').map(v => v.trim());
        const obj = {};
        colunas.forEach((col, i) => {
            obj[col] = (i < valores.length && valores[i] !== undefined) ? valores[i] : '';
        });
        return obj;
    });
}

// Função para calcular estatísticas reais
async function calcularEstatisticas() {
    const dadosBrasil = await lerCSV('../data/homicidios_brasil.csv');
    const dadosGrupo = await lerCSV('../data/homicidios_grupo.csv');
    const dadosLocal = await lerCSV('../data/homicidios_local.csv');

    // Total de homicídios
    const totalHomicidios = dadosBrasil.reduce((sum, item) => sum + Number(item.homicidios), 0);
    document.getElementById('total-homicidios').textContent = totalHomicidios.toLocaleString('pt-BR');

    // Ano com mais vítimas
    const anoMaisVitimas = dadosBrasil.reduce((max, item) => Number(item.homicidios) > Number(max.homicidios) ? item : max, dadosBrasil[0]);
    document.getElementById('ano-mais-vitimas').textContent = anoMaisVitimas.ano;

    // Grupo mais afetado
    const grupos = {};
    dadosGrupo.forEach(item => {
        if (item.grupo && item.homicidios && item.homicidios !== 'NA') {
            grupos[item.grupo] = (grupos[item.grupo] || 0) + Number(item.homicidios);
        }
    });
    const grupoMaisAfetado = Object.entries(grupos).reduce((max, curr) => curr[1] > max[1] ? curr : max, ['', 0]);
    document.getElementById('grupo-mais-afetado').textContent = grupoMaisAfetado[0];

    // Local mais crítico
    const locais = {};
    dadosLocal.forEach(item => {
        if (item.local && item.homicidios && item.homicidios !== 'NA') {
            locais[item.local] = (locais[item.local] || 0) + Number(item.homicidios);
        }
    });
    const localMaisCritico = Object.entries(locais).reduce((max, curr) => curr[1] > max[1] ? curr : max, ['', 0]);
    document.getElementById('local-mais-critico').textContent = localMaisCritico[0];
}

// Função para criar gráfico de evolução temporal com dados reais
async function criarGraficoEvolucaoTemporal() {
    const ctx = document.getElementById('evolucao-temporal').getContext('2d');
    const dadosBrasil = await lerCSV('../data/homicidios_brasil.csv');
    const anos = dadosBrasil.map(item => item.ano);
    const valores = dadosBrasil.map(item => Number(item.homicidios));
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: anos,
            datasets: [{
                label: 'Homicídios LGBTQI+',
                data: valores,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Função para criar gráfico de distribuição por grupo com dados reais
async function criarGraficoDistribuicaoGrupo() {
    const ctx = document.getElementById('distribuicao-grupo').getContext('2d');
    const dadosGrupo = await lerCSV('../data/homicidios_grupo.csv');
    // Agrupar por grupo e somar homicídios (ignorando valores NA)
    const gruposUnicos = [...new Set(dadosGrupo.map(d => d.grupo))];
    const data = gruposUnicos.map(grupo => {
        return dadosGrupo
            .filter(d => d.grupo === grupo && d.homicidios && d.homicidios !== 'NA')
            .reduce((sum, d) => sum + Number(d.homicidios), 0);
    });
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: gruposUnicos,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe',
                    '#00f2fe',
                    '#43e97b',
                    '#ffb347',
                    '#ff6a00',
                    '#c471f5'
                ].slice(0, gruposUnicos.length),
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

// Função para criar gráfico de homicídios por local com dados reais
async function criarGraficoHomicidiosLocal() {
    const ctx = document.getElementById('homicidios-local').getContext('2d');
    const dadosLocal = await lerCSV('../data/homicidios_local.csv');
    // Agrupar por local e somar homicídios (ignorando valores NA)
    const locaisUnicos = [...new Set(dadosLocal.map(d => d.local))];
    const data = locaisUnicos.map(local => {
        return dadosLocal
            .filter(d => d.local === local && d.homicidios && d.homicidios !== 'NA')
            .reduce((sum, d) => sum + Number(d.homicidios), 0);
    });
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locaisUnicos,
            datasets: [{
                label: 'Homicídios',
                data: data,
                backgroundColor: '#667eea',
                borderColor: '#764ba2',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Função para criar gráfico de homicídios por raça/cor com dados reais
async function criarGraficoHomicidiosRaca() {
    const ctx = document.getElementById('homicidios-raca').getContext('2d');
    const dadosRaca = await lerCSV('../data/homicidios_raca.csv');
    // Agrupar por raca_cor e somar homicídios (ignorando valores NA)
    const racasUnicas = [...new Set(dadosRaca.map(d => d.raca_cor))];
    const data = racasUnicas.map(raca => {
        return dadosRaca
            .filter(d => d.raca_cor === raca && d.homicidios && d.homicidios !== 'NA')
            .reduce((sum, d) => sum + Number(d.homicidios), 0);
    });
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: racasUnicas,
            datasets: [{
                label: 'Homicídios',
                data: data,
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe',
                    '#43e97b',
                    '#ffb347',
                    '#00f2fe',
                    '#ff6a00',
                    '#c471f5'
                ].slice(0, racasUnicas.length),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Função para criar gráfico de causas de óbito com dados reais
async function criarGraficoCausasObito() {
    const ctx = document.getElementById('causas-obito').getContext('2d');
    const dadosCausaObito = await lerCSV('../data/CausaObito.csv');
    // Agrupar por causa e somar homicídios (caso haja mais de um ano no futuro)
    const causas = [...new Set(dadosCausaObito.map(d => d.causa_obito))];
    const data = causas.map(causa => {
        return dadosCausaObito
            .filter(d => d.causa_obito === causa)
            .reduce((sum, d) => sum + Number(d.homicidios), 0);
    });
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: causas,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe',
                    '#43e97b',
                    '#ffb347',
                    '#00f2fe',
                    '#ff6a00',
                    '#c471f5'
                ].slice(0, causas.length),
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

// Função para preencher tabela de dados com dados reais (sem repetições)
async function preencherTabelaDados() {
    const tbody = document.getElementById('tabela-dados');
    tbody.innerHTML = '';
    const dadosGrupo = await lerCSV('../data/homicidios_grupo.csv');
    const dadosLocal = await lerCSV('../data/homicidios_local.csv');
    const dadosRaca = await lerCSV('../data/homicidios_raca.csv');

    // Coletar todas as linhas reais únicas dos três arquivos
    let linhas = [];
    dadosGrupo.forEach(d => {
        if (d.ano && d.grupo && d.homicidios && d.homicidios !== 'NA') {
            linhas.push({
                ano: d.ano,
                grupo: d.grupo,
                local: '',
                raca_cor: '',
                homicidios: d.homicidios
            });
        }
    });
    dadosLocal.forEach(d => {
        if (d.ano && d.local && d.homicidios && d.homicidios !== 'NA') {
            linhas.push({
                ano: d.ano,
                grupo: '',
                local: d.local,
                raca_cor: '',
                homicidios: d.homicidios
            });
        }
    });
    dadosRaca.forEach(d => {
        if (d.ano && d.raca_cor && d.homicidios && d.homicidios !== 'NA') {
            linhas.push({
                ano: d.ano,
                grupo: '',
                local: '',
                raca_cor: d.raca_cor,
                homicidios: d.homicidios
            });
        }
    });
    // Remover duplicatas exatas
    const seen = new Set();
    linhas = linhas.filter(item => {
        const key = `${item.ano}|${item.grupo}|${item.local}|${item.raca_cor}|${item.homicidios}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
    // Ordenar por ano decrescente
    linhas.sort((a, b) => b.ano.localeCompare(a.ano));
    // Limitar a 20 linhas
    linhas = linhas.slice(0, 20);
    linhas.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.ano}</td>
            <td>${item.grupo}</td>
            <td>${item.local}</td>
            <td>${item.raca_cor}</td>
            <td>${item.homicidios}</td>
            <td></td>
        `;
        tbody.appendChild(row);
    });
}

// Função para inicializar todos os gráficos e dados
async function inicializarPagina() {
    calcularEstatisticas();
    await criarGraficoEvolucaoTemporal();
    await criarGraficoDistribuicaoGrupo();
    criarGraficoHomicidiosLocal();
    criarGraficoHomicidiosRaca();
    await criarGraficoCausasObito();
    preencherTabelaDados();
}

// Aguardar o carregamento do DOM e inicializar
document.addEventListener('DOMContentLoaded', inicializarPagina);

// Função para recarregar dados (útil para atualizações)
function recarregarDados() {
    // Aqui você poderia fazer uma chamada fetch() para carregar dados atualizados
    console.log('Recarregando dados...');
    inicializarPagina();
}

// Adicionar listener para redimensionamento da janela
window.addEventListener('resize', () => {
    // Recriar gráficos responsivos se necessário
    setTimeout(inicializarPagina, 100);
}); 