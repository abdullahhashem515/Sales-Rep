// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';

// إنشاء الـ Context
export const AuthContext = createContext();

// موفر الـ Context
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // عند تحميل الصفحة، نحاول جلب التوكن من localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    if (storedToken) {
      setToken(storedToken);
      // يمكن إضافة fetch بيانات المستخدم هنا إذا أردت
      // setUser(...)
    }
  }, []);

  // حفظ التوكن في الحالة و localStorage
  const saveToken = (newToken) => {
    localStorage.setItem('userToken', newToken);
    setToken(newToken);
  };

  // إزالة التوكن
  const removeToken = () => {
    localStorage.removeItem('userToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, saveToken, removeToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook مخصص للوصول السهل للـ AuthContext في أي مكون
export const useAuth = () => {
  return useContext(AuthContext);
};
