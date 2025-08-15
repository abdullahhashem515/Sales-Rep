import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField";
import SearchableSelectField from "../../components/shared/SearchableSelectField";
import { toast } from 'react-toastify';

/**
 * مكون مودال لإضافة منتج واحد إلى الطلب.
 * يسمح باختيار منتج، تحديد الكمية، وعرض السعر بناءً على العملة المختارة.
 *
 * @param {object} props
 * @param {boolean} props.show - حالة عرض/إخفاء المودال.
 * @param {function} props.onClose - دالة تستدعى عند إغلاق المودال.
 * @param {function} props.onAddProductConfirm - دالة تستدعى عند تأكيد إضافة المنتج، تمرر كائن المنتج المضاف.
 * @param {Array<object>} props.availableProducts - قائمة بجميع المنتجات المتاحة.
 * مثال: [{ id: 'PROD001', name: 'أرز المجد', prices_by_currency: { YER: { general: 7500, wholesale: 7000 } } }]
 * @param {string} props.selectedCurrencyCode - رمز العملة المحدد للطلب الحالي (مثال: 'YER').
 * @param {string} props.orderType - نوع الطلب ('cash' or 'credit') - قد يؤثر على اختيار السعر الأولي.
 * @param {string} props.salespersonType - نوع المندوب ('ws_rep' for wholesale, 'retail_rep' for retail).
 */
