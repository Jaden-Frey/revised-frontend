import React, { useEffect, useState, useRef } from "react";
import "./Bitcoin.css";
import Chart from "chart.js/auto";
import "./Questionmark.css";

const BitcoinCharts = () => {
  const [bitcoinData, setBitcoinData] = useState(null);
  const btcPolarAreaChartRef = useRef(null);
  const btcDoughnutChartRef = useRef(null);
  const btcScatterChartRef = useRef(null);
  const btcLineChartRef = useRef(null);
  const btcWaterfallBarChartRef = useRef(null);
  const [lineQuery, setLineQuery] = useState("");
  const [barQuery, setBarQuery] = useState("");
  const [polarQuery, setPolarQuery] = useState("");
  const [doughnutQuery, setDoughnutQuery] = useState("");
  const [scatterQuery, setScatterQuery] = useState("");
  const [polarInsights, setPolarInsights] = useState("");
  const [doughnutInsights, setDoughnutInsights] = useState("");
  const [scatterInsights, setScatterInsights] = useState("");
  const [lineInsights, setLineInsights] = useState("");
  const [waterfallBarInsights, setWaterfallBarInsights] = useState("");

  const [loadingPolar, setLoadingPolar] = useState(false);
  const [loadingScatter, setLoadingScatter] = useState(false);
  const [loadingLine, setLoadingLine] = useState(false);
  const [loadingDoughnut, setLoadingDoughnut] = useState(false);
  const [loadingWaterfall, setLoadingWaterfall] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchChartInsights = async (filteredData, setInsights, setLoading) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chartData: filteredData }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      if (isMounted.current) {
        setInsights(data.insights); 
      }
    } catch (error) {
      console.error('Error during API call:', error);
      if (isMounted.current) {
        setInsights(null); 
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };
  
  const handleFilterChange = async (selectedRelationship) => {
    if (!bitcoinData || typeof bitcoinData !== 'object') {
      console.error('Invalid or missing Bitcoin data');
      return;
    }

    let filteredData;
    let setInsights;
    let setLoading;

    switch (selectedRelationship) {
      case 'market_cap_vs_volume':
        filteredData = { market_cap: bitcoinData.market_cap, total_volume: bitcoinData.total_volume };
        setInsights = setPolarInsights;
        setLoading = setLoadingPolar;
        break;
      case 'market_cap_vs_circulating_supply':
        filteredData = { market_cap: bitcoinData.market_cap, circulating_supply: bitcoinData.circulating_supply };
        setInsights = setLineInsights;
        setLoading = setLoadingLine;
        break;
      case 'valuation_metrics':
        filteredData = { market_cap_change_24h: bitcoinData.market_cap_change_24h, price_change_percentage_24h: bitcoinData.price_change_percentage_24h };
        setInsights = setWaterfallBarInsights;
        setLoading = setLoadingWaterfall;
        break;
      case 'market_cap_vs_volume_vs_price':
        filteredData = {
          market_cap: bitcoinData.market_cap,
          total_volume: bitcoinData.total_volume,
          current_price: bitcoinData.current_price,
        };
        setInsights = setScatterInsights;
        setLoading = setLoadingScatter;
        break;
      case 'full_metrics_doughnut':
        filteredData = {
          market_cap: bitcoinData.market_cap, 
          total_volume: bitcoinData.total_volume, 
          current_price: bitcoinData.current_price, 
          circulating_supply: bitcoinData.circulating_supply, 
          total_supply: bitcoinData.total_supply
        };
        setInsights = setDoughnutInsights;
        setLoading = setLoadingDoughnut;
        break;
      default:
        console.error('Unknown relationship');
        return;
    }

    await fetchChartInsights(filteredData, setInsights, setLoading);
  };

  const LoadingEllipsis = () => {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount(prevCount => (prevCount + 1) % 4); 
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <span>{'.'.repeat(dotCount)}</span>;
};    

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/cryptocurrencies");
        const data = await response.json();
        const bitcoinFilteredData = data.filter(item => item.symbol === 'btc')[0];
        setBitcoinData(bitcoinFilteredData);

        if (data && data.length > 0) {
          const destroyChart = (chartRef) => {
            if (chartRef.current) {
              chartRef.current.destroy();
            }
          };

          const createChart = (chartRef, ctx, config) => {
            destroyChart(chartRef);
            chartRef.current = new Chart(ctx, config);
          };

          const labels = [''];
          const dataValues = [
          bitcoinFilteredData.current_price,
          bitcoinFilteredData.market_cap,
          bitcoinFilteredData.total_volume,
          bitcoinFilteredData.circulating_supply,
          bitcoinFilteredData.market_cap_change_percentage_24h,
          bitcoinFilteredData.market_cap_change_24h,
          bitcoinFilteredData.price_change_24h,
          bitcoinFilteredData.price_change_percentage_24h,
          bitcoinFilteredData.total_supply
        ];
      
//waterfall bar chart for Bitcoin Metrics
const btcWaterfallBarCtx = document.getElementById('btcWaterfallBarChart').getContext('2d');
createChart(btcWaterfallBarChartRef, btcWaterfallBarCtx, {
  type: 'bar',
  data: {
    labels: ['Market Cap Change (24h)', 'Market Cap Change % (24h)', 'Price Change % (24h)'],
    datasets: [
      {
        label: 'Market Cap Change (24h)',
        data: [
          bitcoinFilteredData.market_cap_change_24h,
          null, // Placeholder for alignment
          null  // Placeholder for alignment
        ],
        backgroundColor: 'rgba(60, 141, 255, 0.2)', // Market Cap Change color
        borderColor: 'rgba(60, 141, 255, 1)',   // Market Cap Change border color
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        label: 'Market Cap Change % (24h)',
        data: [
          null, // Placeholder for alignment
          bitcoinFilteredData.market_cap_change_percentage_24h,
          null  // Placeholder for alignment
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Market Cap Change % color
        borderColor: 'rgba(255, 99, 132, 1)',   // Market Cap Change % border color
        borderWidth: 1,
        yAxisID: 'y1'
      },
      {
        label: 'Price Change % (24h)',
        data: [
          null, // Placeholder for alignment
          null, // Placeholder for alignment
          bitcoinFilteredData.price_change_percentage_24h
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Price Change % color
        borderColor: 'rgba(255, 99, 132, 1)',   // Price Change % border color
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  },
  options: {
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        beginAtZero: false,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString(); // Format as monetary value
          }
        },
        title: {
          display: true,
          text: 'Monetary Value (USD)'
        }
      },
      y1: {
        type: 'linear',
        position: 'right',
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value.toLocaleString() + '%'; // Format as percentage value
          }
        },
        grid: {
          drawOnChartArea: false // Only draw grid lines for the left y-axis
        },
        title: {
          display: true,
          text: 'Percentage Change (%)'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(tooltipItem) {
            const datasetLabel = tooltipItem.dataset.label || '';
            const value = tooltipItem.raw;
            if (tooltipItem.datasetIndex === 0) { // Market Cap Change (24h)
              return `${datasetLabel}: $${value.toLocaleString()}`;
            } else { // Market Cap Change % (24h) and Price Change % (24h)
              return `${datasetLabel}: ${value.toLocaleString()}%`;
            }
          }
        }
      }
    }
  }
});
        
          // Polar Area Chart for Bitcoin Distribution Metrics
          const btcPolarAreaCtx = document.getElementById('btcPolarAreaChart').getContext('2d');

          const maxValue = Math.max(...dataValues);
          createChart(btcPolarAreaChartRef, btcPolarAreaCtx, {
            type: 'polarArea',
            data: {
              labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'],
              datasets: [{
                label: 'Bitcoin Distribution Metrics',
                data: [
                  bitcoinFilteredData.current_price,
                  bitcoinFilteredData.market_cap,
                  bitcoinFilteredData.total_volume,
                  bitcoinFilteredData.circulating_supply,
                ],
                backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                r: {
                  beginAtZero: true,
                  ticks: {
                    display: false, // Hide default ticks
                    stepSize: maxValue / 5 // Define the step size for rings
                  },
                }
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'top'
                },
                tooltip: {
                  enabled: true,
                  callbacks: {
                    title: function(tooltipItem) {
                      return tooltipItem[0].label; // Display the label
                    },
                    label: function(tooltipItem) {
                      const value = tooltipItem.raw;
                      return `Value: $${value.toLocaleString()}`; // Display the value
                    }
                  }
                }
              },
              hover: {
                mode: 'nearest',
                intersect: true
              }
            }
          });

