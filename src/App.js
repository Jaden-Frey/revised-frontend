import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./HomePage";
import EthereumPage from "./EthereumPage";
import Bitcoin from "./Bitcoin";
import Tether from "./Tether";
import Bnb from "./Bnb";
import SolanaPage from "./SolanaPage";
import Usdc from "./Usdc";
import Xrp from "./Xrp";
import Doge from "./Doge";
import Cardano from "./Cardano";
import Polkadot from "./Polkadot";
// import ProtectedRoute from "./ProtectedRoute"; 
//import Spinner from "./Spinner";
import IconComponent from "./IconBackground";
import "./Questionmark.css";

function App() {
  /* const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false); 

  // Function to check authentication status - Commented out to bypass auth
  const checkAuthentication = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/check', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAuthenticated(data.authenticated); 
      } else {
        setAuthenticated(false); 
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setAuthenticated(false); 
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  if (loading) {
    return <Spinner />;
  } */

  return (
    <Router>
      <div className="App">
        <IconComponent />
        <header className="App-header">
          <div id="logo-container" className="logo-container" title="Crytonite's Frontend">
            <div className="logo" id="logout-button">
              <span className="logo-text"><b>CRYPT</b></span>
              <div className="logo-gem-container">
                <i className="bi bi-gem logo-gem"></i>
              </div>
              <span className="logo-text"><b>NITE</b></span>
            </div>
          </div>
        </header>

        {/* Navigation Menu */}
        <nav>
          <ul className="menu">
            <li className="menu-item">
              <a href="https://revised-backend-refined.onrender.com/" target="_blank" rel="noopener noreferrer">TUTORIAL PAGE</a>
            </li>
            <li className="menu-item">
              <a href="https://revised-backend-refined.onrender.com/marksum" target="_blank" rel="noopener noreferrer">MARKET SUMMARY</a>
            </li>
            <li className="menu-item">
              <a href="https://revised-backend-refined.onrender.com/coins" target="_blank" rel="noopener noreferrer">CURRENCY PAGE</a>
            </li>
            <li className="menu-item">
              <a href="https://revised-backend-refined.onrender.com/favourites" target="_blank" rel="noopener noreferrer">FAVOURITES PAGE</a>
            </li>
          </ul>
        </nav>

        {/* Link to Bootstrap Icons */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
        />

        {/* Routes without authentication */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ethereum" element={<EthereumPage />} />
            <Route path="/bitcoin" element={<Bitcoin />} />
            <Route path="/tether" element={<Tether />} />
            <Route path="/binancecoin" element={<Bnb />} />
            <Route path="/solana" element={<SolanaPage />} />
            <Route path="/usd-coin" element={<Usdc />} />
            <Route path="/ripple" element={<Xrp />} />
            <Route path="/dogecoin" element={<Doge />} />
            <Route path="/cardano" element={<Cardano />} />
            <Route path="/polkadot" element={<Polkadot />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
