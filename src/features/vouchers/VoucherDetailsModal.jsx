import React, { useEffect, useState } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import logo from "../../assets/logo.png";
import { format } from "date-fns";

export default function VoucherDetailsModal({ show, onClose, voucher }) {
  const [isVisible, setIsVisible] = useState(false);
  console.log("Voucher data:", voucher);
  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount, currencyCode) =>
    `${parseFloat(amount || 0).toFixed(2)} ${currencyCode || ""}`;

  if (!voucher) {
    return (
      <ModalWrapper
        show={show}
        onClose={() => onClose(false)}
        isVisible={isVisible}
        title="تفاصيل السند"
        maxWidth="max-w-2xl"
      >
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      </ModalWrapper>
    );
  }

  const isClientVoucher = !!voucher.customer;
  const voucherTitle = isClientVoucher ? "سند تسديد عميل" : "سند سحب من المندوب";

  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title={voucherTitle}
      maxWidth="max-w-2xl"
    >
      <div className="p-4 bg-white text-gray-900 rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
        <div className="flex flex-col items-center justify-center p-4">
          <div className="flex items-center justify-between w-full pl-8 pr-5">
            <div className="flex-1 flex flex-col justify-center items-start text-left">
              <span className="font-bold text-gray-800 text-sm">
                شركة الأمين للتجارة والصناعة بحضرموت
              </span>
              <span className="text-gray-700 text-xs"> 712345678 / 777888555</span>
              <span className="text-gray-700 text-xs">alamininhadrahmout@company.com</span>
            </div>

            <div className="flex-1 flex justify-end">
              <img
                alt="Your Company"
                src={logo}
                className="h-20 object-contain"
              />
            </div>
          </div>
          
          <div className="relative w-full flex items-center my-2">
            <div className="flex-1 border-t border-gray-400"></div>
            <h3 className="px-4 text-gray-800 font-bold text-center rounded-full border-2 border-gray-400 text-sm">
              {voucherTitle}
            </h3>
            <div className="flex-1 border-t border-gray-400"></div>
          </div>

          <div className="flex flex-col w-full text-xs mt-1 text-left">
            <div className="grid grid-cols-2 gap-2 w-full">
              {/* Row 1 */}
              <div className="flex justify-start items-center">
                <span className="mr-1">رقم السند:</span>
                <span className="font-semibold">{voucher.voucher_number}</span>
              </div>
              <div className="flex justify-start items-center">
                <span className="mr-1">التاريخ:</span>
                <span className="font-semibold">{formatDate(voucher.payment_date)}</span>
              </div>
              
              {/* Row 2 */}
              <div className="flex justify-start items-center">
                <span className="mr-1">العملة:</span>
                <span className="font-bold">({voucher.currency || "N/A"})</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col w-full text-sm pr-6 text-left">
          {isClientVoucher ? (
            <div className="mb-2">
              <div className="flex justify-start items-center mb-1">
                <span className="mr-1">إستلمت من العميل المحترم:</span>
                <span className="font-bold">{voucher.customer || "غير متوفر"}</span>
              </div>
              <div className="flex justify-start items-center">
                <span className="mr-1">عن طريق المندوب:</span>
                <span className="font-bold">{voucher.sales_rep || "غير متوفر"}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-start items-center mb-2">
              <span className="mr-1">استلمت من المندوب:</span>
              <span className="font-bold">{voucher.sales_rep || "غير متوفر"}</span>
            </div>
          )}

          <div className="flex justify-start items-center mb-2">
            <span className="mr-1">مبلغ وقدرة:</span>
            <p className="font-bold text-sm ">
              {formatCurrency(voucher.amount, voucher.currency)} فقط
            </p>
          </div>
          
          <div className="flex justify-start items-center mb-2">
              <span className="mr-1">وذلك مقابل:</span>
              <span className="font-bold">{voucher.note || "غير متوفر"}</span>
            </div>
        </div>

        <div className="flex justify-center mt-6 print:hidden w-full">
          <button
            onClick={() => window.print()}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
          >
            طباعة السند
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}