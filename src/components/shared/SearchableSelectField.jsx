// src/components/shared/SearchableSelectField.jsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
export default function SearchableSelectField({
  label,
  value, // القيمة المختارة (الـ ID مثلاً)
  onChange, // دالة تُستدعى عند اختيار عنصر
  options, // مصفوفة الخيارات {label, value}
  placeholder = 'ابحث أو اختر...',
  error,
  className,
  disabled, // إضافة خاصية disabled
  isClearable // إضافة خاصية إمكانية المسح
}) {
  const [searchTerm, setSearchTerm] = useState(''); // حالة داخلية لنص البحث
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isInternalChange = useRef(false);

  // تحديث searchTerm عندما تتغير قيمة الـ 'value' الخارجية
  useEffect(() => {
    // هذا السطر سيعرض القيمة التي وصلت إلى المكون في كل مرة تتغير
    console.log('>>> القيمة التي وصلت إلى SearchableSelectField:', value);
    
    // إذا لم يكن التغيير ناتجًا عن اختيار داخلي (أي جاء من prop 'value' من الأعلى)
    if (!isInternalChange.current) {
      const selectedOption = options.find(opt => typeof value === 'object' ? value?.value === opt.value : opt.value === value);
      setSearchTerm(selectedOption ? selectedOption.label : '');
    }
    isInternalChange.current = false;
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

  // تحويل options لكل خيار يكون كائن { label, value }
  const normalizedOptions = useMemo(() => {
    return Array.isArray(options)
      ? options.map(opt => typeof opt === 'object' && opt !== null
          ? { label: opt.label, value: opt.value }
          : { label: opt, value: opt })
      : [];
  }, [options]);


  const handleSelectOption = (option) => {
    isInternalChange.current = true; // وضع علامة على أن التغيير قادم من داخل المكون
    onChange(option); // إرسال الكائن بالكامل إلى المكون الأب
    setSearchTerm(option.label); // عرض النص المختار في حقل البحث
    setIsOpen(false);
  };

  const handleClear = () => {
    isInternalChange.current = true;
    onChange(null); // إرسال قيمة فارغة إلى المكون الأب
    setSearchTerm(''); // مسح حقل البحث
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value); // تحديث نص البحث الداخلي للحفاظ على ما يكتبه المستخدم
    setIsOpen(true);
  };

  const handleInputClick = () => setIsOpen(true);

  const filteredOptions = normalizedOptions.filter(opt =>
    opt.label && typeof opt.label === 'string' && opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // لكي نُظهر القيمة الصحيحة في حقل الإدخال عند جلب البيانات
  const inputValue = useMemo(() => {
    // إذا كانت القيمة الممررة كائنًا، استخدم label
    if (typeof value === 'object' && value !== null) {
      return value.label;
    }
    // إذا كانت القيمة معرفًا، ابحث عن الـ label
    const selectedOption = normalizedOptions.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : '';
  }, [value, normalizedOptions]);

  // تحديث searchTerm عند تغيير inputValue
  useEffect(() => {
    setSearchTerm(inputValue);
  }, [inputValue]);

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
          value={searchTerm} // ربط حقل الإدخال بنص البحث الداخلي
          onChange={handleInputChange}
          onClick={handleInputClick}
          disabled={disabled} // تمرير خاصية disabled
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
            disabled={disabled} // تعطيل الزر إذا كان المكون معطلاً
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