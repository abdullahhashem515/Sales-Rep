import React from 'react';

/**
 * مكون زر عام لإضافة كيان جديد.
 * @param {object} props
 * @param {string} props.label - النص المعروض على الزر (مثال: "+ إضافة مستخدم").
 * @param {function} props.onClick - دالة تستدعى عند النقر على الزر.
 */
export default function AddEntityButton({ label, onClick }) {
  return (
    <button
      className="amiriFont accentColor text-white py-2 px-4 rounded"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
