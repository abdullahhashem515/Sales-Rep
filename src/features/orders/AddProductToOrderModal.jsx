import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField"; // NEW: For price type selection
import SearchableSelectField from "../../components/shared/SearchableSelectField"; // For product selection
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
 */
export default function AddProductToOrderModal({
  show,
  onClose,
  onAddProductConfirm,
  availableProducts,
  selectedCurrencyCode,
  orderType // Passed to determine which price (general/wholesale/retail) to pick if needed
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // Full product object
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState(''); // Displayed unit price
  const [selectedPriceType, setSelectedPriceType] = useState(''); // NEW: State for selected price type (e.g., 'general', 'wholesale')
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form fields when modal opens
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setSelectedProduct(null);
      setQuantity('');
      setUnitPrice('');
      setSelectedPriceType(''); // NEW: Reset price type
      setError(null);
      setIsLoading(false);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  // Update unitPrice and available price types when selectedProduct or selectedCurrencyCode changes
  useEffect(() => {
    if (selectedProduct && selectedCurrencyCode) {
      const pricesForCurrency = selectedProduct.prices_by_currency?.[selectedCurrencyCode];
      let priceToUse = null;
      let initialPriceType = '';

      if (pricesForCurrency) {
        // Determine initial price type based on orderType or default to general
        if (orderType === 'credit' && pricesForCurrency.wholesale !== undefined) {
          priceToUse = pricesForCurrency.wholesale;
          initialPriceType = 'wholesale';
        } else if (pricesForCurrency.general !== undefined) {
          priceToUse = pricesForCurrency.general;
          initialPriceType = 'general';
        } else if (pricesForCurrency.retail !== undefined) { // Fallback to retail if others aren't there
          priceToUse = pricesForCurrency.retail;
          initialPriceType = 'retail';
        }
      }

      if (priceToUse !== null) {
        setUnitPrice(priceToUse.toFixed(2));
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
    }
  }, [selectedProduct, selectedCurrencyCode, orderType]);

  // Update unitPrice when selectedPriceType changes
  useEffect(() => {
    if (selectedProduct && selectedCurrencyCode && selectedPriceType) {
      const pricesForCurrency = selectedProduct.prices_by_currency?.[selectedCurrencyCode];
      if (pricesForCurrency && pricesForCurrency[selectedPriceType] !== undefined) {
        setUnitPrice(pricesForCurrency[selectedPriceType].toFixed(2));
        setError(null);
      } else {
        setUnitPrice('0.00');
        setError(`لا يوجد سعر لنوع السعر المحدد (${selectedPriceType}) لهذه العملة.`);
      }
    }
  }, [selectedPriceType, selectedProduct, selectedCurrencyCode]);


  const productOptions = useMemo(() => {
    return availableProducts.map(p => ({ value: p.id, label: p.name }));
  }, [availableProducts]);

  // NEW: Generate options for Price Type dropdown
  const priceTypeOptions = useMemo(() => {
    if (!selectedProduct || !selectedCurrencyCode) return [];
    const pricesForCurrency = selectedProduct.prices_by_currency?.[selectedCurrencyCode];
    if (!pricesForCurrency) return [];

    const options = [];
    if (pricesForCurrency.general !== undefined) {
      options.push({ value: 'general', label: `عام: ${pricesForCurrency.general.toFixed(2)} ${selectedCurrencyCode}` });
    }
    if (pricesForCurrency.wholesale !== undefined) {
      options.push({ value: 'wholesale', label: `جملة: ${pricesForCurrency.wholesale.toFixed(2)} ${selectedCurrencyCode}` });
    }
    if (pricesForCurrency.retail !== undefined) {
      options.push({ value: 'retail', label: `تجزئة: ${pricesForCurrency.retail.toFixed(2)} ${selectedCurrencyCode}` });
    }
    return options;
  }, [selectedProduct, selectedCurrencyCode]);

  const handleProductSelect = (productId) => {
    const product = availableProducts.find(p => p.id === productId);
    setSelectedProduct(product);
  };

  const handleSubmit = (e) => {
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
    if (!selectedPriceType) { // NEW: Validate price type
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
      price_type: selectedPriceType // NEW: Add price type to the product object
    };

    setIsLoading(true);
    // Simulate API call or processing
    setTimeout(() => {
      onAddProductConfirm(newProductInOrder);
      onClose();
      setIsLoading(false);
    }, 500);
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
        <div>
          <label className="block mb-1 text-gray-400">المنتج</label>
          <select
            className={`w-full p-2 rounded bg-gray-800 border ${error?.includes('منتج') ? 'border-red-500' : 'border-gray-600'}`}
            value={selectedProduct?.id || ''}
            onChange={(e) => handleProductSelect(e.target.value)}
          >
            <option value="">اختر منتج...</option>
            {productOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {error && error.includes('منتج') && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>

        {/* Quantity */}
        <FormInputField
          label="الكمية"
          type="number"
          placeholder="أدخل الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={error && error.includes('كمية') ? error : null}
        />

        {/* NEW: Price Type Selection */}
        <FormSelectField
          label={`نوع السعر (${selectedCurrencyCode || 'لا توجد عملة'})`}
          value={selectedPriceType}
          onChange={(e) => setSelectedPriceType(e.target.value)}
          options={priceTypeOptions}
          error={error && error.includes('نوع السعر') ? error : null}
          disabled={!selectedProduct || priceTypeOptions.length === 0} // Disable if no product or no price types
        />

        {/* Unit Price (Read-only) */}
        <FormInputField
          label={`سعر الوحدة (${selectedCurrencyCode || 'لا توجد عملة'})`}
          type="text"
          placeholder="السعر للوحدة"
          value={unitPrice}
          readOnly // Make this read-only
          className="pointer-events-none opacity-70" // Add styles to visually indicate read-only
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
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="accentColor hover:bg-purple-700 py-2 px-4 rounded"
            disabled={isLoading}
          >
            {isLoading ? 'جاري الإضافة...' : 'إضافة'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
