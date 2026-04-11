import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { RecaptchaProvider } from './contexts/RecaptchaContext';
import App from './App';
import './index.css';

const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <RecaptchaProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RecaptchaProvider>
    </HelmetProvider>
  </React.StrictMode>,
);

