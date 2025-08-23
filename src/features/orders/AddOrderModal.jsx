import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import { PlusIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/solid";
import AddProductToOrderModal from "./AddProductToOrderModal";
import OrderSummaryModal from "./OrderSummaryModal";
import EditProductInOrderModal from "./EditProductInOrderModal";
import { toast } from "react-toastify";
import { post, get } from "../../utils/apiService";
import SearchableSelectFieldV3 from "../../components/shared/SearchableSelectFieldV3";
import CustomerSelectField from "../../components/shared/CustomerSelectField";
import SalespersonSelectField from '../../components/shared/SalespersonSelectField';

export default function AddOrderModal({ show, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [salespersonId, setSalespersonId] = useState("");
  const [selectedSalespersonType, setSelectedSalespersonType] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [productsInOrder, setProductsInOrder] = useState([]);
  const [note, setNote] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);

  const [salespersons, setSalespersons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loadingSalespersons, setLoadingSalespersons] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
  const [currentOrderSummary, setCurrentOrderSummary] = useState(null);
  const [showEditProductInOrderModal, setShowEditProductInOrderModal] = useState(false);
  const [productToEditInOrder, setProductToEditInOrder] = useState(null);

  // جلب البيانات
  useEffect(() => {
    if (!show) return setIsVisible(false);

    setIsVisible(true);
    setSalespersonId("");
    setSelectedSalespersonType(null);
    setCustomerId("");
    setProductsInOrder([]);
    setNote("");
    setOrderDate(new Date().toISOString().split("T")[0]);
    setErrors({});
    setIsLoading(false);
    setCurrentOrderSummary(null);
    setShowEditProductInOrderModal(false);
    setProductToEditInOrder(null);

    const fetchAllData = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return toast.error("لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.");

      // المندوبين
      setLoadingSalespersons(true);
      try {
        const response = await get("admin/users", token);
        const reps = (response.users || response.data || []).filter(
          (user) => user.type_user === "ws_rep" || user.type_user === "retail_rep"
        );
        setSalespersons(reps);
      } catch (err) {
        console.error(err);
        toast.error("فشل جلب المندوبين.");
      } finally {
        setLoadingSalespersons(false);
      }

      // العملاء
      setLoadingCustomers(true);
      try {
        const response = await get("admin/customers", token);
        setCustomers(Array.isArray(response) ? response : response.customers || response.data || []);
      } catch (err) {
        console.error(err);
        toast.error("فشل جلب العملاء.");
      } finally {
        setLoadingCustomers(false);
      }

      // المنتجات
      setLoadingProducts(true);
      try {
        const response = await get("admin/products", token);
        setProducts(Array.isArray(response) ? response : response.products || response.data || []);
      } catch (err) {
        console.error(err);
        toast.error("فشل جلب المنتجات.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchAllData();
  }, [show]);

  const salespersonOptions = useMemo(
    () =>
      salespersons.map((sp) => ({
        value: sp.id,
        label: `${sp.name} (${sp.type_user === "ws_rep" ? "مندوب جملة" : "مندوب تجزئة"})`,
        type_user: sp.type_user,
      })),
    [salespersons]
  );

  const filteredCustomerOptions = useMemo(() => {
    if (selectedSalespersonType === "ws_rep" && salespersonId) {
      return customers
        .filter((c) => c.user_id === salespersonId)
        .map((c) => ({ value: c.id, label: c.name }));
    }
    return [];
  }, [customers, salespersonId, selectedSalespersonType]);

  // إضافة وتعديل وحذف المنتجات
  const handleAddProductConfirm = (newProduct) => {
    const index = productsInOrder.findIndex((p) => p.product_id === newProduct.product_id);
    if (index > -1) {
      setProductsInOrder((prev) =>
        prev.map((p, i) => (i === index ? { ...p, quantity: p.quantity + newProduct.quantity } : p))
      );
      toast.info(`تم تحديث كمية المنتج "${newProduct.name}".`);
    } else setProductsInOrder((prev) => [...prev, newProduct]);
    setShowAddProductModal(false);
  };

  const handleEditProductInOrderClick = (product) => {
    setProductToEditInOrder(product);
    setShowEditProductInOrderModal(true);
  };

  const handleUpdateProductInOrderConfirm = (updatedProduct) => {
    setProductsInOrder((prev) =>
      prev.map((p) => (p.product_id === updatedProduct.product_id ? updatedProduct : p))
    );
    toast.success(`تم تحديث المنتج "${updatedProduct.name}" بنجاح!`);
    setShowEditProductInOrderModal(false);
    setProductToEditInOrder(null);
  };

  const handleRemoveProduct = (productId) => {
    setProductsInOrder((prev) => prev.filter((p) => p.product_id !== productId));
  };

  const handleViewOrderSummary = () => {
    if (!salespersonId) return toast.error("الرجاء اختيار مندوب مبيعات.");
    if (selectedSalespersonType === "ws_rep" && !customerId) return toast.error("الرجاء اختيار عميل لمندوب الجملة.");
    if (productsInOrder.length === 0) return toast.info("لا توجد منتجات في الطلب لعرض الملخص.");

    const salespersonName = salespersons.find((sp) => sp.id === salespersonId)?.name || "غير محدد";
    const customerName = customers.find((c) => c.id === customerId)?.name || "N/A";

    setCurrentOrderSummary({
      products: productsInOrder,
      salespersonName,
      customerName: selectedSalespersonType === "ws_rep" ? customerName : "لا ينطبق",
    });
    setShowOrderSummaryModal(true);
  };

  // الإرسال
  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentErrors = {};
    if (!salespersonId || !selectedSalespersonType)
      currentErrors.salespersonId = "الرجاء اختيار مندوب مبيعات صالح لتحديد نوع الطلب.";
    if (selectedSalespersonType === "ws_rep" && !customerId)
      currentErrors.customerId = "الرجاء اختيار عميل لمندوب الجملة.";
    if (productsInOrder.length === 0) currentErrors.products = "يجب إضافة منتج واحد على الأقل للطلب.";

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return toast.error("يرجى تصحيح الأخطاء في النموذج.");
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("لا يوجد رمز مصادقة.");

      let endpoint = "";
      let payload = {};

      if (selectedSalespersonType === "retail_rep") {
        endpoint = "admin/shipment-requests";
        payload = {
          user_id: salespersonId,
          shipment_date: orderDate,
          items: productsInOrder.map((p) => ({ product_id: parseInt(p.product_id), quantity: p.quantity })),
          note: note || null,
        };
      } else {
        endpoint = "admin/orders";
        payload = {
          user_id: salespersonId,
          customer_id: customerId,
          note,
          order_date: orderDate,
          items: productsInOrder.map((p) => ({ product_id: parseInt(p.product_id), quantity: p.quantity })),
        };
      }

      const response = await post(endpoint, payload, token);
      if (response?.status) {
        toast.success("تم إنشاء الطلبية بنجاح!");
        onClose(true);
      } else {
        const msg = response?.message || "حدث خطأ غير متوقع عند إنشاء الطلب.";
        setErrors({ general: msg });
        toast.error(msg);
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: "حدث خطأ غير متوقع عند إنشاء الطلب." });
      toast.error("حدث خطأ غير متوقع عند إنشاء الطلب.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper show={show} onClose={() => onClose(false)} isVisible={isVisible} title="إضافة طلب جديد" maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <SalespersonSelectField
  label="المندوب"
  value={salespersonId
    ? salespersonOptions.find((sp) => sp.value === salespersonId)
    : null
  }
  onChange={(option) => {
    setSalespersonId(option?.value || "");
    setSelectedSalespersonType(option?.type_user || null);
    setCustomerId("");
  }}
  options={salespersonOptions}
  placeholder={loadingSalespersons ? "جاري التحميل..." : "اختر مندوب..."}
  error={errors.salespersonId}
  isClearable
/>


          {selectedSalespersonType === "ws_rep" && (
            <CustomerSelectField
              label="العميل"
              value={customers.find((c) => c.id === customerId) || null}
              onChange={(opt) => setCustomerId(opt?.value || "")}
              options={filteredCustomerOptions}
              error={errors.customerId}
            />
          )}

          <FormInputField label="تاريخ الطلب" type="date" value={orderDate} readOnly />
          <FormInputField label="ملاحظات" type="text" placeholder="ملاحظات حول الطلب" value={note} onChange={(e) => setNote(e.target.value)} error={errors.note} />
        </div>

        {/* منتجات الطلب */}
        <div className="border border-gray-700 p-3 rounded-lg flex flex-col gap-3 mt-4">
          <h4 className="text-lg font-bold border-b border-gray-700 pb-2 mb-2">المنتجات في الطلب</h4>
          <div className="max-h-48 overflow-y-auto pr-2">
            {productsInOrder.length > 0 ? (
              productsInOrder.map((product) => (
                <div key={product.product_id} className="flex justify-between items-center bg-gray-700 p-2 rounded-md mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{product.name || "بدون اسم"} {product.unit || ""}</p>
                    <p className="text-gray-300 text-sm">الكمية: {product.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => handleEditProductInOrderClick(product)} className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-full flex-shrink-0" title="تعديل المنتج">
                      <PencilIcon className="w-5 h-5 text-white" />
                    </button>
                    <button type="button" onClick={() => handleRemoveProduct(product.product_id)} className="bg-red-500 hover:bg-red-600 p-2 rounded-full flex-shrink-0" title="حذف المنتج">
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

          <button type="button" onClick={() => setShowAddProductModal(true)} className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded flex items-center justify-center gap-1 mt-3" disabled={loadingProducts}>
            <PlusIcon className="w-5 h-5 text-white" /> إضافة منتج
          </button>
        </div>

        {errors.general && <p className="text-red-500 text-xs mt-1 text-center">{errors.general}</p>}

        <div className="flex justify-between gap-3 mt-4">
          <button type="button" onClick={() => onClose(false)} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded flex-1" disabled={isLoading}>إلغاء</button>
          <button type="submit" className="accentColor hover:bg-purple-700 py-2 px-4 rounded flex-1" disabled={isLoading}>{isLoading ? "جاري إنشاء الطلب..." : "إنشاء الطلب"}</button>
          <button type="button" onClick={handleViewOrderSummary} className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded flex-1" disabled={isLoading || productsInOrder.length === 0 || !salespersonId || (selectedSalespersonType === "ws_rep" && !customerId)}>عرض ملخص الطلبية</button>
        </div>
      </form>

      <AddProductToOrderModal show={showAddProductModal} onClose={() => setShowAddProductModal(false)} onAddProductConfirm={handleAddProductConfirm} availableProducts={products} salespersonType={selectedSalespersonType} />

      <OrderSummaryModal show={showOrderSummaryModal} onClose={() => setShowOrderSummaryModal(false)} orderSummary={currentOrderSummary} />

      <EditProductInOrderModal show={showEditProductInOrderModal} onClose={() => setShowEditProductInOrderModal(false)} onUpdateProductConfirm={handleUpdateProductInOrderConfirm} productToEdit={productToEditInOrder} allAvailableProducts={products} salespersonType={selectedSalespersonType} />
    </ModalWrapper>
  );
}
