import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormLayout from "../../components/shared/FormLayout"; 
import FormInputField from "../../components/shared/FormInputField"; 
import FormSelectField from "../../components/shared/FormSelectField"; 
import SearchableSelectField from "../../components/shared/SearchableSelectField"; // NEW: Import SearchableSelectField
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from 'react-toastify'; 
import { put, get } from '../../utils/apiService'; 

// Helper to convert name to slug (simple version) - copied from AddCategoryModal
const convertToSlug = (text) => {
  if (!text) return '';
  const arabicToLatin = {
    'أ': 'a', 'ا': 'a', 'إ': 'i', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't',
    'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
    'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ء': '', 'ؤ': 'o', 'ئ': 'i', 'ة': 'a', '؟': '',
    ' ': '-', '.': '', ',': '', '/': '-', '\\': '-', '(': '', ')': ''
  };
  return text
    .split('')
    .map(char => arabicToLatin[char] || char)
    .join('')
    .toLowerCase()
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '') 
    .replace(/--+/g, '-') 
    .replace(/^-+|-+$/g, ''); 
};

export default function UpdateProductModal({ show, onClose, productToEdit, availableCategories, availableCurrencies }) {
  const [isVisible, setIsVisible] = useState(false);
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  // State to hold all prices, mapped by currency code
  const [allProductPrices, setAllProductPrices] = useState({});
  // State to track the currently selected currency for price entry
  const [selectedPriceCurrencyCode, setSelectedPriceCurrencyCode] = useState('');

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // State to hold original product data for comparison
  const [originalProductData, setOriginalProductData] = useState(null);

  // Populate form fields and reset errors when modal opens or productToEdit changes
  useEffect(() => {
    if (show && productToEdit) {
      setIsVisible(true);
      setProductName(productToEdit.name || '');
      setProductCategory(productToEdit.categoryName || ''); 
      setErrors({});
      setIsLoading(false);

      // Initialize allProductPrices from productToEdit.prices
      const initialPrices = {};
      availableCurrencies.forEach(code => {
        initialPrices[code] = []; 
      });
      // Populate with existing prices
      productToEdit.prices?.forEach(price => {
        if (!initialPrices[price.currency]) {
          initialPrices[price.currency] = []; 
        }
        initialPrices[price.currency].push(String(price.value)); 
      });
      setAllProductPrices(initialPrices);

      // Set initial selected currency for display in the price section
      if (productToEdit.prices && productToEdit.prices.length > 0) {
        setSelectedPriceCurrencyCode(productToEdit.prices[0].currency);
      } else if (availableCurrencies.length > 0) {
        setSelectedPriceCurrencyCode(availableCurrencies[0]);
      } else {
        setSelectedPriceCurrencyCode('');
      }

      // Store original data for change detection
      setOriginalProductData({
        name: productToEdit.name || '',
        categoryName: productToEdit.categoryName || '',
        prices: productToEdit.prices ? JSON.parse(JSON.stringify(productToEdit.prices)) : [], 
      });

    } else if (!show) {
      // Reset all states when modal is closed
      setProductName('');
      setProductCategory('');
      setAllProductPrices({});
      setSelectedPriceCurrencyCode('');
      setErrors({});
      setOriginalProductData(null);
    }
  }, [show, productToEdit, availableCurrencies]);


  // Handle close with transition
  const handleClose = (isSuccess = false) => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(isSuccess);
    }, 100); 
  };

  // Get current prices for the selected currency code
  const currentPricesForSelectedCurrency = allProductPrices[selectedPriceCurrencyCode] || [];

  const handlePriceValueChange = (index, value) => {
    const newPrices = [...currentPricesForSelectedCurrency];
    newPrices[index] = value;
    setAllProductPrices(prevPrices => ({
      ...prevPrices,
      [selectedPriceCurrencyCode]: newPrices
    }));
  };

  const handleAddPriceField = () => {
    if (currentPricesForSelectedCurrency.length < 5) {
      setAllProductPrices(prevPrices => ({
        ...prevPrices,
        [selectedPriceCurrencyCode]: [...currentPricesForSelectedCurrency, ''] 
      }));
    } else {
      toast.info("لا يمكنك إضافة أكثر من 5 أسعار للعملة الواحدة."); 
    }
  };

  const handleRemovePriceField = (index) => {
    const newPrices = currentPricesForSelectedCurrency.filter((_, i) => i !== index);
    setAllProductPrices(prevPrices => ({
      ...prevPrices,
      [selectedPriceCurrencyCode]: newPrices
    }));
  };

  const handleSubmit = async (e) => { 
    e.preventDefault();
    setErrors({});
    let currentErrors = {};

    if (!productName.trim()) {
      currentErrors.productName = 'اسم المنتج مطلوب.';
    }
    // Validate that a category has been selected (or typed and it exists in options)
    if (!productCategory.trim() || !availableCategories.includes(productCategory)) {
      currentErrors.productCategory = 'يجب اختيار فئة صالحة للمنتج.';
    }

    const finalProductPrices = [];
    Object.keys(allProductPrices).forEach(currencyCode => {
      allProductPrices[currencyCode].forEach((value, index) => {
        if (!value.trim()) {
          currentErrors[`priceValue_${currencyCode}_${index}`] = `قيمة السعر للعملة ${currencyCode} مطلوبة.`;
        } else if (isNaN(parseFloat(value))) {
          currentErrors[`priceValue_${currencyCode}_${index}`] = `قيمة السعر للعملة ${currencyCode} يجب أن تكون رقماً.`;
        }
        if (value.trim() && !isNaN(parseFloat(value))) {
          finalProductPrices.push({ currency: currencyCode, value: parseFloat(value) }); 
        }
      });
    });

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      toast.error('يرجى تصحيح الأخطاء في النموذج.');
      return;
    }

    if (finalProductPrices.length === 0) {
      currentErrors.general = 'يجب إضافة سعر واحد على الأقل للمنتج.';
      setErrors(currentErrors);
      toast.error('يجب إضافة سعر واحد على الأقل للمنتج.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setErrors({ general: 'لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.' });
        toast.error('لا يوجد رمز مصادقة.');
        setIsLoading(false);
        return;
      }

      // Check for changes before submitting
      const isNameChanged = productName !== originalProductData.name;
      const isCategoryChanged = productCategory !== originalProductData.categoryName;
      // Deep comparison for prices - order of prices doesn't matter for comparison, just content
      const isPricesChanged = JSON.stringify(finalProductPrices.sort((a, b) => a.currency.localeCompare(b.currency) || a.value - b.value)) !== 
                               JSON.stringify(originalProductData.prices.sort((a, b) => a.currency.localeCompare(b.currency) || a.value - b.value));

      if (!isNameChanged && !isCategoryChanged && !isPricesChanged) {
        toast.info('لم يتم إجراء أي تغييرات للحفظ.');
        handleClose(true);
        return;
      }

      const payload = { 
        name: productName,
        category: productCategory, 
        prices: finalProductPrices
      };
      console.log("UpdateProductModal: Sending payload to API:", payload);
      console.log("Full API Endpoint for update:", `admin/products/${productToEdit.slug}`);

      const response = await put(`admin/products/${productToEdit.slug}`, payload, token);

      console.log("UpdateProductModal: API response:", response);

      if (response.status) { 
        toast.success('تم تحديث المنتج بنجاح!');
        handleClose(true); 
      } else {
        const apiErrorMessage = response.message || 'فشل تحديث المنتج.';
        setErrors({ general: apiErrorMessage });
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("UpdateProductModal: Caught error during product PUT:", err);
      const errorMessage = err.message || 'حدث خطأ غير متوقع عند تحديث المنتج.';

      if (errorMessage.includes('Duplicate entry')) {
        if (errorMessage.includes('products_slug_unique') || errorMessage.includes('products_name_unique')) {
          setErrors(prev => ({ ...prev, productName: 'هذا الاسم مستخدم بالفعل.' }));
          toast.error('فشل تحديث المنتج: الاسم مكرر.');
        } else {
          setErrors({ general: 'هذا المنتج موجود بالفعل (خطأ تكرار).' });
          toast.error('فشل تحديث المنتج: المنتج موجود بالفعل (خطأ تكرار).');
        }
      } else if (err.status === 422) {
        const backendErrorMessage = err.message || 'فشل التحقق من البيانات.';
        if (backendErrorMessage.includes('name')) {
          setErrors(prev => ({ ...prev, productName: backendErrorMessage }));
        } else if (backendErrorMessage.includes('category')) {
          setErrors(prev => ({ ...prev, productCategory: backendErrorMessage }));
        } else {
          setErrors({ general: 'خطأ في التحقق من البيانات: ' + backendErrorMessage });
        }
        toast.error('فشل تحديث المنتج: ' + backendErrorMessage);
      } else {
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
        handleClose(false); 
      }
    } finally {
      setIsLoading(false);
    }
  };

  const staticFieldsConfig = [
    {
      fields: [
        {
          label: "اسم المنتج",
          type: "text",
          placeholder: "أدخل اسم المنتج",
          value: productName,
          onChange: (e) => setProductName(e.target.value),
          error: errors.productName,
        },
        {
          label: "اسم الفئة",
          type: "searchable-select", // Use new type for SearchableSelectField
          value: productCategory,
          onChange: (value) => setProductCategory(value), // onChange now returns the selected value directly
          options: availableCategories, // Pass categories directly
          error: errors.productCategory,
          placeholder: "ابحث أو اختر فئة", // Placeholder for searchable select
        },
      ],
    },
  ];

  if (!show) return null;

  return (
    <ModalWrapper show={show} onClose={handleClose} isVisible={isVisible} title="تعديل منتج" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
        {/* Render fields using FormLayout, which will now handle 'searchable-select' type */}
        {staticFieldsConfig.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-col md:flex-row md:gap-4">
            {row.fields.map((field, fieldIndex) => {
              if (field.type === 'searchable-select') { // Custom render for searchable-select
                return (
                  <SearchableSelectField
                    key={fieldIndex}
                    label={field.label}
                    value={field.value}
                    onChange={field.onChange}
                    options={field.options}
                    error={field.error}
                    placeholder={field.placeholder}
                    className="flex-1"
                  />
                );
              } else if (field.type === 'select') { // Existing select field
                return (
                  <FormSelectField
                    key={fieldIndex}
                    label={field.label}
                    value={field.value}
                    onChange={field.onChange}
                    options={field.options}
                    error={field.error}
                    className="flex-1"
                  />
                );
              } else { // Standard input field
                return (
                  <FormInputField
                    key={fieldIndex}
                    label={field.label}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={field.onChange}
                    error={field.error}
                    className="flex-1"
                  />
                );
              }
            })}
             {row.fields.length === 1 && <div className="flex-1"></div>}
          </div>
        ))}
        {/* End of FormLayout replacement logic */}

        <div className="border border-gray-700 p-4 rounded-lg">
          <h4 className="text-lg font-bold mb-3">تفاصيل الأسعار (لكل عملة حتى 5 أسعار)</h4>
          
          <FormSelectField
            label="العملة الرئيسية للأسعار"
            value={selectedPriceCurrencyCode}
            onChange={(e) => setSelectedPriceCurrencyCode(e.target.value)}
            options={availableCurrencies}
            className="mb-4"
          />

          {selectedPriceCurrencyCode && currentPricesForSelectedCurrency.map((priceValue, index) => (
            <div key={`${selectedPriceCurrencyCode}-${index}`} className="flex gap-4 mb-3 items-end">
              <FormInputField
                label={index === 0 ? `السعر (${selectedPriceCurrencyCode})` : ""}
                type="text"
                placeholder="قيمة السعر"
                value={priceValue}
                onChange={(e) => handlePriceValueChange(index, e.target.value)}
                error={errors[`priceValue_${selectedPriceCurrencyCode}_${index}`]}
                className="flex-grow" 
              />
              {currentPricesForSelectedCurrency.length > 0 && ( 
                <button
                  type="button"
                  onClick={() => handleRemovePriceField(index)}
                  className="bg-red-500 hover:bg-red-600 p-2 rounded mb-1 flex-shrink-0"
                >
                  <XMarkIcon className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          ))}

          {selectedPriceCurrencyCode && currentPricesForSelectedCurrency.length < 5 && (
            <button
              type="button"
              onClick={handleAddPriceField}
              className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded flex items-center justify-center gap-1 mt-2"
            >
              <PlusIcon className="w-4 h-4 text-white" />
              <span>إضافة سعر آخر لـ {selectedPriceCurrencyCode}</span>
            </button>
          )}

          {!selectedPriceCurrencyCode && (
            <p className="text-gray-400 text-center">يرجى اختيار عملة لإضافة الأسعار.</p>
          )}

        </div>

        {errors.general && <p className="text-red-500 text-xs mt-1 text-center">{errors.general}</p>}

        <button
          type="submit"
          className="mt-4 accentColor hover:bg-purple-700 py-2 px-4 rounded w-full"
          disabled={isLoading}
        >
          {isLoading ? 'جاري التعديل...' : 'حفظ التعديل'}
        </button>
      </form>
    </ModalWrapper>
  );
}
