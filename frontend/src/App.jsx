import './App.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Login from './pages/login.jsx'
import Signup from './pages/signup.jsx'

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-xl p-8 space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome</h1>
          <p className="text-sm text-slate-500">
            Choose an option to continue.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 transition"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