// Enhanced Doughnut Chart for Market Cap, Total Volume, Market Cap Change % (24h), and Price Change % (24h)
const btcDoughnutCtx = document.getElementById('btcDoughnutChart').getContext('2d');
createChart(btcDoughnutChartRef, btcDoughnutCtx, {
  type: 'doughnut',
  data: {
    labels: ['Market Cap', 'Total Volume', 'Circulating Supply', 'Total Supply'],
    datasets: [{
      data: [
        bitcoinFilteredData.market_cap,
        bitcoinFilteredData.total_volume,
        bitcoinFilteredData.circulating_supply,
        bitcoinFilteredData.total_supply
      ],
      backgroundColor: [
        'rgba(75, 192, 192, 0.2)', // Market Cap color
        'rgba(153, 102, 255, 0.2)', // Total Volume color
        'rgba(255, 206, 86, 0.2)', // Market Cap Change % color
        'rgba(255, 99, 132, 0.2)'  // Price Change % color
      ],
      borderColor: [
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(255, 99, 132, 1)'
      ],
      borderWidth: 1
    }]
  },
  options: {
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(tooltipItem) {
            const label = tooltipItem.label || '';
            const value = tooltipItem.raw;
            if (tooltipItem.dataIndex === 0 || tooltipItem.dataIndex === 1) {
              return `${label}: $${value.toLocaleString()}`;
            } else {
              return `${label}: $${value.toLocaleString()}`;
            }
          }
        }
      }
    }
  }
});

