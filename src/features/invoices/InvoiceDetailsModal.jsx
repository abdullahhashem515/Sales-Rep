// src/pages/invoices/InvoiceDetailsModal.jsx
import React, { useEffect, useState } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import logo from "../../assets/logo.png";

export default function InvoiceDetailsModal({ show, onClose, invoice }) {
  const [isVisible, setIsVisible] = useState(false);

  console.log("بيانات الفاتورة", invoice);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      // التاريخ الميلادي
      return new Date(dateString).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount, currencyCode) =>
    `${parseFloat(amount || 0).toFixed(2)} ${currencyCode || ""}`;

  if (!invoice) {
    return (
      <ModalWrapper
        show={show}
        onClose={() => onClose(false)}
        isVisible={isVisible}
        title="فاتورة بيع"
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
      title="فاتورة بيع"
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
    فاتورة بيع (
    {invoice.payment_type === "cash"
      ? "نقدا"
      : invoice.payment_type === "credit"
      ? "آجل"
      : "غير محدد"}
    )
  </h3>

  <div className="flex-1 border-t border-gray-400"></div>
</div>

{/* بيانات الفاتورة الأساسية */}
<div className="flex justify-between w-full text-sm mt-1 mb-2">
  <p>
    رقم الفاتورة: <span className="font-semibold">{invoice.invoice_number}</span>
  </p>
  <div className="text-right">
    <p>
      التاريخ: <span className="font-semibold">{formatDate(invoice.date)}</span>
    </p>
    <p>
      العملة: <span className="font-bold">({invoice.currency?.code || "N/A"})</span>
    </p>
  </div>
</div>

{/* بيانات العميل والمندوب */}
{/* بيانات العميل والمندوب */}
<div className="flex w-full px-4 py-1 border-b border-gray-300">
  {/* العمود الأيسر: العميل */}
  <div className="flex-1 flex flex-col items-start">
    <div className="flex gap-1 items-center">
      <p className="text-xs text-gray-600">العميل:</p>
      <p className="font-semibold text-sm">{invoice.customer?.name || "غير متوفر"}</p>
    </div>
    <p className="text-xs text-gray-500 mt-0.5">
      {invoice.customer?.address || ""}, {invoice.customer?.city || ""}
    </p>
  </div>

  {/* العمود الأيمن: المندوب */}
  <div className="flex-1 flex flex-col items-end">
    <div className="flex gap-1 items-center">
      <p className="text-xs text-gray-600">المندوب:</p>
      <p className="font-semibold text-sm">{invoice.user?.name || "غير متوفر"}</p>
    </div>
    <p className="text-xs text-gray-500 mt-0.5">{invoice.user?.phone_number || ""}</p>
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
                <th className="py-2 px-2 border border-gray-300">الكمية</th>
                <th className="py-2 px-2 border border-gray-300">السعر</th>
                <th className="py-2 px-2 border border-gray-300">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items && invoice.items.length > 0 ? (
                invoice.items.map((item, index) => {
                  const itemTotal = item.quantity * item.unit_price;
                  return (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-1 px-2 border-r border-gray-200 text-center">
                        {index + 1}
                      </td>
                      <td className="py-1 px-2 border-r border-gray-200">
                        {item.name || ""} {item.unit || ""}
                      </td>
                      <td className="py-1 px-2 border-r border-gray-200 text-center">
                        {item.quantity}
                      </td>
                      <td className="py-1 px-2 border-r border-gray-200 text-right">
                        {formatCurrency(
                          item.unit_price,
                          invoice.currency?.code
                        )}
                      </td>
                      <td className="py-1 px-2 text-right">
                        {formatCurrency(itemTotal, invoice.currency?.code)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-400">
                    لا توجد منتجات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 border-t border-gray-300">
          <div>
            <p className="text-sm mt-2">
              الإجمالي الكلي:{" "}
              <span className="text-lg font-bold text-teal-600">
                {formatCurrency(invoice.total_amount, invoice.currency?.code)}
              </span>
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
            طباعة الفاتورة
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}
