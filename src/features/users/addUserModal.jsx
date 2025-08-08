import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify'; // Import toast for notifications
// Ensure 'react-toastify/dist/ReactToastify.css' is imported globally in your App.js or main.jsx
import { post } from '../../utils/apiService'; // Import generic 'post' function
import { validateAddUserForm } from '../../utils/validationService'; // Import validation service
import ModalWrapper from '../../components/shared/ModalWrapper'; // Import ModalWrapper
import FormLayout from '../../components/shared/FormLayout'; // Import generic FormLayout

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

      // Log the form data for debugging
      console.log("Form Data:", formData);

      setIsLoading(true); // Set loading state to true for client-side validation too (as it's async)

      try {
          const token = localStorage.getItem('userToken'); // Get token from localStorage
          console.log("Retrieved Token from localStorage:", token); // Log the token

          if (!token) {
              const authError = 'لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.';
              setGeneralError(authError);
              toast.error(authError);
              setIsLoading(false);
              return;
          }

          // Validate form using the external asynchronous validation service
          // Pass the token to the validation service for uniqueness check
          const validationErrors = await validateAddUserForm(formData, token); // NOW AWAITING VALIDATION
          setErrors(validationErrors); // Set validation errors to state
          console.log("Validation Errors Object (after async check):", validationErrors); // Log the errors object

          if (Object.keys(validationErrors).length > 0) {
              toast.error('يرجى تصحيح الأخطاء في النموذج.');
              setIsLoading(false); // Stop loading if validation fails
              return; // Stop if validation fails
          }

          // Map front-end role to backend's type_user for the API call
          let typeUserValue = '';
          if (formData.role === 'مندوب جملة') {
              typeUserValue = 'ws_rep';
          } else if (formData.role === 'مندوب التجزئة') {
              typeUserValue = 'retail_rep';
          } else {
              // This case should ideally be caught by validationService, but good for robustness
              const roleErrorMsg = 'الدور المحدد غير صالح للـ API (يجب أن يكون مندوب جملة أو مندوب التجزئة).';
              setGeneralError(roleErrorMsg);
              toast.error(roleErrorMsg);
              setIsLoading(false);
              return;
          }

          // Construct the data payload for the backend API based on backend expectations
          const apiPayload = {
              name: formData.fullName,
              email: formData.email,
              phone: formData.phoneNumber,
              password: formData.password,
              confirm_password: formData.confirmPassword,
              type_user: typeUserValue,
              status: formData.accountStatus === 'نشط' ? 'active' : 'inactive',
          };

          console.log("API Payload being sent:", apiPayload); // Log the payload

          // Make API call using the generic 'post' function
          // Endpoint is 'admin/register-user' as per successful Postman test
          const response = await post('admin/register-user', apiPayload, token);

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
          // Errors from apiService's generic functions are already processed and re-thrown with a 'message' property
          const errorMessage = error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
          setGeneralError(errorMessage);
          toast.error(errorMessage);
      } finally {
          setIsLoading(false); // Always set loading to false
      }
  };

  // Construct fields configuration for the FormLayout
  const fieldsConfig = [
    {
      fields: [
        {
          label: "الاسم الكامل",
          type: "text",
          placeholder: "الاسم الكامل",
          value: fullName,
          onChange: (e) => setFullName(e.target.value),
          error: errors.fullName,
        },
        {
          label: "رقم الجوال",
          type: "text",
          placeholder: "رقم الجوال",
          value: phoneNumber,
          onChange: (e) => setPhoneNumber(e.target.value),
          error: errors.phoneNumber,
        },
      ],
    },
    {
      fields: [
        {
          label: "البريد الإلكتروني",
          type: "email",
          placeholder: "البريد الإلكتروني",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          error: errors.email,
        },
        {
          label: "الدور",
          type: "select",
          value: role,
          onChange: (e) => setRole(e.target.value),
          options: ['مدير', 'مندوب جملة', 'مندوب التجزئة'],
          error: errors.role,
        },
      ],
    },
    {
      fields: [
        {
          label: "كلمة المرور",
          type: "password",
          placeholder: "كلمة المرور",
          value: password,
          onChange: (e) => setPassword(e.target.value),
          error: errors.password,
        },
        {
          label: "تأكيد كلمة السر",
          type: "password",
          placeholder: "تأكيد كلمة المرور",
          value: confirmPassword,
          onChange: (e) => setConfirmPassword(e.target.value),
          error: errors.confirmPassword,
        },
      ],
    },
    {
      fields: [
        {
          label: "حالة الحساب",
          type: "select",
          value: accountStatus,
          onChange: (e) => setAccountStatus(e.target.value),
          options: ['نشط', 'غير نشط'],
        },
      ],
    },
  ];

  // لا تعرض شيئًا إذا المودال لم يتم استدعاؤه بعد الإغلاق
  if (!show) return null;

  return (
    <ModalWrapper show={show} onClose={handleClose} isVisible={isVisible} title="إضافة مستخدم">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-right">
        <FormLayout fieldsConfig={fieldsConfig} /> {/* Use the generic FormLayout */}

        {generalError && <p className="text-red-500 text-center text-sm mt-2">{generalError}</p>}

        <button
          type="submit"
          className="mt-4 accentColor hover:bg-purple-700 py-2 px-4 rounded"
          disabled={isLoading} // Disable button during API call
        >
          {isLoading ? 'جاري إنشاء المستخدم...' : 'إنشاء المستخدم'}
        </button>
      </form>
    </ModalWrapper>
  );
}
