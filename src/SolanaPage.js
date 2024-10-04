import React, { useEffect, useState, useRef } from "react";
import "./Solana.css";
import Chart from "chart.js/auto";
import "./Questionmark.css";


const SolanaCharts = () => {
  const [solanaData, setSolanaData] = useState(null);
  const solPolarAreaChartRef = useRef(null);
  const solDoughnutChartRef = useRef(null);
  const solSpeScatterChartRef = useRef(null);
  const solLineChartRef = useRef(null);
  const solGenScatterChartRef = useRef(null);
  const [polarQuery, setPolarQuery] = useState("");
  const [lineQuery, setLineQuery] = useState("");
  const [scatterGenQuery, setGenScatterQuery] = useState("");
  const [scatterSpeQuery, setSpeScatterQuery] = useState("");
  const [doughnutQuery, setDoughnutQuery] = useState("");
  const [polarInsights, setPolarInsights] = useState("");
  const [speScatterInsights, setSpeScatterInsights] = useState("");
  const [genScatterInsights, setGenScatterInsights] = useState("");
  const [doughnutInsights, setDoughnutInsights] = useState("");
  const [lineInsights, setLineInsights] = useState("");

  const [loadingPolar, setLoadingPolar] = useState(false);
  const [loadingSpeScatter, setLoadingSpeScatter] = useState(false);
  const [loadingLine, setLoadingLine] = useState(false);
  const [loadingGenScatter, setLoadingGenScatter] = useState(false);
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
  if (!solanaData || typeof solanaData !== 'object') {
    console.error('Invalid or missing Solana data');
    return;
  }

  let filteredData;
  let setInsights;
  let setLoading

  switch (selectedRelationship) {
    case 'market_cap_vs_volume':
      filteredData = { market_cap: solanaData.market_cap, total_volume: solanaData.total_volume };
      setInsights = setPolarInsights;
      setLoading = setLoadingPolar;
      break;
    case 'market_cap_vs_circulating_supply_line':
      filteredData = { market_cap: solanaData.market_cap, circulating_supply: solanaData.circulating_supply };
      setInsights = setLineInsights;
      setLoading = setLoadingLine;
      break;
    case 'volume_vs_supply':
        filteredData = { market_cap: solanaData.market_cap, circulating_supply: solanaData.circulating_supply, market_cap: solanaData.total_supply };
        setInsights = setDoughnutInsights;
        setLoading = setLoadingDoughnut;
      break;
    case 'market_cap_vs_volume_vs_price':
      filteredData = { market_cap: solanaData.market_cap, total_volume: solanaData.total_volume, current_price: solanaData.current_price };
      setInsights = setGenScatterInsights;
      setLoading = setLoadingGenScatter;
      break;
    case 'full_metrics_speScatter':
    filteredData = [
      { x: solanaData.market_cap, y: solanaData.total_supply },
      { x: solanaData.total_supply, y: solanaData.total_volume },
      { x: solanaData.current_price, y: solanaData.circulating_supply },
      { x: solanaData.total_volume, y: solanaData.circulating_supply }
    ];
    setInsights = setSpeScatterInsights;
    setLoading = setLoadingSpeScatter;
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
        const solanaFilteredData = data.filter(item => item.symbol === 'sol')[0];
        setSolanaData(solanaFilteredData);

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
        solanaFilteredData.current_price,
        solanaFilteredData.market_cap,
        solanaFilteredData.total_volume,
        solanaFilteredData.circulating_supply,
      ];

       // Scatterplot for Solana KPIs
          const solSpeScatterCtx = document.getElementById('solSpeScatterChart').getContext('2d');
          const solSpeScatterData = {
            datasets: [
              {
                label: ' Market Cap vs Total Supply',
                data: [
                  { x: solanaFilteredData.market_cap, y: solanaFilteredData.total_supply }
                ],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                pointRadius: 7
              },
              {
                label: 'Total Supply vs. Total Volume',
                data: [
                  { x: solanaFilteredData.total_supply, y: solanaFilteredData.total_volume }
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                pointRadius: 7
              },
              {
                label: 'Current Price vs. Circulating Supply',
                data: [
                  { x: solanaFilteredData.current_price, y: solanaFilteredData.circulating_supply }
                ],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                pointRadius: 7
              },
              {
                label: 'Total Volume vs. Circulating Supply',
                data: [
                  { x: solanaFilteredData.total_volume, y: solanaFilteredData.circulating_supply }
                ],
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
                pointRadius: 7
              }
            ]
          };

          createChart(solSpeScatterChartRef, solSpeScatterCtx, {
            type: 'scatter',
            data: solSpeScatterData,
            options: {
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Monetary Value'
                  },
                  ticks: {
                    callback: function(value) {
                      return '$' + value.toLocaleString();
                    }
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Metrics'
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
                      const label = tooltipItem.dataset.label || '';
                      const valueX = tooltipItem.raw.x;
                      const valueY = tooltipItem.raw.y;
                      return `${label}: $${valueX.toLocaleString()}, $${valueY.toLocaleString()}`;
                    }
                  }
                }
              }
            }
          });

