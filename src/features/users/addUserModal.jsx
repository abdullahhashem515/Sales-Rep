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
      setRole('مدير'); // Reset to default role (مدير)
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
      // Note: email will be empty if role is not 'مدير' due to conditional rendering
      const formData = {
          fullName,
          phoneNumber,
          email, // Email might be empty if not 'مدير'
          role,
          password,
          confirmPassword,
          accountStatus,
      };

      console.log("Form Data:", formData);

      // Validate form using the external validation service
      // The validation service will only validate email if role is 'مدير'
      const validationErrors = validateAddUserForm(formData);
      setErrors(validationErrors);
      console.log("Validation Errors Object:", validationErrors);

      if (Object.keys(validationErrors).length > 0) {
          toast.error('يرجى تصحيح الأخطاء في النموذج.');
          return;
      }

      setIsLoading(true);

      try {
          const token = localStorage.getItem('userToken');
          console.log("Retrieved Token from localStorage:", token);

          if (!token) {
              const authError = 'لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.';
              setGeneralError(authError);
              toast.error(authError);
              setIsLoading(false);
              return;
          }

          // Map front-end role to backend's type_user for the API call
          let typeUserValue = '';
          if (formData.role === 'مندوب جملة') {
              typeUserValue = 'ws_rep';
          } else if (formData.role === 'مندوب التجزئة') {
              typeUserValue = 'retail_rep';
          } else {
              // NEW LOGIC: If role is not specific, assume 'admin' for backend
              typeUserValue = 'admin'; // Assuming 'مدير' maps to 'admin' in backend
          }

          // Construct the data payload for the backend API based on backend expectations
          const apiPayload = {
              name: formData.fullName,
              email: formData.email, // Email will be sent as empty string if not 'مدير'
              phone: formData.phoneNumber,
              password: formData.password,
              confirm_password: formData.confirmPassword,
              type_user: typeUserValue,
              status: formData.accountStatus === 'نشط' ? 'active' : 'inactive',
          };

          console.log("API Payload being sent:", apiPayload);

          const response = await post('admin/register-user', apiPayload, token);

          if (response.status) {
              toast.success('تم إنشاء المستخدم بنجاح!');
              handleClose();
          } else {
              const apiErrorMessage = response.message || 'فشل إنشاء المستخدم.';
              setGeneralError(apiErrorMessage);
              toast.error(apiErrorMessage);
          }
      } catch (error) {
          console.error("Error creating user:", error);
          const errorMessage = error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
          setGeneralError(errorMessage);
          toast.error(errorMessage);
      } finally {
          setIsLoading(false);
      }
  };

  // Construct fields configuration for the FormLayout
  // Conditionally include the email field based on the selected role
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
        // Role select field is always present
        {
          label: "الدور",
          type: "select",
          value: role,
          onChange: (e) => setRole(e.target.value),
          options: ['مدير', 'مندوب جملة', 'مندوب التجزئة'],
          error: errors.role,
        },
        // Conditionally render Email field if role is 'مدير'
        ...(role === 'مدير' ? [{
          label: "البريد الإلكتروني",
          type: "email",
          placeholder: "البريد الإلكتروني",
          value: email,
          onChange: (e) => setEmail(e.target.value),
          error: errors.email,
        }] : []),
      ].filter(Boolean), // Filter out any false/null values if email field is not rendered
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