export default function AddProductToOrderModal({
  show,
  onClose,
  onAddProductConfirm,
  availableProducts,
  selectedCurrencyCode,
  orderType,
  salespersonType
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [selectedPriceType, setSelectedPriceType] = useState('');
  const [error, setError] = useState(null);

  // Reset form fields when modal opens
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setSelectedProduct(null);
      setQuantity('');
      setUnitPrice('');
      setSelectedPriceType('');
      setError(null);
      // ✅ سجل لتتبع المنتجات المتاحة والعملة عند فتح المودال
      console.log("AddProductToOrderModal: Modal Opened. availableProducts:", availableProducts);
      console.log("AddProductToOrderModal: Modal Opened. selectedCurrencyCode:", selectedCurrencyCode);
      console.log("AddProductToOrderModal: Modal Opened. salespersonType:", salespersonType);
    } else {
      setIsVisible(false);
    }
  }, [show, availableProducts, selectedCurrencyCode, salespersonType]); // Added dependencies for clarity in logs

  // Update unitPrice and available price types when selectedProduct or selectedCurrencyCode changes
  useEffect(() => {
    // ✅ سجل لتتبع التغيرات التي تؤثر على حساب السعر
    console.log("Price Calculation useEffect Triggered:");
    console.log("  - selectedProduct:", selectedProduct);
    console.log("  - selectedCurrencyCode:", selectedCurrencyCode);
    console.log("  - salespersonType:", salespersonType);

    if (selectedProduct && selectedCurrencyCode) {
      const pricesByCurrencyArray = selectedProduct.prices_by_currency?.[selectedCurrencyCode]; // هذا سيكون مصفوفة
      let pricesForCurrencyLookup = {}; // سنقوم ببناء كائن بحث
      
      // ✅ سجل للأسعار المتاحة للعملة المختارة (المصفوفة الخام)
      console.log("  - pricesByCurrencyArray for selected currency (raw):", pricesByCurrencyArray);

      if (Array.isArray(pricesByCurrencyArray)) {
        // تحويل المصفوفة إلى كائن لسهولة الوصول بواسطة type_user
        pricesByCurrencyArray.forEach(priceEntry => {
          pricesForCurrencyLookup[priceEntry.type_user] = priceEntry.price;
        });
      }

      let priceToUse = null;
      let initialPriceType = '';

      // ✅ سجل للأسعار المحولة للاستخدام
      console.log("  - pricesForCurrencyLookup (converted):", pricesForCurrencyLookup);

      if (Object.keys(pricesForCurrencyLookup).length > 0) {
        // Prioritize price type based on salespersonType and backend's type_user
        if (salespersonType === 'ws_rep' && pricesForCurrencyLookup.wholesale !== undefined) {
          priceToUse = pricesForCurrencyLookup.wholesale;
          initialPriceType = 'wholesale';
        } else if (salespersonType === 'retail_rep' && pricesForCurrencyLookup.retail !== undefined) {
          priceToUse = pricesForCurrencyLookup.retail;
          initialPriceType = 'retail';
        } else if (pricesForCurrencyLookup.general !== undefined) { // Fallback to general if specific type not found or salesperson type not matched
          priceToUse = pricesForCurrencyLookup.general;
          initialPriceType = 'general';
        }
      }

      // ✅ سجل للسعر ونوع السعر الذي سيتم استخدامه
      console.log("  - Price to use:", priceToUse);
      console.log("  - Initial Price Type:", initialPriceType);

      if (priceToUse !== null) {
        setUnitPrice(parseFloat(priceToUse).toFixed(2)); // التأكد من أنه رقم قبل toFixed
        setSelectedPriceType(initialPriceType);
        setError(null);
      } else {
        setUnitPrice('0.00'); // No price found for this currency/type
        setSelectedPriceType('');
        setError(`لا يوجد سعر لهذا المنتج بالعملة ${selectedCurrencyCode}.`);
      }
    } else {
      setUnitPrice('');
      setSelectedPriceType('');
      setError(null); // Clear error if no product/currency selected
      console.log("  - No product or currency selected, clearing price.");
    }
  }, [selectedProduct, selectedCurrencyCode, salespersonType]); // Added salespersonType to dependency array

  // Update unitPrice when selectedPriceType changes (via dropdown selection)
  useEffect(() => {
    // ✅ سجل لتتبع التغيرات في نوع السعر المختار
    console.log("Price Type Change useEffect Triggered:");
    console.log("  - selectedPriceType:", selectedPriceType);
    console.log("  - selectedProduct (for price type change):", selectedProduct);
    console.log("  - selectedCurrencyCode (for price type change):", selectedCurrencyCode);

    if (selectedProduct && selectedCurrencyCode && selectedPriceType) {
      const pricesByCurrencyArray = selectedProduct.prices_by_currency?.[selectedCurrencyCode];
      let pricesForCurrencyLookup = {};
      if (Array.isArray(pricesByCurrencyArray)) {
        pricesByCurrencyArray.forEach(priceEntry => {
          pricesForCurrencyLookup[priceEntry.type_user] = priceEntry.price;
        });
      }
      
      // ✅ سجل للأسعار المتاحة لنوع السعر المحدد
      console.log("  - pricesForCurrencyLookup (for type change):", pricesForCurrencyLookup);

      if (pricesForCurrencyLookup[selectedPriceType] !== undefined) {
        setUnitPrice(parseFloat(pricesForCurrencyLookup[selectedPriceType]).toFixed(2)); // التأكد من أنه رقم قبل toFixed
        setError(null);
      } else {
        setUnitPrice('0.00');
        setError(`لا يوجد سعر لنوع السعر المحدد (${selectedPriceType}) لهذه العملة.`);
      }
    }
  }, [selectedPriceType, selectedProduct, selectedCurrencyCode]);


  const productOptions = useMemo(() => {
    // تم التعديل: التأكد من أن availableProducts عبارة عن مصفوفة صالحة
    if (!Array.isArray(availableProducts)) return [];
    const options = availableProducts.map(p => ({ value: p.id, label: p.name }));
    // ✅ سجل للخيارات التي يتم تمريرها إلى SearchableSelectField
    console.log("productOptions generated:", options);
    return options;
  }, [availableProducts]);

  const priceTypeOptions = useMemo(() => {
    if (!selectedProduct || !selectedCurrencyCode) return [];
    
    const pricesByCurrencyArray = selectedProduct.prices_by_currency?.[selectedCurrencyCode];
    if (!Array.isArray(pricesByCurrencyArray) || pricesByCurrencyArray.length === 0) return [];

    const options = [];
    // تحويل type_user من الباك إند إلى تسميات عرض مناسبة (مثل 'general' -> 'عام')
    const getTypeUserLabel = (typeUser) => {
      switch(typeUser) {
        case 'general': return 'عام';
        case 'wholesale': return 'جملة';
        case 'retail': return 'تجزئة';
        default: return typeUser;
      }
    };

    pricesByCurrencyArray.forEach(priceEntry => {
      options.push({ 
        value: priceEntry.type_user, 
        label: `${getTypeUserLabel(priceEntry.type_user)}: ${parseFloat(priceEntry.price).toFixed(2)} ${selectedCurrencyCode}` 
      });
    });

    // ✅ سجل لخيارات نوع السعر المولدة
    console.log("priceTypeOptions generated:", options);
    return options;
  }, [selectedProduct, selectedCurrencyCode]);

  const handleProductSelect = (selectedLabel) => {
    // ✅ سجل للقيمة المستلمة من SearchableSelectField
    console.log("handleProductSelect: selectedLabel received:", selectedLabel);
    const product = availableProducts.find(p => p.name === selectedLabel);
    // ✅ سجل للمنتج الذي تم العثور عليه
    console.log("handleProductSelect: found product object:", product);
    setSelectedProduct(product);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedProduct) {
      setError('الرجاء اختيار منتج.');
      toast.error('الرجاء اختيار منتج.');
      return;
    }
    if (!quantity.trim() || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      setError('الرجاء إدخال كمية صحيحة أكبر من صفر.');
      toast.error('الرجاء إدخال كمية صحيحة.');
      return;
    }
    if (!unitPrice || parseFloat(unitPrice) <= 0) {
      setError('المنتج لا يحتوي على سعر صالح بالعملة المختارة.');
      toast.error('سعر المنتج غير صالح.');
      return;
    }
    if (!selectedPriceType) {
      setError('الرجاء اختيار نوع السعر.');
      toast.error('الرجاء اختيار نوع السعر.');
      return;
    }

    const qty = parseInt(quantity);
    const price = parseFloat(unitPrice);
    const totalProductPrice = qty * price;

    const newProductInOrder = {
      product_id: selectedProduct.id,
      name: selectedProduct.name,
      quantity: qty,
      unit_price: price,
      total: totalProductPrice,
      price_type: selectedPriceType
    };

    // ✅ سجل للمنتج الذي سيتم إضافته إلى الطلب
    console.log("handleSubmit: New product to add to order:", newProductInOrder);
    onAddProductConfirm(newProductInOrder);
    onClose();
  };

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={isVisible}
      title="إضافة منتج للطلب"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        {/* Product Search/Select */}
        <SearchableSelectField
            label="المنتج"
            value={selectedProduct?.name || ''}
            onChange={handleProductSelect}
            // ✅ تمرير `label` فقط كـ `options` لـ `SearchableSelectField`
            options={availableProducts.map(p => p.name)}
            error={error && error.includes('منتج') ? error : null}
            placeholder="ابحث أو اختر منتج..."
        />

        {/* Quantity */}
        <FormInputField
          label="الكمية"
          type="number"
          placeholder="أدخل الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={error && error.includes('كمية') ? error : null}
        />

        {/* Price Type Selection */}
        <FormSelectField
          label={`نوع السعر (${selectedCurrencyCode || 'لا توجد عملة'})`}
          value={selectedPriceType}
          onChange={(e) => setSelectedPriceType(e.target.value)}
          options={priceTypeOptions}
          error={error && error.includes('نوع السعر') ? error : null}
          disabled={!selectedProduct || priceTypeOptions.length === 0}
        />

        {/* Unit Price (Read-only) */}
        <FormInputField
          label={`سعر الوحدة (${selectedCurrencyCode || 'لا توجد عملة'})`}
          type="text"
          placeholder="السعر للوحدة"
          value={unitPrice}
          readOnly
          className="pointer-events-none opacity-70"
          error={error && error.includes('سعر صالح') ? error : null}
        />

        {error && !error.includes('منتج') && !error.includes('كمية') && !error.includes('سعر صالح') && !error.includes('نوع السعر') && (
            <p className="text-red-500 text-xs mt-1 text-center">{error}</p>
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="accentColor hover:bg-purple-700 py-2 px-4 rounded"
          >
            إضافة
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
