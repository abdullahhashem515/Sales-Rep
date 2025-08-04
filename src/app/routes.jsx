import Dashboard from '../features/dashboard/Dashboard';
import ProductsList from '../features/products/ProductsList';
import Login from '../features/login/login';
import UsersList from '../features/users/userslist';

const routes = [
  {
    path: '/',
    children: [
      { index: true, element: <Login /> },
      { path: 'products', element: <ProductsList /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'userslist', element: <UsersList /> },
      // أضف باقي المسارات هنا
    ],
  },
];

export default routes;
