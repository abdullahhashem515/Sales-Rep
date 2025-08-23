// src/pages/visits/AddVisitModal.jsx
import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField";
import SearchableSelectFieldV3 from "../../components/shared/SearchableSelectFieldV3";
import { toast } from "react-toastify";
import { post, get } from "../../utils/apiService";

export default function AddVisitModal({ show, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  // form states
  const [salesmanId, setSalesmanId] = useState("");   
  const [customerId, setCustomerId] = useState("");   
  const [visitType, setVisitType] = useState("in_person");
  const [visitPurpose, setVisitPurpose] = useState("");  // ✅ الملاحظة
  const [visitDate, setVisitDate] = useState("");

  // lists
  const [salesmen, setSalesmen] = useState([]);       
  const [allCustomers, setAllCustomers] = useState([]); 
  const [customers, setCustomers] = useState([]);     

  // errors/loading
  const [errorFetchingSalesmen, setErrorFetchingSalesmen] = useState(null);
  const [errorFetchingCustomers, setErrorFetchingCustomers] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    const fetchDropdownData = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.error("Authentication token is missing. Please log in first.");
        return;
      }
      setIsModalLoading(true);
      try {
        const [usersResponse, customersResponse] = await Promise.all([
          get("admin/users", token),
          get("admin/customers", token),
        ]);

        const reps = (usersResponse.users || usersResponse.data || [])
          .filter((u) => ["ws_rep", "retail_rep"].includes(u.type_user))
          .map((u) => ({ label: u.name, value: u.slug, id: u.id }));
        setSalesmen(reps);

        const custs = customersResponse.customers || customersResponse.data || [];
        setAllCustomers(custs);

        // لا نعبي قائمة العملاء هنا — تظل فاضية حتى يُختار المندوب
        setCustomers([]);
      } catch (err) {
        console.error("Failed to fetch dropdown data:", err);
        toast.error("فشل في جلب البيانات الضرورية.");
        setErrorFetchingSalesmen("فشل في جلب المندوبين.");
        setErrorFetchingCustomers("فشل في جلب العملاء.");
      } finally {
        setIsModalLoading(false);
      }
    };

    if (show) {
      setErrors({});
      setIsLoading(false);
      setSalesmanId("");
      setCustomerId("");
      setVisitType("in_person");
      setVisitPurpose("");
      const today = new Date().toISOString().split("T")[0];
      setVisitDate(today);

      fetchDropdownData();
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setTimeout(() => {
        setSalesmanId("");
        setCustomerId("");
        setVisitType("in_person");
        setVisitPurpose("");
        setVisitDate("");
        setErrors({});
        setIsLoading(false);
        setCustomers([]);
      }, 100);
    }
  }, [show]);

  const isCustomerLocked = !salesmanId;

  // فلترة العملاء بعد اختيار المندوب
  useEffect(() => {
    if (!salesmanId) {
      setCustomers([]);
      return;
    }
    const salesmanData = salesmen.find((s) => s.value === salesmanId);
    if (!salesmanData) {
      setCustomers([]);
      return;
    }
    const filtered = allCustomers
      .filter((c) => Number(c.user_id) === Number(salesmanData.id))
      .map((c) => ({ label: c.name, value: c.slug }));
    setCustomers(filtered);

    if (!filtered.some((c) => c.value === customerId)) {
      setCustomerId("");
    }
  }, [salesmanId, allCustomers, salesmen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const currentErrors = {};
    if (!salesmanId) currentErrors.salesmanId = "يجب اختيار مندوب.";
    if (!customerId) currentErrors.customerId = "يجب اختيار عميل.";
    if (!visitType.trim()) currentErrors.visitType = "نوع الزيارة مطلوب.";
    if (!visitDate.trim()) currentErrors.visitDate = "تاريخ الزيارة مطلوب.";
    if (!visitPurpose.trim()) currentErrors.visitPurpose = "الملاحظة مطلوبة."; // ✅ صار مطلوب

    if (Object.keys(currentErrors).length) {
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
        note: visitPurpose.trim(), // ✅ نص الملاحظة صار إلزامي
      };
      const response = await post("admin/visits", payload, token);
      if (response && response.id) {
        toast.success("تم إضافة الزيارة بنجاح!");
        handleClose(true);
      } else {
        const apiErrorMessage = response.message || "فشل العملية.";
        setErrors({ general: apiErrorMessage });
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("Error submitting visit data:", err);
      if (err.status === 422 && err.response?.data?.errors) {
        const be = err.response.data.errors;
        setErrors({
          salesmanId: be.user_slug?.[0],
          customerId: be.customer_slug?.[0],
          visitType: be.visit_type?.[0],
          visitDate: be.visit_date?.[0],
          visitPurpose: be.note?.[0],
          general: "يرجى تصحيح الأخطاء في النموذج.",
        });
        toast.error("يرجى تصحيح الأخطاء في النموذج.");
      } else {
        const errorMessage = err.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (isSuccess = false) => {
    setIsVisible(false);
    setTimeout(() => onClose(isSuccess), 100);
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
      title="إضافة زيارة جديدة"
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
                onChange={(opt) => {
                  setSalesmanId(opt?.value || "");
                  setCustomerId("");
                  setCustomers([]);
                }}
                options={salesmen}
                error={errors.salesmanId || errorFetchingSalesmen}
                placeholder="ابحث أو اختر مندوب"
                isClearable
              />

              <SearchableSelectFieldV3
                label="اسم العميل"
                value={customers.find((c) => c.value === customerId) || null}
                onChange={(opt) => setCustomerId(opt?.value || "")}
                options={customers}
                error={errors.customerId || errorFetchingCustomers}
                placeholder={isCustomerLocked ? "اختر المندوب أولاً" : "ابحث أو اختر عميل"}
                disabled={isCustomerLocked}
                isClearable
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
              label="الملاحظة (مطلوب)"
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
                {isLoading ? "جاري الإضافة..." : "إضافة زيارة"}
              </button>
            </div>
          </form>
        )}
      </div>
    </ModalWrapper>
  );
}
