import React, { useState, useEffect, useMemo, useContext } from 'react';
import ModalWrapper from '../../components/shared/ModalWrapper';
import FormInputField from '../../components/shared/FormInputField';
import FormSelectField from '../../components/shared/FormSelectField';
import SearchableSelectField from '../../components/shared/SearchableSelectFieldV2'; // ✅ تم التعديل هنا
import { PlusIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import { get, post } from '../../utils/apiService';
import { AuthContext } from "../../contexts/AuthContext";


export default function AddInvoiceModal({ show, onClose }) {
  const { token } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(false);

  const [currencyId, setCurrencyId] = useState('');
  const [salespersonId, setSalespersonId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [paymentType, setPaymentType] = useState('cash');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);

  const [productInputRows, setProductInputRows] = useState([
    { product_id: '', quantity: '', price: '', name: '', unit: '', subtotal: '0.00', errors: {} }
  ]);
  
  const [selectedSalespersonType, setSelectedSalespersonType] = useState(null);

  const [currencies, setCurrencies] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [loadingSalespersons, setLoadingSalespersons] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      if (!token) {
        toast.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        return;
      }

      setLoadingCurrencies(true);
      try {
        const response = await get('admin/currencies', token);
        setCurrencies(Array.isArray(response) ? response : response.currencies || response.data || []);
      } catch (err) {
        toast.error('فشل جلب العملات.');
        console.error("Failed to fetch currencies:", err);
      } finally {
        setLoadingCurrencies(false);
      }

      setLoadingSalespersons(true);
      try {
        const response = await get('admin/users', token);
        const reps = (response.users || response.data || []).filter(user =>
          user.type_user === 'retail_rep'
        );
        setSalespersons(reps);
      } catch (err) {
        toast.error('فشل جلب المندوبين.');
        console.error("Failed to fetch salespersons:", err);
      } finally {
        setLoadingSalespersons(false);
      }

      setLoadingCustomers(true);
      try {
        const response = await get('admin/customers', token);
        setCustomers(Array.isArray(response) ? response : response.customers || response.data || []);
      } catch (err) {
        toast.error('فشل جلب العملاء.');
        console.error("Failed to fetch customers:", err);
      } finally {
        setLoadingCustomers(false);
      }

      setLoadingProducts(true);
      try {
        const response = await get('admin/products', token);
        setProducts(Array.isArray(response) ? response : response.products || response.data || []);
      } catch (err) {
        toast.error('فشل جلب المنتجات.');
        console.error("Failed to fetch products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (show) {
      setIsVisible(true);
      setCurrencyId('');
      setSalespersonId('');
      setCustomerId('');
      setPaymentType('cash');
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setProductInputRows([{ product_id: '', quantity: '', price: '', name: '', unit: '', subtotal: '0.00', errors: {} }]);
      setSelectedSalespersonType(null);
      setErrors({});
      setIsLoading(false);
      
      fetchAllData();
    } else {
      setIsVisible(false);
    }
  }, [show, token]);


  const currencyOptions = useMemo(() => {
    return currencies.map(curr => ({ value: curr.id, label: curr.name }));
  }, [currencies]);

  const salespersonOptions = useMemo(() => {
    return salespersons.map(sp => ({
      value: sp.id,
      label: `${sp.name} (${sp.type_user === 'ws_rep' ? 'مندوب جملة' : 'مندوب تجزئة'})`,
      type_user: sp.type_user,
    }));
  }, [salespersons]);

  // ✅ التعديل هنا: الفلترة أصبحت أكثر ثقة لأن SearchableSelectFieldV2 يرجع رقمًا.
  const filteredCustomerOptions = useMemo(() => {
    if (salespersonId) {
      const parsedSalespersonId = parseInt(salespersonId);
      if (!isNaN(parsedSalespersonId)) {
        return customers
          .filter(cust => cust.user_id === parsedSalespersonId)
          .map(c => ({ value: c.id, label: c.name }));
      }
    }
    return [];
  }, [customers, salespersonId]);

  const paymentTypeOptions = [
    { value: 'cash', label: 'نقد' },
    { value: 'credit', label: 'آجل' },
  ];

  const handleSalespersonChange = (id) => {
    const selectedSp = salespersons.find(sp => sp.id === id);
    setSalespersonId(id);
    setSelectedSalespersonType(selectedSp ? selectedSp.type_user : null);
    setCustomerId('');
  };

  const handleCurrencyChange = (value) => {
    setCurrencyId(value);
    setProductInputRows([{ product_id: '', quantity: '', price: '', name: '', unit: '', subtotal: '0.00', errors: {} }]);
    toast.info('تم تغيير العملة. يرجى إضافة المنتجات مرة أخرى بالأسعار الجديدة.');
  };

  const handleAddRow = () => {
    setProductInputRows(prevRows => [
      ...prevRows,
      { product_id: '', quantity: '', price: '', name: '', unit: '', subtotal: '0.00', errors: {} }
    ]);
  };

  const handleRemoveRow = (indexToRemove) => {
    setProductInputRows(prevRows => prevRows.filter((_, index) => index !== indexToRemove));
  };

  const handleProductInputChange = (index, field, value) => {
    setProductInputRows(prevRows => {
      const newRows = [...prevRows];
      let row = { ...newRows[index] };

      if (field === 'product_id') {
        row.product_id = value;
        row.quantity = '';
        row.subtotal = '0.00';

        const productDetails = products.find(p => p.id === value);
        row.name = productDetails?.name || '';
        row.unit = productDetails?.unit || '';

        const pricesOptions = getProductPricesOptions(value);

        if (pricesOptions.length > 0) {
          row.price = parseFloat(pricesOptions[0].value);
        } else {
          row.price = '';
        }

      } else if (field === 'quantity') {
        row.quantity = value;

      } else if (field === 'price') {
        row.price = parseFloat(value);
      }

      const qty = parseFloat(row.quantity);
      const price = parseFloat(row.price);
      row.subtotal = (!isNaN(qty) && !isNaN(price)) ? (qty * price).toFixed(2) : '0.00';

      row.errors = { ...row.errors, [field]: undefined };

      newRows[index] = { ...row };
      return newRows;
    });
  };

  const getProductPricesOptions = (product_id) => {
    const currentProduct = products.find(p => p.id === product_id);
    if (!currentProduct || !currentProduct.prices_by_currency || !currencyId) {
      return [];
    }
    const selectedCurrencyCode = currencies.find(c => c.id === currencyId)?.code;
    if (!selectedCurrencyCode) {
      return [];
    }
    const currencyPrices = currentProduct.prices_by_currency[selectedCurrencyCode];
    if (!currencyPrices || !Array.isArray(currencyPrices)) {
      return [];
    }
    return currencyPrices.map(price => ({
      value: price.price,
      label: `${price.price} ${selectedCurrencyCode}`
    }));
  };

  const grandTotal = useMemo(() => {
    return productInputRows.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0).toFixed(2);
  }, [productInputRows]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let currentErrors = {};
    let hasProductErrors = false;

    if (!currencyId) currentErrors.currencyId = 'الرجاء اختيار العملة.';
    if (!salespersonId) currentErrors.salespersonId = 'الرجاء اختيار مندوب مبيعات.';
    if (salespersonId && !customerId) currentErrors.customerId = 'الرجاء اختيار عميل.';

    const validatedProducts = productInputRows.map((row) => {
      let rowErrors = {};
      if (row.product_id || row.quantity || row.price) {
        if (!row.product_id) rowErrors.product = 'الرجاء اختيار منتج.';
        if (!row.quantity || isNaN(parseFloat(row.quantity)) || parseFloat(row.quantity) <= 0)
          rowErrors.quantity = 'الكمية غير صالحة.';
        if (!row.price || isNaN(parseFloat(row.price)) || parseFloat(row.price) <= 0)
          rowErrors.price = 'الرجاء اختيار سعر صالح.';
      }
      if (Object.keys(rowErrors).length > 0) hasProductErrors = true;
      return { ...row, errors: rowErrors };
    });

    const finalProductsToSubmit = validatedProducts.filter(
      (row) => row.product_id && row.quantity && row.price
    );

    if (finalProductsToSubmit.length === 0) {
      currentErrors.products = 'يجب إضافة منتج واحد على الأقل للفاتورة.';
      hasProductErrors = true;
    }

    setProductInputRows(validatedProducts);

    if (Object.keys(currentErrors).length > 0 || hasProductErrors) {
      setErrors(currentErrors);
      toast.error('يرجى تصحيح الأخطاء في النموذج.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        currency_id: currencyId,
        user_id: salespersonId,
        customer_id: customerId || null,
        date: invoiceDate,
        payment_type: paymentType,
        total_amount: parseFloat(grandTotal),
        items: finalProductsToSubmit.map((p) => ({
          product_id: p.product_id,
          quantity: p.quantity,
          unit_price: p.price,
        })),
      };

      const response = await post('admin/invoices', payload, token);

      if (response?.status === true) {
        toast.success('تم إنشاء الفاتورة بنجاح!');
        onClose(true);
      } else {
        let serverMessage = '';
        
        if (response?.error) {
          serverMessage = response.error;
        } else if (response?.message) {
          serverMessage = response.message;
        } else if (response?.data?.error) {
          serverMessage = response.data.error;
        } else if (response?.data?.message) {
          serverMessage = response.data.message;
        } else {
          serverMessage = 'حدث خطأ أثناء إنشاء الفاتورة.';
        }
        
        toast.error(serverMessage);
        setErrors({ general: serverMessage });
      }
    } catch (err) {
      let errorMessage = '';
      
      if (err.response && err.response.data) {
        if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = 'حدث خطأ أثناء إنشاء الفاتورة.';
        }
      } else if (err.error) {
        errorMessage = err.error;
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = 'حدث خطأ أثناء إنشاء الفاتورة.';
      }
      
      toast.error(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };


  const selectedProductIds = useMemo(() => {
    return productInputRows.map(row => row.product_id).filter(Boolean);
  }, [productInputRows]);

  const getProductOptionsForRows = (currentIndex) => {
    const otherSelectedIds = selectedProductIds.filter((_, index) => index !== currentIndex);
    
    return products
      .filter(p => !otherSelectedIds.includes(p.id))
      .map(p => ({
        value: p.id,
        label: `${p.name} (${p.unit})`
      }));
  };

  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title="إنشاء فاتورة"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SearchableSelectField
            label="العملة"
            value={currencyId}
            onChange={handleCurrencyChange}
            options={currencyOptions}
            placeholder={loadingCurrencies ? 'جاري التحميل...' : 'اختر العملة...'}
            error={errors.currencyId}
            className="w-full"
          />
          <SearchableSelectField
            label="المندوب"
            value={salespersonId}
            onChange={handleSalespersonChange}
            options={salespersonOptions}
            placeholder={loadingSalespersons ? 'جاري التحميل...' : 'اختر مندوب...'}
            error={errors.salespersonId}
            className="w-full"
          />
          {salespersonId && (
            <SearchableSelectField
              label="العميل"
              value={customerId}
              onChange={setCustomerId}
              options={filteredCustomerOptions}
              placeholder={loadingCustomers ? 'جاري التحميل...' : 'اختر عميل...'}
              error={errors.customerId}
              className="w-full"
            />
          )}
          <FormInputField
            label="تاريخ الفاتورة"
            type="date"
            value={invoiceDate}
            readOnly
            className="bg-gray-800 opacity-80"
          />
          <FormSelectField
            label="نوع الدفع"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            options={paymentTypeOptions}
            className="w-full"
          />
        </div>

        <div className="border border-gray-700 p-3 rounded-lg flex flex-col gap-3 mt-4">
          <h4 className="text-base font-bold border-b border-gray-700 pb-2 mb-2">
            المنتجات في الفاتورة
          </h4>
          <div className="grid grid-cols-invoice-products text-right font-semibold text-gray-400 text-sm border-b border-gray-700 pb-2">
            <div>المنتج</div>
            <div>الكمية</div>
            <div>سعر الوحدة</div>
            <div>الإجمالي</div>
          </div>
          <div className="max-h-96 overflow-y-auto pr-2">
            {productInputRows.length > 0 ? (
              productInputRows.map((row, index) => (
                <div key={index} className="grid grid-cols-invoice-products gap-3 items-center py-2 border-b border-gray-700 last:border-b-0">
                  <div className="col-span-1">
                    <SearchableSelectField
                      label=""
                      value={row.product_id}
                      onChange={(id) => handleProductInputChange(index, 'product_id', id)}
                      options={getProductOptionsForRows(index)}
                      placeholder={loadingProducts ? 'جاري التحميل...' : 'ابحث أو اختر...'}
                      error={row.errors.product}
                      className="w-full text-sm"
                      disabled={!currencyId}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormInputField
                      label=""
                      type="number"
                      value={row.quantity}
                      onChange={(e) => handleProductInputChange(index, 'quantity', e.target.value)}
                      error={row.errors.quantity}
                      placeholder="أدخل الكمية"
                      className="text-sm"
                      disabled={!row.product_id}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormSelectField
                      label=""
                      value={row.price}
                      onChange={(e) => handleProductInputChange(index, 'price', e.target.value)}
                      options={getProductPricesOptions(row.product_id)}
                      placeholder="اختر السعر"
                      error={row.errors.price}
                      className="text-sm"
                      disabled={!row.product_id || getProductPricesOptions(row.product_id).length === 0}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormInputField
                      label=""
                      type="text"
                      value={row.subtotal}
                      readOnly
                      className="bg-gray-800 opacity-80 text-sm"
                    />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {productInputRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="bg-red-500 hover:bg-red-600 p-2 rounded-full flex-shrink-0"
                        title="إزالة الصف"
                      >
                        <XMarkIcon className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4 text-sm">
                لا توجد منتجات في الفاتورة بعد.
              </p>
            )}
          </div>
          
          {errors.products && (
            <p className="text-red-500 text-xs mt-1 text-center">{errors.products}</p>
          )}

          <button
            type="button"
            onClick={handleAddRow}
            className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded flex items-center justify-center gap-1 mt-3"
            disabled={loadingProducts || productInputRows.length >= products.length}
          >
            <PlusIcon className="w-5 h-5 text-white" />
            <span>إضافة صف جديد</span>
          </button>
        </div>

        <div className="text-lg font-bold text-accentColor text-left mt-4 p-2 bg-gray-800 rounded-lg shadow-md">
          الإجمالي الكلي: {grandTotal} {currencies.find(c => c.id === currencyId)?.code || ''}
        </div>

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
            {isLoading ? 'جاري إنشاء الفاتورة...' : 'إنشاء الفاتورة'}
          </button>
        </div>
      </form>
      <style jsx>{`
        .grid-cols-invoice-products {
          grid-template-columns: 2.5fr 1fr 1fr 1fr 0.5fr;
        }
        @media (max-width: 768px) {
          .grid-cols-invoice-products {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </ModalWrapper>
  );
}