// Função utilitária para ler CSV local
async function lerCSV(path) {
    const resp = await fetch(path);
    const texto = await resp.text();
    const linhas = texto.trim().split('\n').filter(l => l.trim() !== '');
    const colunas = linhas[0].split(',').map(col => col.trim().replace(/\r/g, ''));
    return linhas.slice(1).map(linha => {
        const valores = linha.split(',').map(v => v.trim().replace(/\r/g, ''));
        const obj = {};
        colunas.forEach((col, i) => {
            obj[col] = (i < valores.length && valores[i] !== undefined) ? valores[i] : '';
        });
        return obj;
    });
}

async function graficoGrupoMetodologia() {
    const ctx = document.getElementById('grafico-metodologia-grupo').getContext('2d');
    const dadosGrupo = await lerCSV('../data/homicidios_grupo.csv');
    const grupos = [...new Set(dadosGrupo.map(d => d.grupo))];
    const anos = [...new Set(dadosGrupo.map(d => d.ano))].sort();
    const palette = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe',
        '#43e97b', '#ffb347', '#00f2fe', '#ff6a00', '#c471f5'
    ];
    const datasets = grupos.map((grupo, idx) => ({
        label: grupo,
        data: anos.map(ano => {
            const item = dadosGrupo.find(d => d.grupo === grupo && d.ano === ano && d.homicidios && d.homicidios !== 'NA');
            return item ? Number(item.homicidios) : 0;
        }),
        borderColor: palette[idx % palette.length],
        backgroundColor: palette[idx % palette.length],
        borderWidth: 3,
        fill: false,
        pointRadius: 4,
        pointBackgroundColor: palette[idx % palette.length]
    }));
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: anos,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: true } }
        }
    });
}

async function graficoCoberturaAnos() {
    const ctx = document.getElementById('grafico-cobertura-anos').getContext('2d');
    try {
        // Ler o CSV manual de cobertura
        const resp = await fetch('../data/cobertura_graficos.csv');
        if (!resp.ok) {
            ctx.font = '16px Arial';
            ctx.fillText('Erro ao carregar CSV de cobertura.', 10, 50);
            return;
        }
        const texto = await resp.text();
        const linhas = texto.trim().split('\n').filter(l => l.trim() !== '');
        const colunas = linhas[0].split(',').map(c => c.trim());
        const anos = colunas.slice(1).map(a => Number(a));
        const items = linhas.slice(1).map(linha => {
            const partes = linha.split(',');
            return {
                nome: partes[0],
                cobertura: partes.slice(1).map(v => Number(v))
            };
        });
        const palette = [
            '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe',
            '#43e97b', '#ffb347', '#00f2fe', '#ff6a00', '#c471f5',
            '#b2dfdb', '#ffb6b9', '#b5ead7', '#f7cac9', '#c7ceea',
            '#f6eac2', '#e2f0cb', '#ffdac1', '#b5ead7', '#c7ceea', '#f7cac9'
        ];
        // Cada dataset é um ano, cada barra é um gráfico/tabela
        const datasets = anos.map((ano, idx) => ({
            label: String(ano),
            data: items.map(item => item.cobertura[idx]),
            backgroundColor: palette[idx % palette.length],
            borderWidth: 1,
            borderRadius: 4,
            barPercentage: 0.8,
            categoryPercentage: 0.8,
            stack: 'stack1'
        }));
        ctx.canvas.height = Math.max(500, items.length * 40);
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: items.map(item => item.nome),
                datasets: datasets
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.raw ? context.dataset.label : '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        max: 1,
                        ticks: { stepSize: 1, callback: v => v ? 'Coberto' : '' },
                        title: { display: true, text: 'Ano' }
                    },
                    y: {
                        title: { display: true, text: 'Gráfico/Tabela' }
                    }
                }
            }
        });
    } catch (e) {
        ctx.font = '16px Arial';
        ctx.fillText('Erro ao gerar gráfico de cobertura.', 10, 50);
    }
}

document.addEventListener('DOMContentLoaded', graficoCoberturaAnos); 