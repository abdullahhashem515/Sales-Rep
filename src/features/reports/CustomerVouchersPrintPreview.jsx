import React from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";

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

// شعار مؤقت
import logo from "/logo.png";

// ✅ دالة تنسيق الأرقام مع العملة (تظهر أرقام إنجليزية)
const formatCurrency = (value, currency = "YER") => {
  if (!value || isNaN(value)) return "0";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return Number(value).toLocaleString("en-US");
  }
};

const CustomerVouchersPrintPreview = ({ show, onClose, reportData, grandTotal }) => {
  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={true}
      title="معاينة طباعة سندات قبض العملاء"
      maxWidth="max-w-7xl"
      maxHeight="max-h-[100vh]"
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
            <img src={logo} alt="Company Logo" className="h-25 object-contain" />
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
          <span className="mx-4 text-xl font-semibold text-gray-700">
            تقرير سندات قبض العملاء
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-2 border border-gray-300">رقم السند</th>
                <th className="py-2 px-2 border border-gray-300">اسم العميل</th>
                <th className="py-2 px-2 border border-gray-300">اسم المندوب</th>
                <th className="py-2 px-2 border border-gray-300">تاريخ السند</th>
                <th className="py-2 px-2 border border-gray-300">المبلغ</th>
                <th className="py-2 px-2 border border-gray-300">العملة</th>
                <th className="py-2 px-2 border border-gray-300">الملاحظة</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((item, index) => (
                <tr key={item.slug || index}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 border border-gray-200">
                    {item.voucher_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 border border-gray-200">
                    {item.customer || "غير معروف"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 border border-gray-200">
                    {item.sales_rep || "غير معروف"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 border border-gray-200">
                    {item.payment_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 border border-gray-200">
                    {item.amount ? formatCurrency(item.amount, item.currency) : "0"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 border border-gray-200">
                    {item.currency || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 border border-gray-200">
                    {item.note || "-"}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* ✅ الإجمالي الكلي */}
        {reportData.length > 0 && (
  <tfoot>
    <tr className="bg-gray-100 font-bold border-t border-gray-300">
      <td colSpan="6" className="py-2 px-2 text-left">
        الإجمالي الكلي
      </td>
      <td className="py-2 px-2 text-right">
        {formatCurrency(grandTotal, reportData[0]?.currency || "YER")}
      </td>
    </tr>
  </tfoot>
)}


          </table>
        </div>

        {/* Print Button */}
        <div className="flex justify-center pt-4 border-t print:hidden">
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

export default CustomerVouchersPrintPreview;
