import React from 'react';

/**
 * مكون لحقل اختيار (Select) عام.
 * @param {object} props
 * @param {string} props.label - تسمية الحقل.
 * @param {string} props.value - القيمة المختارة الحالية.
 * @param {function} props.onChange - دالة تستدعى عند تغيير القيمة.
 * @param {Array<object|string>} props.options - مصفوفة من خيارات الاختيار. يمكن أن تكون:
 * - مصفوفة من السلاسل النصية: ['Option 1', 'Option 2']
 * - مصفوفة من الكائنات: [{ label: 'عرض 1', value: 'value1' }, { label: 'عرض 2', value: 'value2' }]
 * @param {string} [props.error] - رسالة الخطأ (إن وجدت).
 * @param {string} [props.className] - فئات CSS إضافية للعنصر div الرئيسي.
 */
export default function FormSelectField({ label, value, onChange, options, error, className }) {
  return (
    <div className={`flex-1 mb-3 md:mb-0 ${className}`}>
      <label className="block mb-1">{label}</label>
      <select
        className={`w-full p-2 rounded bg-gray-800 border ${error ? 'border-red-500' : 'border-gray-600'}`}
        value={value}
        onChange={onChange}
      >
        {options.map((option, index) => {
          // التحقق مما إذا كان الخيار كائنًا أم سلسلة نصية
          const optionValue = typeof option === 'object' && option !== null && 'value' in option ? option.value : option;
          const optionLabel = typeof option === 'object' && option !== null && 'label' in option ? option.label : option;

          return (
            <option key={index} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
