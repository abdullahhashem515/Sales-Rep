import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  status: 'idle',
  error: null
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // ...أضف الـ reducers هنا
  },
});

export default productsSlice.reducer;