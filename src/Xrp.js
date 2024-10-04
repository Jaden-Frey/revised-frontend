import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Xrp.css";
import Chart from "chart.js/auto";
import "./Questionmark.css";

const XrpCharts = () => {
  const [xrpData, setXrpData] = useState(null);
  const [query, setQuery] = useState("");
  const [polarQuery, setPolarQuery] = useState("");
  const [stackedQuery, setStackedQuery] = useState("");
  const [barQuery, setBarQuery] = useState("");
  const [lineQuery, setLineQuery] = useState("");
  const [polarInsights, setPolarInsights] = useState("");
  const [stackedInsights, setStackedInsights] = useState("");
  const [lineInsights, setLineInsights] = useState("");
  const [waterfallInsights, setWaterfallInsights] = useState("");

  const xrpHeatmapChartRef = useRef(null); 
  const xrpLineChartRef = useRef(null);
  const xrpWaterfallBarChartRef = useRef(null);
  const xrpPolarAreaChartRef = useRef(null);
  const xrpStackedBarChartRef = useRef(null);

  const [loadingPolar, setLoadingPolar] = useState(false);
  const [loadingStacked, setLoadingStacked] = useState(false);
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
    if (!xrpData || typeof xrpData !== 'object') {
      console.error('Invalid or missing XRP data');
      return;
    }
  
    let filteredData;
    let setInsights;
    let setLoading;
  
    switch (selectedRelationship) {
      case 'market_cap_vs_volume':
        filteredData = { market_cap: xrpData.market_cap, total_volume: xrpData.total_volume };
        setInsights = setPolarInsights;
        setLoading = setLoadingPolar;
        break;
      case 'market_cap_vs_circulating_supply':
        filteredData = { market_cap: xrpData.market_cap, circulating_supply: xrpData.circulating_supply };
        setInsights = setStackedInsights;
        setLoading = setLoadingStacked;
        break;
      case 'valuation_metrics':
        filteredData = {
          market_cap_change_24h: xrpData.market_cap_change_24h,
          price_change_percentage_24h: xrpData.price_change_percentage_24h,
        };
        setInsights = setWaterfallInsights;
        setLoading = setLoadingWaterfall;
        break;
      case 'total_volume_vs_circulating_supply':
      filteredData = {
        total_volume: xrpData.total_volume,
        circulating_supply: xrpData.circulating_supply,
      };
      setInsights = setLineInsights; 
      setLoading = setLoadingLine; 
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
        const xrpFilteredData = data.filter(item => item.symbol === 'xrp')[0];
        setXrpData(xrpFilteredData);
        renderCharts(xrpFilteredData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    return () => {
      xrpHeatmapChartRef.current && xrpHeatmapChartRef.current.destroy();
      xrpLineChartRef.current && xrpLineChartRef.current.destroy();
      xrpWaterfallBarChartRef.current && xrpWaterfallBarChartRef.current.destroy();
      xrpPolarAreaChartRef.current && xrpPolarAreaChartRef.current.destroy();
      xrpStackedBarChartRef.current && xrpStackedBarChartRef.current.destroy();
    };
  }, []);

  const renderCharts = (data) => {
    const destroyChart = (chartRef) => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };

    const createChart = (chartRef, ctx, config) => {
      destroyChart(chartRef);
      chartRef.current = new Chart(ctx, config);
    };

    const labels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
    const dataValues = [
      data.current_price,
      data.market_cap,
      data.total_volume,
      data.circulating_supply,
      data.market_cap_change_24h,
      data.market_cap_change_percentage_24h,
      data.price_change_24h,
      data.price_change_percentage_24h
    ];

    // Heatmap for XRP metrics
    const xrpHeatmapCtx = document.getElementById('xrpHeatmapChart').getContext('2d');
    const isPositiveChange = data.price_change_percentage_24h >= 0;
    const absPriceChange = Math.abs(data.price_change_percentage_24h);
    const dynamicMax = Math.ceil(absPriceChange / 5) * 5;

    const positiveBaseColor = 'rgba(0, 200, 83'; 
    const negativeBaseColor = 'rgba(255, 51, 51';
    
    const baseColor = isPositiveChange ? positiveBaseColor : negativeBaseColor;
    const backgroundColor = `${baseColor}, ${0.2 + (absPriceChange / dynamicMax) * 0.2})`;
    const borderColor = `${baseColor}, 1)`;

    createChart(xrpHeatmapChartRef, xrpHeatmapCtx, {
      type: 'bar',
      data: {
        labels: ['XRP'],
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
            title: { display: true, text: 'XRP Metrics' }
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
                return `${label}: ${value}% (${data.name})`; 
              },
              afterLabel: function(tooltipItem) {
                const value = data.price_change_percentage_24h;
                return `Price Change: ${value > 0 ? '+' : ''}${value}%`; 
              }
            }
          }
        }
      }
    });

    // XRP Waterfall Bar Chart
    const xrpWaterfallBarCtx = document.getElementById('xrpWaterfallBarChart').getContext('2d');
    createChart(xrpWaterfallBarChartRef, xrpWaterfallBarCtx, {
      type: 'bar',
      data: {
        labels: ['Market Cap Change (24h)', 'Market Cap Change % (24h)', 'Price Change % (24h)'],
        datasets: [
          {
            label: 'Market Cap Change (24h)',
            data: [
              data.market_cap_change_24h,
              null, 
              null  
            ],
            backgroundColor: 'rgba(60, 141, 255, 0.2)',
            borderColor: 'rgba(60, 141, 255, 1)',
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: 'Market Cap Change % (24h)',
            data: [
              null,
              data.market_cap_change_percentage_24h,
              null  
            ],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            yAxisID: 'y1'
          },
          {
            label: 'Price Change % (24h)',
            data: [
              null,
              null,
              data.price_change_percentage_24h
            ],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
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
                return '$' + value.toLocaleString();
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
                return value.toLocaleString() + '%';
              }
            },
            grid: {
              drawOnChartArea: false
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
                if (tooltipItem.datasetIndex === 0) {
                  return `${datasetLabel}: $${value.toLocaleString()}`;
                } else {
                  return `${datasetLabel}: ${value.toLocaleString()}%`;
                }
              }
            }
          }
        }
      }
    });

    // Line Chart for XRP Metrics Over Time
    const xrpLineChartCtx = document.getElementById('xrpLineChart').getContext('2d');
    createChart(xrpLineChartRef, xrpLineChartCtx, {
      type: 'line',
      data: {
        labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'], 
        datasets: [
          {
            label: 'XRP Metrics',
            data: [
              data.current_price,
              data.market_cap,
              data.total_volume,
              data.circulating_supply
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
            fill: true,
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
            type: 'category',
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

        // Polar Area Chart for Selected XRP Metrics
        const xrpPolarAreaCtx = document.getElementById('xrpPolarAreaChart').getContext('2d');

        let polarLabels = [];
        let polarDataValues = [];
        if (query === "market_cap_vs_volume") {
          polarLabels = ['Market Cap', 'Total Volume'];
          polarDataValues = [data.market_cap, data.total_volume];
        } else {
          polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          polarDataValues = [
            data.current_price,
            data.market_cap,
            data.total_volume,
            data.circulating_supply
          ];
        }
    
        createChart(xrpPolarAreaChartRef, xrpPolarAreaCtx, {
          type: 'polarArea',
          data: {
            labels: polarLabels,
            datasets: [{
              label: 'XRP Distribution Metrics',
              data: polarDataValues,
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
                  display: false,
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
    

    // Horizontal Stacked Bar Chart for Multiple XRP Metrics
    const xrpStackedBarCtx = document.getElementById('xrpStackedBarChart').getContext('2d');
    createChart(xrpStackedBarChartRef, xrpStackedBarCtx, {
      type: 'bar',
      data: {
        labels: ['XRP'],
        datasets: [
          {
            label: 'Market Cap',
            data: [data.market_cap],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            barThickness: 150,
            borderWidth: 1
          },
          {
            label: 'Total Volume',
            data: [data.total_volume],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            barThickness: 150,
            borderWidth: 1
          },
          {
            label: 'Circulating Supply',
            data: [data.circulating_supply],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            barThickness: 150,
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Value (USD)'
            },
            ticks: {
              callback: function (value) {
                return '$' + value.toLocaleString();
              }
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Metrics'
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
              label: function (tooltipItem) {
                const datasetLabel = tooltipItem.dataset.label || '';
                const value = tooltipItem.raw;
                return `${datasetLabel}: $${value.toLocaleString()}`;
              }
            }
          }
        }
      }
    });
  };

  const handlePolarQuery = (query) => {
    if (xrpData) {
      let polarLabels = [];
      let polarDataValues = [];
  
      switch (query) {
        case "market_cap_vs_volume":
          polarLabels = ['Market Cap', 'Total Volume'];
          polarDataValues = [xrpData.market_cap, xrpData.total_volume];
          break;
        case "full_metrics_polar":
          polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          polarDataValues = [
            xrpData.current_price,
            xrpData.market_cap,
            xrpData.total_volume,
            xrpData.circulating_supply
          ];
          break;
        default:
          // default case should handle fallback
          polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          polarDataValues = [
            xrpData.current_price,
            xrpData.market_cap,
            xrpData.total_volume,
            xrpData.circulating_supply
          ];
      }
  
      updatePolarChart(polarDataValues, polarLabels);
    }
};

const handleStackedQuery = (query) => {
    if (xrpData) {
      let stackedLabels = [];
      let stackedDataValues = [];
  
      switch (query) {
        case "market_cap_vs_circulating_supply":
          stackedLabels = ['Market Cap', 'Circulating Supply'];
          stackedDataValues = [xrpData.market_cap, xrpData.circulating_supply];
          break;
        case "full_metrics_stacked":
          stackedLabels = ['Market Cap', 'Total Volume', 'Circulating Supply'];
          stackedDataValues = [
            xrpData.market_cap,
            xrpData.total_volume,
            xrpData.circulating_supply
          ];
          break;
        default:
          stackedLabels = ['Market Cap', 'Total Volume', 'Circulating Supply'];
          stackedDataValues = [
            xrpData.market_cap,
            xrpData.total_volume,
            xrpData.circulating_supply
          ];
      }
  
      updateStackedBarChart(stackedDataValues, stackedLabels);
    }
};

const handleBarChartQuery = (query) => {
  if (xrpData) {
      let barLabels = [];
      let barDataValues = [];
      let isPercentage = false;

      switch (query) {
          case "valuation_metrics":
              barLabels = ['Market Cap Change (24h)', 'Price Change % (24h)'];
              barDataValues = [
                  [xrpData.market_cap_change_24h, null],
                  [null, xrpData.price_change_percentage_24h]
              ];
              isPercentage = true;
              break;
          case "full_metrics_bar":
          default:
              barLabels = ['Market Cap Change (24h)', 'Market Cap Change % (24h)', 'Price Change % (24h)'];
              barDataValues = [
                  [xrpData.market_cap_change_24h, null, null],
                  [null, xrpData.market_cap_change_percentage_24h, null],
                  [null, null, xrpData.price_change_percentage_24h]
              ];
              break;
      }

      updateBarChart(barDataValues, barLabels, isPercentage);
  }
};

const handleLineQuery = (query) => {
    if (xrpData) {
      let lineLabels = [];
      let lineDataValues = [];
  
      switch (query) {
        case "total_volume_vs_circulating_supply":
          lineLabels = ['Total Volume', 'Circulating Supply'];
          lineDataValues = [xrpData.total_volume, xrpData.circulating_supply];
          break;
        case "full_metrics_line":
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            xrpData.current_price,
            xrpData.market_cap,
            xrpData.total_volume,
            xrpData.circulating_supply
          ];
          break;
        default:
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            xrpData.current_price,
            xrpData.market_cap,
            xrpData.total_volume,
            xrpData.circulating_supply
          ];
      }
  
      updateLineChart(lineDataValues, lineLabels);
    }
};

const updatePolarChart = (dataValues, labels) => {
  if (xrpPolarAreaChartRef.current) {
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

      xrpPolarAreaChartRef.current.data.datasets[0].data = dataValues;
      xrpPolarAreaChartRef.current.data.labels = labels;
      xrpPolarAreaChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
      xrpPolarAreaChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
      xrpPolarAreaChartRef.current.update();
  }
};

const updateStackedBarChart = (dataValues, labels) => {
  if (xrpStackedBarChartRef.current) {
    // Set the labels for the x-axis (horizontal)
    xrpStackedBarChartRef.current.data.labels = ['XRP']; 
    // Update datasets
    xrpStackedBarChartRef.current.data.datasets.forEach((dataset, index) => {
      if (dataValues[index] !== undefined) {
        dataset.data = [dataValues[index]];
      } else {
        dataset.data = [0]; 
      }
    });
    xrpStackedBarChartRef.current.update();
  }
};

// Function to update the line chart
const updateLineChart = (dataValues, labels) => {
  if (xrpLineChartRef.current) {
    xrpLineChartRef.current.data.datasets[0].data = dataValues;
    xrpLineChartRef.current.data.labels = labels;
    xrpLineChartRef.current.update();
  }
};

// Function to update the waterfall bar chart
const updateBarChart = (dataValues, labels, isPercentage) => {
if (xrpWaterfallBarChartRef.current) {
    xrpWaterfallBarChartRef.current.data.datasets.forEach((dataset, index) => {
        dataset.data = dataValues[index];
    });
    xrpWaterfallBarChartRef.current.data.labels = labels;
    if (isPercentage) {
        xrpWaterfallBarChartRef.current.options.scales.y.title.text = 'Percentage Change (%)';
        xrpWaterfallBarChartRef.current.options.scales.y1.title.text = 'Percentage Change (%)';
    } else {
        xrpWaterfallBarChartRef.current.options.scales.y.title.text = 'Monetary Value (USD)';
        xrpWaterfallBarChartRef.current.options.scales.y1.title.text = 'Percentage Change (%)';
    }
    xrpWaterfallBarChartRef.current.update();
}
};

// Event listeners for dropdown changes
const handlePolarQueryChange = (e) => {
  const query = e.target.value;
  setPolarQuery(query);
  handlePolarQuery(query);
  handleFilterChange(query);
  setShowPolarChartInfo(query === 'market_cap_vs_volume');
};

const handleStackedQueryChange = (e) => {
  const query = e.target.value;
  setStackedQuery(query);
  handleStackedQuery(query);
  handleFilterChange(query);
  setShowStackedChartInfo(query === 'market_cap_vs_circulating_supply');
};

const handleBarQueryChange = (e) => {
  const query = e.target.value;
  setBarQuery(query);
  handleBarChartQuery(query);
  handleFilterChange(query);
  setShowWaterfallBarChartInfo(query === 'valuation_metrics');
};

const handleLineQueryChange = (e) => {
  const query = e.target.value;
  setLineQuery(query);
  handleLineQuery(query);
  handleFilterChange(query);
  setShowLineChartInfo(query === 'total_volume_vs_circulating_supply');
};

const [showPolarChartInfo, setShowPolarChartInfo] = useState(false);
const [showStackedChartInfo, setShowStackedChartInfo] = useState(false);
const [showLineChartInfo, setShowLineChartInfo] = useState(false);
const [showWaterfallBarChartInfo, setShowWaterfallBarChartInfo] = useState(false);

 const toggleStackedChartInfo = () => setShowStackedChartInfo((prev) => !prev);
 const toggleLineChartInfo = () => setShowLineChartInfo((prev) => !prev);
 const toggleWaterfallBarChartInfo = () => setShowWaterfallBarChartInfo((prev) => !prev);
 const togglePolarChartInfo = () => setShowPolarChartInfo((prev) => !prev);


// Rendering the components
return (
    <div className="xrppage-wrapper">
        <h1 className="page-title">XRP Visualizations</h1>
        <div className="faq-icon" onClick={() => window.location.href = 'http://localhost:5000/faq'}>
            <i className="bi bi-question-circle" title="Off to FAQ"></i>
        </div>

        <div className="xrpchart-container">
            <div className="xrpquery-container">
                <select value={polarQuery} onChange={handlePolarQueryChange}>
                    <option value="" hidden>❄️ Select Polar Chart Option</option>
                    <option value="market_cap_vs_volume"> ❄️ Market Cap vs. Volume </option>
                    <option value="full_metrics_polar"> ❄️ All Polar Metrics </option>
                </select>
            </div>

            <div className="xrpquery-container">
                <select value={stackedQuery} onChange={handleStackedQueryChange}>
                    <option value="" hidden>📚 Select Stacked Chart Option</option>
                    <option value="market_cap_vs_circulating_supply"> 📚 Market Cap vs. Circulating Supply </option>
                    <option value="full_metrics_stacked"> 📚 All Stacked Metrics </option>
                </select>
            </div>

            <div className="xrpquery-container">
                <select value={barQuery} onChange={handleBarQueryChange}>
                    <option value="" hidden>📊 Select Waterfall Bar Chart Option</option>
                    <option value="valuation_metrics"> 📊 Performance Metrics </option>
                    <option value="full_metrics_bar"> 📊 All Waterfall Bar Metrics </option>
                </select>
            </div>

            <div className="xrpquery-container">
                <select value={lineQuery} onChange={handleLineQueryChange}>
                    <option value="" hidden>📉 Select Line Chart Option</option>
                    <option value="total_volume_vs_circulating_supply"> 📉 Total Volume vs. Circulating Supply </option>
                    <option value="full_metrics_line"> 📉 All Line Metrics </option>
                </select>
            </div>

    {/* Heatmap Chart */}
    <div className="xrpchart-wrapper heatmap">
    <div className="xrpchart-header">
        <h2>Heatmap for XRP Metrics</h2>
    </div>
        <canvas id="xrpHeatmapChart"></canvas>
    </div>

      {/* Polar Area Chart */}
      <div className="xrpchart-wrapper polar">
        <div className="xrpchart-header">
          <h2>Polar Area Chart for XRP KPIs</h2>
          {polarQuery === 'market_cap_vs_volume' && (
          <span className="xrpinfo-icon" title="More Information">🤔</span> 
          )}
        </div>
        <canvas id="xrpPolarAreaChart"></canvas>
        {loadingPolar ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          polarInsights && (
            <div className="xrpchart-details">
              <p>{polarInsights}</p>
            </div>
          )
        )}
      </div>

      {/* Stacked Chart */}
      <div className="xrpchart-wrapper stack">
        <div className="xrpchart-header">
          <h2>Stacked Chart for XRP Metrics</h2>
          {stackedQuery === 'market_cap_vs_circulating_supply' && (
          <span className="xrpinfo-icon" title="More Information">🤔</span> 
          )}
        </div>
        <canvas id="xrpStackedBarChart"></canvas>
        {loadingStacked ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          stackedInsights && (
            <div className="xrpchart-details">
              <p>{stackedInsights}</p>
            </div>
          )
        )}
      </div>

      {/* Line Graph */}
      <div className="xrpchart-wrapper line">
        <div className="xrpchart-header">
          <h2>Line Graph for XRP Metrics</h2>
          {lineQuery === 'total_volume_vs_circulating_supply' && (
          <span className="xrpinfo-icon" title="More Information">🤔</span> 
          )}
        </div>
        <canvas id="xrpLineChart"></canvas>
        {loadingLine ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          lineInsights && (
            <div className="xrpchart-details">
              <p>{lineInsights}</p>
            </div>
          )
        )}
      </div>

      {/* Waterfall Bar Chart */}
      <div className="xrpchart-wrapper bar">
        <div className="xrpchart-header">
          <h2>Waterfall Bar Chart for XRP Metrics</h2>
          {barQuery === 'valuation_metrics' && (
          <span className="xrpinfo-icon" title="More Information">🤔</span> 
          )}
        </div>
        <canvas id="xrpWaterfallBarChart"></canvas>
        {loadingWaterfall ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          waterfallInsights && (
            <div className="xrpchart-details">
              <p>{waterfallInsights}</p>
            </div>
          )
        )}
      </div>
    </div>
  </div>
);
};

export default XrpCharts;
