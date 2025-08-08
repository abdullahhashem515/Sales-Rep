import React from 'react';
import FormInputField from './FormInputField'; // Import generic input field
import FormSelectField from './FormSelectField'; // Import generic select field

/**
 * مكون تخطيط نموذج عام يعرض الحقول في صفوف متعددة الأعمدة.
 *
 * @param {object} props
 * @param {Array<object>} props.fieldsConfig - مصفوفة من تكوينات الصفوف، حيث كل صف هو كائن يحتوي على مصفوفة 'fields'.
 * مثال:
 * [
 * {
 * fields: [
 * { label: "الاسم الكامل", type: "text", placeholder: "الاسم الكامل", value: "...", onChange: ..., error: "..." },
 * { label: "رقم الجوال", type: "text", placeholder: "رقم الجوال", value: "...", onChange: ..., error: "..." },
 * ]
 * },
 * {
 * fields: [
 * { label: "الدور", type: "select", value: "...", onChange: ..., options: [...] },
 * // ...
 * ]
 * }
 * ]
 */
export default function FormLayout({ fieldsConfig }) {
  return (
    <>
      {fieldsConfig.map((row, rowIndex) => (
        // كل صف هو flex container يدعم عمودين على الشاشات الكبيرة
        <div key={rowIndex} className="flex flex-col md:flex-row md:gap-4">
          {row.fields.map((field, fieldIndex) => {
            // تحديد نوع الحقل واستخدام المكون المناسب
            if (field.type === 'select') {
              return (
                <FormSelectField
                  key={fieldIndex} // مفتاح فريد للعنصر في القائمة
                  label={field.label}
                  value={field.value}
                  onChange={field.onChange}
                  options={field.options}
                  error={field.error}
                />
              );
            } else {
              return (
                <FormInputField
                  key={fieldIndex} // مفتاح فريد للعنصر في القائمة
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChange={field.onChange}
                  error={field.error}
                />
              );
            }
          })}
          {/* هذا الـ div الفارغ يحافظ على تخطيط العمودين في الصفوف التي تحتوي على حقل واحد فقط */}
          {row.fields.length === 1 && <div className="flex-1"></div>}
        </div>
      ))}
    </>
  );
}
