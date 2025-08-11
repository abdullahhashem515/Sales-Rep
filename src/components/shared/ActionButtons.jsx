import React from 'react';
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";

/**
 * مكون يعرض أزرار التعديل والحذف لصف واحد في الجدول.
 * @param {object} props
 * @param {function} props.onEdit - دالة تستدعى عند النقر على زر التعديل.
 * @param {function} props.onDelete - دالة تستدعى عند النقر على زر الحذف.
 */
export default function ActionButtons({ onEdit, onDelete }) {
  return (
    <td className="py-3 px-4 flex gap-2">
      <button
        className="bg-yellow-400 hover:bg-yellow-600 p-2 rounded"
        onClick={onEdit}
      >
        <PencilIcon className="w-4 h-4 text-white" />
      </button>
      <button
        className="bg-red-500 hover:bg-red-600 p-2 rounded"
        onClick={onDelete}
      >
        <TrashIcon className="w-4 h-4 text-white" />
      </button>
    </td>
  );
}
