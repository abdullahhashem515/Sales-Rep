import React from 'react';
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid"; // NEW: Import EyeIcon

/**
 * مكون لعرض تفاصيل عميل واحد في شكل بطاقة مختصرة مع أزرار الإجراءات.
 *
 * @param {object} props
 * @param {object} props.customer - كائن العميل الذي يحتوي على التفاصيل.
 * @param {function} props.onView - دالة تستدعى عند النقر على زر المشاهدة (لعرض التفاصيل الكاملة).
 * @param {function} props.onEdit - دالة تستدعى عند النقر على زر التعديل.
 * @param {function} props.onDelete - دالة تستدعى عند النقر على زر الحذف.
 */
export default function CustomerCard({ customer, onView, onEdit, onDelete }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col gap-4 text-right">
      {/* Customer Name and Action Buttons */}
      <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-3">
        <h3 className="amiriFont font-bold text-white">{customer.name}</h3>
        <div className="flex gap-2">
          <button
            className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full transition-colors duration-200"
            onClick={() => onView(customer)} // NEW: Handle View action
            title="مشاهدة تفاصيل العميل"
          >
            <EyeIcon className="w-5 h-5 text-white" />
          </button>
          <button
            className="bg-yellow-400 hover:bg-yellow-600 p-2 rounded-full transition-colors duration-200"
            onClick={() => onEdit(customer)}
            title="تعديل العميل"
          >
            <PencilIcon className="w-5 h-5 text-white" />
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 p-2 rounded-full transition-colors duration-200"
            onClick={() => onDelete(customer)}
            title="حذف العميل"
          >
            <TrashIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* No other customer details are displayed here as per request */}
      {/* You would typically use the onView action to open a modal with full details */}
    </div>
  );
}
