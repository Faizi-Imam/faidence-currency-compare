/**
 * Currency Exchange Comparison Platform - Historical Rate Chart Engine
 * Integrates Chart.js to generate and render beautiful dynamic line charts.
 */

let rateTrendChart = null;

/**
 * Generates mock historical data using a random walk starting from the current rate.
 * This ensures the charts are 100% static, fast, and highly realistic.
 */
function generateHistoricalData(currentRate, timeframe) {
    let points = 7;
    let labelFormat = { day: 'numeric', month: 'short' };
    
    if (timeframe === '1M') {
        points = 30;
    } else if (timeframe === '1Y') {
        points = 12;
        labelFormat = { month: 'short', year: '2-digit' };
    }
    
    const data = [];
    const labels = [];
    const now = new Date();
    
    // Volatility coefficient
    const volatility = 0.008; // 0.8% average daily change
    
    let activeRate = currentRate;
    
    for (let i = points - 1; i >= 0; i--) {
        const date = new Date();
        if (timeframe === '1Y') {
            date.setMonth(now.getMonth() - i);
        } else {
            date.setDate(now.getDate() - i);
        }
        
        labels.push(date.toLocaleDateString('en-US', labelFormat));
        
        // Random walk step
        if (i < points - 1) {
            const changePercent = (Math.random() - 0.48) * volatility; // slight upward drift for realism
            activeRate = activeRate * (1 + changePercent);
        }
        data.push(activeRate);
    }
    
    // Compute stats
    const high = Math.max(...data);
    const low = Math.min(...data);
    const avg = data.reduce((sum, val) => sum + val, 0) / data.length;
    
    return {
        labels,
        data,
        stats: {
            high: high.toFixed(4),
            low: low.toFixed(4),
            avg: avg.toFixed(4)
        }
    };
}

/**
 * Renders or updates the historical rate trend chart
 */
function renderRateChart(sourceCur, destCur, currentRate, timeframe = '1W') {
    const canvas = document.getElementById('rate-trend-chart');
    if (!canvas) return;
    
    // Update label text
    const labelSpan = document.getElementById('chart-currency-pair');
    if (labelSpan) {
        labelSpan.textContent = `${sourceCur}/${destCur}`;
    }
    
    const chartData = generateHistoricalData(currentRate, timeframe);
    
    // Update stats in the DOM
    const highEl = document.getElementById('trend-high');
    const avgEl = document.getElementById('trend-avg');
    const lowEl = document.getElementById('trend-low');
    
    if (highEl) highEl.textContent = chartData.stats.high;
    if (avgEl) avgEl.textContent = chartData.stats.avg;
    if (lowEl) lowEl.textContent = chartData.stats.low;
    
    // Colors
    const isUpTrend = chartData.data[chartData.data.length - 1] >= chartData.data[0];
    const strokeColor = isUpTrend ? '#10b981' : '#ef4444'; // Emerald vs Red
    const glowColor = isUpTrend ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
    
    const ctx = canvas.getContext('2d');
    
    // Gradient fill setup
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, glowColor);
    gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');
    
    if (rateTrendChart) {
        rateTrendChart.destroy();
    }
    
    rateTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: `${sourceCur} to ${destCur}`,
                data: chartData.data,
                borderColor: strokeColor,
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: strokeColor,
                pointBorderColor: '#121824',
                pointBorderWidth: 2,
                pointRadius: timeframe === '1W' ? 5 : 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: '#1e2640',
                    titleColor: '#f8fafc',
                    bodyColor: '#94a3b8',
                    borderColor: '#2d3748',
                    borderWidth: 1,
                    titleFont: { family: 'Outfit', weight: '600' },
                    bodyFont: { family: 'Outfit' },
                    callbacks: {
                        label: function(context) {
                            return ` Rate: ${context.parsed.y.toFixed(4)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#64748b',
                        font: { family: 'Outfit', size: 10 }
                    }
                },
                y: {
                    grid: {
                        color: '#2d3748',
                        tickBorderDash: [5, 5]
                    },
                    ticks: {
                        color: '#64748b',
                        font: { family: 'Outfit', size: 10 }
                    }
                }
            }
        }
    });
}