// Bitcoin Scatter Plot Chart
const btcScatterCtx = document.getElementById('btcScatterChart').getContext('2d');
createChart(btcScatterChartRef, btcScatterCtx, {
  type: 'scatter',
  data: {
    datasets: [
      {
        label: 'Market Cap',
        data: [{ x: 1, y: bitcoinFilteredData.market_cap || 0 }],
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Total Volume',
        data: [{ x: 2, y: bitcoinFilteredData.total_volume || 0 }],
        backgroundColor: 'rgba(255, 206, 86, 0.2)', // Yellow
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Current Price',
        data: [{ x: 3, y: bitcoinFilteredData.current_price || 0 }],
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Teal
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Circulating Supply',
        data: [{ x: 4, y: bitcoinFilteredData.circulating_supply || 0 }],
        backgroundColor: 'rgba(153, 102, 255, 0.2)', // Purple
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'ATH',
        data: [{ x: 5, y: bitcoinFilteredData.ath || 0 }],
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Red
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'ATL',
        data: [{ x: 6, y: bitcoinFilteredData.atl || 0 }],
        backgroundColor: 'rgba(255, 159, 64, 0.2)', // Orange
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
        pointRadius: 7
      }
    ]
  },
  options: {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Metrics'
        },
        ticks: {
          callback: function(value, index, values) {
            const labels = [
              'Market Cap', 
              'Total Volume', 
              'Current Price', 
              'Circulating Supply', 
              'ATH', 
              'ATL'
            ];
            return labels[value - 1] || ''; // -1 to match zero-based index
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Value'
        },
        beginAtZero: true,
        suggestedMin: 0,
        suggestedMax: Math.max(
          bitcoinFilteredData.market_cap || 0,
          bitcoinFilteredData.total_volume || 0,
          bitcoinFilteredData.ath || 0,
          bitcoinFilteredData.atl || 0
        ) * 1.1,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(tooltipItem) {
            const value = tooltipItem.raw.y;
            const label = tooltipItem.dataset.label;
            return `${label}: $${value.toLocaleString()}`;
          }
        }
      }
    }
  }
});

// Line Chart for Bitcoin Metrics Over Time
const btcLineChartCtx = document.getElementById('btcLineChart').getContext('2d');
createChart(btcLineChartRef, btcLineChartCtx, {
  type: 'line',
  data: {
    labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'], 
    datasets: [
      {
        label: 'Bitcoin Metrics',
        data: [
          bitcoinFilteredData.current_price,
          bitcoinFilteredData.market_cap,
          bitcoinFilteredData.total_volume,
          bitcoinFilteredData.circulating_supply
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
        fill: true, // changed to true to create an area chart
        lineTension: 0.2
      }
    ]
  },
  options: {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Metrics' 
        },
        type: 'category', // Use category type if labels are not time-based
      },
      y: {
        title: {
          display: true,
          text: 'Value'
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
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
        enabled: true,
        callbacks: {
          label: function(tooltipItem) {
            const value = tooltipItem.raw;
            return `$${value.toLocaleString()}`;
          }
        }
      }
    }
  }
});
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    return () => {
      btcScatterChartRef.current && btcScatterChartRef.current.destroy();
      btcDoughnutChartRef.current &&  btcDoughnutChartRef.current.destroy();
      btcPolarAreaChartRef.current &&  btcPolarAreaChartRef.current.destroy();
      btcLineChartRef.current &&  btcLineChartRef.current.destroy();
      btcWaterfallBarChartRef.current &&  btcWaterfallBarChartRef.current.destroy();
    };
  }, []);

  const handleLineQuery = (query) => {
    if (bitcoinData) {
      let lineLabels = [];
      let lineDataValues = [];
  
      switch (query) {
        case "market_cap_vs_circulating_supply":
          lineLabels = ['Market Cap', 'Circulating Supply'];
          lineDataValues = [bitcoinData.market_cap, bitcoinData.circulating_supply];
          break;
        case "full_metrics_line":
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            bitcoinData.current_price,
            bitcoinData.market_cap,
            bitcoinData.total_volume,
            bitcoinData.circulating_supply
          ];
          break;
        default:
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            bitcoinData.current_price,
            bitcoinData.market_cap,
            bitcoinData.total_volume,
            bitcoinData.circulating_supply
          ];
      }
  
      updateLineChart(lineDataValues, lineLabels);
    }
};

