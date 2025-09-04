// src/features/reports/InventoryReportPrintPreview.jsx
import React from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import logo from "/logo.png";

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

export default function InventoryReportPrintPreview({ show, onClose, reportData }) {
  // ✅ استخراج البيانات من الكائن الممرر
  const { data, repName, fromDate, toDate } = reportData || {};
  const dataToDisplay = data && data.length > 0 ? data : [];

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={true}
      title="معاينة تقرير المخزون"
      maxWidth="max-w-4xl"
      maxHeight="max-h-4x1"
    >
      <div className="bg-white p-3 text-gray-900 overflow-y-auto max-h-[80vh] print-container">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b pb-4 border-gray-300">
          <div className="flex flex-col items-start text-left flex-1 text-sm">
            <p className="font-bold text-gray-800 text-lg">{companyInfo.arabic.name}</p>
            <p className="text-gray-600">{companyInfo.arabic.address}</p>
            <p className="text-gray-600">{companyInfo.arabic.phone}</p>
            <p className="text-gray-600">{companyInfo.arabic.email}</p>
          </div>
          <div className="flex-shrink-0 mx-4">
            <img src={logo} alt="Company Logo" className="h-20 object-contain" />
          </div>
          <div className="flex flex-col items-end text-right flex-1 text-sm">
            <p className="font-bold text-gray-800 text-lg">{companyInfo.english.name}</p>
            <p className="text-gray-600">{companyInfo.english.address}</p>
            <p className="text-gray-600">{companyInfo.english.phone}</p>
            <p className="text-gray-600">{companyInfo.english.email}</p>
          </div>
        </div>

        {/* Report Title */}
        <div className="relative flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className=" text-gray-700 text-center">
            مخزون المندوب: {repName || "غير معروف"}
            <br />
            من تاريخ: {fromDate || "غير محدد"} - إلى تاريخ: {toDate || "غير محدد"}
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full text-right text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
                <th className="py-2 px-3 border border-gray-300">م</th>
                <th className="py-2 px-3 border border-gray-300">اسم المنتج والسعة</th>
                <th className="py-2 px-3 border border-gray-300">الكمية</th>
              </tr>
            </thead>
            <tbody>
              {dataToDisplay.length > 0 ? (
                dataToDisplay.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 px-3 border border-gray-200 text-center">{index + 1}</td>
                    <td className="py-2 px-3 border border-gray-200">{item.product} ({item.unit})</td>
                    <td className="py-2 px-3 border border-gray-200">{item.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-gray-500">
                    لا توجد بيانات في هذا التقرير.
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
        <div className="flex justify-center mt-8 print:hidden">
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
}