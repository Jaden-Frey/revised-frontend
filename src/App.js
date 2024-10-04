import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import ProtectedRoute from "./ProtectedRoute";
import Spinner from "./Spinner";
import IconComponent from "./IconBackground";
import "./Questionmark.css";
import axios from 'axios';


function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(true); 
  
  // Function to check authentication status
  const checkAuthentication = async () => {
    try {
      const response = await axios.get('https://revised-backend-refined.onrender.com/auth/check', { withCredentials: true }); 
  
      setAuthenticated(response.data.authenticated || false); 
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
  }

  return (
    <Router>
      <div className="App">
        <IconComponent />
        <header className="App-header">
          <div id="logo-container" className="logo-container" title="React Frontend">
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

        {/* Protected Routes */}
        <main>
          <Routes>
            {/* Redirect to login if not authenticated */}
            <Route path="/" element={<ProtectedRoute element={<HomePage />} authenticated={authenticated} />} />
            <Route path="/ethereum" element={<ProtectedRoute element={<EthereumPage />} authenticated={authenticated} />} />
            <Route path="/bitcoin" element={<ProtectedRoute element={<Bitcoin />} authenticated={authenticated} />} />
            <Route path="/tether" element={<ProtectedRoute element={<Tether />} authenticated={authenticated} />} />
            <Route path="/binancecoin" element={<ProtectedRoute element={<Bnb />} authenticated={authenticated} />} />
            <Route path="/solana" element={<ProtectedRoute element={<SolanaPage />} authenticated={authenticated} />} />
            <Route path="/usd-coin" element={<ProtectedRoute element={<Usdc />} authenticated={authenticated} />} />
            <Route path="/ripple" element={<ProtectedRoute element={<Xrp />} authenticated={authenticated} />} />
            <Route path="/dogecoin" element={<ProtectedRoute element={<Doge />} authenticated={authenticated} />} />
            <Route path="/cardano" element={<ProtectedRoute element={<Cardano />} authenticated={authenticated} />} />
            <Route path="/polkadot" element={<ProtectedRoute element={<Polkadot />} authenticated={authenticated} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 