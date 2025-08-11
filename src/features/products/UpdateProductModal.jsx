import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormLayout from "../../components/shared/FormLayout"; 
import FormInputField from "../../components/shared/FormInputField"; 
import FormSelectField from "../../components/shared/FormSelectField"; 
import SearchableSelectField from "../../components/shared/SearchableSelectField"; 
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
  const [productUnit, setProductUnit] = useState(''); 
  const [productCategory, setProductCategory] = useState('');
  // حالة للاحتفاظ بجميع الأسعار، مع ربطها برمز العملة. كل إدخال سعر يتضمن الآن type_user.
  // Example: { "YER": [{ value: 1000, type_user: "general" }], "USD": [] }
  const [allProductPrices, setAllProductPrices] = useState({});
  // حالة لتتبع رمز العملة المحدد حاليًا لإدخال السعر
  const [selectedPriceCurrencyCode, setSelectedPriceCurrencyCode] = useState('');

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // States for fetching categories internally, mirroring AddProductModal
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errorFetchingCategories, setErrorFetchingCategories] = useState(null);

  // State to hold original product data for comparison
  const [originalProductData, setOriginalProductData] = useState(null);

  // تعريف خيارات نوع المستخدم وقيمها API وعناوين العرض
  const typeUserOptions = [
    { label: 'عام', value: 'general' }, 
    { label: 'مندوب جملة', value: 'ws_rep' },
    { label: 'مندوب التجزئة', value: 'retail_rep' },
  ];

  // Helper function to map API type_user to internal typeUserOptions value
  const mapApiTypeUserToOptionValue = (apiType) => {
    switch (apiType) {
      case 'wholesale': return 'ws_rep';
      case 'retail': return 'retail_rep';
      case 'general': return 'general';
      default: return apiType; // Fallback for any unknown type
    }
  };

  // Helper function to map internal typeUserOptions value to API type_user
  const mapOptionValueToApiTypeUser = (optionValue) => {
    switch (optionValue) {
      case 'ws_rep': return 'wholesale';
      case 'retail_rep': return 'retail';
      case 'general': return 'general';
      default: return optionValue; // Fallback for any unknown type
    }
  };

  // Populate form fields and reset errors when modal opens or productToEdit changes
  useEffect(() => {
    if (show && productToEdit) {
      setIsVisible(true);
      setProductName(productToEdit.name || '');
      setProductUnit(productToEdit.unit || ''); 
      // Set category by name for SearchableSelectField
      setProductCategory(productToEdit.category?.name || ''); 
      setErrors({});
      setIsLoading(false);

      // Initialize allProductPrices from productToEdit.prices_by_currency
      const initialPrices = {};
      // Ensure all available currencies are represented, even if no prices
      availableCurrencies.forEach(currency => { 
        initialPrices[currency.code] = [];
      });

      // Populate with existing prices from prices_by_currency
      if (productToEdit.prices_by_currency) {
        Object.keys(productToEdit.prices_by_currency).forEach(currencyCode => {
          initialPrices[currencyCode] = productToEdit.prices_by_currency[currencyCode].map(priceEntry => ({
            value: String(priceEntry.price), // Convert to string for input field
            type_user: mapApiTypeUserToOptionValue(priceEntry.type_user) // Map for display
          }));
        });
      }
      setAllProductPrices(initialPrices);

      // Set initial selected currency for display in the price section
      if (productToEdit.prices_by_currency && Object.keys(productToEdit.prices_by_currency).length > 0) {
        setSelectedPriceCurrencyCode(Object.keys(productToEdit.prices_by_currency)[0]);
      } else if (availableCurrencies.length > 0) {
        setSelectedPriceCurrencyCode(availableCurrencies[0].code);
      } else {
        setSelectedPriceCurrencyCode('');
      }

      // Store original data for change detection (flattened for consistent comparison)
      const originalFlattenedPrices = [];
      if (productToEdit.prices_by_currency) {
        Object.keys(productToEdit.prices_by_currency).forEach(currencyCode => {
          productToEdit.prices_by_currency[currencyCode].forEach(priceEntry => {
            originalFlattenedPrices.push({
              currency_code: currencyCode,
              price: priceEntry.price,
              type_user: priceEntry.type_user // Store raw API type_user
            });
          });
        });
      }

      setOriginalProductData({
        name: productToEdit.name || '',
        unit: productToEdit.unit || '', 
        category_slug: productToEdit.category?.slug || '', 
        prices: originalFlattenedPrices, 
      });

    } else if (!show) {
      // Reset all states when modal is closed
      setProductName('');
      setProductUnit(''); 
      setProductCategory('');
      setAllProductPrices({});
      setSelectedPriceCurrencyCode('');
      setErrors({});
      setOriginalProductData(null);
    }
  }, [show, productToEdit, availableCurrencies]);

  // NEW: useEffect for fetching categories internally, mirroring AddProductModal
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setErrorFetchingCategories(null);
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          setErrorFetchingCategories('Authentication token is missing.');
          toast.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
          return;
        }
        const response = await get('admin/categories', token);
        console.log("UpdateProductModal: Categories API raw Response:", response);

        if (Array.isArray(response)) {
          setCategories(response);
          console.log("UpdateProductModal: Categories state after fetch (direct array):", response);
        } 
        else if (response && Array.isArray(response.categories)) {
          setCategories(response.categories);
          console.log("UpdateProductModal: Categories state after fetch (from object.categories):", response.categories);
        } else {
          console.warn("UpdateProductModal: API response for categories is unexpected:", response);
          setErrorFetchingCategories('هيكل استجابة الفئات غير متوقع.');
          setCategories([]);
        }
      } catch (err) {
        console.error("Failed to fetch categories in UpdateProductModal:", err);
        setErrorFetchingCategories(err.message || 'فشل في جلب الفئات.');
        toast.error('فشل في جلب الفئات: ' + (err.message || 'خطأ غير معروف.'));
      } finally {
        setLoadingCategories(false);
      }
    };

    if (show) {
      fetchCategories();
    }
  }, [show]); // Depend only on 'show'

  // Handle close with transition
  const handleClose = (isSuccess = false) => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(isSuccess);
    }, 100); 
  };

  // Get current prices for the selected currency code
  const currentPricesForSelectedCurrency = allProductPrices[selectedPriceCurrencyCode] || [];

  // Handle changes for both price value and type_user
  const handlePriceFieldChange = (index, field, value) => {
    const newPrices = [...currentPricesForSelectedCurrency];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setAllProductPrices(prevPrices => ({
      ...prevPrices,
      [selectedPriceCurrencyCode]: newPrices
    }));
  };

  const handleAddPriceField = () => {
    if (currentPricesForSelectedCurrency.length < 5) { // Limit to 5 prices overall
      setAllProductPrices(prevPrices => ({
        ...prevPrices,
        [selectedPriceCurrencyCode]: [...currentPricesForSelectedCurrency, { value: '', type_user: typeUserOptions[0]?.value || '' }] 
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
    if (!productUnit.trim()) { 
      currentErrors.productUnit = 'وحدة المنتج مطلوبة (مثال: 25 kg).';
    }
    // Validate that a category has been selected (and get its slug)
    // IMPORTANT: Now using 'categories' from local state, not 'availableCategories' prop
    const selectedCategoryObject = categories.find(cat => cat.name === productCategory);
    if (!productCategory.trim() || !selectedCategoryObject) {
      currentErrors.productCategory = 'يجب اختيار فئة صالحة للمنتج.';
    }

    const finalProductPrices = [];
    Object.keys(allProductPrices).forEach(currencyCode => {
      allProductPrices[currencyCode].forEach((priceEntry, index) => {
        // Validation for price value and type_user
        if (!String(priceEntry.value).trim()) { 
          currentErrors[`priceValue_${currencyCode}_${index}`] = `قيمة السعر للعملة ${currencyCode} مطلوبة.`;
        } else if (isNaN(parseFloat(priceEntry.value))) {
          currentErrors[`priceValue_${currencyCode}_${index}`] = `قيمة السعر للعملة ${currencyCode} يجب أن تكون رقماً.`;
        }
        if (!priceEntry.type_user || !typeUserOptions.some(opt => opt.value === priceEntry.type_user)) {
          currentErrors[`priceTypeUser_${currencyCode}_${index}`] = `نوع المستخدم مطلوب وصالح لكل سعر.`;
        }

        // Map type_user from internal option value to API expected value
        let mappedTypeUser = mapOptionValueToApiTypeUser(priceEntry.type_user);

        if (String(priceEntry.value).trim() && !isNaN(parseFloat(priceEntry.value)) && priceEntry.type_user) {
          finalProductPrices.push({ 
            currency_code: currencyCode, 
            price: parseFloat(priceEntry.value), 
            type_user: mappedTypeUser 
          }); 
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
      toast.error('يجب إضافة سعر واحد على الأcقل للمنتج.');
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
      const isUnitChanged = productUnit !== originalProductData.unit; 
      const isCategoryChanged = selectedCategoryObject?.slug !== originalProductData.category_slug; 
      
      // Deep comparison for prices - sort both arrays for consistent comparison
      const sortedFinalPrices = [...finalProductPrices].sort((a, b) => 
        a.currency_code.localeCompare(b.currency_code) || a.type_user.localeCompare(b.type_user) || a.price - b.price
      );
      const sortedOriginalPrices = [...originalProductData.prices].sort((a, b) => 
        a.currency_code.localeCompare(b.currency_code) || a.type_user.localeCompare(b.type_user) || a.price - b.price
      );
      const isPricesChanged = JSON.stringify(sortedFinalPrices) !== JSON.stringify(sortedOriginalPrices);

      if (!isNameChanged && !isUnitChanged && !isCategoryChanged && !isPricesChanged) { 
        toast.info('لم يتم إجراء أي تغييرات للحفظ.');
        handleClose(true);
        return;
      }

      const payload = { 
        name: productName,
        unit: productUnit, 
        category_slug: selectedCategoryObject.slug, 
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

      // Improved error handling for duplicate names/units
      if (err.status === 422) {
        const backendErrors = err.errors; // Access the errors object directly from the API error
        if (backendErrors) { 
          if (backendErrors.name && backendErrors.name[0].includes('مستخدم بالفعل')) {
            setErrors(prev => ({ ...prev, productName: 'اسم المنتج هذا مستخدم بالفعل. يرجى اختيار اسم آخر.' }));
          } else if (backendErrors.unit && backendErrors.unit[0].includes('مستخدم بالفعل')) { 
            // Specific message for duplicate unit
            setErrors(prev => ({ ...prev, productUnit: 'هذه السعة (الوحدة) مستخدمة بالفعل لمنتج آخر. يرجى اختيار سعة مختلفة.' }));
          } else if (backendErrors.name) {
            setErrors(prev => ({ ...prev, productName: backendErrors.name[0] }));
          } else if (backendErrors.unit) {
            setErrors(prev => ({ ...prev, productUnit: backendErrors.unit[0] }));
          } else if (backendErrors.category_slug) { 
            setErrors(prev => ({ ...prev, productCategory: backendErrors.category_slug[0] }));
          } else if (backendErrors.prices) { 
            setErrors(prev => ({ ...prev, general: 'خطأ في التحقق من الأسعار: ' + backendErrors.prices[0] }));
          } else {
            setErrors({ general: 'خطأ في التحقق من البيانات: ' + (err.message || 'فشل التحقق.') });
          }
        } else {
          setErrors({ general: 'خطأ في التحقق من البيانات: ' + (err.message || 'فشل التحقق.') });
        }
        toast.error('المنتج قد تمت اضافته من قبل'); // Generic toast for 422
      } else { // Generic error for other status codes or network issues
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
          type: "searchable-select", 
          value: productCategory,
          onChange: (value) => setProductCategory(value), 
          // NEW: Use locally fetched categories for options
          options: categories.filter(Boolean).filter(cat => cat && typeof cat === 'object' && cat.name).map(cat => cat.name), 
          error: errors.productCategory,
          // NEW: Use loadingCategories and errorFetchingCategories for placeholder
          placeholder: loadingCategories ? "جاري تحميل الفئات..." : (errorFetchingCategories ? "خطأ في تحميل الفئات" : "ابحث أو اختر فئة"), 
        },
        {
          label: "السعة (الوحدة)", 
          type: "text",
          placeholder: "مثال: 25 kg",
          value: productUnit,
          onChange: (e) => setProductUnit(e.target.value),
          error: errors.productUnit,
        },
      ],
    }
  ];

  if (!show) return null;

  return (
    <ModalWrapper show={show} onClose={handleClose} isVisible={isVisible} title="تعديل منتج" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
        {/* Render fields using FormLayout, which will now handle 'searchable-select' type */}
        {staticFieldsConfig.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-col md:flex-row md:gap-4">
            {row.fields.map((field, fieldIndex) => {
              if (field.type === 'searchable-select') { 
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
              } else if (field.type === 'select') { 
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
              } else { 
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
          </div>
        ))}
       

        <div className="border border-gray-700 p-4 rounded-lg">
          <h4 className="text-lg font-bold mb-3">تفاصيل الأسعار (لكل عملة حتى 5 أسعار)</h4>
          
          <FormSelectField
            label="العملة الرئيسية للأسعار"
            value={selectedPriceCurrencyCode}
            onChange={(e) => setSelectedPriceCurrencyCode(e.target.value)}
            // Map availableCurrencies to option labels (codes)
            options={availableCurrencies.map(curr => curr.code)} 
            className="mb-4"
          />

          <div className="max-h-35 overflow-y-auto pr-2"> 
            {selectedPriceCurrencyCode && currentPricesForSelectedCurrency.map((priceEntry, index) => (
              <div key={`${selectedPriceCurrencyCode}-${index}`} className="flex flex-col md:flex-row gap-4 mb-3 items-end">
                <FormInputField
                  label={index === 0 ? `السعر (${selectedPriceCurrencyCode})` : ""}
                  type="text"
                  placeholder="قيمة السعر"
                  value={priceEntry.value}
                  onChange={(e) => handlePriceFieldChange(index, 'value', e.target.value)}
                  error={errors[`priceValue_${selectedPriceCurrencyCode}_${index}`]}
                  className="flex-grow" 
                />
                <FormSelectField
                  label={index === 0 ? "نوع المندوب" : ""} 
                  value={priceEntry.type_user} 
                  onChange={(e) => handlePriceFieldChange(index, 'type_user', e.target.value)} 
                  options={typeUserOptions} // Use the updated typeUserOptions
                  error={errors[`priceTypeUser_${selectedPriceCurrencyCode}_${index}`]}
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
          </div> 

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
