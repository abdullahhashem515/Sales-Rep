import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'; // Import icons

/**
 * مكون حقل اختيار (Select) قابل للبحث.
 * يوفر حقل إدخال للبحث ضمن الخيارات وعرض قائمة منسدلة قابلة للتصفية.
 *
 * @param {object} props
 * @param {string} props.label - تسمية الحقل.
 * @param {string} props.value - القيمة المختارة الحالية (النص المعروض).
 * @param {function} props.onChange - دالة تستدعى عند تغيير القيمة.
 * @param {Array<string>} props.options - مصفوفة من خيارات الاختيار (سلاسل نصية).
 * @param {string} [props.placeholder='اختر...'] - نص العنصر النائب لحقل البحث.
 * @param {string} [props.error] - رسالة الخطأ (إن وجدت).
 * @param {string} [props.className] - فئات CSS إضافية للعنصر div الرئيسي.
 */
export default function SearchableSelectField({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = 'ابحث أو اختر فئة', 
  error, 
  className 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // تحديث searchTerm عند تغيير قيمة prop.value (للتعديل أو إعادة التعيين)
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // لإغلاق القائمة المنسدلة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectOption = (option) => {
    onChange(option); // أرسل القيمة المختارة إلى المكون الأب
    setSearchTerm(option); // عرض القيمة المختارة في حقل البحث
    setIsOpen(false); // إغلاق القائمة
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true); // افتح القائمة عند البدء بالكتابة
    // هذا السطر يمسح القيمة الفعلية إذا بدأ المستخدم بالكتابة، حتى يتم اختيار خيار صالح.
    // قد تحتاج لتعديله إذا كنت تفضل سلوكًا مختلفًا (مثل عدم مسح القيمة حتى يتم اختيار خيار جديد صراحةً).
    onChange(''); 
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  // تصفية الخيارات بناءً على مصطلح البحث
  // ✅ التأكد من أن العنصر نفسه ليس null/undefined وأنه سلسلة نصية قبل استخدام toLowerCase()
  const filteredOptions = options.filter(option =>
    option && typeof option === 'string' && option.toLowerCase().includes(searchTerm.toLowerCase())
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
          readOnly={false} // Allow typing
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-y-0 left-0 flex items-center pr-3 text-gray-400"
        >
          {isOpen ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {isOpen && (
        <ul className="absolute z-10 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={index} // يمكن استخدام مفتاح أفضل إذا كانت الخيارات لها معرفات فريدة
                className="p-2 hover:bg-gray-600 cursor-pointer"
                onClick={() => handleSelectOption(option)}
              >
                {option}
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
