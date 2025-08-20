import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField";
import { PlusIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/solid";
import AddProductToOrderModal from './AddProductToOrderModal';
import OrderSummaryModal from './OrderSummaryModal';
import EditProductInOrderModal from './EditProductInOrderModal';
import { toast } from 'react-toastify';
import { post, get } from '../../utils/apiService';
import SearchableSelectField from "../../components/shared/SearchableSelectField";

export default function AddOrderModal({ show, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [salespersonId, setSalespersonId] = useState('');
  const [selectedSalespersonType, setSelectedSalespersonType] = useState(null);
  const [customerId, setCustomerId] = useState('');
  const [productsInOrder, setProductsInOrder] = useState([]);
  const [note, setNote] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);

  const [salespersons, setSalespersons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingSalespersons, setLoadingSalespersons] = useState(false);
  const [errorSalespersons, setErrorSalespersons] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [errorCustomers, setErrorCustomers] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState(null);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
  const [currentOrderSummary, setCurrentOrderSummary] = useState(null);
  const [showEditProductInOrderModal, setShowEditProductInOrderModal] = useState(false);
  const [productToEditInOrder, setProductToEditInOrder] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        return;
      }

      setLoadingSalespersons(true);
      try {
        const response = await get('admin/users', token);
        const reps = (response.users || response.data || []).filter(user =>
          user.type_user === 'ws_rep' || user.type_user === 'retail_rep'
        );
        setSalespersons(reps);
      } catch (err) {
        setErrorSalespersons('فشل جلب المندوبين.');
        console.error("Failed to fetch salespersons:", err);
      } finally {
        setLoadingSalespersons(false);
      }

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
    };

    if (show) {
      setIsVisible(true);
      setSalespersonId('');
      setSelectedSalespersonType(null);
      setCustomerId('');
      setProductsInOrder([]);
      setNote('');
      setOrderDate(new Date().toISOString().split('T')[0]);
      setErrors({});
      setIsLoading(false);
      setCurrentOrderSummary(null);
      setShowEditProductInOrderModal(false);
      setProductToEditInOrder(null);

      fetchAllData();
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const salespersonOptions = useMemo(() => {
    return salespersons.map(sp => ({
      value: sp.id,
      label: `${sp.name} (${sp.type_user === 'ws_rep' ? 'مندوب جملة' : 'مندوب تجزئة'})`,
      type_user: sp.type_user
    }));
  }, [salespersons]);

  const filteredCustomerOptions = useMemo(() => {
    if (selectedSalespersonType === 'ws_rep' && salespersonId) {
      const associatedCustomers = customers.filter(cust => cust.user_id === salespersonId);
      return associatedCustomers.map(c => ({ value: c.id, label: c.name }));
    }
    return [];
  }, [customers, salespersonId, selectedSalespersonType]);

  const handleSalespersonChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedSp = salespersons.find(sp => sp.id === selectedId);
    setSalespersonId(selectedId);
    setSelectedSalespersonType(selectedSp ? selectedSp.type_user : null);
    setCustomerId('');
  };

  const handleCustomerChange = (e) => {
    setCustomerId(parseInt(e.target.value));
  };

  const handleAddProductClick = () => {
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
          ? { ...p, quantity: p.quantity + newProduct.quantity }
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

  const handleViewOrderSummary = () => {
    if (productsInOrder.length === 0) {
      toast.info('لا توجد منتجات في الطلب لعرض الملخص.');
      return;
    }
    if (!salespersonId) {
      toast.error('الرجاء اختيار مندوب مبيعات لعرض الملخص.');
      return;
    }
    if (selectedSalespersonType === 'ws_rep' && !customerId) {
      toast.error('الرجاء اختيار عميل لمندوب الجملة لعرض الملخص.');
      return;
    }

    const salespersonName = salespersons.find(sp => sp.id === salespersonId)?.name || 'غير محدد';
    const customerName = customers.find(cust => cust.id === customerId)?.name || 'N/A';

    setCurrentOrderSummary({
      products: productsInOrder,
      salespersonName: salespersonName,
      customerName: selectedSalespersonType === 'ws_rep' ? customerName : 'لا ينطبق',
    });
    setShowOrderSummaryModal(true);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setErrors({});
  let currentErrors = {};

  if (!salespersonId) currentErrors.salespersonId = 'الرجاء اختيار مندوب مبيعات.';
  if (selectedSalespersonType === 'ws_rep' && !customerId) currentErrors.customerId = 'الرجاء اختيار عميل لمندوب الجملة.';
  if (productsInOrder.length === 0) currentErrors.products = 'يجب إضافة منتج واحد على الأقل للطلب.';
  if (!orderDate) currentErrors.orderDate = 'الرجاء تحديد تاريخ الطلب.';

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

    if (selectedSalespersonType === 'retail_rep') {
      endpoint = 'admin/shipment-requests';
      payload = {
        user_id: salespersonId,
        shipment_date: orderDate,
        items: productsInOrder.map(p => ({ product_id: parseInt(p.product_id), quantity: p.quantity })),
        note: note || null,
      };
    } else if (selectedSalespersonType === 'ws_rep') {
      endpoint = 'admin/orders';
      payload = {
        user_id: salespersonId,
        customer_id: customerId,
        note: note,
        order_date: orderDate,
        items: productsInOrder.map(p => ({ product_id: parseInt(p.product_id), quantity: p.quantity })),
      };
    } else {
      setErrors({ general: 'الرجاء اختيار مندوب مبيعات صالح لتحديد نوع الطلب.' });
      toast.error('نوع المندوب غير صالح.');
      setIsLoading(false);
      return;
    }
const response = await post(endpoint, payload, token);
console.log("API Response:", response);

// الاعتماد على status لتحديد النجاح، لكن عرض رسالتك الثابتة
if (response?.status === true) {
  toast.success(`تم إنشاء الطلبية بنجاح!`); // <-- رسالتك الثابتة هنا
  onClose(true);
} else {
  const apiErrorMessage = response?.message || 'حدث خطأ غير متوقع عند إنشاء الطلب.';
  setErrors({ general: apiErrorMessage });
  toast.error(apiErrorMessage); // تعرض خطأ السيرفر فقط عند الفشل
}


  } catch (err) {
    console.error("AddOrderModal: Caught error during POST:", err);
    setErrors({ general: 'حدث خطأ غير متوقع عند إنشاء الطلب.' });
    toast.error('حدث خطأ غير متوقع عند إنشاء الطلب.');
  } finally {
    setIsLoading(false);
  }
};


  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title="إضافة طلب جديد"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SearchableSelectField
  label="المندوب"
  value={salespersonId}
  onChange={(id) => {
    const sp = salespersons.find(s => s.id === id);
    setSalespersonId(id);
    setSelectedSalespersonType(sp?.type_user || null);
    setCustomerId('');
  }}
  options={salespersons.map(sp => ({
    value: sp.id,
    label: `${sp.name} (${sp.type_user === 'ws_rep' ? 'مندوب جملة' : 'مندوب تجزئة'})`
  }))}
  placeholder={loadingSalespersons ? 'جاري التحميل...' : 'اختر مندوب...'}
  error={errors.salespersonId}
