import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField";
import { toast } from 'react-toastify';

export default function EditProductInOrderModal({
  show,
  onClose,
  onUpdateProductConfirm,
  productToEdit,
  allAvailableProducts,
  selectedCurrencyCode,
  orderType,
  salespersonType
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState('');
  const [currentUnitPrice, setCurrentUnitPrice] = useState('');
  const [selectedPriceType, setSelectedPriceType] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Find the full product details
  const fullProductDetails = useMemo(() => {
    return allAvailableProducts.find(p => p.id === productToEdit?.product_id);
  }, [productToEdit, allAvailableProducts]);

  // Set initial state when modal opens
  useEffect(() => {
    if (show && productToEdit) {
      setIsVisible(true);
      setCurrentQuantity(productToEdit.quantity.toString());
      
      const pricesByCurrencyArray = fullProductDetails?.prices_by_currency?.[selectedCurrencyCode];
      let pricesForCurrencyLookup = {};
      
      if (Array.isArray(pricesByCurrencyArray)) {
        pricesByCurrencyArray.forEach(priceEntry => {
          pricesForCurrencyLookup[priceEntry.type_user] = priceEntry.price;
        });
      }

      // Set initial price type based on product's price_type or salesperson type
      let initialPriceType = productToEdit.price_type;
      
      if (!initialPriceType) {
        if (salespersonType === 'ws_rep' && pricesForCurrencyLookup.wholesale !== undefined) {
          initialPriceType = 'wholesale';
        } else if (salespersonType === 'retail_rep' && pricesForCurrencyLookup.retail !== undefined) {
          initialPriceType = 'retail';
        } else if (pricesForCurrencyLookup.general !== undefined) {
          initialPriceType = 'general';
        }
      }

      if (initialPriceType && pricesForCurrencyLookup[initialPriceType] !== undefined) {
        setSelectedPriceType(initialPriceType);
        setCurrentUnitPrice(parseFloat(pricesForCurrencyLookup[initialPriceType]).toFixed(2));
      } else {
        setSelectedPriceType('');
        setCurrentUnitPrice('0.00');
        setError('لا يوجد سعر لهذا المنتج بالعملة المحددة.');
      }
      
      setError(null);
      setIsLoading(false);
    } else {
      setIsVisible(false);
    }
  }, [show, productToEdit, fullProductDetails, selectedCurrencyCode, salespersonType]);

  // Update unit price when selectedPriceType changes
  useEffect(() => {
    if (fullProductDetails && selectedCurrencyCode && selectedPriceType) {
      const pricesByCurrencyArray = fullProductDetails.prices_by_currency?.[selectedCurrencyCode];
      let pricesForCurrencyLookup = {};
      
      if (Array.isArray(pricesByCurrencyArray)) {
        pricesByCurrencyArray.forEach(priceEntry => {
          pricesForCurrencyLookup[priceEntry.type_user] = priceEntry.price;
        });
      }

      if (pricesForCurrencyLookup[selectedPriceType] !== undefined) {
        setCurrentUnitPrice(parseFloat(pricesForCurrencyLookup[selectedPriceType]).toFixed(2));
        setError(null);
      } else {
        setCurrentUnitPrice('0.00');
        setError(`لا يوجد سعر لنوع السعر المحدد (${selectedPriceType}) لهذه العملة.`);
      }
    }
  }, [selectedPriceType, fullProductDetails, selectedCurrencyCode]);

  // Generate price type options
  const priceTypeOptions = useMemo(() => {
    if (!fullProductDetails || !selectedCurrencyCode) return [];
    
    const pricesByCurrencyArray = fullProductDetails.prices_by_currency?.[selectedCurrencyCode];
    if (!Array.isArray(pricesByCurrencyArray) || pricesByCurrencyArray.length === 0) return [];

    const options = [];
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

    return options;
  }, [fullProductDetails, selectedCurrencyCode]);

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

    if (!selectedPriceType) {
      setError('الرجاء اختيار نوع السعر.');
      toast.error('الرجاء اختيار نوع السعر.');
      return;
    }

    const qty = parseInt(currentQuantity);
    const price = parseFloat(currentUnitPrice);
    const totalProductPrice = qty * price;

    const updatedProduct = {
      ...productToEdit,
      quantity: qty,
      unit_price: price,
      total: totalProductPrice,
      price_type: selectedPriceType
    };

    setIsLoading(true);
    setTimeout(() => {
      onUpdateProductConfirm(updatedProduct);
      onClose();
      setIsLoading(false);
    }, 500);
  };

  const isPriceValid = !error && parseFloat(currentUnitPrice) > 0 && selectedPriceType;

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
          min="1"
        />

        {/* Price Type Selection */}
        {priceTypeOptions.length > 0 && (
          <FormSelectField
            label={`نوع السعر (${selectedCurrencyCode || 'لا توجد عملة'})`}
            value={selectedPriceType}
            onChange={(e) => setSelectedPriceType(e.target.value)}
            options={priceTypeOptions}
            error={error && error.includes('نوع السعر') ? error : null}
          />
        )}

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

        {error && (
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
            disabled={isLoading || !isPriceValid}
          >
            {isLoading ? 'جاري التحديث...' : 'تحديث'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}