const handleBarChartQuery = (query) => {
  if (bitcoinData) {
      let barLabels = [];
      let barDataValues = [];
      let isPercentage = false;

      switch (query) {
          case "valuation_metrics":
              barLabels = ['Market Cap Change (24h)', 'Price Change % (24h)'];
              barDataValues = [
                  [bitcoinData.market_cap_change_24h, null],
                  [null, bitcoinData.price_change_percentage_24h]
              ];
              isPercentage = true;
              break;
          case "full_metrics_bar":
          default:
              barLabels = ['Market Cap Change (24h)', 'Market Cap Change % (24h)', 'Price Change % (24h)'];
              barDataValues = [
                  [bitcoinData.market_cap_change_24h, null, null],
                  [null, bitcoinData.market_cap_change_percentage_24h, null],
                  [null, null, bitcoinData.price_change_percentage_24h]
              ];
              break;
      }

      updateBarChart(barDataValues, barLabels, isPercentage);
  }
};

const handlePolarQuery = (query) => {
  if (bitcoinData) {
    let polarLabels = [];
    let polarDataValues = [];

    switch (query) {
      case "market_cap_vs_volume":
        polarLabels = ['Market Cap', 'Total Volume'];
        polarDataValues = [bitcoinData.market_cap, bitcoinData.total_volume];
        break;
      case "full_metrics_polar":
        polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
        polarDataValues = [
          bitcoinData.current_price,
          bitcoinData.market_cap,
          bitcoinData.total_volume,
          bitcoinData.circulating_supply
        ];
        break;
      default:
        // default case should handle fallback
        polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
        polarDataValues = [
          bitcoinData.current_price,
          bitcoinData.market_cap,
          bitcoinData.total_volume,
          bitcoinData.circulating_supply
        ];
    }

    updatePolarChart(polarDataValues, polarLabels);
  }
};

const handleDoughnutQuery = (query) => {
  if (bitcoinData) {
      let doughnutLabels = [];
      let doughnutDataValues = [];

      switch (query) {
          case "full_metrics_doughnut":
              doughnutLabels = ['Market Cap', 'Total Volume', 'Circulating Supply', 'Total Supply'];
              doughnutDataValues = [
                  bitcoinData.market_cap,
                  bitcoinData.total_volume,
                  bitcoinData.circulating_supply,
                  bitcoinData.total_supply
              ];
              break;
          default:
              // Fallback to full metrics
              doughnutLabels = ['Market Cap', 'Total Volume', 'Circulating Supply', 'Total Supply'];
              doughnutDataValues = [
                  bitcoinData.market_cap,
                  bitcoinData.total_volume,
                  bitcoinData.circulating_supply,
                  bitcoinData.total_supply
              ];
      }

      updateDoughnutChart(doughnutDataValues, doughnutLabels);
  }
};

// Function to handle the scatter query
const handleScatterQuery = (query) => {
  if (bitcoinData) {
    let scatterLabels = [];
    let scatterDataValues = [];

    switch (query) {
      case "market_cap_vs_volume_vs_price":
        scatterLabels = ['Market Cap', 'Total Volume', 'Current Price'];
        scatterDataValues = [
          [{ x: 1, y: bitcoinData.market_cap }],
          [{ x: 2, y: bitcoinData.total_volume }],
          [{ x: 3, y: bitcoinData.current_price }]
        ];
        break;
      case "full_metrics_scatter":
        scatterLabels = [
          'Market Cap', 'Total Volume', 'Current Price',
          'Circulating Supply', 'ATH', 'ATL'
        ];
        scatterDataValues = [
          [{ x: 1, y: bitcoinData.market_cap }],
          [{ x: 2, y: bitcoinData.total_volume }],
          [{ x: 3, y: bitcoinData.current_price }],
          [{ x: 4, y: bitcoinData.circulating_supply }],
          [{ x: 5, y: bitcoinData.ath }],
          [{ x: 6, y: bitcoinData.atl }]
        ];
        break;
      default:
        // Default to full metrics if no match
        scatterLabels = [
          'Market Cap', 'Total Volume', 'Current Price',
          'Circulating Supply', 'ATH', 'ATL'
        ];
        scatterDataValues = [
          [{ x: 1, y: bitcoinData.market_cap }],
          [{ x: 2, y: bitcoinData.total_volume }],
          [{ x: 3, y: bitcoinData.current_price }],
          [{ x: 4, y: bitcoinData.circulating_supply }],
          [{ x: 5, y: bitcoinData.ath }],
          [{ x: 6, y: bitcoinData.atl }]
        ];
    }

    updateScatterChart(scatterDataValues, scatterLabels);
  }
};

// Function to update the scatter chart
const updateScatterChart = (dataValues, labels) => {
  if (btcScatterChartRef.current) {
    btcScatterChartRef.current.data.datasets.forEach((dataset, index) => {
      dataset.data = dataValues[index];
    });
    btcScatterChartRef.current.data.labels = labels;
    btcScatterChartRef.current.update();
  }
};

