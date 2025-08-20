// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'https://alameenapp-backend.novelsoft.com.co/api';

/**
 * Helper function to handle errors from API calls.
 * @param {Error} error - The error object caught from axios.
 * @returns {Error} - An error object with an appropriate message for display.
 */
const handleApiError = (error) => {
  if (error.response) {
    // The server responded with an error status (e.g., 400, 401, 500)
    console.error("API Error Response:", error.response.data);
    // NEW: Create a custom error object that includes the status
    const customError = new Error(error.response.data.message || 'خطأ من الخادم.');
    customError.status = error.response.status; // Attach the HTTP status code
    return customError;
  } else if (error.request) {
    // The request was made but no response was received (network issue)
    console.error("API Network Error:", error.request);
    return new Error('خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error("API Request Setup Error:", error.message);
    return new Error(error.message || 'حدث خطأ غير متوقع.');
  }
};

/**
 * Generic function to make GET requests.
 * @param {string} endpoint - The API endpoint (e.g., 'users', 'products/1').
 * @param {string} token - The authentication token (Bearer Token).
 * @param {object} [params={}] - An object of parameters to be sent as a query string.
 * @returns {Promise<object>} - A promise that resolves with the response data.
 * @throws {Error} - Throws an error if the request fails.
 */
export const get = async (endpoint, token, params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      params: params,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Generic function to make POST requests.
 * @param {string} endpoint - The API endpoint (e.g., 'users', 'products').
 * @param {object} data - The data to be sent in the request body.
 * @param {string} token - The authentication token (Bearer Token).
 * @returns {Promise<object>} - A promise that resolves with the response data.
 * @throws {Error} - Throws an error if the request fails.
 */
export const post = async (endpoint, data, token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Generic function to make PUT requests.
 * Used to update an existing resource entirely.
 * @param {string} endpoint - The API endpoint (e.g., 'users/1', 'products/xyz').
 * @param {object} data - The updated data to be sent in the request body.
 * @param {string} token - The authentication token (Bearer Token).
 * @returns {Promise<object>} - A promise that resolves with the response data.
 * @throws {Error} - Throws an error if the request fails.
 */
export const put = async (endpoint, data, token) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${endpoint}`, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json', 
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Generic function to make DELETE requests.
 * @param {string} endpoint - The API endpoint (e.g., 'users/1', 'products/xyz').
 * @param {string} token - The authentication token (Bearer Token).
 * @returns {Promise<object>} - A promise that resolves with the response data.
 * @throws {Error} - Throws an error if the request fails.
 */
export const del = async (endpoint, token) => { // 'delete' is a reserved keyword, using 'del'
  try {
    const response = await axios.delete(`${API_BASE_URL}/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};



