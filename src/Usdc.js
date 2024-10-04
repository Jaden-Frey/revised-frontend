import React, { useEffect, useState, useRef } from "react";
import "./Usdc.css";
import Chart from "chart.js/auto";
import "./Questionmark.css";

const UsdcCharts = () => {
  const [usdcData, setUsdcData] = useState(null);
  const usdcPolarAreaChartRef = useRef(null);
  const usdcHeatmapChartRef = useRef(null); 
  const usdcLineChartRef = useRef(null);
  const usdcWaterfallBarChartRef = useRef(null);
  const usdcRadarChartRef = useRef(null);
  const [lineQuery, setLineQuery] = useState("");
  const [barQuery, setBarQuery] = useState("");
  const [polarQuery, setPolarQuery] = useState("");
  const [radarQuery, setRadarQuery] = useState("");
  const [polarInsights, setPolarInsights] = useState("");
  const [lineInsights, setLineInsights] = useState("");
  const [waterfallInsights, setWaterfallInsights] = useState("");
  const [radarInsights, setRadarInsights] = useState("");

  const [loadingPolar, setLoadingPolar] = useState(false);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [loadingLine, setLoadingLine] = useState(false);
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
    if (!usdcData || typeof usdcData !== 'object') {
      console.error('Invalid or missing USDC data');
      return;
    }
  
    let filteredData;
    let setInsights;
    let setLoading;
  
    switch (selectedRelationship) {
      case 'market_cap_vs_total_volume':
        filteredData = { market_cap: usdcData.market_cap, total_volume: usdcData.total_volume };
        setInsights = setLineInsights;
        setLoading = setLoadingLine;
        break;
      case 'market_cap_vs_circulating_supply':
        filteredData = { market_cap: usdcData.market_cap, circulating_supply: usdcData.circulating_supply };
        setInsights = setPolarInsights;
        setLoading = setLoadingPolar;
        break;
      case 'full_metrics_radar':
        filteredData = {
          market_cap: usdcData.market_cap,
          total_volume: usdcData.total_volume,
          current_price: usdcData.current_price,
          circulating_supply: usdcData.circulating_supply,
        };
        setInsights = setRadarInsights;
        setLoading = setLoadingRadar;
        break;
      case 'valuation_metrics':
        filteredData = {
          market_cap_change_24h: usdcData.market_cap_change_24h,
          price_change_percentage_24h: usdcData.price_change_percentage_24h,
        };
        setInsights = setWaterfallInsights;
        setLoading = setLoadingWaterfall;
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
        const usdcFilteredData = data.filter(item => item.symbol === 'usdc')[0];
        setUsdcData(usdcFilteredData);

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
          usdcFilteredData.current_price,
          usdcFilteredData.market_cap,
          usdcFilteredData.total_volume,
          usdcFilteredData.circulating_supply,
          usdcFilteredData.market_cap_change_24h,
          usdcFilteredData.market_cap_change_percentage_24h,
          usdcFilteredData.price_change_24h,
          usdcFilteredData.price_change_percentage_24h
        ];

          // Polar Area Chart for USDC Distribution Metrics
          const usdcPolarAreaCtx = document.getElementById('usdcPolarAreaChart').getContext('2d');

          const maxValue = Math.max(...dataValues);
          createChart(usdcPolarAreaChartRef, usdcPolarAreaCtx, {
            type: 'polarArea',
            data: {
              labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'],
              datasets: [{
                label: 'USDC Distribution Metrics',
                data: [
                  usdcFilteredData.current_price,
                  usdcFilteredData.market_cap,
                  usdcFilteredData.total_volume,
                  usdcFilteredData.circulating_supply,
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

// Heatmap for USDC metrics
const usdcHeatmapCtx = document.getElementById('usdcHeatmapChart').getContext('2d');

// Example data structure for Cardano 
const usdcData = [
  { name: 'USDC', price_change_percentage_24h: usdcFilteredData.price_change_percentage_24h }
];

const isPositiveChange = usdcData[0].price_change_percentage_24h >= 0;
const absPriceChange = Math.abs(usdcData[0].price_change_percentage_24h);
const dynamicMax = Math.ceil(absPriceChange / 5) * 5;

const positiveBaseColor = 'rgba(0, 200, 83'; 
const negativeBaseColor = 'rgba(255, 51, 51';

const baseColor = isPositiveChange ? positiveBaseColor : negativeBaseColor;
const backgroundColor = `${baseColor}, ${0.2 + (absPriceChange / dynamicMax) * 0.2})`;
const borderColor = `${baseColor}, 1)`; 

createChart(usdcHeatmapChartRef, usdcHeatmapCtx, {
  type: 'bar',
  data: {
    labels: ['USDC'],
    datasets: [
      {
        label: isPositiveChange ? 'Positive Change (24h)' : 'Negative Change (24h)',
        data: [absPriceChange],
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1
      }
    ]
  },
  options: {
    indexAxis: 'y',
    scales: {
      x: {
        title: { display: true, text: 'Price Change (%)' },
        min: 0,
        max: dynamicMax, 
        ticks: {
          stepSize: dynamicMax / 5, 
          callback: function(value) {
            return value + '%';
          }
        }
      },
      y: {
        title: { display: true, text: 'USDC Metrics' }
      }
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(tooltipItem) {
            const label = tooltipItem.dataset.label || '';
            const value = tooltipItem.raw;
            return `${label}: ${value}% (${usdcData[0].name})`; 
          },
          afterLabel: function(tooltipItem) {
            const value = usdcData[0].price_change_percentage_24h;
            return `Price Change: ${value > 0 ? '+' : ''}${value}%`; 
          }
        }
      }
    }
  }
});
          //Waterfall Bar Chart for USDC
          const usdcWaterfallBarCtx = document.getElementById('usdcWaterfallBarChart').getContext('2d');
          createChart(usdcWaterfallBarChartRef, usdcWaterfallBarCtx, {
            type: 'bar',
            data: {
              labels: ['Market Cap Change (24h)', 'Market Cap Change % (24h)', 'Price Change % (24h)'],
              datasets: [
                {
                  label: 'Market Cap Change (24h)',
                  data: [
                    usdcFilteredData.market_cap_change_24h,
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
                    usdcFilteredData.market_cap_change_percentage_24h,
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
                    usdcFilteredData.price_change_percentage_24h
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
                  beginAtZero: true,
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

(function() {
    // Radar Chart for USDC KPIs
    const usdcRadarCtx = document.getElementById('usdcRadarChart').getContext('2d');
    const radarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
    const radarDataValues = [
      usdcFilteredData.current_price,
      usdcFilteredData.market_cap,
      usdcFilteredData.total_volume,
      usdcFilteredData.circulating_supply
    ];

  // Determine the maximum value for the dataset
  const maxRadarValue = Math.max(...radarDataValues);

  // Define the number of rings or levels you want to display
  const numberOfRings = 5;

  // Calculate the step size based on the number of rings
  const radarStepSize = maxRadarValue / numberOfRings;
  
    createChart(usdcRadarChartRef, usdcRadarCtx, {
      type: 'radar',
      data: {
        labels: radarLabels,
        datasets: [
          {
            label: 'USDC KPIs',
            data: radarDataValues,
            backgroundColor: 'rgba(54, 102, 255, 0.2)', // Changed color for effect
            borderColor: 'rgba(54, 102, 255, 1)',
            borderWidth: 1
          }
        ]
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
         
// Line Chart for USDC Metrics Over Time
const usdcLineChartCtx = document.getElementById('usdcLineChart').getContext('2d');
createChart(usdcLineChartRef, usdcLineChartCtx, {
  type: 'line',
  data: {
    labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'], 
    datasets: [
      {
        label: 'USDC Metrics',
        data: [
          usdcFilteredData.current_price,
          usdcFilteredData.market_cap,
          usdcFilteredData.total_volume,
          usdcFilteredData.circulating_supply
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
      usdcHeatmapChartRef.current &&  usdcHeatmapChartRef.current.destroy();
      usdcPolarAreaChartRef.current &&  usdcPolarAreaChartRef.current.destroy();
      usdcLineChartRef.current &&  usdcLineChartRef.current.destroy();
      usdcWaterfallBarChartRef.current &&  usdcWaterfallBarChartRef.current.destroy();
      usdcRadarChartRef.current &&  usdcRadarChartRef.current.destroy();
    };
  }, []);

  const handleLineQuery = (query) => {
    if (usdcData) {
      let lineLabels = [];
      let lineDataValues = [];
  
      switch (query) {
        case "market_cap_vs_total_volume":
          lineLabels = ['Market Cap', 'Total Volume'];
          lineDataValues = [usdcData.market_cap, usdcData.total_volume];
          break;
        case "full_metrics_line":
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            usdcData.current_price,
            usdcData.market_cap,
            usdcData.total_volume,
            usdcData.circulating_supply
          ];
          break;
        default:
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            usdcData.current_price,
            usdcData.market_cap,
            usdcData.total_volume,
            usdcData.circulating_supply
          ];
      }
  
      updateLineChart(lineDataValues, lineLabels);
    }
};

const handleBarChartQuery = (query) => {
  if (usdcData) {
      let barLabels = [];
      let barDataValues = [];
      let isPercentage = false;

      switch (query) {
          case "valuation_metrics":
              barLabels = ['Market Cap Change (24h)', 'Price Change % (24h)'];
              barDataValues = [
                  [usdcData.market_cap_change_24h, null],
                  [null, usdcData.price_change_percentage_24h]
              ];
              isPercentage = true;
              break;
          case "full_metrics_bar":
          default:
              barLabels = ['Market Cap Change (24h)', 'Market Cap Change % (24h)', 'Price Change % (24h)'];
              barDataValues = [
                  [usdcData.market_cap_change_24h, null, null],
                  [null, usdcData.market_cap_change_percentage_24h, null],
                  [null, null, usdcData.price_change_percentage_24h]
              ];
              break;
      }

      updateBarChart(barDataValues, barLabels, isPercentage);
  }
};

const handlePolarQuery = (query) => {
  if (usdcData) {
    let polarLabels = [];
    let polarDataValues = [];

    switch (query) {
      case "market_cap_vs_circulating_supply":
        polarLabels = ['Market Cap', 'Circulating Supply'];
        polarDataValues = [usdcData.market_cap, usdcData.circulating_supply];
        break;
      case "full_metrics_polar":
        polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
        polarDataValues = [
          usdcData.current_price,
          usdcData.market_cap,
          usdcData.total_volume,
          usdcData.circulating_supply
        ];
        break;
      default:
        // default case should handle fallback
        polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
        polarDataValues = [
          usdcData.current_price,
          usdcData.market_cap,
          usdcData.total_volume,
          usdcData.circulating_supply
        ];
    }

    updatePolarChart(polarDataValues, polarLabels);
  }
};

const updateBarChart = (dataValues, labels, isPercentage) => {
  if (usdcWaterfallBarChartRef.current) {
      usdcWaterfallBarChartRef.current.data.datasets.forEach((dataset, index) => {
          dataset.data = dataValues[index];
      });
      usdcWaterfallBarChartRef.current.data.labels = labels;
      if (isPercentage) {
          usdcWaterfallBarChartRef.current.options.scales.y.title.text = 'Percentage Change (%)';
          usdcWaterfallBarChartRef.current.options.scales.y1.title.text = 'Percentage Change (%)';
      } else {
          usdcWaterfallBarChartRef.current.options.scales.y.title.text = 'Monetary Value (USD)';
          usdcWaterfallBarChartRef.current.options.scales.y1.title.text = 'Percentage Change (%)';
      }
      usdcWaterfallBarChartRef.current.update();
  }
};

// Function to update the line chart
const updateLineChart = (dataValues, labels) => {
  if (usdcLineChartRef.current) {
    usdcLineChartRef.current.data.datasets[0].data = dataValues;
    usdcLineChartRef.current.data.labels = labels;
    usdcLineChartRef.current.update();
  }
};

const updatePolarChart = (dataValues, labels) => {
  if (usdcPolarAreaChartRef.current) {
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

      usdcPolarAreaChartRef.current.data.datasets[0].data = dataValues;
      usdcPolarAreaChartRef.current.data.labels = labels;
      usdcPolarAreaChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
      usdcPolarAreaChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
      usdcPolarAreaChartRef.current.update();
  }
};

const handleLineQueryChange = (e) => {
  const query = e.target.value;
  setLineQuery(query);
  handleLineQuery(query);
  handleFilterChange(query);
  setShowLineChartInfo(query === 'market_cap_vs_total_volume');
};

const handleBarQueryChange = (e) => {
  const query = e.target.value;
  setBarQuery(query);
  handleBarChartQuery(query);
  handleFilterChange(query);
  setShowWaterfallBarChartInfo(query === 'valuation_metrics');
};

const handlePolarOrRadarQueryChange = (e) => {
  const query = e.target.value;
  if (query.includes('radar')) {
    setRadarQuery(query);
    setPolarQuery('');  
    handleFilterChange(query); 
    setShowRadarChartInfo(query === 'full_metrics_radar');
    setShowPolarChartInfo(false); 
  } else {
    setPolarQuery(query);
    handlePolarQuery(query);
    handleFilterChange(query);
    setShowPolarChartInfo(query === 'market_cap_vs_circulating_supply');
  }
};

const [showPolarChartInfo, setShowPolarChartInfo] = useState(false);
const [showRadarChartInfo, setShowRadarChartInfo] = useState(false);
const [showLineChartInfo, setShowLineChartInfo] = useState(false);
const [showWaterfallBarChartInfo, setShowWaterfallBarChartInfo] = useState(false);

const toggleLineChartInfo = () => setShowLineChartInfo((prev) => !prev);
const toggleWaterfallBarChartInfo = () => setShowWaterfallBarChartInfo((prev) => !prev);
const togglePolarChartInfo = () => setShowPolarChartInfo((prev) => !prev);
const toggleRadarChartInfo = () => setShowRadarChartInfo((prev) => !prev);

return (
  <div className="usdcpage-wrapper">
    <h1 className="page-title">USDC Visualization's</h1>
    <div className="faq-icon" onClick={() => window.location.href = 'http://localhost:5000/faq'}>
      <i className="bi bi-question-circle" title="Off to FAQ"></i>
    </div>

    <div className="usdcchart-container">
      {/* Query Selectors */}
      <div className="usdcquery-container">
        <select value={lineQuery} onChange={handleLineQueryChange}>
          <option value="" hidden>📉 Select Line Chart Option</option>
          <option value="market_cap_vs_total_volume"> 📉 Market Cap vs. Total Volume </option>
          <option value="full_metrics_line"> 📉 All Line Metrics </option>
        </select>
      </div>
  
      <div className="usdcquery-container">
        <select 
            value={polarQuery || radarQuery} 
            onChange={handlePolarOrRadarQueryChange}
          >
            <option value="" hidden>❄️📡 Select Polar or Doughnut Chart Option</option>
            <option value="market_cap_vs_circulating_supply">❄️ Market Cap vs. Circulating Supply</option>
            <option value="full_metrics_polar">❄️ All Polar Metrics</option>
            <option value="full_metrics_radar">📡 All Radar Metrics</option>
          </select>
        </div>

      <div className="usdcquery-container">
        <select value={barQuery} onChange={handleBarQueryChange}>
          <option value="" hidden>📊 Select Waterfall Bar Chart Option</option>
          <option value="valuation_metrics"> 📊 Performance Metrics </option>
          <option value="full_metrics_bar"> 📊 All Waterfall Bar Metrics </option>
        </select>
      </div>

      {/* Heatmap Chart */}
    <div className="usdcchart-wrapper heatmap">
    <div className="usdcchart-header">
        <h2>Heatmap for USDC Metrics</h2>
    </div>
        <canvas id="usdcHeatmapChart"></canvas>
    </div>

      {/* Polar Area Chart */}
      <div className="usdcchart-wrapper line">
        <div className="usdcchart-header">
          <h2>Polar Area Chart for USDC KPIs</h2>
          {polarQuery === 'market_cap_vs_circulating_supply' && (
          <span className="usdcinfo-icon" title="More Information">🤔</span> 
          )}
        </div>
        <canvas id="usdcPolarAreaChart"></canvas>
        {loadingPolar ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          polarInsights && (
            <div className="usdcchart-details">
              <p>{polarInsights}</p>
            </div>
          )
        )}
      </div>

      {/* Radar Chart */}
      <div className="usdcchart-wrapper line">
        <div className="usdcchart-header">
          <h2>Radar Chart for USDC Metrics</h2>
          {radarQuery === 'full_metrics_radar' && (
          <span className="usdcinfo-icon" title="More Information">🤔</span> 
          )}
        </div>
        <canvas id="usdcRadarChart"></canvas>
        {loadingRadar ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          radarInsights && (
            <div className="usdcchart-details">
              <p>{radarInsights}</p>
            </div>
          )
        )}
      </div>

      {/* Line Graph */}
      <div className="usdcchart-wrapper line">
      <div className="usdcchart-header"> {/* Updated to match CSS */}
      <h2>Line Graph for USDC Metrics</h2>
      {lineQuery === 'market_cap_vs_total_volume' && (
      <span className="usdcinfo-icon" title="More Information">🤔</span> 
      )}
    </div>
    <canvas id="usdcLineChart"></canvas>
    {loadingLine ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          lineInsights && (
            <div className="usdcchart-details">
              <p>{lineInsights}</p>
            </div>
          )
        )}
      </div>

      {/* Waterfall Bar Chart */}
      <div className="usdcchart-wrapper bar">
        <div className="usdcchart-header">
          <h2>Waterfall Bar Chart for USDC Metrics</h2>
          {barQuery === 'valuation_metrics' && (
          <span className="usdcinfo-icon" title="More Information">🤔</span> 
          )}
        </div>
        <canvas id="usdcWaterfallBarChart"></canvas>
        {loadingWaterfall ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          waterfallInsights && (
            <div className="usdcchart-details">
              <p>{waterfallInsights}</p>
            </div>
          )
        )}
      </div>
    </div>
  </div>
);
}

export default UsdcCharts;
