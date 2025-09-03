// src/features/reports/ReportsList.jsx
import React, { useState } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import RepAndOrdersModal from "./RepAndOrdersModal";
import ReportDetailsModal from "./ReportDetailsPage";
import RetailReportDetailsModal from "./RetailReportDetailsModal";
import OrderPrintPreviewModal from "../orders/OrderPrintPreviewModal";
import RetailRepAndOrdersModal from "./RetailRepAndOrdersModal";
import VisitsRepAndVisitsModal from "./VisitsRepAndVisitsModal";
import VisitsReportPrintPreview from "./VisitsReportPrintPreview";
import SalesRepAndSalesModal from "./SalesRepAndSalesModal";
import ProductsAndPricesModal from "./ProductsAndPricesModal";
import ProductsAndPricesPrintPreview from "./ProductsAndPricesPrintPreview";
import InvoiceDetailsModal from "../invoices/InvoiceDetailsModal";
import SalesReportsPrintPreview from "./SalesReportsPrintPreview";
import ReturnsModal from "./ReturnsModal";
import ReturnsPrintPreview from "./ReturnsPrintPreview";
import ReturnDetailsModal from "../returns/ReturnDetailsModal";
import CustomerVouchersModal from "./CustomerVouchersModal";
import CustomerVouchersPrintPreview from "./CustomerVouchersPrintPreview";
import SalesRepVouchersModal from "./SalesRepVouchersModal";
import SalesRepVouchersPrintPreview from "./SalesRepVouchersPrintPreview";
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
  const [isRetailReportDetailsModalOpen, setIsRetailReportDetailsModalOpen] = useState(false);
  const [reportDataToPrint, setReportDataToPrint] = useState([]);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrderData, setSelectedOrderData] = useState(null);
  const [isRetailRepOrdersModalOpen, setIsRetailRepOrdersModalOpen] = useState(false);
  const [isVisitsRepAndVisitsModalOpen, setIsVisitsRepAndVisitsModalOpen] = useState(false);
  const [isVisitsReportPrintPreviewOpen, setIsVisitsReportPrintPreviewOpen] = useState(false);
  const [visitsReportData, setVisitsReportData] = useState([]);
  const [isSalesRepAndSalesModalOpen, setIsSalesRepAndSalesModalOpen] = useState(false);
  const [isInvoiceDetailsModalOpen, setIsInvoiceDetailsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isRetailReportsPrintPreviewOpen, setIsRetailReportsPrintPreviewOpen] = useState(false);
  const [retailReportData, setRetailReportData] = useState([]);
  const [isSalesReportsPrintPreviewOpen, setIsSalesReportsPrintPreviewOpen] = useState(false);
  const [salesReportData, setSalesReportData] = useState([]);
  const [salesReportFilters, setSalesReportFilters] = useState({});
  const [salesReportGrandTotal, setSalesReportGrandTotal] = useState(0); // ✅ جديد
  const [isProductsAndPricesModalOpen, setIsProductsAndPricesModalOpen] = useState(false);
  const [isProductsAndPricesPrintPreviewOpen, setIsProductsAndPricesPrintPreviewOpen] = useState(false);
  const [productsAndPricesData, setProductsAndPricesData] = useState([]);
  const [isReturnsModalOpen, setIsReturnsModalOpen] = useState(false);
  const [isReturnsPrintPreviewOpen, setIsReturnsPrintPreviewOpen] = useState(false);
  const [returnsData, setReturnsData] = useState([]);
  const [isReturnDetailsModalOpen, setIsReturnDetailsModalOpen] = useState(false);
  const [selectedReturnDetails, setSelectedReturnDetails] = useState(null);
  const [isCustomerVouchersModalOpen, setIsCustomerVouchersModalOpen] = useState(false);
  const [isCustomerVouchersPrintPreviewOpen, setIsCustomerVouchersPrintPreviewOpen] = useState(false);
  const [customerVouchersData, setCustomerVouchersData] = useState([]);
  const [isSalesRepVouchersModalOpen, setIsSalesRepVouchersModalOpen] = useState(false);
  const [isSalesRepVouchersPrintPreviewOpen, setIsSalesRepVouchersPrintPreviewOpen] = useState(false);
  const [salesRepVouchersData, setSalesRepVouchersData] = useState([]);

  const handleOpenReportModal = (data, type = "wholesale") => {
    setReportDataToPrint(data);
    if (type === "retail") {
      setIsRetailReportDetailsModalOpen(true);
    } else {
      setIsReportDetailsModalOpen(true);
    }
  };

  const handleOpenOrderDetails = (order) => {
    setSelectedOrderData(order);
    setIsOrderDetailsModalOpen(true);
  };
  
  const handleRetailPreviewAndPrint = (data) => {
    setRetailReportData(data);
    setIsRetailReportDetailsModalOpen(true);
  };

  const handleOpenRetailRepOrdersModal = () => {
    setIsRetailRepOrdersModalOpen(true);
  };

  const handleProductsAndPricesPreview = (data) => {
    setProductsAndPricesData(data);
    setIsProductsAndPricesPrintPreviewOpen(true);
  };

  const handleVisitsPreviewAndPrint = (data) => {
    setVisitsReportData(data);
    setIsVisitsReportPrintPreviewOpen(true);
  };

  const handleOpenInvoiceDetailsModal = (invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceDetailsModalOpen(true);
  };

  // ✅ تعديل: استقبل grandTotal وخزنه
  const handleSalesPreviewAndPrint = (data, filters, grandTotal) => {
    setSalesReportData(data);
    setSalesReportFilters(filters);
    setSalesReportGrandTotal(grandTotal);
    setIsSalesReportsPrintPreviewOpen(true);
  };

  const handleReturnsPreviewAndPrint = (data) => {
    setReturnsData(data);
    setIsReturnsPrintPreviewOpen(true);
  };

  const handleOpenReturnDetailsModal = (returnItem) => {
    setSelectedReturnDetails(returnItem);
    setIsReturnDetailsModalOpen(true);
  };

  const handleCustomerVouchersPreviewAndPrint = (data) => {
    setCustomerVouchersData(data);
    setIsCustomerVouchersPrintPreviewOpen(true);
  };

  const handleSalesRepVouchersPreviewAndPrint = (data) => {
    setSalesRepVouchersData(data);
    setIsSalesRepVouchersPrintPreviewOpen(true);
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
            onClick={() => setIsRepOrdersModalOpen(true)}
          />
          <ReportButton
            title="مندوبين التجزئة وطلباتهم"
            icon={<UsersIcon className="h-10 w-10" />}
            colorClass="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => handleOpenRetailRepOrdersModal()}
          />
          <ReportButton
            title="المندوبين وزياراتهم"
            icon={<UsersIcon className="h-10 w-10" />}
            colorClass="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => setIsVisitsRepAndVisitsModalOpen(true)}
          />
          <ReportButton
            title="المبيعات"
            icon={<ChartBarIcon className="h-10 w-10" />}
            colorClass="bg-cyan-600 hover:bg-cyan-700"
            onClick={() => setIsSalesRepAndSalesModalOpen(true)}
          />
          <ReportButton
            title="سندات قبض العملاء"
            icon={<DocumentTextIcon className="h-10 w-10" />}
            colorClass="bg-orange-600 hover:bg-orange-700"
            onClick={() => setIsCustomerVouchersModalOpen(true)}
          />
          <ReportButton
            title="سندات قبض المندوبين"
            icon={<DocumentTextIcon className="h-10 w-10" />}
            colorClass="bg-orange-600 hover:bg-orange-700"
            onClick={() => setIsSalesRepVouchersModalOpen(true)}
          />
          <ReportButton
            title="المرتجعات"
            icon={<ShoppingBagIcon className="h-10 w-10" />}
            colorClass="bg-purple-600 hover:bg-purple-700"
            onClick={() => setIsReturnsModalOpen(true)}
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
            onClick={() => setIsProductsAndPricesModalOpen(true)}
          />
        </div>
      </div>
      <RepAndOrdersModal
        show={isRepOrdersModalOpen}
        onClose={() => setIsRepOrdersModalOpen(false)}
        title="تقرير مندوبين الجملة وطلباتهم"
        onPreviewAndPrint={(data) => handleOpenReportModal(data, "wholesale")}
        onOpenOrderDetails={handleOpenOrderDetails}
      />
      <ReportDetailsModal
        show={isReportDetailsModalOpen}
        onClose={() => setIsReportDetailsModalOpen(false)}
        reportData={reportDataToPrint}
      />
      <VisitsRepAndVisitsModal
        show={isVisitsRepAndVisitsModalOpen}
        onClose={() => setIsVisitsRepAndVisitsModalOpen(false)}
        onPreviewAndPrint={handleVisitsPreviewAndPrint}
      />
      <VisitsReportPrintPreview
        show={isVisitsReportPrintPreviewOpen}
        onClose={() => setIsVisitsReportPrintPreviewOpen(false)}
        reportData={visitsReportData}
      />
      
      <SalesRepAndSalesModal
        show={isSalesRepAndSalesModalOpen}
        onClose={() => setIsSalesRepAndSalesModalOpen(false)}
        onOpenInvoiceDetails={handleOpenInvoiceDetailsModal}
        onPreviewAndPrint={handleSalesPreviewAndPrint}
      />
      <SalesReportsPrintPreview
        show={isSalesReportsPrintPreviewOpen}
        onClose={() => setIsSalesReportsPrintPreviewOpen(false)}
        reportData={salesReportData}
        filters={salesReportFilters}
        grandTotal={salesReportGrandTotal} // ✅ تمرير الإجمالي الكلي
      />
      <InvoiceDetailsModal
        show={isInvoiceDetailsModalOpen}
        onClose={() => setIsInvoiceDetailsModalOpen(false)}
        invoice={selectedInvoice}
      />
    
      <RetailRepAndOrdersModal
        show={isRetailRepOrdersModalOpen}
        onClose={() => setIsRetailRepOrdersModalOpen(false)}
        title="تقرير مندوبين التجزئة وطلباتهم"
        onPreviewAndPrint={handleRetailPreviewAndPrint}
        onOpenOrderDetails={handleOpenOrderDetails}
      />
      <RetailReportDetailsModal
        show={isRetailReportDetailsModalOpen}
        onClose={() => setIsRetailReportDetailsModalOpen(false)}
        reportData={retailReportData}
      />
      <OrderPrintPreviewModal
        show={isOrderDetailsModalOpen}
        onClose={() => setIsOrderDetailsModalOpen(false)}
        order={selectedOrderData}
      />
      <ProductsAndPricesModal
        show={isProductsAndPricesModalOpen}
        onClose={() => setIsProductsAndPricesModalOpen(false)}
        onPreviewAndPrint={handleProductsAndPricesPreview}
      />
      <ProductsAndPricesPrintPreview
        show={isProductsAndPricesPrintPreviewOpen}
        onClose={() => setIsProductsAndPricesPrintPreviewOpen(false)}
        reportData={productsAndPricesData}
      />
      <ReturnsModal
        show={isReturnsModalOpen}
        onClose={() => setIsReturnsModalOpen(false)}
        onPreviewAndPrint={handleReturnsPreviewAndPrint}
        onOpenReturnDetails={handleOpenReturnDetailsModal}
      />
      <ReturnsPrintPreview
        show={isReturnsPrintPreviewOpen}
        onClose={() => setIsReturnsPrintPreviewOpen(false)}
        reportData={returnsData}
      />
      <ReturnDetailsModal
        show={isReturnDetailsModalOpen}
        onClose={() => setIsReturnDetailsModalOpen(false)}
        returnData={selectedReturnDetails}
      />
      <CustomerVouchersModal
        show={isCustomerVouchersModalOpen}
        onClose={() => setIsCustomerVouchersModalOpen(false)}
        onPreviewAndPrint={handleCustomerVouchersPreviewAndPrint}
      />
      <CustomerVouchersPrintPreview
        show={isCustomerVouchersPrintPreviewOpen}
        onClose={() => setIsCustomerVouchersPrintPreviewOpen(false)}
        reportData={customerVouchersData}
      />
      <SalesRepVouchersModal
        show={isSalesRepVouchersModalOpen}
        onClose={() => setIsSalesRepVouchersModalOpen(false)}
        onPreviewAndPrint={handleSalesRepVouchersPreviewAndPrint}
      />
      <SalesRepVouchersPrintPreview
        show={isSalesRepVouchersPrintPreviewOpen}
        onClose={() => setIsSalesRepVouchersPrintPreviewOpen(false)}
        reportData={salesRepVouchersData}
      />
    </MainLayout>
  );
}
