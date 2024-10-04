import { useEffect } from 'react';
import "./IconBackground.css";

const IconComponent = () => {
  useEffect(() => {
    const icons = document.querySelectorAll('.icon');
    const iconSize = 30;
    const positions = JSON.parse(localStorage.getItem('iconPositions')) || [];

    function isOverlapping(x, y, size) {
      return positions.some(({ x: px, y: py, size: ps }) => {
        const dx = px - x;
        const dy = py - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (ps / 2 + size / 2) * 2.5;
      });
    }

    icons.forEach((icon, index) => {
      let x, y;

      if (positions[index]) {
        ({ x, y } = positions[index]);
      } else {
        do {
          x = Math.random() * (window.innerWidth - iconSize);
          y = Math.random() * (window.innerHeight - iconSize);
        } while (isOverlapping(x, y, iconSize));
        positions.push({ x, y, size: iconSize });
        localStorage.setItem('iconPositions', JSON.stringify(positions));
      }

      const size = 22.5 + Math.random() * 20;
      const rotation = Math.random() * 360;

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
