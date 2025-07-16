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

// Função para calcular estatísticas
function calcularEstatisticas() {
    const totalHomicidios = dadosHomicidios.brasil.reduce((sum, item) => sum + item.homicidios, 0);
    const anoMaisVitimas = dadosHomicidios.brasil.reduce((max, item) => 
        item.homicidios > max.homicidios ? item : max
    );
    const grupoMaisAfetado = dadosHomicidios.grupo.reduce((max, item) => 
        item.homicidios > max.homicidios ? item : max
    );
    const localMaisCritico = dadosHomicidios.local.reduce((max, item) => 
        item.homicidios > max.homicidios ? item : max
    );

    // Atualizar estatísticas no DOM
    document.getElementById('total-homicidios').textContent = totalHomicidios.toLocaleString('pt-BR');
    document.getElementById('ano-mais-vitimas').textContent = anoMaisVitimas.ano;
    document.getElementById('grupo-mais-afetado').textContent = grupoMaisAfetado.grupo;
    document.getElementById('local-mais-critico').textContent = localMaisCritico.local;
}

// Função para criar gráfico de evolução temporal
function criarGraficoEvolucaoTemporal() {
    const ctx = document.getElementById('evolucao-temporal').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dadosHomicidios.brasil.map(item => item.ano),
            datasets: [{
                label: 'Homicídios LGBTQI+',
                data: dadosHomicidios.brasil.map(item => item.homicidios),
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

// Função para criar gráfico de distribuição por grupo
function criarGraficoDistribuicaoGrupo() {
    const ctx = document.getElementById('distribuicao-grupo').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: dadosHomicidios.grupo.map(item => item.grupo),
            datasets: [{
                data: dadosHomicidios.grupo.map(item => item.homicidios),
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe',
                    '#00f2fe',
                    '#43e97b'
                ],
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

// Função para criar gráfico de homicídios por local
function criarGraficoHomicidiosLocal() {
    const ctx = document.getElementById('homicidios-local').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dadosHomicidios.local.map(item => item.local),
            datasets: [{
                label: 'Homicídios',
                data: dadosHomicidios.local.map(item => item.homicidios),
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

// Função para criar gráfico de homicídios por raça/cor
function criarGraficoHomicidiosRaca() {
    const ctx = document.getElementById('homicidios-raca').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dadosHomicidios.raca.map(item => item.raca_cor),
            datasets: [{
                label: 'Homicídios',
                data: dadosHomicidios.raca.map(item => item.homicidios),
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe'
                ],
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

// Função para criar gráfico de causas de óbito
function criarGraficoCausasObito() {
    const ctx = document.getElementById('causas-obito').getContext('2d');
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: dadosHomicidios.causaObito.map(item => item.causa_obito),
            datasets: [{
                data: dadosHomicidios.causaObito.map(item => item.homicidios),
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#f5576c',
                    '#4facfe'
                ],
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

// Função para preencher tabela de dados
function preencherTabelaDados() {
    const tbody = document.getElementById('tabela-dados');
    
    // Combinar dados de diferentes fontes para criar linhas da tabela
    const dadosCombinados = [];
    
    dadosHomicidios.brasil.forEach(brasil => {
        dadosHomicidios.grupo.forEach(grupo => {
            dadosHomicidios.local.forEach(local => {
                dadosHomicidios.raca.forEach(raca => {
                    dadosCombinados.push({
                        ano: brasil.ano,
                        grupo: grupo.grupo,
                        local: local.local,
                        raca_cor: raca.raca_cor,
                        homicidios: Math.min(brasil.homicidios, grupo.homicidios, local.homicidios, raca.homicidios),
                        prop: ((Math.min(brasil.homicidios, grupo.homicidios, local.homicidios, raca.homicidios) / 616) * 100).toFixed(1)
                    });
                });
            });
        });
    });
    
    // Limitar a 20 linhas para não sobrecarregar a tabela
    const dadosLimitados = dadosCombinados.slice(0, 20);
    
    dadosLimitados.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.ano}</td>
            <td>${item.grupo}</td>
            <td>${item.local}</td>
            <td>${item.raca_cor}</td>
            <td>${item.homicidios}</td>
            <td>${item.prop}%</td>
        `;
        tbody.appendChild(row);
    });
}

// Função para inicializar todos os gráficos e dados
function inicializarPagina() {
    calcularEstatisticas();
    criarGraficoEvolucaoTemporal();
    criarGraficoDistribuicaoGrupo();
    criarGraficoHomicidiosLocal();
    criarGraficoHomicidiosRaca();
    criarGraficoCausasObito();
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