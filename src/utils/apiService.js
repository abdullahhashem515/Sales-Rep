// src/services/apiService.js
import axios from 'axios';

const API_BASE_URL = 'https://alameenapp-backend.novelsoft.com.co/api';

/**
 * دالة لإنشاء مستخدم جديد عبر الـ API
 * @param {object} userData - بيانات المستخدم من النموذج (fullName, phoneNumber, email, role, password, confirmPassword, accountStatus)
 * @param {string} token - رمز المصادقة (Bearer Token)
 * @returns {Promise<object>} - وعد بكائن استجابة الـ API (response.data)
 * @throws {Error} - يرمي خطأ إذا فشل الطلب أو الاستجابة
 */
export const registerUserApi = async (userData, token) => {
  // Map front-end role to backend's type_user
  let typeUserValue = '';
  if (userData.role === 'مندوب جملة') {
    typeUserValue = 'ws_rep';
  } else if (userData.role === 'مندوب التجزئة') {
    typeUserValue = 'retail_rep';
  } else {
    // This case should ideally be caught by validationService
    // but included for robustness if this function is called directly
    throw new Error('الدور المحدد غير صالح للـ API.');
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}/register-user`,
      {
        name: userData.fullName, // Backend expects 'name'
        email: userData.email,
        phone: userData.phoneNumber, // Backend expects 'phone'
        password: userData.password,
        confirm_password: userData.confirmPassword, // Backend expects 'confirm_password'
        type_user: typeUserValue, // Backend expects 'type_user'
        status: userData.accountStatus === 'نشط' ? 'active' : 'inactive', // Convert status
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data; // Return the data part of the response
  } catch (error) {
    // Re-throw error after processing for component to catch and display
    if (error.response) {
      // Server responded with a status other than 2xx
      throw new Error(error.response.data.message || 'خطأ من الخادم.');
    } else if (error.request) {
      // Request was made but no response was received
      throw new Error('خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.');
    } else {
      // Something happened in setting up the request
      throw new Error(error.message || 'حدث خطأ غير متوقع.');
    }
  }
};

// يمكنك إضافة دوال أخرى للـ API هنا (مثل getUser, updateUser, deleteUser, etc.)