// Line Chart for Solana Metrics Over Time
const solLineChartCtx = document.getElementById('solLineChart').getContext('2d');
createChart(solLineChartRef, solLineChartCtx, {
  type: 'line',
  data: {
    labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'], 
    datasets: [
      {
        label: 'Solana Metrics',
        data: [
          solanaFilteredData.current_price,
          solanaFilteredData.market_cap,
          solanaFilteredData.total_volume,
          solanaFilteredData.circulating_supply
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
          // Polar Area Chart for Solana Distribution Metrics
          const solPolarAreaCtx = document.getElementById('solPolarAreaChart').getContext('2d');

          const maxValue = Math.max(...dataValues);
          createChart(solPolarAreaChartRef, solPolarAreaCtx, {
            type: 'polarArea',
            data: {
              labels: ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'],
              datasets: [{
                label: 'Solana Distribution Metrics',
                data: [
                  solanaFilteredData.current_price,
                  solanaFilteredData.market_cap,
                  solanaFilteredData.total_volume,
                  solanaFilteredData.circulating_supply
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
const solDoughnutCtx = document.getElementById('solDoughnutChart').getContext('2d');
createChart(solDoughnutChartRef, solDoughnutCtx, {
  type: 'doughnut',
  data: {
    labels: ['Market Cap', 'Total Volume', 'Circulating Supply', 'Total Supply'],
    datasets: [{
      data: [
        solanaFilteredData.market_cap,
        solanaFilteredData.total_volume,
        solanaFilteredData.circulating_supply,
        solanaFilteredData.total_supply
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

// Solana Generalised Scatter Plot Chart
const solGenScatterCtx = document.getElementById('solGenScatterChart').getContext('2d');
createChart(solGenScatterChartRef, solGenScatterCtx, {
  type: 'scatter',
  data: {
    datasets: [
      {
        label: 'Market Cap',
        data: [{ x: 1, y: solanaFilteredData.market_cap || 0 }],
        backgroundColor: 'rgba(54, 162, 235, 0.2)', // Blue
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Total Volume',
        data: [{ x: 2, y: solanaFilteredData.total_volume || 0 }],
        backgroundColor: 'rgba(255, 206, 86, 0.2)', // Yellow
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Current Price',
        data: [{ x: 3, y: solanaFilteredData.current_price || 0 }],
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Teal
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'Circulating Supply',
        data: [{ x: 4, y: solanaFilteredData.circulating_supply || 0 }],
        backgroundColor: 'rgba(153, 102, 255, 0.2)', // Purple
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'ATH',
        data: [{ x: 5, y: solanaFilteredData.ath || 0 }],
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Red
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        pointRadius: 7
      },
      {
        label: 'ATL',
        data: [{ x: 6, y: solanaFilteredData.atl || 0 }],
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
          solanaFilteredData.market_cap || 0,
          solanaFilteredData.total_volume || 0,
          solanaFilteredData.ath || 0,
          solanaFilteredData.atl || 0
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
});       }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    return () => {
      solGenScatterChartRef.current && solGenScatterChartRef.current.destroy();
      solDoughnutChartRef.current &&  solDoughnutChartRef.current.destroy();
      solPolarAreaChartRef.current &&  solPolarAreaChartRef.current.destroy();
      solLineChartRef.current &&  solLineChartRef.current.destroy();
      solSpeScatterChartRef.current &&  solSpeScatterChartRef.current.destroy();
    };
  }, []);

  const handlePolarQuery = (query) => {
    if (solanaData) {
      let polarLabels = [];
      let polarDataValues = [];
  
      switch (query) {
        case "market_cap_vs_volume":
          polarLabels = ['Market Cap', 'Total Volume'];
          polarDataValues = [solanaData.market_cap, solanaData.total_volume];
          break;
        case "full_metrics_polar":
          polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          polarDataValues = [
            solanaData.current_price,
            solanaData.market_cap,
            solanaData.total_volume,
            solanaData.circulating_supply
          ];
          break;
        default:
          // default case should handle fallback
          polarLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          polarDataValues = [
            solanaData.current_price,
            solanaData.market_cap,
            solanaData.total_volume,
            solanaData.circulating_supply
          ];
      }
  
      updatePolarChart(polarDataValues, polarLabels);
    }
  };

  const handleLineQuery = (query) => {
    if (solanaData) {
      let lineLabels = [];
      let lineDataValues = [];
  
      switch (query) {
        case "market_cap_vs_circulating_supply":
          lineLabels = ['Market Cap', 'Circulating Supply'];
          lineDataValues = [solanaData.market_cap, solanaData.circulating_supply];
          break;
        case "full_metrics_line":
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            solanaData.current_price,
            solanaData.market_cap,
            solanaData.total_volume,
            solanaData.circulating_supply
          ];
          break;
        default:
          lineLabels = ['Current Price', 'Market Cap', 'Total Volume', 'Circulating Supply'];
          lineDataValues = [
            solanaData.current_price,
            solanaData.market_cap,
            solanaData.total_volume,
            solanaData.circulating_supply
          ];
      }
  
      updateLineChart(lineDataValues, lineLabels);
    }
};

const handleGenScatterQuery = (query) => {
  if (solanaData) {
    let scatterLabels = [];
    let scatterDataValues = [];

    switch (query) {
      case "market_cap_vs_volume_vs_price":
        scatterLabels = ['Market Cap', 'Total Volume', 'Current Price'];
        scatterDataValues = [
          [{ x: 1, y: solanaData.market_cap }],
          [{ x: 2, y: solanaData.total_volume }],
          [{ x: 3, y: solanaData.current_price }]
        ];
        break;
      case "full_metrics_scatter":
        scatterLabels = [
          'Market Cap', 'Total Volume', 'Current Price',
          'Circulating Supply', 'ATH', 'ATL'
        ];
        scatterDataValues = [
          [{ x: 1, y: solanaData.market_cap }],
          [{ x: 2, y: solanaData.total_volume }],
          [{ x: 3, y: solanaData.current_price }],
          [{ x: 4, y: solanaData.circulating_supply }],
          [{ x: 5, y: solanaData.ath }],
          [{ x: 6, y: solanaData.atl }]
        ];
        break;
      default:
        // Default to full metrics if no match
        scatterLabels = [
          'Market Cap', 'Total Volume', 'Current Price',
          'Circulating Supply', 'ATH', 'ATL'
        ];
        scatterDataValues = [
          [{ x: 1, y: solanaData.market_cap }],
          [{ x: 2, y: solanaData.total_volume }],
          [{ x: 3, y: solanaData.current_price }],
          [{ x: 4, y: solanaData.circulating_supply }],
          [{ x: 5, y: solanaData.ath }],
          [{ x: 6, y: solanaData.atl }]
        ];
    }

    updateGenScatterChart(scatterDataValues, scatterLabels);
  }
};

const handleSpeScatterQuery = (query) => {
  let scatterDataValues = [];

  switch (query) {
    case "full_metrics_speScatter":
      scatterDataValues = [
        {
          label: 'Market Cap vs Total Supply',
          data: [
            { x: solanaData.market_cap, y: solanaData.total_supply }
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          pointRadius: 7
        },
        {
          label: 'Current Price vs Circulating Supply',
          data: [
            { x: solanaData.current_price, y: solanaData.circulating_supply }
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          pointRadius: 7
        },
        {
          label: 'Total Supply vs Total Volume',
          data: [
            { x: solanaData.total_supply, y: solanaData.total_volume }
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          pointRadius: 7
        },
        {
          label: 'Total Volume vs Circulating Supply',
          data: [
            { x: solanaData.total_volume, y: solanaData.circulating_supply }
          ],
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          pointRadius: 7
        }
      ];
      break;

    default:
      scatterDataValues = [
        {
          label: 'Market Cap vs Total Volume',
          data: [
            { x: solanaData.market_cap, y: solanaData.total_volume }
          ],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          pointRadius: 7
        },
        {
          label: 'Current Price vs Circulating Supply',
          data: [
            { x: solanaData.current_price, y: solanaData.circulating_supply }
          ],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          pointRadius: 7
        },
        {
          label: 'Total Supply vs Total Volume',
          data: [
            { x: solanaData.total_supply, y: solanaData.total_volume }
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          pointRadius: 7
        },
        {
          label: 'Total Volume vs Circulating Supply',
          data: [
            { x: solanaData.total_volume, y: solanaData.circulating_supply }
          ],
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          pointRadius: 7
        }
      ];
  }

  updateSpeScatterChart(scatterDataValues);
};

const handleDoughnutQuery = (query) => {
  if (solanaData) {
      let doughnutLabels = [];
      let doughnutDataValues = [];

      switch (query) {
          case "volume_vs_supply":
              doughnutLabels = ['Total Supply', 'Circulating Supply', 'Total Volume'];
              doughnutDataValues = [
                  solanaData.total_supply, 
                  solanaData.circulating_supply, 
                  solanaData.total_volume
              ];
              break;
          case "full_metrics_doughnut":
              doughnutLabels = ['Market Cap', 'Total Volume', 'Circulating Supply', 'Total Supply'];
              doughnutDataValues = [
                  solanaData.market_cap,
                  solanaData.total_volume,
                  solanaData.circulating_supply,
                  solanaData.total_supply
              ];
              break;
          default:
              // Fallback to full metrics
              doughnutLabels = ['Market Cap', 'Total Volume', 'Circulating Supply', 'Total Supply'];
              doughnutDataValues = [
                  solanaData.market_cap,
                  solanaData.total_volume,
                  solanaData.circulating_supply,
                  solanaData.total_supply
              ];
      }

      updateDoughnutChart(doughnutDataValues, doughnutLabels);
  }
};

const updatePolarChart = (dataValues, labels) => {
  if (solPolarAreaChartRef.current) {
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

      solPolarAreaChartRef.current.data.datasets[0].data = dataValues;
      solPolarAreaChartRef.current.data.labels = labels;
      solPolarAreaChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
      solPolarAreaChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
      solPolarAreaChartRef.current.update();
  }
};

const updateLineChart = (dataValues, labels) => {
  if (solLineChartRef.current) {
    solLineChartRef.current.data.datasets[0].data = dataValues;
    solLineChartRef.current.data.labels = labels;
    solLineChartRef.current.update();
  }
};  

const updateGenScatterChart = (dataValues, labels) => {
  if (solGenScatterChartRef.current) {
    solGenScatterChartRef.current.data.datasets.forEach((dataset, index) => {
      dataset.data = dataValues[index];
    });
    solGenScatterChartRef.current.data.labels = labels;
    solGenScatterChartRef.current.update();
  }
};

const updateSpeScatterChart = (datasets) => {
  if (solSpeScatterChartRef.current) {
    solSpeScatterChartRef.current.data.datasets = datasets;
    solSpeScatterChartRef.current.update();
  }
};

const updateDoughnutChart = (dataValues, labels) => {
  if (solDoughnutChartRef.current) {
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

      solDoughnutChartRef.current.data.datasets[0].data = dataValues;
      solDoughnutChartRef.current.data.labels = labels;
      solDoughnutChartRef.current.data.datasets[0].backgroundColor = labels.map(label => colorMapping[label]);
      solDoughnutChartRef.current.data.datasets[0].borderColor = labels.map(label => borderColorMapping[label]);
      solDoughnutChartRef.current.update();
  }
};

const handlePolarQueryChange = (e) => {
  const query = e.target.value;
  setPolarQuery(query);
  handlePolarQuery(query);
  handleFilterChange(query);
  setShowPolarChartInfo(query === 'market_cap_vs_volume');
};

const handleLineQueryChange = (e) => {
  const query = e.target.value;
  setLineQuery(query);
  handleLineQuery(query);
  handleFilterChange(query);
  setShowLineChartInfo(query === 'market_cap_vs_circulating_supply');
};

const handleGenScatterOrSpeScatterQueryChange = (e) => {
  const query = e.target.value;

    setGenScatterQuery(query);
    handleGenScatterQuery(query);
    handleFilterChange(query); 
    setShowGenScatterChartInfo(query === 'market_cap_vs_volume_vs_price');

    setSpeScatterQuery(query);
    handleSpeScatterQuery(query);
    handleFilterChange(query);
    setShowSpeScatterChartInfo(query === 'full_metrics_speScatter');
};

const handleDoughnutQueryChange = (e) => {
  const query = e.target.value;
  setDoughnutQuery(query);
  handleDoughnutQuery(query);
  handleFilterChange(query);
  setShowDoughnutChartInfo(query === 'volume_vs_supply');
};

 const [showPolarChartInfo, setShowPolarChartInfo] = useState(false);
 const [showDoughnutChartInfo, setShowDoughnutChartInfo] = useState(false);
 const [showGenScatterChartInfo, setShowGenScatterChartInfo] = useState(false);
 const [showLineChartInfo, setShowLineChartInfo] = useState(false);
 const [showSpeScatterChartInfo, setShowSpeScatterChartInfo] = useState(false);

const togglePolarChartInfo = () => setShowPolarChartInfo((prev) => !prev);
const toggleGenScatterChartInfo = () => setShowGenScatterChartInfo((prev) => !prev);
const toggleDoughnutChartInfo = () => setShowDoughnutChartInfo((prev) => !prev);
const toggleSpeScatterChartInfo = () => setShowSpeScatterChartInfo((prev) => !prev);
const toggleLineChartInfo = () => setShowLineChartInfo((prev) => !prev);

  return (
  <div className="solanapage-wrapper">
    <h1 className="page-title">Solana Visualization's</h1>
    <div className="faq-icon" onClick={() => window.location.href = 'http://localhost:5000/faq'}>
    <i className="bi bi-question-circle" title="Off to FAQ"></i>
    </div>

    <div className="solanachart-container">
    <div className="solanaquery-container">
                  <select value={lineQuery} onChange={handleLineQueryChange}>
                      <option value="" hidden>📉 Select Line Chart Option</option>
                      <option value="market_cap_vs_circulating_supply">📉 Market Cap vs. Circulating Supply </option>
                      <option value="full_metrics_line"> 📉 All Line Metrics </option>
                  </select>
      </div>
  
      <div className="solanaquery-container">
                  <select value={polarQuery} onChange={handlePolarQueryChange}>
                      <option value="" hidden>❄️ Select Polar Chart Option</option>
                      <option value="market_cap_vs_volume"> ❄️ Market Cap vs. Volume </option>
                      <option value="full_metrics_polar"> ❄️ All Polar Metrics </option>
                  </select>
      </div>

      <div className="solanaquery-container">
                  <select value={doughnutQuery} onChange={handleDoughnutQueryChange}>
                     <option value="" hidden>🍩 Select Doughnut Chart Option</option>
                     <option value="volume_vs_supply"> 🍩 Volume vs. Supply </option>
                     <option value="full_metrics_doughnut"> 🍩 All Doughnut Metrics </option>
                  </select>
      </div>

      <div className="solanaquery-container">
        <select 
            value={scatterGenQuery || scatterSpeQuery} 
            onChange={handleGenScatterOrSpeScatterQueryChange}
          >
            <option value="" hidden>🌍🔎 Select General or Advanced Scatter Option</option>
            <option value="market_cap_vs_volume_vs_price">🌍 Market Cap vs. Volume vs. Price</option>
            <option value="full_metrics_scatter">🌍 All General Scatter Metrics</option>
            <option value="full_metrics_speScatter">🔎 All Advanced Metrics</option>
          </select>
      </div>

<div className="solanachart-container">
      {/* Polar Area Chart */}
<div className="solanachart-wrapper line">
  <div className="solanachart-header">
    <h2>Polar Area Chart for Solana KPIs</h2>
    {polarQuery === 'market_cap_vs_volume' && (
       <span className="solanainfo-icon" title="More Information">🤔</span> 
     )}
  </div>
  <canvas id="solPolarAreaChart"></canvas>
  {loadingPolar ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      polarInsights && (
        <div className="solanachart-details">
          <p>{polarInsights}</p>
        </div>
      )
    )}
  </div>

{/* Doughnut Chart */}
<div className="solanachart-wrapper line">
  <div className="solanachart-header">
    <h2>Doughnut Chart for Solana Metrics</h2>
    {doughnutQuery === 'volume_vs_supply' && (
        <span className="solanainfo-icon" title="More Information">🤔</span> 
    )}
  </div>
  <canvas id="solDoughnutChart"></canvas>
  {loadingDoughnut ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      doughnutInsights && (
        <div className="solanachart-details">
          <p>{doughnutInsights}</p>
        </div>
      )
    )}
  </div>

  {/* Standard Scatter Chart */}
  <div className="solanachart-wrapper line">
    <div className="solanachart-header"> {/* Updated to match CSS */}
      <h2>Scatterplot Chart for Solana Metrics</h2>
      {scatterGenQuery === 'market_cap_vs_volume_vs_price' && (
          <span className="solanainfo-icon" title="More Information">🤔</span>
      )}
    </div>
    <canvas id="solGenScatterChart"></canvas>
    {loadingGenScatter ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      genScatterInsights && (
        <div className="solanachart-details">
          <p>{genScatterInsights}</p>
        </div>
      )
    )}
  </div>

  {/* Line Chart */}
  <div className="solanachart-wrapper line">
    <div className="solanachart-header"> {/* Updated to match CSS */}
      <h2>Line Graph for Solana Metrics</h2>
      {lineQuery === 'market_cap_vs_circulating_supply' && (
        <span className="solanainfo-icon" title="More Information">🤔</span>
      )}
    </div>
    <canvas id="solLineChart"></canvas>
    {loadingLine ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      lineInsights && (
        <div className="solanachart-details">
          <p>{lineInsights}</p>
        </div>
      )
    )}
  </div>

   {/* Advanced Scatter Chart */}
   <div className="solanachart-wrapper line">
    <div className="solanachart-header"> {/* Updated to match CSS */}
      <h2>Advanced Scatterplot Chart for Solana Metrics</h2>
      {scatterSpeQuery === 'full_metrics_speScatter' && (
        <span className="solanainfo-icon" title="More Information">🤔</span>
      )}
    </div>
    <canvas id="solSpeScatterChart"></canvas>
    {loadingSpeScatter ? (
      <div className="loading-indicator">
        Fetching insights<LoadingEllipsis />
      </div>
    ) : (
      speScatterInsights && (
        <div className="solanachart-details">
          <p>{speScatterInsights}</p>
        </div>
      )
    )}
  </div>
  </div>
</div>
</div>
  );
};

export default SolanaCharts;
