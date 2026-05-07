import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Dashboard from './Dashboard';
import Login from './Login';
import CCP from './CCP';
import RationalOven from './RationalOven';
import TestoFridge from './TestoFridge';
import CCPChecks from './CCPChecks';
import HotFoodCheck from './HotFoodCheck';
import CCPLogs from './CCPLogs';
import Admin from "./Admin";
import Tasks from './Tasks';
import Diary from './Diary'; 
import Delivery from './Delivery';
import Support from './Support';
import Notifications from './Notifications';

// App
const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ccp" element={<CCP />} />
      <Route path="/rational-oven" element={<RationalOven />} />
      <Route path="/testo-fridge" element={<TestoFridge />} />
      <Route path="/ccp-checks" element={<CCPChecks />} />
      <Route path="/hot-food-check" element={<HotFoodCheck />} />
      <Route path="/ccp-logs" element={<CCPLogs />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/delivery" element={<Delivery />} />
      <Route path="/diary" element={<Diary />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/support" element={<Support />} />
      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

// Render
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);