import React, { useEffect, useState, useRef } from "react";
import "./Tether.css";
import Chart from "chart.js/auto";
import "./Questionmark.css";

const TetherCharts = () => {
  const [tetherData, setTetherData] = useState(null);
  const tetPolarAreaChartRef = useRef(null);
  const tetDoughnutChartRef = useRef(null);
  const tetScatterChartRef = useRef(null);
  const tetLineChartRef = useRef(null);
  const tetRadarChartRef = useRef(null);
  const [polarQuery, setPolarQuery] = useState("");
  const [lineQuery, setLineQuery] = useState("");
  const [scatterQuery, setScatterQuery] = useState("");
  const [doughnutQuery, setDoughnutQuery] = useState("");
  const [radarQuery, setRadarQuery] = useState("");
  const [polarInsights, setPolarInsights] = useState("");
  const [scatterInsights, setScatterInsights] = useState("");
  const [lineInsights, setLineInsights] = useState("");
  const [radarInsights, setRadarInsights] = useState("");
  const [doughnutInsights, setDoughnutInsights] = useState("");

  const [loadingPolar, setLoadingPolar] = useState(false);
  const [loadingScatter, setLoadingScatter] = useState(false);
  const [loadingLine, setLoadingLine] = useState(false);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [loadingDoughnut, setLoadingDoughnut] = useState(false);

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
        setInsights(data.insights); // Safeguard if the component is unmounted
      }
    } catch (error) {
      console.error('Error during API call:', error);
      if (isMounted.current) {
        setInsights(null); // Safeguard to avoid setting state when unmounted
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const handleFilterChange = async (selectedRelationship) => {
    if (!tetherData || typeof tetherData !== 'object') {
      console.error('Invalid or missing Tether data');
      return;
    }

    let filteredData;
    let setInsights;
    let setLoading;

    switch (selectedRelationship) {
      case 'market_cap_vs_volume':
        filteredData = { market_cap: tetherData.market_cap, total_volume: tetherData.total_volume };
        setInsights = setPolarInsights;
        setLoading = setLoadingPolar;
        break;
      case 'market_cap_vs_circulating_supply_line':
        filteredData = { market_cap: tetherData.market_cap, circulating_supply: tetherData.circulating_supply };
        setInsights = setLineInsights;
        setLoading = setLoadingLine;
        break;
      case 'market_cap_vs_circulating_supply_total_supply':
        filteredData = {
          market_cap: tetherData.market_cap,
          circulating_supply: tetherData.circulating_supply,
          total_supply: tetherData.total_supply,
        };
        setInsights = setDoughnutInsights;
        setLoading = setLoadingDoughnut;
        break;
      case 'market_cap_vs_volume_vs_price':
        filteredData = {
          market_cap: tetherData.market_cap,
          total_volume: tetherData.total_volume,
          current_price: tetherData.current_price,
        };
        setInsights = setScatterInsights;
        setLoading = setLoadingScatter;
        break;
      case 'full_metrics_radar':
        filteredData = {
          market_cap: tetherData.market_cap,
          total_volume: tetherData.total_volume,
          current_price: tetherData.current_price,
          circulating_supply: tetherData.circulating_supply,
        };
        setInsights = setRadarInsights;
        setLoading = setLoadingRadar;
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
        const tetherFilteredData = data.filter(item => item.symbol === 'usdt')[0];
        setTetherData(tetherFilteredData);

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
        tetherFilteredData.current_price,
        tetherFilteredData.market_cap,
        tetherFilteredData.total_volume,
        tetherFilteredData.circulating_supply
      ];

// Line Chart for Tether Metrics Over Time
const tetLineChartCtx = document.getElementById('tetLineChart').getContext('2d');
createChart(tetLineChartRef, tetLineChartCtx, {
  type: 'line',
  data: {
    labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'], 
    datasets: [
      {
        label: 'Tether Metrics',
        data: [
          tetherFilteredData.current_price,
          tetherFilteredData.market_cap,
          tetherFilteredData.total_volume,
          tetherFilteredData.circulating_supply
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
          // Polar Area Chart for Tether Distribution Metrics
          const tetPolarAreaCtx = document.getElementById('tetPolarAreaChart').getContext('2d');

          const maxValue = Math.max(...dataValues);
          createChart(tetPolarAreaChartRef, tetPolarAreaCtx, {
            type: 'polarArea',
            data: {
              labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'],
              datasets: [{
                label: 'Tether Distribution Metrics',
                data: [
                  tetherFilteredData.current_price,
                  tetherFilteredData.market_cap,
                  tetherFilteredData.total_volume,
                  tetherFilteredData.circulating_supply
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
const tetDoughnutCtx = document.getElementById('tetDoughnutChart').getContext('2d');
createChart(tetDoughnutChartRef, tetDoughnutCtx, {
  type: 'doughnut',
  data: {
    labels: ['Market Cap', 'Total Volume', 'Circulating Supply', 'Total Supply'],
    datasets: [{
      data: [
        tetherFilteredData.market_cap,
        tetherFilteredData.total_volume,
        tetherFilteredData.circulating_supply,
        tetherFilteredData.total_supply
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

// Tether Scatter Plot Chart
const tetScatterCtx = document.getElementById('tetScatterChart').getContext('2d');
createChart(tetScatterChartRef, tetScatterCtx, {
  type: 'scatter',
  data: {
    datasets: [
      {
        label: 'Market Cap',
        data: [{ x: 1, y: tetherFilteredData.market_cap || 0 }],
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Total Volume',
        data: [{ x: 2, y: tetherFilteredData.total_volume || 0 }],
        backgroundColor: 'rgba(255, 206, 86, 0.2)', // Yellow
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Current Price',
        data: [{ x: 3, y: tetherFilteredData.current_price || 0 }],
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Teal
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Circulating Supply',
        data: [{ x: 4, y: tetherFilteredData.circulating_supply || 0 }],
        backgroundColor: 'rgba(153, 102, 255, 0.2)', // Purple
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'ATH',
        data: [{ x: 5, y: tetherFilteredData.ath || 0 }],
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Red
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'ATL',
        data: [{ x: 6, y: tetherFilteredData.atl || 0 }],
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
          tetherFilteredData.market_cap || 0,
          tetherFilteredData.total_volume || 0,
          tetherFilteredData.ath || 0,
          tetherFilteredData.atl || 0
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

// Radar Chart for Tether KPIs
(function() {
  const tetRadarCtx = document.getElementById('tetRadarChart').getContext('2d');

  // Define your data values for Tether
  const radarDataValues = [
    tetherFilteredData.current_price,
    tetherFilteredData.market_cap,
    tetherFilteredData.total_volume,
    tetherFilteredData.circulating_supply
  ];

  // Determine the maximum value for the dataset
  const maxRadarValue = Math.max(...radarDataValues);

  // Define the number of rings or levels you want to display
  const numberOfRings = 5;

  // Calculate the step size based on the number of rings
  const radarStepSize = maxRadarValue / numberOfRings;

  createChart(tetRadarChartRef, tetRadarCtx, {
    type: 'radar',
    data: {
      labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'],
      datasets: [{
        label: 'Tether KPIs',
        data: radarDataValues,
        backgroundColor: 'rgba(54, 102, 255, 0.2)', // Changed color for effect
        borderColor: 'rgba(54, 102, 255, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        r: {
          beginAtZero: true,
          max: radarStepSize * numberOfRings, // Set the max value for the scale
          ticks: {
            display: false,
            stepSize: radarStepSize, // Define the step size
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          },
          angleLines: {
            display: false // Consistent with polar chart style
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
            title: function(tooltipItems) {
              return tooltipItems[0].label;
            },
            label: function(tooltipItem) {
              const value = tooltipItem.raw;
              return `Value: $${value.toLocaleString()}`;
            }
          }
        }
      }
    }
  });
})(); 
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    return () => {
      tetScatterChartRef.current && tetScatterChartRef.current.destroy();
      tetDoughnutChartRef.current &&  tetDoughnutChartRef.current.destroy();
      tetPolarAreaChartRef.current &&  tetPolarAreaChartRef.current.destroy();
      tetLineChartRef.current &&  tetLineChartRef.current.destroy();
      tetRadarChartRef.current &&  tetRadarChartRef.current.destroy();
    };
  }, []);

  const handlePolarQuery = (query) => {
    if (tetherData) {
      let polarLabels = [];
      let polarDataValues = [];
  
      switch (query) {
        case "market_cap_vs_volume":
          polarLabels = ['Market Cap', 'Total Volume'];
          polarDataValues = [tetherData.market_cap, tetherData.total_volume];
          break;
        case "full_metrics_polar":
          polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          polarDataValues = [
            tetherData.current_price,
            tetherData.market_cap,
            tetherData.total_volume,
            tetherData.circulating_supply
          ];
          break;
        default:
          // default case should handle fallback
          polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          polarDataValues = [
            tetherData.current_price,
            tetherData.market_cap,
            tetherData.total_volume,
            tetherData.circulating_supply
          ];
      }
  
      updatePolarChart(polarDataValues, polarLabels);
    }
  };

  const handleLineQuery = (query) => {
    if (tetherData) {
      let lineLabels = [];
      let lineDataValues = [];
  
      switch (query) {
        case "market_cap_vs_circulating_supply_line":
          lineLabels = ['Market Cap', 'Circulating Supply'];
          lineDataValues = [tetherData.market_cap, tetherData.circulating_supply];
          break;
        case "full_metrics_line":
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            tetherData.current_price,
            tetherData.market_cap,
            tetherData.total_volume,
            tetherData.circulating_supply
          ];
          break;
        default:
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            tetherData.current_price,
            tetherData.market_cap,
            tetherData.total_volume,
            tetherData.circulating_supply
          ];
      }
  
      updateLineChart(lineDataValues, lineLabels);
    }
};

const handleScatterQuery = (query) => {
  if (tetherData) {
    let scatterLabels = [];
    let scatterDataValues = [];

    switch (query) {
      case "market_cap_vs_volume_vs_price":
        scatterLabels = ['Market Cap', 'Total Volume', 'Current Price'];
        scatterDataValues = [
          [{ x: 1, y: tetherData.market_cap }],
          [{ x: 2, y: tetherData.total_volume }],
          [{ x: 3, y: tetherData.current_price }]
        ];
        break;
      case "full_metrics_scatter":
        scatterLabels = [
          'Market Cap', 'Total Volume', 'Current Price',
          'Circulating Supply', 'ATH', 'ATL'
        ];
        scatterDataValues = [
          [{ x: 1, y: tetherData.market_cap }],
          [{ x: 2, y: tetherData.total_volume }],
          [{ x: 3, y: tetherData.current_price }],
          [{ x: 4, y: tetherData.circulating_supply }],
          [{ x: 5, y: tetherData.ath }],
          [{ x: 6, y: tetherData.atl }]
        ];
        break;
      default:
        // Default to full metrics if no match
        scatterLabels = [
          'Market Cap', 'Total Volume', 'Current Price',
          'Circulating Supply', 'ATH', 'ATL'
        ];
        scatterDataValues = [
          [{ x: 1, y: tetherData.market_cap }],
          [{ x: 2, y: tetherData.total_volume }],
          [{ x: 3, y: tetherData.current_price }],
          [{ x: 4, y: tetherData.circulating_supply }],
          [{ x: 5, y: tetherData.ath }],
          [{ x: 6, y: tetherData.atl }]
        ];
    }

    updateScatterChart(scatterDataValues, scatterLabels);
  }
};

const handleDoughnutQuery = (query) => {
  if (tetherData) {
      let doughnutLabels = [];
      let doughnutDataValues = [];

      switch (query) {
          case "market_cap_vs_circulating_supply_total_supply":
              doughnutLabels = ['Market Cap', 'Circulating Supply', 'Total Supply'];
              doughnutDataValues = [tetherData.market_cap, tetherData.circulating_supply, tetherData.total_supply];
              break;
          case "full_metrics_doughnut":
              doughnutLabels = ['Market Cap', 'Total Volume', 'Circulating Supply', 'Total Supply'];
              doughnutDataValues = [
                  tetherData.market_cap,
                  tetherData.total_volume,
                  tetherData.circulating_supply,
                  tetherData.total_supply
              ];
              break;
          default:
              // Fallback to full metrics
              doughnutLabels = ['Market Cap', 'Total Volume', 'Circulating Supply', 'Total Supply'];
              doughnutDataValues = [
                  tetherData.market_cap,
                  tetherData.total_volume,
                  tetherData.circulating_supply,
                  tetherData.total_supply
              ];
      }

      updateDoughnutChart(doughnutDataValues, doughnutLabels);
  }
};

const updatePolarChart = (dataValues, labels) => {
  if (tetPolarAreaChartRef.current) {
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

      tetPolarAreaChartRef.current.data.datasets[0].data = dataValues;
      tetPolarAreaChartRef.current.data.labels = labels;
      tetPolarAreaChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
      tetPolarAreaChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
      tetPolarAreaChartRef.current.update();
  }
};

  const updateLineChart = (dataValues, labels) => {
    if (tetLineChartRef.current) {
      tetLineChartRef.current.data.datasets[0].data = dataValues;
      tetLineChartRef.current.data.labels = labels;
      tetLineChartRef.current.update();
    }
  };  

  const updateScatterChart = (dataValues, labels) => {
    if (tetScatterChartRef.current) {
      tetScatterChartRef.current.data.datasets.forEach((dataset, index) => {
        dataset.data = dataValues[index];
      });
      tetScatterChartRef.current.data.labels = labels;
      tetScatterChartRef.current.update();
    }
  };

  const updateDoughnutChart = (dataValues, labels) => {
    if (tetDoughnutChartRef.current) {
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

        tetDoughnutChartRef.current.data.datasets[0].data = dataValues;
        tetDoughnutChartRef.current.data.labels = labels;
        tetDoughnutChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
        tetDoughnutChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
        tetDoughnutChartRef.current.update();
    }
};

  const handlePolarQueryChange = (e) => {
    const query = e.target.value;
    setPolarQuery(query);
    handlePolarQuery(query);
    handleFilterChange(query);
    setShowPolarChartInfo(query === 'market_cap_vs_volume');
  };

  const handleLineOrRadarQueryChange = (e) => {
    const query = e.target.value;
    if (query.includes('radar')) {
      setRadarQuery(query);
      setLineQuery('');  
      handleFilterChange(query); 
      setShowRadarChartInfo(query === 'full_metrics_radar');
      setShowLineChartInfo(false); 
    } else {
      setLineQuery(query);
      handleLineQuery(query);
      handleFilterChange(query);
      setShowLineChartInfo(query === 'market_cap_vs_circulating_supply_line');
    }
    
  };

  const handleScatterQueryChange = (e) => {
    const query = e.target.value;
    setScatterQuery(query);
    handleScatterQuery(query);
    handleFilterChange(query);
    setShowScatterChartInfo(query === 'market_cap_vs_volume_vs_price');
  };

  const handleDoughnutQueryChange = (e) => {
    const query = e.target.value;
    setDoughnutQuery(query);
    handleDoughnutQuery(query);
    handleFilterChange(query);
    setShowDoughnutChartInfo(query === 'market_cap_vs_circulating_supply_total_supply');
};

const [showPolarChartInfo, setShowPolarChartInfo] = useState(false);
 const [showDoughnutChartInfo, setShowDoughnutChartInfo] = useState(false);
 const [showScatterChartInfo, setShowScatterChartInfo] = useState(false);
 const [showLineChartInfo, setShowLineChartInfo] = useState(false);
 const [showRadarChartInfo, setShowRadarChartInfo] = useState(false);

const toggleDoughnutChartInfo = () => setShowDoughnutChartInfo((prev) => !prev);
const togglePolarChartInfo = () => setShowPolarChartInfo((prev) => !prev);
const toggleScatterChartInfo = () => setShowScatterChartInfo((prev) => !prev);
const toggleLineChartInfo = () => setShowLineChartInfo((prev) => !prev);
const toggleRadarChartInfo = () => setShowRadarChartInfo((prev) => !prev);

  return (
    <div className="tetherpage-wrapper">
        <h1 className="page-title">Tether Visualization's</h1>
        <div className="faq-icon" onClick={() => window.location.href = 'http://localhost:5000/faq'}>
        <i className="bi bi-question-circle" title="Off to FAQ"></i>
      </div>
      
      <div className="tetherchart-container">
      <div className="tetherquery-container">
        <select 
            value={lineQuery || radarQuery} 
            onChange={handleLineOrRadarQueryChange}
          >
            <option value="" hidden>📉📡 Select Line or Radar Chart Option</option>
            <option value="market_cap_vs_circulating_supply_line">📉 Market Cap vs. Circulating Supply</option>
            <option value="full_metrics_line">📉 All Line Metrics</option>
            <option value="full_metrics_radar">📡 All Radar Metrics</option>
          </select>
        </div>
  
      <div className="tetherquery-container">
                  <select value={polarQuery} onChange={handlePolarQueryChange}>
                      <option value="" hidden>❄️ Select Polar Chart Option</option>
                      <option value="market_cap_vs_volume"> ❄️ Market Cap vs. Volume </option>
                      <option value="full_metrics_polar"> ❄️ All Polar Metrics </option>
                  </select>
      </div>

      <div className="tetherquery-container">
                  <select value={doughnutQuery} onChange={handleDoughnutQueryChange}>
                     <option value="" hidden>🍩 Select Doughnut Chart Option</option>
                     <option value="market_cap_vs_circulating_supply_total_supply"> 🍩 Market Cap vs. Circulating/Total Supply</option>
                     <option value="full_metrics_doughnut"> 🍩 All Doughnut Metrics </option>
                  </select>
      </div>

      <div className="tetherquery-container">
                  <select value={scatterQuery} onChange={handleScatterQueryChange}>
                    <option value="" hidden>🌍 Select Scatter Chart Option</option>
                    <option value="market_cap_vs_volume_vs_price"> 🌍 Market Cap vs. Volume vs. Price </option>
                    <option value="full_metrics_scatter"> 🌍 All Scatter Metrics </option>
                    </select>
            </div>
    </div>
    
  <div className="tetherchart-container">
  {/* Polar Area Chart */}
  <div className="tetherchart-wrapper radar">
    <div className="tetherchart-header"> {/* Updated to match CSS */}
      <h2>Polar Area Chart for Tether KPIs</h2>
      {polarQuery === 'market_cap_vs_volume' && (
      <span className="tetherinfo-icon" title="More Information">🤔</span> 
      )}
    </div>
    <canvas id="tetPolarAreaChart"></canvas>
    {loadingPolar ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          polarInsights && (
            <div className="tetherchart-details">
              <p>{polarInsights}</p>
            </div>
          )
        )}
    </div>

  {/* Doughnut Chart */}
  <div className="tetherchart-wrapper radar">
    <div className="tetherchart-header"> {/* Updated to match CSS */}
      <h2>Doughnut Chart for Tether Metrics</h2>
      {doughnutQuery === 'market_cap_vs_circulating_supply_total_supply' && (
      <span className="tetherinfo-icon" title="More Information">🤔</span> 
      )}
    </div>
    <canvas id="tetDoughnutChart"></canvas>
    {loadingDoughnut ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          doughnutInsights && (
            <div className="tetherchart-details">
              <p>{doughnutInsights}</p>
            </div>
          )
        )}
      </div>

  {/* Scatter Chart */}
  <div className="tetherchart-wrapper radar">
    <div className="tetherchart-header"> {/* Updated to match CSS */}
      <h2>Scatterplot Chart for Tether Metrics</h2>
      {scatterQuery === 'market_cap_vs_volume_vs_price' && (
      <span className="tetherinfo-icon" title="More Information">🤔</span> 
      )}
    </div>
    <canvas id="tetScatterChart"></canvas>
    {loadingScatter ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          scatterInsights && (
            <div className="tetherchart-details">
              <p>{scatterInsights}</p>
            </div>
          )
        )}
      </div>

  {/* Line Chart */}
  <div className="tetherchart-wrapper radar">
    <div className="tetherchart-header"> {/* Updated to match CSS */}
      <h2>Line Graph for Tether Metrics</h2>
      {lineQuery === 'market_cap_vs_circulating_supply_line' && (
      <span className="tetherinfo-icon" title="More Information">🤔</span> 
      )}
    </div>
    <canvas id="tetLineChart"></canvas>
    {loadingLine ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          lineInsights && (
            <div className="tetherchart-details">
              <p>{lineInsights}</p>
            </div>
          )
        )}
      </div>

  {/* Radar Chart */}
  <div className="tetherchart-wrapper radar">
    <div className="tetherchart-header"> {/* Updated to match CSS */}
      <h2>Radar Chart for Tether KPI's</h2>
      {radarQuery === 'full_metrics_radar' && (
        <span className="tetherinfo-icon" title="More Information"> 🤔 </span>
      )}
    </div>
    <canvas id="tetRadarChart"></canvas>
    {loadingRadar ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          radarInsights && (
            <div className="tetherchart-details">
              <p>{radarInsights}</p>
            </div>
          )
        )}
      </div>
  </div>
</div>
  );
};

export default TetherCharts;
