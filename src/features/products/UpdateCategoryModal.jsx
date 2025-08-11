import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import { toast } from 'react-toastify';
import { put, get } from '../../utils/apiService'; // استيراد دالة get الجديدة
import FormLayoutSingleColumn from "../../components/shared/FormLayoutSingleColumn"; // NEW: استيراد مكون التخطيط ذي العمود الواحد

// Helper to convert name to slug (simple version) - SAME AS IN AddCategoryModal
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

export default function UpdateCategoryModal({ show, onClose, categoryToEdit }) {
  const [isVisible, setIsVisible] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // تحديث حالة اسم الفئة عندما يتغير categoryToEdit
  useEffect(() => {
    if (show && categoryToEdit) {
      setIsVisible(true);
      setCategoryName(categoryToEdit.name || ''); // تعيين الاسم الحالي للفئة
      setError('');
      setIsLoading(false);
    } else if (!show) {
      // إعادة تعيين عند إغلاق المودال
      setCategoryName('');
      setError('');
    }
  }, [show, categoryToEdit]);

  const handleClose = (isSuccess = false) => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(isSuccess); // تمرير حالة النجاح إلى المكون الأب
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!categoryName.trim()) {
      setError('اسم الفئة مطلوب.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        toast.error('لا يوجد رمز مصادقة.');
        setIsLoading(false);
        return;
      }

      const newSlug = convertToSlug(categoryName);
      const currentSlug = categoryToEdit?.slug;

      // Check for duplicate ONLY if the name has effectively changed (new slug is different from current slug)
      if (newSlug !== currentSlug) {
        console.log("Checking for duplicate category with new slug:", newSlug);
        try {
          await get(`admin/categories/${newSlug}`, token);
          // If the above line succeeds, it means a category with this new slug exists
          setError('اسم الفئة هذا مستخدم بالفعل من قبل فئة أخرى.');
          setIsLoading(false);
          return; // Stop execution here if duplicate is found
        } catch (checkError) {
          // If error status is 404, it means the category does not exist with this new slug, which is good.
          if (checkError.status === 404) {
            console.log("New category name is available, proceeding to update.");
          } else {
            // Other API error during check (e.g., 401 Unauthorized, 500 Server Error, network issues).
            const checkErrorMessage = checkError.message || 'حدث خطأ أثناء التحقق من وجود الفئة.';
            setError(checkErrorMessage);
            toast.error(checkErrorMessage);
            setIsLoading(false);
            return;
          }
        }
      } else {
        // If the slug hasn't changed, it means the name is effectively the same category
        // No need to check for duplicates, but we still check if any other field changed.
        if (categoryName === categoryToEdit.name) {
          toast.info('لم يتم إجراء أي تغييرات للحفظ.');
          handleClose(true); // Treat as success if no changes
          return;
        }
      }

      const payload = { name: categoryName.trim() };
      console.log("UpdateCategoryModal: Sending payload to API:", payload);
      console.log("Full API Endpoint for update:", `admin/categories/${currentSlug}`);

      const response = await put(`admin/categories/${currentSlug}`, payload, token);

      console.log("UpdateCategoryModal: API response:", response);

      if (response.status) {
        toast.success('تم تحديث الفئة بنجاح!');
        handleClose(true);
      } else {
        const apiErrorMessage = response.message || 'فشل تحديث الفئة.';
        setError(apiErrorMessage);
        toast.error(apiErrorMessage);
        handleClose(false);
      }
    } catch (err) {
      console.error("UpdateCategoryModal: Caught unexpected error during PUT:", err);
      // NEW LOGIC: Handle 422 specifically for duplicate message and keep modal open
      if (err.status === 422) {
        const backendErrorMessage = err.message || 'اسم الفئة هذا مستخدم بالفعل من قبل فئة أخرى.';
        setError('الفئة مكررة: ' + backendErrorMessage); // Display custom message + backend message
        toast.error('الفئة مكررة: ' + backendErrorMessage);
        setIsLoading(false);
        console.log("handleSubmit: Duplicate category (422), modal should remain open.");
        // IMPORTANT: Do NOT call handleClose() here, just return to keep modal open.
        return;
      } else {
        // Handle other types of errors (network, 500, etc.)
        const errorMessage = err.message || 'حدث خطأ غير متوقع عند تحديث الفئة.';
        setError(errorMessage);
        toast.error(errorMessage);
        console.log("handleSubmit: Unexpected PUT error, closing modal.");
        handleClose(false); // Close on other unexpected errors
      }
    } finally {
      setIsLoading(false);
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
      title="تعديل فئة"
      maxWidth="max-w-md" // UPDATED: Changed maxWidth to max-w-md to make the modal narrower
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
          {isLoading ? 'جاري التعديل...' : 'حفظ التعديل'}
        </button>
      </form>
    </ModalWrapper>
  );
}
