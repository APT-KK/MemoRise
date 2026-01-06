import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WebSocketProvider } from './context/WebSocketContext'; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <WebSocketProvider> 
        <App />
        <Toaster position="top-right" />
      </WebSocketProvider>
    </BrowserRouter>
  </React.StrictMode>,
);