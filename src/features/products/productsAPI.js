import axios from '../../api/axiosConfig';

export const fetchProducts = async () => {
  const response = await axios.get('/products');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axios.post('/products', productData);
  return response.data;
};