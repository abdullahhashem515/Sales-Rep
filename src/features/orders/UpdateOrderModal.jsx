import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import { PlusIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/solid";
import AddProductToOrderModal from "./AddProductToOrderModal";
import EditProductInOrderModal from "./EditProductInOrderModal";
import OrderSummaryModal from "./OrderSummaryModal";
import { toast } from "react-toastify";
import { put, get } from "../../utils/apiService";

import SalespersonSelectField from "../../components/shared/SalespersonSelectField";
import CustomerSelectField from "../../components/shared/CustomerSelectField";

export default function UpdateOrderModal({ show, onClose, orderToEdit }) {
  const [isVisible, setIsVisible] = useState(false);
  const [orderData, setOrderData] = useState({});

  const [salespersonId, setSalespersonId] = useState("");
  const [selectedSalespersonType, setSelectedSalespersonType] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [selectedCustomerObject, setSelectedCustomerObject] = useState(null);
  const [productsInOrder, setProductsInOrder] = useState([]);
  const [orderNotes, setOrderNotes] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [orderStatus, setOrderStatus] = useState("");

  const [salespersons, setSalespersons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [fetchingOrder, setFetchingOrder] = useState(false);

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductInOrderModal, setShowEditProductInOrderModal] =
    useState(false);
  const [productToEditInOrder, setProductToEditInOrder] = useState(null);

  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
  const [currentOrderSummary, setCurrentOrderSummary] = useState(null);

  useEffect(() => {
    if (!show) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const token = localStorage.getItem("userToken");
        if (!token) {
          toast.error("انتهت صلاحية الجلسة");
          return;
        }

        const salesRes = await get("admin/users", token);
        const reps = (salesRes.users || salesRes.data || []).filter(
          (user) =>
            user.type_user === "ws_rep" || user.type_user === "retail_rep"
        );
        setSalespersons(reps);

        const custRes = await get("admin/customers", token);
        setCustomers(
          Array.isArray(custRes) ? custRes : custRes.customers || custRes.data || []
        );

        const prodRes = await get("admin/products", token);
        setProducts(
          Array.isArray(prodRes) ? prodRes : prodRes.products || prodRes.data || []
        );
      } catch (err) {
        toast.error("حدث خطأ أثناء جلب البيانات الأساسية");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [show]);

  useEffect(() => {
    if (!show || !orderToEdit || !orderToEdit.slug || loadingData) return;

    const fetchOrder = async () => {
      setFetchingOrder(true);
      try {
        const token = localStorage.getItem("userToken");
        
        // التعديل هنا: استخدام خاصية type_order لتحديد المسار الصحيح
        const endpoint = orderToEdit.type_order === "retail"
          ? `admin/shipment-requests/${orderToEdit.slug}`
          : `admin/orders/${orderToEdit.slug}`;
        
        const response = await get(endpoint, token);
        
        const fetchedData = response.data || response["shipment-Request"];

        if (!response.status || !fetchedData) {
          throw new Error(response.message || "فشل في جلب بيانات الطلب");
        }

        const fetchedOrder = fetchedData;
        setOrderData(fetchedOrder);
        setIsVisible(true);

        const spId = Number(fetchedOrder.user_id || "");
        setSalespersonId(spId);

        const spType =
          salespersons.find((sp) => sp.id === spId)?.type_user ||
          fetchedOrder.user?.type_user ||
          null;
        setSelectedSalespersonType(spType);

        if (fetchedOrder.customer) {
          const customerObj = customers.find(c => c.id === fetchedOrder.customer.id);
          setCustomerId(customerObj ? customerObj.id : null);
          setSelectedCustomerObject(customerObj ? { value: customerObj.id, label: customerObj.name } : null);
        } else {
          setCustomerId(null);
          setSelectedCustomerObject(null);
        }
        
        setProductsInOrder(
          fetchedOrder.items
            ? fetchedOrder.items.map((p) => ({
                product_id: p.product_id,
                quantity: Number(p.quantity),
                name: p.name,
                unit: p.unit || "",
              }))
            : []
        );

        setOrderStatus(fetchedOrder.status || "");
        setOrderNotes(fetchedOrder.note || "");
        setOrderDate(
          fetchedOrder.order_date || fetchedOrder.shipment_date || new Date().toISOString().split("T")[0]
        );
        setErrors({});
      } catch (err) {
        console.error("Failed to fetch order details:", err);
        toast.error("فشل في جلب بيانات الطلب: " + err.message);
        onClose(false);
      } finally {
        setFetchingOrder(false);
      }
    };

    if (orderToEdit.slug && !loadingData) {
      fetchOrder();
    }
  }, [show, orderToEdit, salespersons, customers, loadingData, onClose]);

  const salespersonOptions = useMemo(
    () =>
      salespersons.map((sp) => ({
        value: sp.id,
        label: `${sp.name} (${sp.type_user === "ws_rep" ? "مندوب جملة" : "مندوب تجزئة"})`,
        type_user: sp.type_user,
      })),
    [salespersons]
  );

  const customerOptions = useMemo(() => {
    if (selectedSalespersonType === "ws_rep" && salespersonId) {
      return customers
        .filter((c) => c.user_id === salespersonId)
        .map((c) => ({ value: c.id, label: c.name }));
    }
    return [];
  }, [customers, salespersonId, selectedSalespersonType]);

  const handleAddProductClick = () => setShowAddProductModal(true);
  const handleRemoveProduct = (id) =>
    setProductsInOrder((prev) => prev.filter((p) => p.product_id !== id));

  const handleAddProductConfirm = (newProduct) => {
    const exists = productsInOrder.find((p) => p.product_id === newProduct.product_id);
    if (exists) {
      setProductsInOrder((prev) =>
        prev.map((p) =>
          p.product_id === newProduct.product_id
            ? { ...p, quantity: p.quantity + newProduct.quantity }
            : p
        )
      );
      toast.info(`تم تحديث كمية المنتج "${newProduct.name}"`);
    } else {
      setProductsInOrder((prev) => [...prev, newProduct]);
      toast.success(`تم إضافة المنتج "${newProduct.name}"`);
    }
    setShowAddProductModal(false);
  };

  const handleEditProductInOrderClick = (product) => {
    setProductToEditInOrder(product);
    setShowEditProductInOrderModal(true);
  };

  const handleUpdateProductInOrderConfirm = (updatedProduct) => {
    setProductsInOrder((prev) =>
      prev.map((p) =>
        p.product_id === updatedProduct.product_id ? updatedProduct : p
      )
    );
    toast.success(`تم تحديث المنتج "${updatedProduct.name}"`);
    setShowEditProductInOrderModal(false);
    setProductToEditInOrder(null);
  };

  const handleViewOrderSummary = () => {
    if (!salespersonId || (selectedSalespersonType === "ws_rep" && !customerId)) {
      toast.error("الرجاء اختيار مندوب صالح وعميل إذا كان طلب جملة");
      return;
    }
    if (productsInOrder.length === 0) {
      toast.info("لا توجد منتجات في الطلب لعرض الملخص");
      return;
    }

    const salespersonName = salespersons.find((sp) => sp.id === salespersonId)?.name || "غير محدد";
    const customerName = customers.find((c) => c.id === customerId)?.name || "N/A";

    setCurrentOrderSummary({
      products: productsInOrder,
      salespersonName,
      customerName: selectedSalespersonType === "ws_rep" ? customerName : "لا ينطبق",
    });
    setShowOrderSummaryModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const currentErrors = {};
    if (!salespersonId) currentErrors.salespersonId = "الرجاء اختيار مندوب مبيعات";
    if (selectedSalespersonType === "ws_rep" && !customerId)
      currentErrors.customerId = "الرجاء اختيار عميل لمندوب الجملة";
    if (productsInOrder.length === 0)
      currentErrors.products = "يجب إضافة منتج واحد على الأقل";
    if (!orderDate) currentErrors.orderDate = "الرجاء تحديد تاريخ الطلب";

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("userToken");
      if (!token) throw new Error("انتهت صلاحية الجلسة");

      const payload =
        orderToEdit.type_order === "retail"
          ? {
              user_id: salespersonId,
              shipment_date: orderDate,
              items: productsInOrder.map((p) => ({ product_id: p.product_id, quantity: p.quantity })),
              note: orderNotes,
            }
          : {
              user_id: salespersonId,
              customer_id: customerId,
              order_date: orderDate,
              items: productsInOrder.map((p) => ({ product_id: p.product_id, quantity: p.quantity })),
              note: orderNotes,
            };

      const endpoint =
        orderToEdit.type_order === "retail"
          ? `admin/shipment-requests/${orderData.slug}`
          : `admin/orders/${orderData.slug}`;

      const response = await put(endpoint, payload, token);

      if (!response.status) throw new Error(response.message || "فشل في تحديث الطلب");

      toast.success("تم تحديث الطلب بنجاح");
      onClose(true);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "حدث خطأ أثناء تحديث الطلب");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper show={show} onClose={() => onClose(false)} isVisible={isVisible} title={`تعديل الطلب: ${orderData?.order_number || ""}`} maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        {loadingData || fetchingOrder ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">جاري تحميل بيانات الطلب...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SalespersonSelectField
                label="المندوب"
                value={
                  salespersonId
                    ? salespersonOptions.find((sp) => sp.value === salespersonId)
                    : null
                }
                onChange={(option) => {
                  setSalespersonId(option?.value || "");
                  setSelectedSalespersonType(option?.type_user || null);
                  setCustomerId(null);
                  setSelectedCustomerObject(null);
                }}
                options={salespersonOptions}
                error={errors.salespersonId}
              />

              {selectedSalespersonType === "ws_rep" && (
                <CustomerSelectField
                  label="العميل"
                  value={selectedCustomerObject}
                  onChange={(opt) => {
                      setCustomerId(opt?.value || null);
                      setSelectedCustomerObject(opt);
                  }}
                  options={customerOptions}
                  error={errors.customerId}
                />
              )}

              <FormInputField
                label="تاريخ الطلب"
                type="date"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                error={errors.orderDate}
              />
              <FormInputField
                label="ملاحظات الطلب"
                type="text"
                placeholder="أدخل ملاحظات حول الطلب (اختياري)"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                error={errors.orderNotes}
              />
            </div>

            <div className="border border-gray-700 p-4 rounded-lg flex flex-col gap-3">
              <h4 className="text-lg font-bold border-b border-gray-700 pb-2 mb-2">المنتجات في الطلب</h4>
              <div className="max-h-64 overflow-y-auto pr-2">
                {productsInOrder.length > 0 ? (
                  productsInOrder.map((product) => (
                    <div key={product.product_id} className="flex justify-between items-center bg-gray-700 p-3 rounded-md mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{product.name} {product.unit ? `(${product.unit})` : ""}</p>
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
              <button type="button" onClick={handleAddProductClick} className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded flex items-center justify-center gap-1 mt-3">
                <PlusIcon className="w-5 h-5 text-white" />
                <span>إضافة منتج</span>
              </button>
            </div>

            <FormInputField
              label="حالة الطلب الحالية"
              type="text"
              value={
                orderStatus === "pending" ? "معلق" :
                orderStatus === "accepted" ? "مقبول" :
                orderStatus === "canceled" ? "مرفوض" :
                orderStatus
              }
              readOnly
              className="pointer-events-none opacity-70"
            />

            <div className="flex justify-between gap-3 mt-4">
              <button type="button" onClick={() => onClose(false)} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded flex-1" disabled={isLoading}>إلغاء</button>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex-1" disabled={isLoading}>{isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}</button>
              <button type="button" onClick={handleViewOrderSummary} className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded flex-1" disabled={productsInOrder.length === 0 || !salespersonId || (selectedSalespersonType === "ws_rep" && !customerId)}>ملخص الطلبية</button>
            </div>
          </>
        )}
      </form>

      <AddProductToOrderModal
        show={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onAddProductConfirm={handleAddProductConfirm}
        availableProducts={products}
      />

      <EditProductInOrderModal
        show={showEditProductInOrderModal}
        onClose={() => setShowEditProductInOrderModal(false)}
        onUpdateProductConfirm={handleUpdateProductInOrderConfirm}
        productToEdit={productToEditInOrder}
        allAvailableProducts={products}
      />

      <OrderSummaryModal
        show={showOrderSummaryModal}
        onClose={() => setShowOrderSummaryModal(false)}
        orderSummary={currentOrderSummary}
      />
    </ModalWrapper>
  );
}