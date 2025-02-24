
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './pages/auth';
import Dashboard from './pages/home';
import EmergencyDetailsPage from './pages/profile';

function App() {


  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Auth />} />
      <Route path='/home' element={<Dashboard />} />
      <Route path='/profile/:id' element={<EmergencyDetailsPage />} />
    </Routes>
  </BrowserRouter>
  )
}

export default App
