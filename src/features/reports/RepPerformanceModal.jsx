// src/features/reports/RepPerformanceModal.jsx
import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import SearchableSelectFieldV4 from "../../components/shared/SearchableSelectFieldV4";
import Table2 from "../../components/shared/Table2";
import { get } from "../../utils/apiService";
import { useAuth } from "../../contexts/AuthContext";
import AddEntityButton from "../../components/shared/AddEntityButton";
import { toast } from "react-toastify";

const RepPerformanceModal = ({ show, onClose, onPreviewAndPrint }) => {
  const { token } = useAuth();
  const [allPerformanceData, setAllPerformanceData] = useState([]);
  const [repOptions, setRepOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [selectedRep, setSelectedRep] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ جلب بيانات الأداء وتحديد الخيارات عند فتح المودال
  useEffect(() => {
    if (show) {
      fetchPerformanceData();
    }
  }, [show]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await get("admin/reports-performance", token);
      if (response && response.status && Array.isArray(response.data)) {
        setAllPerformanceData(response.data);

        // ✅ استخراج المندوبين وإضافة خيار "كل المندوبين"
        const reps = response.data.map((item) => ({
          label: item.representative,
          value: item.representative,
        }));
        setRepOptions([{ label: "كل المندوبين", value: "all" }, ...reps]);

        // ✅ استخراج العملات من جميع المندوبين وتجنب التكرار
        const currencies = new Set();
        response.data.forEach((rep) => {
          rep.performance.forEach((perf) => currencies.add(perf.currency));
        });
        const currencyOptions = Array.from(currencies).map((curr) => ({
          label: curr,
          value: curr,
        }));
        setCurrencyOptions(currencyOptions);

        // ✅ تحديد أول مندوب (كل المندوبين) وأول عملة كقيم افتراضية
        if (reps.length > 0) {
          setSelectedRep("all");
        }
        if (currencyOptions.length > 0) {
          setSelectedCurrency(currencyOptions[0].value);
        }
      } else {
        setAllPerformanceData([]);
        setRepOptions([]);
        setCurrencyOptions([]);
      }
    } catch (error) {
      console.error("Error fetching performance data:", error);
      toast.error("فشل في جلب بيانات الأداء.");
      setAllPerformanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ تصفية البيانات عند تغيير المندوب أو العملة
  useEffect(() => {
    if (selectedCurrency) {
      if (selectedRep === "all") {
        const allRepsData = allPerformanceData
          .map((rep) => {
            const perf = rep.performance.find(
              (item) => item.currency === selectedCurrency
            );
            return perf ? { ...perf, representative: rep.representative } : null;
          })
          .filter(Boolean);
        setFilteredData(allRepsData);
      } else if (selectedRep) {
        const repData = allPerformanceData.find(
          (item) => item.representative === selectedRep
        );
        if (repData) {
          const currencyData = repData.performance.find(
            (item) => item.currency === selectedCurrency
          );
          setFilteredData(currencyData ? [{ ...currencyData, representative: repData.representative }] : []);
        } else {
          setFilteredData([]);
        }
      } else {
        setFilteredData([]);
      }
    } else {
      setFilteredData([]);
    }
  }, [selectedRep, selectedCurrency, allPerformanceData]);

  const headers = [
    { key: "representative", label: "المندوب" },
    { key: "total_sales", label: "إجمالي المبيعات" },
    { key: "total_receipts", label: "إجمالي المتحصلات" },
    { key: "collected_sales", label: "المتحصل من المبيعات" },
    { key: "uncollected_sales", label: "المبيعات غير المتحصلة" },
  ];

  const handlePreview = () => {
    const reportDetails = {
      data: filteredData,
      repName: selectedRep === "all" ? "كل المندوبين" : selectedRep,
      currency: selectedCurrency,
    };
    onPreviewAndPrint(reportDetails);
  };

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={true}
      title="تقرير أداء المندوبين"
      maxWidth="max-w-4xl"
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
          <SearchableSelectFieldV4
            label="العملة"
            value={selectedCurrency}
            onChange={(val) => setSelectedCurrency(val)}
            options={currencyOptions}
            placeholder="اختر العملة"
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
              <td className="py-2 px-3">{row.representative}</td>
              <td className="py-2 px-3">{parseFloat(row.total_sales).toFixed(2)}</td>
              <td className="py-2 px-3">{parseFloat(row.total_receipts).toFixed(2)}</td>
              <td className="py-2 px-3">{parseFloat(row.collected_sales).toFixed(2)}</td>
              <td className="py-2 px-3">{parseFloat(row.uncollected_sales).toFixed(2)}</td>
            </>
          )}
        />
      </div>
      <div className="flex justify-center">
        <AddEntityButton
          label="معاينة للطباعة"
          onClick={handlePreview}
          disabled={!selectedRep || !selectedCurrency || filteredData.length === 0}
        />
      </div>
    </ModalWrapper>
  );
};

export default RepPerformanceModal;