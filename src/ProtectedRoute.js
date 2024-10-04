/* import React, { useEffect, useState } from 'react';
import Spinner from './Spinner'; 

const ProtectedRoute = ({ element, authenticated }) => {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!authenticated) {
      setShowSpinner(true);
      const timer = setTimeout(() => {
        window.location.href = '/login';
      }, 500); 

      return () => clearTimeout(timer); 
    }
  }, [authenticated]);

  if (authenticated) {
    return element;
  }

  return showSpinner ? <Spinner /> : null; 
};

export default ProtectedRoute; */
