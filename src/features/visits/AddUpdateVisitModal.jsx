import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField";
import SearchableSelectField from "../../components/shared/SearchableSelectField";
import { toast } from "react-toastify";
import { post, put, get } from "../../utils/apiService";

export default function AddUpdateVisitModal({ show, onClose, visitToEdit }) {
  const [isVisible, setIsVisible] = useState(false);

  // form states
  const [salesmanId, setSalesmanId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [visitType, setVisitType] = useState("in_person"); // default
  const [visitPurpose, setVisitPurpose] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitSlug, setVisitSlug] = useState(""); // جديد

  // lists
  const [salesmen, setSalesmen] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);

  // loading + errors
  const [loadingSalesmen, setLoadingSalesmen] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [errorFetchingSalesmen, setErrorFetchingSalesmen] = useState(null);
  const [errorFetchingCustomers, setErrorFetchingCustomers] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  const [originalVisitData, setOriginalVisitData] = useState(null);

  // fetch salesmen + customers once
  useEffect(() => {
    const fetchDropdownData = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.error("Authentication token is missing. Please log in first.");
        return;
      }

      // Salesmen
      setLoadingSalesmen(true);
      try {
        const usersResponse = await get("admin/users", token);
        const reps = (usersResponse.users || usersResponse.data || [])
          .filter(
            (user) =>
              user.type_user === "ws_rep" || user.type_user === "retail_rep"
          )
          .map((user) => ({
            label: user.name,
            value: user.slug, // slug for backend
            id: user.id, // keep original id for filtering customers
          }));
        setSalesmen(reps);
      } catch (err) {
        console.error("Failed to fetch salesmen:", err);
        setErrorFetchingSalesmen("فشل في جلب المندوبين.");
        toast.error("فشل في جلب المندوبين.");
      } finally {
        setLoadingSalesmen(false);
      }

      // Customers
      setLoadingCustomers(true);
      try {
        const customersResponse = await get("admin/customers", token);
        const custs =
          customersResponse.customers || customersResponse.data || [];
        setAllCustomers(custs); // keep all customers
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setErrorFetchingCustomers("فشل في جلب العملاء.");
        toast.error("فشل في جلب العملاء.");
      } finally {
        setLoadingCustomers(false);
      }
    };

    if (show) {
      fetchDropdownData();
    }
  }, [show]);

  // populate form when editing
  // populate form when editing
  // populate form when editing
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setErrors({});
      setIsLoading(false);

      if (visitToEdit) {
        setVisitSlug(visitToEdit.visit_id || visitToEdit.slug || "");
        setIsEditMode(true);

        // تحويل labels عربية إلى قيم value
        const typeMap = {
          حضوري: "in_person",
          اتصال: "call",
          "اجتماع أونلاين": "online",
        };

        const userSlug = visitToEdit.salesman?.slug || "";
        const customerSlug = visitToEdit.customer?.slug || "";
        const type = typeMap[visitToEdit.type] || "in_person";
        const note = visitToEdit.purpose || "";
        const date = visitToEdit.date
          ? new Date(visitToEdit.date).toISOString().split("T")[0]
          : "";

        setSalesmanId(userSlug);
        setCustomerId(customerSlug);
        setVisitType(type); // الآن ترسل value صحيحة
        setVisitPurpose(note);
        setVisitDate(date);

        setOriginalVisitData({
          user_slug: userSlug,
          customer_slug: customerSlug,
          visit_type: type,
          note: note,
          visit_date: date,
        });

        // فلترة العملاء حسب المندوب الحالي
        const selectedSalesman = salesmen.find((s) => s.value === userSlug);
        if (selectedSalesman) {
          const filteredCustomers = allCustomers
            .filter((c) => c.user_id === selectedSalesman.id)
            .map((c) => ({ label: c.name, value: c.slug }));
          setCustomers(filteredCustomers);
        }
      } else {
        setIsEditMode(false);
        setSalesmanId("");
        setCustomerId("");
        setVisitType("in_person");
        setVisitPurpose("");
        setVisitDate("");
        setOriginalVisitData(null);
      }
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
        setIsEditMode(false);
        setOriginalVisitData(null);
      }, 100);
    }
  }, [show, visitToEdit, salesmen, allCustomers]);

  // handle salesman change -> filter customers
  const handleSalesmanChange = (selectedLabel) => {
    const selected = salesmen.find((s) => s.label === selectedLabel);
    if (selected) {
      setSalesmanId(selected.value); // slug
      const filteredCustomers = allCustomers
        .filter((c) => c.user_id === selected.id)
        .map((c) => ({ label: c.name, value: c.slug }));
      setCustomers(filteredCustomers);
      setCustomerId(""); // reset
    } else {
      setSalesmanId("");
      setCustomers([]);
      setCustomerId("");
    }
  };

  const handleClose = (isSuccess = false) => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(isSuccess);
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let currentErrors = {};

    // تحقق من الحقول المطلوبة
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

      // تجهيز الحقول الحالية
      const currentData = {
        user_slug: salesmanId,
        customer_slug: customerId,
        visit_type: visitType, // value صحيحة: in_person / call / online
        visit_date: visitDate,
        note: visitPurpose.trim() || undefined,
      };

      // إذا تعديل → فقط الحقول المعدلة
      if (isEditMode && visitToEdit) {
        // إرسال كل الحقول دائمًا بدل التحقق من التغييرات
        const payload = {
          user_slug: salesmanId,
          customer_slug: customerId,
          visit_type: visitType,
          visit_date: visitDate,
          note: visitPurpose.trim() || null,
        };

        const response = await put(`admin/visits/${visitSlug}`, payload, token);

        if (response && response.id) {
          toast.success("تم تحديث الزيارة بنجاح!");
          handleClose(true);
        } else {
          const apiErrorMessage = response.message || "فشل العملية.";
          setErrors({ general: apiErrorMessage });
          toast.error(apiErrorMessage);
        }
      } else {
        // إضافة زيارة جديدة
        const response = await post("admin/visits", currentData, token);
        if (response && response.id) {
          toast.success("تم إضافة الزيارة بنجاح!");
          handleClose(true);
        } else {
          const apiErrorMessage = response.message || "فشل العملية.";
          setErrors({ general: apiErrorMessage });
          toast.error(apiErrorMessage);
        }
      }
    } catch (err) {
      console.error("Error submitting visit data:", err);
      if (err.status === 422 && err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        let newErrors = {};
        if (backendErrors.user_slug)
          newErrors.salesmanId = backendErrors.user_slug[0];
        if (backendErrors.customer_slug)
          newErrors.customerId = backendErrors.customer_slug[0];
        if (backendErrors.visit_type)
          newErrors.visitType = backendErrors.visit_type[0];
        if (backendErrors.visit_date)
          newErrors.visitDate = backendErrors.visit_date[0];
        if (backendErrors.note) newErrors.visitPurpose = backendErrors.note[0];
        setErrors(newErrors);
        toast.error("يرجى تصحيح الأخطاء في النموذج.");
      } else {
        const errorMessage =
          err.message || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
        handleClose(false);
      }
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
      title={
        isEditMode
          ? `تعديل الزيارة رقم: ${visitToEdit?.visit_id || ""}`
          : "إضافة زيارة جديدة"
      }
      maxWidth="max-w-xl"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-4 text-right max-h-[calc(100vh-120px)] overflow-y-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelectField
            label="اسم المندوب"
            value={salesmen.find((s) => s.value === salesmanId)?.label || ""}
            onChange={handleSalesmanChange}
            options={salesmen.map((s) => s.label)}
            error={errors.salesmanId || errorFetchingSalesmen}
            placeholder={
              loadingSalesmen ? "جاري تحميل المندوبين..." : "ابحث أو اختر مندوب"
            }
          />
          <SearchableSelectField
            label="اسم العميل"
            value={customers.find((c) => c.value === customerId)?.label || ""}
            onChange={(selectedLabel) => {
              const selected = customers.find((c) => c.label === selectedLabel);
              setCustomerId(selected ? selected.value : "");
            }}
            options={customers.map((c) => c.label)}
            error={errors.customerId || errorFetchingCustomers}
            placeholder={
              loadingCustomers ? "جاري تحميل العملاء..." : "ابحث أو اختر عميل"
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelectField
            label="نوع الزيارة"
            value={visitType} // هذا يجب أن يكون القيمة (value)
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
          <p className="text-red-500 text-xs mt-1 text-center">
            {errors.general}
          </p>
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
            {isLoading
              ? isEditMode
                ? "جاري حفظ التعديل..."
                : "جاري الإضافة..."
              : isEditMode
              ? "حفظ التعديل"
              : "إضافة زيارة"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
