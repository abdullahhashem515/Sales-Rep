import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SalespersonSelectField({
  label,
  value,           // { label, value, type_user } أو null
  onChange,        // onChange(optionObject|null)
  options = [],    // { label, value, type_user }[]
  placeholder = 'اختر مندوب...',
  error,
  className = '',
  disabled = false,
  isClearable = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    setSearchTerm(value?.label ?? '');
  }, [value]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = (searchTerm || '').toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.label || '').toLowerCase().includes(q));
  }, [searchTerm, options]);

  const handlePick = (opt) => {
    onChange?.(opt || null);
    setSearchTerm(opt?.label ?? '');
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange?.(null);
  };

  const locked = !!disabled;

  return (
    <div className={`flex-1 mb-3 md:mb-0 relative ${className}`} ref={wrapRef}>
      {label && <label className="block mb-1 text-sm font-medium text-gray-200">{label}</label>}

      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className={`pr-12 w-full p-2 rounded bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-600'} text-sm text-gray-50`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => !locked && setIsOpen(true)}
          disabled={locked}
          readOnly={locked}
        />

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
          {isClearable && !!searchTerm && !locked && (
            <button type="button" onClick={handleClear} className="text-gray-400 hover:text-white" tabIndex={-1} aria-label="مسح الاختيار">
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
          <button type="button" onClick={() => !locked && setIsOpen((v) => !v)} className="text-gray-400" disabled={locked} tabIndex={-1} aria-label="فتح/إغلاق القائمة">
            {isOpen ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && !locked && (
        <ul className="absolute z-50 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.length ? (
            filteredOptions.map((opt) => (
              <li
                key={String(opt.value)}
                className="p-2 hover:bg-gray-600 cursor-pointer text-sm text-gray-100"
                onClick={() => handlePick(opt)}
              >
                {opt.label}
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
