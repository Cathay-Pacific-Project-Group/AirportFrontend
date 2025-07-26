import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';         // ✅ 改這一行
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);