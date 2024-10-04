import React, { useEffect, useState, useRef } from "react";
import "./Polkadot.css";
import Chart from "chart.js/auto";
import "./Questionmark.css";

const PolkadotCharts = () => {
  const [polkadotData, setPolkadotData] = useState(null);
  const polPolarAreaChartRef = useRef(null);
  const polDoughnutChartRef = useRef(null);
  const polCombinedChartRef = useRef(null);
  const polLineChartRef = useRef(null);
  const polStackedBarChartRef = useRef(null);
  const [lineQuery, setLineQuery] = useState("");
  const [polarQuery, setPolarQuery] = useState("");
  const [doughnutQuery, setDoughnutQuery] = useState("");
  const [combinedQuery, setCombinedQuery] = useState("");
  const [stackedQuery, setStackedQuery] = useState("");
  const [polarInsights, setPolarInsights] = useState("");
  const [doughnutInsights, setDoughnutInsights] = useState("");
  const [lineInsights, setLineInsights] = useState("");
  const [priceChangeInsights, setPriceChangeInsights] = useState("");
  const [stackedInsights, setStackedInsights] = useState("");

  const [loadingPolar, setLoadingPolar] = useState(false);
  const [loadingPriceChange, setLoadingPriceChange] = useState(false);
  const [loadingLine, setLoadingLine] = useState(false);
  const [loadingStacked, setLoadingStacked] = useState(false);
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
    if (!polkadotData || typeof polkadotData !== 'object') {
      console.error('Invalid or missing Polkadot data');
      return;
    }

    let filteredData;
    let setInsights;
    let setLoading
  
    switch (selectedRelationship) {
      case 'market_cap_vs_total_volume':
        filteredData = { market_cap: polkadotData.market_cap, total_volume: polkadotData.total_volume };
        setInsights = setPolarInsights;
        setLoading = setLoadingPolar;
        break;
      case 'market_cap_vs_circulating_supply':
        filteredData = { market_cap: polkadotData.market_cap, circulating_supply: polkadotData.circulating_supply };
        setInsights = setLineInsights;
        setLoading = setLoadingLine;
        break;
      case 'market_cap_vs_volume_market_cap_change':
          filteredData = { market_cap: polkadotData.market_cap, total_volume: polkadotData.total_volume, market_cap_change_percentage_24h: polkadotData.market_cap_change_percentage_24h };
          setInsights = setPriceChangeInsights;
          setLoading = setLoadingPriceChange;
        break;
        case 'volume_vs_supply':
          filteredData = { market_cap: polkadotData.market_cap, circulating_supply: polkadotData.circulating_supply, market_cap: polkadotData.total_supply };
          setInsights = setDoughnutInsights;
          setLoading = setLoadingDoughnut;
        break;
        case 'full_metrics_stacked':
          filteredData = [
            {
              category: 'Market Cap & Total Volume',
              total_volume: polkadotData.total_volume,
              market_cap: polkadotData.market_cap
            },
            {
              category: 'Market Cap Change & Price Change',
              market_cap_change_24h: polkadotData.market_cap_change_24h,
              price_change_24h: polkadotData.price_change_24h
            },
            {
              category: 'Circulating Supply & Total Supply',
              circulating_supply: polkadotData.circulating_supply,
              total_supply: polkadotData.total_supply
            }
          ];
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
        const polkadotFilteredData = data.filter(item => item.symbol === 'dot')[0];
        setPolkadotData(polkadotFilteredData);

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
        polkadotFilteredData.current_price,
        polkadotFilteredData.market_cap,
        polkadotFilteredData.total_volume,
        polkadotFilteredData.circulating_supply,
        polkadotFilteredData.total_supply,
        polkadotFilteredData.price_change_24h,
        polkadotFilteredData.market_cap_change_24h
      ];

          // Polar Area Chart for Tether Distribution Metrics
          const polPolarAreaCtx = document.getElementById('polPolarAreaChart').getContext('2d');

          const maxValue = Math.max(...dataValues);
          createChart(polPolarAreaChartRef, polPolarAreaCtx, {
            type: 'polarArea',
            data: {
              labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'],
              datasets: [{
                label: 'Polkadot Distribution Metrics',
                data: [
                  polkadotFilteredData.current_price,
                  polkadotFilteredData.market_cap,
                  polkadotFilteredData.total_volume,
                  polkadotFilteredData.circulating_supply
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
const polDoughnutCtx = document.getElementById('polDoughnutChart').getContext('2d');
createChart(polDoughnutChartRef, polDoughnutCtx, {
  type: 'doughnut',
  data: {
    labels: ['Market Cap', 'Total Volume', 'Circulating Supply', 'Total Supply'],
    datasets: [{
      data: [
        polkadotFilteredData.market_cap,
        polkadotFilteredData.total_volume,
        polkadotFilteredData.circulating_supply,
        polkadotFilteredData.total_supply
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

//Combined Line and Bar Graphs for Polkadot
const polCombinedChartCtx = document.getElementById('polCombinedChart').getContext('2d');
createChart(polCombinedChartRef, polCombinedChartCtx, {
  type: 'bar',
  data: {
    labels: ['Market Cap', 'Total Volume', 'Circulating Supply'],
    datasets: [
      {
        type: 'bar',
        label: 'Market Cap',
        data: [polkadotFilteredData.market_cap, null, null],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y-axis-1'
      },
      {
        type: 'bar',
        label: 'Total Volume',
        data: [null, polkadotFilteredData.total_volume, null],
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        yAxisID: 'y-axis-1'
      },
      {
        type: 'bar',
        label: 'Circulating Supply',
        data: [null, null, polkadotFilteredData.circulating_supply],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y-axis-1'
      },
      {
        type: 'line',
        label: 'Price Change (%)',
        data: [
          polkadotFilteredData.price_change_percentage_24h,
          polkadotFilteredData.price_change_percentage_24h,
          polkadotFilteredData.price_change_percentage_24h
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
          polkadotFilteredData.market_cap_change_percentage_24h,
          polkadotFilteredData.market_cap_change_percentage_24h,
          polkadotFilteredData.market_cap_change_percentage_24h
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
            const labels = ['Market Cap', 'Total Volume', 'Circulating Supply'];
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

// Line Chart for Polkadot Metrics Over Time
const polLineChartCtx = document.getElementById('polLineChart').getContext('2d');
createChart(polLineChartRef, polLineChartCtx, {
  type: 'line',
  data: {
    labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'], 
    datasets: [
      {
        label: 'Metrics',
        data: [
          polkadotFilteredData.current_price,
          polkadotFilteredData.market_cap,
          polkadotFilteredData.total_volume,
          polkadotFilteredData.circulating_supply
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

//Polkadot's stacked bar chart comparing metrics
const polStackedBarChartCtx = document.getElementById('polStackedBarChart').getContext('2d');
createChart(polStackedBarChartRef, polStackedBarChartCtx, {
  type: 'bar',
  data: {
    labels: ['Market Cap & Total Volume', 'Market Cap Change & Price Change', 'Circulating Supply & Total Supply'],
    datasets: [
      {
        label: 'Total Volume',
        data: [
          polkadotFilteredData.total_volume,
          0,
          0
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
      {
        label: 'Market Cap',
        data: [
          polkadotFilteredData.market_cap,
          0,
          0
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Market Cap Change (24h)',
        data: [
          0,
          polkadotFilteredData.market_cap_change_24h,
          0
        ],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Price Change (24h)',
        data: [
          0,
          polkadotFilteredData.price_change_24h,
          0
        ],
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      },
      {
        label: 'Circulating Supply',
        data: [
          0,
          0,
          polkadotFilteredData.circulating_supply
        ],
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      },
      {
        label: 'Total Supply',
        data: [
          0,
          0,
          polkadotFilteredData.total_supply
        ],
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }
    ]
  },
  options: {
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Metrics'
        }
      },
      y: {
        stacked: true,
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
        position: 'top'
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(tooltipItem) {
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
      polDoughnutChartRef.current &&  polDoughnutChartRef.current.destroy();
      polPolarAreaChartRef.current &&  polPolarAreaChartRef.current.destroy();
      polCombinedChartRef.current &&  polCombinedChartRef.current.destroy();
      polLineChartRef.current &&  polLineChartRef.current.destroy();
      polStackedBarChartRef.current &&  polStackedBarChartRef.current.destroy();
    };
  }, []);

  const handleLineQuery = (query) => {
    if (polkadotData) {
      let lineLabels = [];
      let lineDataValues = [];
  
      switch (query) {
        case "market_cap_vs_circulating_supply":
          lineLabels = ['Market Cap', 'Circulating Supply'];
          lineDataValues = [polkadotData.market_cap, polkadotData.circulating_supply];
          break;
        case "full_metrics_line":
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            polkadotData.current_price,
            polkadotData.market_cap,
            polkadotData.total_volume,
            polkadotData.circulating_supply
          ];
          break;
        default:
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            polkadotData.current_price,
            polkadotData.market_cap,
            polkadotData.total_volume,
            polkadotData.circulating_supply
          ];
      }
  
      updateLineChart(lineDataValues, lineLabels);
    }
};

const handlePolarQuery = (query) => {
  if (polkadotData) {
    let polarLabels = [];
    let polarDataValues = [];

    switch (query) {
      case "market_cap_vs_total_volume":
        polarLabels = ['Market Cap', 'Total Volume'];
        polarDataValues = [polkadotData.market_cap, polkadotData.total_volume];
        break;
      case "full_metrics_polar":
        polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
        polarDataValues = [
      polkadotData.current_price,
      polkadotData.market_cap,
      polkadotData.total_volume,
      polkadotData.circulating_supply
        ];
        break;
      default:
        // default case should handle fallback
        polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
        polarDataValues = [
          polkadotData.current_price,
          polkadotData.market_cap,
          polkadotData.total_volume,
          polkadotData.circulating_supply
        ];
    }

    updatePolarChart(polarDataValues, polarLabels);
  }
};

const handleCombinedQuery = (query) => {
  if (polkadotData) {
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
            data: [polkadotData.market_cap, null],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'bar',
            label: 'Total Volume',
            data: [null, polkadotData.total_volume],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'line',
            label: 'Price Change (%)',
            data: [polkadotData.price_change_percentage_24h, polkadotData.price_change_percentage_24h],
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
              data: [polkadotData.market_cap, null],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              yAxisID: 'y-axis-1'
            },
            {
              type: 'bar',
              label: 'Total Volume',
              data: [null, polkadotData.total_volume],
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1,
              yAxisID: 'y-axis-1'
            },
            {
              type: 'line',
              label: 'Market Cap Change (%)',
              data: [polkadotData.market_cap_change_percentage_24h, polkadotData.market_cap_change_percentage_24h],
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
            data: [polkadotData.market_cap, null, null],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'bar',
            label: 'Total Volume',
            data: [null, polkadotData.total_volume, null],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'bar',
            label: 'Market Cap Change 24h',
            data: [null, null, polkadotData.market_cap_change_24h],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'line',
            label: 'Price Change (%)',
            data: [polkadotData.price_change_percentage_24h, polkadotData.price_change_percentage_24h, polkadotData.price_change_percentage_24h],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y-axis-2'
          },
          {
            type: 'line',
            label: 'Market Cap Change (%)',
            data: [polkadotData.market_cap_change_percentage_24h, polkadotData.market_cap_change_percentage_24h, polkadotData.market_cap_change_percentage_24h],
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

const handleStackedBarQuery = (query) => {
  let stackedBarDataValues = [];

  switch (query) {
    case "full_metrics_stacked":
      stackedBarDataValues = [
        {
          label: 'Market Cap & Total Volume',
          data: [
            polkadotData.market_cap,  
            0,                     
            0                       
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Total Volume',
          data: [
            polkadotData.total_volume, 
            0,                       
            0                        
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        },
        {
          label: 'Market Cap Change & Price Change',
          data: [
            0,                                  
            polkadotData.market_cap_change_24h,    
            0                                   
          ],
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        },
        {
          label: 'Price Change',
          data: [
            0,                                  
            polkadotData.price_change_24h,         
            0                                   
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Circulating Supply & Total Supply',
          data: [
            0,                              
            0,                              
            polkadotData.circulating_supply   
          ],
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        },
        {
          label: 'Total Supply',
          data: [
            0,                          
            0,                          
            polkadotData.total_supply      
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ];
      break;

    default:
      stackedBarDataValues = [
        {
          label: 'Market Cap',
          data: [
            polkadotData.market_cap, 
            0, 
            0
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Total Volume',
          data: [
            polkadotData.total_volume, 
            0,
            0
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ];
  }

  updateStackedBarChart(stackedBarDataValues);
};

const handleDoughnutQuery = (query) => {
  if (polkadotData) {
      let doughnutLabels = [];
      let doughnutDataValues = [];

      switch (query) {
        case "volume_vs_supply":
          doughnutLabels = ['Total Supply', 'Circulating Supply', 'Total Volume'];
          doughnutDataValues = [
              polkadotData.total_supply, 
              polkadotData.circulating_supply, 
              polkadotData.total_volume
          ];
          break;
      case "full_metrics_doughnut":
          doughnutLabels = ['Market Cap', 'Total Volume', 'Circulating Supply', 'Total Supply'];
          doughnutDataValues = [
              polkadotData.market_cap,
              polkadotData.total_volume,
              polkadotData.circulating_supply,
              polkadotData.total_supply
          ];
          break;
      default:
          // Fallback to full metrics
          doughnutLabels = ['Market Cap', 'Total Volume', 'Circulating Supply', 'Total Supply'];
          doughnutDataValues = [
              polkadotData.market_cap,
              polkadotData.total_volume,
              polkadotData.circulating_supply,
              polkadotData.total_supply
          ];
      }

      updateDoughnutChart(doughnutDataValues, doughnutLabels);
  }
};

const updateStackedBarChart = (datasets) => {
  if (polStackedBarChartRef.current) {
    polStackedBarChartRef.current.data.datasets = datasets;
    polStackedBarChartRef.current.update();
  }
};

const updatePolarChart = (dataValues, labels) => {
  if (polPolarAreaChartRef.current) {
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

      polPolarAreaChartRef.current.data.datasets[0].data = dataValues;
      polPolarAreaChartRef.current.data.labels = labels;
      polPolarAreaChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
      polPolarAreaChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
      polPolarAreaChartRef.current.update();
  }
};

  const updateLineChart = (dataValues, labels) => {
    if (polLineChartRef.current) {
      polLineChartRef.current.data.datasets[0].data = dataValues;
      polLineChartRef.current.data.labels = labels;
      polLineChartRef.current.update();
    }
  };  

  const updateCombinedChart = (combinedData) => {
    if (polCombinedChartRef.current) {
      polCombinedChartRef.current.data = combinedData;
      polCombinedChartRef.current.update();
    }
  };

  const updateDoughnutChart = (dataValues, labels) => {
    if (polDoughnutChartRef.current) {
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

        polDoughnutChartRef.current.data.datasets[0].data = dataValues;
        polDoughnutChartRef.current.data.labels = labels;
        polDoughnutChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
        polDoughnutChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
        polDoughnutChartRef.current.update();
    }
};

  const handlePolarQueryChange = (e) => {
    const query = e.target.value;
    setPolarQuery(query);
    handlePolarQuery(query);
    handleFilterChange(query); 
    setShowPolarChartInfo(query === 'market_cap_vs_total_volume');
  };

  const handleDoughnutQueryChange = (e) => {
    const query = e.target.value;
    setDoughnutQuery(query);
    handleDoughnutQuery(query);
    handleFilterChange(query); 
    setShowDoughnutChartInfo(query === 'volume_vs_supply');
};

const handleLineOrStackedQueryChange = (e) => {
  const query = e.target.value;
  setLineQuery(query);
  handleLineQuery(query);
  handleFilterChange(query); 
  setShowLineChartInfo(query === 'market_cap_vs_circulating_supply');

  setStackedQuery(query);
  handleFilterChange(query);
  setShowStackedChartInfo(query === 'full_metrics_stacked');
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
 const [showStackedChartInfo, setShowStackedChartInfo] = useState(false);
 const [showLineChartInfo, setShowLineChartInfo] = useState(false);
 const [showCombinedChartInfo, setShowCombinedChartInfo] = useState(false);


const toggleStackedBarChartInfo = () => setShowStackedChartInfo((prev) => !prev);
const toggleCombinedChartInfo = () => setShowCombinedChartInfo((prev) => !prev);
const toggleLineChartInfo = () => setShowLineChartInfo((prev) => !prev);
const togglePolarChartInfo = () => setShowPolarChartInfo((prev) => !prev);
const toggleDoughnutChartInfo = () => setShowDoughnutChartInfo((prev) => !prev);

  return (
  <div className="polkadotpage-wrapper">
    <h1 className="page-title">Polkadot Visualization's</h1>
    <div className="faq-icon" onClick={() => window.location.href = 'http://localhost:5000/faq'}>
    <i className="bi bi-question-circle" title="Off to FAQ"></i>
    </div>

    <div className="polkadotchart-container">
      <div className="polkadotquery-container">
                  <select value={polarQuery} onChange={handlePolarQueryChange}>
                      <option value="" hidden>❄️ Select Polar Chart Option</option>
                      <option value="market_cap_vs_total_volume"> ❄️ Market Cap vs. Volume </option>
                      <option value="full_metrics_polar"> ❄️ All Polar Metrics </option>
                  </select>
      </div>

      <div className="polkadotquery-container">
                  <select value={doughnutQuery} onChange={handleDoughnutQueryChange}>
                     <option value="" hidden>🍩 Select Doughnut Chart Option</option>
                     <option value="volume_vs_supply"> 🍩 Volume vs. Supply</option>
                     <option value="full_metrics_doughnut"> 🍩 All Doughnut Metrics </option>
                  </select>
      </div>

      <div className="polkadotquery-container">
          <select value={combinedQuery} onChange={handleCombinedQueryChange}>
            <option value="" hidden>🚀 Select Combined Chart Option</option>
            <option value="market_cap_vs_volume_market_cap_change"> 🚀 Market Cap / Change vs. Volume</option>
            <option value="full_metrics_combined"> 🚀 All Combined Metrics</option>
          </select>
    </div>

      <div className="dogequery-container">
        <select 
            value={lineQuery || stackedQuery} 
            onChange={handleLineOrStackedQueryChange}
          >
            <option value="" hidden>📉🏗️ Select Line or Stacked Chart Option</option>
            <option value="market_cap_vs_circulating_supply">📉 Market Cap vs. Circulating Supply</option>
            <option value="full_metrics_line">📉 All Line Metrics</option>
            <option value="full_metrics_stacked">🏗️ All Stacked Metrics</option>
          </select>
   </div>
    </div>

    <div className="polkadotchart-container">
        {/* Polar Area Chart */}
  <div className="polkadotchart-wrapper gbar">
  <div className="polkadotchart-header">
    <h2>Polar Area Chart for Polkadot KPIs</h2>
    {polarQuery === 'market_cap_vs_total_volume' && (
       <span className="polkadotinfo-icon" title="More Information">🤔</span> 
     )}
  </div>
  <canvas id="polPolarAreaChart"></canvas>
  {loadingPolar ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      polarInsights && (
        <div className="polkadotchart-details">
          <p>{polarInsights}</p>
        </div>
      )
    )}
  </div>

{/* Doughnut Chart */}
<div className="polkadotchart-wrapper gbar">
  <div className="polkadotchart-header">
    <h2>Doughnut Chart for Polkadot Metrics</h2>
    {doughnutQuery === 'volume_vs_supply' && (
        <span className="polkadotinfo-icon" title="More Information">🤔</span> 
    )}
  </div>
  <canvas id="polDoughnutChart"></canvas>
  {loadingDoughnut ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      doughnutInsights && (
        <div className="polkadotchart-details">
          <p>{doughnutInsights}</p>
        </div>
      )
    )}
  </div>

        {/* Combined Chart*/}
        <div className="polkadotchart-wrapper gbar">
          <div className="polkadotchart-header">
            <h2>Combined Bar and Line Graph Representing Polkadot's Market Volatility</h2>
            {(combinedQuery === 'market_cap_vs_volume_market_cap_change') && (
              <span className="polkadotinfo-icon" title="More Information">🤔</span> 
            )}
          </div>
          <canvas id="polCombinedChart"></canvas>
          {loadingPriceChange ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      priceChangeInsights && (
        <div className="polkadotchart-details">
          <p>{priceChangeInsights}</p>
        </div>
      )
    )}
  </div>

        {/* Line Chart */}
        <div className="polkadotchart-wrapper li">
          <div className="polkadotchart-header">
            <h2>Line Graph for Polkadot Metrics</h2>
            {lineQuery === 'market_cap_vs_circulating_supply' && (
              <span className="polkadotinfo-icon" title="More Information">🤔</span> 
            )}
          </div>
          <canvas id="polLineChart"></canvas>
          {loadingLine ? (
          <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
        </div>
    ) : (
    lineInsights && (
        <div className="polkadotchart-details">
          <p>{lineInsights}</p>
        </div>
      )
    )}
  </div>

        {/* Stacked Bar Chart*/}
        <div className="polkadotchart-wrapper stacks">
          <div className="polkadotchart-header">
            <h2>Stacked Bar Chart for Polkadot Metrics</h2>
            {stackedQuery === 'full_metrics_stacked' && (
              <span className="polkadotinfo-icon" title="More Information">🤔</span> 
            )}
          </div>
          <canvas id="polStackedBarChart"></canvas>
          {loadingStacked ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      stackedInsights && (
        <div className="polkadotchart-details">
          <p>{stackedInsights}</p>
        </div>
      )
    )}
        </div>
      </div>
    </div>
  );
};

export default PolkadotCharts;
