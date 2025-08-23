import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField";
import SearchableSelectFieldV3 from "../../components/shared/SearchableSelectFieldV3"; 
import { toast } from "react-toastify";
import { put, get } from "../../utils/apiService";

export default function UpdateVisitModal({ show, onClose, visitToEdit }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // form states
  const [salesmanId, setSalesmanId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [visitType, setVisitType] = useState("");
  const [visitPurpose, setVisitPurpose] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitSlug, setVisitSlug] = useState(""); 

  // lists
  const [salesmen, setSalesmen] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);

  // loading + errors
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsModalLoading(true);
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.error("رمز المصادقة مفقود. يرجى تسجيل الدخول أولاً.");
        setIsModalLoading(false);
        return;
      }

      try {
        const [usersResponse, customersResponse] = await Promise.all([
          get("admin/users", token),
          get("admin/customers", token),
        ]);

        const reps = (usersResponse.users || usersResponse.data || [])
          .filter(u => ["ws_rep", "retail_rep"].includes(u.type_user))
          .map(u => ({ label: u.name, value: u.slug, id: u.id }));
        setSalesmen(reps);

        const custs = customersResponse.customers || customersResponse.data || [];
        setAllCustomers(custs);

        if (visitToEdit) {
          const typeMap = { حضوري: "in_person", اتصال: "call", "اجتماع أونلاين": "online" };
          setVisitSlug(visitToEdit.visit_id || visitToEdit.slug || "");
          setVisitType(typeMap[visitToEdit.type] || "in_person");
          setVisitPurpose(visitToEdit.purpose || "");
          setVisitDate(new Date(visitToEdit.date).toISOString().split("T")[0]);

          const selectedSalesman = reps.find(s => s.value === visitToEdit.salesman?.slug);
          if (selectedSalesman) {
            const filteredCustomers = custs
              .filter(c => c.user_id === selectedSalesman.id)
              .map(c => ({ label: c.name, value: c.slug }));
            setCustomers(filteredCustomers);
            setSalesmanId(selectedSalesman.value);
            setCustomerId(visitToEdit.customer?.slug || "");
          } else {
            setCustomers([]);
            setSalesmanId("");
            setCustomerId("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch dropdown data:", err);
        toast.error("فشل في جلب البيانات الضرورية.");
      } finally {
        setIsModalLoading(false);
      }
    };

    if (show) {
      fetchData();
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setTimeout(() => {
        setSalesmanId("");
        setCustomerId("");
        setVisitType("");
        setVisitPurpose("");
        setVisitDate("");
        setVisitSlug("");
        setErrors({});
        setCustomers([]);
      }, 100);
    }
  }, [show, visitToEdit]);

  const handleSalesmanChange = (salesmanSlug) => {
    setSalesmanId(salesmanSlug);
    setCustomerId("");
    const salesmanData = salesmen.find(s => s.value === salesmanSlug);
    if (salesmanData) {
      const filteredCustomers = allCustomers
        .filter((c) => c.user_id === salesmanData.id)
        .map((c) => ({ label: c.name, value: c.slug }));
      setCustomers(filteredCustomers);
    } else {
      setCustomers([]);
    }
  };

  const handleClose = (isSuccess = false) => {
    setIsVisible(false);
    setTimeout(() => onClose(isSuccess), 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let currentErrors = {};

    if (!salesmanId) currentErrors.salesmanId = "يجب اختيار مندوب.";
    if (!customerId) currentErrors.customerId = "يجب اختيار عميل.";
    if (!visitType.trim()) currentErrors.visitType = "نوع الزيارة مطلوب.";
    if (!visitDate.trim()) currentErrors.visitDate = "تاريخ الزيارة مطلوب.";

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      toast.error("يرجى تصحيح الأخطاء في النموذج.");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.error("لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.");
        setIsLoading(false);
        return;
      }

      const payload = {
        user_slug: salesmanId,
        customer_slug: customerId,
        visit_type: visitType,
        visit_date: visitDate,
        note: visitPurpose.trim() || null,
      };

      const response = await put(`admin/visits/${visitSlug}`, payload, token);

      if (response && response.id) {
        toast.success(`تم تحديث الزيارة بنجاح!`);
        handleClose(true);
      } else {
        const apiErrorMessage = response.message || "فشل العملية.";
        setErrors({ general: apiErrorMessage });
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("Error submitting visit data:", err);
      const errorMessage = err.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const visitTypeOptions = [
    { value: "in_person", label: "حضوري" },
    { value: "call", label: "اتصال" },
    { value: "online", label: "اجتماع أونلاين" },
  ];

  return (
    <ModalWrapper
      show={show}
      onClose={() => handleClose(false)}
      isVisible={isVisible}
      title={`تعديل الزيارة رقم: ${visitToEdit?.id || ""}`}
      maxWidth="max-w-xl"
    >
      <div className="p-4">
        {isModalLoading ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-gray-400">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 text-right max-h-[calc(100vh-120px)] overflow-y-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableSelectFieldV3
                label="اسم المندوب"
                value={salesmen.find((s) => s.value === salesmanId) || null}
                onChange={handleSalesmanChange}
                options={salesmen}
                loading={isModalLoading}
                error={errors.salesmanId}
              />
              <SearchableSelectFieldV3
                label="اسم العميل"
                value={customers.find((c) => c.value === customerId) || null}
                onChange={(customerSlug) => setCustomerId(customerSlug)}
                options={customers}
                loading={isModalLoading}
                error={errors.customerId}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelectField
                label="نوع الزيارة"
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                options={visitTypeOptions}
                error={errors.visitType}
              />
              <FormInputField
                label="تاريخ الزيارة"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                error={errors.visitDate}
              />
            </div>

            <FormInputField
              label="الملاحظة (اختياري)"
              type="textarea"
              placeholder="أدخل الملاحظة حول الزيارة..."
              value={visitPurpose}
              onChange={(e) => setVisitPurpose(e.target.value)}
              error={errors.visitPurpose}
              rows={3}
            />

            {errors.general && (
              <p className="text-red-500 text-xs mt-1 text-center">{errors.general}</p>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => handleClose(false)}
                className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded"
                disabled={isLoading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="accentColor hover:bg-purple-700 py-2 px-4 rounded"
                disabled={isLoading}
              >
                {isLoading ? "جاري حفظ التعديل..." : "حفظ التعديل"}
              </button>
            </div>
          </form>
        )}
      </div>
    </ModalWrapper>
  );
}
