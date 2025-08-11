import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import { toast } from 'react-toastify';
import { post, get } from '../../utils/apiService';
import FormLayoutSingleColumn from "../../components/shared/FormLayoutSingleColumn";

// Helper to convert name to slug (simple version)
const convertToSlug = (text) => {
  if (!text) return '';
  const arabicToLatin = {
    'أ': 'a', 'ا': 'a', 'إ': 'i', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't',
    'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ء': '', 'ؤ': 'o', 'ئ': 'i', 'ة': 'a', '؟': '',
    ' ': '-', '.': '', ',': '', '/': '-', '\\': '-', '(': '', ')': ''
  };
  return text
    .split('')
    .map(char => arabicToLatin[char] || char)
    .join('')
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, '') // Remove all non-word chars except hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start/end
};

export default function AddCategoryModal({ show, onClose, onAddCategoryConfirm }) {
  const [isVisible, setIsVisible] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setCategoryName(''); // Reset form field
      setError(''); // Clear error
      setIsLoading(false); // Reset loading state
    }
  }, [show]);

  const handleClose = (isSuccess = false) => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(isSuccess); // Pass success status back to parent
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log("handleSubmit: Starting submission process.");

    if (!categoryName.trim()) {
      setError('اسم الفئة مطلوب.');
      console.log("handleSubmit: Validation error - category name is empty.");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        toast.error('لا يوجد رمز مصادقة.');
        setIsLoading(false);
        console.log("handleSubmit: Authentication error - no token.");
        return;
      }

      const slugName = convertToSlug(categoryName);
      console.log("handleSubmit: Checking for duplicate category with slug:", slugName);

      // Check if category with this slug already exists
      try {
        const existingCategory = await get(`admin/categories/${slugName}`, token);
        // If the above line succeeds, it means the category exists
        console.log("handleSubmit: Duplicate category found:", existingCategory);
        setError('هذه الفئة موجودة بالفعل. يرجى اختيار اسم آخر.');
        setIsLoading(false);
        console.log("handleSubmit: Duplicate found, stopping submission. Modal should remain open.");
        return; // Stop execution here if duplicate is found
      } catch (checkError) {
        console.log("handleSubmit: Error during duplicate check:", checkError);
        // This block executes if the 'get' request throws an error.
        // We now check the HTTP status code directly.
        if (checkError.status === 404) {
          // If status is 404 (Not Found), it means the category DOES NOT exist.
          // This is the desired path for adding a NEW category.
          console.log("handleSubmit: Category does not exist (404), proceeding to add.");
          // IMPORTANT: No setError() here. The execution will continue below to the POST request.
        } else {
          // This is for any OTHER API errors during the check (e.g., 401 Unauthorized, 500 Server Error, network issues).
          const checkErrorMessage = checkError.message || 'حدث خطأ أثناء التحقق من وجود الفئة.';
          setError(checkErrorMessage);
          toast.error(checkErrorMessage);
          setIsLoading(false);
          console.log("handleSubmit: Other error during duplicate check, stopping submission. Modal should remain open.");
          return; // Stop execution for other errors
        }
      }

      // If execution reaches here, it means the category was either
      // not found (404) or the 'get' request was successful for a non-duplicate.
      // Now, proceed with adding the new category.
      console.log("handleSubmit: Proceeding to add new category.");
      const payload = { name: categoryName.trim() };
      console.log("AddCategoryModal: Sending payload to API:", payload);

      const response = await post('admin/categories', payload, token);

      console.log("AddCategoryModal: API response for POST:", response);

      if (response.status) {
        toast.success('تم إضافة الفئة بنجاح!');
        onAddCategoryConfirm(response.category);
        console.log("handleSubmit: Category added successfully, closing modal.");
        handleClose(true); // Close on success
      } else {
        const apiErrorMessage = response.message || 'فشل إضافة الفئة.';
        setError(apiErrorMessage);
        toast.error(apiErrorMessage);
        console.log("handleSubmit: Category addition failed, closing modal.");
        handleClose(false); // Close on API-reported failure
      }
    } catch (err) { // This catch block handles errors from the POST request itself (e.g., network error, unexpected 500)
      console.error("AddCategoryModal: Caught unexpected error during POST:", err);
      // NEW LOGIC: Handle 422 specifically for duplicate message and keep modal open
      if (err.status === 422) {
        const backendErrorMessage = err.message || 'الفئة موجودة بالفعل.';
        setError('الفئة مكررة: ' + backendErrorMessage); // Display custom message + backend message
        toast.error('الفئة مكررة: ' + backendErrorMessage);
        setIsLoading(false);
        console.log("handleSubmit: Duplicate category (422), modal should remain open.");
        // IMPORTANT: Do NOT call handleClose() here, just return to keep modal open.
        return;
      } else {
        // Handle other types of errors (network, 500, etc.)
        const errorMessage = err.message || 'حدث خطأ غير متوقع عند إضافة الفئة.';
        setError(errorMessage);
        toast.error(errorMessage);
        console.log("handleSubmit: Unexpected POST error, closing modal.");
        handleClose(false); // Close on other unexpected errors
      }
    } finally {
      setIsLoading(false);
      console.log("handleSubmit: Submission process finished.");
    }
  };

  if (!show) return null;

  // تعريف إعدادات الحقول لمكون FormLayoutSingleColumn
  const fieldsConfig = [
    {
      fields: [
        {
          label: "اسم الفئة",
          type: "text",
          placeholder: "أدخل اسم الفئة",
          value: categoryName,
          onChange: (e) => setCategoryName(e.target.value),
          error: error, // Using the single error state for simplicity here
        },
      ],
    },
  ];

  return (
    <ModalWrapper
      show={show}
      onClose={handleClose}
      isVisible={isVisible}
      title="إضافة فئة"
      maxWidth="max-w-md" // UPDATED: Changed maxWidth to max-w-md for consistent size
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        {/* استخدام FormLayoutSingleColumn هنا */}
        <FormLayoutSingleColumn fieldsConfig={fieldsConfig} />

        {/* تم حذف هذا السطر لمنع تكرار رسالة الخطأ */}
        {/* {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>} */}

        <button
          type="submit"
          className="mt-4 accentColor hover:bg-purple-700 py-2 px-4 rounded w-full"
          disabled={isLoading}
        >
          {isLoading ? 'جاري الإضافة...' : 'إضافة فئة'}
        </button>
      </form>
    </ModalWrapper>
  );
}
