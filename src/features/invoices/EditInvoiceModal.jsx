import React, { useState, useEffect, useMemo, useContext } from 'react';
import ModalWrapper from '../../components/shared/ModalWrapper';
import FormInputField from '../../components/shared/FormInputField';
import FormSelectField from '../../components/shared/FormSelectField';
import SearchableSelectField from '../../components/shared/SearchableSelectFieldV2';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import { get, put } from '../../utils/apiService';
import { AuthContext } from "../../contexts/AuthContext";

export default function EditInvoiceModal({ show, onClose, invoice }) {
  const { token } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  const [currencyId, setCurrencyId] = useState('');
  const [salespersonId, setSalespersonId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');

  const [productInputRows, setProductInputRows] = useState([]);

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

  // 1. Fetching all necessary data (currencies, salespersons, customers, products)
  useEffect(() => {
    const fetchAllData = async () => {
      if (!token) {
        toast.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        return;
      }

      console.log('✅ بدء جلب جميع البيانات...');
      try {
        setLoadingCurrencies(true);
        const currenciesRes = await get('admin/currencies', token);
        setCurrencies(Array.isArray(currenciesRes) ? currenciesRes : currenciesRes.currencies || currenciesRes.data || []);
      } catch (err) {
        toast.error('فشل جلب العملات.');
      } finally {
        setLoadingCurrencies(false);
      }

      try {
        setLoadingSalespersons(true);
        const salespersonsRes = await get('admin/users', token);
        const reps = (salespersonsRes.users || salespersonsRes.data || []).filter(user =>
          user.type_user === 'retail_rep'
        );
        setSalespersons(reps);
      } catch (err) {
        toast.error('فشل جلب المندوبين.');
      } finally {
        setLoadingSalespersons(false);
      }

      try {
        setLoadingCustomers(true);
        const customersRes = await get('admin/customers', token);
        setCustomers(Array.isArray(customersRes) ? customersRes : customersRes.customers || customersRes.data || []);
      } catch (err) {
        toast.error('فشل جلب العملاء.');
      } finally {
        setLoadingCustomers(false);
      }

      try {
        setLoadingProducts(true);
        const productsRes = await get('admin/products', token);
        const productsData = Array.isArray(productsRes) ? productsRes : productsRes.products || productsRes.data || [];
        setProducts(productsData);
        console.log('✅ تم تحميل المنتجات:', productsData);
      } catch (err) {
        toast.error('فشل جلب المنتجات.');
      } finally {
        setLoadingProducts(false);
      }
    };

    if (show) {
      setIsVisible(true);
      fetchAllData();
    } else {
      setIsVisible(false);
    }
  }, [show, token]);

  // 2. Populating the form when invoice and products are both available
  useEffect(() => {
    if (show && invoice && products.length > 0) {
      console.log('✅ يتم ملء النموذج ببيانات الفاتورة.');
      console.log('🔗 بيانات الفاتورة الأصلية:', invoice);
      console.log('🛒 قائمة المنتجات المتاحة:', products);

      setLoadingInitialData(false);
      setCurrencyId(invoice.currency_id);
      setSalespersonId(invoice.user_id);
      setCustomerId(invoice.customer_id);
      setPaymentType(invoice.payment_type);
      setInvoiceDate(invoice.date);
      setErrors({});

      const items = invoice.items || [];
      const mappedRows = items.map(item => {
        console.log('🔍 معالجة عنصر الفاتورة:', item);
        const product = products.find(p => p.id === item.product_id); // البحث بالـ ID
        console.log('🔎 نتيجة البحث عن المنتج بالـ ID:', product);
        
        // إذا لم يتم العثور عليه، نحاول البحث بالاسم كحل بديل
        if (!product) {
          const productByName = products.find(p => p.name === item.name); // افتراض أن الاسم هو item.name
          console.log('🔎 لم يتم العثور على المنتج بالـ ID، نحاول البحث بالاسم:', productByName);
          if (productByName) {
             return {
              product_id: productByName.id,
              quantity: item.quantity,
              price: item.unit_price,
              name: productByName.name || '',
              unit: productByName.unit || '',
              subtotal: (item.quantity * item.unit_price).toFixed(2),
              original_car_stock_id: item.car_stock_id,
              errors: {}
            };
          }
        }

        return {
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.unit_price,
          name: product ? product.name : item.name || '',
          unit: product ? product.unit : item.unit || '',
          subtotal: (item.quantity * item.unit_price).toFixed(2),
          original_car_stock_id: item.car_stock_id,
          errors: {}
        };
      });

      console.log('📋 الصفوف النهائية التي سيتم عرضها:', mappedRows);
      setProductInputRows(mappedRows);
    } else if (show) {
      setLoadingInitialData(true);
    }
  }, [show, invoice, products]);

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
    console.log('🔔 تم تغيير المندوب إلى ID:', id);
    const selectedSp = salespersons.find(sp => sp.id === id);
    setSalespersonId(id);
    setSelectedSalespersonType(selectedSp ? selectedSp.type_user : null);
    setCustomerId('');
  };

  const handleCurrencyChange = (value) => {
    console.log('🔔 تم تغيير العملة إلى ID:', value);
    setCurrencyId(value);
    setProductInputRows([{ product_id: '', quantity: '', price: '', name: '', unit: '', subtotal: '0.00', errors: {} }]);
    toast.info('تم تغيير العملة. يرجى إعادة إدخال المنتجات.');
  };

  const handleAddRow = () => {
    console.log('➕ إضافة صف جديد.');
    setProductInputRows(prevRows => [
      ...prevRows,
      { product_id: '', quantity: '', price: '', name: '', unit: '', subtotal: '0.00', errors: {} }
    ]);
  };

  const handleRemoveRow = (indexToRemove) => {
    console.log('➖ إزالة الصف ذو الفهرس:', indexToRemove);
    setProductInputRows(prevRows => prevRows.filter((_, index) => index !== indexToRemove));
  };

  const handleProductInputChange = (index, field, value) => {
    console.log(`✏️ تغيير في الصف ${index}: الحقل ${field}، القيمة ${value}`);
    setProductInputRows(prevRows => {
      const newRows = [...prevRows];
      let row = { ...newRows[index] };

      if (field === 'product_id') {
        row.product_id = value;
        row.quantity = '';
        row.subtotal = '0.00';

        const productDetails = products.find(p => p.id === value);
        if (productDetails) {
          row.name = productDetails.name || '';
          row.unit = productDetails.unit || '';
        } else {
          row.name = '';
          row.unit = '';
        }

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

  // دالة handleSubmit
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
          car_stock_id: p.original_car_stock_id
        })),
      };

      const response = await put(`admin/invoices/${invoice.slug}`, payload, token);

     if (response?.status === true) {
  toast.success('تم حفظ التعديلات بنجاح!');
  onClose(true);
} else {
  let serverMessage = response?.message; // ✅ فقط الرسالة
  toast.error(serverMessage);
  setErrors({ general: serverMessage });
}

} catch (err) {
  const errorMessage = err?.message || "حدث خطأ غير متوقع"; // ✅ فقط message
  toast.error(errorMessage);
  setErrors({ general: errorMessage });
} finally {
  setIsLoading(false);
}
  };

  if (loadingInitialData || !invoice) return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title="تعديل فاتورة"
      maxWidth="max-w-4xl"
    >
      <div className="flex justify-center items-center py-10">
        <p className="text-gray-400">جاري تحميل البيانات...</p>
        {debugInfo && <p className="text-gray-500 text-sm mt-2">{debugInfo}</p>}
      </div>
    </ModalWrapper>
  );

  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title="تعديل فاتورة"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right max-h-[80vh] overflow-y-auto">
        {/* Invoice Details Section */}
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

        {/* Products Section */}
        <div className="border border-gray-700 p-3 rounded-lg flex flex-col gap-3 mt-4">
          <h4 className="text-base font-bold border-b border-gray-700 pb-2 mb-2">
            المنتجات في الفاتورة
          </h4>
          <div className="grid grid-cols-invoice-products text-right font-semibold text-gray-400 text-sm border-b border-gray-700 pb-2">
            <div>المنتج</div>
            <div>الكمية</div>
            <div>سعر الوحدة</div>
            <div>الإجمالي</div>
            <div></div>
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
                      isClearable
                    />
                    {row.name && !row.product_id && (
                      <p className="text-xs text-orange-500 mt-1">
                        تحذير: المنتج '{row.name}' غير موجود في القائمة الحالية
                      </p>
                    )}
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

        {/* Grand Total */}
        <div className="text-lg font-bold text-accentColor text-left mt-4 p-2 bg-gray-800 rounded-lg shadow-md">
          الإجمالي الكلي: {grandTotal} {currencies.find(c => c.id === currencyId)?.code || ''}
        </div>

        {errors.general && <p className="text-red-500 text-xs mt-1 text-center">{errors.general}</p>}

        {/* Form Actions */}
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
            {isLoading ? 'جاري حفظ التعديلات...' : 'حفظ التعديلات'}
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