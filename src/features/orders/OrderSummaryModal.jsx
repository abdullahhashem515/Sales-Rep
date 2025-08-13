import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";

/**
 * مكون مودال لعرض ملخص الطلبية على شكل فاتورة.
 *
 * @param {object} props
 * @param {boolean} props.show - حالة عرض/إخفاء المودال.
 * @param {function} props.onClose - دالة تستدعى عند إغلاق المودال.
 * @param {object} props.orderSummary - كائن يحتوي على ملخص الطلبية:
 * - {Array<object>} products - مصفوفة المنتجات في الطلب.
 * - {number} totalAmount - الإجمالي الكلي للطلب.
 * - {string} currencyCode - رمز العملة.
 * - {string} orderType - نوع الطلب ('cash' أو 'credit').
 * - {string} salespersonName - اسم المندوب.
 * - {string} orderId (NEW) - معرف الطلب (للفواتير الجديدة يمكن أن يكون مؤقتًا).
 */
export default function OrderSummaryModal({ show, onClose, orderSummary }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Set current date for the invoice
      setCurrentDate(new Date().toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    } else {
      setIsVisible(false);
    }
  }, [show]);

  if (!show) return null;

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={isVisible}
      title="ملخص الطلبية" // Updated title
      maxWidth="max-w-2xl" // Wider for invoice layout
    >
      <div className="flex flex-col gap-4 p-6 text-right text-gray-200"> {/* Added more padding, default text color */}
        {orderSummary ? (
          <>
            {/* Products Table Section */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 max-h-80 overflow-y-auto"> {/* Scrollable products */}
              {orderSummary.products.length > 0 ? (
                <table className="w-full text-right text-sm"> {/* Table for products, font size 14-ish */}
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="py-2 pr-2 font-semibold text-gray-300">المنتج</th>
                      <th className="py-2 font-semibold text-gray-300">الكمية</th>
                      <th className="py-2 font-semibold text-gray-300">سعر الوحدة ({orderSummary.currencyCode})</th>
                      <th className="py-2 pl-2 font-semibold text-gray-300">الإجمالي ({orderSummary.currencyCode})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderSummary.products.map((product, index) => (
                      <tr key={index} className="border-b border-gray-700 last:border-b-0">
                        <td className="py-2 pr-2">{product.name}</td>
                        <td className="py-2">{product.quantity}</td>
                        <td className="py-2">{product.unit_price.toFixed(2)}</td>
                        <td className="py-2 pl-2 font-semibold">{product.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400 text-center py-4">لا توجد منتجات في الطلب.</p>
              )}
            </div>

            {/* Total Amount */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 mt-4 text-left">
              <p className=" font-bold text-accentColor">
                <span className="font-semibold">الإجمالي الكلي:</span> {orderSummary.totalAmount.toFixed(2)} {orderSummary.currencyCode}
              </p>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center py-8">لا يوجد ملخص للطلبية لعرضه.</p>
        )}
      </div>
    </ModalWrapper>
  );
}
