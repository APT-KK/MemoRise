import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import SharedAlbumPage from './pages/SharedAlbumPage';
import Login from './pages/login'
import Signup from './pages/signup'
import PhotoDetail from './pages/PhotoDetail'
import Home from './pages/home'
import UserProfile from './pages/userProfile'
import MyProfile from './pages/MyProfile'
import UploadPage from './pages/UploadPage'
import EventPage from './pages/EventPage'
import AlbumPage from './pages/AlbumPage'
import VerifyEmail from './pages/VerifyEmail'
import SearchPage from './pages/SearchPage'

const RootRedirect: React.FC = () => {
  const authTokens = localStorage.getItem('authTokens');
  return authTokens ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
};
// "replace" renews the old browser history

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/photos/:id" element={<PhotoDetail />} />
      <Route path="/profile/:email" element={<UserProfile />} />
      <Route path="/my-profile" element={<MyProfile />} />
      <Route path="/event/:id" element={<EventPage />} />
      <Route path="/upload/:eventId" element={<UploadPage />} />
      <Route path="/album/:id" element={<AlbumPage />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/share/:share_token" element={<SharedAlbumPage />} />
    </Routes>
  )
}

export default App
