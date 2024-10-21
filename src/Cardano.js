import React, { useEffect, useState, useRef } from "react";
import "./Cardano.css";
import Chart from "chart.js/auto";
import "./Questionmark.css";

const CardanoCharts = () => {
  const [CardanoData, setCardanoData] = useState(null);
  const cardanoLineChartRef = useRef(null);
  const cardanoPolarAreaChartRef = useRef(null);
  const cardanoGroupedBarChartRef = useRef(null);
  const cardanoHeatmapChartRef = useRef(null);
  const cardanoCombinedChartRef = useRef(null);
  const [lineQuery, setLineQuery] = useState("");
  const [polarQuery, setPolarQuery] = useState("");
  const [combinedQuery, setCombinedQuery] = useState("");
  const [groupedQuery, setGroupedQuery] = useState("");
  const [polarInsights, setPolarInsights] = useState("");
  const [lineInsights, setLineInsights] = useState("");
  const [groupedInsights, setGroupedInsights] = useState("");
  const [priceChangeInsights, setPriceChangeInsights] = useState('');

  const [loadingPolar, setLoadingPolar] = useState(false);
  const [loadingGrouped, setLoadingGrouped] = useState(false);
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
    if (!CardanoData || typeof CardanoData !== 'object') {
      console.error('Invalid or missing Cardano data');
      return;
    }

    let filteredData;
    let setInsights;
    let setLoading;

    switch (selectedRelationship) {
      case 'market_cap_vs_circulating_supply':
        filteredData = { market_cap: CardanoData.market_cap, circulating_supply: CardanoData.circulating_supply };
        setInsights = setPolarInsights;
        setLoading = setLoadingPolar;
        break;
      case 'total_volume_vs_circulating_supply':
        filteredData = { total_volume: CardanoData.total_volume, circulating_supply: CardanoData.circulating_supply };
        setInsights = setLineInsights;
        setLoading = setLoadingLine;
        break;
      case 'market_cap_vs_total_volume':
        filteredData = { market_cap: CardanoData.market_cap, total_volume: CardanoData.total_volume };
        setInsights = setGroupedInsights;
        setLoading = setLoadingGrouped;
        break;
      case 'market_cap_vs_volume_market_cap_change':
        filteredData = { 
          market_cap: CardanoData.market_cap, 
          total_volume: CardanoData.total_volume, 
          market_cap_change_percentage_24h: CardanoData.market_cap_change_percentage_24h 
        };
        setInsights = setPriceChangeInsights;
        setLoading = setLoadingPriceChange;
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
        const cardanoFilteredData = data.filter(item => item.symbol === 'ada')[0];
        setCardanoData(cardanoFilteredData);

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
          cardanoFilteredData.current_price,
          cardanoFilteredData.market_cap,
          cardanoFilteredData.total_volume,
          cardanoFilteredData.circulating_supply,
          cardanoFilteredData.market_cap_change_24h,
          cardanoFilteredData.market_cap_change_percentage_24h,
          cardanoFilteredData.price_change_24h,
          cardanoFilteredData.price_change_percentage_24h
        ];
 
// Line Chart for Cardano Metrics Over Time
const cardanoLineChartCtx = document.getElementById('cardanoLineChart').getContext('2d');
createChart(cardanoLineChartRef, cardanoLineChartCtx, {
  type: 'line',
  data: {
    labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'], 
    datasets: [
      {
        label: 'Cardano Metrics',
        data: [
          cardanoFilteredData.current_price,
          cardanoFilteredData.market_cap,
          cardanoFilteredData.total_volume,
          cardanoFilteredData.circulating_supply
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

// Polar Area Chart for Cardano Distribution Metrics
const cardanoPolarAreaCtx = document.getElementById('cardanoPolarAreaChart').getContext('2d');

const maxValue = Math.max(...dataValues);
createChart(cardanoPolarAreaChartRef, cardanoPolarAreaCtx, {
  type: 'polarArea',
  data: {
    labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'],
    datasets: [{
      label: 'Cardano Distribution Metrics',
      data: [
        cardanoFilteredData.current_price,
        cardanoFilteredData.market_cap,
        cardanoFilteredData.total_volume,
        cardanoFilteredData.circulating_supply,
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

//Combined chart for Cardano
const cardanoCombinedChartCtx = document.getElementById('cardanoCombinedChart').getContext('2d');
createChart(cardanoCombinedChartRef, cardanoCombinedChartCtx, {
  type: 'bar',
  data: {
    labels: ['Market Cap', 'Total Volume', 'Circulating Supply'],
    datasets: [
      {
        type: 'bar',
        label: 'Market Cap',
        data: [cardanoFilteredData.market_cap, null, null],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        yAxisID: 'y-axis-1'
      },
      {
        type: 'bar',
        label: 'Total Volume',
        data: [null, cardanoFilteredData.total_volume, null],
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        yAxisID: 'y-axis-1'
      },
      {
        type: 'bar',
        label: 'Circulating Supply',
        data: [null, null, cardanoFilteredData.circulating_supply],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y-axis-1'
      },
      {
        type: 'line',
        label: 'Price Change (%)',
        data: [
          cardanoFilteredData.price_change_percentage_24h,
          cardanoFilteredData.price_change_percentage_24h,
          cardanoFilteredData.price_change_percentage_24h
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
          cardanoFilteredData.market_cap_change_percentage_24h,
          cardanoFilteredData.market_cap_change_percentage_24h,
          cardanoFilteredData.market_cap_change_percentage_24h
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
        // Cardano Grouped Bar Chart with Dual Axes
        const cardanoGroupedBarCtx = document.getElementById('cardanoGroupedBarChart').getContext('2d');
          createChart(cardanoGroupedBarChartRef, cardanoGroupedBarCtx, {
            type: 'bar',
            data: {
              labels: ['Cardano Metrics'],
              datasets: [
                {
                  label: 'High 24h',
                  data: [cardanoFilteredData.high_24h],
                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                  borderColor: 'rgba(255, 99, 132, 1)',
                  borderWidth: 1,
                  yAxisID: 'y-axis-1'
                },
                {
                  label: 'Low 24h',
                  data: [cardanoFilteredData.low_24h],
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
                  yAxisID: 'y-axis-1'
                },
                {
                  label: 'Total Volume',
                  data: [cardanoFilteredData.total_volume],
                  backgroundColor: 'rgba(255, 206, 86, 0.2)',
                  borderColor: 'rgba(255, 206, 86, 1)',
                  borderWidth: 1,
                  yAxisID: 'y-axis-2'
                },
                {
                  label: 'Market Cap',
                  data: [cardanoFilteredData.market_cap],
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
                    text: 'Price (USD)'
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

// Heatmap for Cardano metrics
const cardanoHeatmapCtx = document.getElementById('cardanoHeatmapChart').getContext('2d');

// Example data structure for Cardano 
const cardanoData = [
  { name: 'Cardano', price_change_percentage_24h: cardanoFilteredData.price_change_percentage_24h }
];

const isPositiveChange = cardanoData[0].price_change_percentage_24h >= 0;
const absPriceChange = Math.abs(cardanoData[0].price_change_percentage_24h);
const dynamicMax = Math.ceil(absPriceChange / 5) * 5;

const positiveBaseColor = 'rgba(0, 200, 83'; 
const negativeBaseColor = 'rgba(255, 51, 51'; 

const baseColor = isPositiveChange ? positiveBaseColor : negativeBaseColor;
const backgroundColor = `${baseColor}, ${0.2 + (absPriceChange / dynamicMax) * 0.2})`;
const borderColor = `${baseColor}, 1)`; 

createChart(cardanoHeatmapChartRef, cardanoHeatmapCtx, {
  type: 'bar',
  data: {
    labels: ['Cardano'],
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
        title: { display: true, text: 'Cardano Metrics' }
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
            return `${label}: ${value}% (${cardanoData[0].name})`; 
          },
          afterLabel: function(tooltipItem) {
            const value = cardanoData[0].price_change_percentage_24h;
            return `Price Change: ${value > 0 ? '+' : ''}${value}%`; 
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
      cardanoLineChartRef.current &&  cardanoLineChartRef.current.destroy();
      cardanoPolarAreaChartRef.current &&  cardanoPolarAreaChartRef.current.destroy();
      cardanoGroupedBarChartRef.current &&  cardanoGroupedBarChartRef.current.destroy();
      cardanoHeatmapChartRef.current &&  cardanoHeatmapChartRef.current.destroy();
      cardanoCombinedChartRef.current &&  cardanoCombinedChartRef.current.destroy();
    };
  }, []);

  const handlePolarQuery = (query) => {
    if(CardanoData) {
      let polarLabels = [];
      let polarDataValues = [];
  
      switch (query) {
        case "market_cap_vs_circulating_supply":
          polarLabels = ['Market Cap', 'Circulating Supply'];
          polarDataValues = [CardanoData.market_cap, CardanoData.circulating_supply];
          break;
        case "full_metrics_polar":
          polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          polarDataValues = [
        CardanoData.current_price,
        CardanoData.market_cap,
        CardanoData.total_volume,
        CardanoData.circulating_supply
          ];
          break;
        default:
          // default case should handle fallback
          polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          polarDataValues = [
        CardanoData.current_price,
        CardanoData.market_cap,
        CardanoData.total_volume,
        CardanoData.circulating_supply
          ];
      }
  
      updatePolarChart(polarDataValues, polarLabels);
    }
  };

  const handleLineQuery = (query) => {
    if (CardanoData) {
      let lineLabels = [];
      let lineDataValues = [];
  
      switch (query) {
        case "total_volume_vs_circulating_supply":
          lineLabels = ['Total Volume', 'Circulating Supply'];
          lineDataValues = [CardanoData.total_volume, CardanoData.circulating_supply];
          break;
        case "full_metrics_line":
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            CardanoData.current_price,
            CardanoData.market_cap,
            CardanoData.total_volume,
            CardanoData.circulating_supply
          ];
          break;
        default:
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            CardanoData.current_price,
            CardanoData.market_cap,
            CardanoData.total_volume,
            CardanoData.circulating_supply
          ];
      }
  
      updateLineChart(lineDataValues, lineLabels);
    }
};

const handleCombinedQuery = (query) => {
  if (CardanoData) {
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
            data: [CardanoData.market_cap, null],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'bar',
            label: 'Total Volume',
            data: [null, CardanoData.total_volume],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'line',
            label: 'Price Change (%)',
            data: [CardanoData.price_change_percentage_24h, CardanoData.price_change_percentage_24h],
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
              data: [CardanoData.market_cap, null],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              yAxisID: 'y-axis-1'
            },
            {
              type: 'bar',
              label: 'Total Volume',
              data: [null, CardanoData.total_volume],
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1,
              yAxisID: 'y-axis-1'
            },
            {
              type: 'line',
              label: 'Market Cap Change (%)',
              data: [CardanoData.market_cap_change_percentage_24h, CardanoData.market_cap_change_percentage_24h],
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
            data: [CardanoData.market_cap, null, null],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'bar',
            label: 'Total Volume',
            data: [null, CardanoData.total_volume, null],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'bar',
            label: 'Market Cap Change 24h',
            data: [null, null, CardanoData.market_cap_change_24h],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            type: 'line',
            label: 'Price Change (%)',
            data: [CardanoData.price_change_percentage_24h, CardanoData.price_change_percentage_24h, CardanoData.price_change_percentage_24h],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
            yAxisID: 'y-axis-2'
          },
          {
            type: 'line',
            label: 'Market Cap Change (%)',
            data: [CardanoData.market_cap_change_percentage_24h, CardanoData.market_cap_change_percentage_24h, CardanoData.market_cap_change_percentage_24h],
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

const handleGroupedQuery = (query) => {
  if (CardanoData) {
    let barLabels = ['Cardano Metrics'];
    let barDatasets = [];
    let useSingleAxis = false;
    let yAxisMax = 0;

    switch (query) {
      case "market_cap_vs_total_volume":
        useSingleAxis = true; // Use only one y-axis for comparison
        yAxisMax = Math.max(CardanoData.market_cap, CardanoData.total_volume);

        barDatasets = [
          {
            label: 'Market Cap',
            data: [CardanoData.market_cap],
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            label: 'Total Volume',
            data: [CardanoData.total_volume],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          }
        ];
        break;

      case "full_metrics_bar":
      default:
        yAxisMax = Math.max(CardanoData.high_24h, CardanoData.low_24h, CardanoData.market_cap, CardanoData.total_volume);

        barDatasets = [
          {
            label: 'High 24h',
            data: [CardanoData.high_24h],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            label: 'Low 24h',
            data: [CardanoData.low_24h],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-1'
          },
          {
            label: 'Total Volume',
            data: [CardanoData.total_volume],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            yAxisID: 'y-axis-2'
          },
          {
            label: 'Market Cap',
            data: [CardanoData.market_cap],
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

const updateLineChart = (dataValues, labels) => {
  if (cardanoLineChartRef.current) {
    cardanoLineChartRef.current.data.datasets[0].data = dataValues;
    cardanoLineChartRef.current.data.labels = labels;
    cardanoLineChartRef.current.update();
  }
};

const updatePolarChart = (dataValues, labels) => {
  if (cardanoPolarAreaChartRef.current) {
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

      cardanoPolarAreaChartRef.current.data.datasets[0].data = dataValues;
      cardanoPolarAreaChartRef.current.data.labels = labels;
      cardanoPolarAreaChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
      cardanoPolarAreaChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
      cardanoPolarAreaChartRef.current.update();
  }
};

const updateCombinedChart = (combinedData) => {
  if (cardanoCombinedChartRef.current) {
    cardanoCombinedChartRef.current.data = combinedData;
    cardanoCombinedChartRef.current.update();
  }
};

const updateGroupedChart = (datasets, labels, yAxisMax, useSingleAxis) => {
  if (cardanoGroupedBarChartRef.current) {
    cardanoGroupedBarChartRef.current.data.datasets = datasets;
    cardanoGroupedBarChartRef.current.data.labels = labels;

    if (useSingleAxis) {
      // Configure a single y-axis
      cardanoGroupedBarChartRef.current.options.scales['y-axis-1'] = {
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
      delete cardanoGroupedBarChartRef.current.options.scales['y-axis-2'];

    } else {
      // Restore dual y-axes configuration with grid lines only on y-axis-1
      cardanoGroupedBarChartRef.current.options.scales['y-axis-1'] = {
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

      cardanoGroupedBarChartRef.current.options.scales['y-axis-2'] = {
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

    cardanoGroupedBarChartRef.current.update();
  }
};

const handlePolarQueryChange = (e) => {
  const query = e.target.value;
  setPolarQuery(query);
  handlePolarQuery(query);
  handleFilterChange(query); 
  setShowPolarChartInfo(query === 'market_cap_vs_circulating_supply');
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
  setShowLineChartInfo(query === 'total_volume_vs_circulating_supply');
};

const handleGroupedQueryChange = (e) => {
  const query = e.target.value;
  setGroupedQuery(query);
  handleGroupedQuery(query);
  handleFilterChange(query); 
  setShowGroupedBarChartInfo(query === 'market_cap_vs_total_volume');
};

const [showGroupedBarChartInfo, setShowGroupedBarChartInfo] = useState(false);
const [showLineChartInfo, setShowLineChartInfo] = useState(false);
const [showCombinedChartInfo, setShowCombinedChartInfo] = useState(false);
const [showPolarChartInfo, setShowPolarChartInfo] = useState(false);

 const toggleGroupedBarChartInfo = () => setShowGroupedBarChartInfo((prev) => !prev);
 const toggleLineChartInfo = () => setShowLineChartInfo((prev) => !prev);
 const toggleCombinedChartInfo = () => setShowCombinedChartInfo((prev) => !prev);
 const togglePolarChartInfo = () => setShowPolarChartInfo((prev) => !prev);

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

// State for Combined Chart Insights
const [currentCombinedInsight, setCurrentCombinedInsight] = useState(0);
const [combinedInsightContent, setCombinedInsightContent] = useState(null);
const validCombinedInsights = priceChangeInsights.split('\n').filter(insight => insight.trim() !== "");

useEffect(() => {
  setCombinedInsightContent(validCombinedInsights.length > 0 ? validCombinedInsights[currentCombinedInsight] : null);
}, [currentCombinedInsight, validCombinedInsights]);

const handleNextCombinedInsight = () => {
  const nextIndex = currentCombinedInsight + 1;
  setCurrentCombinedInsight(nextIndex >= validCombinedInsights.length ? 0 : nextIndex);
};

const handlePrevCombinedInsight = () => {
  const prevIndex = currentCombinedInsight - 1;
  setCurrentCombinedInsight(prevIndex < 0 ? validCombinedInsights.length - 1 : prevIndex);
};

  return (
    <div className="cardanopage-wrapper">
  <h1 className="page-title">Cardano Visualizations</h1>
  <div className="faq-icon" onClick={() => window.location.href = 'https://revised-backend-refined.onrender.com/faq'}>
    <i className="bi bi-question-circle" title="Off to FAQ"></i>
  </div>

  <div className="cardanochart-container">
    {/* Line Chart Query */}
    <div className="cardanoquery-container">
      <select value={lineQuery} onChange={handleLineQueryChange}>
        <option value="" hidden>📉 Line Chart</option>
        <option value="total_volume_vs_circulating_supply">📉 Total Volume vs. Circulating Supply</option>
        <option value="full_metrics_line">📉 Reset</option>
      </select>
    </div>

    {/* Combined Chart Query */}
    <div className="cardanoquery-container">
      <select value={combinedQuery} onChange={handleCombinedQueryChange}>
        <option value="" hidden>🚀 Combined Chart</option>
        <option value="market_cap_vs_volume_market_cap_change">🚀 Market Cap / Change vs. Volume</option>
        <option value="full_metrics_combined">🚀 Reset</option>
      </select>
    </div>

    {/* Polar Chart Query */}
    <div className="cardanoquery-container">
      <select value={polarQuery} onChange={handlePolarQueryChange}>
        <option value="" hidden>❄️ Polar Chart</option>
        <option value="market_cap_vs_circulating_supply">❄️ Market Cap vs. Volume</option>
        <option value="full_metrics_polar">❄️ Reset</option>
      </select>
    </div>

    {/* Grouped Chart Query */}
    <div className="cardanoquery-container">
      <select value={groupedQuery} onChange={handleGroupedQueryChange}>
        <option value="" hidden>📶 Grouped Chart</option>
        <option value="market_cap_vs_total_volume">📶 Market Cap vs. Total Volume</option>
        <option value="full_metrics_bar">📶 Reset</option>
      </select>
    </div>

    {/* Heatmap Chart for Cardano */}
    <div className="cardanochart-container">
    <div className="cardanochart-wrapper heatmap">
    <div className="cardanochart-header">
        <h2>Heatmap for Cardano Metrics</h2>
    </div>
        <canvas id="cardanoHeatmapChart"></canvas>
    </div>

    {/* Polar Area Chart */}
    <div className="cardanochart-wrapper bar">
      <div className="cardanochart-header">
        <h2>Polar Area Chart for Cardano KPIs</h2>
        {polarQuery === 'market_cap_vs_circulating_supply' && (
          <span className="cardanoinfo-icon" title="More Information">🤔</span>
        )}
      </div>
      <canvas id="cardanoPolarAreaChart"></canvas>
      {loadingPolar ? (
        <div className="cardanoloading-indicator">Fetching insights<LoadingEllipsis /></div>
      ) : (
        polarInsights && validPolarInsights.length > 0 && polarQuery !== 'full_metrics_polar' &&  (
          <div className="cardanochart-details">
            <div key={currentPolarInsight} className="cardanochart-item">
              <div className="cardanochart-header">
                <span>{currentPolarInsight + 1}. </span>
              </div>
              <div className="cardanochart-content">
                {polarInsightContent ? polarInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
              </div>
              <div className="cardanoinsight-navigation">
                <span className="cardanonav-arrow" onClick={handlePrevPolarInsight}>{'<'}</span>
                <span className="cardanonav-arrow" onClick={handleNextPolarInsight}>{'>'}</span>
              </div>
            </div>
          </div>
        )
      )}
    </div>

    {/* Grouped Bar Chart */}
    <div className="cardanochart-wrapper bar">
      <div className="cardanochart-header">
        <h2>Grouped Bar Chart for Cardano Metrics</h2>
        {groupedQuery === 'market_cap_vs_total_volume' && (
          <span className="cardanoinfo-icon" title="More Information">🤔</span>
        )}
      </div>
      <canvas id="cardanoGroupedBarChart"></canvas>
      {loadingGrouped ? (
        <div className="cardanoloading-indicator">Fetching insights<LoadingEllipsis /></div>
      ) : (
        groupedInsights && validGroupedBarInsights.length > 0 && groupedQuery !== 'full_metrics_bar' && (
          <div className="cardanochart-details">
            <div key={currentGroupedBarInsight} className="cardanochart-item">
              <div className="cardanochart-header">
                <span>{currentGroupedBarInsight + 1}. </span>
              </div>
              <div className="cardanochart-content">
                {groupedBarInsightContent ? groupedBarInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
              </div>
              <div className="cardanoinsight-navigation">
                <span className="cardanonav-arrow" onClick={handlePrevGroupedBarInsight}>{'<'}</span>
                <span className="cardanonav-arrow" onClick={handleNextGroupedBarInsight}>{'>'}</span>
              </div>
            </div>
          </div>
        )
      )}
    </div>

    {/* Line Graph */}
    <div className="cardanochart-wrapper bar">
      <div className="cardanochart-header">
        <h2>Line Graph for Cardano Metrics</h2>
        {lineQuery === 'total_volume_vs_circulating_supply' && (
          <span className="cardanoinfo-icon" title="More Information">🤔</span>
        )}
      </div>
      <canvas id="cardanoLineChart"></canvas>
      {loadingLine ? (
        <div className="cardanoloading-indicator">Fetching insights<LoadingEllipsis /></div>
      ) : (
        lineInsights && validLineInsights.length > 0 && lineQuery !== 'full_metrics_line' && (
          <div className="cardanochart-details">
            <div key={currentLineInsight} className="cardanochart-item">
              <div className="cardanochart-header">
                <span>{currentLineInsight + 1}. </span>
              </div>
              <div className="cardanochart-content">
                {lineInsightContent ? lineInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
              </div>
              <div className="cardanoinsight-navigation">
                <span className="cardanonav-arrow" onClick={handlePrevLineInsight}>{'<'}</span>
                <span className="cardanonav-arrow" onClick={handleNextLineInsight}>{'>'}</span>
              </div>
            </div>
          </div>
        )
      )}
    </div>

    {/* Combined Bar and Line Graph */}
    <div className="cardanochart-wrapper bar">
      <div className="cardanochart-header">
        <h2>Combined Bar and Line Graph Representing Cardano's Market Volatility</h2>
        {combinedQuery === 'market_cap_vs_volume_market_cap_change' && (
          <span className="cardanoinfo-icon" title="More Information">🤔</span>
        )}
      </div>
      <canvas id="cardanoCombinedChart"></canvas>
      {loadingPriceChange ? (
        <div className="cardanoloading-indicator">Fetching insights<LoadingEllipsis /></div>
      ) : (
        priceChangeInsights && validCombinedInsights.length > 0 && combinedQuery !== 'full_metrics_combined' && (
          <div className="cardanochart-details">
            <div key={currentCombinedInsight} className="cardanochart-item">
              <div className="cardanochart-header">
                <span>{currentCombinedInsight + 1}. </span>
              </div>
              <div className="cardanochart-content">
                {combinedInsightContent ? combinedInsightContent.replace(/◆/g, '').trim() : 'No information available.'}
              </div>
              <div className="cardanoinsight-navigation">
                <span className="cardanonav-arrow" onClick={handlePrevCombinedInsight}>{'<'}</span>
                <span className="cardanonav-arrow" onClick={handleNextCombinedInsight}>{'>'}</span>
              </div>
            </div>
          </div>
        )
      )}
      </div>
          </div>
      </div>
      </div>
        );
      };  

export default CardanoCharts;
