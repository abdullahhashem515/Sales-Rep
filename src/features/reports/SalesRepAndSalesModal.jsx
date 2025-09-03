// src/features/reports/SalesRepAndSalesModal.jsx
import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import SearchableSelectFieldV4 from "../../components/shared/SearchableSelectFieldV4";
import FormInputField from "../../components/shared/FormInputField";
import Table2 from "../../components/shared/Table2";
import { get } from "../../utils/apiService";
import { useAuth } from "../../contexts/AuthContext";
import AddEntityButton from "../../components/shared/AddEntityButton";

// ✅ تم إضافة onOpenInvoiceDetails إلى props
const SalesRepAndSalesModal = ({ show, onClose, onPreviewAndPrint, onOpenInvoiceDetails }) => {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    repName: null,
    customerName: null,
    currencyCode: null,
    paymentType: null,
    fromDate: "",
    toDate: "",
  });

  const [allSales, setAllSales] = useState([]);
  const [data, setData] = useState([]);
  const [repOptions, setRepOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const paymentTypeMap = {
    cash: "نقداً",
    credit: "آجل",
  };

  // ✅ دالة مساعدة لتنسيق التاريخ بالشكل YYYY-MM-DD
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // ✅ جلب البيانات وتحديد الفلاتر الافتراضية عند فتح المودال
  useEffect(() => {
    if (show) {
      fetchSales();
    }
  }, [show]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await get("admin/invoices", token);
      if (response && Array.isArray(response.data)) {
        setAllSales(response.data);
        setData(response.data);

        // ✅ استخراج المندوبين الفريدين
        const reps = response.data
          .map((item) => item.user)
          .filter((u) => u && u.id && u.name)
          .map((u) => ({ label: u.name, value: u.id }));
        const uniqueReps = Array.from(new Map(reps.map((r) => [r.value, r])).values());
        setRepOptions(uniqueReps);

        // ✅ استخراج العملاء الفريدين
        const customers = response.data
          .map((item) => item.customer)
          .filter((c) => c && c.id && c.name)
          .map((c) => ({ label: c.name, value: c.id }));
        const uniqueCustomers = Array.from(new Map(customers.map((c) => [c.value, c])).values());
        setCustomerOptions(uniqueCustomers);

        // ✅ استخراج العملات الفريدة
        const currencies = response.data
          .map((item) => item.currency)
          .filter((curr) => curr && curr.id && curr.code)
          .map((curr) => ({ label: curr.code, value: curr.id }));
        const uniqueCurrencies = Array.from(new Map(currencies.map((c) => [c.value, c])).values());
        setCurrencyOptions(uniqueCurrencies);

        // ✅ تحديد أقدم وأحدث تاريخ لضبط الفلاتر الافتراضية
        const invoiceDates = response.data
          .map((item) => new Date(item.date))
          .filter((d) => !isNaN(d));

        if (invoiceDates.length > 0) {
          const minDate = new Date(Math.min(...invoiceDates));
          const today = new Date();
          setFilters(prev => ({
            ...prev,
            fromDate: formatDate(minDate),
            toDate: formatDate(today),
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ تطبيق الفلاتر
  useEffect(() => {
    const filtered = allSales.filter((invoice) => {
      const repMatch = !filters.repName || invoice.user?.id === filters.repName;
      const customerMatch = !filters.customerName || invoice.customer?.id === filters.customerName;
      const currencyMatch = !filters.currencyCode || invoice.currency?.id === filters.currencyCode;
      const paymentMatch = !filters.paymentType || invoice.payment_type === filters.paymentType;
      
      const invoiceDate = new Date(invoice.date);
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;

      const dateMatch =
        (!fromDate || invoiceDate >= fromDate) && (!toDate || invoiceDate <= toDate);
      
      return repMatch && customerMatch && currencyMatch && paymentMatch && dateMatch;
    });
    setData(filtered);
  }, [filters, allSales]);

  // ✅ تم إضافة عمود الإجراءات
  const headers = [
    { key: "invoice_number", label: "رقم الفاتورة" },
    { key: "repName", label: "اسم المندوب" },
    { key: "customerName", label: "اسم العميل" },
    { key: "date", label: "التاريخ" },
    { key: "currency_code", label: "العملة" },
    { key: "payment_type", label: "نوع الدفع" },
    { key: "total_amount", label: "الإجمالي" },
    { key: "actions", label: "الإجراءات" }, // ✅ العمود الجديد
  ];

  // ✅ حساب الإجمالي الكلي
  const grandTotal = data.reduce((sum, row) => sum + Number(row.total_amount || 0), 0);

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={true}
      title="تقرير المبيعات"
      maxWidth="max-w-7xl"
      maxHeight="max-h-[100vh]"
    >
      <div className="p-4 space-y-6">
        {/* حقول التصفية */}
        <div className="flex flex-row flex-wrap items-center gap-4 pb-4 border-b border-gray-300">
          <SearchableSelectFieldV4
            label="المندوب"
            value={filters.repName}
            onChange={(val) => setFilters((prev) => ({ ...prev, repName: val }))}
            options={[{ label: "كل المندوبين", value: null }, ...repOptions]}
            placeholder="اختر المندوب"
            isClearable
          />
          <SearchableSelectFieldV4
            label="العميل"
            value={filters.customerName}
            onChange={(val) => setFilters((prev) => ({ ...prev, customerName: val }))}
            options={[{ label: "كل العملاء", value: null }, ...customerOptions]}
            placeholder="اختر العميل"
            isClearable
          />
          <SearchableSelectFieldV4
            label="العملة"
            value={filters.currencyCode}
            onChange={(val) => setFilters((prev) => ({ ...prev, currencyCode: val }))}
            options={[{ label: "كل العملات", value: null }, ...currencyOptions]}
            placeholder="اختر العملة"
            isClearable
          />
          <SearchableSelectFieldV4
            label="نوع الدفع"
            value={filters.paymentType}
            onChange={(val) => setFilters((prev) => ({ ...prev, paymentType: val }))}
            options={[
              { label: "كل الأنواع", value: null },
              { label: "نقداً", value: "cash" },
              { label: "آجل", value: "credit" },
            ]}
            placeholder="اختر نوع الدفع"
            isClearable
          />
          <FormInputField
            type="date"
            name="fromDate"
            label="من تاريخ"
            value={filters.fromDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
          />
          <FormInputField
            type="date"
            name="toDate"
            label="إلى تاريخ"
            value={filters.toDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
          />
        </div>

        {/* جدول البيانات */}
        <Table2
          headers={headers}
          data={data}
          totalCount={data.length}
          loading={loading}
          renderRow={(row) => (
            <>
              <td className="py-2 px-3">{row.invoice_number}</td>
              <td className="py-2 px-3">{row.user?.name || "غير معروف"}</td>
              <td className="py-2 px-3">{row.customer?.name || "غير معروف"}</td>
              <td className="py-2 px-3">{row.date}</td>
              <td className="py-2 px-3">{row.currency?.code || "غير معروف"}</td>
              <td className="py-2 px-3">{paymentTypeMap[row.payment_type] || row.payment_type}</td>
              <td className="py-2 px-3">{row.total_amount}</td>
              {/* ✅ الخلية الجديدة لعمود الإجراءات */}
              <td className="py-2 px-3">
                <button
                  onClick={() => onOpenInvoiceDetails(row)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-md text-xs font-medium hover:bg-blue-600 transition-colors"
                >
                  تفاصيل
                </button>
              </td>
            </>
          )}
        />

  {!loading && data.length > 0 && (
  <div className="overflow-x-auto bg-red-400 flex justify-start text-left" dir="ltr">
    <table className="ml-0 mr-auto">
      <tfoot>
        <tr className="font-bold">
          <td className="pl-35 pr-3 text-left">{grandTotal}</td>
          <td className="text-right"> الإجمالي الكلي </td>
        </tr>
      </tfoot>
    </table>
  </div>
)}
      </div>

      <div className="flex justify-center">
        <AddEntityButton label="معاينة للطباعة" onClick={() => onPreviewAndPrint(data, filters,grandTotal)} />
      </div>
    </ModalWrapper>
  );
};

export default SalesRepAndSalesModal;
