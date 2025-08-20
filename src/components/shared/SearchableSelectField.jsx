import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function SearchableSelectField({ 
  label, 
  value, 
  onChange, 
  options, // يمكن أن تكون: ['خيار1', 'خيار2'] أو [{label, value}]
  placeholder = 'ابحث أو اختر...',
  error,
  className 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // تحويل options لكل خيار يكون كائن { label, value }
  const normalizedOptions = Array.isArray(options)
    ? options.map(opt => typeof opt === 'object' && opt !== null
        ? { label: opt.label, value: opt.value }
        : { label: opt, value: opt })
    : [];

  // تحديث searchTerm عند تغيير value أو options
  useEffect(() => {
    const selectedOption = normalizedOptions.find(opt => opt.value === value);
    setSearchTerm(selectedOption ? selectedOption.label : '');
  }, [value, options]);

  // إغلاق القائمة عند النقر خارجها
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
    onChange(option.value); // إرسال القيمة المختارة
    setSearchTerm(option.label); // عرض النص المختار
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
    onChange(''); // مسح القيمة الفعلية حتى يتم اختيار خيار صالح
  };

  const handleInputClick = () => setIsOpen(true);

  const filteredOptions = normalizedOptions.filter(opt =>
    opt.label && typeof opt.label === 'string' && opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`flex-1 mb-3 md:mb-0 relative ${className}`} ref={dropdownRef}>
      <label className="block mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className={`w-full p-2 rounded bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-600'}`}
          value={searchTerm}
          onChange={handleInputChange}
          onClick={handleInputClick}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 left-0 flex items-center pr-3 text-gray-400"
        >
          {isOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                className="p-2 hover:bg-gray-600 cursor-pointer"
                onClick={() => handleSelectOption(option)}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-400">لا توجد نتائج</li>
          )}
        </ul>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
