import { createRoot } from 'react-dom/client';
import { AppProvider } from './context/AppContext.jsx';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
// import { Toaster } from './components/ui/toaster.jsx';
import { ToastContainer } from 'react-toastify';

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <AppProvider>
        <ToastContainer/>
        <App />
      </AppProvider>
    </BrowserRouter>
);
