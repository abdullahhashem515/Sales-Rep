import React, { useState, useEffect, useContext } from 'react';
import ModalWrapper from '../../components/shared/ModalWrapper';
import FormInputField from '../../components/shared/FormInputField';
import SearchableSelectField from '../../components/shared/SearchableSelectFieldV2';
import { toast } from 'react-toastify';
import { get, post } from '../../utils/apiService';
import { AuthContext } from "../../contexts/AuthContext";

export default function AddClientVoucherModal({ show, onClose }) {
  const { token } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  // States for form fields
  const [salesRepId, setSalesRepId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [currencyId, setCurrencyId] = useState(''); // ✅ حقل العملة الجديد
  const [note, setNote] = useState('');

  // States for dropdown data
  const [salesReps, setSalesReps] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currencies, setCurrencies] = useState([]); // ✅ حالة العملات
  const [loadingSalesReps, setLoadingSalesReps] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false); // ✅ حالة تحميل العملات

  // States for UI
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial data on modal open (sales reps, customers, and currencies)
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) return;

      try {
        setLoadingSalesReps(true);
        const salesRepsRes = await get('admin/users', token);
        const reps = (salesRepsRes.users || salesRepsRes.data || []).filter(user => user.type_user === 'retail_rep');
        setSalesReps(reps);
      } catch (err) {
        toast.error('فشل جلب المندوبين.');
      } finally {
        setLoadingSalesReps(false);
      }

      try {
        setLoadingCustomers(true);
        const customersRes = await get('admin/customers', token);
        const fetchedCustomers = customersRes.data || customersRes.customers || [];
        setAllCustomers(fetchedCustomers);
      } catch (err) {
        toast.error('فشل جلب العملاء.');
        setAllCustomers([]);
      } finally {
        setLoadingCustomers(false);
      }

      // ✅ جلب العملات
      try {
        setLoadingCurrencies(true);
        const currenciesRes = await get('admin/currencies', token);
        const fetchedCurrencies = currenciesRes.data || currenciesRes;
        setCurrencies(fetchedCurrencies);
      } catch (err) {
        toast.error('فشل جلب العملات.');
        setCurrencies([]);
      } finally {
        setLoadingCurrencies(false);
      }

      setLoadingInitialData(false);
    };

    if (show) {
      setIsVisible(true);
      fetchInitialData();
      setPaymentDate(new Date().toISOString().split('T')[0]);
    } else {
      setIsVisible(false);
    }
  }, [show, token]);

  // Filter customers based on sales rep
  useEffect(() => {
    if (salesRepId && allCustomers.length > 0) {
      const filteredCustomers = allCustomers.filter(customer => customer.user_id === parseInt(salesRepId));
      setCustomers(filteredCustomers);
    } else {
      setCustomers([]);
    }
    // Reset customer, amount, and currency when sales rep changes
    setCustomerId('');
    setAmount('');
    setCurrencyId('');
  }, [salesRepId, allCustomers]);

  const salesRepOptions = salesReps.map(rep => ({ value: rep.id, label: rep.name }));
  const customerOptions = customers.map(customer => ({ value: customer.id, label: customer.name }));
  const currencyOptions = currencies.map(currency => ({ value: currency.id, label: `${currency.name} (${currency.code})` })); // ✅ خيارات العملات

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let currentErrors = {};

    if (!salesRepId) currentErrors.salesRepId = 'الرجاء اختيار مندوب مبيعات.';
    if (!customerId) currentErrors.customerId = 'الرجاء اختيار عميل.';
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) currentErrors.amount = 'الرجاء إدخال مبلغ صحيح.';
    if (!paymentDate) currentErrors.paymentDate = 'الرجاء إدخال تاريخ الدفع.';
    if (!currencyId) currentErrors.currencyId = 'الرجاء اختيار عملة.'; // ✅ التحقق من حقل العملة
    if (!note.trim()) currentErrors.note = 'الرجاء إدخال ملاحظة.';

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      toast.error('يرجى تصحيح الأخطاء في النموذج.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        sales_rep_id: parseInt(salesRepId),
        customer_id: parseInt(customerId),
        payment_date: paymentDate,
        amount: parseFloat(amount),
        currency_id: parseInt(currencyId), // ✅ إضافة currency_id إلى الحمولة
        note: note,
        created_by: "user"
      };

      const response = await post('admin/payment-vouchers', payload, token);

      if (response?.status === true) {
        toast.success('تم إنشاء سند التسديد بنجاح!');
        onClose(true);
      } else {
        const serverMessage = response?.error || response?.message || 'حدث خطأ أثناء إنشاء السند.';
        const serverErrors = response?.errors || {};
        const newErrors = {};
        for (const key in serverErrors) {
          if (serverErrors.hasOwnProperty(key)) {
            newErrors[key] = serverErrors[key][0]; // Extract the first error message
          }
        }
        setErrors({ ...newErrors, general: serverMessage });
        toast.error(serverMessage);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'حدث خطأ أثناء إنشاء السند.';
      const serverErrors = err.response?.data?.errors || {};
      const newErrors = {};
      for (const key in serverErrors) {
        if (serverErrors.hasOwnProperty(key)) {
          newErrors[key] = serverErrors[key][0];
        }
      }
      setErrors({ ...newErrors, general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingInitialData) {
    return (
      <ModalWrapper show={show} onClose={() => onClose(false)} isVisible={isVisible} title="إضافة سند تسديد عميل" maxWidth="max-w-xl">
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper show={show} onClose={() => onClose(false)} isVisible={isVisible} title="إضافة سند تسديد عميل" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        <SearchableSelectField
          label="المندوب"
          value={salesRepId}
          onChange={setSalesRepId}
          options={salesRepOptions}
          placeholder={loadingSalesReps ? 'جاري التحميل...' : 'اختر مندوب...'}
          error={errors.salesRepId}
        />

        <SearchableSelectField
          label="العميل"
          value={customerId}
          onChange={setCustomerId}
          options={customerOptions}
          placeholder={loadingCustomers ? 'جاري التحميل...' : 'اختر عميل...'}
          error={errors.customerId}
          disabled={!salesRepId || loadingCustomers}
        />

        <SearchableSelectField
          label="العملة" // ✅ حقل العملة
          value={currencyId}
          onChange={setCurrencyId}
          options={currencyOptions}
          placeholder={loadingCurrencies ? 'جاري التحميل...' : 'اختر عملة...'}
          error={errors.currencyId}
          disabled={loadingCurrencies}
        />

        <FormInputField
          label="المبلغ"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={errors.amount}
          placeholder="أدخل المبلغ"
          step="0.01"
          min="0"
        />

        <FormInputField
          label="تاريخ الدفع"
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          error={errors.paymentDate}
        />

        <FormInputField
          label="ملاحظة"
          type="textarea"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows="3"
          error={errors.note}
        />

        {errors.general && <p className="text-red-500 text-xs mt-1 text-center">{errors.general}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded flex-1"
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'جاري الإنشاء...' : 'إنشاء السند'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}