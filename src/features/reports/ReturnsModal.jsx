// src/features/reports/ReturnsModal.jsx
import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import SearchableSelectFieldV4 from "../../components/shared/SearchableSelectFieldV4";
import FormInputField from "../../components/shared/FormInputField";
import Table2 from "../../components/shared/Table2";
import { get } from "../../utils/apiService";
import { useAuth } from "../../contexts/AuthContext";
import AddEntityButton from "../../components/shared/AddEntityButton";

// ✅ إضافة onOpenReturnDetails إلى props
const ReturnsModal = ({ show, onClose, onPreviewAndPrint, onOpenReturnDetails }) => {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    repName: null,
    customerName: null,
    currency: null,
    fromDate: "",
    toDate: "",
  });

  const [allReturns, setAllReturns] = useState([]);
  const [data, setData] = useState([]);
  const [repOptions, setRepOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  useEffect(() => {
    if (show) {
      fetchReturns();
    }
  }, [show]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const response = await get("admin/sale-returns", token); 
      if (response && Array.isArray(response.data)) {
        setAllReturns(response.data);
        setData(response.data);

        const reps = response.data
          .map((item) => item.user)
          .filter((name) => name)
          .map((name) => ({ label: name, value: name }));
        const uniqueReps = Array.from(new Map(reps.map((r) => [r.value, r])).values());
        setRepOptions(uniqueReps);

        const customers = response.data
          .map((item) => item.customer)
          .filter((c) => c)
          .map((c) => ({ label: c, value: c }));
        const uniqueCustomers = Array.from(new Map(customers.map((c) => [c.value, c])).values());
        setCustomerOptions(uniqueCustomers);

        const currencies = response.data
          .map((item) => item.currency)
          .filter((curr) => curr)
          .map((curr) => ({ label: curr, value: curr }));
        const uniqueCurrencies = Array.from(new Map(currencies.map((c) => [c.value, c])).values());
        setCurrencyOptions(uniqueCurrencies);

        const returnDates = response.data
          .map((item) => new Date(item.return_date))
          .filter((d) => !isNaN(d));

        if (returnDates.length > 0) {
          const minDate = new Date(Math.min(...returnDates));
          const today = new Date();
          setFilters(prev => ({
            ...prev,
            fromDate: formatDate(minDate),
            toDate: formatDate(today),
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching returns data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = allReturns.filter((item) => {
      const repMatch = !filters.repName || item.user === filters.repName; 
      const customerMatch = !filters.customerName || item.customer === filters.customerName;
      const currencyMatch = !filters.currency || item.currency === filters.currency;
      
      const returnDate = new Date(item.return_date);
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;

      const dateMatch =
        (!fromDate || returnDate >= fromDate) && (!toDate || returnDate <= toDate);
      
      return repMatch && customerMatch && currencyMatch && dateMatch;
    });
    setData(filtered);
  }, [filters, allReturns]);

  const headers = [
    { key: "return_number", label: "رقم المرتجع" },
    { key: "customer", label: "اسم العميل" },
    { key: "user", label: "اسم المندوب" },
    { key: "return_date", label: "تاريخ المرتجع" },
    { key: "total_amount", label: "الإجمالي" },
    { key: "payment_type", label: "نوع الدفع" },
    { key: "currency", label: "العملة" },
    { key: "actions", label: "إجراءات" }, // ✅ إضافة عمود الإجراءات
  ];

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={true}
      title="تقرير المرتجعات"
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
          {/* ✅ حقل الفلترة الجديد للعملة */}
          <SearchableSelectFieldV4
            label="العملة"
            value={filters.currency}
            onChange={(val) => setFilters((prev) => ({ ...prev, currency: val }))}
            options={[{ label: "كل العملات", value: null }, ...currencyOptions]}
            placeholder="اختر العملة"
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
          renderRow={(item) => (
            <>
              <td className="py-2 px-3">{item.return_number}</td>
              <td className="py-2 px-3">{item.customer || "غير معروف"}</td>
              <td className="py-2 px-3">{item.user || "غير معروف"}</td>
              <td className="py-2 px-3">{item.return_date}</td>
              <td className="py-2 px-3">{item.total_amount}</td>
              <td className="py-2 px-3">{item.payment_type === "cash" ? "نقداً" : "آجل"}</td>
              <td className="py-2 px-3">{item.currency || "N/A"}</td>
              {/* ✅ عمود الإجراءات مع زر التفاصيل */}
              <td className="py-2 px-3">
                <button
                  onClick={() => onOpenReturnDetails(item)}
                  className="px-3 py-1 text-sm font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors duration-200"
                >
                  تفاصيل
                </button>
              </td>
            </>
          )}
        />
      </div>
      <div className="flex justify-center">
        <AddEntityButton label="معاينة للطباعة" onClick={() => onPreviewAndPrint(data)} />
      </div>
    </ModalWrapper>
  );
};

export default ReturnsModal;