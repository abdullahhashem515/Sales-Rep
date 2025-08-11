import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormLayoutSingleColumn from "../../components/shared/FormLayoutSingleColumn";
import FormInputField from "../../components/shared/FormInputField";
import { toast } from 'react-toastify';
import { post } from '../../utils/apiService';

export default function AddCurrencyModal({ show, onClose, onAddCurrencyConfirm }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setName('');
      setCode('');
      setErrors({});
      setIsLoading(false);
    }
  }, [show]);

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

    // ✅ تم عكس الترتيب: التحقق من اسم العملة (name) أولاً
    if (!name.trim()) {
      currentErrors.name = 'اسم العملة مطلوب.';
    }
    // ✅ ثم التحقق من رمز العملة (code)
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

      const payload = { 
        name: name.trim(), 
        code: code.trim() 
      };
      console.log("AddCurrencyModal: Sending payload to API:", payload);

      const response = await post('admin/currencies', payload, token);

      console.log("AddCurrencyModal: API response for POST:", response);

      if (response.status) {
        toast.success('تم إضافة العملة بنجاح!');
        onAddCurrencyConfirm(response.currency);
        handleClose(true);
      } else {
        const apiErrorMessage = response.message || 'فشل إضافة العملة.';
        setErrors({ general: apiErrorMessage });
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("AddCurrencyModal: Caught error during currency POST:", err);
      const errorMessage = err.message || 'حدث خطأ غير متوقع عند إضافة العملة.';

      // UPDATED LOGIC: Check for specific duplicate string for slug OR code in the error message for 500 errors
      if (errorMessage.includes('Duplicate entry')) {
        if (errorMessage.includes('currencies_slug_unique')) {
          setErrors(prev => ({ ...prev, name: 'هذا الاسم مستخدم بالفعل.' }));
          toast.error('فشل إضافة العملة: الاسم مكرر.');
        } else if (errorMessage.includes('currencies_code_unique')) {
          setErrors(prev => ({ ...prev, code: 'هذا الرمز مستخدم بالفعل.' }));
          toast.error('فشل إضافة العملة: الرمز مكرر.');
        } else {
          setErrors({ general: 'هذه العملة موجودة بالفعل (خطأ تكرار).' });
          toast.error('فشل إضافة العملة: العملة موجودة بالفعل (خطأ تكرار).');
        }
        // Do NOT close modal for any duplicate entry error
      } else if (err.status === 422) {
        const backendErrorMessage = err.message || 'هذه العملة موجودة بالفعل.';
        if (backendErrorMessage.includes('name')) {
          setErrors(prev => ({ ...prev, name: backendErrorMessage }));
        } else if (backendErrorMessage.includes('code')) {
          setErrors(prev => ({ ...prev, code: backendErrorMessage }));
        } else {
          setErrors({ general: 'خطأ: ' + backendErrorMessage });
        }
        toast.error('فشل إضافة العملة: ' + backendErrorMessage);
        // Keep modal open
      } else {
        // Generic error handling for other server errors or network issues
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
        handleClose(false); // Close modal for general unexpected errors
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  if (!show) return null;

  return (
    <ModalWrapper 
      show={show} 
      onClose={handleClose} 
      isVisible={isVisible} 
      title="إضافة عملة جديدة" 
      maxWidth="max-w-md" 
    > 
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
        <FormLayoutSingleColumn fieldsConfig={fieldsConfig} />
        {errors.general && <p className="text-red-500 text-xs mt-1 text-center">{errors.general}</p>}

        <button
          type="submit"
          className="mt-4 accentColor hover:bg-purple-700 py-2 px-4 rounded w-full"
          disabled={isLoading}
        >
          {isLoading ? 'جاري الإضافة...' : 'إضافة عملة'}
        </button>
      </form>
    </ModalWrapper>
  );
}