const updateDoughnutChart = (dataValues, labels) => {
  if (btcDoughnutChartRef.current) {
      const colorMapping = {
          'Market Cap': 'rgba(75, 192, 192, 0.2)',  
          'Total Volume': 'rgba(153, 102, 255, 0.2)',  
          'Circulating Supply': 'rgba(255, 206, 86, 0.2)',  
          'Total Supply': 'rgba(255, 99, 132, 0.2)'  
      };

      const borderColorMapping = {
          'Market Cap': 'rgba(75, 192, 192, 1)',
          'Total Volume': 'rgba(153, 102, 255, 1)',
          'Circulating Supply': 'rgba(255, 206, 86, 1)',
          'Total Supply': 'rgba(255, 99, 132, 1)'
      };

      btcDoughnutChartRef.current.data.datasets[0].data = dataValues;
      btcDoughnutChartRef.current.data.labels = labels;
      btcDoughnutChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
      btcDoughnutChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
      btcDoughnutChartRef.current.update();
  }
};

// Function to update the waterfall bar chart
const updateBarChart = (dataValues, labels, isPercentage) => {
  if (btcWaterfallBarChartRef.current) {
      btcWaterfallBarChartRef.current.data.datasets.forEach((dataset, index) => {
          dataset.data = dataValues[index];
      });
      btcWaterfallBarChartRef.current.data.labels = labels;
      if (isPercentage) {
          btcWaterfallBarChartRef.current.options.scales.y.title.text = 'Percentage Change (%)';
          btcWaterfallBarChartRef.current.options.scales.y1.title.text = 'Percentage Change (%)';
      } else {
          btcWaterfallBarChartRef.current.options.scales.y.title.text = 'Monetary Value (USD)';
          btcWaterfallBarChartRef.current.options.scales.y1.title.text = 'Percentage Change (%)';
      }
      btcWaterfallBarChartRef.current.update();
  }
};

// Function to update the line chart
const updateLineChart = (dataValues, labels) => {
  if (btcLineChartRef.current) {
    btcLineChartRef.current.data.datasets[0].data = dataValues;
    btcLineChartRef.current.data.labels = labels;
    btcLineChartRef.current.update();
  }
};

const updatePolarChart = (dataValues, labels) => {
  if (btcPolarAreaChartRef.current) {
      const colorMapping = {
          'Current Price': 'rgba(255, 99, 132, 0.2)',
          'Market Cap': 'rgba(54, 162, 235, 0.2)',  
          'Total Volume': 'rgba(255, 206, 86, 0.2)',  
          'Circulating Supply': 'rgba(75, 192, 192, 0.2)'  
      };

      const borderColorMapping = {
          'Current Price': 'rgba(255, 99, 132, 1)',
          'Market Cap': 'rgba(54, 162, 235, 1)',
          'Total Volume': 'rgba(255, 206, 86, 1)',
          'Circulating Supply': 'rgba(75, 192, 192, 1)'
      };

      btcPolarAreaChartRef.current.data.datasets[0].data = dataValues;
      btcPolarAreaChartRef.current.data.labels = labels;
      btcPolarAreaChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
      btcPolarAreaChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
      btcPolarAreaChartRef.current.update();
  }
};

const [showPolarChartInfo, setShowPolarChartInfo] = useState(false);
const [showDoughnutChartInfo, setShowDoughnutChartInfo] = useState(false);
const [showScatterChartInfo, setShowScatterChartInfo] = useState(false);
const [showLineChartInfo, setShowLineChartInfo] = useState(false);
const [showWaterfallBarChartInfo, setShowWaterfallBarChartInfo] = useState(false);

const handleLineQueryChange = (e) => {
  const query = e.target.value;
  setLineQuery(query);
  handleLineQuery(query);
  handleFilterChange(query);
  setShowLineChartInfo(query === 'market_cap_vs_circulating_supply');

  if (query === 'full_metrics_line') {
    setShowLineChartInfo(false);
  }
};

const handleBarQueryChange = (e) => {
  const query = e.target.value;
  setBarQuery(query);
  handleBarChartQuery(query);
  handleFilterChange(query);
  setShowWaterfallBarChartInfo(query === 'valuation_metrics');

  if (query === 'full_metrics_bar') {
    setShowWaterfallBarChartInfo(false);
  }
};

const handlePolarOrDoughnutQueryChange = (e) => {
  const query = e.target.value;
  if (query.includes('doughnut')) {
    setDoughnutQuery(query);
    setPolarQuery('');  
    handleFilterChange(query); 
    setShowDoughnutChartInfo(query === 'full_metrics_doughnut');
    setShowPolarChartInfo(false); 
  } else {
    setPolarQuery(query);
    handlePolarQuery(query);
    handleFilterChange(query);
    setShowPolarChartInfo(query === 'market_cap_vs_volume');
    setShowDoughnutChartInfo(false);
  }

  if (query === 'full_metrics_polar' || query === 'full_metrics_doughnut') {
    setShowPolarChartInfo(false);
    setShowDoughnutChartInfo(false);
  }
};

