import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * مكون لإعادة توجيه المسار الجذر بناءً على وجود رمز المصادقة (token).
 * إذا كان هناك توكن، يعيد التوجيه إلى لوحة التحكم، وإلا يعيد التوجيه إلى صفحة تسجيل الدخول.
 */
const RootRedirect = () => {
  const userToken = localStorage.getItem('userToken');
  // إذا كان هناك توكن، أعد التوجيه إلى لوحة التحكم، وإلا أعد التوجيه إلى صفحة تسجيل الدخول
  return userToken ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

export default RootRedirect;
