import React from 'react';
import ModalTitle from './ModalTitle'; // Import ModalTitle here

/**
 * مكون غلاف عام للنافذة المنبثقة (Modal Wrapper)
 * يوفر الخلفية، الحاوية الرئيسية، وزر الإغلاق.
 * @param {object} props
 * @param {boolean} props.show - حالة عرض/إخفاء المودال.
 * @param {function} props.onClose - دالة تستدعى عند إغلاق المودال.
 * @param {boolean} props.isVisible - حالة الرؤية للتحكم في الانتقالات.
 * @param {string} props.title - عنوان المودال.
 * @param {React.ReactNode} props.children - محتوى المودال.
 * @param {string} [props.maxWidth='max-w-2xl'] - الحد الأقصى لعرض المودال (Tailwind class).
 * @param {string} [props.height='auto'] - ارتفاع المودال (Tailwind class أو CSS value).
 * @param {string} [props.maxHeight=''] - الحد الأقصى لارتفاع المودال (Tailwind class).
 */
export default function ModalWrapper({
  show,
  onClose,
  isVisible,
  title,
  children,
  maxWidth = 'max-w-2xl',
  maxHeight = 'max-w-2xl',
}) {
  // لا تعرض شيئًا إذا المودال لم يتم استدعاؤه بعد الإغلاق
  if (!show) return null;

  return (
    <div className="amiriFont fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div
        className={`overflow-y-auto bg-gray-900 text-white p-6 rounded-lg w-full ${maxWidth} ${
          maxHeight ? maxHeight : ''
        } relative transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <ModalTitle title={title} /> {/* استخدام مكون العنوان هنا */}

        <button
          onClick={onClose}
          className="absolute top-2 left-2 text-gray-400 hover:text-white print:hidden"
        >
          ✕
        </button>

        {children} {/* عرض المحتوى الذي يتم تمريره كـ children */}
      </div>
    </div>
  );
}