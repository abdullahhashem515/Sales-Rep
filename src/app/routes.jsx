import React from 'react';
// Navigate لم يعد مستخدمًا هنا مباشرة، لأنه الآن داخل RootRedirect
import Dashboard from '../features/dashboard/Dashboard';
import ProductsList from '../features/products/ProductsList';
import Login from '../features/login/login';
import UsersList from '../features/users/userslist';
import Returnlist from '../features/returns/returnslist';
import ProtectedRoute from './ProtectedRoute'; // استيراد مكون الحماية
import RootRedirect from '../app/RootRedirect'; // NEW: استيراد RootRedirect من ملفه الجديد

const routes = [
  {
    path: '/',
    children: [
      // تعريف مسار /login بشكل صريح
      { path: 'login', element: <Login /> },

      // استخدام RootRedirect للمسار الجذر '/'
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
