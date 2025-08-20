import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import SearchableSelectField from "../../components/shared/SearchableSelectField";
import { toast } from "react-toastify";

export default function AddProductToOrderModal({
  show,
  onClose,
  onAddProductConfirm,
  availableProducts,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState(null);

  // إعادة التهيئة عند فتح المودال
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setSelectedProduct(null);
      setQuantity("");
      setError(null);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  // خيارات المنتجات بصيغة { value, label }
  const productOptions = useMemo(() => {
    if (!Array.isArray(availableProducts)) return [];
    return availableProducts.map((p) => ({
      value: p.id,
      label: `${p.name} ${p.unit}`,
      unit: p.unit,
      name: p.name
    }));
  }, [availableProducts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedProduct) {
      setError("الرجاء اختيار منتج.");
      toast.error("الرجاء اختيار منتج.");
      return;
    }

    if (!quantity.trim() || isNaN(parseInt(quantity)) || parseInt(quantity) <= 0) {
      setError("الرجاء إدخال كمية صحيحة أكبر من صفر.");
      toast.error("الرجاء إدخال كمية صحيحة.");
      return;
    }

    const qty = parseInt(quantity);

    const newProductInOrder = {
      product_id: selectedProduct.value,
      name: selectedProduct.name,
      unit: selectedProduct.unit,
      quantity: qty,
    };

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
          value={selectedProduct ? selectedProduct.value : ""}
          onChange={(id) => {
            const product = productOptions.find(p => p.value === id);
            setSelectedProduct(product || null);
          }}
          options={productOptions}
          error={error && error.includes("منتج") ? error : null}
          placeholder="ابحث أو اختر منتج..."
        />

        {/* Quantity */}
        <FormInputField
          label="الكمية"
          type="number"
          placeholder="أدخل الكمية"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          error={error && error.includes("كمية") ? error : null}
        />

        {error && !error.includes("منتج") && !error.includes("كمية") && (
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
