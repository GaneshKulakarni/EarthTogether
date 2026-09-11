import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './dark-theme.css';
import App from './App';

// Unregister any lingering service workers from previous projects on localhost
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
    }
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);
