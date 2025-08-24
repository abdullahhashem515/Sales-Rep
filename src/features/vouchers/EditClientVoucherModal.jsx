import React, { useState, useEffect, useContext } from 'react';
import ModalWrapper from '../../components/shared/ModalWrapper';
import FormInputField from '../../components/shared/FormInputField';
import SearchableSelectFieldV2 from '../../components/shared/SearchableSelectFieldV2';
import SearchableSelectFieldV3 from '../../components/shared/SearchableSelectFieldV3';
import { toast } from 'react-toastify';
import { get, put } from '../../utils/apiService';
import { AuthContext } from "../../contexts/AuthContext";

export default function EditClientVoucherModal({ show, onClose, slug }) {
  const { token } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  const [salesRepId, setSalesRepId] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [note, setNote] = useState('');

  const [salesReps, setSalesReps] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!show || !slug || !token) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    setLoadingInitialData(true);

    const fetchData = async () => {
      try {
        // جلب بيانات السند، المندوبين، والعملات فقط
        const [voucherRes, salesRepsRes, currenciesRes] = await Promise.all([
          get(`admin/payment-vouchers/${slug}`, token),
          get('admin/users', token),
          get('admin/currencies', token)
        ]);

        if (!voucherRes.status || !voucherRes.data) {
          toast.error('فشل جلب تفاصيل السند.');
          onClose(false);
          return;
        }

        const fetchedVoucher = voucherRes.data;
        const reps = (salesRepsRes.users || salesRepsRes.data || []).filter(user => user.type_user === 'retail_rep');
        const fetchedCurrencies = currenciesRes.data || currenciesRes;

        setSalesReps(reps);
        setCurrencies(fetchedCurrencies);
        
        // **الآن نعتمد على بيانات العميل الموجودة مباشرة في السند**
        const customerData = fetchedVoucher.customer;
        
        // تعيين الكائن الكامل للعميل المختار
        const customerOption = customerData ? { label: customerData.name, value: customerData.id } : null;
        setSelectedCustomer(customerOption);
        
        // بما أنك لا تجلب كل العملاء، لن يكون هناك خيارات أخرى في القائمة
        // لذلك، يمكنك ببساطة تعيين العملاء إلى مصفوفة تحتوي على العميل الحالي فقط
        setCustomers(customerData ? [customerData] : []);

        // تعيين باقي الحقول بشكل طبيعي
        setSalesRepId(fetchedVoucher.sales_rep_id || '');
        setAmount(fetchedVoucher.amount || '');
        setPaymentDate(fetchedVoucher.payment_date || '');
        setCurrencyId(fetchedVoucher.currency_id || '');
        setNote(fetchedVoucher.note || '');
        
      } catch (err) {
        toast.error('فشل جلب البيانات الأولية للسند.');
        onClose(false);
      } finally {
        setLoadingInitialData(false);
      }
    };

    fetchData();
  }, [show, slug, token, onClose]);

  // ملاحظة: تم إزالة useEffect الخاص بفلترة العملاء لأننا لم نعد نستخدم قائمة العملاء الكاملة.
  // إذا كنت بحاجة إلى تغيير العميل عند تغيير المندوب، ستحتاج إلى جلب قائمة العملاء
  // المرتبطين بالمندوب بعد تحديث حالة salesRepId.

  const salesRepOptions = salesReps.map(rep => ({ value: rep.id, label: rep.name }));
  const customerOptions = customers.map(customer => ({ value: customer.id, label: customer.name }));
  const currencyOptions = currencies.map(currency => ({ value: currency.id, label: `${currency.name} (${currency.code})` }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let currentErrors = {};

    if (!salesRepId) currentErrors.salesRepId = 'الرجاء اختيار مندوب مبيعات.';
    if (!selectedCustomer?.value) currentErrors.customerId = 'الرجاء اختيار عميل.';
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) currentErrors.amount = 'الرجاء إدخال مبلغ صحيح.';
    if (!paymentDate) currentErrors.paymentDate = 'الرجاء إدخال تاريخ الدفع.';
    if (!currencyId) currentErrors.currencyId = 'الرجاء اختيار عملة.';
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
        customer_id: parseInt(selectedCustomer.value),
        payment_date: paymentDate,
        amount: parseFloat(amount),
        currency_id: parseInt(currencyId),
        note: note,
        created_by: "user"
      };

      const response = await put(`admin/payment-vouchers/${slug}`, payload, token);

      if (response?.status === true) {
        toast.success('تم تعديل سند التسديد بنجاح!');
        onClose(true);
      } else {
        const serverMessage = response?.error || response?.message || 'حدث خطأ أثناء تعديل السند.';
        const serverErrors = response?.errors || {};
        const newErrors = {};
        for (const key in serverErrors) {
          if (serverErrors.hasOwnProperty(key)) {
            newErrors[key] = serverErrors[key][0];
          }
        }
        setErrors({ ...newErrors, general: serverMessage });
        toast.error(serverMessage);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'حدث خطأ أثناء تعديل السند.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingInitialData) {
    return (
      <ModalWrapper show={show} onClose={() => onClose(false)} isVisible={isVisible} title="تعديل سند تسديد عميل" maxWidth="max-w-xl">
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper show={show} onClose={() => onClose(false)} isVisible={isVisible} title="تعديل سند تسديد عميل" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        {/* مندوب المبيعات يستخدم V2 */}
        <SearchableSelectFieldV2
          label="المندوب"
          value={salesRepId}
          onChange={setSalesRepId}
          options={salesRepOptions}
          placeholder="اختر مندوب..."
          error={errors.salesRepId}
        />

        {/* العميل يستخدم V3 */}
        <SearchableSelectFieldV3
          label="العميل"
          value={selectedCustomer}
          onChange={setSelectedCustomer}
          options={customerOptions}
          placeholder="اختر عميل..."
          error={errors.customerId}
          disabled={!salesRepId}
        />

        {/* العملة تستخدم V2 */}
        <SearchableSelectFieldV2
          label="العملة"
          value={currencyId}
          onChange={setCurrencyId}
          options={currencyOptions}
          placeholder="اختر عملة..."
          error={errors.currencyId}
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
            {isLoading ? 'جاري التعديل...' : 'تعديل السند'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}