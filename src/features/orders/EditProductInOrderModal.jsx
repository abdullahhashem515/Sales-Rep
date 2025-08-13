import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField"; // For price selection
import { toast } from 'react-toastify';

/**
 * مكون مودال لتعديل منتج موجود داخل الطلب.
 * يسمح بتعديل الكمية والسعر بناءً على قائمة الأسعار المتاحة للمنتج بالعملة المختارة.
 *
 * @param {object} props
 * @param {boolean} props.show - حالة عرض/إخفاء المودال.
 * @param {function} props.onClose - دالة تستدعى عند إغلاق المودال.
 * @param {function} props.onUpdateProductConfirm - دالة تستدعى عند تأكيد تعديل المنتج، تمرر كائن المنتج المحدث.
 * @param {object} props.productToEdit - كائن المنتج المراد تعديله من قائمة المنتجات في الطلب.
 * مثال: { product_id: 'PROD001', name: 'أرز المجد', quantity: 2, unit_price: 7500.25, total: 15000.50 }
 * @param {Array<object>} props.allAvailableProducts - قائمة بجميع المنتجات المتاحة في النظام.
 * مثال: [{ id: 'PROD001', name: 'أرز المجد', prices_by_currency: { YER: { general: 7500, wholesale: 7000 } } }]
 * @param {string} props.selectedCurrencyCode - رمز العملة المحدد للطلب الحالي (مثال: 'YER').
 * @param {string} props.orderType - نوع الطلب ('cash' or 'credit').
 */
export default function EditProductInOrderModal({
  show,
  onClose,
  onUpdateProductConfirm,
  productToEdit,
  allAvailableProducts, // All products from the system to get price variants
  selectedCurrencyCode,
  orderType
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [currentUnitPrice, setCurrentUnitPrice] = useState('');
  const [selectedPriceType, setSelectedPriceType] = useState('general'); // 'general', 'wholesale' etc.
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Find the full product details from allAvailableProducts using productToEdit.product_id
  const fullProductDetails = useMemo(() => {
    return allAvailableProducts.find(p => p.id === productToEdit?.product_id);
  }, [productToEdit, allAvailableProducts]);

  // Generate price options based on the selected currency and available price types
  const priceOptions = useMemo(() => {
    if (!fullProductDetails || !selectedCurrencyCode) return [];
    const pricesForCurrency = fullProductDetails.prices_by_currency?.[selectedCurrencyCode];
    if (!pricesForCurrency) return [];

    const options = [];
    if (pricesForCurrency.general !== undefined) {
      options.push({ value: 'general', label: `عام: ${pricesForCurrency.general.toFixed(2)}` });
    }
    if (pricesForCurrency.wholesale !== undefined) {
      options.push({ value: 'wholesale', label: `جملة: ${pricesForCurrency.wholesale.toFixed(2)}` });
    }
    // Add other price types if applicable (e.g., retail)
    return options;
  }, [fullProductDetails, selectedCurrencyCode]);

  // Set initial state from productToEdit when modal opens
  useEffect(() => {
    if (show && productToEdit) {
      setIsVisible(true);
      setCurrentQuantity(productToEdit.quantity.toString());
      setCurrentUnitPrice(productToEdit.unit_price.toFixed(2));
      
      // Attempt to determine the original price type if possible
      const pricesForCurrency = fullProductDetails?.prices_by_currency?.[selectedCurrencyCode];
      if (pricesForCurrency) {
        if (pricesForCurrency.general === productToEdit.unit_price) {
          setSelectedPriceType('general');
        } else if (pricesForCurrency.wholesale === productToEdit.unit_price) {
          setSelectedPriceType('wholesale');
        } else {
          // If the current unit price doesn't match a known type, default to general or first available
          setSelectedPriceType(priceOptions.length > 0 ? priceOptions[0].value : 'general');
        }
      } else {
        setSelectedPriceType('general'); // Default if no prices found
      }
      setError(null);
      setIsLoading(false);
    } else {
      setIsVisible(false);
    }
  }, [show, productToEdit, fullProductDetails, selectedCurrencyCode, priceOptions]);


  // Update unit price when selectedPriceType changes
  useEffect(() => {
    if (fullProductDetails && selectedCurrencyCode && selectedPriceType) {
      const pricesForCurrency = fullProductDetails.prices_by_currency?.[selectedCurrencyCode];
      if (pricesForCurrency && pricesForCurrency[selectedPriceType] !== undefined) {
        setCurrentUnitPrice(pricesForCurrency[selectedPriceType].toFixed(2));
      } else {
        setCurrentUnitPrice('0.00'); // No price found for selected type
        setError(`لا يوجد سعر لنوع السعر المحدد (${selectedPriceType}) لهذه العملة.`);
      }
    }
  }, [selectedPriceType, fullProductDetails, selectedCurrencyCode]);


  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!currentQuantity.trim() || isNaN(parseInt(currentQuantity)) || parseInt(currentQuantity) <= 0) {
      setError('الرجاء إدخال كمية صحيحة أكبر من صفر.');
      toast.error('الرجاء إدخال كمية صحيحة.');
      return;
    }
    if (!currentUnitPrice || parseFloat(currentUnitPrice) <= 0) {
      setError('المنتج لا يحتوي على سعر صالح بالعملة المختارة.');
      toast.error('سعر المنتج غير صالح.');
      return;
    }

    const qty = parseInt(currentQuantity);
    const price = parseFloat(currentUnitPrice);
    const totalProductPrice = qty * price;

    const updatedProduct = {
      ...productToEdit, // Keep existing product_id, name etc.
      quantity: qty,
      unit_price: price,
      total: totalProductPrice
    };

    setIsLoading(true);
    // Simulate API call or processing
    setTimeout(() => {
      onUpdateProductConfirm(updatedProduct);
      onClose();
      setIsLoading(false);
    }, 500);
  };

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={isVisible}
      title={`تعديل: ${productToEdit?.name || 'المنتج'}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        {/* Product Name (Read-only) */}
        <FormInputField
          label="اسم المنتج"
          type="text"
          value={productToEdit?.name || ''}
          readOnly
          className="pointer-events-none opacity-70"
        />

        {/* Quantity */}
        <FormInputField
          label="الكمية"
          type="number"
          placeholder="أدخل الكمية"
          value={currentQuantity}
          onChange={(e) => setCurrentQuantity(e.target.value)}
          error={error && error.includes('كمية') ? error : null}
        />

        {/* Price Type Selection */}
        <FormSelectField
          label={`نوع السعر (${selectedCurrencyCode || 'لا توجد عملة'})`}
          value={selectedPriceType}
          onChange={(e) => setSelectedPriceType(e.target.value)}
          options={priceOptions}
          error={error && error.includes('نوع السعر') ? error : null}
        />

        {/* Unit Price (Read-only) */}
        <FormInputField
          label={`سعر الوحدة (${selectedCurrencyCode || 'لا توجد عملة'})`}
          type="text"
          placeholder="السعر للوحدة"
          value={currentUnitPrice}
          readOnly
          className="pointer-events-none opacity-70"
          error={error && error.includes('سعر صالح') ? error : null}
        />

        {error && !error.includes('كمية') && !error.includes('سعر صالح') && !error.includes('نوع السعر') && (
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
            {isLoading ? 'جاري التحديث...' : 'تحديث'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
