import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormLayoutSingleColumn from "../../components/shared/FormLayoutSingleColumn";
import { toast } from 'react-toastify';
import { put, get } from '../../utils/apiService'; 

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
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '') 
    .replace(/--+/g, '-') 
    .replace(/^-+|-+$/g, ''); 
};

export default function UpdateCurrencyModal({ show, onClose, currencyToEdit }) {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState(''); 
  const [code, setCode] = useState(''); 
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show && currencyToEdit) {
      setIsVisible(true);
      setName(currencyToEdit.name || ''); 
      setCode(currencyToEdit.code || ''); 
      setErrors({});
      setIsLoading(false);
    } else if (!show) {
      setName('');
      setCode('');
      setErrors({});
    }
  }, [show, currencyToEdit]);

  const handleClose = (isSuccess = false) => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(isSuccess);
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let currentErrors = {};

    if (!name.trim()) { 
      currentErrors.name = 'اسم العملة مطلوب.';
    }
    if (!code.trim()) { 
      currentErrors.code = 'رمز العملة مطلوب.';
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      toast.error('يرجى تصحيح الأخطاء في النموذج.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setErrors({ general: 'لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.' });
        toast.error('لا يوجد رمز مصادقة.');
        setIsLoading(false);
        return;
      }

      const newNameTrimmed = name.trim(); 
      const newCodeTrimmed = code.trim(); 
      const currentSlug = currencyToEdit?.slug;

      if (newNameTrimmed === currencyToEdit.name && newCodeTrimmed === currencyToEdit.code) { 
        toast.info('لم يتم إجراء أي تغييرات للحفظ.');
        handleClose(true);
        return;
      }

      const payload = { 
        name: newNameTrimmed, 
        code: newCodeTrimmed 
      };
      console.log("UpdateCurrencyModal: Sending payload to API:", payload);
      console.log("Full API Endpoint for update:", `admin/currencies/${currentSlug}`);

      const response = await put(`admin/currencies/${currentSlug}`, payload, token);

      console.log("UpdateCurrencyModal: API response:", response);

      if (response.status) {
        toast.success('تم تحديث العملة بنجاح!');
        handleClose(true);
      } else {
        const apiErrorMessage = response.message || 'فشل تحديث العملة.';
        setErrors({ general: apiErrorMessage });
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("UpdateCurrencyModal: Caught unexpected error during PUT:", err);
      const errorMessage = err.message || 'حدث خطأ غير متوقع عند تحديث العملة.';

      // ✅ تم التعديل: معالجة أخطاء التكرار (Duplicate entry) لـ 500 أو 422
      if (errorMessage.includes('Duplicate entry')) {
        if (errorMessage.includes('currencies_slug_unique')) {
          setErrors(prev => ({ ...prev, name: 'هذا الاسم مستخدم بالفعل.' }));
          toast.error('فشل تحديث العملة: الاسم مكرر.');
        } else if (errorMessage.includes('currencies_code_unique')) {
          setErrors(prev => ({ ...prev, code: 'هذا الرمز مستخدم بالفعل.' }));
          toast.error('فشل تحديث العملة: الرمز مكرر.');
        } else {
          setErrors({ general: 'هذه العملة موجودة بالفعل (خطأ تكرار).' });
          toast.error('فشل تحديث العملة: العملة موجودة بالفعل (خطأ تكرار).');
        }
        // عدم إغلاق المودال في أي حالة تكرار
      } else if (err.status === 422) {
        const backendErrorMessage = err.message || 'اسم العملة هذا أو رمزه مستخدم بالفعل.';
        if (backendErrorMessage.includes('name')) {
          setErrors(prev => ({ ...prev, name: backendErrorMessage }));
        } else if (backendErrorMessage.includes('code')) {
          setErrors(prev => ({ ...prev, code: backendErrorMessage }));
        } else {
          setErrors({ general: 'خطأ: ' + backendErrorMessage });
        }
        toast.error('فشل تحديث العملة: ' + backendErrorMessage);
        // إبقاء المودال مفتوحاً
      } else {
        // التعامل مع الأخطاء العامة الأخرى (مشاكل الشبكة، 500 أخرى)
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
        handleClose(false); // إغلاق المودال للأخطاء غير المتوقعة العامة
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  const fieldsConfig = [
    { 
      fields: [
        {
          label: "اسم العملة",
          type: "text",
          placeholder: "أدخل اسم العملة",
          value: name, 
          onChange: (e) => setName(e.target.value),
          error: errors.name, 
        },
        { 
          label: "رمز العملة", 
          type: "text",
          placeholder: "مثال: USD",
          value: code, 
          onChange: (e) => setCode(e.target.value),
          error: errors.code, 
        },
      ],
    },
  ];

  return (
    <ModalWrapper 
      show={show} 
      onClose={handleClose} 
      isVisible={isVisible} 
      title="تعديل عملة" 
      maxWidth="max-w-md" 
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        <FormLayoutSingleColumn fieldsConfig={fieldsConfig} />
        {errors.general && <p className="text-red-500 text-xs mt-1 text-center">{errors.general}</p>}

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
