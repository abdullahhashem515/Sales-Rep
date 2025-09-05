import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import SearchableSelectFieldV4 from "../../components/shared/SearchableSelectFieldV4";
import FormInputField from "../../components/shared/FormInputField";
import Table2 from "../../components/shared/Table2";
import { get } from "../../utils/apiService";
import { useAuth } from "../../contexts/AuthContext";
import AddEntityButton from "../../components/shared/AddEntityButton";

const CustomerVouchersModal = ({ show, onClose, onPreviewAndPrint }) => {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    repName: null,
    customerName: null,
    currency: null,
    fromDate: "",
    toDate: "",
  });

  const [allVouchers, setAllVouchers] = useState([]);
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
    if (show) fetchVouchers();
  }, [show]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await get("admin/payment-vouchers", token);
      if (response && Array.isArray(response.data)) {
        const filteredData = response.data.filter(item => item.customer !== null);
        setAllVouchers(filteredData);
        setData(filteredData);

        // خيارات المندوبين
        const reps = filteredData
          .map(item => item.sales_rep)
          .filter(Boolean)
          .map(name => ({ label: name, value: name }));
        const uniqueReps = Array.from(new Map(reps.map(r => [r.value, r])).values());
        setRepOptions(uniqueReps);

        // خيارات العملاء
        const customers = filteredData
          .map(item => item.customer)
          .filter(Boolean)
          .map(c => ({ label: c, value: c }));
        const uniqueCustomers = Array.from(new Map(customers.map(c => [c.value, c])).values());
        setCustomerOptions(uniqueCustomers);

        // خيارات العملات
        const currencies = filteredData
          .map(item => item.currency)
          .filter(Boolean)
          .map(curr => ({ label: curr, value: curr }));
        const uniqueCurrencies = Array.from(new Map(currencies.map(c => [c.value, c])).values());
        setCurrencyOptions(uniqueCurrencies);

        // تحديد القيمة الافتراضية للعملة
        if (uniqueCurrencies.length > 0) {
          setFilters(prev => ({
            ...prev,
            currency: uniqueCurrencies[0].value,
          }));
        }

        // تحديد التاريخ الافتراضي
        const voucherDates = filteredData.map(item => new Date(item.payment_date)).filter(d => !isNaN(d));
        if (voucherDates.length > 0) {
          const minDate = new Date(Math.min(...voucherDates));
          const today = new Date();
          setFilters(prev => ({
            ...prev,
            fromDate: formatDate(minDate),
            toDate: formatDate(today),
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching payment vouchers data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = allVouchers.filter(item => {
      const repMatch = !filters.repName || item.sales_rep === filters.repName;
      const customerMatch = !filters.customerName || item.customer === filters.customerName;
      const currencyMatch = !filters.currency || item.currency === filters.currency;

      const voucherDate = new Date(item.payment_date);
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;
      const dateMatch = (!fromDate || voucherDate >= fromDate) && (!toDate || voucherDate <= toDate);

      return repMatch && customerMatch && currencyMatch && dateMatch;
    });
    setData(filtered);
  }, [filters, allVouchers]);

  const headers = [
    { key: "voucher_number", label: "رقم السند" },
    { key: "customer", label: "اسم العميل" },
    { key: "sales_rep", label: "اسم المندوب" },
    { key: "payment_date", label: "تاريخ السند" },
    { key: "amount", label: "المبلغ" },
    { key: "currency", label: "العملة" },
    { key: "note", label: "الملاحظة" },
  ];

  const grandTotal = data.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={true}
      title="تقرير سندات قبض العملاء"
      maxWidth="max-w-7xl"
      maxHeight="max-h-[100vh]"
    >
      <div className="p-4 space-y-6">
        {/* Filters */}
        <div className="flex flex-row flex-wrap items-center gap-4 pb-4 border-b border-gray-300">
          <SearchableSelectFieldV4
            label="المندوب"
            value={filters.repName}
            onChange={val => setFilters(prev => ({ ...prev, repName: val }))}
            options={repOptions}
            placeholder="اختر المندوب"
            isClearable
          />
          <SearchableSelectFieldV4
            label="العميل"
            value={filters.customerName}
            onChange={val => setFilters(prev => ({ ...prev, customerName: val }))}
            options={customerOptions}
            placeholder="اختر العميل"
            isClearable
          />
          <SearchableSelectFieldV4
            label="العملة"
            value={filters.currency}
            onChange={val => setFilters(prev => ({ ...prev, currency: val }))}
            options={currencyOptions}
            placeholder="اختر العملة"
            isClearable={false}
          />
          <FormInputField
            type="date"
            name="fromDate"
            label="من تاريخ"
            value={filters.fromDate}
            onChange={e => setFilters(prev => ({ ...prev, fromDate: e.target.value }))}
          />
          <FormInputField
            type="date"
            name="toDate"
            label="إلى تاريخ"
            value={filters.toDate}
            onChange={e => setFilters(prev => ({ ...prev, toDate: e.target.value }))}
          />
        </div>

        {/* Table */}
        <Table2
          headers={headers}
          data={data}
          totalCount={data.length}
          loading={loading}
          renderRow={item => (
            <>
              <td className="py-2 px-3">{item.voucher_number}</td>
              <td className="py-2 px-3">{item.customer || "غير معروف"}</td>
              <td className="py-2 px-3">{item.sales_rep || "غير معروف"}</td>
              <td className="py-2 px-3">{item.payment_date}</td>
              <td className="py-2 px-3">{item.amount}</td>
              <td className="py-2 px-3">{item.currency || "N/A"}</td>
              <td className="py-2 px-3">{item.note || "-"}</td>
            </>
          )}
        />

        {/* Grand Total */}
        {!loading && data.length > 0 && (
          <div className="overflow-x-auto flex justify-start text-left" dir="ltr">
            <table>
              <tfoot>
                <tr className="font-bold">
                  <td className="pl-100 pr-3">{grandTotal}</td>
                  <td className="text-right">الإجمالي الكلي</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Preview Button */}
        <div className="flex justify-center">
          <AddEntityButton label="معاينة للطباعة" onClick={() => onPreviewAndPrint(data, grandTotal)} />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default CustomerVouchersModal;