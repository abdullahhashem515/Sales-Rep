import React from 'react';
import FormInputField from './FormInputField'; // استيراد مكون حقل الإدخال العام
import FormSelectField from './FormSelectField'; // استيراد مكون حقل الاختيار العام

/**
 * مكون تخطيط نموذج عام يعرض الحقول بحيث يظهر حقل واحد في كل صف.
 * يستخدم هذا المكون عندما تكون الحقول مصممة لكيانات فردية في كل سطر.
 *
 * @param {object} props
 * @param {Array<object>} props.fieldsConfig - مصفوفة من تكوينات الحقول.
 * كل عنصر في المصفوفة هو كائن يمثل حقلًا واحدًا.
 * مثال:
 * [
 * { label: "الاسم الكامل", type: "text", placeholder: "الاسم الكامل", value: "...", onChange: ..., error: "..." },
 * { label: "رقم الجوال", type: "text", placeholder: "رقم الجوال", value: "...", onChange: ..., error: "..." },
 * ]
 */
export default function FormLayoutSingleColumn({ fieldsConfig }) {
  return (
    <div className="flex flex-col gap-4"> {/* تخطيط عمودي مع فجوة بين الحقول */}
      {fieldsConfig.map((rowConfig, rowIndex) => (
        // كل عنصر في fieldsConfig هو في الواقع صف هنا يحتوي على حقل واحد فقط
        <React.Fragment key={rowIndex}>
          {rowConfig.fields.map((field, fieldIndex) => {
            if (field.type === 'select') {
              return (
                <FormSelectField
                  key={fieldIndex}
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
                  key={fieldIndex}
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
        </React.Fragment>
      ))}
    </div>
  );
}
