import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "@/components/LandingPage";
import Dashboard from "@/components/Dashboard";
import UploadPage from "@/components/UploadPage";
import SalesDashboard from "@/components/SalesDashboard";

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const onDataUpdated = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="App min-h-screen bg-[#FAFAFA]">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard key={refreshKey} />} />
          <Route path="/sales" element={<SalesDashboard />} />
          <Route path="/upload" element={<UploadPage onDataUpdated={onDataUpdated} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
