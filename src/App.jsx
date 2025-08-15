import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { store } from './app/store';
import { router } from './app/router.jsx';
import { ThemeProvider } from '@mui/material';
import theme from './app/theme';
import { AuthProvider } from './contexts/AuthContext'; // ✅ إضافة

function App() {
  return (
    <Provider store={store}>
      <AuthProvider> {/* ✅ تغليف التطبيق */}
        <ThemeProvider theme={theme}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
