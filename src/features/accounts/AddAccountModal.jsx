import React, { useState, useEffect, useContext } from 'react';
import ModalWrapper from '../../components/shared/ModalWrapper';
import FormInputField from '../../components/shared/FormInputField';
import SearchableSelectFieldV2 from '../../components/shared/SearchableSelectFieldV2';
import { toast } from 'react-toastify';
import { get, post } from '../../utils/apiService';
import { AuthContext } from "../../contexts/AuthContext";

export default function AddAccountModal({ show, onClose }) {
  const { token } = useContext(AuthContext);

  const [isVisible, setIsVisible] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  // States for form fields
  const [accountHolder, setAccountHolder] = useState(null); // Stores { label, value }
  const [accountType, setAccountType] = useState('');
  const [currency, setCurrency] = useState(null); // Stores { label, value }
  const [accountName, setAccountName] = useState('');

  // States for dropdown data
  const [accountHolders, setAccountHolders] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  // States for UI
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Effect to handle modal visibility and data fetching
  useEffect(() => {
    if (!show || !token) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    setLoadingInitialData(true);

    const fetchData = async () => {
      try {
        const [usersRes, customersRes, adminsRes, currenciesRes] = await Promise.all([
          get('admin/users', token),
          get('admin/customers', token),
          get('admin/admins', token),
          get('admin/currencies', token)
        ]);

        const allHolders = [];
        
        // Process Users (Retail Reps)
        const users = usersRes.users || usersRes.data || [];
        const retailReps = users.filter(user => user.type_user === 'retail_rep');
        retailReps.forEach(user => {
          allHolders.push({
            value: `user-${user.id}`,
            label: user.name,
            type: 'sales_rep'
          });
        });
        
        // Process Customers
        const customers = customersRes.data || customersRes.customers || [];
        customers.forEach(customer => {
          allHolders.push({
            value: `customer-${customer.id}`,
            label: customer.name,
            type: 'customer'
          });
        });

        // Process Admins
        const admins = adminsRes.data || adminsRes.admins || [];
        admins.forEach(admin => {
          allHolders.push({
            value: `admin-${admin.id}`,
            label: admin.name,
            type: 'bank'
          });
        });
        
        setAccountHolders(allHolders);
        setCurrencies(currenciesRes.data || currenciesRes);
        
      } catch (err) {
        toast.error('فشل جلب البيانات الأولية.');
        onClose(false);
      } finally {
        setLoadingInitialData(false);
      }
    };

    fetchData();
  }, [show, token, onClose]);

  // Effect to update the 'Account Name' and 'Account Type' fields
  useEffect(() => {
    let name = accountHolder ? accountHolder.label : '';
    let type = accountHolder ? accountHolder.type : '';
    const currencyCode = currency ? currency.label : '';
    
    // Check if accountHolder has a type and set it
    if (accountHolder && accountHolder.type) {
      setAccountType(accountHolder.type);
    } else {
      setAccountType('');
    }

    // Update the account name field
    if (name && currencyCode) {
      setAccountName(`${name} - ${currencyCode}`);
    } else {
      setAccountName(name);
    }
  }, [accountHolder, currency]);

  const currencyOptions = currencies.map(curr => ({
    value: curr.id,
    label: curr.code,
    code: curr.code
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let currentErrors = {};

    if (!accountHolder) currentErrors.accountHolder = 'الرجاء اختيار صاحب الحساب.';
    if (!accountType) currentErrors.accountType = 'الرجاء اختيار نوع الحساب.';
    if (!currency) currentErrors.currency = 'الرجاء اختيار العملة.';
    
    // Check if accountName is empty
    if (!accountName) currentErrors.accountName = 'اسم الحساب لا يمكن أن يكون فارغًا.';

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      toast.error('يرجى تصحيح الأخطاء في النموذج.');
      return;
    }

    setIsLoading(true);

    const [sourceType, id] = accountHolder.value.split('-');
    const accountId = parseInt(id);

    // Prepare the payload object
    const payload = {
      name: accountName,
      type: accountType, // Using the state variable directly which is updated in useEffect
      currency_id: parseInt(currency.value),
    };

    // Add the specific ID key based on the type
    switch (sourceType) {
      case 'user':
        payload.user_id = accountId;
        break;
      case 'customer':
        payload.customer_id = accountId;
        break;
      case 'admin':
        payload.admin_id = accountId;
        break;
      default:
        toast.error('نوع الحساب غير صالح.');
        setIsLoading(false);
        return;
    }

    try {
      const response = await post('admin/accounts', payload, token);

      if (response?.status === true) {
        toast.success('تم إضافة الحساب بنجاح!');
        onClose(true);
      } else {
        if (typeof response.message === 'string') {
          toast.error(response.message);
          setErrors({ general: response.message });
        }
        else if (response.message && Array.isArray(response.message)) {
          const newErrors = {};
          response.message.forEach(msg => {
            const parts = msg.split(': ');
            if (parts.length > 1) {
              const key = parts[0];
              const errorMsg = parts[1];
              newErrors[key] = errorMsg;
            } else {
              newErrors.general = msg;
            }
          });
          setErrors(newErrors);
          toast.error(response.message.join(', '));
        } else {
          toast.error('فشل إضافة الحساب. يرجى التحقق من البيانات.');
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'حدث خطأ غير متوقع.';
      if (typeof errorMessage === 'string') {
        toast.error(errorMessage);
      } else if (typeof errorMessage === 'object') {
        const firstError = Object.values(errorMessage)[0]?.[0] || 'فشل إضافة الحساب.';
        toast.error(firstError);
      } else {
        toast.error('حدث خطأ غير متوقع.');
      }
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingInitialData) {
    return (
      <ModalWrapper show={show} onClose={() => onClose(false)} isVisible={isVisible} title="إضافة حساب جديد" maxWidth="max-w-xl">
        <div className="flex justify-center items-center py-10">
          <p className="text-gray-400">جاري تحميل البيانات...</p>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper show={show} onClose={() => onClose(false)} isVisible={isVisible} title="إضافة حساب جديد" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        {/* حقل صاحب الحساب */}
        <SearchableSelectFieldV2
          label="صاحب الحساب"
          value={accountHolder?.value || ''}
          onChange={(value) => setAccountHolder(accountHolders.find(holder => holder.value === value))}
          options={accountHolders}
          placeholder="اختر صاحب الحساب..."
          error={errors.accountHolder}
        />

        {/* حقل نوع الحساب (يتم تحديده تلقائياً) */}
        <FormInputField
          label="نوع الحساب"
          type="text"
          value={accountType}
          disabled
          error={errors.accountType}
          placeholder="يتم التحديد تلقائيا"
        />

        {/* حقل العملة */}
        <SearchableSelectFieldV2
          label="العملة"
          value={currency?.value || ''}
          onChange={(value) => setCurrency(currencyOptions.find(curr => curr.value === value))}
          options={currencyOptions}
          placeholder="اختر العملة..."
          error={errors.currency}
        />
        
        {/* حقل اسم الحساب (يتم تحديده تلقائياً) */}
        <FormInputField
          label="اسم الحساب"
          type="text"
          value={accountName}
          disabled
          error={errors.accountName}
          placeholder="يتم التحديد تلقائيا"
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
            {isLoading ? 'جاري الإضافة...' : 'إضافة الحساب'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}