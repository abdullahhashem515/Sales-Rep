// src/components/shared/SearchableSelectFieldV4.jsx

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SearchableSelectFieldV4({
  label,
  value, // القيمة المختارة (مثل slug المندوب)
  onChange, // دالة تُستدعى عند اختيار عنصر -> ترجع القيمة فقط
  options, // مصفوفة الخيارات [{ label, value }]
  placeholder = 'ابحث أو اختر...',
  error,
  className,
  disabled,
  isClearable
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // مزامنة حقل البحث مع قيمة الـ `value` الخارجية
  useEffect(() => {
    const selectedOption = options.find(opt => opt.value === value);
    setSearchTerm(selectedOption ? selectedOption.label : '');
  }, [value, options]);

  // إغلاق عند النقر بالخارج
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOption = (option) => {
    onChange(option.value);     // ✅ إرسال القيمة (value) فقط
    setSearchTerm(option.label);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null); // إرسال قيمة فارغة
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputClick = () => setIsOpen(true);

  const filteredOptions = options.filter(opt =>
    opt.label && typeof opt.label === 'string' && opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex-1 mb-3 md:mb-0 relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-200">{label}</label>
      )}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className={`pr-9 w-full p-2 rounded bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-600'} text-sm text-gray-50`}
          value={searchTerm}
          onChange={handleInputChange}
          onClick={handleInputClick}
          disabled={disabled}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {searchTerm && isClearable && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400"
            disabled={disabled}
          >
            {isOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                className="p-2 hover:bg-gray-600 cursor-pointer text-sm text-gray-100"
                onClick={() => handleSelectOption(option)}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-400 text-sm">لا توجد نتائج</li>
          )}
        </ul>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}