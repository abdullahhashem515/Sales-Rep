import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // الحصول على التوكن من التخزين المحلي (localStorage)
  const userToken = localStorage.getItem('userToken');

  // إذا لم يكن هناك توكن، أعد التوجيه إلى صفحة تسجيل الدخول
  if (!userToken) {
    return <Navigate to="/login" replace />;
  }

  // إذا كان هناك توكن، اسمح بالوصول إلى المكونات الفرعية (المسار المحمي)
  return children;
};

export default ProtectedRoute;
