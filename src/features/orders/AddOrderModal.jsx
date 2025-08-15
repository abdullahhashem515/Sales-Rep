import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField";
import SearchableSelectField from "../../components/shared/SearchableSelectField";
import { PlusIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/solid";
import AddProductToOrderModal from './AddProductToOrderModal';
import OrderSummaryModal from './OrderSummaryModal';
import EditProductInOrderModal from './EditProductInOrderModal';
import { toast } from 'react-toastify';
import { post, get } from '../../utils/apiService';

/**
 * مكون مودال لإضافة طلب جديد.
 *
 * @param {object} props
 * @param {boolean} props.show - حالة عرض/إخفاء المودال.
 * @param {function} props.onClose - دالة تستدعى عند إغلاق المودال.
 */
export default function AddOrderModal({ show, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [salespersonId, setSalespersonId] = useState('');
  // حالة لنوع مندوب المبيعات المحدد (مثل 'ws_rep', 'retail_rep')
  const [selectedSalespersonType, setSelectedSalespersonType] = useState(null);
  const [customerId, setCustomerId] = useState(''); // حالة لمعرف العميل المحدد
  const [orderType, setOrderType] = useState('cash'); // الافتراضي نقدي
  const [currencyId, setCurrencyId] = useState('');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(''); // يحمل رمز العملة مثل 'YER'
  const [productsInOrder, setProductsInOrder] = useState([]);
  const [note, setNote] = useState(''); // حالة جديدة لملاحظة الطلب
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]); // حالة جديدة لتاريخ الطلب، الافتراضي هو اليوم

  // حالات للبيانات الفعلية التي تم جلبها من API
  const [salespersons, setSalespersons] = useState([]); // تم التصحيح: استخدام 'salespersons'
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  // حالات التحميل والأخطاء لجلب البيانات
  const [loadingSalespersons, setLoadingSalespersons] = useState(false);
  const [errorSalespersons, setErrorSalespersons] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [errorCustomers, setErrorCustomers] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState(null);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [errorCurrencies, setErrorCurrencies] = useState(null);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false); // لإرسال النموذج
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
  const [currentOrderSummary, setCurrentOrderSummary] = useState(null);
  const [showEditProductInOrderModal, setShowEditProductInOrderModal] = useState(false);
  const [productToEditInOrder, setProductToEditInOrder] = useState(null);

  // دالة مساعدة للحصول على رمز العملة من currency_id
  const getCurrencyCodeById = (id) => {
    return currencies.find(c => c.id === id)?.code || '';
  };

  // جلب جميع البيانات الضرورية عند فتح المودال
  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        return;
      }

      // جلب مندوبي المبيعات
      setLoadingSalespersons(true);
      try {
        const response = await get('admin/users', token);
        const reps = (response.users || response.data || []).filter(user =>
            user.type_user === 'ws_rep' || user.type_user === 'retail_rep'
        );
        setSalespersons(reps);
        console.log("AddOrderModal: Fetched Salespersons:", reps); // سجل مندوبي المبيعات التي تم جلبها
      } catch (err) {
        setErrorSalespersons('فشل جلب المندوبين.');
        console.error("Failed to fetch salespersons:", err);
      } finally {
        setLoadingSalespersons(false);
      }

      // جلب العملاء
      setLoadingCustomers(true);
      try {
        const response = await get('admin/customers', token);
        setCustomers(Array.isArray(response) ? response : response.customers || response.data || []);
      } catch (err) {
        setErrorCustomers('فشل جلب العملاء.');
        console.error("Failed to fetch customers:", err);
      } finally {
        setLoadingCustomers(false);
      }

      // جلب المنتجات
      setLoadingProducts(true);
      try {
        const response = await get('admin/products', token);
        setProducts(Array.isArray(response) ? response : response.products || response.data || []);
      } catch (err) {
        setErrorProducts('فشل جلب المنتجات.');
        console.error("Failed to fetch products:", err);
      } finally {
        setLoadingProducts(false);
      }

      // جلب العملات
      setLoadingCurrencies(true);
      try {
        const response = await get('admin/currencies', token);
        const fetchedCurrencies = Array.isArray(response) ? response : response.currencies || response.data || [];
        setCurrencies(fetchedCurrencies.filter(c => c && typeof c === 'object' && c.id && c.code));
        // تعيين العملة الافتراضية إذا كانت متاحة ولم يتم تعيينها بعد
        if (fetchedCurrencies.length > 0 && !currencyId) {
          setCurrencyId(fetchedCurrencies[0].id);
          setSelectedCurrencyCode(fetchedCurrencies[0].code);
        }
      } catch (err) {
        setErrorCurrencies('فشل جلب العملات.');
        console.error("Failed to fetch currencies:", err);
      } finally {
        setLoadingCurrencies(false);
      }
    };

    if (show) {
      setIsVisible(true);
      // إعادة تعيين حقول النموذج والأخطاء عند فتح المودال
      setSalespersonId('');
      setSelectedSalespersonType(null);
      setCustomerId('');
      setOrderType('cash');
      setCurrencyId('');
      setSelectedCurrencyCode('');
      setProductsInOrder([]);
      setNote(''); // إعادة تعيين الملاحظة
      setOrderDate(new Date().toISOString().split('T')[0]); // إعادة تعيين تاريخ الطلب إلى اليوم
      setErrors({});
      setIsLoading(false);
      setCurrentOrderSummary(null);
      setShowEditProductInOrderModal(false);
      setProductToEditInOrder(null);

      fetchAllData(); // استدعاء دالة الجلب غير المتزامنة
    } else {
      setIsVisible(false);
    }
  }, [show]); // إعادة التشغيل فقط عندما تتغير 'show'

  // حساب المبلغ الإجمالي للطلب
  const totalOrderAmount = useMemo(() => {
    return productsInOrder.reduce((sum, product) => sum + product.total, 0);
  }, [productsInOrder]);

  const salespersonOptions = useMemo(() => {
    // تم التصحيح: استخدام 'salespersons' هنا
    return salespersons.map(sp => ({ value: sp.id, label: `${sp.name} (${sp.type_user === 'ws_rep' ? 'مندوب جملة' : 'مندوب تجزئة'})`, type_user: sp.type_user }));
  }, [salespersons]); // تم التصحيح: استخدام 'salespersons' هنا

  // جديد: تصفية خيارات العملاء بناءً على مندوب المبيعات المحدد
  const filteredCustomerOptions = useMemo(() => {
    if (selectedSalespersonType === 'ws_rep' && salespersonId) {
      // بافتراض أن مصفوفة 'customers' تحتوي على خاصية 'user_id' ترتبط بمعرف مندوب المبيعات
      // قد تحتاج إلى تعديل 'customer.user_id' بناءً على بنية استجابة الواجهة الخلفية الفعلية للعملاء
      const associatedCustomers = customers.filter(cust => cust.user_id === salespersonId);
      return associatedCustomers.map(c => ({ value: c.id, label: c.name }));
    }
    return []; // لا يوجد عملاء لمندوب التجزئة، أو لم يتم اختيار مندوب
  }, [customers, salespersonId, selectedSalespersonType]);

  // إصلاح لخطأ "Unexpected token, expected '...'" : حساب خيارات العملة مسبقًا باستخدام concat
  const currencySelectOptions = useMemo(() => {
    const defaultOption = {
      value: '',
      label: (loadingCurrencies ? 'جاري التحميل...' : (errorCurrencies ? 'خطأ في التحميل' : 'اختر عملة...'))
    };
    // التأكد من أن currencies هي مصفوفة قبل التعيين
    const mappedCurrencies = Array.isArray(currencies) ? currencies.map(c => ({ value: c.id, label: `${c.name} (${c.code})` })) : [];
    // استخدام concat بدلاً من spread لتجنب مشاكل محتملة في المحول البرمجي
    return [defaultOption].concat(mappedCurrencies);
  }, [currencies, loadingCurrencies, errorCurrencies]); // إضافة حالات التحميل/الخطأ كاعتمادات أيضًا، لتحديث التسمية

  const handleSalespersonChange = (e) => {
    const selectedId = parseInt(e.target.value); // تحويل إلى رقم
    const selectedSp = salespersons.find(sp => sp.id === selectedId);
    setSalespersonId(selectedId);
    setSelectedSalespersonType(selectedSp ? selectedSp.type_user : null); // تعيين النوع
    console.log("AddOrderModal: Selected Salesperson ID:", selectedId);
    console.log("AddOrderModal: Selected Salesperson Object:", selectedSp);
    console.log("AddOrderModal: Selected Salesperson Type (after update):", selectedSp ? selectedSp.type_user : null);

    // إذا تم اختيار مندوب تجزئة، قم بمسح حقل العميل لأنه سيتم إخفاؤه
    // قم أيضًا بمسح customerId عند تغيير مندوب المبيعات، لإعادة تقييم خيارات العميل
    setCustomerId('');
  };

  // جديد: التأكد من تحليل customerId كرقم صحيح
  const handleCustomerChange = (e) => {
    setCustomerId(parseInt(e.target.value));
  };

  const handleCurrencyChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const currency = currencies.find(c => c.id === selectedId);
    setCurrencyId(selectedId);
    setSelectedCurrencyCode(currency ? currency.code : '');
    // مسح المنتجات إذا تغيرت العملة، حيث قد تكون الأسعار مختلفة
    if (productsInOrder.length > 0) {
      toast.info('تم مسح المنتجات لأن العملة تغيرت. يرجى إعادة إضافة المنتجات بالعملة الجديدة.');
      setProductsInOrder([]);
    }
  };

  const handleAddProductClick = () => {
    if (!currencyId) {
      toast.error('الرجاء اختيار عملة الطلب أولاً.');
      return;
    }
    setShowAddProductModal(true);
  };

  const handleRemoveProduct = (productIdToRemove) => {
    setProductsInOrder(prevProducts => prevProducts.filter(p => p.product_id !== productIdToRemove));
  };

  const handleAddProductConfirm = (newProduct) => {
    const existingProductIndex = productsInOrder.findIndex(p => p.product_id === newProduct.product_id);
    if (existingProductIndex > -1) {
      setProductsInOrder(prevProducts => prevProducts.map((p, index) =>
        index === existingProductIndex
          ? { ...p, quantity: p.quantity + newProduct.quantity, total: p.total + newProduct.total }
          : p
      ));
      toast.info(`تم تحديث كمية المنتج "${newProduct.name}".`);
    } else {
      setProductsInOrder(prevProducts => [...prevProducts, newProduct]);
      toast.success(`تم إضافة المنتج "${newProduct.name}" بنجاح!`);
    }
    setShowAddProductModal(false);
  };

  // معالج لفتح مودال تعديل المنتج في الطلب
  const handleEditProductInOrderClick = (product) => {
    setProductToEditInOrder(product);
    setShowEditProductInOrderModal(true);
  };

  // معالج لتأكيد التحديث من EditProductInOrderModal
  const handleUpdateProductInOrderConfirm = (updatedProduct) => {
    setProductsInOrder(prevProducts =>
      prevProducts.map(p =>
        p.product_id === updatedProduct.product_id ? updatedProduct : p
      )
    );
    toast.success(`تم تحديث المنتج "${updatedProduct.name}" بنجاح!`);
    setShowEditProductInOrderModal(false);
    setProductToEditInOrder(null); // مسح المنتج الذي تم تعديله
  };

  const handleViewOrderSummary = () => {
    if (productsInOrder.length === 0) {
      toast.info('لا توجد منتجات في الطلب لعرض الملخص.');
      return;
    }
    if (!salespersonId) {
      toast.error('الرجاء اختيار مندوب مبيعات لعرض الملخص.');
      return;
    }
    // تحقق شرطي من معرف العميل للملخص
    if (selectedSalespersonType === 'ws_rep' && !customerId) {
      toast.error('الرجاء اختيار عميل لمندوب الجملة لعرض الملخص.');
      return;
    }
    if (!currencyId) {
      toast.error('الرجاء اختيار عملة الطلب لعرض الملخص.');
      return;
    }

    const salespersonName = salespersons.find(sp => sp.id === salespersonId)?.name || 'غير محدد';
    const customerName = customers.find(cust => cust.id === customerId)?.name || 'N/A'; // الحصول على اسم العميل

    setCurrentOrderSummary({
      products: productsInOrder,
      totalAmount: totalOrderAmount,
      currencyCode: selectedCurrencyCode,
      orderType: orderType,
      salespersonName: salespersonName,
      customerName: selectedSalespersonType === 'ws_rep' ? customerName : 'لا ينطبق', // تمرير اسم العميل شرطيا
    });
    setShowOrderSummaryModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let currentErrors = {};

    if (!salespersonId) {
      currentErrors.salespersonId = 'الرجاء اختيار مندوب مبيعات.';
    }
    // التحقق الشرطي من معرف العميل
    if (selectedSalespersonType === 'ws_rep' && !customerId) {
      currentErrors.customerId = 'الرجاء اختيار عميل لمندوب الجملة.';
    }
    if (!currencyId) {
      currentErrors.currencyId = 'الرجاء اختيار عملة للطلب.';
    }
    if (productsInOrder.length === 0) {
      currentErrors.products = 'يجب إضافة منتج واحد على الأقل للطلب.';
    }
    if (!orderDate) { // تاريخ الطلب مطلوب أيضًا من الواجهة الخلفية
        currentErrors.orderDate = 'الرجاء تحديد تاريخ الطلب.';
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
        setErrors({ general: 'لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.' });
        toast.error('لا يوجد رمز مصادقة.');
        setIsLoading(false);
        return;
      }

      let endpoint = '';
      let payload = {};

      // تحديد نقطة نهاية API والحمولة بناءً على نوع مندوب المبيعات
      if (selectedSalespersonType === 'retail_rep') {
        endpoint = 'admin/shipment-requests'; // نقطة النهاية لطلبات شحن مندوب التجزئة
        payload = {
          user_id: salespersonId,
          payment_type: orderType, // يتطابق مع 'type' في حالتك الحالية
          shipment_date: orderDate, // يتطابق مع 'orderDate' في حالتك الحالية
          total_cost: parseFloat(totalOrderAmount.toFixed(2)),
          items: productsInOrder.map(p => ({
            product_id: parseInt(p.product_id),
            quantity: p.quantity,
            unit_price: parseFloat(p.unit_price) // تم إضافة unit_price كما هو مطلوب من الخطأ
          })),
          note: note || null, // اختياري
          // customer_id و currency_id ليسا مطلوبين صراحةً بواسطة مثال الواجهة الخلفية لطلبات الشحن،
          // ولكن إذا كانت هناك حاجة إليهما، فيجب إضافتهما هنا.
          // customer_id: customerId || null,
          // currency_id: currencyId || null,
        };
        toast.info('جاري إنشاء طلب شحن لمندوب التجزئة...');
      } else if (selectedSalespersonType === 'ws_rep') {
        endpoint = 'admin/orders'; // نقطة النهاية لطلبات مندوب الجملة
        payload = {
          user_id: salespersonId,
          customer_id: customerId, // العميل مطلوب لطلبات الجملة
          type: orderType,
          currency_id: currencyId,
          status: "pending", // دائمًا معلق عند الإنشاء للطلبات
          note: note,
          order_date: orderDate,
          total_cost: parseFloat(totalOrderAmount.toFixed(2)),
          products: productsInOrder.map(p => ({
            product_id: parseInt(p.product_id),
            name: p.name,
            quantity: p.quantity,
            unit_price: parseFloat(p.unit_price),
            total: parseFloat(p.total),
          })),
        };
        toast.info('جاري إنشاء طلب لمندوب الجملة...');
      } else {
        // احتياطي أو خطأ إذا كان نوع مندوب المبيعات غير معروف/غير محدد
        setErrors({ general: 'الرجاء اختيار مندوب مبيعات صالح لتحديد نوع الطلب.' });
        toast.error('نوع المندوب غير صالح. لا يمكن تحديد نقطة النهاية.');
        setIsLoading(false);
        return;
      }

      console.log("AddOrderModal: Sending payload to API:", payload);
      console.log("AddOrderModal: Using endpoint:", endpoint);

      const response = await post(endpoint, payload, token);

      console.log("AddOrderModal: API response for POST:", response);

      if (response.status) {
        toast.success(`تم إنشاء الطلب بنجاح! ${response.order_number ? `رقم الطلب: ${response.order_number}` : ''}`);
        onClose(true); // إغلاق المودال وإشارة إلى النجاح
      } else {
        const apiErrorMessage = response.message || 'فشل إنشاء الطلب.';
        setErrors({ general: apiErrorMessage });
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("AddOrderModal: Caught error during POST:", err);
      let errorMessage = err.message || 'حدث خطأ غير متوقع عند إنشاء الطلب.';
      
      // محاولة تحليل أخطاء التحقق من الواجهة الخلفية إذا كانت متاحة (مثل حالة 422)
      if (err.response && err.response.status === 422 && err.response.data && err.response.data.errors) {
        const backendErrors = err.response.data.errors;
        console.log("AddOrderModal: Backend validation errors:", backendErrors); // جديد: سجل أخطاء الواجهة الخلفية
        let detailedErrors = {};
        if (backendErrors.user_id) detailedErrors.salespersonId = backendErrors.user_id[0];
        if (backendErrors.customer_id) detailedErrors.customerId = backendErrors.customer_id[0];
        if (backendErrors.currency_id) detailedErrors.currencyId = backendErrors.currency_id[0];
        if (backendErrors.items) detailedErrors.products = backendErrors.items[0]; // خطأ 'items' ينطبق على قائمة المنتجات
        if (backendErrors.note) detailedErrors.note = backendErrors.note[0];
        if (backendErrors.shipment_date) detailedErrors.orderDate = backendErrors.shipment_date[0]; // لمندوب التجزئة
        if (backendErrors.order_date) detailedErrors.orderDate = backendErrors.order_date[0]; // لمندوب الجملة
        if (backendErrors.payment_type) detailedErrors.orderType = backendErrors.payment_type[0]; // لمندوب التجزئة
        if (backendErrors.total_cost) detailedErrors.general = backendErrors.total_cost[0];
        
        setErrors(detailedErrors);
        errorMessage = 'فشل التحقق: يرجى مراجعة الحقول المدخلة.';
      } else if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      }

      setErrors(prev => ({ ...prev, general: errorMessage })); // تعيين خطأ عام
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)} // تمرير false عند الإغلاق
      isVisible={isVisible}
      title="إضافة طلب جديد"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        {/* شبكة معدلة للتعامل مع 4 أعمدة عندما يكون حقل العميل مرئياً */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormSelectField
            label="نوع الطلب"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            options={[{ value: 'cash', label: 'نقدي' }, { value: 'credit', label: 'آجل' }]}
            error={errors.orderType}
          />
          <FormSelectField
            label="المندوب"
            value={salespersonId}
            onChange={handleSalespersonChange} // استخدام المعالج الجديد
            options={[{ value: '', label: (loadingSalespersons ? 'جاري التحميل...' : (errorSalespersons ? 'خطأ في التحميل' : 'اختر مندوب...')) }, ...salespersonOptions]}
            error={errors.salespersonId}
            disabled={loadingSalespersons || !!errorSalespersons}
          />
          {/* حقل العميل الشرطي */}
          {selectedSalespersonType === 'ws_rep' && (
            <FormSelectField
              label="العميل"
              value={customerId}
              onChange={handleCustomerChange} // جديد: استخدام handleCustomerChange
              options={[{ value: '', label: (loadingCustomers ? 'جاري التحميل...' : (errorCustomers ? 'خطأ في التحميل' : 'اختر عميل...')) }, ...filteredCustomerOptions]}
              error={errors.customerId}
              disabled={loadingCustomers || !!errorCustomers || !salespersonId}
            />
          )}
          {/* عرض حقل العملة دائمًا */}
          <FormSelectField
            label="العملة"
            value={currencyId}
            onChange={handleCurrencyChange}
            options={currencySelectOptions}
            error={errors.currencyId}
            disabled={loadingCurrencies || !!errorCurrencies}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInputField
                label="ملاحظات"
                type="text"
                placeholder="أدخل أي ملاحظات حول الطلب (اختياري)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                error={errors.note}
            />
            <FormInputField
                label="تاريخ الطلب"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                error={errors.orderDate}
            />
        </div>

        <div className="border border-gray-700 p-4 rounded-lg flex flex-col gap-3">
          <h4 className="text-lg font-bold border-b border-gray-700 pb-2 mb-2">
            المنتجات في الطلب
            <span className="text-sm font-normal text-gray-400 mr-2">
                ({selectedCurrencyCode ? `العملة الحالية: ${selectedCurrencyCode}` : 'لم يتم اختيار عملة'})
            </span>
          </h4>

          <div className="max-h-32 overflow-y-auto pr-2">
            {productsInOrder.length > 0 ? (
              productsInOrder.map((product) => (
                <div key={product.product_id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{product.name}</p>
                    <p className="text-gray-300 text-sm">
                      الكمية: {product.quantity} - سعر الوحدة: {product.unit_price?.toFixed(2) || 'N/A'} {selectedCurrencyCode}
                      {product.price_type && ` (${product.price_type === 'general' ? 'عام' : product.price_type === 'wholesale' ? 'جملة' : product.price_type === 'retail' ? 'تجزئة' : product.price_type})`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-accentColor text-lg">{product.total?.toFixed(2) || 'N/A'} {selectedCurrencyCode}</p>
                    <button
                      type="button"
                      onClick={() => handleEditProductInOrderClick(product)}
                      className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-full flex-shrink-0"
                      title="تعديل المنتج"
                    >
                      <PencilIcon className="w-5 h-5 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(product.product_id)}
                      className="bg-red-500 hover:bg-red-600 p-2 rounded-full flex-shrink-0"
                      title="حذف المنتج"
                    >
                      <XMarkIcon className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">لا توجد منتجات في الطلب بعد.</p>
            )}
          </div>

          {errors.products && <p className="text-red-500 text-xs mt-1 text-center">{errors.products}</p>}

          <button
            type="button"
            onClick={handleAddProductClick}
            className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded flex items-center justify-center gap-1 mt-3"
            disabled={loadingProducts || !!errorProducts || !selectedCurrencyCode} // تعطيل إذا كانت المنتجات/العملات قيد التحميل أو غير محددة
          >
            <PlusIcon className="w-5 h-5 text-white" />
            <span>إضافة منتج</span>
          </button>
        </div>

        <div className="mt-4 text-left border-t border-gray-700 pt-3">
          <h4 className="text-2xl font-bold">
            الإجمالي الكلي للطلب: {totalOrderAmount.toFixed(2)} {selectedCurrencyCode}
          </h4>
        </div>

        {errors.general && <p className="text-red-500 text-xs mt-1 text-center">{errors.general}</p>}

        <div className="flex justify-between gap-3 mt-4">
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
            className="accentColor hover:bg-purple-700 py-2 px-4 rounded flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'جاري إنشاء الطلب...' : 'إنشاء الطلب'}
          </button>
          <button
            type="button"
            onClick={handleViewOrderSummary}
            className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded flex-1"
            disabled={isLoading || productsInOrder.length === 0 || !salespersonId || !currencyId || (selectedSalespersonType === 'ws_rep' && !customerId)}
          >
            عرض ملخص الطلبية
          </button>
        </div>
      </form>

      {/* مودال إضافة منتج للطلب */}
      <AddProductToOrderModal
        show={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAddProductConfirm={handleAddProductConfirm}
        availableProducts={products} // تمرير المنتجات الفعلية التي تم جلبها
        selectedCurrencyCode={selectedCurrencyCode}
        orderType={orderType}
        salespersonType={selectedSalespersonType} // تمرير نوع مندوب المبيعات لمنطق التسعير
      />

      {/* مودال ملخص الطلب */}
      <OrderSummaryModal
        show={showOrderSummaryModal}
        onClose={() => setShowOrderSummaryModal(false)}
        orderSummary={currentOrderSummary}
      />

      {/* مودال تعديل المنتج في الطلب */}
      <EditProductInOrderModal
        show={showEditProductInOrderModal}
        onClose={() => setShowEditProductInOrderModal(false)}
        onUpdateProductConfirm={handleUpdateProductInOrderConfirm}
        productToEdit={productToEditInOrder}
        allAvailableProducts={products} // تمرير جميع المنتجات المتاحة للبحث عن السعر
        selectedCurrencyCode={selectedCurrencyCode}
        orderType={orderType}
        salespersonType={selectedSalespersonType} // تمرير نوع مندوب المبيعات لمنطق التسعير
      />
    </ModalWrapper>
  );
}
