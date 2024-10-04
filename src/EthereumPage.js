import React, { useEffect, useState, useRef } from "react";
import "./Ethereum.css";
import Chart from "chart.js/auto";
import "./Questionmark.css";

const EthereumCharts = () => {
  const [ethereumData, setEthereumData] = useState(null);
  const ethLineChartRef = useRef(null);
  const ethPolarAreaChartRef = useRef(null);
  const ethDoughnutChartRef = useRef(null);
  const ethScatterChartRef = useRef(null);
  const ethCombinedChartRef = useRef(null);
  const [lineQuery, setLineQuery] = useState("");
  const [polarQuery, setPolarQuery] = useState("");
  const [scatterQuery, setScatterQuery] = useState("");
  const [combinedQuery, setCombinedQuery] = useState("");
  const [doughnutQuery, setDoughnutQuery] = useState("");
  const [doughnutInsights, setDoughnutInsights] = useState("");
  const [polarInsights, setPolarInsights] = useState("");
  const [scatterInsights, setScatterInsights] = useState("");
  const [lineInsights, setLineInsights] = useState("");
  const [priceChangeInsights, setPriceChangeInsights] = useState('');

  const [loadingPolar, setLoadingPolar] = useState(false);
  const [loadingDoughnut, setLoadingDoughnut] = useState(false);
  const [loadingLine, setLoadingLine] = useState(false);
  const [loadingScatter, setLoadingScatter] = useState(false);
  const [loadingPriceChange, setLoadingPriceChange] = useState(false);

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
  if (!ethereumData || typeof ethereumData !== 'object') {
    console.error('Invalid or missing Ethereum data');
    return;
  }

    let filteredData;
    let setInsights;
    let setLoading;

  switch (selectedRelationship) {
    case 'market_cap_vs_volume':
      filteredData = { market_cap: ethereumData.market_cap, total_volume: ethereumData.total_volume };
      setInsights = setPolarInsights;
      setLoading = setLoadingPolar;
      break;
    case 'market_cap_vs_circulating_supply':
      filteredData = { market_cap: ethereumData.market_cap, circulating_supply: ethereumData.circulating_supply };
      setInsights = setLineInsights;
      setLoading = setLoadingLine;
      break;
    case 'market_cap_vs_volume_market_cap_change':
        filteredData = { market_cap: ethereumData.market_cap, total_volume: ethereumData.total_volume, market_cap_change_percentage_24h: ethereumData.market_cap_change_percentage_24h };
        setInsights = setPriceChangeInsights;
        setLoading = setLoadingPriceChange;
      break;
    case 'market_cap_vs_volume_vs_price':
      filteredData = { market_cap: ethereumData.market_cap, total_volume: ethereumData.total_volume, current_price: ethereumData.current_price };
      setInsights = setScatterInsights;
      setLoading = setLoadingScatter;
      break;
    case 'full_metrics_doughnut':
      filteredData = { 
        market_cap: ethereumData.market_cap, 
        total_volume: ethereumData.total_volume, 
        current_price: ethereumData.current_price, 
        circulating_supply: ethereumData.circulating_supply, 
        total_supply: ethereumData.total_supply
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
        const ethereumFilteredData = data.filter(item => item.symbol === 'eth')[0];
        setEthereumData(ethereumFilteredData);

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
        ethereumFilteredData.current_price,
        ethereumFilteredData.market_cap,
        ethereumFilteredData.market_cap_change_24h,
        ethereumFilteredData.total_volume,
        ethereumFilteredData.circulating_supply,
        ethereumFilteredData.total_supply,
        ethereumFilteredData.price_percentage_change_24h,
        ethereumFilteredData.market_percentage_change_24h
      ];

// Line Chart for Ethereum Metrics Over Time
const ethLineChartCtx = document.getElementById('ethLineChart').getContext('2d');
createChart(ethLineChartRef, ethLineChartCtx, {
  type: 'line',
  data: {
    labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'], 
    datasets: [
      {
        label: 'Ethereum Metrics',
        data: [
          ethereumFilteredData.current_price,
          ethereumFilteredData.market_cap,
          ethereumFilteredData.total_volume,
          ethereumFilteredData.circulating_supply
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

// Polar Area Chart for Ethereum Distribution Metrics
const ethPolarAreaCtx = document.getElementById('ethPolarAreaChart').getContext('2d');

// Define your data values for Ethereum
const ethereumDataValues = [
  ethereumFilteredData.current_price,
  ethereumFilteredData.market_cap,
  ethereumFilteredData.total_volume,
  ethereumFilteredData.circulating_supply
];

// Determine the maximum value for the dataset
const ethMaxValue = Math.max(...ethereumDataValues);

// Define the number of rings (consistent with Ethereum)
const numberOfRings = 5;

// Calculate the step size based on the number of rings
const ethStepSize = ethMaxValue / numberOfRings;

// Create the Ethereum polar area chart
createChart(ethPolarAreaChartRef, ethPolarAreaCtx, {
  type: 'polarArea',
  data: {
    labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'],
    datasets: [{
      label: 'Ethereum Distribution Metrics',
      data: ethereumDataValues,
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
        max: ethStepSize * numberOfRings, 
        ticks: {
          display: false, 
          stepSize: ethStepSize 
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
          title: function(tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function(tooltipItem) {
            const value = tooltipItem.raw;
            return `Value: $${value.toLocaleString()}`;
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

//Combined Line and Bar Graphs for Ethereum
const ethCombinedChartCtx = document.getElementById('ethCombinedChart').getContext('2d');
createChart(ethCombinedChartRef, ethCombinedChartCtx, {
  type: 'bar',
  data: {
    labels: ['Market Cap', 'Total Volume', 'Market Cap Change 24h'],
    datasets: [
      {
        type: 'bar',
        label: 'Market Cap',
        data: [ethereumFilteredData.market_cap, null, null],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y-axis-1'
      },
      {
        type: 'bar',
        label: 'Total Volume',
        data: [null, ethereumFilteredData.total_volume, null],
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        yAxisID: 'y-axis-1'
      },
      {
        type: 'bar',
        label: 'Market Cap Change 24h',
        data: [null, null, ethereumFilteredData.market_cap_change_24h],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y-axis-1'
      },
      {
        type: 'line',
        label: 'Price Change (%)',
        data: [
          ethereumFilteredData.price_change_percentage_24h,
          ethereumFilteredData.price_change_percentage_24h,
          ethereumFilteredData.price_change_percentage_24h
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y-axis-2'
      },
      {
        type: 'line',
        label: 'Market Cap Change (%)',
        data: [
          ethereumFilteredData.market_cap_change_percentage_24h,
          ethereumFilteredData.market_cap_change_percentage_24h,
          ethereumFilteredData.market_cap_change_percentage_24h
        ],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        fill: false,
        yAxisID: 'y-axis-2'
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
          callback:  function(value) {
            const labels = ['Market Cap', 'Total Volume', 'Market Change 24h'];
            return labels[value] || '';
          }
        }
      },
      'y-axis-1': {
        type: 'linear',
        position: 'left',
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Values (USD)'
        },
        grid: {
          drawOnChartArea: true
        }
      },
      'y-axis-2': {
        type: 'linear',
        position: 'right',
        ticks: {
          callback: function(value) {
            return value.toFixed(2) + '%';
          }
        },
        title: {
          display: true,
          text: 'Percentage Change'
        },
        grid: {
          drawOnChartArea: false
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
            const value = tooltipItem.raw;
            if (tooltipItem.dataset.type === 'bar') {
              return tooltipItem.dataset.label + ': $' + value.toLocaleString();
            } else {
              return tooltipItem.dataset.label + ': ' + value.toFixed(2) + '%';
            }
          }
        }
      }
    }
  }
});


// Enhanced Doughnut Chart for Market Cap, Total Volume, Market Cap Change % (24h), and Price Change % (24h)
const ethDoughnutCtx = document.getElementById('ethDoughnutChart').getContext('2d');
createChart(ethDoughnutChartRef, ethDoughnutCtx, {
  type: 'doughnut',
  data: {
    labels: ['Market Cap', 'Total Volume', 'Circulating Supply', 'Total Supply'],
    datasets: [{
      data: [
        ethereumFilteredData.market_cap,
        ethereumFilteredData.total_volume,
        ethereumFilteredData.circulating_supply,
        ethereumFilteredData.total_supply
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

// Ethereum Scatter Plot Chart
const ethScatterCtx = document.getElementById('ethScatterChart').getContext('2d');
createChart(ethScatterChartRef, ethScatterCtx, {
  type: 'scatter',
  data: {
    datasets: [
      {
        label: 'Market Cap',
        data: [{ x: 1, y: ethereumFilteredData.market_cap || 0 }],
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Total Volume',
        data: [{ x: 2, y: ethereumFilteredData.total_volume || 0 }],
        backgroundColor: 'rgba(255, 206, 86, 0.2)', // Yellow
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Current Price',
        data: [{ x: 3, y: ethereumFilteredData.current_price || 0 }],
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Teal
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Circulating Supply',
        data: [{ x: 4, y: ethereumFilteredData.circulating_supply || 0 }],
        backgroundColor: 'rgba(153, 102, 255, 0.2)', // Purple
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'ATH',
        data: [{ x: 5, y: ethereumFilteredData.ath || 0 }],
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Red
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'ATL',
        data: [{ x: 6, y: ethereumFilteredData.atl || 0 }],
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
          ethereumFilteredData.market_cap || 0,
          ethereumFilteredData.total_volume || 0,
          ethereumFilteredData.ath || 0,
          ethereumFilteredData.atl || 0
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
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    return () => {
      ethLineChartRef.current && ethLineChartRef.current.destroy();
      ethScatterChartRef.current && ethScatterChartRef.current.destroy();
      ethDoughnutChartRef.current &&  ethDoughnutChartRef.current.destroy();
      ethPolarAreaChartRef.current &&  ethPolarAreaChartRef.current.destroy();
      ethCombinedChartRef.current &&  ethCombinedChartRef.current.destroy();
    };
  }, []);

  const handleLineQuery = (query) => {
    if (ethereumData) {
      let lineLabels = [];
      let lineDataValues = [];
  
      switch (query) {
        case "market_cap_vs_circulating_supply":
          lineLabels = ['Market Cap', 'Circulating Supply'];
          lineDataValues = [ethereumData.market_cap, ethereumData.circulating_supply];
          break;
        case "full_metrics_line":
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            ethereumData.current_price,
            ethereumData.market_cap,
            ethereumData.total_volume,
            ethereumData.circulating_supply
          ];
          break;
        default:
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            ethereumData.current_price,
            ethereumData.market_cap,
            ethereumData.total_volume,
            ethereumData.circulating_supply
          ];
      }
  
      updateLineChart(lineDataValues, lineLabels);
    }
};


const handlePolarQuery = (query) => {
  if (ethereumData) {
    let polarLabels = [];
    let polarDataValues = [];

    switch (query) {
      case "market_cap_vs_volume":
        polarLabels = ['Market Cap', 'Total Volume'];
        polarDataValues = [ethereumData.market_cap, ethereumData.total_volume];
        break;
      case "full_metrics_polar":
        polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
        polarDataValues = [
          ethereumData.current_price,
          ethereumData.market_cap,
          ethereumData.total_volume,
          ethereumData.circulating_supply
        ];
        break;
      default:
        // default case should handle fallback
        polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
        polarDataValues = [
          ethereumData.current_price,
          ethereumData.market_cap,
          ethereumData.total_volume,
          ethereumData.circulating_supply
        ];
    }

    updatePolarChart(polarDataValues, polarLabels);
  }
};

// Function to handle the scatter query
const handleScatterQuery = (query) => {
  if (ethereumData) {
    let scatterLabels = [];
    let scatterDataValues = [];

    switch (query) {
      case "market_cap_vs_volume_vs_price":
        scatterLabels = ['Market Cap', 'Total Volume', 'Current Price'];
        scatterDataValues = [
          [{ x: 1, y: ethereumData.market_cap }],
          [{ x: 2, y: ethereumData.total_volume }],
          [{ x: 3, y: ethereumData.current_price }]
        ];
        break;
      case "full_metrics_scatter":
        scatterLabels = [
          'Market Cap', 'Total Volume', 'Current Price',
          'Circulating Supply', 'ATH', 'ATL'
        ];
        scatterDataValues = [
          [{ x: 1, y: ethereumData.market_cap }],
          [{ x: 2, y: ethereumData.total_volume }],
          [{ x: 3, y: ethereumData.current_price }],
          [{ x: 4, y: ethereumData.circulating_supply }],
          [{ x: 5, y: ethereumData.ath }],
          [{ x: 6, y: ethereumData.atl }]
        ];
        break;
      default:
        // Default to full metrics if no match
        scatterLabels = [
          'Market Cap', 'Total Volume', 'Current Price',
          'Circulating Supply', 'ATH', 'ATL'
        ];
        scatterDataValues = [
          [{ x: 1, y: ethereumData.market_cap }],
          [{ x: 2, y: ethereumData.total_volume }],
          [{ x: 3, y: ethereumData.current_price }],
          [{ x: 4, y: ethereumData.circulating_supply }],
          [{ x: 5, y: ethereumData.ath }],
          [{ x: 6, y: ethereumData.atl }]
        ];
    }

    updateScatterChart(scatterDataValues, scatterLabels);
  }
};

const handleCombinedQuery = (query) => {
  if (ethereumData) {
    let combinedData = {
      labels: [],
      datasets: []
    };

    switch (query) {
      case "market_cap_vs_volume_price_change":
        combinedData.labels = ['Market Cap', 'Total Volume'];
        combinedData.datasets = [
          {
            type: 'bar',
            label: 'Market Cap',
            data: [ethereumData.market_cap, null],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'bar',
            label: 'Total Volume',
            data: [null, ethereumData.total_volume],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'line',
            label: 'Price Change (%)',
            data: [ethereumData.price_change_percentage_24h, ethereumData.price_change_percentage_24h],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y-axis-2'
          }
        ];
        break;

        case "market_cap_vs_volume_market_cap_change":
          combinedData.labels = ['Market Cap', 'Total Volume'];
          combinedData.datasets = [
            {
              type: 'bar',
              label: 'Market Cap',
              data: [ethereumData.market_cap, null],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              yAxisID: 'y-axis-1'
            },
            {
              type: 'bar',
              label: 'Total Volume',
              data: [null, ethereumData.total_volume],
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1,
              yAxisID: 'y-axis-1'
            },
            {
              type: 'line',
              label: 'Market Cap Change (%)',
              data: [ethereumData.market_cap_change_percentage_24h, ethereumData.market_cap_change_percentage_24h],
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 2,
              fill: false,
              yAxisID: 'y-axis-2'
            }
          ];
          break;
      
      case "full_metrics_combined":
        combinedData.labels = ['Market Cap', 'Total Volume', 'Market Cap Change 24h'];
        combinedData.datasets = [
          {
            type: 'bar',
            label: 'Market Cap',
            data: [ethereumData.market_cap, null, null],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'bar',
            label: 'Total Volume',
            data: [null, ethereumData.total_volume, null],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'bar',
            label: 'Market Cap Change 24h',
            data: [null, null, ethereumData.market_cap_change_24h],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'line',
            label: 'Price Change (%)',
            data: [ethereumData.price_change_percentage_24h, ethereumData.price_change_percentage_24h, ethereumData.price_change_percentage_24h],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y-axis-2'
          },
          {
            type: 'line',
            label: 'Market Cap Change (%)',
            data: [ethereumData.market_cap_change_percentage_24h, ethereumData.market_cap_change_percentage_24h, ethereumData.market_cap_change_percentage_24h],
            backgroundColor: 'rgba(153, 102, 255, 0.2)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y-axis-2'
          }
        ];
        break;

      default:
        combinedData.datasets = [];
    }

    updateCombinedChart(combinedData);
  }
};

// Function to update the scatter chart
const updateScatterChart = (dataValues, labels) => {
  if (ethScatterChartRef.current) {
    ethScatterChartRef.current.data.datasets.forEach((dataset, index) => {
      dataset.data = dataValues[index];
    });
    ethScatterChartRef.current.data.labels = labels;
    ethScatterChartRef.current.update();
  }
};

// Function to update the line chart
const updateLineChart = (dataValues, labels) => {
  if (ethLineChartRef.current) {
    ethLineChartRef.current.data.datasets[0].data = dataValues;
    ethLineChartRef.current.data.labels = labels;
    ethLineChartRef.current.update();
  }
};

const updatePolarChart = (dataValues, labels) => {
  if (ethPolarAreaChartRef.current) {
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

      ethPolarAreaChartRef.current.data.datasets[0].data = dataValues;
      ethPolarAreaChartRef.current.data.labels = labels;
      ethPolarAreaChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
      ethPolarAreaChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
      ethPolarAreaChartRef.current.update();
  }
};

const updateCombinedChart = (combinedData) => {
  if (ethCombinedChartRef.current) {
    ethCombinedChartRef.current.data = combinedData;
    ethCombinedChartRef.current.update();
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
    setDoughnutQuery(''); 
    handleFilterChange(query);
    setShowPolarChartInfo(query === 'market_cap_vs_volume');
    setShowDoughnutChartInfo(false); 
  }
};

const handleLineQueryChange = (e) => {
  const query = e.target.value;
  setLineQuery(query);
  handleLineQuery(query);
  handleFilterChange(query); 
  setShowLineChartInfo(query === 'market_cap_vs_circulating_supply');

};

const handleScatterQueryChange = (e) => {
  const query = e.target.value;
  setScatterQuery(query);
  handleScatterQuery(query);
  handleFilterChange(query); 
  setShowScatterChartInfo(query === 'market_cap_vs_volume_vs_price');
};

const handleCombinedQueryChange = (e) => {
  const query = e.target.value;
  setCombinedQuery(query); 
  handleCombinedQuery(query);
  handleFilterChange(query); 
  setShowCombinedChartInfo(query === 'market_cap_vs_volume_market_cap_change');
};

const [showPolarChartInfo, setShowPolarChartInfo] = useState(false);
const [showDoughnutChartInfo, setShowDoughnutChartInfo] = useState(false);
const [showScatterChartInfo, setShowScatterChartInfo] = useState(false);
const [showLineChartInfo, setShowLineChartInfo] = useState(false);
const [showCombinedChartInfo, setShowCombinedChartInfo] = useState(false);

const togglePolarChartInfo = () => setShowPolarChartInfo((prev) => !prev);
const toggleDoughnutChartInfo = () => setShowDoughnutChartInfo((prev) => !prev);
const toggleCombinedChartInfo = () => setShowCombinedChartInfo((prev) => !prev);
const toggleLineChartInfo = () => setShowLineChartInfo((prev) => !prev);
const toggleScatterChartInfo = () => setShowScatterChartInfo((prev) => !prev);

return (
  <div className="ethereumpage-wrapper">
      <h1 className="page-title">Ethereum Visualization's</h1>
      <div className="faq-icon" onClick={() => window.location.href = 'http://localhost:5000/faq'}>
      <i className="bi bi-question-circle" title="Off to FAQ"></i>
    </div>
    
    <div className="ethereumchart-container">
    <div className="ethereumquery-container">
                <select value={lineQuery} onChange={handleLineQueryChange}>
                    <option value="" hidden>📉Select Line Chart Option</option>
                    <option value="market_cap_vs_circulating_supply"> 📉 Market Cap vs. Circulating Supply </option>
                    <option value="full_metrics_line"> 📉 All Line Metrics </option>
                </select>
    </div>

    <div className="ethereumquery-container">
        <select 
            value={polarQuery || doughnutQuery} 
            onChange={handlePolarOrDoughnutQueryChange}
          >
            <option value="" hidden>❄️🍩 Select Polar or Doughnut Chart Option</option>
            <option value="market_cap_vs_volume">❄️ Market Cap vs. Volume</option>
            <option value="full_metrics_polar">❄️ All Polar Metrics</option>
            <option value="full_metrics_doughnut">🍩 All Doughnut Metrics</option>
          </select>
   </div>

    <div className="ethereumquery-container">
          <select value={combinedQuery} onChange={handleCombinedQueryChange}>
            <option value="" hidden>🚀 Select Combined Chart Option</option>
            <option value="market_cap_vs_volume_market_cap_change"> 🚀 Market Cap / Change vs. Volume</option>
            <option value="full_metrics_combined"> 🚀 All Combined Metrics</option>
          </select>
   </div>

    <div className="ethereumquery-container">
                <select value={scatterQuery} onChange={handleScatterQueryChange}>
                  <option value="" hidden>🌍Select Scatter Chart Option</option>
                  <option value="market_cap_vs_volume_vs_price"> 🌍 Market Cap vs. Volume vs. Price </option>
                  <option value="full_metrics_scatter"> 🌍 All Scatter Metrics </option>
                  </select>
          </div>
  </div>
  
  <div className="ethereumchart-container">
{/* Polar Area Chart */}
<div className="ethereumchart-wrapper combined">
  <div className="ethereumchart-header"> {/* Updated to match CSS */}
    <h2>Polar Area Chart for Ethereum KPIs</h2>
    {polarQuery === 'market_cap_vs_volume' && (
    <span className="ethereuminfo-icon" title="More Information">🤔</span> 
    )}
  </div>
  <canvas id="ethPolarAreaChart"></canvas>
  {loadingPolar ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      polarInsights && (
        <div className="ethereumchart-details">
          <p>{polarInsights}</p>
        </div>
      )
    )}
  </div>

{/* Doughnut Chart */}
<div className="ethereumchart-wrapper combined">
  <div className="ethereumchart-header"> {/* Updated to match CSS */}
    <h2>Doughnut Chart for Ethereum Metrics</h2>
    {doughnutQuery === 'full_metrics_doughnut' && (
    <span className="ethereuminfo-icon" title="More Information">🤔</span> 
    )}
  </div>
  <canvas id="ethDoughnutChart"></canvas>
  {loadingDoughnut ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      doughnutInsights && (
        <div className="ethereumchart-details">
          <p>{doughnutInsights}</p>
        </div>
      )
    )}
  </div>

{/* Scatter Chart */}
<div className="ethereumchart-wrapper combined">
  <div className="ethereumchart-header"> {/* Updated to match CSS */}
    <h2>Scatterplot Chart for Ethereum Metrics</h2>
    {scatterQuery === 'market_cap_vs_volume_vs_price' && (
    <span className="ethereuminfo-icon" title="More Information">🤔</span> 
    )}
  </div>
  <canvas id="ethScatterChart"></canvas>
  {loadingScatter ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      scatterInsights && (
        <div className="ethereumchart-details">
          <p>{scatterInsights}</p>
        </div>
      )
    )}
  </div>

{/* Line Chart */}
<div className="ethereumchart-wrapper combined">
  <div className="ethereumchart-header"> {/* Updated to match CSS */}
    <h2>Line Graph for Ethereum Metrics</h2>
    {lineQuery === 'market_cap_vs_circulating_supply' && (
    <span className="ethereuminfo-icon" title="More Information">🤔</span> 
    )}
  </div>
  <canvas id="ethLineChart"></canvas>
  {loadingLine ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      lineInsights && (
        <div className="ethereumchart-details">
          <p>{lineInsights}</p>
        </div>
      )
    )}
  </div>

{/* Combined Chart */}
<div className="ethereumchart-wrapper combined">
  <div className="ethereumchart-header"> {/* Updated to match CSS */}
    <h2>Combined Bar and Line Graph Representing Ethereum's Market Volatility</h2>
    {(combinedQuery === 'market_cap_vs_volume_market_cap_change') && (
      <span className="ethinfo-icon" title="More Information">🤔</span> 
    )}
  </div>
  <canvas id="ethCombinedChart"></canvas>
  {loadingPriceChange ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      priceChangeInsights && (
        <div className="ethereumchart-details">
          <p>{priceChangeInsights}</p>
        </div>
      )
    )}
  </div>
    </div>
</div>
  );
};  

export default EthereumCharts;
