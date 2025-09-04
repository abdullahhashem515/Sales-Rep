// src/features/reports/InventoryReportModal.jsx
import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import SearchableSelectFieldV4 from "../../components/shared/SearchableSelectFieldV4";
import FormInputField from "../../components/shared/FormInputField";
import Table2 from "../../components/shared/Table2";
import { get } from "../../utils/apiService";
import { useAuth } from "../../contexts/AuthContext";
import AddEntityButton from "../../components/shared/AddEntityButton";
import { toast } from "react-toastify";

const InventoryReportModal = ({ show, onClose, onPreviewAndPrint }) => {
  const { token } = useAuth();
  const [allStocksData, setAllStocksData] = useState([]);
  const [repOptions, setRepOptions] = useState([]);
  const [selectedRep, setSelectedRep] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
  });

  // ✅ دالة مساعدة لتنسيق التاريخ بالشكل YYYY-MM-DD
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // ✅ جلب بيانات المخزون وتحديد المندوبين عند فتح المودال
  useEffect(() => {
    if (show) {
      const today = new Date();
      setFilters(prev => ({
        ...prev,
        fromDate: formatDate(today),
        toDate: formatDate(today),
      }));
      fetchStocks();
    }
  }, [show]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await get("admin/stocks-report", token);
      if (response && response.status && Array.isArray(response.data)) {
        setAllStocksData(response.data);

        // ✅ استخراج المندوبين من البيانات
        const reps = response.data.map((item) => ({
          label: item.representative,
          value: item.representative,
        }));
        setRepOptions(reps);

        // ✅ تحديد أول مندوب كقيمة افتراضية
        if (reps.length > 0) {
          setSelectedRep(reps[0].value);
        }
      } else {
        setAllStocksData([]);
        setRepOptions([]);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
      toast.error("فشل في جلب بيانات المخزون.");
      setAllStocksData([]);
      setRepOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ تصفية البيانات عند تغيير المندوب المختار أو التواريخ
  useEffect(() => {
    if (selectedRep) {
      const repData = allStocksData.find(
        (item) => item.representative === selectedRep
      );
      if (repData) {
        const filteredByDate = repData.stocks.filter(stock => {
          const lastUpdateDate = new Date(stock.last_update.split(' ')[0]);
          const fromDate = new Date(filters.fromDate);
          const toDate = new Date(filters.toDate);
          return lastUpdateDate >= fromDate && lastUpdateDate <= toDate;
        });
        setFilteredData(filteredByDate);
      } else {
        setFilteredData([]);
      }
    } else {
      setFilteredData([]);
    }
  }, [selectedRep, allStocksData, filters]);

  const headers = [
    { key: "productAndUnit", label: "اسم المنتج والسعة" },
    { key: "quantity", label: "الكمية" },
  ];

  // ✅ تعديل هنا لكي تمرر البيانات الإضافية
  const handlePreview = () => {
    const reportDetails = {
      data: filteredData,
      repName: selectedRep,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    };
    onPreviewAndPrint(reportDetails);
  };

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={true}
      title="تقرير المخزون"
      maxWidth="max-w-4xl"
      maxHeight="max-h-[90vh]"
    >
      <div className="p-4 space-y-6">
        {/* Filters */}
        <div className="flex flex-row flex-wrap items-center gap-4 pb-4 border-b border-gray-300">
          <SearchableSelectFieldV4
            label="المندوب"
            value={selectedRep}
            onChange={(val) => setSelectedRep(val)}
            options={repOptions}
            placeholder="اختر المندوب"
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

        {/* Data Table */}
        <Table2
          headers={headers}
          data={filteredData}
          totalCount={filteredData.length}
          loading={loading}
          renderRow={(row, index) => (
            <>
              <td className="py-2 px-3">{row.product} ({row.unit})</td>
              <td className="py-2 px-3">{row.quantity}</td>
            </>
          )}
        />
      </div>
      <div className="flex justify-center">
        <AddEntityButton label="معاينة للطباعة" onClick={handlePreview} />
      </div>
    </ModalWrapper>
  );
};

export default InventoryReportModal;