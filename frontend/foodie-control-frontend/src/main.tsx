import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import Login from './Login';
import CCP from './CCP';
import RationalFridge from './RationalFridge';
import RationalOven from './RationalOven';
import TestoFridge from './TestoFridge';
import CCPChecks from './CCPChecks';
import HotFoodCheck from './HotFoodCheck';
import CCPLogs from './CCPLogs';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ccp" element={<CCP />} />
      <Route path="/rational-fridges" element={<RationalFridge />} />
      <Route path="/rational-oven" element={<RationalOven />} />
      <Route path="/testo-fridge" element={<TestoFridge />} />
      <Route path="/ccp-checks" element={<CCPChecks />} />
      <Route path="/hot-food-check" element={<HotFoodCheck />} />
      <Route path="/ccp-logs" element={<CCPLogs />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);