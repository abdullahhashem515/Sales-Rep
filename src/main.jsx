import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'react-toastify/dist/ReactToastify.css'; // تأكد من استيراد الـ CSS
import { ToastContainer } from 'react-toastify'; // NEW: استيراد ToastContainer

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* ToastContainer يجب أن يكون هنا ليكون مرئيًا دائمًا عبر التطبيق */}
    <ToastContainer 
      position="bottom-right" 
      autoClose={5000} 
      hideProgressBar={false} 
      newestOnTop={false} 
      closeOnClick 
      rtl={true} // تأكد من هذه الخاصية إذا كان اتجاه النص من اليمين لليسار
      pauseOnFocusLoss 
      draggable 
      pauseOnHover 
    />
  </StrictMode>,
);
