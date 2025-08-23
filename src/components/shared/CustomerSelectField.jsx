import React, { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function CustomerSelectField({ label, value, onChange, options = [], placeholder = "اختر عميل...", error }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef(null);

  const normalizedOptions = useMemo(() => options.map(o => ({ label: o.label, value: o.value })), [options]);

  useEffect(() => setSearchTerm(value?.label ?? ""), [value]);

  useEffect(() => {
    const onDocClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filteredOptions = useMemo(() => {
    const q = (searchTerm || "").toLowerCase();
    if (!q) return normalizedOptions;
    return normalizedOptions.filter(o => o.label.toLowerCase().includes(q));
  }, [searchTerm, normalizedOptions]);

  const handlePick = (opt) => { onChange(opt); setSearchTerm(opt?.label ?? ""); setIsOpen(false); };
  const handleClear = () => { onChange(null); setSearchTerm(""); };

  return (
    <div className="flex-1 mb-3 md:mb-0 relative" ref={wrapRef}>
      {label && <label className="block mb-1 text-sm font-medium text-gray-200">{label}</label>}
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          className={`pr-9 w-full p-2 rounded bg-gray-800 border ${error ? "border-red-500" : "border-gray-600"} text-sm text-gray-50`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {searchTerm && <button type="button" onClick={handleClear}><XMarkIcon className="h-5 w-5 text-gray-400 hover:text-white"/></button>}
          <button type="button" onClick={() => setIsOpen(v => !v)}><ChevronDownIcon className="h-5 w-5 text-gray-400"/></button>
        </div>
      </div>

      {isOpen && (
        <ul className="absolute z-50 w-full bg-gray-700 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.length ? filteredOptions.map(opt => (
            <li key={opt.value} className="p-2 hover:bg-gray-600 cursor-pointer text-sm text-gray-100" onClick={() => handlePick(opt)}>
              {opt.label}
            </li>
          )) : <li className="p-2 text-gray-400 text-sm">لا توجد نتائج</li>}
        </ul>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
