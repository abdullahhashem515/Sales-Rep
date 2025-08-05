import Dashboard from '../features/dashboard/Dashboard';
import ProductsList from '../features/products/ProductsList';
import Login from '../features/login/login';
import UsersList from '../features/users/userslist';
import Returnlist from '../features/returns/returnslist';

const routes = [
  {
    path: '/',
    children: [
      { index: true, element: <Login /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'userslist', element: <UsersList /> },
      { path: 'returnslist', element: <Returnlist /> },
      { path: 'productslist', element: <ProductsList /> },


      // أضف باقي المسارات هنا
    ],
  },
];

export default routes;
