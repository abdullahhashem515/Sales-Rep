import React, { useEffect, useState } from "react";
import ModalWrapper from '../../components/shared/ModalWrapper';
import { PrinterIcon } from '@heroicons/react/24/solid';

// 🟢 الشعار الآن من مجلد public مباشرة
const logo = "/logo.png";

export default function RepOrderReportModal({ show, onClose, order }) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(show);
    }, [show]);

    const formatCurrency = (amount) => {
        const currencyCode = "SAR"; // عملة افتراضية
        return `${parseFloat(amount || 0).toFixed(2)} ${currencyCode || ""}`;
    };

    const handlePrint = () => {
        window.print();
    };

    const totalAmount = order?.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0;

    if (!order) {
        return (
            <ModalWrapper
                show={show}
                onClose={() => onClose(false)}
                isVisible={isVisible}
                title="تقرير الطلب"
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
            onClose={onClose}
            isVisible={isVisible}
            title="تقرير الطلب"
            maxWidth="max-w-2xl"
        >
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #report-content, #report-content * {
                            visibility: visible;
                            font-family: 'Amiri', serif !important;
                        }
                        #report-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            margin: 0;
                            padding: 20px;
                            box-sizing: border-box;
                        }
                    }
                `}
            </style>
            <div id="report-content" className="p-4 bg-white text-gray-900 rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
                {/* Header */}
                <div className="flex flex-col items-center justify-center p-4 print:p-0">
                    <div className="flex items-center justify-between w-full pl-8 pr-5 print:pl-0 print:pr-0">
                        {/* Column 1: Company Info */}
                        <div className="flex-1 flex flex-col justify-center items-start text-right">
                            <span className="font-bold text-gray-800">
                                شركة الأمين للتجارة والصناعة بحضرموت
                            </span>
                            <span className="text-gray-700"> 712345678 / 777888555</span>
                            <span className="text-gray-700">alamininhadrahmout@company.com</span>
                        </div>

                        {/* Column 2: Logo */}
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
                            تقرير المندوب
                        </h3>
                        <div className="flex-1 border-t border-gray-400"></div>
                    </div>

                    {/* Basic Order Info */}
                    <div className="flex justify-between w-full text-sm mt-1 mb-2">
                        <p>
                            رقم الطلب: <span className="font-semibold">{order.orderNumber}</span>
                        </p>
                        <div className="text-right">
                            <p>
                                التاريخ: <span className="font-semibold">{order.orderDate}</span>
                            </p>
                            <p>
                                الحالة: <span className="font-bold">{order.status}</span>
                            </p>
                        </div>
                    </div>

                    {/* Rep Info */}
                    <div className="flex w-full px-4 py-1 border-b border-gray-300">
                        <div className="flex-1 flex flex-col items-start">
                            <div className="flex gap-1 items-center">
                                <p className="text-xs text-gray-600">المندوب:</p>
                                <p className="font-semibold text-sm">{order.repName}</p>
                            </div>
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
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, index) => {
                                    const itemTotal = item.quantity * item.unitPrice;
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
                                                {formatCurrency(item.unitPrice)}
                                            </td>
                                            <td className="py-1 px-2 text-right">
                                                {formatCurrency(itemTotal)}
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
                                {formatCurrency(totalAmount)}
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
                        onClick={handlePrint}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
                    >
                        <PrinterIcon className="h-5 w-5 ml-2" />
                        طباعة التقرير
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
}
