import React from 'react';
// Navigate لم يعد مستخدمًا هنا مباشرة، لأنه الآن داخل RootRedirect
import Dashboard from '../features/dashboard/Dashboard';
import ProductsList from '../features/products/ProductsList';
import Login from '../features/login/login';
import UsersList from '../features/users/userslist';
import Returnlist from '../features/returns/returnslist';
import ProtectedRoute from './ProtectedRoute'; // استيراد مكون الحماية
import RootRedirect from '../app/RootRedirect'; // NEW: استيراد RootRedirect من ملفه الجديد
import Orderslist from '../features/orders/orderslist';
import Invoiceslist from '../features/invoices/invoiceslist';
import Customerslist from '../features/customers/customerslist';
import Inventorieslist from '../features/inventories/inventorieslist';
import Accountslist from '../features/accounts/accountslist';
import Visitslist from '../features/visits/visitslist';
import Voucherslist from '../features/vouchers/voucherslist';
import Reportslist from '../features/reports/reportslist';
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
        { 
        path: 'orderslist', 
        element: (
          <ProtectedRoute>
            <Orderslist />
          </ProtectedRoute>
        ) 
      },
       { 
        path: 'invoiceslist', 
        element: (
          <ProtectedRoute>
            <Invoiceslist />
          </ProtectedRoute>
        ) 
      },

      { 
        path: 'customerslist', 
        element: (
          <ProtectedRoute>
            <Customerslist />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'inventorieslist', 
        element: (
          <ProtectedRoute>
            <Inventorieslist />
          </ProtectedRoute>
        ) 
      },
       { 
        path: 'accountslist', 
        element: (
          <ProtectedRoute>
            <Accountslist />
          </ProtectedRoute>
        ) 
      },
        { 
        path: 'visitslist', 
        element: (
          <ProtectedRoute>
            <Visitslist />
          </ProtectedRoute>
        ) 
      },
       { 
        path: 'voucherslist', 
        element: (
          <ProtectedRoute>
            <Voucherslist />
          </ProtectedRoute>
        ) 
      },
        { 
        path: 'reportslist', 
        element: (
          <ProtectedRoute>
            <Reportslist />
          </ProtectedRoute>
        ) 
      },
      // أضف باقي المسارات المحمية هنا بنفس الطريقة
    ],
  },
];

export default routes;
