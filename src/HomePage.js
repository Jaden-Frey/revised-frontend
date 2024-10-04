import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import "./HomePage.css";
import "./Questionmark.css";

function HomePage() {
  const [coinData, setCoinData] = useState({});
  const chartRefs = useRef({ bar: null, scatter: null, line: null });
  
  // Fetch data for all coins
  useEffect(() => {
    const fetchCoinData = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd`
        );
        const data = await response.json();

        const validCoins = [
          'bitcoin', 'ethereum', 'binancecoin', 'tether', 'usd-coin',
          'ripple', 'cardano', 'dogecoin', 'solana', 'polkadot'
        ];

        const filteredData = data.filter(coin => validCoins.includes(coin.id));
        setCoinData(filteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchCoinData();
  }, []);

  // Create the charts
  useEffect(() => {
    if (Object.keys(coinData).length === 0) return;

    const labels = Object.keys(coinData).map(coin => coinData[coin].name);
    const dataCurrentPrice = Object.keys(coinData).map(coin => coinData[coin].current_price);
    const dataMarketCap = Object.keys(coinData).map(coin => coinData[coin].market_cap);
    const dataTotalVolume = Object.keys(coinData).map(coin => coinData[coin].total_volume);

// Bar Chart
const barCtx = document.getElementById('barChart').getContext('2d');
chartRefs.current.bar = new Chart(barCtx, {
  type: 'bar',
  data: {
    labels,
    datasets: [
      {
        label: 'Current Price',
        data: dataCurrentPrice,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        barThickness: 50,
      },
      {
        label: 'Market Cap',
        data: dataMarketCap,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        barThickness: 50,
      },
      {
        label: 'Total Volume',
        data: dataTotalVolume,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        barThickness: 50,
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Cryptocurrencies',
          font: {
            size: 14
          }
        },
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          autoSkip: true,
          maxRotation: 90,
          minRotation: 45
        }
      },
      y: {
        title: {
          display: true,
          text: 'Value (USD)',
          font: {
            size: 14
          }
        },
        stacked: true,
        ticks: {
          callback: function(value) {
            return `$${value.toLocaleString()}`;
          },
        },
        grid: {
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: false
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.dataset.label}: $${tooltipItem.raw.toLocaleString()}`;
          }
        }
      }
    }
  }
});

// Scatter Chart
const scatterCtx = document.getElementById('scatterChart').getContext('2d');
chartRefs.current.scatter = new Chart(scatterCtx, {
  type: 'scatter',
  data: {
    datasets: Object.keys(coinData).map((coin, index) => {
      const colors = [
        '#008B8D', 
        '#007F7F', 
        '#006F6F', 
        '#4CAF50',
        '#388E3C',
        '#2C6D3F', 
        '#FFB74D', 
        '#FF9800', 
        '#F57C00', 
        '#FF5252'  
      ];
      
      const baseColor = colors[index % colors.length];

      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);

      return {
        label: coinData[coin].name,
        data: [
          { x: coinData[coin].market_cap, y: coinData[coin].total_volume }
        ],
        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.2)`, 
        borderColor: `rgba(${r}, ${g}, ${b}, 1)`, 
        borderWidth: 1,
        pointRadius: 6,
        pointHoverRadius: 8
      };
    })
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Market Cap (USD)',
          font: {
            size: 14
          }
        },
        grid: {
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: false
        },
        ticks: {
          callback: function(value) {
            return `$${value.toLocaleString()}`;
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Total Volume (USD)',
          font: {
            size: 14
          }
        },
        grid: {
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: false
        },
        ticks: {
          callback: function(value) {
            return `$${value.toLocaleString()}`;
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
            label: function(tooltipItem) {
                const datasetIndex = tooltipItem.datasetIndex;
                const dataIndex = tooltipItem.dataIndex;
                const dataset = tooltipItem.chart.data.datasets[datasetIndex];
                const coinName = dataset.label;
                const coinDetails = coinData[Object.keys(coinData)[datasetIndex]];
    
                return [
                  `Coin: ${coinName}`,
                  `Market Cap: $${tooltipItem.raw.x.toLocaleString()}`,
                  `Volume: $${tooltipItem.raw.y.toLocaleString()}`
                ];
          }
        }
      }
    }
  }
});

// Dual Axis Line Chart
const lineCtx = document.getElementById('lineChart').getContext('2d');
chartRefs.current.line = new Chart(lineCtx, {
  type: 'line',
  data: {
    labels,
    datasets: [
      {
        label: 'Current Price',
        data: dataCurrentPrice,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1',
        borderWidth: 2
      },
      {
        label: 'Market Cap',
        data: dataMarketCap,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        yAxisID: 'y2',
        borderWidth: 2
      },
      {
        label: 'Total Volume',
        data: dataTotalVolume,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y2',
        borderWidth: 2
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Cryptocurrencies',
          font: {
            size: 14
          }
        },
        grid: {
          drawBorder: false,
          drawOnChartArea: true,
          drawTicks: false
        }
      },
      y1: {
        title: {
          display: true,
          text: 'Current Price (USD)',
          font: {
            size: 14
          }
        },
        position: 'left',
        grid: {
          drawBorder: false,
          drawOnChartArea: false,
          drawTicks: false
        }
      },
      y2: {
        title: {
          display: true,
          text: 'Market Cap and Volume (USD)',
          font: {
            size: 14
          }
        },
        position: 'right',
        grid: {
          drawBorder: false,
          drawOnChartArea: false,
          drawTicks: false
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.dataset.label}: $${tooltipItem.raw.toLocaleString()}`;
          }
        }
      }
    }
  }
});
    // Cleanup function
    return () => {
      if (chartRefs.current.bar) chartRefs.current.bar.destroy();
      if (chartRefs.current.scatter) chartRefs.current.scatter.destroy();
      if (chartRefs.current.line) chartRefs.current.line.destroy();
    };
  }, [coinData]);

  return (
    <div className="page-wrapper">
  <h1 className="page-title">Market Visualizations</h1>
  <div className="faq-icon" onClick={() => window.location.href = 'http://localhost:5000/faq'}>
    <i className="bi bi-question-circle" title="Off to FAQ"></i>
  </div>
  <div className="homepage-container">
    <div className="chart-container">
      {/* Bar Chart */}
      <div className="chart-wrapper bar">
        <div className="chart-header">
          <h2>Comparative Bar Chart for All Coins</h2>
        </div>
        <canvas id="barChart"></canvas>
      </div>

      {/* Scatter Chart */}
      <div className="chart-wrapper bar">
        <div className="chart-header">
          <h2>Scatter Chart for All Coins</h2>
        </div>
        <canvas id="scatterChart"></canvas>
      </div>

      {/* Dual Axis Line Chart */}
      <div className="chart-wrapper bar">
        <div className="chart-header">
          <h2>Dual Axis Line Chart for All Coins</h2>
        </div>
        <canvas id="lineChart"></canvas>
      </div>
    </div>
  </div>
</div>
  );
}

export default HomePage;
