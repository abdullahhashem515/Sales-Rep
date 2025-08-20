import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField";
import { PlusIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/solid";
import AddProductToOrderModal from "./AddProductToOrderModal";
import EditProductInOrderModal from "./EditProductInOrderModal";
import { toast } from "react-toastify";
import { put, get } from "../../utils/apiService";
import OrderSummaryModal from './OrderSummaryModal';
import SearchableSelectField from "../../components/shared/SearchableSelectField"; // تأكد من المسار



export default function UpdateOrderModal({ show, onClose, orderToEdit }) {
  const orderData = orderToEdit || { customer_id: null, customer: {} };
  const [isVisible, setIsVisible] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [salespersonId, setSalespersonId] = useState("");
  const [selectedSalespersonType, setSelectedSalespersonType] = useState(null);
  const [productsInOrder, setProductsInOrder] = useState([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [originalOrderData, setOriginalOrderData] = useState(null);
  const [showOrderSummaryModal, setShowOrderSummaryModal] = useState(false);
const [currentOrderSummary, setCurrentOrderSummary] = useState(null);


  const [salespersons, setSalespersons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductInOrderModal, setShowEditProductInOrderModal] =
    useState(false);
  const [productToEditInOrder, setProductToEditInOrder] = useState(null);

  // جلب البيانات عند فتح المودال
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const token = localStorage.getItem("userToken");

        // جلب مندوبي المبيعات
        const salesRes = await get("admin/users", token);
        const reps = (salesRes.users || salesRes.data || []).filter(
          (user) =>
            user.type_user === "ws_rep" || user.type_user === "retail_rep"
        );
        setSalespersons(reps);

        // جلب العملاء
        const custRes = await get("admin/customers", token);
        setCustomers(
          Array.isArray(custRes)
            ? custRes
            : custRes.customers || custRes.data || []
        );

        // جلب المنتجات
        const prodRes = await get("admin/products", token);
        setProducts(
          Array.isArray(prodRes)
            ? prodRes
            : prodRes.products || prodRes.data || []
        );
      } catch (error) {
        toast.error("حدث خطأ أثناء جلب البيانات");
      } finally {
        setLoadingData(false);
      }
    };

    if (show) {
      fetchData();
    }
  }, [show]);
