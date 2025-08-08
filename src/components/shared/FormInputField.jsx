import React from 'react';

/**
 * مكون لحقل إدخال نموذج عام.
 * @param {object} props
 * @param {string} props.label - تسمية الحقل.
 * @param {string} props.type - نوع الإدخال (text, email, password, etc.).
 * @param {string} props.placeholder - نص العنصر النائب.
 * @param {string} props.value - القيمة الحالية للحقل.
 * @param {function} props.onChange - دالة تستدعى عند تغيير قيمة الحقل.
 * @param {string} [props.error] - رسالة الخطأ (إن وجدت).
 * @param {string} [props.className] - فئات CSS إضافية للعنصر div الرئيسي.
 */
export default function FormInputField({ label, type, placeholder, value, onChange, error, className }) {
  return (
    <div className={`flex-1 mb-3 md:mb-0 ${className}`}>
      <label className="block mb-1">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full p-2 rounded bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-600'}`}
        value={value}
        onChange={onChange}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
