import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";
import SalesDashboard from "@/components/SalesDashboard";
import CaseManagement from "@/components/CaseManagement";
import { DataProvider } from "@/context/DataContext";

function App() {
  return (
    <DataProvider>
      <div className="App min-h-screen bg-[#FAFAFA]">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sales" element={<SalesDashboard />} />
            <Route path="/cases" element={<CaseManagement />} />
          </Routes>
        </BrowserRouter>
      </div>
    </DataProvider>
  );
}

export default App;
