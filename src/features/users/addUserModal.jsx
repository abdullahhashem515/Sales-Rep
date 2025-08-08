import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from 'react-toastify'; // Import toast for notifications
import 'react-toastify/dist/ReactToastify.css'; // Ensure this is imported globally if not already
import { registerUserApi } from '../../utils/apiService'; // NEW: Import API service
import { validateAddUserForm } from '../../utils/validationService'; // NEW: Import validation service

export default function AddUserModal({ show, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  // State for form fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('مدير'); // Default role
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountStatus, setAccountStatus] = useState('نشط');

  // State for error messages - Unified into one object
  const [errors, setErrors] = useState({}); // Unified state for all form errors
  const [generalError, setGeneralError] = useState(''); // For API errors

  const [isLoading, setIsLoading] = useState(false); // Loading state for API call

  // عند تغيير show من الخارج (props)
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Reset form fields and errors when modal opens
      setFullName('');
      setPhoneNumber('');
      setEmail('');
      setRole('مدير');
      setPassword('');
      setConfirmPassword('');
      setAccountStatus('نشط');
      setErrors({}); // Reset all validation errors
      setGeneralError('');
    }
  }, [show]);

  // دالة إغلاق مع أنميشن
  const handleClose = () => {
    setIsVisible(false);
    // انتظر 100ms قبل إغلاق المودال نهائيًا
    setTimeout(() => {
      onClose();
    }, 100);
  };

  // Handle form submission with validation and API call
  const handleSubmit = async (e) => {
    e.preventDefault();

    setGeneralError(''); // Reset general API error

    // Collect form data to pass to validation service
    const formData = {
      fullName,
      phoneNumber,
      email,
      role, // Pass role as is, validation service will handle type_user mapping
      password,
      confirmPassword,
      accountStatus,
    };

    // Validate form using the external validation service
    const validationErrors = validateAddUserForm(formData);
    setErrors(validationErrors); // Set validation errors to state

    if (Object.keys(validationErrors).length > 0) {
      toast.error('يرجى تصحيح الأخطاء في النموذج.');
      return; // Stop if validation fails
    }

    setIsLoading(true); // Set loading state to true

    try {
      const token = localStorage.getItem('userToken'); // Get token from localStorage
      if (!token) {
        const authError = 'لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.';
        setGeneralError(authError);
        toast.error(authError);
        setIsLoading(false);
        return;
      }

      // Make API call using the external API service
      // The API service will handle mapping 'role' to 'type_user' and backend field names
      const response = await registerUserApi(formData, token);

      if (response.status) { // Assuming 'status: true' indicates success from your backend
        toast.success('تم إنشاء المستخدم بنجاح!');
        handleClose(); // Close modal on successful submission
      } else {
        // Handle specific error messages from the backend if API returns status: false
        const apiErrorMessage = response.message || 'فشل إنشاء المستخدم.';
        setGeneralError(apiErrorMessage);
        toast.error(apiErrorMessage);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      // Errors from apiService already processed and re-thrown with a 'message' property
      const errorMessage = error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
      setGeneralError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false); // Always set loading to false
    }
  };

  // لا تعرض شيئًا إذا المودال لم يتم استدعاؤه بعد الإغلاق
  if (!show) return null;

  return (
    <div className="amiriFont fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div
        className={`bg-gray-900 text-white p-6 rounded-lg w-full max-w-2xl relative transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-xl font-bold mb-4 text-right">إضافة مستخدم</h2>

        <button
          onClick={handleClose}
          className="absolute top-2 left-2 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-right">
          {/* Row 1: Full Name and Phone Number */}
          <div className="flex flex-col md:flex-row md:gap-4">
            <div className="flex-1 mb-3 md:mb-0">
              <label className="block mb-1">الاسم الكامل</label>
              <input
                type="text"
                placeholder="الاسم الكامل"
                className={`w-full p-2 rounded bg-gray-800 border ${errors.fullName ? 'border-red-500' : 'border-gray-600'}`}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div className="flex-1">
              <label className="block mb-1">رقم الجوال</label>
              <input
                type="text"
                placeholder="رقم الجوال"
                className={`w-full p-2 rounded bg-gray-800 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-600'}`}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>
          </div>

          {/* Row 2: Email and Role */}
          <div className="flex flex-col md:flex-row md:gap-4">
            <div className="flex-1 mb-3 md:mb-0">
              <label className="block mb-1">البريد الإلكتروني</label>
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className={`w-full p-2 rounded bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-600'}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="flex-1">
              <label className="block mb-1">الدور</label>
              <select
                className={`w-full p-2 rounded bg-gray-800 border ${errors.role ? 'border-red-500' : 'border-gray-600'}`}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>مدير</option>
                <option>مندوب جملة</option>
                <option>مندوب التجزئة</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>
          </div>

          {/* Row 3: Password and Confirm Password */}
          <div className="flex flex-col md:flex-row md:gap-4">
            <div className="flex-1 mb-3 md:mb-0">
              <label className="block mb-1">كلمة المرور</label>
              <input
                type="password"
                placeholder="كلمة المرور"
                className={`w-full p-2 rounded bg-gray-800 border ${errors.password ? 'border-red-500' : 'border-gray-600'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div className="flex-1">
              <label className="block mb-1">تأكيد كلمة السر</label>
              <input
                type="password"
                placeholder="تأكيد كلمة المرور"
                className={`w-full p-2 rounded bg-gray-800 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-600'}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Row 4: Account Status (single field in this row as per request) */}
          <div className="flex flex-col md:flex-row md:gap-4">
            <div className="flex-1">
              <label className="block mb-1">حالة الحساب</label>
              <select
                className="w-full p-2 rounded bg-gray-800 border border-gray-600"
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value)}
              >
                <option>نشط</option>
                <option>غير نشط</option>
              </select>
            </div>
            <div className="flex-1"></div>
          </div>

          {generalError && <p className="text-red-500 text-center text-sm mt-2">{generalError}</p>}

          <button
            type="submit"
            className="mt-4 accentColor hover:bg-purple-700 py-2 px-4 rounded"
            disabled={isLoading} // Disable button during API call
          >
            {isLoading ? 'جاري إنشاء المستخدم...' : 'إنشاء المستخدم'}
          </button>
        </form>
      </div>
      {/* ToastContainer should typically be in your root App.js or main.jsx once */}
      {/* <ToastContainer position="bottom-right" /> */}
    </div>
  );
}
