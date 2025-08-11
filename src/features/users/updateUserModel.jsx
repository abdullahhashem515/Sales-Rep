import React, { useEffect, useState } from "react";
import ModalWrapper from '../../components/shared/ModalWrapper'; // Import ModalWrapper
import FormLayout from '../../components/shared/FormLayout'; // Import generic FormLayout
import { toast } from 'react-toastify'; // Import toast for notifications
import { put } from '../../utils/apiService'; // Import the generic put function
import { validateAddUserForm } from '../../utils/validationService'; // Import validation service for update form

export default function UpdateUserModel({ show, onClose, userToEdit }) {
  const [isVisible, setIsVisible] = useState(false);
  // State for form fields
  const [slug, setSlug] = useState(''); // User SLUG for update API URL
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('مدير'); // Default role
  const [accountStatus, setAccountStatus] = useState('نشط'); // Default status

  // State to store original user data for comparison
  const [originalUserData, setOriginalUserData] = useState(null);

  // State for error messages - Unified into one object
  const [errors, setErrors] = useState({}); // Unified state for all form errors
  const [generalError, setGeneralError] = useState(''); // For API errors

  const [isLoading, setIsLoading] = useState(false); // Loading state for API call

  // عند تغيير show أو userToEdit من الخارج (props)
  useEffect(() => {
    if (show && userToEdit) {
      setIsVisible(true);
      // Populate form fields with data from userToEdit
      setSlug(userToEdit.slug || ''); // Set SLUG for API call
      setFullName(userToEdit.name || ''); // Assuming 'name' from API
      setPhoneNumber(userToEdit.phone_number || ''); // Assuming 'phone_number' from API
      setEmail(userToEdit.email || ''); // Assuming 'email' from API

      // Map API role to display text - Ensure consistency with dropdown options
      let displayRole = 'مدير'; // Default
      if (userToEdit.type_user === 'ws_rep') {
        displayRole = 'مندوب جملة';
      } else if (userToEdit.type_user === 'retail_rep') {
        displayRole = 'مندوب التجزئة'; 
      } else if (userToEdit.type_user === 'admin') { // Assuming 'admin' for manager role
        displayRole = 'مدير';
      }
      setRole(displayRole);

      // Map API status to display text
      const displayStatus = userToEdit.status === 'active' ? 'نشط' : 'غير نشط';
      setAccountStatus(displayStatus);

      // Store a copy of the original user data for comparison
      setOriginalUserData({
        name: userToEdit.name || '',
        phone_number: userToEdit.phone_number || '',
        email: userToEdit.email || '',
        type_user: userToEdit.type_user, // Store raw API value for comparison
        status: userToEdit.status, // Store raw API value for comparison
      });

      setErrors({}); // Reset all validation errors
      setGeneralError('');
    } else if (!show) {
      // Reset when modal is truly closed
      setSlug(''); // Reset slug
      setFullName('');
      setPhoneNumber('');
      setEmail('');
      setRole('مدير');
      setAccountStatus('نشط');
      setErrors({});
      setGeneralError('');
      setOriginalUserData(null); // Reset original data
    }
  }, [show, userToEdit]);

  // دالة إغلاق مع أنميشن
  const handleClose = (isSuccess = false) => { // Added isSuccess parameter
    setIsVisible(false);
    // انتظر 100ms قبل إغلاق المودال نهائيًا
    setTimeout(() => {
      onClose(isSuccess); // Pass isSuccess to the onClose callback
    }, 100);
  };

  // Handle form submission (Update logic)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(''); // Reset general API error

    // Collect form data for validation
    const formData = {
      fullName,
      phoneNumber,
      email,
      role,
      accountStatus,
    };

    // Pass isUpdate=true and originalEmail to validation service
    const validationErrors = validateAddUserForm(formData, true, originalUserData?.email || ''); 
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error('يرجى تصحيح الأخطاء في النموذج.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        const authError = 'لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.';
        setGeneralError(authError);
        toast.error(authError);
        setIsLoading(false);
        return;
      }

      // Map front-end role to backend's type_user for the API call
      let typeUserValue = '';
      let endpoint = ''; // NEW: Define endpoint variable for update
      if (formData.role === 'مندوب جملة') {
          typeUserValue = 'ws_rep';
          endpoint = `admin/update-user/${slug}`; // Endpoint for sales reps
      } else if (formData.role === 'مندوب التجزئة') { 
          typeUserValue = 'retail_rep';
          endpoint = `admin/update-user/${slug}`; // Endpoint for sales reps
      } else { // Assuming 'مدير' role
          typeUserValue = 'admin';
          endpoint = `admin/update-admin/${slug}`; // NEW: Endpoint for admin update
      }

      // Map front-end status to backend's status for the API call
      const statusValue = formData.accountStatus === 'نشط' ? 'active' : 'inactive';

      // Construct the data payload with only changed fields
      const apiPayload = {};

      if (fullName !== originalUserData.name) {
        apiPayload.name = fullName;
      }
      if (phoneNumber !== originalUserData.phone_number) {
        apiPayload.phone = phoneNumber;
      }

      // Only include email if the role is 'مدير' AND it has actually changed from its original value.
      // Or if it was originally empty but now has a value.
      // Or if it had a value and is now empty (which should be allowed by backend if it accepts empty emails for admin).
      if (
          (formData.role === 'مدير' && email !== originalUserData.email) || // Email changed for Admin
          (formData.role !== 'مدير' && email.trim() !== originalUserData.email) // Email changed for Non-Admin
      ) {
          apiPayload.email = email;
      }
      
      // If the user's role changed TO 'مدير' AND the email is empty, we must send email
      if (formData.role === 'مدير' && originalUserData.type_user !== 'admin' && !email.trim()) {
        apiPayload.email = email; // Send empty email for new admin if not changed
      }

      // Only update role if it's not an admin being edited or if role itself changes
      // If current user is admin, we don't allow changing their role.
      // If the role changed AND it's not an admin (meaning it's a rep converting to another rep type)
      if (userToEdit.type_user !== 'admin' && typeUserValue !== originalUserData.type_user) { 
        apiPayload.type_user = typeUserValue;
      }
      
      if (statusValue !== originalUserData.status) { // Compare mapped status
        apiPayload.status = statusValue;
      }

      // If no fields have changed, don't make an API call
      if (Object.keys(apiPayload).length === 0) {
        toast.info('لم يتم إجراء أي تغييرات للحفظ.');
        handleClose(true); // Treat as success if no changes
        return;
      }

      console.log("API Payload being sent for update (only changed fields):", apiPayload);
      console.log("API Endpoint for update:", endpoint); // Log the chosen endpoint

      // Make API call using the generic 'put' function with SLUG in URL path
      const response = await put(endpoint, apiPayload, token); // Use the dynamic endpoint

      if (response.status) { // Assuming 'status: true' indicates success
        toast.success('تم تحديث المستخدم بنجاح!');
        handleClose(true); // Close modal on successful submission and indicate success
      } else {
        const apiErrorMessage = response.message || 'فشل تحديث المستخدم.';
        setGeneralError(apiErrorMessage);
        toast.error(apiErrorMessage);
        handleClose(false); // Close modal and indicate failure
      }
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage = error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
      setGeneralError(errorMessage);
      toast.error(errorMessage);
      handleClose(false); // Close modal and indicate failure
    } finally {
      setIsLoading(false);
    }
  };

  // Determine role options based on the user being edited
  const getRoleOptions = () => {
    if (userToEdit && userToEdit.type_user === 'admin') {
      return ['مدير'];
    } else {
      return ['مندوب جملة', 'مندوب التجزئة'];
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
          label: "الدور",
          type: "select",
          value: role,
          onChange: (e) => setRole(e.target.value),
          options: getRoleOptions(), // Dynamically set options
          error: errors.role,
          disabled: userToEdit && userToEdit.type_user === 'admin' // Disable if the user being edited is an admin
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
    <ModalWrapper show={show} onClose={handleClose} isVisible={isVisible} title="تعديل بيانات مستخدم">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-right">
        <FormLayout fieldsConfig={fieldsConfig} />

        {generalError && <p className="text-red-500 text-center text-sm mt-2">{generalError}</p>}

        <button
          type="submit"
          className="mt-4 accentColor hover:bg-purple-700 py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'جاري حفظ التعديل...' : 'حفظ التعديل'}
        </button>
      </form>
    </ModalWrapper>
  );
}
