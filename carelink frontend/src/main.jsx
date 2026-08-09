/**
 * @file main.jsx
 * @description Entry point for Carelink HMS React Application.
 * Imports Bootstrap CSS, Bootstrap Icons, custom global styles, and mounts App root.
 */

import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// Import Bootstrap 5 CSS and Bootstrap Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a', color: '#94a3b8', fontFamily: 'Inter, system-ui, sans-serif' }}>Loading Carelink HMS…</div>}>
        <App />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);
