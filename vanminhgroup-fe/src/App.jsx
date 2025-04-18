import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AssetTransferHistory from './pages/AssetTransferHistory';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="asset-transfers" element={
            <PrivateRoute>
              <AssetTransferHistory />
            </PrivateRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App; 