/>

{selectedSalespersonType === 'ws_rep' && (
  <SearchableSelectField
    label="العميل"
    value={customerId}
    onChange={setCustomerId}
    options={filteredCustomerOptions.map(c => ({
      value: c.value,
      label: c.label
    }))}
    placeholder={loadingCustomers ? 'جاري التحميل...' : 'اختر عميل...'}
    error={errors.customerId}
/>
)}

          <FormInputField
            label="تاريخ الطلب"
            type="date"
            value={new Date().toISOString().split("T")[0]}
            readOnly
          />

          <FormInputField
            label="ملاحظات"
            type="text"
            placeholder=" ملاحظات حول الطلب "
            value={note}
            onChange={(e) => setNote(e.target.value)}
            error={errors.note}
          />
        </div>

        <div className="border border-gray-700 p-3 rounded-lg flex flex-col gap-3 mt-4">
          <h4 className="text-lg font-bold border-b border-gray-700 pb-2 mb-2">
            المنتجات في الطلب
          </h4>
          <div className="max-h-48 overflow-y-auto pr-2">
            {productsInOrder.length > 0 ? (
              productsInOrder.map((product) => (
                <div
                  key={product.product_id}
                  className="flex justify-between items-center bg-gray-700 p-2 rounded-md mb-2"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{product.name} {product.unit}</p>
                    <p className="text-gray-300 text-sm">الكمية: {product.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
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
              <p className="text-gray-400 text-center py-4">
                لا توجد منتجات في الطلب بعد.
              </p>
            )}
          </div>

          {errors.products && (
            <p className="text-red-500 text-xs mt-1 text-center">{errors.products}</p>
          )}

          <button
            type="button"
            onClick={handleAddProductClick}
            className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded flex items-center justify-center gap-1 mt-3"
            disabled={loadingProducts || !!errorProducts}
          >
            <PlusIcon className="w-5 h-5 text-white" />
            <span>إضافة منتج</span>
          </button>
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
            disabled={isLoading || productsInOrder.length === 0 || !salespersonId || (selectedSalespersonType === 'ws_rep' && !customerId)}
          >
            عرض ملخص الطلبية
          </button>
        </div>
      </form>

      <AddProductToOrderModal
        show={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAddProductConfirm={handleAddProductConfirm}
        availableProducts={products}
        salespersonType={selectedSalespersonType}
      />

      <OrderSummaryModal
        show={showOrderSummaryModal}
        onClose={() => setShowOrderSummaryModal(false)}
        orderSummary={currentOrderSummary}
      />

      <EditProductInOrderModal
        show={showEditProductInOrderModal}
        onClose={() => setShowEditProductInOrderModal(false)}
        onUpdateProductConfirm={handleUpdateProductInOrderConfirm}
        productToEdit={productToEditInOrder}
        allAvailableProducts={products}
        salespersonType={selectedSalespersonType}
      />
    </ModalWrapper>
  );
}