const handleScatterQueryChange = (e) => {
  const query = e.target.value;
  setScatterQuery(query);
  handleScatterQuery(query);
  handleFilterChange(query);
  setShowScatterChartInfo(query === 'market_cap_vs_volume_vs_price');

  if (query === 'full_metrics_scatter') {
    setShowScatterChartInfo(false);
  }
};

const toggleScatterChartInfo = () => setShowScatterChartInfo((prev) => !prev);
const toggleLineChartInfo = () => setShowLineChartInfo((prev) => !prev);
const toggleWaterfallBarChartInfo = () => setShowWaterfallBarChartInfo((prev) => !prev);
const togglePolarChartInfo = () => setShowPolarChartInfo((prev) => !prev);
const toggleDoughnutChartInfo = () => setShowDoughnutChartInfo((prev) => !prev);

 // State for Polar Chart Insights
 const [currentPolarInsight, setCurrentPolarInsight] = useState(0);
 const [polarInsightContent, setPolarInsightContent] = useState(null);
 const validPolarInsights = polarInsights.split('\n').filter(insight => insight.trim() !== "");

 useEffect(() => {
   setPolarInsightContent(validPolarInsights.length > 0 ? validPolarInsights[currentPolarInsight] : null);
 }, [currentPolarInsight, validPolarInsights]);

 const handleNextPolarInsight = () => {
   const nextIndex = currentPolarInsight + 1;
   setCurrentPolarInsight(nextIndex >= validPolarInsights.length ? 0 : nextIndex);
 };

 const handlePrevPolarInsight = () => {
   const prevIndex = currentPolarInsight - 1;
   setCurrentPolarInsight(prevIndex < 0 ? validPolarInsights.length - 1 : prevIndex);
 };

 // State for Doughnut Chart Insights
 const [currentDoughnutInsight, setCurrentDoughnutInsight] = useState(0);
 const [doughnutInsightContent, setDoughnutInsightContent] = useState(null);
 const validDoughnutInsights = doughnutInsights.split('\n').filter(insight => insight.trim() !== "");

 useEffect(() => {
   setDoughnutInsightContent(validDoughnutInsights.length > 0 ? validDoughnutInsights[currentDoughnutInsight] : null);
 }, [currentDoughnutInsight, validDoughnutInsights]);

 const handleNextDoughnutInsight = () => {
   const nextIndex = currentDoughnutInsight + 1;
   setCurrentDoughnutInsight(nextIndex >= validDoughnutInsights.length ? 0 : nextIndex);
 };

 const handlePrevDoughnutInsight = () => {
   const prevIndex = currentDoughnutInsight - 1;
   setCurrentDoughnutInsight(prevIndex < 0 ? validDoughnutInsights.length - 1 : prevIndex);
 };

 // State for Scatter Chart Insights
 const [currentScatterInsight, setCurrentScatterInsight] = useState(0);
 const [scatterInsightContent, setScatterInsightContent] = useState(null);
 const validScatterInsights = scatterInsights.split('\n').filter(insight => insight.trim() !== "");

 useEffect(() => {
   setScatterInsightContent(validScatterInsights.length > 0 ? validScatterInsights[currentScatterInsight] : null);
 }, [currentScatterInsight, validScatterInsights]);

 const handleNextScatterInsight = () => {
   const nextIndex = currentScatterInsight + 1;
   setCurrentScatterInsight(nextIndex >= validScatterInsights.length ? 0 : nextIndex);
 };

 const handlePrevScatterInsight = () => {
   const prevIndex = currentScatterInsight - 1;
   setCurrentScatterInsight(prevIndex < 0 ? validScatterInsights.length - 1 : prevIndex);
 };

 // State for Line Chart Insights
 const [currentLineInsight, setCurrentLineInsight] = useState(0);
 const [lineInsightContent, setLineInsightContent] = useState(null);
 const validLineInsights = lineInsights.split('\n').filter(insight => insight.trim() !== "");

 useEffect(() => {
   setLineInsightContent(validLineInsights.length > 0 ? validLineInsights[currentLineInsight] : null);
 }, [currentLineInsight, validLineInsights]);

 const handleNextLineInsight = () => {
   const nextIndex = currentLineInsight + 1;
   setCurrentLineInsight(nextIndex >= validLineInsights.length ? 0 : nextIndex);
 };

 const handlePrevLineInsight = () => {
   const prevIndex = currentLineInsight - 1;
   setCurrentLineInsight(prevIndex < 0 ? validLineInsights.length - 1 : prevIndex);
 };

 // State for Waterfall Bar Chart Insights
 const [currentWaterfallBarInsight, setCurrentWaterfallBarInsight] = useState(0);
 const [waterfallBarInsightContent, setWaterfallBarInsightContent] = useState(null);
 const validWaterfallBarInsights = waterfallBarInsights.split('\n').filter(insight => insight.trim() !== "");

 useEffect(() => {
   setWaterfallBarInsightContent(validWaterfallBarInsights.length > 0 ? validWaterfallBarInsights[currentWaterfallBarInsight] : null);
 }, [currentWaterfallBarInsight, validWaterfallBarInsights]);

 const handleNextWaterfallBarInsight = () => {
   const nextIndex = currentWaterfallBarInsight + 1;
   setCurrentWaterfallBarInsight(nextIndex >= validWaterfallBarInsights.length ? 0 : nextIndex);
 };

 const handlePrevWaterfallBarInsight = () => {
   const prevIndex = currentWaterfallBarInsight - 1;
   setCurrentWaterfallBarInsight(prevIndex < 0 ? validWaterfallBarInsights.length - 1 : prevIndex);
 };


