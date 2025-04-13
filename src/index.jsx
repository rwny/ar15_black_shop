import React from 'react';
import ReactDOM from 'react-dom/client';
// Update import path if necessary
import App from './App.jsx';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);