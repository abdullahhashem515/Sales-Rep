import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";

export default function OrderSummaryModal({ show, onClose, orderSummary }) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    if (show) {
      setIsVisible(true);
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
      title="ملخص الطلبية"
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-4 p-6 text-right text-gray-200">
        {orderSummary ? (
          <>
            {/* Products Table Section */}
            <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 max-h-80 overflow-y-auto">
              {orderSummary.products.length > 0 ? (
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="py-2 pr-2 font-semibold text-gray-300">المنتج</th>
                      <th className="py-2 font-semibold text-gray-300">الكمية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderSummary.products.map((product, index) => (
                      <tr key={index} className="border-b border-gray-700 last:border-b-0">
                        <td className="py-2 pr-2">
                          {product.name} {product.unit ? `(${product.unit})` : ''}
                        </td>
                        <td className="py-2">{product.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-400 text-center py-4">لا توجد منتجات في الطلب.</p>
              )}
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center py-8">لا يوجد ملخص للطلبية لعرضه.</p>
        )}
      </div>
    </ModalWrapper>
  );
}
