import { useEffect } from 'react';
import "./IconBackground.css";

const IconComponent = () => {
  useEffect(() => {
    const icons = document.querySelectorAll('.icon');
    const iconSize = 30;
    const gap = 40; // Define a gap between icons for consistent spacing
    const positions = JSON.parse(localStorage.getItem('iconPositions')) || [];

    // Function to calculate positions based on a grid layout
    function calculateGridPosition(index) {
      const columns = Math.floor(window.innerWidth / (iconSize + gap));
      const x = (index % columns) * (iconSize + gap);
      const y = Math.floor(index / columns) * (iconSize + gap);
      return { x, y };
    }

    icons.forEach((icon, index) => {
      let x, y;

      // Check for previously stored positions or calculate a new grid position
      if (positions[index]) {
        ({ x, y } = positions[index]);
      } else {
        ({ x, y } = calculateGridPosition(index));
        positions.push({ x, y, size: iconSize });
        localStorage.setItem('iconPositions', JSON.stringify(positions));
      }

      // Controlled randomness for size and rotation
      const size = 17 + Math.random() * 10; // Limit size to ensure consistency
      const rotation = Math.random() * 30 - 15; // Rotate icons by a smaller range for a cleaner look

      // Apply calculated styles to each icon
      icon.style.position = 'absolute';
      icon.style.left = `${x}px`;
      icon.style.top = `${y}px`;
      icon.style.fontSize = `${size}px`;
      icon.style.transform = `rotate(${rotation}deg)`;
    });
  }, []);

  return (
    <div className="icon-background">
      <i className="bi bi-currency-bitcoin icon"></i>
      <i className="bi bi-graph-up icon"></i>
      <i className="bi bi-currency-exchange icon"></i>
      <i className="bi bi-cash-coin icon"></i>
      <i className="bi bi-pie-chart icon"></i>
      <i className="bi bi-bar-chart icon"></i>
      <i className="bi bi-diagram-3 icon"></i>
      <i className="bi bi-speedometer2 icon"></i>
      <i className="bi bi-shield icon"></i>
      <i className="bi bi-lightning icon"></i>
      <i className="bi bi-currency-bitcoin icon"></i>
      <i className="bi bi-graph-up icon"></i>
      <i className="bi bi-currency-exchange icon"></i>
      <i className="bi bi-cash-coin icon"></i>
      <i className="bi bi-pie-chart icon"></i>
      <i className="bi bi-bar-chart icon"></i>
      <i className="bi bi-diagram-3 icon"></i>
      <i className="bi bi-speedometer2 icon"></i>
      <i className="bi bi-shield icon"></i>
      <i className="bi bi-lightning icon"></i>
      <i className="bi bi-currency-bitcoin icon"></i>
      <i className="bi bi-graph-up icon"></i>
      <i className="bi bi-currency-exchange icon"></i>
      <i className="bi bi-cash-coin icon"></i>
      <i className="bi bi-pie-chart icon"></i>
      <i className="bi bi-bar-chart icon"></i>
      <i className="bi bi-diagram-3 icon"></i>
      <i className="bi bi-speedometer2 icon"></i>
      <i className="bi bi-shield icon"></i>
      <i className="bi bi-lightning icon"></i>
      <i className="bi bi-currency-bitcoin icon"></i>
      <i className="bi bi-graph-up icon"></i>
      <i className="bi bi-currency-exchange icon"></i>
      <i className="bi bi-cash-coin icon"></i>
      <i className="bi bi-pie-chart icon"></i>
      <i className="bi bi-bar-chart icon"></i>
      <i className="bi bi-diagram-3 icon"></i>
      <i className="bi bi-speedometer2 icon"></i>
      <i className="bi bi-shield icon"></i>
      <i className="bi bi-lightning icon"></i>
    </div>
  );
};

export default IconComponent;
