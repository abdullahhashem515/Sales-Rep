import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import SearchableSelectFieldV4 from "../../components/shared/SearchableSelectFieldV4";
import FormInputField from "../../components/shared/FormInputField";
import Table2 from "../../components/shared/Table2";
import { get } from "../../utils/apiService";
import { useAuth } from "../../contexts/AuthContext";
import AddEntityButton from "../../components/shared/AddEntityButton";

const SalesRepVouchersModal = ({ show, onClose, onPreviewAndPrint }) => {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    repName: null,
    currency: null,
    fromDate: "",
    toDate: "",
  });

  const [allVouchers, setAllVouchers] = useState([]);
  const [data, setData] = useState([]);
  const [repOptions, setRepOptions] = useState([]);
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
      fetchVouchers();
    }
  }, [show]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const response = await get("admin/payment-vouchers", token);
      if (response && Array.isArray(response.data)) {
        const filteredData = response.data.filter(item => item.customer === null);
        setAllVouchers(filteredData);
        setData(filteredData);

        const reps = filteredData
          .map((item) => item.sales_rep)
          .filter((name) => name)
          .map((name) => ({ label: name, value: name }));
        const uniqueReps = Array.from(new Map(reps.map((r) => [r.value, r])).values());
        setRepOptions(uniqueReps);

        const currencies = filteredData
          .map((item) => item.currency)
          .filter((curr) => curr)
          .map((curr) => ({ label: curr, value: curr }));
        const uniqueCurrencies = Array.from(new Map(currencies.map((c) => [c.value, c])).values());
        setCurrencyOptions(uniqueCurrencies);

        // ✅ تحديث: ضبط القيمة الافتراضية للعملة
        if (uniqueCurrencies.length > 0) {
          setFilters(prev => ({ ...prev, currency: uniqueCurrencies[0].value }));
        }

        const voucherDates = filteredData
          .map((item) => new Date(item.payment_date))
          .filter((d) => !isNaN(d));

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
    const filtered = allVouchers.filter((item) => {
      const repMatch = !filters.repName || item.sales_rep === filters.repName;
      const currencyMatch = !filters.currency || item.currency === filters.currency;
      
      const voucherDate = new Date(item.payment_date);
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;

      const dateMatch =
        (!fromDate || voucherDate >= fromDate) && (!toDate || voucherDate <= toDate);
      
      return repMatch && currencyMatch && dateMatch;
    });
    setData(filtered);
  }, [filters, allVouchers]);

  const headers = [
    { key: "voucher_number", label: "رقم السند" },
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
      title="تقرير سندات قبض المندوبين"
      maxWidth="max-w-7xl"
      maxHeight="max-h-[90vh]"
    >
      <div className="p-4 space-y-6">
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
            label="العملة"
            value={filters.currency}
            onChange={(val) => setFilters((prev) => ({ ...prev, currency: val }))}
            options={currencyOptions} // ✅ تم إبقاء الخيارات كاملة
            placeholder="اختر العملة"
            isClearable={false} // ✅ تم تغيير isClearable إلى false
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
        <Table2
          headers={headers}
          data={data}
          totalCount={data.length}
          loading={loading}
          renderRow={(item) => (
            <>
              <td className="py-2 px-3">{item.voucher_number}</td>
              <td className="py-2 px-3">{item.sales_rep || "غير معروف"}</td>
              <td className="py-2 px-3">{item.payment_date}</td>
              <td className="py-2 px-3">{item.amount}</td>
              <td className="py-2 px-3">{item.currency || "N/A"}</td>
              <td className="py-2 px-3">{item.note || "-"}</td>
            </>
          )}
        />
      </div>
      {!loading && data.length > 0 && (
  <div className="overflow-x-auto flex justify-start text-left" dir="ltr">
    <table className="ml-0 mr-auto">
      <tfoot>
        <tr className="font-bold">
          <td className="pl-100 pb-2 pt-2 pr-3 text-left">{grandTotal}</td>
          <td className="text-right"> الإجمالي الكلي </td>
        </tr>
      </tfoot>
    </table>
  </div>
)}
      <div className="flex justify-center">
        <AddEntityButton label="معاينة للطباعة" onClick={() => onPreviewAndPrint(data ,grandTotal)} />
      </div>
    </ModalWrapper>
  );
};

export default SalesRepVouchersModal;