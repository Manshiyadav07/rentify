import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AddListing from './pages/AddListing'
import ListingDetail from './pages/ListingDetail'
import MyListings from './pages/MyListings'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listings/:id" element={<ListingDetail />} />
          <Route path="/add-listing" element={
            <ProtectedRoute><AddListing /></ProtectedRoute>
          } />
          <Route path="/my-listings" element={
            <ProtectedRoute><MyListings /></ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App


