import { Route, Routes } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Header from './components/Header';
import OfferSeat from './pages/OfferSeat';
import Footer from './components/Footer';
import SearchPage from './pages/SearchPage';
import Error from './pages/Error';
import RideDetail from './pages/RideDetail';
import Profile from './pages/Profile';

// ✅ KYC components
import KYCForm from './pages/KYCForm';
import AdminKYC from './pages/AdminKYC';

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/offer-seat" element={<OfferSeat />} />
        <Route path="/ride/:rideId" element={<RideDetail />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* ✅ KYC routes */}
        <Route path="/kyc" element={<KYCForm />} />
        <Route path="/admin/kyc" element={<AdminKYC />} />

        <Route path="/*" element={<Error />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
