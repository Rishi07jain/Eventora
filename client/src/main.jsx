import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>  {/*we wrapped our App with AuthProvider , so now our app has access to everything in AuthContext ie login , register , verifyOtp etc everything in AuthContext file */}
      <App />
    </AuthProvider>
  </StrictMode>,
)
