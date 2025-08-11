import React from 'react';

/**
 * مكون جدول عام قابل لإعادة الاستخدام.
 * يعرض البيانات في شكل جدول مع رسائل التحميل والخطأ وحالة عدم وجود بيانات.
 *
 * @param {object} props
 * @param {Array<object>} props.headers - مصفوفة من رؤوس الأعمدة. كل عنصر هو { key: string, label: string }.
 * `key` يجب أن يتطابق مع مفتاح الخاصية في كائنات `data`.
 * @param {Array<object>} props.data - مصفوفة من الكائنات لتمثل صفوف الجدول.
 * @param {boolean} props.loading - حالة التحميل.
 * @param {string|null} props.error - رسالة الخطأ (إن وجدت).
 * @param {number} props.totalCount - العدد الإجمالي للعناصر المفلترة (يستخدم لرسالة "لا توجد بيانات").
 * @param {function} props.renderRow - دالة تعيد JSX لكل صف من البيانات. تتلقى (item, index) كمعاملات.
 * هذه الدالة مسؤولة عن عرض خلايا `<td>` لصف معين.
 * @param {string} [props.rowKeyField='id'] - اسم المفتاح في كائنات البيانات الذي يجب استخدامه كمفتاح فريد لـ `<tr>`.
 */
export default function Table({ headers, data, loading, error, totalCount, renderRow, rowKeyField = 'id' }) {
  if (loading) {
    return <p className="text-center text-lg text-white">جاري تحميل البيانات...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg">خطأ: {error}</p>;
  }

  if (totalCount === 0) {
    return <p className="text-center text-lg text-white">لا توجد بيانات لعرضها.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="amiriFont min-w-full text-white border-collapse">
        <thead>
          <tr className="accentColor text-white">
            {headers.map((header) => (
              <th key={header.key} className="py-3 px-4 text-right">
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            // استخدام item[rowKeyField] كمفتاح فريد للصف
            <tr key={item[rowKeyField]} className="border-b border-gray-700">
              {/* يتم استدعاء renderRow لتوليد محتوى كل صف */}
              {renderRow(item, index)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
