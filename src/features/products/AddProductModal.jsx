import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormLayout from "../../components/shared/FormLayout"; 
import FormInputField from "../../components/shared/FormInputField"; 
import FormSelectField from "../../components/shared/FormSelectField"; 
import SearchableSelectField from "../../components/shared/SearchableSelectField"; 
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from 'react-toastify'; 
import { post, get } from '../../utils/apiService';

// دالة مساعدة لتحويل الاسم إلى Slug (نسخة مبسطة) - منسوخة من UpdateProductModal
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
    .replace(/\s+/g, '-') // استبدال المسافات بشرطات
    .replace(/[^\w-]+/g, '') // إزالة جميع الأحرف غير الأبجدية الرقمية باستثناء الشرطات
    .replace(/--+/g, '-') // استبدال الشرطات المتعددة بشرطة واحدة
    .replace(/^-+|-+$/g, ''); // إزالة الشرطات من البداية/النهاية
};

export default function AddProductModal({ show, onClose, onAddProductConfirm, availableCurrencies }) {
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productUnit, setProductUnit] = useState(''); // حالة لوحدة المنتج
  // حالة للاحتفاظ بجميع الأسعار، مع ربطها برمز العملة. كل إدخال سعر يتضمن الآن type_user.
  const [allProductPrices, setAllProductPrices] = useState({});
  // حالة لتتبع رمز العملة المحدد حاليًا لإدخال السعر
  const [selectedPriceCurrencyCode, setSelectedPriceCurrencyCode] = useState(''); 

  // حالات لجلب الفئات داخل المودال
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [errorFetchingCategories, setErrorFetchingCategories] = useState(null);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // تعريف خيارات نوع المستخدم وقيمها API وعناوين العرض
  const typeUserOptions = [
    { label: 'عام', value: 'general' }, 
    { label: 'مندوب جملة', value: 'ws_rep' },
    { label: 'مندوب التجزئة', value: 'retail_rep' },
  ];

  // تهيئة وإعادة تعيين حقول النموذج والأخطاء عند فتح المودال أو تغيير العملات
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setProductName('');
      setProductCategory('');
      setProductUnit(''); // إعادة تعيين وحدة المنتج
      setErrors({});
      setIsLoading(false);

      console.log("AddProductModal: Initializing with availableCurrencies (detailed):", JSON.stringify(availableCurrencies, null, 2));

      if (Array.isArray(availableCurrencies) && availableCurrencies.length > 0) {
        setSelectedPriceCurrencyCode(availableCurrencies[0]?.code || ''); 
      } else {
        setSelectedPriceCurrencyCode('');
      }
      
      const initialPrices = {};
      if (Array.isArray(availableCurrencies)) {
        availableCurrencies.forEach(currency => { 
          if (currency && typeof currency === 'object' && currency.code) {
            initialPrices[currency.code] = []; 
          }
        });
      }
      setAllProductPrices(initialPrices);
    }
  }, [show, availableCurrencies]);

  // useEffect لجلب الفئات عند عرض المودال
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
        console.log("AddProductModal: Categories API raw Response:", response);

        if (Array.isArray(response)) {
          setCategories(response);
          console.log("AddProductModal: Categories state after fetch (direct array):", response);
        } 
        else if (response && Array.isArray(response.categories)) {
          setCategories(response.categories);
          console.log("AddProductModal: Categories state after fetch (from object.categories):", response.categories);
        } else {
          console.warn("AddProductModal: API response for categories is unexpected:", response);
          setErrorFetchingCategories('هيكل استجابة الفئات غير متوقع.');
          setCategories([]);
        }
      } catch (err) {
        console.error("Failed to fetch categories in AddProductModal:", err);
        setErrorFetchingCategories(err.message || 'فشل في جلب الفئات.');
        toast.error('فشل في جلب الفئات: ' + (err.message || 'خطأ غير معروف.'));
      } finally {
        setLoadingCategories(false);
      }
    };

    if (show) {
      fetchCategories();
    }
  }, [show]);

  // معالج إغلاق مع انتقال
  const handleClose = (isSuccess = false) => { 
    setIsVisible(false);
    setTimeout(() => {
      onClose(isSuccess); 
    }, 100); 
  };

  // الحصول على الأسعار الحالية لرمز العملة المحدد
  const currentPricesForSelectedCurrency = allProductPrices[selectedPriceCurrencyCode] || [];

  // معالجة التغييرات لكل من قيمة السعر ونوع المستخدم
  const handlePriceFieldChange = (index, field, value) => {
    const newPrices = [...currentPricesForSelectedCurrency];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setAllProductPrices(prevPrices => ({
      ...prevPrices,
      [selectedPriceCurrencyCode]: newPrices
    }));
  };

  const handleAddPriceField = () => {
    if (currentPricesForSelectedCurrency.length < 5) {
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
    const selectedCategoryObject = categories.find(cat => cat.name === productCategory);
    if (!productCategory.trim() || !selectedCategoryObject) {
      currentErrors.productCategory = 'يجب اختيار فئة صالحة للمنتج.';
    }
    if (!productUnit.trim()) {
        currentErrors.productUnit = 'وحدة المنتج مطلوبة (مثال: 25 kg).';
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

        let mappedTypeUser = priceEntry.type_user;
        if (priceEntry.type_user === 'ws_rep') {
            mappedTypeUser = 'wholesale';
        } else if (priceEntry.type_user === 'retail_rep') {
            mappedTypeUser = 'retail';
        }

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

      const payload = { 
        name: productName,
        category_slug: selectedCategoryObject.slug, 
        unit: productUnit, 
        prices: finalProductPrices
      };
      console.log("AddProductModal: Final payload to API:", JSON.stringify(payload, null, 2));

      const response = await post('admin/products', payload, token);

      console.log("AddProductModal: API response for POST:", response);

      if (response.status) { 
        toast.success('تم إضافة المنتج بنجاح!');
        onAddProductConfirm(true); 
        handleClose(true); 
      } else {
        const apiErrorMessage = response.message || 'فشل إضافة المنتج.';
        setErrors({ general: apiErrorMessage });
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("AddProductModal: Caught error during product POST:", err);
      const errorMessage = err.message || 'حدث خطأ غير متوقع عند إضافة المنتج.';

      if (err.status === 422) { 
        const backendErrors = err.errors;
        if (backendErrors) {
            if (backendErrors.name && backendErrors.name[0].includes('مستخدم بالفعل')) {
              setErrors(prev => ({ ...prev, productName: 'اسم المنتج هذا مستخدم بالفعل. يرجى اختيار اسم آخر.' }));
            } else if (backendErrors.unit && backendErrors.unit[0].includes('مستخدم بالفعل')) { // Specific check for duplicate unit
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
        toast.error('هذا المنتج قد تمت اضافته من قبل.'); // Generic toast for 422
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
          type: "searchable-select", 
          value: productCategory,
          onChange: (value) => setProductCategory(value), 
          options: categories.filter(Boolean).filter(cat => cat && typeof cat === 'object' && cat.name).map(cat => cat.name), 
          error: errors.productCategory,
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
    },
  ];

  if (!show) return null;

  return (
    <ModalWrapper show={show} onClose={handleClose} isVisible={isVisible} title="إضافة منتج جديد" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
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
            options={
              Array.isArray(availableCurrencies) 
              ? availableCurrencies.map(currency => {
                  if (currency && typeof currency === 'object' && currency.code) {
                    return { label: currency.code, value: currency.code }; 
                  }
                  return null; 
                }).filter(Boolean)
              : []
            } 
            error={errors.selectedPriceCurrencyCode}
            className="mb-4"
          />

          {/* Added max-h-60 and overflow-y-auto to the container for price entries */}
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
          </div> {/* End of scrollable div */}

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
          {isLoading ? 'جاري الإضافة...' : 'إضافة منتج'}
        </button>
      </form>
    </ModalWrapper>
  );
}
