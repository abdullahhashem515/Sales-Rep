import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField";
import SearchableSelectField from "../../components/shared/SearchableSelectField"; 
import { PlusIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/solid"; 
import AddProductToOrderModal from './AddProductToOrderModal';
import EditProductInOrderModal from './EditProductInOrderModal'; 
import { toast } from 'react-toastify';
import { put, get } from '../../utils/apiService';

/**
 * مكون مودال لتعديل طلب موجود.
 *
 * @param {object} props
 * @param {boolean} props.show - حالة عرض/إخفاء المودال.
 * @param {function} props.onClose - دالة تستدعى عند إغلاق المودال.
 * @param {object} props.orderToEdit - كائن الطلب الذي سيتم تعديله.
 */
export default function UpdateOrderModal({ show, onClose, orderToEdit }) {
  const [isVisible, setIsVisible] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [salespersonId, setSalespersonId] = useState('');
  const [selectedSalespersonType, setSelectedSalespersonType] = useState(null); 
  const [orderType, setOrderType] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState('');
  const [productsInOrder, setProductsInOrder] = useState([]);
  const [orderStatus, setOrderStatus] = useState(''); 
  const [orderNotes, setOrderNotes] = useState(''); 
  const [originalOrderData, setOriginalOrderData] = useState(null); 

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductInOrderModal, setShowEditProductInOrderModal] = useState(false); 
  const [productToEditInOrder, setProductToEditInOrder] = useState(null); 

  // Dummy Data (should be fetched from API in a real app)
  const dummySalespersons = useMemo(() => ([
    { id: 'USER001', name: 'أحمد (مندوب جملة)', type_user: 'ws_rep' },
    { id: 'USER002', name: 'سارة (مندوب تجزئة)', type_user: 'retail_rep' },
    { id: 'USER003', name: 'علي (مندوب جملة)', type_user: 'ws_rep' },
  ]), []);

  const dummyCustomers = useMemo(() => ([
    { id: 'CUST001', name: 'المتجر الكبير' },
    { id: 'CUST002', name: 'بقالة الأمانة' },
    { id: 'CUST003', name: 'سوبر ماركت السلام' },
    { id: 'CUST004', name: 'عميل التجزئة أ' },
    { id: 'CUST005', name: 'عميل التجزئة ب' },
  ]), []);

  const dummyProducts = useMemo(() => ([
    {
      id: 'PROD001',
      name: 'أرز المجد 10 كجم',
      prices_by_currency: {
        'YER': [{ price: 7500.25, type_user: 'general' }, { price: 7000.00, type_user: 'wholesale' }]
      }
    },
    {
      id: 'PROD002',
      name: 'زيت طبخ 3 لتر',
      prices_by_currency: {
        'YER': [{ price: 5000.00, type_user: 'general' }, { price: 4800.00, type_user: 'wholesale' }]
      }
    },
    {
      id: 'PROD003',
      name: 'سكر 5 كجم',
      prices_by_currency: {
        'YER': [{ price: 2500.00, type_user: 'general' }, { price: 2300.00, type_user: 'wholesale' }]
      }
    },
    {
      id: 'PROD004',
      name: 'شاي الربيع 100 كيس',
      prices_by_currency: {
        'YER': [{ price: 4000.25, type_user: 'general' }, { price: 3800.00, type_user: 'wholesale' }]
      }
    },
    {
      id: 'PROD005',
      name: 'مياه صحية 20 لتر',
      prices_by_currency: {
        'YER': [{ price: 600.00, type_user: 'general' }, { price: 550.00, type_user: 'wholesale' }]
      }
    },
  ]), []);

  const dummyCurrencies = useMemo(() => ([
    { id: 1, name: 'ريال يمني', code: 'YER' },
    { id: 2, name: 'دولار أمريكي', code: 'USD' },
    { id: 3, name: 'ريال سعودي', code: 'SAR' },
  ]), []);

  // Helper to get currency code from currency_id
  const getCurrencyCodeById = (id) => {
    return dummyCurrencies.find(c => c.id === id)?.code || 'N/A';
  };

  // Helper to get salesperson type from user_id
  const getSalespersonTypeById = (userId) => {
    return dummySalespersons.find(sp => sp.id === userId)?.type_user || null;
  };

  // Populate form fields when orderToEdit changes
  useEffect(() => {
    if (show && orderToEdit) {
      setIsVisible(true);
      setCustomerId(orderToEdit.customer_id || '');
      setSalespersonId(orderToEdit.user_id || '');
      setSelectedSalespersonType(getSalespersonTypeById(orderToEdit.user_id)); 
      setOrderType(orderToEdit.type || 'cash');
      setCurrencyId(orderToEdit.currency_id || '');
      setSelectedCurrencyCode(getCurrencyCodeById(orderToEdit.currency_id));
      // Ensure products are deep-copied to avoid direct mutation of props
      setProductsInOrder(orderToEdit.products ? JSON.parse(JSON.stringify(orderToEdit.products)) : []); 
      setOrderStatus(orderToEdit.status || '');
      setOrderNotes(orderToEdit.notes || '');

      setOriginalOrderData({
        customer_id: orderToEdit.customer_id || '',
        user_id: orderToEdit.user_id || '',
        type: orderToEdit.type || 'cash',
        currency_id: orderToEdit.currency_id || '',
        products: orderToEdit.products ? JSON.parse(JSON.stringify(orderToEdit.products)) : [], 
      });
      setErrors({});
      setIsLoading(false);
      setShowEditProductInOrderModal(false); 
      setProductToEditInOrder(null); 
    } else if (!show) {
      // Reset when modal is truly closed
      setCustomerId('');
      setSalespersonId('');
      setSelectedSalespersonType(null); 
      setOrderType('cash');
      setCurrencyId('');
      setSelectedCurrencyCode('');
      setProductsInOrder([]);
      setOrderStatus('');
      setOrderNotes('');
      setOriginalOrderData(null);
      setErrors({});
      setIsLoading(false);
    }
  }, [show, orderToEdit, dummyCurrencies, dummySalespersons]); 

  // Calculate total order amount
  const totalOrderAmount = useMemo(() => {
    return productsInOrder.reduce((sum, product) => sum + product.total, 0);
  }, [productsInOrder]);

  const salespersonOptions = useMemo(() => {
    return dummySalespersons.map(sp => ({ value: sp.id, label: sp.name, type_user: sp.type_user }));
  }, [dummySalespersons]);

  const customerOptions = useMemo(() => {
    return dummyCustomers.map(c => ({ value: c.id, label: c.name }));
  }, [dummyCustomers]);

  const currencyOptions = useMemo(() => {
    return dummyCurrencies.map(c => ({ value: c.id, label: `${c.name} (${c.code})` }));
  }, [dummyCurrencies]);

  const handleSalespersonChange = (e) => {
    const selectedId = e.target.value;
    const selectedSp = dummySalespersons.find(sp => sp.id === selectedId);
    setSalespersonId(selectedId);
    setSelectedSalespersonType(selectedSp ? selectedSp.type_user : null);

    if (selectedSp?.type_user === 'retail_rep') {
      setCustomerId('');
    }
  };

  const handleCurrencyChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const currency = dummyCurrencies.find(c => c.id === selectedId);
    setCurrencyId(selectedId);
    setSelectedCurrencyCode(currency ? currency.code : '');
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

  const handleEditProductInOrderClick = (product) => {
    setProductToEditInOrder(product);
    setShowEditProductInOrderModal(true);
  };

  const handleUpdateProductInOrderConfirm = (updatedProduct) => {
    setProductsInOrder(prevProducts =>
      prevProducts.map(p =>
        p.product_id === updatedProduct.product_id ? updatedProduct : p
      )
    );
    toast.success(`تم تحديث المنتج "${updatedProduct.name}" بنجاح!`);
    setShowEditProductInOrderModal(false);
    setProductToEditInOrder(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let currentErrors = {};

    if (!salespersonId) {
      currentErrors.salespersonId = 'الرجاء اختيار مندوب مبيعات.';
    }
    if (selectedSalespersonType === 'ws_rep' && !customerId) { 
      currentErrors.customerId = 'الرجاء اختيار عميل لمندوب الجملة.';
    }
    if (!currencyId) {
      currentErrors.currencyId = 'الرجاء اختيار عملة للطلب.';
    }
    if (productsInOrder.length === 0) {
      currentErrors.products = 'يجب إضافة منتج واحد على الأقل للطلب.';
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

      const updatedPayload = {
        customer_id: selectedSalespersonType === 'ws_rep' ? customerId : null, // Send customer_id only for wholesale reps
        user_id: salespersonId,
        type: orderType,
        currency_id: currencyId,
        products: productsInOrder.map(p => ({
          product_id: p.product_id,
          name: p.name,
          quantity: p.quantity,
          unit_price: p.unit_price,
          total: p.total,
          price_type: p.price_type 
        }))
      };

      let hasChanges = false;
      if (originalOrderData) {
        // Create copies to sort for comparison
        const originalProductsSorted = [...originalOrderData.products].sort((a, b) => a.product_id.localeCompare(b.product_id));
        const currentProductsSorted = [...updatedPayload.products].sort((a, b) => a.product_id.localeCompare(b.product_id));

        if (
          originalOrderData.customer_id !== updatedPayload.customer_id ||
          originalOrderData.user_id !== updatedPayload.user_id ||
          originalOrderData.type !== updatedPayload.type ||
          originalOrderData.currency_id !== updatedPayload.currency_id ||
          JSON.stringify(originalProductsSorted) !== JSON.stringify(currentProductsSorted)
        ) {
          hasChanges = true;
        }
      }

      if (!hasChanges) {
        toast.info('لم يتم إجراء أي تغييرات للحفظ.');
        onClose(true); 
        setIsLoading(false);
        return;
      }

      console.log("UpdateOrderModal: Sending payload to API:", updatedPayload);

      await new Promise(resolve => setTimeout(resolve, 700));
      const response = { status: true, message: 'Order updated successfully!' };

      if (response.status) {
        toast.success(`تم تحديث الطلب رقم ${orderToEdit.order_id} بنجاح!`);
        onClose(true); 
      } else {
        const apiErrorMessage = response.message || 'فشل تحديث الطلب.';
        setErrors({ general: apiErrorMessage });
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("UpdateOrderModal: Caught error during PUT:", err);
      const errorMessage = err.message || 'حدث خطأ غير متوقع عند تحديث الطلب.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title={`تعديل الطلب رقم: ${orderToEdit?.order_id || ''}`}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3 text-right">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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
            onChange={handleSalespersonChange} 
            options={[{ value: '', label: 'اختر مندوب...' }, ...salespersonOptions]}
            error={errors.salespersonId}
          />
          {/* Conditional Customer Field - shows if selectedSalespersonType is 'ws_rep' */}
          {selectedSalespersonType === 'ws_rep' && (
            <FormSelectField
              label="العميل"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              options={[{ value: '', label: 'اختر عميل...' }, ...customerOptions]}
              error={errors.customerId}
            />
          )}
          <FormSelectField
            label="العملة"
            value={currencyId}
            onChange={handleCurrencyChange}
            options={currencyOptions}
            error={errors.currencyId}
          />
        </div>

        {/* Products in Order Section */}
        <div className="border border-gray-700 p-3 rounded-lg flex flex-col gap-2">
          <h4 className="text-lg font-bold border-b border-gray-700 pb-1 mb-1">
            المنتجات في الطلب
            <span className="text-sm font-normal text-gray-400 mr-1">
                ({selectedCurrencyCode ? `العملة الحالية: ${selectedCurrencyCode}` : 'لم يتم اختيار عملة'})
            </span>
          </h4>
          
          <div className="max-h-32 overflow-y-auto pr-1">
            {productsInOrder.length > 0 ? (
              productsInOrder.map((product) => (
                <div key={product.product_id} className="flex justify-between items-center bg-gray-700 p-2 rounded-md mb-1">
                  <div className="flex-1">
                    <p className="font-semibold text-base">{product.name}</p>
                    <p className="text-gray-300 text-xs">
                      الكمية: {product.quantity} - سعر الوحدة: {typeof product.unit_price === 'number' ? product.unit_price.toFixed(2) : 'N/A'} {selectedCurrencyCode}
                      {product.price_type && ` (${product.price_type === 'general' ? 'عام' : product.price_type === 'wholesale' ? 'جملة' : product.price_type})`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-accentColor text-base">{typeof product.total === 'number' ? product.total.toFixed(2) : (0).toFixed(2)} {selectedCurrencyCode}</p>
                    <button
                      type="button"
                      onClick={() => handleEditProductInOrderClick(product)}
                      className="bg-yellow-500 hover:bg-yellow-600 p-1 rounded-full flex-shrink-0" 
                      title="تعديل المنتج"
                    >
                      <PencilIcon className="w-4 h-4 text-white" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(product.product_id)}
                      className="bg-red-500 hover:bg-red-600 p-1 rounded-full flex-shrink-0" 
                      title="حذف المنتج"
                    >
                      <XMarkIcon className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-3 text-sm">لا توجد منتجات في الطلب بعد.</p>
            )}
          </div>

          {errors.products && <p className="text-red-500 text-xs mt-1 text-center">{errors.products}</p>}

          <button
            type="button"
            onClick={handleAddProductClick}
            className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded flex items-center justify-center gap-1 mt-2"
          >
            <PlusIcon className="w-5 h-5 text-white" />
            <span>إضافة منتج</span>
          </button>
        </div>

        {/* Current Order Status & Notes (Read-only) - Moved to bottom before buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormInputField
                label="حالة الطلب الحالية"
                type="text"
                value={
                    orderStatus === 'pending' ? 'معلق' :
                    orderStatus === 'approved' ? 'موافق' :
                    orderStatus === 'rejected' ? 'مرفوض' : orderStatus
                }
                readOnly
                className="pointer-events-none opacity-70"
            />
            <FormInputField
                label="ملاحظات الطلب الحالية"
                type="textarea"
                value={orderNotes || 'لا توجد ملاحظات'}
                readOnly
                rows={2}
                className="pointer-events-none opacity-70"
            />
        </div>

        {/* Total Order Amount */}
        <div className="mt-3 text-left border-t border-gray-700 pt-2">
          <h4 className="text-xl font-bold">
            الإجمالي الكلي للطلب: {totalOrderAmount.toFixed(2)} {selectedCurrencyCode}
          </h4>
        </div>

        {errors.general && <p className="text-red-500 text-xs mt-1 text-center">{errors.general}</p>}

        <div className="flex justify-between gap-2 mt-3">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="bg-gray-600 hover:bg-gray-700 py-2 px-3 rounded flex-1 text-sm"
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="accentColor hover:bg-purple-700 py-2 px-3 rounded flex-1 text-sm"
            disabled={isLoading}
          >
            {isLoading ? 'جاري حفظ التعديل...' : 'حفظ التعديل'}
          </button>
        </div>
      </form>

      {/* Add Product To Order Modal */}
      <AddProductToOrderModal
        show={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAddProductConfirm={handleAddProductConfirm}
        availableProducts={dummyProducts}
        selectedCurrencyCode={selectedCurrencyCode}
        orderType={orderType}
        salespersonType={selectedSalespersonType} 
      />

  
      <EditProductInOrderModal
        show={showEditProductInOrderModal}
        onClose={() => setShowEditProductInOrderModal(false)}
        onUpdateProductConfirm={handleUpdateProductInOrderConfirm}
        productToEdit={productToEditInOrder}
        allAvailableProducts={dummyProducts}
        selectedCurrencyCode={selectedCurrencyCode}
        orderType={orderType}
        salespersonType={selectedSalespersonType} 
      />
    </ModalWrapper>
  );
}
