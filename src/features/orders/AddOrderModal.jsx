// src/pages/orders/AddOrderModal.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField";
import SearchableSelectFieldV3 from "../../components/shared/SearchableSelectFieldV3";
import SalespersonSelectField from "../../components/shared/SalespersonSelectField";
import CustomerSelectField from "../../components/shared/CustomerSelectField";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";
import { post, get } from "../../utils/apiService";
import { AuthContext } from "../../contexts/AuthContext";

export default function AddOrderModal({ show, onClose }) {
  const { token } = useContext(AuthContext);

  const [isVisible, setIsVisible] = useState(false);
  const [salespersonId, setSalespersonId] = useState("");
  const [selectedSalespersonType, setSelectedSalespersonType] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [currencyId, setCurrencyId] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [note, setNote] = useState("");
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);

  const [productsInOrder, setProductsInOrder] = useState([
    { product_id: "", quantity: "", price: "", name: "", unit: "", subtotal: "0.00", errors: {} },
  ]);

  const [salespersons, setSalespersons] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  const [loadingSalespersons, setLoadingSalespersons] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // جلب البيانات
  useEffect(() => {
    if (!show) return setIsVisible(false);

    setIsVisible(true);
    setSalespersonId("");
    setSelectedSalespersonType(null);
    setCustomerId(null);
    setCurrencyId("");
    setPaymentType("cash");
    setNote("");
    setOrderDate(new Date().toISOString().split("T")[0]);
    setProductsInOrder([
      { product_id: "", quantity: "", price: "", name: "", unit: "", subtotal: "0.00", errors: {} },
    ]);
    setErrors({});
    setIsLoading(false);

    const fetchAllData = async () => {
      if (!token) {
        toast.error("لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.");
        return;
      }

      setLoadingSalespersons(true);
      try {
        const response = await get("admin/users", token);
        const reps = (response.users || response.data || []).filter(
          (user) => user.type_user === "ws_rep" || user.type_user === "retail_rep"
        );
        setSalespersons(reps);
      } catch (err) {
        toast.error("فشل جلب المندوبين.");
      } finally {
        setLoadingSalespersons(false);
      }

      setLoadingCustomers(true);
      try {
        const response = await get("admin/customers", token);
        setCustomers(Array.isArray(response) ? response : response.customers || response.data || []);
      } catch (err) {
        toast.error("فشل جلب العملاء.");
      } finally {
        setLoadingCustomers(false);
      }

      setLoadingProducts(true);
      try {
        const response = await get("admin/products", token);
        setProducts(Array.isArray(response) ? response : response.products || response.data || []);
      } catch (err) {
        toast.error("فشل جلب المنتجات.");
      } finally {
        setLoadingProducts(false);
      }
      
      setLoadingCurrencies(true);
      try {
        const response = await get("admin/currencies", token);
        setCurrencies(Array.isArray(response) ? response : response.currencies || response.data || []);
      } catch (err) {
        toast.error("فشل جلب العملات.");
      } finally {
        setLoadingCurrencies(false);
      }
    };

    fetchAllData();
  }, [show, token]);

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

  const currencyOptions = useMemo(() => {
    return currencies.map(curr => ({ value: curr.id, label: curr.name }));
  }, [currencies]);

  const paymentTypeOptions = [
    { value: 'cash', label: 'نقد' },
    { value: 'credit', label: 'آجل' },
  ];

  const getProductPricesOptions = (productId) => {
    if (selectedSalespersonType === "retail_rep") {
      return [{ value: "0", label: "0" }]; // سعر ثابت 0 للمندوب التجزئة
    }
    const currentProduct = products.find(p => p.id === productId);
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

  const selectedProductIds = useMemo(() => {
    return productsInOrder.map(row => row.product_id).filter(Boolean);
  }, [productsInOrder]);

  const getProductOptionsForRows = (currentIndex) => {
    const otherSelectedIds = selectedProductIds.filter((_, index) => index !== currentIndex);
    return products
      .filter(p => !otherSelectedIds.includes(p.id))
      .map(p => ({
        value: p.id,
        label: `${p.name} (${p.unit})`
      }));
  };

  const grandTotal = useMemo(() => {
    return productsInOrder.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0).toFixed(2);
  }, [productsInOrder]);

  const handleSalespersonChange = (option) => {
    setSalespersonId(option?.value || "");
    setSelectedSalespersonType(option?.type_user || null);
    setCustomerId(null);
    setCurrencyId(""); // إعادة تعيين العملة
    setPaymentType("cash"); // إعادة تعيين نوع الدفع
    setProductsInOrder([
      { product_id: "", quantity: "", price: "", name: "", unit: "", subtotal: "0.00", errors: {} },
    ]);
  };

  const handleProductInputChange = (index, field, value) => {
    setProductsInOrder(prevRows => {
      const newRows = [...prevRows];
      let row = { ...newRows[index] };

      if (field === "product_id") {
        row.product_id = value;
        row.quantity = "";
        row.subtotal = "0.00";
        const productDetails = products.find(p => p.id === value);
        row.name = productDetails?.name || "";
        row.unit = productDetails?.unit || "";

        if (selectedSalespersonType === "retail_rep") {
          row.price = 0;
        } else {
          const pricesOptions = getProductPricesOptions(value);
          row.price = pricesOptions.length > 0 ? parseFloat(pricesOptions[0].value) : "";
        }
      } else if (field === "quantity") {
        row.quantity = value;
      } else if (field === "price") {
        row.price = parseFloat(value);
      }

      const qty = parseFloat(row.quantity);
      const price = parseFloat(row.price);
      row.subtotal = (!isNaN(qty) && !isNaN(price)) ? (qty * price).toFixed(2) : "0.00";
      row.errors = { ...row.errors, [field]: undefined };

      newRows[index] = { ...row };
      return newRows;
    });
  };

  const handleAddRow = () => {
    setProductsInOrder(prevRows => [
      ...prevRows,
      { product_id: "", quantity: "", price: "", name: "", unit: "", subtotal: "0.00", errors: {} },
    ]);
  };

  const handleRemoveRow = (indexToRemove) => {
    setProductsInOrder(prevRows => prevRows.filter((_, index) => index !== indexToRemove));
  };

  // الإرسال
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let currentErrors = {};
    let hasProductErrors = false;

    if (!salespersonId) currentErrors.salespersonId = "الرجاء اختيار مندوب مبيعات صالح.";
    
    if (selectedSalespersonType === "ws_rep") {
      if (!customerId) currentErrors.customerId = "الرجاء اختيار عميل.";
      if (!currencyId) currentErrors.currencyId = "الرجاء اختيار العملة.";
    }

    const validatedProducts = productsInOrder.map((row) => {
      let rowErrors = {};
      if (row.product_id || row.quantity) {
        if (!row.product_id) rowErrors.product = "الرجاء اختيار منتج.";
        if (!row.quantity || isNaN(parseFloat(row.quantity)) || parseFloat(row.quantity) <= 0) {
          rowErrors.quantity = "الكمية غير صالحة.";
        }
        if (selectedSalespersonType === "ws_rep" && (!row.price || isNaN(parseFloat(row.price)) || parseFloat(row.price) <= 0)) {
          rowErrors.price = "الرجاء اختيار سعر صالح.";
        }
      }
      if (Object.keys(rowErrors).length > 0) hasProductErrors = true;
      return { ...row, errors: rowErrors };
    });

    const finalProductsToSubmit = validatedProducts.filter(
      (row) => row.product_id && row.quantity
    );

    if (finalProductsToSubmit.length === 0) {
      currentErrors.products = "يجب إضافة منتج واحد على الأقل للطلب.";
      hasProductErrors = true;
    }

    setProductsInOrder(validatedProducts);

    if (Object.keys(currentErrors).length > 0 || hasProductErrors) {
      setErrors(currentErrors);
      return toast.error("يرجى تصحيح الأخطاء في النموذج.");
    }

    setIsLoading(true);
    try {
      let endpoint = "";
      let payload = {};

      if (selectedSalespersonType === "retail_rep") {
        endpoint = "admin/shipment-requests";
        payload = {
          user_id: salespersonId,
          shipment_date: orderDate,
          items: finalProductsToSubmit.map((p) => ({ product_id: parseInt(p.product_id), quantity: p.quantity })),
          note: note || null,
        };
      } else {
        endpoint = "admin/orders";
        payload = {
          user_id: salespersonId,
          customer_id: customerId,
          currency_id: currencyId,
          payment_type: paymentType,
          note,
          order_date: orderDate,
          items: finalProductsToSubmit.map((p) => ({ product_id: parseInt(p.product_id), quantity: p.quantity, unit_price: p.price })),
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SalespersonSelectField
            label="المندوب"
            value={salespersonId ? salespersonOptions.find((sp) => sp.value === salespersonId) : null}
            onChange={handleSalespersonChange}
            options={salespersonOptions}
            placeholder={loadingSalespersons ? "جاري التحميل..." : "اختر مندوب..."}
            error={errors.salespersonId}
            isClearable
          />

          {selectedSalespersonType === "ws_rep" && (
            <CustomerSelectField
              label="العميل"
              value={customerId ? filteredCustomerOptions.find(c => c.value === customerId) : null}
              onChange={(option) => setCustomerId(option?.value || null)}
              options={filteredCustomerOptions}
              placeholder={loadingCustomers ? "جاري التحميل..." : "اختر عميل..."}
              error={errors.customerId}
            />
          )}

          {selectedSalespersonType === "ws_rep" && (
            <SearchableSelectFieldV3
              label="العملة"
              value={currencyId ? currencyOptions.find(c => c.value === currencyId) : null}
              onChange={(option) => {
                setCurrencyId(option?.value || "");
                setProductsInOrder([
                  { product_id: "", quantity: "", price: "", name: "", unit: "", subtotal: "0.00", errors: {} },
                ]);
              }}
              options={currencyOptions}
              placeholder={loadingCurrencies ? 'جاري التحميل...' : 'اختر العملة...'}
              error={errors.currencyId}
              isClearable
            />
          )}

          {selectedSalespersonType === "ws_rep" && (
            <FormSelectField
              label="نوع الدفع"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              options={paymentTypeOptions}
              className="w-full"
            />
          )}

          <FormInputField label="تاريخ الطلب" type="date" value={orderDate} readOnly />
          <FormInputField label="ملاحظات" type="text" placeholder="ملاحظات حول الطلب" value={note} onChange={(e) => setNote(e.target.value)} error={errors.note} />
        </div>

        {/* Product Input Section */}
        <div className="border border-gray-700 p-3 rounded-lg flex flex-col gap-3 mt-4">
          <h4 className="text-lg font-bold border-b border-gray-700 pb-2 mb-2">المنتجات في الطلب</h4>
          <div className="grid grid-cols-product-row text-right font-semibold text-gray-400 text-sm border-b border-gray-700 pb-2">
            <div>المنتج</div>
            <div>الكمية</div>
            {selectedSalespersonType === "ws_rep" && (
              <div>سعر الوحدة</div>
            )}
            {selectedSalespersonType === "ws_rep" && (
              <div>الإجمالي</div>
            )}
            <div></div> {/* for remove button */}
          </div>
          <div className="max-h-96 pr-2">
            {productsInOrder.map((row, index) => (
              <div key={index} className="grid grid-cols-product-row gap-3 items-center py-2 border-b border-gray-700 last:border-b-0">
                <div className="col-span-1">
                  <SearchableSelectFieldV3
                    label=""
                    value={row.product_id ? getProductOptionsForRows(index).find(p => p.value === row.product_id) : null}
                    onChange={(option) => handleProductInputChange(index, 'product_id', option?.value || "")}
                    options={getProductOptionsForRows(index)}
                    placeholder={loadingProducts ? 'جاري التحميل...' : 'ابحث أو اختر...'}
                    error={row.errors.product}
                    className="w-full text-sm"
                    disabled={!selectedSalespersonType}
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
                {selectedSalespersonType === "ws_rep" && (
                  <div className="col-span-1">
                    <SearchableSelectFieldV3
                      label=""
                      value={row.price ? getProductPricesOptions(row.product_id).find(p => p.value === row.price) : null}
                      onChange={(option) => handleProductInputChange(index, 'price', option?.value || "")}
                      options={getProductPricesOptions(row.product_id)}
                      placeholder="اختر السعر"
                      error={row.errors.price}
                      className="text-sm"
                      disabled={!row.product_id || !currencyId || getProductPricesOptions(row.product_id).length === 0}
                    />
                  </div>
                )}
                {selectedSalespersonType === "ws_rep" && (
                  <div className="col-span-1">
                    <FormInputField
                      label=""
                      type="text"
                      value={row.subtotal}
                      readOnly
                      className="bg-gray-800 opacity-80 text-sm"
                    />
                  </div>
                )}
                <div className="col-span-1 flex justify-center">
                  {productsInOrder.length > 1 && (
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
            ))}
          </div>

          {errors.products && <p className="text-red-500 text-xs mt-1 text-center">{errors.products}</p>}

          <button type="button" onClick={handleAddRow} className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded flex items-center justify-center gap-1 mt-3" disabled={loadingProducts || !selectedSalespersonType || productsInOrder.length >= products.length}>
            <PlusIcon className="w-5 h-5 text-white" /> إضافة منتج
          </button>
        </div>

        {selectedSalespersonType === "ws_rep" && (
          <div className="text-lg font-bold text-accentColor text-left mt-4 p-2 bg-gray-800 rounded-lg shadow-md">
            الإجمالي الكلي: {grandTotal} {currencies.find(c => c.id === currencyId)?.code || ''}
          </div>
        )}

        {errors.general && <p className="text-red-500 text-xs mt-1 text-center">{errors.general}</p>}

        <div className="flex justify-between gap-3 mt-4">
          <button type="button" onClick={() => onClose(false)} className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded flex-1" disabled={isLoading}>إلغاء</button>
          <button type="submit" className="accentColor hover:bg-purple-700 py-2 px-4 rounded flex-1" disabled={isLoading}>{isLoading ? "جاري إنشاء الطلب..." : "إنشاء الطلب"}</button>
        </div>
      </form>
      <style jsx>{`
        .grid-cols-product-row {
          grid-template-columns: ${selectedSalespersonType === "ws_rep" ? "2.5fr 1fr 1fr 1fr 0.5fr" : "2.5fr 1fr 0.5fr"};
        }
        @media (max-width: 768px) {
          .grid-cols-product-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </ModalWrapper>
  );
}