import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import LandingPage from './pages/landing.jsx'
import PhotoDetail from './pages/PhotoDetail.jsx'
import Home from './pages/home.jsx'
import UserProfile from './pages/userProfile.jsx'
import MyProfile from './pages/MyProfile.jsx'
import UploadPage from './pages/UploadPage.jsx'
import EventPage from './pages/EventPage.jsx'
import AlbumPage from './pages/AlbumPage.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import CreateAlbum from './pages/CreateAlbum.jsx'
import CreateEvent from './pages/CreateEvent.jsx'
import SearchPage from './pages/SearchPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
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
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/create-album" element={<CreateAlbum />} />
      <Route path="/search" element={<SearchPage />} />
    </Routes>
  )
}

export default App
