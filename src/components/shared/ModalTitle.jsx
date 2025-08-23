import React from 'react';

/**
 * مكون لعرض عنوان النافذة المنبثقة.
 * @param {object} props
 * @param {string} props.title - نص العنوان.
 */
export default function ModalTitle({ title }) {
  return (
    <h2 className="text-xl font-bold mb-4 text-right print:hidden">{title}</h2>
  );
}
