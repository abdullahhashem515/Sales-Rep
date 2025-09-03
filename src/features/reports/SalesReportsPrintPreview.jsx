// src/features/reports/SalesReportsPrintPreview.jsx
import React, { useEffect, useState } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import logo from "../../assets/logo.png";

// بيانات الشركة الثابتة
const companyInfo = {
  arabic: {
    name: "شركة الأمين للتجارة والصناعة بحضرموت",
    address: "حضرموت، اليمن",
    phone: "777888555 / 712345678",
    email: "alamininhadrahmout@company.com",
  },
  english: {
    name: "Al-Ameen Trading & Industry Co.",
    address: "Hadhramout, Yemen",
    phone: "777888555 967+ / 712345678 967+",
    email: "alamininhadrahmout@company.com",
  },
};

const SalesReportsPrintPreview = ({ show, onClose, reportData, filters ,grandTotal }) => {
  const [isVisible, setIsVisible] = useState(false);
console.log("skehsekjhcvksj",grandTotal);
  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const formatCurrency = (amount, currencyCode) =>
    `${parseFloat(amount || 0).toFixed(2)} ${currencyCode || ""}`;

  const paymentTypeMap = {
    cash: "نقداً",
    credit: "آجل",
  };



  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={isVisible}
      title="معاينة طباعة تقرير المبيعات"
      maxWidth="max-w-6xl"
      maxHeight="max-h-4x1"
    >
      <div className="bg-white p-3 text-gray-900 overflow-y-auto max-h-[80vh] print-container">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          {/* بيانات الشركة بالعربية (يمين) */}
          <div className="flex flex-col items-start text-left flex-1 text-sm">
            <p className="font-bold text-gray-800 text-lg">{companyInfo.arabic.name}</p>
            <p className="text-gray-600">{companyInfo.arabic.address}</p>
            <p className="text-gray-600">{companyInfo.arabic.phone}</p>
            <p className="text-gray-600">{companyInfo.arabic.email}</p>
          </div>

          {/* الشعار (الوسط) */}
          <div className="flex-shrink-0 mx-4">
            <img src={logo} alt="Company Logo" className="h-30 object-contain" />
          </div>

          {/* بيانات الشركة بالإنجليزية (يسار) */}
          <div className="flex flex-col items-end text-right flex-1 text-sm">
            <p className="font-bold text-gray-800 text-lg">{companyInfo.english.name}</p>
            <p className="text-gray-600">{companyInfo.english.address}</p>
            <p className="text-gray-600">{companyInfo.english.phone}</p>
            <p className="text-gray-600">{companyInfo.english.email}</p>
          </div>
        </div>

        {/* عنوان التقرير */}
        <div className="relative flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-xl font-semibold text-gray-700">
            تقرير المبيعات
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-2 px-2 border border-gray-300">رقم الفاتورة</th>
                <th className="py-2 px-2 border border-gray-300">اسم المندوب</th>
                <th className="py-2 px-2 border border-gray-300">اسم العميل</th>
                <th className="py-2 px-2 border border-gray-300">التاريخ</th>
                <th className="py-2 px-2 border border-gray-300">العملة</th>
                <th className="py-2 px-2 border border-gray-300">نوع الدفع</th>
                <th className="py-2 px-2 border border-gray-300">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((invoice, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-1 px-2 border-r border-gray-200">
                      {invoice.invoice_number}
                    </td>
                    <td className="py-1 px-2 border-r border-gray-200">
                      {invoice.user?.name || "غير معروف"}
                    </td>
                    <td className="py-1 px-2 border-r border-gray-200">
                      {invoice.customer?.name || "غير معروف"}
                    </td>
                    <td className="py-1 px-2 border-r border-gray-200">
                      {invoice.date}
                    </td>
                    <td className="py-1 px-2 border-r border-gray-200">
                      {invoice.currency?.code || "N/A"}
                    </td>
                    <td className="py-1 px-2 border-r border-gray-200">
                      {paymentTypeMap[invoice.payment_type] || invoice.payment_type}
                    </td>
                    <td className="py-1 px-2">
                      {formatCurrency(
                        invoice.total_amount,
                        invoice.currency?.code
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-400">
                    لا توجد بيانات لهذا التقرير
                  </td>
                </tr>
              )}
            </tbody>
               {/* ✅ الإجمالي الكلي */}
    {reportData.length > 0 && (
      <tfoot>
        <tr className="bg-gray-100 font-bold border-t border-gray-300">
          <td colSpan="6" className="py-2 px-2 text-left">
            الإجمالي الكلي
          </td>
          <td className="py-2 px-2 text-right">
            {formatCurrency(grandTotal, reportData[0]?.currency?.code)}
          </td>
        </tr>
      </tfoot>
    )}
          </table>
        </div>

        {/* Report Date */}
        <p className="text-sm text-gray-500 text-center mt-3">
          تاريخ التقرير: {new Date().toLocaleDateString("en-GB")}
        </p>

        {/* Print Button */}
        <div className="flex justify-center mt-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
          >
            طباعة التقرير
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default SalesReportsPrintPreview;