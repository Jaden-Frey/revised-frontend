import React, { useEffect, useState, useRef } from "react";
import "./Bnb.css";
import Chart from "chart.js/auto";
import "./Questionmark.css";

const BnbCharts = () => {
  const [bnbData, setBnbData] = useState(null);
  const bnbPolarAreaChartRef = useRef(null);
  const bnbHeatmapChartRef = useRef(null);
  const bnbScatterChartRef = useRef(null);
  const bnbCombinedChartRef = useRef(null);
  const bnbLineChartRef = useRef(null);
  const [lineQuery, setLineQuery] = useState("");
  const [polarQuery, setPolarQuery] = useState("");
  const [scatterQuery, setScatterQuery] = useState("");
  const [combinedQuery, setCombinedQuery] = useState("");
  const [polarInsights, setPolarInsights] = useState("");
  const [scatterInsights, setScatterInsights] = useState("");
  const [lineInsights, setLineInsights] = useState("");
  const [priceChangeInsights, setPriceChangeInsights] = useState('');     

  const [loadingPolar, setLoadingPolar] = useState(false);
  const [loadingScatter, setLoadingScatter] = useState(false);
  const [loadingLine, setLoadingLine] = useState(false);
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
    if (!bnbData || typeof bnbData !== 'object') {
      console.error('Invalid or missing Bitcoin data');
      return;
    }

    let filteredData;
    let setInsights;
    let setLoading;

    switch (selectedRelationship) {
      case 'market_cap_vs_volume':
        filteredData = { market_cap: bnbData.market_cap, total_volume: bnbData.total_volume };
        setInsights = setPolarInsights;
        setLoading = setLoadingPolar;
        break;
      case 'market_cap_vs_circulating_supply':
        filteredData = { market_cap: bnbData.market_cap, circulating_supply: bnbData.circulating_supply };
        setInsights = setLineInsights;
        setLoading = setLoadingLine;
        break;
        case 'market_cap_vs_volume_market_cap_change':
          filteredData = { 
            market_cap: bnbData.market_cap, 
            total_volume: bnbData.total_volume, 
            market_cap_change_24h: bnbData.market_cap_change_percentage_24h 
          };
        setInsights = setPriceChangeInsights;
        setLoading = setLoadingPriceChange;
        break;
      case 'market_cap_vs_volume_vs_price':
        filteredData = {
          market_cap: bnbData.market_cap,
          total_volume: bnbData.total_volume,
          current_price: bnbData.current_price,
        };
        setInsights = setScatterInsights;
        setLoading = setLoadingScatter;
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
        const bnbFilteredData = data.filter(item => item.symbol === 'bnb')[0];
        setBnbData(bnbFilteredData);

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
          bnbFilteredData.current_price,
          bnbFilteredData.market_cap,
          bnbFilteredData.total_volume,
          bnbFilteredData.circulating_supply,
          bnbFilteredData.total_supply,
          bnbFilteredData.market_cap_change_24h,
          bnbFilteredData.price_change_percentage_24h,
          bnbFilteredData.market_cap_change_percentage_24h
        ];

          // Polar Area Chart for BNB Distribution Metrics
          const bnbPolarAreaCtx = document.getElementById('bnbPolarAreaChart').getContext('2d');

          const maxValue = Math.max(...dataValues);
          createChart(bnbPolarAreaChartRef, bnbPolarAreaCtx, {
            type: 'polarArea',
            data: {
              labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'],
              datasets: [{
                label: 'Bnb Distribution Metrics',
                data: [
                  bnbFilteredData.current_price,
                  bnbFilteredData.market_cap,
                  bnbFilteredData.total_volume,
                  bnbFilteredData.circulating_supply,
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

// Heatmap for BNB metrics
const bnbHeatmapCtx = document.getElementById('bnbHeatmapChart').getContext('2d');

const bnbData = [
  { name: 'BNB', price_change_percentage_24h: bnbFilteredData.price_change_percentage_24h }
];

const isPositiveChange = bnbData[0].price_change_percentage_24h >= 0;
const absPriceChange = Math.abs(bnbData[0].price_change_percentage_24h);
const dynamicMax = Math.ceil(absPriceChange / 5) * 5;

const positiveBaseColor = 'rgba(0, 200, 83'; 
const negativeBaseColor = 'rgba(255, 51, 51'; 

const baseColor = isPositiveChange ? positiveBaseColor : negativeBaseColor;
const backgroundColor = `${baseColor}, ${0.2 + (absPriceChange / dynamicMax) * 0.2})`;
const borderColor = `${baseColor}, 1)`; 

createChart(bnbHeatmapChartRef, bnbHeatmapCtx, {
  type: 'bar',
  data: {
    labels: ['BNB'],
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
        title: { display: true, text: 'BNB Metrics' }
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
            return `${label}: ${value}% (${bnbData[0].name})`; 
          },
          afterLabel: function(tooltipItem) {
            const value = bnbData[0].price_change_percentage_24h;
            return `Price Change: ${value > 0 ? '+' : ''}${value}%`; 
          }
        }
      }
    }
  }
});


          
// Bnb Scatter Plot Chart
const bnbScatterCtx = document.getElementById('bnbScatterChart').getContext('2d');
createChart(bnbScatterChartRef, bnbScatterCtx, {
  type: 'scatter',
  data: {
    datasets: [
      {
        label: 'Market Cap',
        data: [{ x: 1, y: bnbFilteredData.market_cap || 0 }],
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Total Volume',
        data: [{ x: 2, y: bnbFilteredData.total_volume || 0 }],
        backgroundColor: 'rgba(255, 206, 86, 0.2)', // Yellow
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Current Price',
        data: [{ x: 3, y: bnbFilteredData.current_price || 0 }],
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Teal
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Circulating Supply',
        data: [{ x: 4, y: bnbFilteredData.circulating_supply || 0 }],
        backgroundColor: 'rgba(153, 102, 255, 0.2)', // Purple
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'ATH',
        data: [{ x: 5, y: bnbFilteredData.ath || 0 }],
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Red
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'ATL',
        data: [{ x: 6, y: bnbFilteredData.atl || 0 }],
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
          bnbFilteredData.market_cap || 0,
          bnbFilteredData.total_volume || 0,
          bnbFilteredData.ath || 0,
          bnbFilteredData.atl || 0
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

//Combined Line and Bar Graphs for BNB
const bnbCombinedChartCtx = document.getElementById('bnbCombinedChart').getContext('2d');
createChart(bnbCombinedChartRef, bnbCombinedChartCtx, {
  type: 'bar',
  data: {
    labels: ['Market Cap', 'Total Volume', 'Market Cap Change 24h'],
    datasets: [
      {
        type: 'bar',
        label: 'Market Cap',
        data: [bnbFilteredData.market_cap, null, null],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y-axis-1'
      },
      {
        type: 'bar',
        label: 'Total Volume',
        data: [null, bnbFilteredData.total_volume, null],
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        yAxisID: 'y-axis-1'
      },
      {
        type: 'bar',
        label: 'Market Cap Change 24h',
        data: [null, null, bnbFilteredData.market_cap_change_24h],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y-axis-1'
      },
      {
        type: 'line',
        label: 'Price Change (%)',
        data: [
          bnbFilteredData.price_change_percentage_24h,
          bnbFilteredData.price_change_percentage_24h,
          bnbFilteredData.price_change_percentage_24h
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
          bnbFilteredData.market_cap_change_percentage_24h,
          bnbFilteredData.market_cap_change_percentage_24h,
          bnbFilteredData.market_cap_change_percentage_24h
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

// Line Chart for BNB Metrics Over Time
const bnbLineChartCtx = document.getElementById('bnbLineChart').getContext('2d');
createChart(bnbLineChartRef, bnbLineChartCtx, {
  type: 'line',
  data: {
    labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'], 
    datasets: [
      {
        label: 'BNB Metrics',
        data: [
          bnbFilteredData.current_price,
          bnbFilteredData.market_cap,
          bnbFilteredData.total_volume,
          bnbFilteredData.circulating_supply
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
      bnbScatterChartRef.current && bnbScatterChartRef.current.destroy();
      bnbHeatmapChartRef.current &&  bnbHeatmapChartRef.current.destroy();
      bnbPolarAreaChartRef.current &&  bnbPolarAreaChartRef.current.destroy();
      bnbCombinedChartRef.current &&  bnbCombinedChartRef.current.destroy();
      bnbLineChartRef.current &&  bnbLineChartRef.current.destroy();
    };
  }, []);

  const handlePolarQuery = (query) => {
    if(bnbData) {
      let polarLabels = [];
      let polarDataValues = [];
  
      switch (query) {
        case "market_cap_vs_volume":
          polarLabels = ['Market Cap', 'Total Volume'];
          polarDataValues = [bnbData.market_cap, bnbData.total_volume];
          break;
        case "full_metrics_polar":
          polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          polarDataValues = [
        bnbData.current_price,
        bnbData.market_cap,
        bnbData.total_volume,
        bnbData.circulating_supply
          ];
          break;
        default:
          // default case should handle fallback
          polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          polarDataValues = [
        bnbData.current_price,
        bnbData.market_cap,
        bnbData.total_volume,
        bnbData.circulating_supply
          ];
      }
  
      updatePolarChart(polarDataValues, polarLabels);
    }
  };

  const handleLineQuery = (query) => {
    if (bnbData) {
      let lineLabels = [];
      let lineDataValues = [];
  
      switch (query) {
        case "market_cap_vs_circulating_supply":
          lineLabels = ['Market Cap', 'Circulating Supply'];
          lineDataValues = [bnbData.market_cap, bnbData.circulating_supply];
          break;
        case "full_metrics_line":
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            bnbData.current_price,
            bnbData.market_cap,
            bnbData.total_volume,
            bnbData.circulating_supply
          ];
          break;
        default:
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            bnbData.current_price,
            bnbData.market_cap,
            bnbData.total_volume,
            bnbData.circulating_supply
          ];
      }
  
      updateLineChart(lineDataValues, lineLabels);
    }
};

const handleScatterQuery = (query) => {
  if (bnbData) {
    let scatterLabels = [];
    let scatterDataValues = [];

    switch (query) {
      case "market_cap_vs_volume_vs_price":
        scatterLabels = ['Market Cap', 'Total Volume', 'Current Price'];
        scatterDataValues = [
          [{ x: 1, y: bnbData.market_cap }],
          [{ x: 2, y: bnbData.total_volume }],
          [{ x: 3, y: bnbData.current_price }]
        ];
        break;
      case "full_metrics_scatter":
        scatterLabels = [
          'Market Cap', 'Total Volume', 'Current Price',
          'Circulating Supply', 'ATH', 'ATL'
        ];
        scatterDataValues = [
          [{ x: 1, y: bnbData.market_cap }],
          [{ x: 2, y: bnbData.total_volume }],
          [{ x: 3, y: bnbData.current_price }],
          [{ x: 4, y: bnbData.circulating_supply }],
          [{ x: 5, y: bnbData.ath }],
          [{ x: 6, y: bnbData.atl }]
        ];
        break;
      default:
        // Default to full metrics if no match
        scatterLabels = [
          'Market Cap', 'Total Volume', 'Current Price',
          'Circulating Supply', 'ATH', 'ATL'
        ];
        scatterDataValues = [
          [{ x: 1, y: bnbData.market_cap }],
          [{ x: 2, y: bnbData.total_volume }],
          [{ x: 3, y: bnbData.current_price }],
          [{ x: 4, y: bnbData.circulating_supply }],
          [{ x: 5, y: bnbData.ath }],
          [{ x: 6, y: bnbData.atl }]
        ];
    }

    updateScatterChart(scatterDataValues, scatterLabels);
  }
};

  const handleCombinedQuery = (query) => {
    if (bnbData) {
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
              data: [bnbData.market_cap, null],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              yAxisID: 'y-axis-1'
            },
            {
              type: 'bar',
              label: 'Total Volume',
              data: [null, bnbData.total_volume],
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1,
              yAxisID: 'y-axis-1'
            },
            {
              type: 'line',
              label: 'Price Change (%)',
              data: [bnbData.price_change_percentage_24h, bnbData.price_change_percentage_24h],
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
                data: [bnbData.market_cap, null],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                yAxisID: 'y-axis-1'
              },
              {
                type: 'bar',
                label: 'Total Volume',
                data: [null, bnbData.total_volume],
                backgroundColor: 'rgba(255, 206, 86, 0.2)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                yAxisID: 'y-axis-1'
              },
              {
                type: 'line',
                label: 'Market Cap Change (%)',
                data: [bnbData.market_cap_change_percentage_24h, bnbData.market_cap_change_percentage_24h],
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
              data: [bnbData.market_cap, null, null],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              yAxisID: 'y-axis-1'
            },
            {
              type: 'bar',
              label: 'Total Volume',
              data: [null, bnbData.total_volume, null],
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1,
              yAxisID: 'y-axis-1'
            },
            {
              type: 'bar',
              label: 'Market Cap Change 24h',
              data: [null, null, bnbData.market_cap_change_24h],
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
              yAxisID: 'y-axis-1'
            },
            {
              type: 'line',
              label: 'Price Change (%)',
              data: [bnbData.price_change_percentage_24h, bnbData.price_change_percentage_24h, bnbData.price_change_percentage_24h],
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 2,
              fill: false,
              yAxisID: 'y-axis-2'
            },
            {
              type: 'line',
              label: 'Market Cap Change (%)',
              data: [bnbData.market_cap_change_percentage_24h, bnbData.market_cap_change_percentage_24h, bnbData.market_cap_change_percentage_24h],
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

  const updateScatterChart = (dataValues, labels) => {
    if (bnbScatterChartRef.current) {
      bnbScatterChartRef.current.data.datasets.forEach((dataset, index) => {
        dataset.data = dataValues[index];
      });
      bnbScatterChartRef.current.data.labels = labels;
      bnbScatterChartRef.current.update();
    }
  };
  
  const updateLineChart = (dataValues, labels) => {
    if (bnbLineChartRef.current) {
      bnbLineChartRef.current.data.datasets[0].data = dataValues;
      bnbLineChartRef.current.data.labels = labels;
      bnbLineChartRef.current.update();
    }
  };

  const updatePolarChart = (dataValues, labels) => {
    if (bnbPolarAreaChartRef.current) {
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
  
        bnbPolarAreaChartRef.current.data.datasets[0].data = dataValues;
        bnbPolarAreaChartRef.current.data.labels = labels;
        bnbPolarAreaChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
        bnbPolarAreaChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
        bnbPolarAreaChartRef.current.update();
    }
  };

  const updateCombinedChart = (combinedData) => {
    if (bnbCombinedChartRef.current) {
      bnbCombinedChartRef.current.data = combinedData;
      bnbCombinedChartRef.current.update();
    }
  };

  const handlePolarQueryChange = (e) => {
    const query = e.target.value;
    setPolarQuery(query);
    handlePolarQuery(query);
    handleFilterChange(query);
    setShowPolarChartInfo(query === 'market_cap_vs_volume');
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

  const handleLineQueryChange = (e) => {
    const query = e.target.value;
    setLineQuery(query);
    handleLineQuery(query);
    handleFilterChange(query);
    setShowLineChartInfo(query === 'market_cap_vs_circulating_supply');
  };

 const [showPolarChartInfo, setShowPolarChartInfo] = useState(false);
 const [showScatterChartInfo, setShowScatterChartInfo] = useState(false);
 const [showLineChartInfo, setShowLineChartInfo] = useState(false);
 const [showCombinedChartInfo, setShowCombinedChartInfo] = useState(false);

 const toggleScatterChartInfo = () => setShowScatterChartInfo((prev) => !prev);
 const toggleLineChartInfo = () => setShowLineChartInfo((prev) => !prev);
 const toggleCombinedChartInfo = () => setShowCombinedChartInfo((prev) => !prev);
 const togglePolarChartInfo = () => setShowPolarChartInfo((prev) => !prev);

  return (
    <div className="bnbpage-wrapper">
  <h1 className="page-title">BNB Visualization's</h1>
  <div className="faq-icon" onClick={() => window.location.href = 'https://revised-backend-refined.onrender.com/faq'}>
    <i className="bi bi-question-circle" title="Off to FAQ"></i>
  </div>

  <div className="bnbchart-container">
    <div className="bnbquery-container">
      <select value={lineQuery} onChange={handleLineQueryChange}>
        <option value="" hidden>📉 Select Line Chart Option</option>
        <option value="market_cap_vs_circulating_supply"> 📉 Market Cap vs. Circulating Supply</option>
        <option value="full_metrics_line"> 📉 All Line Metrics</option>
      </select>
    </div>
    <div className="bnbquery-container">
      <select value={combinedQuery} onChange={handleCombinedQueryChange}>
        <option value="" hidden>🚀 Select Combined Chart Option</option>
        <option value="market_cap_vs_volume_market_cap_change"> 🚀 Market Cap / Change vs. Volume</option>
        <option value="full_metrics_combined"> 🚀 All Combined Metrics</option>
      </select>
    </div>
    <div className="bnbquery-container">
      <select value={polarQuery} onChange={handlePolarQueryChange}>
        <option value="" hidden>❄️ Select Polar Chart Option</option>
        <option value="market_cap_vs_volume"> ❄️ Market Cap vs. Volume</option>
        <option value="full_metrics_polar"> ❄️ All Polar Metrics</option>
      </select>
    </div>
    <div className="bnbquery-container">
      <select value={scatterQuery} onChange={handleScatterQueryChange}>
        <option value="" hidden>🌍 Select Scatter Chart Option</option>
        <option value="market_cap_vs_volume_vs_price"> 🌍 Market Cap vs. Volume vs. Price</option>
        <option value="full_metrics_scatter"> 🌍 All Scatter Metrics</option>
      </select>
    </div>
  </div>

  <div className="bnbchart-container">
    {/* Heatmap Chart */}
    <div className="bnbchart-wrapper heatmap">
    <div className="bnbchart-header">
        <h2>Heatmap for BNB Metrics</h2>
    </div>
        <canvas id="bnbHeatmapChart"></canvas>
    </div>

<div className="bnbchart-wrapper combine">
  <div className="bnbchart-header">
    <h2>Polar Area Chart for BNB KPIs</h2>
    {polarQuery === 'market_cap_vs_volume' && (
        <span className="bnbinfo-icon" title="More Information">🤔</span> 
     )}
  </div>
  <canvas id="bnbPolarAreaChart"></canvas>
  {loadingPolar ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          polarInsights && (
            <div className="bnbchart-details">
              <p>{polarInsights}</p>
            </div>
          )
        )}
    </div>

    {/* Scatter Chart */}
<div className="bnbchart-wrapper combine">
  <div className="bnbchart-header">
    <h2>Scatterplot Chart for BNB Metrics</h2>
    {scatterQuery === 'market_cap_vs_volume_vs_price' && (
        <span className="bnbinfo-icon" title="More Information">🤔</span> 
     )}
  </div>
  <canvas id="bnbScatterChart"></canvas>
  {loadingScatter ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          scatterInsights && (
            <div className="bnbchart-details">
              <p>{scatterInsights}</p>
            </div>
          )
        )}
    </div>

{/* Line Graph */}
<div className="bnbchart-wrapper combine">
  <div className="bnbchart-header">
    <h2>Line Graph for BNB Metrics</h2>
    {lineQuery === 'market_cap_vs_circulating_supply' && (
        <span className="bnbinfo-icon" title="More Information">🤔</span> 
     )}
  </div>
  <canvas id="bnbLineChart"></canvas>
  {loadingLine ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          lineInsights && (
            <div className="bnbchart-details">
              <p>{lineInsights}</p>
            </div>
          )
        )}
    </div>

{/* Combined Chart */}
<div className="bnbchart-wrapper combine">
  <div className="bnbchart-header">
    <h2>Combined Bar and Line Graph Representing BNB's Market Volatility</h2>
    {(combinedQuery === 'market_cap_vs_volume_market_cap_change') && (
      <span className="bnbinfo-icon" title="More Information">🤔</span> 
    )}
  </div>
  <canvas id="bnbCombinedChart"></canvas>
  {loadingPriceChange ? (
          <div className="loading-indicator">
            Fetching insights<LoadingEllipsis />
          </div>
        ) : (
          priceChangeInsights && (
            <div className="tetherchart-details">
              <p>{priceChangeInsights}</p>
            </div>
          )
        )}
      </div>
    </div>
</div>
  );
};  

export default BnbCharts;
