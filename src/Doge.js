import React, { useEffect, useState, useRef } from "react";
import "./Doge.css";
import Chart from "chart.js/auto";
import "./Questionmark.css";

const DogeCharts = () => {
  const [DogeData, setDogeData] = useState(null);
  const dogeLineChartRef = useRef(null);
  const dogeWaterfallBarChartRef = useRef(null);
  const dogePolarAreaChartRef = useRef(null);
  const dogeStackedBarChartRef = useRef(null);
  const dogeGroupedBarChartRef = useRef(null);
  const [lineQuery, setLineQuery] = useState("");
  const [barQuery, setBarQuery] = useState("");
  const [polarQuery, setPolarQuery] = useState("");
  const [groupedQuery, setGroupedQuery] = useState("");
  const [stackedQuery, setStackedQuery] = useState("");
  const [polarInsights, setPolarInsights] = useState("");
  const [waterfallInsights, setWaterfallInsights] = useState("");
  const [lineInsights, setLineInsights] = useState("");
  const [groupedInsights, setGroupedInsights] = useState("");
  const [stackedInsights, setStackedInsights] = useState("");

  const [loadingPolar, setLoadingPolar] = useState(false);
  const [loadingGrouped, setLoadingGrouped] = useState(false);
  const [loadingLine, setLoadingLine] = useState(false);
  const [loadingStacked, setLoadingStacked] = useState(false);
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
    if (!DogeData || typeof DogeData !== 'object') {
      console.error('Invalid or missing Doge data');
      return;
    }
  
    let filteredData;
    let setInsights;
    let setLoading;
  
    switch (selectedRelationship) {
      case 'market_cap_vs_total_volume':
        filteredData = { market_cap: DogeData.market_cap, total_volume: DogeData.total_volume };
        setInsights = setPolarInsights;
        setLoading = setLoadingPolar;
        break;
      case 'market_cap_vs_circulating_supply':
        filteredData = { market_cap: DogeData.market_cap, circulating_supply: DogeData.circulating_supply };
        setInsights = setLineInsights;
        setLoading = setLoadingLine;
        break;
      case 'grouped_metrics':
        filteredData = { market_cap: DogeData.market_cap, total_volume: DogeData.total_volume };
        setInsights = setGroupedInsights;
        setLoading = setLoadingGrouped;
        break;
      case 'valuation_metrics':
          filteredData = {
            market_cap_change_24h: DogeData.market_cap_change_24h,
            price_change_percentage_24h: DogeData.price_change_percentage_24h,
          };
          setInsights = setWaterfallInsights;
          setLoading = setLoadingWaterfall;
          break;
      case 'full_metrics_stacked':
          filteredData = {
            market_cap: DogeData.market_cap,
            total_volume: DogeData.total_volume,
            circulating_supply: DogeData.circulating_supply,
            market_cap_change_24h: DogeData.market_cap_change_24h,
            price_change_percentage_24h: DogeData.price_change_percentage_24h
          };
          setInsights = setStackedInsights;
          setLoading = setLoadingStacked;
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
        const dogeFilteredData = data.filter(item => item.symbol === 'doge')[0];
        setDogeData(dogeFilteredData);

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
          dogeFilteredData.current_price,
          dogeFilteredData.market_cap,
          dogeFilteredData.total_volume,
          dogeFilteredData.circulating_supply,
          dogeFilteredData.market_cap_change_24h,
          dogeFilteredData.market_cap_change_percentage_24h,
          dogeFilteredData.price_change_24h,
          dogeFilteredData.price_change_percentage_24h
        ];

          //Dogecoin Waterfall Bar chart
          const dogeWaterfallBarCtx = document.getElementById('dogeWaterfallBarChart').getContext('2d');
          createChart(dogeWaterfallBarChartRef, dogeWaterfallBarCtx, {
            type: 'bar',
            data: {
              labels: ['Market Cap Change (24h)', 'Market Cap Change % (24h)', 'Price Change % (24h)'],
              datasets: [
                {
                  label: 'Market Cap Change (24h)',
                  data: [
                    dogeFilteredData.market_cap_change_24h,
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
                    dogeFilteredData.market_cap_change_percentage_24h,
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
                    dogeFilteredData.price_change_percentage_24h
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
          
// Line Chart for Doge Metrics Over Time
const dogeLineChartCtx = document.getElementById('dogeLineChart').getContext('2d');
createChart(dogeLineChartRef, dogeLineChartCtx, {
  type: 'line',
  data: {
    labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'], 
    datasets: [
      {
        label: 'Dogecoin Metrics',
        data: [
          dogeFilteredData.current_price,
          dogeFilteredData.market_cap,
          dogeFilteredData.total_volume,
          dogeFilteredData.circulating_supply
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

// Polar Area Chart for Doge Distribution Metrics
const dogePolarAreaCtx = document.getElementById('dogePolarAreaChart').getContext('2d');

const maxValue = Math.max(...dataValues);
createChart(dogePolarAreaChartRef, dogePolarAreaCtx, {
  type: 'polarArea',
  data: {
    labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'],
    datasets: [{
      label: 'Dogecoin Distribution Metrics',
      data: [
        dogeFilteredData.current_price,
        dogeFilteredData.market_cap,
        dogeFilteredData.total_volume,
        dogeFilteredData.circulating_supply,
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

        // Dogecoin Bar Chart with Dual Axes
        const dogeGroupedBarCtx = document.getElementById('dogeGroupedBarChart').getContext('2d');
          createChart(dogeGroupedBarChartRef, dogeGroupedBarCtx, {
            type: 'bar',
            data: {
              labels: ['Dogecoin Metrics'],
              datasets: [
                {
                  label: 'High 24h',
                  data: [dogeFilteredData.high_24h],
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  borderColor: 'rgba(255, 99, 132, 1)',
                  borderWidth: 1,
                  yAxisID: 'y-axis-1'
                },
                {
                  label: 'Low 24h',
                  data: [dogeFilteredData.low_24h],
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
                  yAxisID: 'y-axis-1'
                },
                {
                  label: 'Total Volume',
                  data: [dogeFilteredData.total_volume],
                  backgroundColor: 'rgba(255, 206, 86, 0.2)',
                  borderColor: 'rgba(255, 206, 86, 1)',
                  borderWidth: 1,
                  yAxisID: 'y-axis-2'
                },
                {
                  label: 'Market Cap',
                  data: [dogeFilteredData.market_cap],
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1,
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
                    callback: function(value) {
                      return value;
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
                    text: 'Value (USD)'
                  },
                  grid: {
                    drawOnChartArea: true,
                  }
                },
                'y-axis-2': {
                  type: 'linear',
                  position: 'right',
                  ticks: {
                    callback: function(value) {
                      return value.toLocaleString();
                    }
                  },
                  title: {
                    display: true,
                    text: 'Volume / Market Cap'
                  },
                  grid: {
                    drawOnChartArea: false,
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
                      if (tooltipItem.dataset.label === 'High 24h' || tooltipItem.dataset.label === 'Low 24h') {
                        return tooltipItem.dataset.label + ': $' + value.toLocaleString();
                      } else {
                        return tooltipItem.dataset.label + ': $' + value.toLocaleString();
                      }
                    }
                  }
                }
              }
            }
          });

  // Horizontal Stacked Bar Chart for Multiple Doge Metrics
  const dogeStackedBarCtx = document.getElementById('dogeStackedBarChart').getContext('2d');
  createChart(dogeStackedBarChartRef, dogeStackedBarCtx, {
    type: 'bar',
    data: {
      labels: ['Dogecoin'],
      datasets: [
        {
          label: 'Market Cap',
          data: [dogeFilteredData.market_cap],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          barThickness: 150,
          borderWidth: 1
        },
        {
          label: 'Total Volume',
          data: [dogeFilteredData.total_volume],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          barThickness: 150,
          borderWidth: 1
        },
        {
          label: 'Circulating Supply',
          data: [dogeFilteredData.circulating_supply],
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
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    return () => {
      dogeLineChartRef.current &&  dogeLineChartRef.current.destroy();
      dogeWaterfallBarChartRef.current &&  dogeWaterfallBarChartRef.current.destroy();
      dogePolarAreaChartRef.current &&  dogePolarAreaChartRef.current.destroy();
      dogeStackedBarChartRef.current &&  dogeStackedBarChartRef.current.destroy();
      dogeGroupedBarChartRef.current &&  dogeGroupedBarChartRef.current.destroy();
    };
  }, []);

  const handleLineQuery = (query) => {
    if (DogeData) {
      let lineLabels = [];
      let lineDataValues = [];
  
      switch (query) {
        case "market_cap_vs_circulating_supply":
          lineLabels = ['Market Cap', 'Circulating Supply'];
          lineDataValues = [DogeData.market_cap, DogeData.circulating_supply];
          break;
        case "full_metrics_line":
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            DogeData.current_price,
            DogeData.market_cap,
            DogeData.total_volume,
            DogeData.circulating_supply
          ];
          break;
        default:
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            DogeData.current_price,
            DogeData.market_cap,
            DogeData.total_volume,
            DogeData.circulating_supply
          ];
      }
  
      updateLineChart(lineDataValues, lineLabels);
    }
};

const handleBarChartQuery = (query) => {
  if (DogeData) {
      let barLabels = [];
      let barDataValues = [];
      let isPercentage = false;

      switch (query) {
          case "valuation_metrics":
              barLabels = ['Market Cap Change (24h)', 'Price Change % (24h)'];
              barDataValues = [
                  [DogeData.market_cap_change_24h, null],
                  [null, DogeData.price_change_percentage_24h]
              ];
              isPercentage = true;
              break;
          case "full_metrics_bar":
          default:
              barLabels = ['Market Cap Change (24h)', 'Market Cap Change % (24h)', 'Price Change % (24h)'];
              barDataValues = [
                  [DogeData.market_cap_change_24h, null, null],
                  [null, DogeData.market_cap_change_percentage_24h, null],
                  [null, null, DogeData.price_change_percentage_24h]
              ];
              break;
      }

      updateBarChart(barDataValues, barLabels, isPercentage);
  }
};

const handlePolarQuery = (query) => {
  if (DogeData) {
    let polarLabels = [];
    let polarDataValues = [];

    switch (query) {
      case "market_cap_vs_total_volume":
        polarLabels = ['Market Cap', 'Total Volume'];
        polarDataValues = [DogeData.market_cap, DogeData.total_volume];
        break;
      case "full_metrics_polar":
        polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
        polarDataValues = [
          DogeData.current_price,
          DogeData.market_cap,
          DogeData.total_volume,
          DogeData.circulating_supply
        ];
        break;
      default:
        // default case should handle fallback
        polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
        polarDataValues = [
          DogeData.current_price,
          DogeData.market_cap,
          DogeData.total_volume,
          DogeData.circulating_supply
        ];
    }

    updatePolarChart(polarDataValues, polarLabels);
  }
};

const handleGroupedQuery = (query) => {
  if (DogeData) {
    let barLabels = ['Dogecoin Metrics'];
    let barDatasets = [];
    let useSingleAxis = false;
    let yAxisMax = 0;

    switch (query) {
      case "grouped_metrics":
        useSingleAxis = true; // Use only one y-axis for comparison
        yAxisMax = Math.max(DogeData.market_cap, DogeData.total_volume);

        barDatasets = [
          {
            label: 'Market Cap',
            data: [DogeData.market_cap],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            label: 'Total Volume',
            data: [DogeData.total_volume],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          }
        ];
        break;

      case "full_metrics_bar":
      default:
        yAxisMax = Math.max(DogeData.high_24h, DogeData.low_24h, DogeData.market_cap, DogeData.total_volume);

        barDatasets = [
          {
            label: 'High 24h',
            data: [DogeData.high_24h],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            label: 'Low 24h',
            data: [DogeData.low_24h],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            label: 'Total Volume',
            data: [DogeData.total_volume],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-2'
          },
          {
            label: 'Market Cap',
            data: [DogeData.market_cap],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-2'
          }
        ];
    }

    updateGroupedChart(barDatasets, barLabels, yAxisMax, useSingleAxis);
  }
};

const updateBarChart = (dataValues, labels, isPercentage) => {
  if (dogeWaterfallBarChartRef.current) {
      dogeWaterfallBarChartRef.current.data.datasets.forEach((dataset, index) => {
          dataset.data = dataValues[index];
      });
      dogeWaterfallBarChartRef.current.data.labels = labels;
      if (isPercentage) {
          dogeWaterfallBarChartRef.current.options.scales.y.title.text = 'Percentage Change (%)';
          dogeWaterfallBarChartRef.current.options.scales.y1.title.text = 'Percentage Change (%)';
      } else {
          dogeWaterfallBarChartRef.current.options.scales.y.title.text = 'Monetary Value (USD)';
          dogeWaterfallBarChartRef.current.options.scales.y1.title.text = 'Percentage Change (%)';
      }
      dogeWaterfallBarChartRef.current.update();
  }
};

// Function to update the line chart
const updateLineChart = (dataValues, labels) => {
  if (dogeLineChartRef.current) {
    dogeLineChartRef.current.data.datasets[0].data = dataValues;
    dogeLineChartRef.current.data.labels = labels;
    dogeLineChartRef.current.update();
  }
};

const updatePolarChart = (dataValues, labels) => {
  if (dogePolarAreaChartRef.current) {
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

      dogePolarAreaChartRef.current.data.datasets[0].data = dataValues;
      dogePolarAreaChartRef.current.data.labels = labels;
      dogePolarAreaChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
      dogePolarAreaChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
      dogePolarAreaChartRef.current.update();
  }
};

const updateGroupedChart = (datasets, labels, yAxisMax, useSingleAxis) => {
  if (dogeGroupedBarChartRef.current) {
    dogeGroupedBarChartRef.current.data.datasets = datasets;
    dogeGroupedBarChartRef.current.data.labels = labels;

    if (useSingleAxis) {
      // Configure a single y-axis
      dogeGroupedBarChartRef.current.options.scales['y-axis-1'] = {
        type: 'linear',
        position: 'left',
        max: yAxisMax,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Market Cap / Total Volume (USD)'
        },
        grid: {
          drawOnChartArea: true, 
        }
      };

      // Remove the second y-axis
      delete dogeGroupedBarChartRef.current.options.scales['y-axis-2'];

    } else {
      // Restore dual y-axes configuration with grid lines only on y-axis-1
      dogeGroupedBarChartRef.current.options.scales['y-axis-1'] = {
        type: 'linear',
        position: 'left',
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Value (USD)'
        },
        grid: {
          drawOnChartArea: true, 
        }
      };

      dogeGroupedBarChartRef.current.options.scales['y-axis-2'] = {
        type: 'linear',
        position: 'right',
        ticks: {
          callback: function(value) {
            return value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Volume / Market Cap'
        },
        grid: {
          drawOnChartArea: false, 
        }
      };
    }

    dogeGroupedBarChartRef.current.update();
  }
};

const handleLineQueryChange = (e) => {
  const query = e.target.value;
  setLineQuery(query);
  handleLineQuery(query);
  handleFilterChange(query);
  setShowLineChartInfo(query === 'market_cap_vs_circulating_supply');
};

const handleBarQueryChange = (e) => {
  const query = e.target.value;
  setBarQuery(query);
  handleBarChartQuery(query);
  handleFilterChange(query);
  setShowWaterfallBarChartInfo(query === 'valuation_metrics');
};

const handlePolarQueryChange = (e) => {
  const query = e.target.value;
  setPolarQuery(query);
  handlePolarQuery(query);
  handleFilterChange(query);
  setShowPolarChartInfo(query === 'market_cap_vs_total_volume');
};

const handleGroupedOrStackedQueryChange = (e) => {
  const query = e.target.value;
  setGroupedQuery(query);
  handleGroupedQuery(query);
  handleFilterChange(query); 
  setShowGroupedChartInfo(query === 'grouped_metrics');

  setStackedQuery(query);
  handleFilterChange(query);
  setShowStackedChartInfo(query === 'full_metrics_stacked');
};

const [showPolarChartInfo, setShowPolarChartInfo] = useState(false);
const [showStackedChartInfo, setShowStackedChartInfo] = useState(false);
const [showLineChartInfo, setShowLineChartInfo] = useState(false);
const [showWaterfallBarChartInfo, setShowWaterfallBarChartInfo] = useState(false);
const [showGroupedChartInfo, setShowGroupedChartInfo] = useState(false);

 const toggleLineChartInfo = () => setShowLineChartInfo((prev) => !prev);
 const toggleWaterfallBarChartInfo = () => setShowWaterfallBarChartInfo((prev) => !prev);
 const togglePolarChartInfo = () => setShowPolarChartInfo((prev) => !prev);
 const toggleStackedChartInfo = () => setShowStackedChartInfo((prev) => !prev);
 const toggleGroupedChartInfo = () => setShowGroupedChartInfo((prev) => !prev);

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

// State for Grouped Bar Chart Insights
const [currentGroupedBarInsight, setCurrentGroupedBarInsight] = useState(0);
const [groupedBarInsightContent, setGroupedBarInsightContent] = useState(null);
const validGroupedBarInsights = groupedInsights.split('\n').filter(insight => insight.trim() !== "");

useEffect(() => {
  setGroupedBarInsightContent(
    validGroupedBarInsights.length > 0 ? validGroupedBarInsights[currentGroupedBarInsight] : null
  );
}, [currentGroupedBarInsight, validGroupedBarInsights]);

const handleNextGroupedBarInsight = () => {
  const nextIndex = currentGroupedBarInsight + 1;
  setCurrentGroupedBarInsight(nextIndex >= validGroupedBarInsights.length ? 0 : nextIndex);
};

const handlePrevGroupedBarInsight = () => {
  const prevIndex = currentGroupedBarInsight - 1;
  setCurrentGroupedBarInsight(prevIndex < 0 ? validGroupedBarInsights.length - 1 : prevIndex);
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
const validWaterfallBarInsights = waterfallInsights.split('\n').filter(insight => insight.trim() !== "");

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

// State for Stacked Bar Chart Insights
const [currentStackedInsight, setCurrentStackedInsight] = useState(0);
const [stackedInsightContent, setStackedInsightContent] = useState(null);
const validStackedInsights = stackedInsights.split('\n').filter(insight => insight.trim() !== "");

useEffect(() => {
  setStackedInsightContent(validStackedInsights.length > 0 ? validStackedInsights[currentStackedInsight] : null);
}, [currentStackedInsight, validStackedInsights]);

const handleNextStackedInsight = () => {
  const nextIndex = currentStackedInsight + 1;
  setCurrentStackedInsight(nextIndex >= validStackedInsights.length ? 0 : nextIndex);
};

const handlePrevStackedInsight = () => {
  const prevIndex = currentStackedInsight - 1;
  setCurrentStackedInsight(prevIndex < 0 ? validStackedInsights.length - 1 : prevIndex);
};



  return (
  <div className="dogepage-wrapper">
    <h1 className="page-title">Dogecoin Visualization's</h1>
    <div className="faq-icon" onClick={() => window.location.href = 'https://revised-backend-refined.onrender.com/faq'}>
    <i className="bi bi-question-circle" title="Off to FAQ"></i>
    </div>

    <div className="dogechart-container">
    <div className="dogequery-container">
                <select value={lineQuery} onChange={handleLineQueryChange}>
                    <option value="" hidden>📉 Line Chart </option>
                    <option value="market_cap_vs_circulating_supply"> 📉 Market Cap vs. Circulating Supply </option>
                    <option value="full_metrics_line"> 📉 Reset </option>
                </select>
    </div>

    <div className="dogequery-container">
        <select 
            value={groupedQuery || stackedQuery} 
            onChange={handleGroupedOrStackedQueryChange}
          >
            <option value="" hidden>📶🏗️ Grouped / Stacked Chart </option>
            <option value="grouped_metrics">📶 Market Cap vs. Volume</option>
            <option value="full_metrics_bar">📶🏗️ Reset </option>
            <option value="full_metrics_stacked">🏗️ Stacked Metrics </option>
          </select>
   </div>

    <div className="dogequery-container">
                <select value={barQuery} onChange={handleBarQueryChange}>
                    <option value="" hidden>📊 Waterfall Bar Chart </option>
                    <option value="valuation_metrics"> 📊 Performance Metrics </option>
                    <option value="full_metrics_bar"> 📊 Reset </option>
                </select>
    </div>

    <div className="dogequery-container">
                <select value={polarQuery} onChange={handlePolarQueryChange}>
                    <option value="" hidden>❄️ Polar Chart </option>
                    <option value="market_cap_vs_total_volume"> ❄️ Market Cap vs. Total Volume </option>
                    <option value="full_metrics_polar"> ❄️ Reset </option>
                </select>
    </div>
    
   {/* Polar Area Chart */}
   <div className="dogechart-wrapper bar">
        <div className="dogechart-header">
          <h2>Polar Area Chart for Dogecoin KPIs</h2>
          {polarQuery === 'market_cap_vs_total_volume' && (
            <span className="dogeinfo-icon" title="More Information">🤔</span>
          )}
        </div>
        <canvas id="dogePolarAreaChart"></canvas>
        {loadingPolar ? (
          <div className="dogeloading-indicator">Fetching insights<LoadingEllipsis /></div>
        ) : (
          polarInsights && validPolarInsights.length > 0 && polarQuery !== 'full_metrics_polar' &&  (
            <div className="dogechart-details">
              <div key={currentPolarInsight} className="dogechart-item">
                <div className="dogechart-header">
                  <span>{currentPolarInsight + 1}. </span>
                </div>
                <div className="dogechart-content">
                  {polarInsightContent ? polarInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
                </div>
                <div className="dogeinsight-navigation">
                  <span className="dogenav-arrow" onClick={handlePrevPolarInsight}>{'<'}</span>
                  <span className="dogenav-arrow" onClick={handleNextPolarInsight}>{'>'}</span>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Line Graph */}
      <div className="dogechart-wrapper bar">
        <div className="dogechart-header">
          <h2>Line Graph for Dogecoin Metrics</h2>
          {lineQuery === 'market_cap_vs_circulating_supply' && (
            <span className="dogeinfo-icon" title="More Information">🤔</span>
          )}
        </div>
        <canvas id="dogeLineChart"></canvas>
        {loadingLine ? (
          <div className="loading-indicator">Fetching insights<LoadingEllipsis /></div>
        ) : (
          lineInsights && validLineInsights.length > 0 && lineQuery !== 'full_metrics_line' &&  (
            <div className="dogechart-details">
              <div key={currentLineInsight} className="dogechart-item">
                <div className="dogechart-header">
                  <span>{currentLineInsight + 1}. </span>
                </div>
                <div className="dogechart-content">
                  {lineInsightContent ? lineInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
                </div>
                <div className="dogeinsight-navigation">
                  <span className="dogenav-arrow" onClick={handlePrevLineInsight}>{'<'}</span>
                  <span className="dogenav-arrow" onClick={handleNextLineInsight}>{'>'}</span>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Waterfall Bar Chart */}
      <div className="dogechart-wrapper bar">
        <div className="dogechart-header">
          <h2>Waterfall Bar Chart for Dogecoin Metrics</h2>
          {barQuery === 'valuation_metrics' && (
            <span className="dogeinfo-icon" title="More Information">🤔</span>
          )}
        </div>
        <canvas id="dogeWaterfallBarChart"></canvas>
        {loadingWaterfall ? (
          <div className="loading-indicator">Fetching insights<LoadingEllipsis /></div>
        ) : (
          waterfallInsights && validWaterfallBarInsights.length > 0 && barQuery !== 'full_metrics_bar' &&  (
            <div className="dogechart-details">
              <div key={currentWaterfallBarInsight} className="dogechart-item">
                <div className="dogechart-header">
                  <span>{currentWaterfallBarInsight + 1}. </span>
                </div>
                <div className="dogechart-content">
                  {waterfallBarInsightContent ? waterfallBarInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
                </div>
                <div className="dogeinsight-navigation">
                  <span className="dogenav-arrow" onClick={handlePrevWaterfallBarInsight}>{'<'}</span>
                  <span className="dogenav-arrow" onClick={handleNextWaterfallBarInsight}>{'>'}</span>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Grouped Bar Chart */}
      <div className="dogechart-wrapper bar">
        <div className="dogechart-header">
          <h2>Grouped Bar Chart for Dogecoin Metrics</h2>
          {groupedQuery === 'grouped_metrics' && (
            <span className="dogeinfo-icon" title="More Information">🤔</span>
          )}
        </div>
        <canvas id="dogeGroupedBarChart"></canvas>
        {loadingGrouped ? (
          <div className="dogeloading-indicator">Fetching insights<LoadingEllipsis /></div>
        ) : (
          groupedInsights && validGroupedBarInsights.length > 0 && groupedQuery !== 'full_metrics_grouped' &&  (
            <div className="dogechart-details">
              <div key={currentGroupedBarInsight} className="dogechart-item">
                <div className="dogechart-header">
                  <span>{currentGroupedBarInsight + 1}. </span>
                </div>
                <div className="dogechart-content">
                  {groupedBarInsightContent ? groupedBarInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
                </div>
                <div className="dogeinsight-navigation">
                  <span className="dogenav-arrow" onClick={handlePrevGroupedBarInsight}>{'<'}</span>
                  <span className="dogenav-arrow" onClick={handleNextGroupedBarInsight}>{'>'}</span>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Stacked Chart */}
      <div className="dogechart-wrapper bar">
        <div className="dogechart-header">
          <h2>Stacked Chart for Dogecoin Metrics</h2>
          {stackedQuery === 'full_metrics_stacked' && (
            <span className="dogeinfo-icon" title="More Information"></span>
          )}
        </div>
        <canvas id="dogeStackedBarChart"></canvas>
        {loadingStacked ? (
          <div className="dogeloading-indicator">Fetching insights<LoadingEllipsis /></div>
        ) : (
          stackedInsights && validStackedInsights.length > 0 && groupedQuery !== 'full_metrics_grouped' &&  (
            <div className="dogechart-details">
              <div key={currentStackedInsight} className="dogechart-item">
                <div className="dogechart-header">
                  <span>{currentStackedInsight + 1}. </span>
                </div>
                <div className="dogechart-content">
                  {stackedInsightContent ? stackedInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
                </div>
                <div className="dogeinsight-navigation">
                  <span className="dogenav-arrow" onClick={handlePrevStackedInsight}>{'<'}</span>
                  <span className="dogenav-arrow" onClick={handleNextStackedInsight}>{'>'}</span>
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

export default DogeCharts;
