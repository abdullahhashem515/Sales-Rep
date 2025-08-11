import React, { useEffect, useState } from "react";
import { toast } from 'react-toastify'; // Import toast for notifications
// Ensure 'react-toastify/dist/ReactToastify.css' is imported globally in your App.js or main.jsx
import { post } from '../../utils/apiService'; // FIXED: Import from utils
import { validateAddUserForm } from '../../utils/validationService'; // FIXED: Import from utils
import ModalWrapper from '../../components/shared/ModalWrapper'; // Import ModalWrapper
import FormLayout from '../../components/shared/FormLayout'; // Import generic FormLayout

// Added defaultRole prop to allow pre-setting the role and disabling the field
export default function AddUserModal({ show, onClose, defaultRole = 'مندوب جملة' }) { 
  const [isVisible, setIsVisible] = useState(false);
  // State for form fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(defaultRole); // Initialize role with defaultRole
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
      setRole(defaultRole); // Ensure role resets to defaultRole when shown
      setPassword('');
      setConfirmPassword('');
      setAccountStatus('نشط');
      setErrors({}); // Reset all validation errors
      setGeneralError('');
    }
  }, [show, defaultRole]); // Added defaultRole to dependencies

  // دالة إغلاق مع أنميشن
  const handleClose = (isSuccess = false) => { // ADDED isSuccess parameter, default to false
    setIsVisible(false);
    // انتظر 100ms قبل إغلاق المودال نهائيًا
    setTimeout(() => {
      onClose(isSuccess); // Pass isSuccess to the onClose callback
    }, 100);
  };

  // Handle form submission with validation and API call
  const handleSubmit = async (e) => {
      e.preventDefault();

      setGeneralError(''); // Reset general API error

      // Collect form data to pass to validation service
      // Note: email will be empty if role is not 'مدير' due2 to conditional rendering
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
          let endpoint = ''; 
          if (formData.role === 'مندوب جملة') {
              typeUserValue = 'ws_rep';
              endpoint = 'admin/register-user'; 
          } else if (formData.role === 'مندوب التجزئة') {
              typeUserValue = 'retail_rep';
              endpoint = 'admin/register-user'; 
          } else { // Assuming 'مدير' role
              typeUserValue = 'admin';
              endpoint = 'admin/create-admin'; 
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

          console.log("API Payload being sent:", apiPayload);
          console.log("API Endpoint for creation:", endpoint); 

          const response = await post(endpoint, apiPayload, token); 

          if (response.status) {
              toast.success('تم إنشاء المستخدم بنجاح!');
              handleClose(true); // Call handleClose with true on success
          } else {
              const apiErrorMessage = response.message || 'فشل إنشاء المستخدم.';
              setGeneralError(apiErrorMessage);
              toast.error(apiErrorMessage);
              handleClose(false); // Call handleClose with false on failure
          }
      } catch (error) {
          console.error("Error creating user:", error);
          const errorMessage = error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
          setGeneralError(errorMessage);
          toast.error(errorMessage);
          handleClose(false); // Call handleClose with false on error
      } finally {
          setIsLoading(false);
      }
  };

  // Determine role options based on defaultRole
  const getRoleOptions = () => {
    if (defaultRole === 'مدير') {
      return ['مدير'];
    } else {
      return ['مندوب جملة', 'مندوب التجزئة'];
    }
  };

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
          // FIXED: Wrap multiple statements in curly braces {}
          onChange: (e) => { 
            setEmail(''); // Clear email if role changes from مدير
            setRole(e.target.value);
          }, 
          options: getRoleOptions(), // FIXED: Dynamically set options based on defaultRole
          error: errors.role,
          disabled: defaultRole === 'مدير' // Disable if defaultRole is 'مدير'
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
      ].filter(Boolean),
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

  if (!show) return null;

  return (
    <ModalWrapper show={show} onClose={handleClose} isVisible={isVisible} title="إضافة مستخدم">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-right">
        <FormLayout fieldsConfig={fieldsConfig} /> 

        {generalError && <p className="text-red-500 text-center text-sm mt-2">{generalError}</p>}

        <button
          type="submit"
          className="mt-4 accentColor hover:bg-purple-700 py-2 px-4 rounded"
          disabled={isLoading} 
        >
          {isLoading ? 'جاري إنشاء المستخدم...' : 'إنشاء المستخدم'}
        </button>
      </form>
    </ModalWrapper>
  );
}
