import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import GrokAssistantWidget from './components/GrokAssistantWidget';
import ProtectedRoute from './components/ProtectedRoute';

// Commercial & Intelligent Platform Pages
import Home from './pages/Home';
import BookDetail from './pages/BookDetail';
import CartCheckout from './pages/CartCheckout';
import Wishlist from './pages/Wishlist';
import RentalHistory from './pages/RentalHistory';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Preserved Peer-to-Peer Study Exchange Pages
import PeerNotes from './pages/PeerNotes';
import AddListing from './pages/AddListing';
import ListingDetail from './pages/ListingDetail';
import MyListings from './pages/MyListings';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1">
        <Routes>
          {/* Core Catalog & Discovery */}
          <Route path="/" element={<Home />} />
          <Route path="/books/:id" element={<BookDetail />} />

          {/* Authentication & Account Recovery */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* Authenticated User Workflows */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CartCheckout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rental-history"
            element={
              <ProtectedRoute>
                <RentalHistory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Role-Protected Admin Operations */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Preserved Peer-to-Peer Study Resource Exchange */}
          <Route path="/peer-notes" element={<PeerNotes />} />
          <Route path="/listings" element={<PeerNotes />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route
            path="/add-listing"
            element={
              <ProtectedRoute>
                <AddListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListings />
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Persistent Global Modals & Widgets */}
      <CartDrawer />
      <GrokAssistantWidget />

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default App;
