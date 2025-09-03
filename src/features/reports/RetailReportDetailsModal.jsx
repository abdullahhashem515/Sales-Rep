// src/features/reports/RetailReportDetailsModal.jsx
import React, { useEffect, useState } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import logo from "/logo.png";

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

export default function RetailReportDetailsModal({ show, onClose, reportData }) {
  const [isVisible, setIsVisible] = useState(false);

  // كائن لترجمة حالات الطلبات من الإنجليزية إلى العربية
  const statusMap = {
    accepted: "مقبول",
    pending: "معلق",
    cancelled: "مرفوض",
  };

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const handleCloseModal = () => {
    setIsVisible(false);
    onClose();
  };

  // بيانات تجريبية في حال عدم وجود بيانات حقيقية
  const mockReportData = [
    {
      id: 1,
      user: { name: "علياء أحمد" },
      shipment_number: "SHIP-001",
      shipment_date: "2023-08-01",
      status: "accepted",
    },
    {
      id: 2,
      user: { name: "محمد سعيد" },
      shipment_number: "SHIP-002",
      shipment_date: "2023-08-03",
      status: "pending",
    },
    {
      id: 3,
      user: { name: "سلمان حسن" },
      shipment_number: "SHIP-003",
      shipment_date: "2023-08-05",
      status: "cancelled",
    },
  ];

  const dataToDisplay = reportData && reportData.length > 0 ? reportData : mockReportData;

  return (
    <ModalWrapper
      show={show}
      onClose={handleCloseModal}
      isVisible={isVisible}
      title="تقرير شحنات التجزئة"
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
            تقرير شحنات التجزئة
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* جدول التقرير */}
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full text-right text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
                <th className="py-2 px-3 border border-gray-300">م</th>
                <th className="py-2 px-3 border border-gray-300">اسم المندوب</th>
                <th className="py-2 px-3 border border-gray-300">رقم الشحنة</th>
                <th className="py-2 px-3 border border-gray-300">تاريخ الشحنة</th>
                <th className="py-2 px-3 border border-gray-300">حالة الشحنة</th>
              </tr>
            </thead>
            <tbody>
              {dataToDisplay.length > 0 ? (
                dataToDisplay.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-2 px-3 border border-gray-200 text-center">{index + 1}</td>
                    <td className="py-2 px-3 border border-gray-200">{item.user.name}</td>
                    <td className="py-2 px-3 border border-gray-200">{item.shipment_number}</td>
                    <td className="py-2 px-3 border border-gray-200">{item.shipment_date}</td>
                    <td className="py-2 px-3 border border-gray-200">
                      {statusMap[item.status] || item.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    لا توجد بيانات في هذا التقرير.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* تاريخ التقرير */}
        <p className="text-sm text-gray-500 text-center mt-3">
          تاريخ التقرير: {new Date().toLocaleDateString("en-GB")}
        </p>

        {/* زر الطباعة (مخفي أثناء الطباعة) */}
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
