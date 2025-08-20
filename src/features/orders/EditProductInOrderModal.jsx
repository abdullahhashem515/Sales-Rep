import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import { toast } from "react-toastify";

export default function EditProductInOrderModal({
  show,
  onClose,
  onUpdateProductConfirm,
  productToEdit,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // عند فتح المودال، جهز البيانات
  useEffect(() => {
    if (show && productToEdit) {
      setIsVisible(true);
      setCurrentQuantity(productToEdit.quantity.toString());
      setError(null);
      setIsLoading(false);
    } else {
      setIsVisible(false);
    }
  }, [show, productToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (
      !currentQuantity.trim() ||
      isNaN(parseInt(currentQuantity)) ||
      parseInt(currentQuantity) <= 0
    ) {
      setError("الرجاء إدخال كمية صحيحة أكبر من صفر.");
      toast.error("الرجاء إدخال كمية صحيحة.");
      return;
    }

    const qty = parseInt(currentQuantity);

    // نضمن أن updatedProduct يحتوي على الوحدة
    const updatedProduct = {
      ...productToEdit,
      quantity: qty,
      unit: productToEdit.unit || "",
    };

    setIsLoading(true);
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
      title={`تعديل: ${productToEdit ? `${productToEdit.name} ${productToEdit.unit || ""}` : "المنتج"}`}
      maxWidth="max-w-md"
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-4 text-right"
      >
        {/* Product Name (Read-only) */}
        <FormInputField
          label="اسم المنتج"
          type="text"
          value={productToEdit ? `${productToEdit.name} ${productToEdit.unit || ""}` : ""}
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
          error={error && error.includes("كمية") ? error : null}
          min="1"
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
            disabled={isLoading}
          >
            {isLoading ? "جاري التحديث..." : "تحديث"}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
