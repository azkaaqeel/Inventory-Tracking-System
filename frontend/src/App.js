import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./components/LoginPage";
import AdminDashboard from "./components/AdminDashboard";
import StoreDashboard from "./components/StoreDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/store" element={<StoreDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
