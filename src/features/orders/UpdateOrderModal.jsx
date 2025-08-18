import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField";
import { PlusIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/solid";
import AddProductToOrderModal from "./AddProductToOrderModal";
import EditProductInOrderModal from "./EditProductInOrderModal";
import { toast } from "react-toastify";
import { put, get } from "../../utils/apiService";

export default function UpdateOrderModal({ show, onClose, orderToEdit }) {
  const orderData = orderToEdit || { customer_id: null, customer: {} };
  const [isVisible, setIsVisible] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [salespersonId, setSalespersonId] = useState("");
  const [selectedSalespersonType, setSelectedSalespersonType] = useState(null);
  const [orderType, setOrderType] = useState("cash");
  const [currencyId, setCurrencyId] = useState("");
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState("");
  const [productsInOrder, setProductsInOrder] = useState([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [originalOrderData, setOriginalOrderData] = useState(null);
  const [getOrders, setGetOrders] = useState([]);

  const [salespersons, setSalespersons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [currencies, setCurrencies] = useState([]);

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
        console.log(reps);
        // جلب العملاء
        const custRes = await get("admin/customers", token);
        setCustomers(
          Array.isArray(custRes)
            ? custRes
            : custRes.customers || custRes.data || []
        );
        //جلب الطلبات
        const orders = await get("admin/orders", token);
        setGetOrders(
          Array.isArray(orders) ? orders : orders.customers || orders.data || []
        );

        // جلب المنتجات
        const prodRes = await get("admin/products", token);
        setProducts(
          Array.isArray(prodRes)
            ? prodRes
            : prodRes.products || prodRes.data || []
        );

        // جلب العملات
        const currRes = await get("admin/currencies", token);
        const fetchedCurrencies = Array.isArray(currRes)
          ? currRes
          : currRes.currencies || currRes.data || [];
        setCurrencies(
          fetchedCurrencies.filter(
            (c) => c && typeof c === "object" && c.id && c.code
          )
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

  // تعبئة حقول النموذج عند تغيير orderData
useEffect(() => {
  if (show && orderToEdit && orderToEdit.slug) {
    setIsVisible(true);

    // تعبئة بيانات المندوب
    const spId = orderToEdit.user_id || "";
    setSalespersonId(spId);

    const spType =
      salespersons.find((sp) => sp.id === Number(spId))?.type_user ||
      orderToEdit.user?.type_user ||
      null;
    setSelectedSalespersonType(spType);

    // تعبئة بيانات العميل
    const initialCustomerId =
      typeof orderToEdit.customer_id === "number"
        ? orderToEdit.customer_id
        : customers.find((c) => c.name === orderToEdit.customer_id)?.id ||
          orderToEdit.customer?.id ||
          null;

    setCustomerId(initialCustomerId);

    // تعبئة بيانات العملة
    const currId = orderToEdit.currency_id || "";
    setCurrencyId(currId);
    setSelectedCurrencyCode(
      currencies.find((c) => c.id === currId)?.code || ""
    );

    // تعبئة نوع الطلب
    setOrderType(orderToEdit.type);

    // تعبئة المنتجات
    setProductsInOrder(
      orderToEdit.products
        ? orderToEdit.products.map((p) => ({
            ...p,
            unit_price: p.unit_price || p.price, // نسخ price إلى unit_price إذا لزم الأمر
            quantity: Number(p.quantity),
            total: Number(p.total),
          }))
        : []
    );

    // تعبئة الحقول الأخرى
    setOrderStatus(orderToEdit.status || "");
    setOrderNotes(orderToEdit.note || "لم تجلب");
    setOrderDate(
      orderToEdit.order_date ||
        orderToEdit.shipment_date ||
        new Date().toISOString().split("T")[0]
    );

    // حفظ نسخة من البيانات الأصلية
    setOriginalOrderData({
      customer_id: initialCustomerId,
      user_id: spId,
      type: orderToEdit.type || "cash",
      currency_id: currId,
      products: orderToEdit.products
        ? orderToEdit.products.map((p) => ({
            ...p,
            quantity: Number(p.quantity),
            unit_price: Number(p.unit_price),
            total: Number(p.total),
          }))
        : [],
      notes: orderToEdit.notes || "",
      order_date: orderToEdit.order_date || orderToEdit.shipment_date || "",
    });

    setErrors({});
  } else if (!show) {
    resetForm();
  }
}, [show, orderToEdit]); // ✅ فقط يعتمد على الفتح + تغيير الطلب


  const resetForm = () => {
    setCustomerId(null);
    setSalespersonId("");
    setSelectedSalespersonType(null);
    setOrderType("cash");
    setCurrencyId("");
    setSelectedCurrencyCode("");
    setProductsInOrder([]);
    setOrderStatus("");
    setOrderNotes("");
    setOrderDate("");
    setOriginalOrderData(null);
    setErrors({});
    setIsLoading(false);
  };

  // حساب المبلغ الإجمالي للطلب
  const totalOrderAmount = useMemo(() => {
    return productsInOrder.reduce(
      (sum, product) => sum + (product.total || 0),
      0
    );
  }, [productsInOrder]);

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
        .filter((cust) => cust.user_id == salespersonId) // استخدام == للمقارنة المرنة
        .map((c) => ({ value: c.id, label: c.name }));
    }
    return [];
  }, [customers, salespersonId, selectedSalespersonType]);

  const currencyOptions = useMemo(() => {
    return currencies.map((c) => ({
      value: c.id,
      label: `${c.name} (${c.code})`,
    }));
  }, [currencies]);

  const handleSalespersonChange = (e) => {
    const selectedId = e.target.value;
    const selectedSp = salespersons.find((sp) => sp.id === selectedId);
    setSalespersonId(selectedId);
    setSelectedSalespersonType(selectedSp ? selectedSp.type_user : null);

    setCustomerId(null);
  };

  const handleCurrencyChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const currency = currencies.find((c) => c.id === selectedId);
    setCurrencyId(selectedId);
    setSelectedCurrencyCode(currency ? currency.code : "");
    if (productsInOrder.length > 0) {
      toast.info(
        "تم مسح المنتجات لأن العملة تغيرت. يرجى إعادة إضافة المنتجات بالعملة الجديدة."
      );
      setProductsInOrder([]);
    }
  };

  const handleAddProductClick = () => {
    if (!currencyId) {
      toast.error("الرجاء اختيار عملة الطلب أولاً.");
      return;
    }
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
  
  const productToAdd = {
    ...newProduct,
    unit_price: newProduct.price || newProduct.unit_price, // التأكد من وجود unit_price
    total: (newProduct.price || newProduct.unit_price) * newProduct.quantity
  };

  if (existingProductIndex > -1) {
    setProductsInOrder((prevProducts) =>
      prevProducts.map((p, index) =>
        index === existingProductIndex
          ? {
              ...p,
              quantity: p.quantity + productToAdd.quantity,
              total: p.total + productToAdd.total,
            }
          : p
      )
    );
    toast.info(`تم تحديث كمية المنتج "${productToAdd.name}".`);
  } else {
    setProductsInOrder((prevProducts) => [...prevProducts, productToAdd]);
    toast.success(`تم إضافة المنتج "${productToAdd.name}" بنجاح!`);
  }
  setShowAddProductModal(false);
};

  const handleEditProductInOrderClick = (product) => {
    setProductToEditInOrder(product);
    setShowEditProductInOrderModal(true);
  };

  const handleUpdateProductInOrderConfirm = (updatedProduct) => {
  const updatedWithPrice = {
    ...updatedProduct,
    unit_price: updatedProduct.price || updatedProduct.unit_price,
    total: (updatedProduct.price || updatedProduct.unit_price) * updatedProduct.quantity
  };

  setProductsInOrder((prevProducts) =>
    prevProducts.map((p) =>
      p.product_id === updatedWithPrice.product_id ? updatedWithPrice : p
    )
  );
  toast.success(`تم تحديث المنتج "${updatedWithPrice.name}" بنجاح!`);
  setShowEditProductInOrderModal(false);
  setProductToEditInOrder(null);
};

  const validateOrderBeforeUpdate = () => {
    if (!orderData?.slug) {
      toast.error("معرّف الطلب غير صالح");
      return false;
    }

    return true;
  };
  const getChangedFields = () => {
    if (!originalOrderData) return {};

    const changedFields = {};

    // المقارنة بين البيانات الأصلية والبيانات الحالية
    if (customerId !== originalOrderData.customer_id) {
      changedFields.customer_id =
        customerId !== null ? Number(customerId) : null;
    }

    if (salespersonId !== originalOrderData.user_id) {
      changedFields.user_id = salespersonId;
    }

    if (orderType !== originalOrderData.type) {
      changedFields.payment_type = orderType;
    }

    if (currencyId !== originalOrderData.currency_id) {
      changedFields.currency_id = currencyId;
    }

    if (orderNotes !== originalOrderData.note) {
      changedFields.note = orderNotes;
    }

    if (orderDate !== originalOrderData.order_date) {
      changedFields.shipment_date = orderDate;
    }

    // مقارنة المنتجات
    const originalProducts = originalOrderData.products || [];
  if (JSON.stringify(productsInOrder) !== JSON.stringify(originalProducts)) {
    changedFields.items = productsInOrder.map((product) => ({
      product_id: product.product_id,
      quantity: product.quantity,
      unit_price: product.unit_price, // استخدام unit_price
      total: product.total,
      price_type: product.price_type || 
        (selectedSalespersonType === "ws_rep" ? "bulk" : "retail"),
    }));
  }

    // إذا لم يكن هناك تغييرات، نرسل كائنًا فارغًا
    if (Object.keys(changedFields).length === 0) {
      toast.info("لم يتم إجراء أي تغييرات على الطلب");
      return null;
    }

    // تضمين الحقول المطلوبة دائماً
    changedFields.customer_id = customerId !== null ? Number(customerId) : null;
    changedFields.user_id = salespersonId;
    changedFields.total_cost = totalOrderAmount;

    return changedFields;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateOrderBeforeUpdate()) {
    return;
  }

  setErrors({});
  const currentErrors = {};

  // التحقق من الحقول الإلزامية
  if (!salespersonId)
    currentErrors.salespersonId = "الرجاء اختيار مندوب مبيعات";
  if (!currencyId) currentErrors.currencyId = "الرجاء اختيار عملة";
  if (productsInOrder.length === 0)
    currentErrors.products = "يجب إضافة منتج واحد على الأقل";
  if (!orderDate) currentErrors.orderDate = "الرجاء تحديد تاريخ الطلب";

  // تحقق إضافي لأسعار المنتجات
  const hasInvalidProducts = productsInOrder.some(
    (p) => p.unit_price === undefined || isNaN(p.unit_price)
  );
  if (hasInvalidProducts) {
    currentErrors.products = "بعض المنتجات تحتوي على أسعار غير صالحة";
  }

  if (Object.keys(currentErrors).length > 0) {
    setErrors(currentErrors);
    return;
  }

  setIsLoading(true);

  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("انتهت صلاحية الجلسة، يرجى تسجيل الدخول");

    let payload;
    if (selectedSalespersonType === "ws_rep") {
      payload = getChangedFields();
      if (payload === null) {
        setIsLoading(false);
        return;
      }
    } else {
      payload = {
        payment_type: orderType,
        shipment_date: orderDate,
        total_cost: totalOrderAmount,
        items: productsInOrder.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price, // استخدام unit_price بدلاً من price
          price_type: item.price_type || "retail",
        })),
        customer_id: customerId,
        user_id: salespersonId,
        currency_id: currencyId,
        note: orderNotes,
        status: orderStatus || "pending",  // ✅ أضف هذا السطر

      };
    }

    console.log("Payload to be sent:", JSON.stringify(payload, null, 2));

    const endpoint =
      selectedSalespersonType === "ws_rep"
        ? `admin/orders/${orderData.slug}`
        : `admin/shipment-requests/${orderData.slug}`;

    const response = await put(endpoint, payload, token);

    if (!response.status) {
      throw new Error(response.message || "فشل في تحديث الطلب");
    }

    toast.success(
      `تم تحديث طلب ${
        selectedSalespersonType === "ws_rep" ? "الجملة" : "التجزئة"
      } بنجاح`
    );
    onClose(true);
  } catch (error) {
    console.error("Update order error:", error);
    if (error.response?.data?.errors) {
      setErrors(error.response.data.errors);
      const errorMessage =
        selectedSalespersonType === "ws_rep"
          ? "خطأ في تحديث طلب الجملة: "
          : "خطأ في تحديث طلب التجزئة: ";
      toast.error(errorMessage + (error.response.data.message || ""));
    } else {
      toast.error(error.message || "حدث خطأ أثناء تحديث الطلب");
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title={`تعديل الطلب: ${
        orderData?.order_number || orderData?.slug || ""
      }`}
      maxWidth="max-w-4xl"
      maxHeight="max-h-[90vh] " // هنا قمت بتغيير الارتفاع الأقصى
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
              <FormSelectField
                label="نوع الطلب"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                options={[
                  { value: "cash", label: "نقدي" },
                  { value: "credit", label: "آجل" },
                ]}
                error={errors.orderType}
              />

              <FormSelectField
                label="المندوب"
                value={salespersonId}
                onChange={handleSalespersonChange}
                options={[
                  { value: "", label: "اختر مندوب..." },
                  ...salespersonOptions,
                ]}
                error={errors.salespersonId}
                disabled={loadingData}
              />
              {selectedSalespersonType === "ws_rep" && orderData && (
                <FormSelectField
                  label="العميل"
                  value={customerId || "current"}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    setCustomerId(
                      selectedValue === "current" ? null : Number(selectedValue)
                    );
                  }}
                  options={[
                    {
                      value: "current",
                      label:
                        orderData?.customer_id ||
                        orderData?.customer?.name ||
                        "غير معين",
                      disabled: true,
                    },
                    ...customerOptions.filter(
                      (c) => c.id !== (orderData?.customer?.id || null)
                    ),
                  ]}
                  error={errors.customerId}
                  disabled={loadingData || !salespersonId}
                  required={selectedSalespersonType === "ws_rep"}
                />
              )}

              <FormSelectField
                label="العملة"
                value={currencyId}
                onChange={handleCurrencyChange}
                options={[
                  { value: "", label: "اختر عملة..." },
                  ...currencyOptions,
                ]}
                error={errors.currencyId}
                disabled={loadingData}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <span className="text-sm font-normal text-gray-400 mr-2">
                  (
                  {selectedCurrencyCode
                    ? `العملة الحالية: ${selectedCurrencyCode}`
                    : "لم يتم اختيار عملة"}
                  )
                </span>
              </h4>

              <div className="max-h-64 overflow-y-auto pr-2">
                {productsInOrder.length > 0 ? (
                  productsInOrder.map((product) => (
                    <div
                      key={product.product_id}
                      className="flex justify-between items-center bg-gray-700 p-3 rounded-md mb-2"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{product.name}</p>
                        <p className="text-gray-300 text-sm">
                          الكمية: {product.quantity} - سعر الوحدة:{" "}
                          {product.unit_price?.toFixed(2) || "N/A"}{" "}
                          {selectedCurrencyCode}
                          {product.price_type &&
                            ` (${
                              product.price_type === "general"
                                ? "عام"
                                : product.price_type === "wholesale"
                                ? "جملة"
                                : product.price_type === "retail"
                                ? "تجزئة"
                                : product.price_type
                            })`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-accentColor text-lg">
                          {product.total?.toFixed(2) || "N/A"}{" "}
                          {selectedCurrencyCode}
                        </p>
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
                disabled={!currencyId}
              >
                <PlusIcon className="w-5 h-5 text-white" />
                <span>إضافة منتج</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInputField
                label="حالة الطلب الحالية"
                type="text"
                value={
                  orderStatus === "pending"
                    ? "معلق"
                    : orderStatus === "approved"
                    ? "موافق عليه"
                    : orderStatus === "rejected"
                    ? "مرفوض"
                    : orderStatus === "delivered"
                    ? "تم التسليم"
                    : orderStatus === "canceled"
                    ? "ملغى"
                    : orderStatus
                }
                readOnly
                className="pointer-events-none opacity-70"
              />
            </div>

            <div className="mt-4 text-left border-t border-gray-700 pt-3">
              <h4 className="text-2xl font-bold">
                الإجمالي الكلي للطلب: {totalOrderAmount.toFixed(2)}{" "}
                {selectedCurrencyCode}
              </h4>
            </div>

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
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    جاري الحفظ...
                  </span>
                ) : (
                  "حفظ التعديلات"
                )}
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
        selectedCurrencyCode={selectedCurrencyCode}
        orderType={orderType}
        salespersonType={selectedSalespersonType}
      />

      <EditProductInOrderModal
        show={showEditProductInOrderModal}
        onClose={() => setShowEditProductInOrderModal(false)}
        onUpdateProductConfirm={handleUpdateProductInOrderConfirm}
        productToEdit={productToEditInOrder}
        allAvailableProducts={products}
        selectedCurrencyCode={selectedCurrencyCode}
        orderType={orderType}
        salespersonType={selectedSalespersonType}
      />
    </ModalWrapper>
  );
}
