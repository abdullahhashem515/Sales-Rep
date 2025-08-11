import React from 'react';

/**
 * مكون شريط البحث والفلترة.
 * @param {object} props
 * @param {string} props.searchTerm - قيمة مصطلح البحث الحالي.
 * @param {function} props.setSearchTerm - دالة لتحديث مصطلح البحث.
 * @param {string} props.searchBy - قيمة الحقل الحالي للبحث بواسطته.
 * @param {function} props.setSearchBy - دالة لتحديث الحقل للبحث بواسطته.
 * @param {Array<object>} props.options - مصفوفة من خيارات الفلترة. مثال: [{ value: 'name', label: 'الاسم الكامل' }]
 * @param {string} [props.placeholder='بحث...'] - نص العنصر النائب لحقل البحث.
 */
export default function SearchFilterBar({
  searchTerm,
  setSearchTerm,
  searchBy,
  setSearchBy,
  options,
  placeholder = 'بحث عن مستخدم', // Default for UsersList
}) {
  return (
    <div className="relative flex items-center">
      <input
        type="text"
        placeholder={placeholder}
        className="amiriFont ml-2 bg-gray-900 text-white border border-gray-600 py-2 px-4 w-64 rounded-r-md focus:outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select
        className="amiriFont bg-gray-900 text-white border border-gray-600 py-2 px-3 rounded-l-md focus:outline-none"
        value={searchBy}
        onChange={(e) => setSearchBy(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
