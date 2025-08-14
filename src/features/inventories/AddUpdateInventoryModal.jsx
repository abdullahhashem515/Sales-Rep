import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import SearchableSelectField from "../../components/shared/SearchableSelectField"; // For salesman and product
import { toast } from 'react-toastify';
import { post, put, get } from '../../utils/apiService'; // Keep for future API connection

/**
 * مكون مودال موحد لإضافة أو تعديل عنصر في المخزون.
 *
 * @param {object} props
 * @param {boolean} props.show - لتحديد ما إذا كان المودال مرئيًا.
 * @param {function} props.onClose - دالة لاستدعائها عند إغلاق المودال.
 * @param {object} [props.itemToEdit] - كائن عنصر المخزون الذي سيتم تعديله. إذا كان فارغًا، فهو وضع إضافة.
 */
export default function AddUpdateInventoryModal({ show, onClose, itemToEdit }) {
  const [isVisible, setIsVisible] = useState(false);
  const [salesmanId, setSalesmanId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(''); // Allow manual price entry for now
  const [currencyCode, setCurrencyCode] = useState(''); // Allow manual currency selection

  const [salesmen, setSalesmen] = useState([]);
  const [products, setProducts] = useState([]);
  const [currencies, setCurrencies] = useState([]); // To populate currency dropdown

  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalItemData, setOriginalItemData] = useState(null); // To detect changes in edit mode

  // Dummy Data for dropdowns (should align with data in Visitslist and AddOrder)
  const dummySalesmen = useMemo(() => ([
    { label: 'أحمد (مندوب جملة)', value: 'rep_001', type_user: 'ws_rep' },
    { label: 'سارة (مندوب تجزئة)', value: 'rep_002', type_user: 'retail_rep' },
    { label: 'علي (مندوب جملة)', value: 'rep_003', type_user: 'ws_rep' },
    { label: 'فاطمة (مندوب تجزئة)', value: 'rep_004', type_user: 'retail_rep' },
  ]), []);

  const dummyProducts = useMemo(() => ([
    {
      id: 'PROD001',
      name: 'أرز المجد 10 كجم',
      category_name: 'حبوب',
      unit: 'كجم',
      prices_by_currency: {
        'YER': [{ price: 7500.25, type_user: 'general' }, { price: 7000.00, type_user: 'wholesale' }],
        'USD': [{ price: 15.00, type_user: 'general' }, { price: 14.00, type_user: 'wholesale' }]
      }
    },
    {
      id: 'PROD002',
      name: 'زيت طبخ 3 لتر',
      category_name: 'زيوت',
      unit: 'لتر',
      prices_by_currency: {
        'YER': [{ price: 5000.00, type_user: 'general' }, { price: 4800.00, type_user: 'wholesale' }],
        'USD': [{ price: 10.00, type_user: 'general' }, { price: 9.50, type_user: 'wholesale' }]
      }
    },
    {
      id: 'PROD003',
      name: 'سكر 5 كجم',
      category_name: 'سكر',
      unit: 'كجم',
      prices_by_currency: {
        'YER': [{ price: 2500.00, type_user: 'general' }, { price: 2300.00, type_user: 'wholesale' }],
        'USD': [{ price: 5.00, type_user: 'general' }, { price: 4.50, type_user: 'wholesale' }]
      }
    },
    // ... more dummy products if needed
  ]), []);

  const dummyCurrencies = useMemo(() => ([
    { id: 1, name: 'ريال يمني', code: 'YER' },
    { id: 2, name: 'دولار أمريكي', code: 'USD' },
    { id: 3, name: 'ريال سعودي', code: 'SAR' },
  ]), []);


  // Fetch Dummy Salesmen, Products, and Currencies on modal open
  useEffect(() => {
    if (show) {
      setLoadingDropdowns(true);
      setTimeout(() => {
        setSalesmen(dummySalesmen);
        setProducts(dummyProducts);
        setCurrencies(dummyCurrencies);
        setLoadingDropdowns(false);
      }, 500); // Simulate network delay
    }
  }, [show, dummySalesmen, dummyProducts, dummyCurrencies]);

  // Populate form fields when modal opens or itemToEdit changes
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setErrors({});
      setIsLoading(false);

      if (itemToEdit) {
        setIsEditMode(true);
        setSalesmanId(itemToEdit.salesman_id || '');
        setProductId(itemToEdit.product_id || '');
        setQuantity(String(itemToEdit.quantity || '')); // Convert to string for input field
        setPrice(String(itemToEdit.price || '')); // Convert to string for input field
        setCurrencyCode(itemToEdit.currency_code || '');

        setOriginalItemData({
          salesman_id: itemToEdit.salesman_id || '',
          product_id: itemToEdit.product_id || '',
          quantity: String(itemToEdit.quantity || ''),
          price: String(itemToEdit.price || ''),
          currency_code: itemToEdit.currency_code || '',
        });
      } else {
        setIsEditMode(false);
        setSalesmanId('');
        setProductId('');
        setQuantity('');
        setPrice('');
        setCurrencyCode(dummyCurrencies[0]?.code || ''); // Default to first available currency
        setOriginalItemData(null);
      }
    } else {
      setIsVisible(false);
      setTimeout(() => {
        setSalesmanId('');
        setProductId('');
        setQuantity('');
        setPrice('');
        setCurrencyCode('');
        setErrors({});
        setIsLoading(false);
        setIsEditMode(false);
        setOriginalItemData(null);
      }, 100);
    }
  }, [show, itemToEdit, dummyCurrencies]);

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
    if (!productId) {
      currentErrors.productId = 'يجب اختيار منتج.';
    }
    if (!quantity.trim()) {
      currentErrors.quantity = 'الكمية مطلوبة.';
    } else if (isNaN(parseFloat(quantity)) || parseFloat(quantity) <= 0) {
      currentErrors.quantity = 'الكمية يجب أن تكون رقماً أكبر من صفر.';
    }
    if (!price.trim()) {
      currentErrors.price = 'السعر مطلوب.';
    } else if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      currentErrors.price = 'السعر يجب أن يكون رقماً غير سالب.';
    }
    if (!currencyCode.trim()) {
        currentErrors.currencyCode = 'العملة مطلوبة.';
    }


    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      toast.error('يرجى تصحيح الأخطاء في النموذج.');
      return;
    }

    setIsLoading(true);

    try {
      // NOTE: API calls are commented out for now.
      // This part will be uncommented and adapted when connecting to the real API.
      /*
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        setIsLoading(false);
        return;
      }
      */

      const payload = {
        salesman_id: salesmanId,
        product_id: productId,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        currency_code: currencyCode,
      };

      let response;
      if (isEditMode && itemToEdit) {
        let hasChanges = false;
        if (
          payload.salesman_id !== originalItemData.salesman_id ||
          payload.customer_id !== originalItemData.customer_id ||
          payload.type !== originalItemData.type ||
          payload.purpose !== originalItemData.purpose ||
          payload.date !== originalItemData.date
        ) {
          hasChanges = true;
        }

        if (!hasChanges) {
          toast.info('لم يتم إجراء أي تغييرات للحفظ.');
          handleClose(true);
          return;
        }
        
        console.log("Update Inventory Item Payload (simulated):", payload);
        // response = await put(`admin/inventory/${itemToEdit.inventory_id}`, payload, token); // Uncomment for API
        // Simulate successful response for now
        response = { status: true, message: 'Simulated update success' };
      } else {
        console.log("Add Inventory Item Payload (simulated):", payload);
        // response = await post('admin/inventory', payload, token); // Uncomment for API
        // Simulate successful response for now
        response = { status: true, message: 'Simulated add success' };
      }

      if (response.status) {
        toast.success(isEditMode ? 'تم تحديث عنصر المخزون بنجاح (محاكاة)!' : 'تم إضافة عنصر المخزون بنجاح (محاكاة)!');
        handleClose(true);
      } else {
        const apiErrorMessage = response.message || 'فشل العملية (محاكاة).';
        setErrors({ general: apiErrorMessage });
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("Error submitting inventory item data (simulated):", err);
      const errorMessage = err.message || 'حدث خطأ غير متوقع (محاكاة). يرجى المحاولة مرة أخرى.';
      
      // Keep error handling for API connection
      if (err.status === 422 && err.response?.data?.errors) {
        const backendErrors = err.response.data.errors;
        let newErrors = {};
        if (backendErrors.salesman_id) newErrors.salesmanId = backendErrors.salesman_id[0];
        if (backendErrors.product_id) newErrors.productId = backendErrors.product_id[0];
        if (backendErrors.quantity) newErrors.quantity = backendErrors.quantity[0];
        if (backendErrors.price) newErrors.price = backendErrors.price[0];
        if (backendErrors.currency_code) newErrors.currencyCode = backendErrors.currency_code[0];
        setErrors(newErrors);
        toast.error('يرجى تصحيح الأخطاء في النموذج (من الباك إند المحاكي).');
      } else {
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
        handleClose(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getSalesmanLabel = (id) => {
    return salesmen.find(s => s.value === id)?.label || '';
  };

  const getProductLabel = (id) => {
    return products.find(p => p.id === id)?.name || '';
  };

  const salesmanOptions = salesmen.map(s => s.label);
  const productOptions = products.map(p => p.name);
  const currencyOptions = currencies.map(c => ({ label: c.code, value: c.code }));


  if (!show) return null;

  return (
    <ModalWrapper
      show={show}
      onClose={() => handleClose(false)}
      isVisible={isVisible}
      title={isEditMode ? `تعديل عنصر المخزون: ${itemToEdit?.inventory_id || ''}` : "إضافة عنصر مخزون جديد"}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right max-h-[calc(100vh-120px)] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelectField
            label="اسم المندوب"
            value={isEditMode ? getSalesmanLabel(salesmanId) : salesmanId}
            onChange={(selectedLabel) => {
                const selected = salesmen.find(s => s.label === selectedLabel);
                setSalesmanId(selected ? selected.value : '');
            }}
            options={salesmanOptions}
            error={errors.salesmanId}
            placeholder={loadingDropdowns ? "جاري تحميل المندوبين..." : "ابحث أو اختر مندوب"}
            // Disable salesman selection in edit mode if it's not allowed by API
            disabled={isEditMode} 
          />
          <SearchableSelectField
            label="اسم المنتج"
            value={isEditMode ? getProductLabel(productId) : productId}
            onChange={(selectedLabel) => {
                const selected = products.find(p => p.name === selectedLabel);
                setProductId(selected ? selected.id : '');
                // Attempt to auto-fill price and currency if product selected
                if (selected && selected.prices_by_currency && Object.keys(selected.prices_by_currency).length > 0) {
                    const defaultCurrency = currencies.find(c => c.code === 'YER') || currencies[0];
                    if (defaultCurrency) {
                        setCurrencyCode(defaultCurrency.code);
                        const priceForDefaultCurrency = selected.prices_by_currency[defaultCurrency.code];
                        if (priceForDefaultCurrency && priceForDefaultCurrency.length > 0) {
                            // Prioritize wholesale if exists for sales_rep, else general, else first
                            const repType = salesmen.find(s => s.value === salesmanId)?.type_user;
                            let chosenPrice = null;
                            if (repType === 'ws_rep') {
                                chosenPrice = priceForDefaultCurrency.find(p => p.type_user === 'wholesale');
                            } else if (repType === 'retail_rep') {
                                chosenPrice = priceForDefaultCurrency.find(p => p.type_user === 'retail');
                            }
                            if (!chosenPrice) { // Fallback to general or first available
                                chosenPrice = priceForDefaultCurrency.find(p => p.type_user === 'general') || priceForDefaultCurrency[0];
                            }
                            setPrice(String(chosenPrice?.price || ''));
                        } else {
                            setPrice('');
                        }
                    }
                } else {
                    setPrice('');
                }
            }}
            options={productOptions}
            error={errors.productId}
            placeholder={loadingDropdowns ? "جاري تحميل المنتجات..." : "ابحث أو اختر منتج"}
            // Disable product selection in edit mode if it's not allowed by API
            disabled={isEditMode}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInputField
                label="الكمية"
                type="number"
                placeholder="أدخل الكمية"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                error={errors.quantity}
            />
            <FormInputField
                label="السعر"
                type="number"
                placeholder="أدخل السعر"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={errors.price}
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelectField
                label="العملة"
                value={currencyCode}
                onChange={(e) => setCurrencyCode(e.target.value)}
                options={currencyOptions}
                error={errors.currencyCode}
            />
            {/* Empty div to maintain layout consistency if needed */}
            <div className="flex-1"></div> 
        </div>

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
            {isLoading ? (isEditMode ? 'جاري حفظ التعديل...' : 'جاري الإضافة...') : (isEditMode ? 'حفظ التعديل' : 'إضافة عنصر مخزون')}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
