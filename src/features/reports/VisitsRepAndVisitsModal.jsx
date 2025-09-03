// src/features/reports/VisitsRepAndVisitsModal.jsx
import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import SearchableSelectFieldV4 from "../../components/shared/SearchableSelectFieldV4";
import FormInputField from "../../components/shared/FormInputField";
import Table2 from "../../components/shared/Table2";
import { get } from "../../utils/apiService";
import { useAuth } from "../../contexts/AuthContext";
import AddEntityButton from "../../components/shared/AddEntityButton";

const VisitsRepAndVisitsModal = ({ show, onClose, onPreviewAndPrint }) => {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    repName: null,
    fromDate: "",
    toDate: "",
  });

  const [allVisits, setAllVisits] = useState([]);
  const [data, setData] = useState([]);
  const [repOptions, setRepOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const visitTypeMap = {
    in_person: "شخصية",
    call: "اتصال",
    online: "عبر الإنترنت",
  };

  // ✅ دالة مساعدة لتنسيق التاريخ بالشكل YYYY-MM-DD
  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // ✅ جلب البيانات وتحديد الفلاتر الافتراضية
  useEffect(() => {
    if (show) {
      console.log("VisitsRepAndVisitsModal: المودال مفتوح، جاري جلب البيانات");
      fetchVisits();
    }
  }, [show]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await get("admin/visits", token);
      if (response && Array.isArray(response)) {
        console.log("VisitsRepAndVisitsModal: تم جلب البيانات بنجاح", response);
        setAllVisits(response);
        setData(response);

        // ✅ استخراج المندوبين الفريدين وتحديدهم
        const reps = response
          .map((visit) => visit.user)
          .filter((u) => u && u.id && u.name)
          .map((u) => ({ label: u.name, value: u.id }));
        const uniqueReps = Array.from(new Map(reps.map((r) => [r.value, r])).values());
        setRepOptions(uniqueReps);

        // ✅ تحديد أقدم تاريخ وأحدث تاريخ لضبط الفلاتر الافتراضية
        const visitDates = response
          .map((visit) => new Date(visit.visit_date))
          .filter((d) => !isNaN(d));

        if (visitDates.length > 0) {
          const minDate = new Date(Math.min(...visitDates));
          const today = new Date();
          setFilters(prev => ({
            ...prev,
            fromDate: formatDate(minDate),
            toDate: formatDate(today),
          }));
        } else {
          // في حالة عدم وجود زيارات
          setFilters(prev => ({
            ...prev,
            fromDate: formatDate(new Date()),
            toDate: formatDate(new Date()),
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching visits:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    console.log("VisitsRepAndVisitsModal: الفلاتر أو البيانات تغيرت، جاري تصفية البيانات");
    const filtered = allVisits.filter((visit) => {
      const repMatch = !filters.repName || visit.user?.id === filters.repName;
      const visitDate = new Date(visit.visit_date);
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;
      const dateMatch =
        (!fromDate || visitDate >= fromDate) && (!toDate || visitDate <= toDate);
      return repMatch && dateMatch;
    });
    setData(filtered);
  }, [filters, allVisits]);

  const headers = [
    { key: "repName", label: "اسم المندوب" },
    { key: "customerName", label: "اسم العميل" },
    { key: "visit_date", label: "تاريخ الزيارة" },
    { key: "visit_type", label: "نوع الزيارة" },
    { key: "note", label: "ملاحظات" },
  ];

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={true}
      title="تقرير المندوبين وزياراتهم"
      maxWidth="max-w-7xl"
           maxHeight="max-h-[90vh]"

    >
      <div className="p-4 space-y-6">
        {/* Filters */}
        <div className="flex flex-row flex-wrap items-center gap-4 pb-4 border-b border-gray-300">
          <SearchableSelectFieldV4
            label="المندوب"
            value={filters.repName}
            onChange={(val) => setFilters((prev) => ({ ...prev, repName: val }))}
            options={[{ label: "كل المندوبين", value: null }, ...repOptions]}
            placeholder="اختر المندوب"
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

        {/* Data Table */}
        <Table2
          headers={headers}
          data={data}
          totalCount={data.length}
          loading={loading}
          renderRow={(row) => (
            <>
              <td className="py-2 px-3">{row.user?.name || "غير معروف"}</td>
              <td className="py-2 px-3">{row.customer?.name || "غير معروف"}</td>
              <td className="py-2 px-3">{row.visit_date}</td>
              <td className="py-2 px-3">{visitTypeMap[row.visit_type] || row.visit_type}</td>
              <td className="py-2 px-3">{row.note}</td>
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

export default VisitsRepAndVisitsModal;