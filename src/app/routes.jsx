import React from 'react';
import { Navigate } from 'react-router-dom'; // NEW: استيراد Navigate لاستخدامه في إعادة التوجيه
import Dashboard from '../features/dashboard/Dashboard';
import ProductsList from '../features/products/ProductsList';
import Login from '../features/login/login';
import UsersList from '../features/users/userslist';
import Returnlist from '../features/returns/returnslist';
import ProtectedRoute from './ProtectedRoute'; // استيراد مكون الحماية

// NEW: مكون بسيط لإعادة توجيه المسار الجذر بناءً على وجود التوكن
const RootRedirect = () => {
  const userToken = localStorage.getItem('userToken');
  // إذا كان هناك توكن، أعد التوجيه إلى لوحة التحكم، وإلا أعد التوجيه إلى صفحة تسجيل الدخول
  return userToken ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

const routes = [
  {
    path: '/',
    children: [
      // NEW: تعريف مسار /login بشكل صريح
      { path: 'login', element: <Login /> },

      // NEW: استخدام RootRedirect للمسار الجذر '/'
      // هذا المسار سيقوم بإعادة التوجيه إما إلى /dashboard أو /login عند الوصول إلى '/'
      { index: true, element: <RootRedirect /> },
      
      // تطبيق ProtectedRoute على المسارات المحمية
      { 
        path: 'dashboard', 
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'userslist', 
        element: (
          <ProtectedRoute>
            <UsersList />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'returnslist', 
        element: (
          <ProtectedRoute>
            <Returnlist />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'productslist', 
        element: (
          <ProtectedRoute>
            <ProductsList />
          </ProtectedRoute>
        ) 
      },
      // أضف باقي المسارات المحمية هنا بنفس الطريقة
    ],
  },
];

export default routes;
