import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField";
import SearchableSelectField from "../../components/shared/SearchableSelectField"; // For salesman and customer
import { toast } from 'react-toastify';
import { post, put, get } from '../../utils/apiService';

/**
 * مكون مودال موحد لإضافة أو تعديل زيارة.
 *
 * @param {object} props
 * @param {boolean} props.show - لتحديد ما إذا كان المودال مرئيًا.
 * @param {function} props.onClose - دالة لاستدعائها عند إغلاق المودال.
 * @param {object} [props.visitToEdit] - كائن الزيارة الذي سيتم تعديله. إذا كان فارغًا، فهو وضع إضافة.
 */
export default function AddUpdateVisitModal({ show, onClose, visitToEdit }) {
  const [isVisible, setIsVisible] = useState(false);
  const [salesmanId, setSalesmanId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [visitType, setVisitType] = useState('حضوري'); // Default type
  const [visitPurpose, setVisitPurpose] = useState('');
  const [visitDate, setVisitDate] = useState('');

  const [salesmen, setSalesmen] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingSalesmen, setLoadingSalesmen] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [errorFetchingSalesmen, setErrorFetchingSalesmen] = useState(null);
  const [errorFetchingCustomers, setErrorFetchingCustomers] = useState(null);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalVisitData, setOriginalVisitData] = useState(null); // To detect changes in edit mode

  // Fetch Salesmen and Customers
  useEffect(() => {
    const fetchDropdownData = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('Authentication token is missing. Please log in first.');
        return;
      }

      // Fetch Salesmen
      setLoadingSalesmen(true);
      try {
        const usersResponse = await get('admin/users', token); // Assuming this endpoint returns all users
        const reps = (usersResponse.users || usersResponse.data || [])
          .filter(user => user.type_user === 'ws_rep' || user.type_user === 'retail_rep')
          .map(user => ({ label: user.name, value: user.id }));
        setSalesmen(reps);
      } catch (err) {
        console.error("Failed to fetch salesmen:", err);
        setErrorFetchingSalesmen('فشل في جلب المندوبين.');
        toast.error('فشل في جلب المندوبين.');
      } finally {
        setLoadingSalesmen(false);
      }

      // Fetch Customers
      setLoadingCustomers(true);
      try {
        const customersResponse = await get('admin/customers', token);
        const custs = (customersResponse.customers || customersResponse.data || [])
          .map(customer => ({ label: customer.name, value: customer.id }));
        setCustomers(custs);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setErrorFetchingCustomers('فشل في جلب العملاء.');
        toast.error('فشل في جلب العملاء.');
      } finally {
        setLoadingCustomers(false);
      }
    };

    if (show) {
      fetchDropdownData();
    }
  }, [show]);

  // Populate form fields when modal opens or visitToEdit changes
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setErrors({});
      setIsLoading(false);

      if (visitToEdit) {
        setIsEditMode(true);
        setSalesmanId(visitToEdit.salesman_id || '');
        setCustomerId(visitToEdit.customer_id || '');
        setVisitType(visitToEdit.type || 'حضوري');
        setVisitPurpose(visitToEdit.purpose || '');
        // Format date to YYYY-MM-DD for input[type="date"]
        setVisitDate(visitToEdit.date ? new Date(visitToEdit.date).toISOString().split('T')[0] : '');

        setOriginalVisitData({
          salesman_id: visitToEdit.salesman_id || '',
          customer_id: visitToEdit.customer_id || '',
          type: visitToEdit.type || 'حضوري',
          purpose: visitToEdit.purpose || '',
          date: visitToEdit.date ? new Date(visitToEdit.date).toISOString().split('T')[0] : '',
        });
      } else {
        setIsEditMode(false);
        setSalesmanId('');
        setCustomerId('');
        setVisitType('حضوري');
        setVisitPurpose('');
        setVisitDate('');
        setOriginalVisitData(null);
      }
    } else {
      setIsVisible(false);
      setTimeout(() => {
        setSalesmanId('');
        setCustomerId('');
        setVisitType('حضوري');
        setVisitPurpose('');
        setVisitDate('');
        setErrors({});
        setIsLoading(false);
        setIsEditMode(false);
        setOriginalVisitData(null);
      }, 100);
    }
  }, [show, visitToEdit]);

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

    if (!salesmanId) {
      currentErrors.salesmanId = 'يجب اختيار مندوب.';
    }
    if (!customerId) {
      currentErrors.customerId = 'يجب اختيار عميل.';
    }
    if (!visitType.trim()) {
      currentErrors.visitType = 'نوع الزيارة مطلوب.';
    }
    if (!visitPurpose.trim()) {
      currentErrors.visitPurpose = 'الغرض من الزيارة مطلوب.';
    }
    if (!visitDate.trim()) {
      currentErrors.visitDate = 'تاريخ الزيارة مطلوب.';
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      toast.error('يرجى تصحيح الأخطاء في النموذج.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        setIsLoading(false);
        return;
      }

      const payload = {
        salesman_id: salesmanId,
        customer_id: customerId,
        type: visitType,
        purpose: visitPurpose.trim(),
        date: visitDate,
      };

      let response;
      if (isEditMode && visitToEdit) {
        let hasChanges = false;
        if (
          payload.salesman_id !== originalVisitData.salesman_id ||
          payload.customer_id !== originalVisitData.customer_id ||
          payload.type !== originalVisitData.type ||
          payload.purpose !== originalVisitData.purpose ||
          payload.date !== originalVisitData.date
        ) {
          hasChanges = true;
        }

        if (!hasChanges) {
          toast.info('لم يتم إجراء أي تغييرات للحفظ.');
          handleClose(true);
          return;
        }
        
        console.log("Update Visit Payload:", payload);
        response = await put(`admin/visits/${visitToEdit.visit_id}`, payload, token);
      } else {
        console.log("Add Visit Payload:", payload);
        response = await post('admin/visits', payload, token);
      }

      if (response.status) {
        toast.success(isEditMode ? 'تم تحديث الزيارة بنجاح!' : 'تم إضافة الزيارة بنجاح!');
        handleClose(true);
      } else {
        const apiErrorMessage = response.message || 'فشل العملية.';
        setErrors({ general: apiErrorMessage });
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("Error submitting visit data:", err);
      const errorMessage = err.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
      
      if (err.status === 422 && err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        let newErrors = {};
        for (const field in backendErrors) {
          if (field === 'salesman_id') newErrors.salesmanId = backendErrors[field][0];
          if (field === 'customer_id') newErrors.customerId = backendErrors[field][0];
          if (field === 'type') newErrors.visitType = backendErrors[field][0];
          if (field === 'purpose') newErrors.visitPurpose = backendErrors[field][0];
          if (field === 'date') newErrors.visitDate = backendErrors[field][0];
        }
        setErrors(newErrors);
        toast.error('يرجى تصحيح الأخطاء في النموذج.');
      } else {
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
        handleClose(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const visitTypeOptions = [
    { value: 'حضوري', label: 'حضوري' },
    { value: 'عن بعد (اتصال)', label: 'عن بعد (اتصال)' },
  ];

  return (
    <ModalWrapper
      show={show}
      onClose={() => handleClose(false)}
      isVisible={isVisible}
      title={isEditMode ? `تعديل الزيارة رقم: ${visitToEdit?.visit_id || ''}` : "إضافة زيارة جديدة"}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right max-h-[calc(100vh-120px)] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelectField
            label="اسم المندوب"
            value={salesmen.find(s => s.value === salesmanId)?.label || ''}
            onChange={(selectedLabel) => {
                const selected = salesmen.find(s => s.label === selectedLabel);
                setSalesmanId(selected ? selected.value : '');
            }}
            options={salesmen.map(s => s.label)}
            error={errors.salesmanId || errorFetchingSalesmen}
            placeholder={loadingSalesmen ? "جاري تحميل المندوبين..." : "ابحث أو اختر مندوب"}
          />
          <SearchableSelectField
            label="اسم العميل"
            value={customers.find(c => c.value === customerId)?.label || ''}
            onChange={(selectedLabel) => {
                const selected = customers.find(c => c.label === selectedLabel);
                setCustomerId(selected ? selected.value : '');
            }}
            options={customers.map(c => c.label)}
            error={errors.customerId || errorFetchingCustomers}
            placeholder={loadingCustomers ? "جاري تحميل العملاء..." : "ابحث أو اختر عميل"}
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
          label="الغرض من الزيارة"
          type="textarea"
          placeholder="أدخل الغرض من الزيارة..."
          value={visitPurpose}
          onChange={(e) => setVisitPurpose(e.target.value)}
          error={errors.visitPurpose}
          rows={3}
        />

        {errors.general && <p className="text-red-500 text-xs mt-1 text-center">{errors.general}</p>}

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
            {isLoading ? (isEditMode ? 'جاري حفظ التعديل...' : 'جاري الإضافة...') : (isEditMode ? 'حفظ التعديل' : 'إضافة زيارة')}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
