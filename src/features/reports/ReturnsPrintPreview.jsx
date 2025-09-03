// src/features/reports/ReturnsPrintPreview.jsx
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

const ReturnsPrintPreview = ({ show, onClose, reportData }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const headers = [
    { key: "return_number", label: "رقم المرتجع" },
    { key: "customer", label: "اسم العميل" },
    { key: "user", label: "اسم المندوب" },
    { key: "return_date", label: "تاريخ المرتجع" },
    { key: "total_amount", label: "الإجمالي" },
    { key: "payment_type", label: "نوع الدفع" },
    { key: "currency", label: "العملة" },
  ];

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={isVisible}
      title="معاينة طباعة تقرير المرتجعات"
      maxWidth="max-w-6xl"
      maxHeight="max-h-4x1"
    >
      <div className="bg-white p-3 text-gray-900 overflow-y-auto max-h-[80vh] print-container">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start text-left flex-1 text-sm">
            <p className="font-bold text-gray-800 text-lg">{companyInfo.arabic.name}</p>
            <p className="text-gray-600">{companyInfo.arabic.address}</p>
            <p className="text-gray-600">{companyInfo.arabic.phone}</p>
            <p className="text-gray-600">{companyInfo.arabic.email}</p>
          </div>
          <div className="flex-shrink-0 mx-4">
            <img src={logo} alt="Company Logo" className="h-30 object-contain" />
          </div>
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
            تقرير المرتجعات
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-right text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="py-2 px-2 border border-gray-300">م</th>
                {headers.map(header => (
                  <th key={header.key} className="py-2 px-2 border border-gray-300">
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.length > 0 ? (
                reportData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-1 px-2 border-r border-gray-200 text-center">{index + 1}</td>
                    <td className="py-1 px-2 border-r border-gray-200">{item.return_number}</td>
                    <td className="py-1 px-2 border-r border-gray-200">{item.customer || "غير معروف"}</td>
                    <td className="py-1 px-2 border-r border-gray-200">{item.user || "غير معروف"}</td>
                    <td className="py-1 px-2 border-r border-gray-200">{item.return_date}</td>
                    <td className="py-1 px-2 border-r border-gray-200">{item.total_amount}</td>
                    <td className="py-1 px-2 border-r border-gray-200">{item.payment_type === "cash" ? "نقداً" : "آجل"}</td>
                    <td className="py-1 px-2">{item.currency || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length + 1} className="text-center py-4 text-gray-400">
                    لا توجد بيانات لهذا التقرير
                  </td>
                </tr>
              )}
            </tbody>
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

export default ReturnsPrintPreview;