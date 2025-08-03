import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E40AF', // أزرق tailwind
    },
  },
  direction: 'rtl', // للدعم الكامل للعربية
});

export default theme;