return (
  <div className="bitcoinpage-wrapper">
      <h1 className="page-title">Bitcoin Visualizations</h1>
      <div className="faq-icon" onClick={() => window.location.href = 'https://revised-backend-refined.onrender.com/faq'}>
        <i className="bi bi-question-circle" title="Off to FAQ"></i>
      </div>

      <div className="bitcoinchart-container">
        {/* Line Chart Dropdown */}
        <div className="bitcoinquery-container">
          <select value={lineQuery} onChange={handleLineQueryChange}>
            <option value="" hidden>📉 Line Chart </option>
            <option value="market_cap_vs_circulating_supply">📉 Market Cap vs. Circulating Supply</option>
            <option value="full_metrics_line">📉 Reset </option>
          </select>
        </div>

        {/* Bar Chart Dropdown */}
        <div className="bitcoinquery-container">
          <select value={barQuery} onChange={handleBarQueryChange}>
            <option value="" hidden>📊 Waterfall Bar Chart </option>
            <option value="valuation_metrics">📊 Performance Metrics</option>
            <option value="full_metrics_bar">📊 Reset </option>
          </select>
        </div>

        {/* Polar Chart Dropdown */}
        <div className="bitcoinquery-container">
        <select 
            value={polarQuery || doughnutQuery} 
            onChange={handlePolarOrDoughnutQueryChange}
          >
            <option value="" hidden>❄️🍩 Polar / Doughnut Chart</option>
            <option value="market_cap_vs_volume">❄️ Market Cap vs. Volume</option>
            <option value="full_metrics_polar">❄️🍩 Reset </option>
            <option value="full_metrics_doughnut">🍩 Doughnut Metrics</option>
          </select>
        </div>

        {/* Scatter Chart Dropdown */}
        <div className="bitcoinquery-container">
          <select value={scatterQuery} onChange={handleScatterQueryChange}>
            <option value="" hidden>🌍 Scatter Chart</option>
            <option value="market_cap_vs_volume_vs_price">🌍 Market Cap vs. Volume vs. Price</option>
            <option value="full_metrics_scatter">🌍 Reset </option>
          </select>
        </div>
      </div>

<div className="bitcoinchart-container">
  
 {/* Polar Area Chart */}
<div className="bitcoinchart-wrapper bar">
  <div className="bitcoinchart-header">
    <h2>Polar Area Chart for Bitcoin KPIs</h2>
    {polarQuery === 'market_cap_vs_volume' && (
      <span className="bitcoininfo-icon" title="More Information">🤔</span>
    )}
  </div>
  <canvas id="btcPolarAreaChart"></canvas>
  {loadingPolar ? (
    <div className="bitcoinloading-indicator">
      Fetching insights<LoadingEllipsis />
    </div>
  ) : (
    polarInsights && validPolarInsights.length > 0 && polarQuery !== 'full_metrics_polar' && (  // Only show insights if not resetting
      <div className="bitcoinchart-details">
        <div key={currentPolarInsight} className="bitcoinchart-item">
          <div className="bitcoinchart-header">
            <span>{currentPolarInsight + 1}. </span>
          </div>
          <div className="bitcoinchart-content">
            {polarInsightContent ? polarInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
          </div>
          <div className="bitcoininsight-navigation">
            <span className="bitcoinnav-arrow" onClick={handlePrevPolarInsight}>{'<'}</span>
            <span className="bitcoinnav-arrow" onClick={handleNextPolarInsight}>{'>'}</span>
          </div>
        </div>
      </div>
    )
  )}
</div>

  {/* Doughnut Chart */}
  <div className="bitcoinchart-wrapper bar">
    <div className="bitcoinchart-header">
      <h2>Doughnut Chart for Bitcoin Metrics</h2>
      {doughnutQuery === 'full_metrics_doughnut' && polarQuery !== 'full_metrics_polar' && (
        <span className="bitcoininfo-icon" title="More Information"></span>
      )}
    </div>
    <canvas id="btcDoughnutChart"></canvas>
    {loadingDoughnut ? (
      <div className="bitcoinloading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      doughnutInsights && validDoughnutInsights.length > 0 && polarQuery !== 'full_metrics_polar' && (
        <div className="bitcoinchart-details">
          {validDoughnutInsights.length > 0 ? (
            <div key={currentDoughnutInsight} className="bitcoinchart-item">
              <div className="bitcoinchart-header">
                <span>{currentDoughnutInsight + 1}. </span>
              </div>
              <div className="bitcoinchart-content">
                {doughnutInsightContent ? doughnutInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
              </div>
              <div className="bitcoininsight-navigation">
                <span className="bitcoinnav-arrow" onClick={handlePrevDoughnutInsight}>{'<'}</span>
                <span className="bitcoinnav-arrow" onClick={handleNextDoughnutInsight}>{'>'}</span>
              </div>
            </div>
          ) : (
            <p>No insights available</p>
          )}
        </div>
      )
    )}
  </div>

  {/* Scatter Chart */}
  <div className="bitcoinchart-wrapper bar">
    <div className="bitcoinchart-header">
      <h2>Scatterplot Chart for Bitcoin Metrics</h2>
      {scatterQuery === 'market_cap_vs_volume_vs_price' && (
        <span className="bitcoininfo-icon" title="More Information">🤔</span>
      )}
    </div>
    <canvas id="btcScatterChart"></canvas>
    {loadingScatter ? (
      <div className="bitcoinloading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      scatterInsights && validScatterInsights.length > 0 && scatterQuery !== 'full_metrics_scatter' && (
        <div className="bitcoinchart-details">
          {validScatterInsights.length > 0 ? (
            <div key={currentScatterInsight} className="bitcoinchart-item">
              <div className="bitcoinchart-header">
                <span>{currentScatterInsight + 1}. </span>
              </div>
              <div className="bitcoinchart-content">
                {scatterInsightContent ? scatterInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
              </div>
              <div className="bitcoininsight-navigation">
                <span className="bitcoinnav-arrow" onClick={handlePrevScatterInsight}>{'<'}</span>
                <span className="bitcoinnav-arrow" onClick={handleNextScatterInsight}>{'>'}</span>
              </div>
            </div>
          ) : (
            <p>No insights available</p>
          )}
        </div>
      )
    )}
  </div>

  {/* Line Chart */}
<div className="bitcoinchart-wrapper bar">
  <div className="bitcoinchart-header">
    <h2>Line Graph for Bitcoin Metrics</h2>
    {lineQuery === 'market_cap_vs_circulating_supply' && (
      <span className="bitcoininfo-icon" title="More Information">🤔</span>
    )}
  </div>
  <canvas id="btcLineChart"></canvas>
  {loadingLine ? (
    <div className="bitcoinloading-indicator">
      Fetching insights<LoadingEllipsis />
    </div>
  ) : (
    lineInsights && validLineInsights.length > 0 && lineQuery !== 'full_metrics_line' && (  // Only show insights if not resetting
      <div className="bitcoinchart-details">
        <div key={currentLineInsight} className="bitcoinchart-item">
          <div className="bitcoinchart-header">
            <span>{currentLineInsight + 1}. </span>
          </div>
          <div className="bitcoinchart-content">
            {lineInsightContent ? lineInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
          </div>
          <div className="bitcoininsight-navigation">
            <span className="bitcoinnav-arrow" onClick={handlePrevLineInsight}>{'<'}</span>
            <span className="bitcoinnav-arrow" onClick={handleNextLineInsight}>{'>'}</span>
          </div>
        </div>
      </div>
    )
  )}
</div>

  {/* Waterfall Bar Chart */}
<div className="bitcoinchart-wrapper bar">
  <div className="bitcoinchart-header">
    <h2>Waterfall Bar Chart for Bitcoin Metrics</h2>
    {barQuery === 'valuation_metrics' && (
      <span className="bitcoininfo-icon" title="More Information">🤔</span>
    )}
  </div>
  <canvas id="btcWaterfallBarChart"></canvas>
  {loadingWaterfall ? (
    <div className="bitcoinloading-indicator">
      Fetching insights<LoadingEllipsis />
    </div>
  ) : (
    waterfallBarInsights && validWaterfallBarInsights.length > 0 && barQuery !== 'full_metrics_bar' && (  // Only show insights if not resetting
      <div className="bitcoinchart-details">
        <div key={currentWaterfallBarInsight} className="bitcoinchart-item">
          <div className="bitcoinchart-header">
            <span>{currentWaterfallBarInsight + 1}. </span>
          </div>
          <div className="bitcoinchart-content">
            {waterfallBarInsightContent ? waterfallBarInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
          </div>
          <div className="bitcoininsight-navigation">
            <span className="bitcoinnav-arrow" onClick={handlePrevWaterfallBarInsight}>{'<'}</span>
            <span className="bitcoinnav-arrow" onClick={handleNextWaterfallBarInsight}>{'>'}</span>
          </div>
        </div>
      </div>
    )
  )}
  </div>
</div>

</div>
  );
};

export default BitcoinCharts;