console.log(orderToEdit)
  // تعبئة حقول النموذج عند تغيير orderData
 useEffect(() => {
  if (show && orderToEdit && orderToEdit.slug && !loadingData) {
    setIsVisible(true);

    // تحويل user_id إلى رقم
    const spId = Number(orderToEdit.user_id || "");
    setSalespersonId(spId);

    // تحديد نوع المندوب
    const spType =
      salespersons.find((sp) => sp.id === spId)?.type_user ||
      orderToEdit.user?.type_user ||
      null;
    setSelectedSalespersonType(spType);

    // تحويل customer_id إلى id رقمي من القائمة إذا كان الاسم موجودًا
    let initialCustomerId = null;
    if (spType === "ws_rep") {
      const matchedCustomer = customers.find(
        (c) => c.name === orderToEdit.customer_id || c.id === orderToEdit.customer?.id
      );
      initialCustomerId = matchedCustomer ? matchedCustomer.id : null;
    }
    setCustomerId(initialCustomerId);

    // تعبئة المنتجات
    setProductsInOrder(
      orderToEdit.products
        ? orderToEdit.products.map((p) => ({
            ...p,
            quantity: Number(p.quantity),
            unit: p.unit || "",
          }))
        : []
    );

    setOrderStatus(orderToEdit.status || "");
    setOrderNotes(orderToEdit.note || "");
    setOrderDate(
      orderToEdit.order_date ||
        orderToEdit.shipment_date ||
        new Date().toISOString().split("T")[0]
    );

    setOriginalOrderData({
      customer_id: initialCustomerId,
      user_id: spId,
      products: orderToEdit.products || [],
      notes: orderToEdit.notes || "",
      order_date: orderToEdit.order_date || orderToEdit.shipment_date || "",
    });

    setErrors({});

    // console.log للتحقق
    console.log("✅ salespersonId:", spId);
    console.log("✅ selectedSalespersonType:", spType);
    console.log("✅ customerId:", initialCustomerId);
    console.log("✅ productsInOrder:", orderToEdit.products);
  } else if (!show) {
    resetForm();
  }
}, [show, orderToEdit, salespersons, customers, loadingData]);

  const resetForm = () => {
    setCustomerId(null);
    setSalespersonId("");
    setSelectedSalespersonType(null);
    setProductsInOrder([]);
    setOrderStatus("");
    setOrderNotes("");
    setOrderDate("");
    setOriginalOrderData(null);
    setErrors({});
    setIsLoading(false);
  };

  const salespersonOptions = useMemo(() => {
    return salespersons.map((sp) => ({
      value: sp.id,
      label: `${sp.name} (${
        sp.type_user === "ws_rep" ? "مندوب جملة" : "مندوب تجزئة"
      })`,
      type_user: sp.type_user,
    }));
  }, [salespersons]);

  const customerOptions = useMemo(() => {
    if (selectedSalespersonType === "ws_rep" && salespersonId) {
      return customers
        .filter((cust) => cust.user_id == salespersonId)
        .map((c) => ({ value: c.id, label: c.name }));
    }
    return [];
  }, [customers, salespersonId, selectedSalespersonType]);

  const handleSalespersonChange = (e) => {
    const selectedId = e.target.value;
    const selectedSp = salespersons.find((sp) => sp.id === selectedId);
    setSalespersonId(selectedId);
    setSelectedSalespersonType(selectedSp ? selectedSp.type_user : null);
    setCustomerId(null);
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
    salespersonName,
    customerName: selectedSalespersonType === 'ws_rep' ? customerName : 'لا ينطبق',
  });
  setShowOrderSummaryModal(true);
};


  const handleAddProductClick = () => {
    setShowAddProductModal(true);
  };

  const handleRemoveProduct = (productIdToRemove) => {
    setProductsInOrder((prevProducts) =>
      prevProducts.filter((p) => p.product_id !== productIdToRemove)
    );
  };

  const handleAddProductConfirm = (newProduct) => {
    const existingProductIndex = productsInOrder.findIndex(
      (p) => p.product_id === newProduct.product_id
    );

    if (existingProductIndex > -1) {
      toast.info(`تم تحديث كمية المنتج "${newProduct.name}".`);
    } else {
      setProductsInOrder((prevProducts) => [...prevProducts, newProduct]);
      toast.success(`تم إضافة المنتج "${newProduct.name}" بنجاح!`);
    }
    setShowAddProductModal(false);
  };

  const handleEditProductInOrderClick = (product) => {
    setProductToEditInOrder(product);
    setShowEditProductInOrderModal(true);
  };

  const handleUpdateProductInOrderConfirm = (updatedProduct) => {
    setProductsInOrder((prevProducts) =>
      prevProducts.map((p) =>
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
  const currentErrors = {};

  if (!salespersonId)
    currentErrors.salespersonId = "الرجاء اختيار مندوب مبيعات";
  if (productsInOrder.length === 0)
    currentErrors.products = "يجب إضافة منتج واحد على الأقل";
  if (!orderDate) currentErrors.orderDate = "الرجاء تحديد تاريخ الطلب";

  if (Object.keys(currentErrors).length > 0) {
    setErrors(currentErrors);
    return;
  }

  setIsLoading(true);

  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول");

    let payload;

    if (orderToEdit.type_order === "retail") {
      // --- حمولة طلبات التجزئة ---
      payload = {
        user_id: salespersonId,
        shipment_date: orderDate,
        items: productsInOrder.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        note: orderNotes,
      };
    } else {
      // --- حمولة طلبات الجملة ---
      payload = {
        user_id: salespersonId,
        customer_id: customerId,
        order_date: orderDate,
        items: productsInOrder.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        note: orderNotes,
      };
    }

    // تحديد نقطة النهاية حسب النوع
    const endpoint =
      orderToEdit.type_order === "retail"
        ? `admin/shipment-requests/${orderToEdit.slug}`
        : `admin/orders/${orderToEdit.slug}`;

    const response = await put(endpoint, payload, token);

    if (!response.status) {
      throw new Error(response.message || "فشل في تحديث الطلب");
    }

    toast.success(`تم تحديث الطلب بنجاح`);
    onClose(true);
  } catch (error) {
    console.error("Update order error:", error);
    toast.error(error.message || "حدث خطأ أثناء تحديث الطلب");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title={`تعديل الطلب: ${orderData?.order_number || orderData?.slug || ""}`}
      maxWidth="max-w-4xl"
      maxHeight="max-h-[90vh]"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-4 text-right"
      >
        {loadingData ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">جاري تحميل بيانات الطلب...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SearchableSelectField
    label="المندوب"
    value={salespersonId}
    onChange={(val) => {
      const selectedSp = salespersons.find((sp) => sp.id === Number(val));
      setSalespersonId(Number(val));
      setSelectedSalespersonType(selectedSp ? selectedSp.type_user : null);
      setCustomerId(null);
    }}
    options={[
      { value: "", label: "اختر مندوب..." },
      ...salespersonOptions,
    ]}
    error={errors.salespersonId}
    className=""
  />

  {selectedSalespersonType === "ws_rep" && orderData && (
    <SearchableSelectField
      label="العميل"
      value={customerId || ""}
      onChange={(val) => {
        setCustomerId(val ? Number(val) : null);
      }}
      options={[
        {
          value: customerId || "",
          label:
            orderData?.customer_id ||
            orderData?.customer?.name ||
            "غير معين",
        },
        ...customerOptions.filter(
          (c) => c.value !== (orderData?.customer?.id || null)
        ),
      ]}
      error={errors.customerId}
      className=""
      placeholder="ابحث عن العميل..."
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
              <h4 className="text-lg font-bold border-b border-gray-700 pb-2 mb-2">
                المنتجات في الطلب
              </h4>
              <div className="max-h-64 overflow-y-auto pr-2">
                {productsInOrder.length > 0 ? (
                  productsInOrder.map((product) => (
                    <div
                      key={product.product_id}
                      className="flex justify-between items-center bg-gray-700 p-3 rounded-md mb-2"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-lg">
                          {product.name}{" "}
                          {product.unit ? `(${product.unit})` : ""}
                        </p>
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
                          onClick={() =>
                            handleRemoveProduct(product.product_id)
                          }
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
                <p className="text-red-500 text-xs mt-1 text-center">
                  {errors.products}
                </p>
              )}

              <button
                type="button"
                onClick={handleAddProductClick}
                className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded flex items-center justify-center gap-1 mt-3"
              >
                <PlusIcon className="w-5 h-5 text-white" />
                <span>إضافة منتج</span>
              </button>
            </div>

            <FormInputField
              label="حالة الطلب الحالية"
              type="text"
              value={
                orderStatus === "pending"
                  ? "معلق"
                  : orderStatus === "accepted"
                  ? "مقبول"
                  : orderStatus === "canceled"
                  ? "مرفوض"
                  : orderStatus
              }
              readOnly
              className="pointer-events-none opacity-70"
            />

            {errors.general && (
              <p className="text-red-500 text-xs mt-1 text-center">
                {errors.general}
              </p>
            )}

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
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex-1"
                disabled={isLoading}
              >
                {isLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
              </button>
               <button
    type="button"
    onClick={handleViewOrderSummary}
    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded flex-1"
    disabled={productsInOrder.length === 0 || !salespersonId || (selectedSalespersonType === 'ws_rep' && !customerId)}
  >
    ملخص الطلبية
  </button>
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
