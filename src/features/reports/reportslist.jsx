// src/features/reports/ReportsList.jsx
import React, { useState } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import RepAndOrdersModal from "./RepAndOrdersModal";
import ReportDetailsModal from "./ReportDetailsPage";
import OrderPrintPreviewModal from "../orders/OrderPrintPreviewModal"; // ✅ تم استيراد المودال هنا
import {
  ChartBarIcon,
  ShoppingBagIcon,
  UsersIcon,
  DocumentTextIcon,
  CubeIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

const ReportButton = ({ title, icon, colorClass, onClick }) => {
  return (
    <button
      className={`flex flex-col items-center justify-center p-6 rounded-lg shadow-md transition-transform transform hover:scale-105 ${colorClass} text-white`}
      onClick={onClick}
    >
      {icon && <div className="mb-2">{icon}</div>}
      <span className="text-lg font-semibold">{title}</span>
    </button>
  );
};

export default function ReportsList() {
  const [isRepOrdersModalOpen, setIsRepOrdersModalOpen] = useState(false);
  const [isReportDetailsModalOpen, setIsReportDetailsModalOpen] = useState(false);
  const [reportDataToPrint, setReportDataToPrint] = useState([]);
  // ✅ حالات جديدة لإدارة مودال تفاصيل الطلب
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrderData, setSelectedOrderData] = useState(null);

  const handleOpenReportModal = (data) => {
    setReportDataToPrint(data);
    setIsReportDetailsModalOpen(true);
  };

  // ✅ دالة جديدة لفتح مودال تفاصيل طلب واحد
  const handleOpenOrderDetails = (order) => {
    setSelectedOrderData(order);
    setIsOrderDetailsModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="amiriFont text-white p-6">
        <PageHeader title="التقارير" />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ReportButton
            title="مندوبين الجملة وطلباتهم"
            icon={<ShoppingBagIcon className="h-10 w-10" />}
            colorClass="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setIsRepOrdersModalOpen(true);
            }}
          />
          <ReportButton
            title="مندوبين التجزئة وطلباتهم"
            icon={<UsersIcon className="h-10 w-10" />}
            colorClass="bg-emerald-600 hover:bg-emerald-700"
          />
          <ReportButton
            title="المندوبين وزياراتهم"
            icon={<UsersIcon className="h-10 w-10" />}
            colorClass="bg-emerald-600 hover:bg-emerald-700"
          />
          <ReportButton
            title="المبيعات"
            icon={<ChartBarIcon className="h-10 w-10" />}
            colorClass="bg-cyan-600 hover:bg-cyan-700"
          />
          <ReportButton
            title="سندات القبض"
            icon={<DocumentTextIcon className="h-10 w-10" />}
            colorClass="bg-orange-600 hover:bg-orange-700"
          />
          <ReportButton
            title="المرتجعات"
            icon={<ShoppingBagIcon className="h-10 w-10" />}
            colorClass="bg-purple-600 hover:bg-purple-700"
          />
          <ReportButton
            title="المخزون"
            icon={<CubeIcon className="h-10 w-10" />}
            colorClass="bg-teal-600 hover:bg-teal-700"
          />
          <ReportButton
            title="إجمالي الأداء"
            icon={<SparklesIcon className="h-10 w-10" />}
            colorClass="bg-indigo-600 hover:bg-indigo-700"
          />
          <ReportButton
            title="الأصناف وأسعارها"
            icon={<CubeIcon className="h-10 w-10" />}
            colorClass="bg-yellow-600 hover:bg-yellow-700"
          />
        </div>
      </div>

      {/* المودال الأول: تقرير المندوبين وطلباتهم */}
      <RepAndOrdersModal
        show={isRepOrdersModalOpen}
        onClose={() => setIsRepOrdersModalOpen(false)}
        title="تقرير مندوبين الجملة وطلباتهم"
        onPreviewAndPrint={handleOpenReportModal}
        onOpenOrderDetails={handleOpenOrderDetails} // ✅ تم تمرير الدالة الجديدة هنا
      />

      {/* ✅ المودال الثاني: معاينة التقرير للطباعة */}
      <ReportDetailsModal
        show={isReportDetailsModalOpen}
        onClose={() => setIsReportDetailsModalOpen(false)}
        reportData={reportDataToPrint}
      />

      {/* ✅ المودال الثالث: تفاصيل الطلب (تم نقله) */}
      <OrderPrintPreviewModal
        show={isOrderDetailsModalOpen}
        onClose={() => setIsOrderDetailsModalOpen(false)}
        order={selectedOrderData}
      />
    </MainLayout>
  );
}