import React, { useEffect, useState } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import logo from "../../assets/logo.png";

export default function ReturnDetailsModal({ show, onClose, returnData }) {
  const [isVisible, setIsVisible] = useState(false);

  console.log("بيانات المرتجع", returnData);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };
console.log("iiiiiiiiiiii",returnData);
  const formatCurrency = (amount, currencyCode) =>
    `${parseFloat(amount || 0).toFixed(2)} ${currencyCode || ""}`;

  if (!returnData) {
    return (
      <ModalWrapper
        show={show}
        onClose={() => onClose(false)}
        isVisible={isVisible}
        title="تفاصيل المرتجع"
        maxWidth="max-w-2xl"
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
      title="تفاصيل المرتجع"
      maxWidth="max-w-2xl"
    >
      <div className="p-4 bg-white text-gray-900 rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
        {/* Header */}
        <div className="flex flex-col items-center justify-center p-4 ">
          <div className="flex items-center justify-between w-full pl-8 pr-5">
            {/* العمود الأول: اسم الشركة وأرقام التواصل */}
            <div className="flex-1 flex flex-col justify-center items-start text-right">
              <span className="font-bold text-gray-800">
                شركة الأمين للتجارة والصناعة بحضرموت
              </span>
              <span className="text-gray-700"> 712345678 / 777888555</span>
              <span className="text-gray-700">alamininhadrahmout@company.com</span>
            </div>

            {/* العمود الثالث: الشعار */}
            <div className="flex-1 flex justify-end">
              <img
                alt="Your Company"
                src={logo}
                className="h-25 object-contain"
              />
            </div>
          </div>

          <div className="relative w-full flex items-center my-2">
            <div className="flex-1 border-t border-gray-400"></div>

            <h3 className="px-4 text-gray-800 font-bold text-center rounded-full border-2 border-gray-400">
              إشعار مرتجع (
              {returnData.payment_type === "cash"
                ? "نقدا"
                : returnData.payment_type === "credit"
                ? "آجل"
                : "غير محدد"}
              )
            </h3>

            <div className="flex-1 border-t border-gray-400"></div>
          </div>

          {/* بيانات المرتجع الأساسية */}
          <div className="flex justify-between w-full text-sm mt-1 mb-2">
            <p>
 رقم الفاتورة المرجعة <span className="font-semibold">{returnData.return_number || "N/A"}</span>
            </p>
            <div className="text-right">
              <p>
                تاريخ المرتجع: <span className="font-semibold">{formatDate(returnData.return_date)}</span>
              </p>
              <p>
                العملة: <span className="font-bold">({returnData.currency || "N/A"})</span>
              </p>
            </div>
          </div>

          {/* بيانات العميل والمندوب */}
          <div className="flex w-full px-4 py-1 border-b border-gray-300">
            <div className="flex-1 flex flex-col items-start">
              <div className="flex gap-1 items-center">
                <p className="text-xs text-gray-600">العميل:</p>
                {/* ✨ تم التعديل هنا لاستخدام اسم العميل مباشرةً */}
                <p className="font-semibold text-sm">{returnData.customer || "غير متوفر"}</p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {/* هذه البيانات غير متوفرة في البنية الجديدة، لذا تم إزالتها */}
              </p>
            </div>

            <div className="flex-1 flex flex-col items-end">
              <div className="flex gap-1 items-center">
                <p className="text-xs text-gray-600">المندوب:</p>
                {/* ✨ تم التعديل هنا لاستخدام اسم المندوب مباشرةً */}
                <p className="font-semibold text-sm">{returnData.user || "غير متوفر"}</p>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {/* هذه البيانات غير متوفرة في البنية الجديدة، لذا تم إزالتها */}
              </p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-right text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-2 px-2 border border-gray-300">م</th>
                <th className="py-2 px-2 border border-gray-300">المنتج</th>
                <th className="py-2 px-2 border border-gray-300">الكمية المرتجعة</th>
                <th className="py-2 px-2 border border-gray-300">السعر</th>
                <th className="py-2 px-2 border border-gray-300">السبب</th>
              </tr>
            </thead>
            <tbody>
              {returnData.items && returnData.items.length > 0 ? (
                returnData.items.map((item, index) => {
                  return (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-1 px-2 border-r border-gray-200 text-center">
                        {index + 1}
                      </td>
                      <td className="py-1 px-2 border-r border-gray-200">
                        {item.product_name || ""}
                      </td>
                      <td className="py-1 px-2 border-r border-gray-200 text-center">
                        {/* ✨ تم التعديل لعرض return_qty */}
                        {item.return_qty}
                      </td>
                      <td className="py-1 px-2 border-r border-gray-200 text-right">
                        {formatCurrency(
                          item.unit_price,
                          returnData.currency?.code
                        )}
                      </td>
                      <td className="py-1 px-2 text-right">
                        {item.reason || "لا يوجد"}
                      </td>
                    </tr>
                );
              })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-400">
                    لا توجد منتجات مرتجعة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 border-t border-gray-300">
          <div>
            <p className="text-sm">
              إجمالي المبلغ المرتجع:{" "}
              <span className="text-lg font-bold text-teal-600">
                {formatCurrency(
                  returnData.total_amount,
                  returnData.currency
                )}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              ملاحظات: {returnData.notes || "لا يوجد"}
            </p>
          </div>
          <div className="flex flex-col items-center justify-end text-sm">
            <p className="mb-8">
              التوقيع: .......................................
            </p>
          </div>
        </div>

        {/* Print Button */}
        <div className="flex justify-center mt-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
          >
            طباعة إشعار المرتجع
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}