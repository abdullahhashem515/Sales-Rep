// src/pages/orders/OrderPrintPreviewModal.jsx
import React, { useEffect, useState, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import logo from "../../assets/logo.png";

export default function OrderPrintPreviewModal({ show, onClose, order }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("ar-SA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const grandTotal = useMemo(() => {
    if (order?.type_order !== "wholesale") {
      return 0;
    }
    return (order.products || [])
      .reduce(
        (sum, item) =>
          sum + (parseFloat(item.unit_price) * parseFloat(item.quantity) || 0),
        0
      )
      .toFixed(2);
  }, [order]);

  if (!order) {
    return (
      <ModalWrapper
        show={show}
        onClose={() => onClose(false)}
        isVisible={isVisible}
        title="تفاصيل الطلب"
        maxWidth="max-w-3xl"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title="تفاصيل الطلب"
      maxWidth="max-w-3xl"
    >
      <div className="p-4 bg-white text-gray-900 rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
        {/* Header */}
        <div className="flex flex-col items-center justify-center p-4">
          <div className="flex items-center justify-between w-full pl-8 pr-5">
            {/* اسم الشركة */}
            <div className="flex-1 flex flex-col items-start text-right">
              <span className="font-bold text-gray-800">
                شركة الأمين للتجارة والصناعة بحضرموت
              </span>
              <span className="text-gray-700"> 712345678 / 777888555</span>
              <span className="text-gray-700">
                alamininhadrahmout@company.com
              </span>
            </div>

            {/* الشعار */}
            <div className="flex-1 flex justify-end">
              <img alt="Company Logo" src={logo} className="h-20 object-contain" />
            </div>
          </div>

          <div className="relative w-full flex items-center my-2">
            <div className="flex-1 border-t border-gray-400"></div>
            <h3 className="px-4 text-gray-800 font-bold text-center rounded-full border-2 border-gray-400">
              تفاصيل الطلب
            </h3>
            <div className="flex-1 border-t border-gray-400"></div>
          </div>

          {/* بيانات أساسية */}
          <div className="flex justify-between w-full text-sm mt-1 mb-2">
            <p>
              رقم الطلب:{" "}
              <span className="font-semibold">{order.order_id || "غير معروف"}</span>
            </p>
            <div className="text-right">
              <p>
                التاريخ:{" "}
                <span className="font-semibold">
                  {formatDate(order.order_date || order.shipment_date)}
                </span>
              </p>
              <p>
                نوع الطلب:{" "}
                <span className="font-bold">
                  {order.type_order === "wholesale" ? "جملة" : "تجزئة"}
                </span>
              </p>
            </div>
          </div>

          {/* العميل والمندوب */}
          <div className="flex w-full px-4 py-1">
            {/* العميل */}
            <div className="flex-1 flex flex-col items-start">
              <div className="flex gap-1 items-center">
                <p className="text-xs text-gray-600">العميل:</p>
                <p className="font-semibold text-sm">
                  {order.customer_name || order.customer_id || "غير متوفر"}
                </p>
              </div>
            </div>

            {/* المندوب */}
            <div className="flex-1 flex flex-col items-end">
              <div className="flex gap-1 items-center">
                <p className="text-xs text-gray-600">المندوب:</p>
                <p className="font-semibold text-sm">
                  {order.salesperson_name || order.user_id || "غير متوفر"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* جدول المنتجات */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-2 px-2 border border-gray-300">م</th>
                <th className="py-2 px-2 border border-gray-300">المنتج</th>
                <th className="py-2 px-2 border border-gray-300">الكمية</th>
                {order.type_order === "wholesale" && (
                  <>
                    <th className="py-2 px-2 border border-gray-300">سعر الوحدة</th>
                    <th className="py-2 px-2 border border-gray-300">الإجمالي</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {order.products && order.products.length > 0 ? (
                order.products.map((product, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-1 px-2 border-r border-gray-200 text-center">
                      {index + 1}
                    </td>
                    <td className="py-1 px-2 border-r border-gray-200">
                      {product.name || `منتج ${product.product_id}`}{" "}
                      {product.unit || ""}
                    </td>
                    <td className="py-1 px-2 text-center">{product.quantity}</td>
                    {order.type_order === "wholesale" && (
                      <>
                        <td className="py-1 px-2 border-r border-gray-200 text-center">
                          {product.unit_price}
                        </td>
                        <td className="py-1 px-2 text-center">
                          {(parseFloat(product.unit_price) * parseFloat(product.quantity)).toFixed(2)}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={order.type_order === "wholesale" ? "5" : "3"} className="text-center py-4 text-gray-400">
                    لا توجد منتجات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ملخص */}
        <div className="grid grid-cols-2 gap-4 p-4 border-t border-gray-300">
          <div>
            <p className="text-sm mt-2">
              حالة الطلب:{" "}
              <span className="font-bold text-teal-600">
                {order.status === "accepted"
                  ? "مقبول"
                  : order.status === "pending"
                  ? "معلق"
                  : order.status === "cancelled"
                  ? "ملغى"
                  : "غير محدد"}
              </span>
            </p>
            {order.type_order === "wholesale" && (
              <p className="text-lg font-bold text-gray-800 mt-4">
                الإجمالي الكلي: {grandTotal} {order.currency?.code || "ريال"}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center justify-end text-sm">
            <p className="mb-8">التوقيع: ....................................</p>
          </div>
        </div>

        {/* زر الطباعة */}
        <div className="flex justify-center mt-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
          >
            طباعة الطلب
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}