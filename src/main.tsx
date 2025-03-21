import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './lib/AuthContext'
import { NotificationProvider } from './lib/NotificationContext'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </AuthProvider>
);
