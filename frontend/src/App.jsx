import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'
import LandingPage from './pages/landing.jsx'
import PhotoDetail from './pages/PhotoDetail.jsx'
import Home from './pages/home.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/photos/:id" element={<PhotoDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
