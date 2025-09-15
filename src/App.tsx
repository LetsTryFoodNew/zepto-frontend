import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PoListPage from './pages/PoListPage';
import PoDetailsPage from './pages/PoDetailsPage';
import AsnCreatePage from './pages/AsnCreatePage';
const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<PoListPage />} />
      <Route path="/po/:code" element={<PoDetailsPage />} />
      <Route path="/asn/create" element={<AsnCreatePage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
