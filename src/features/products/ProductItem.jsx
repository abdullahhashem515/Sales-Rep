import React, { useState, useEffect } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import FormSelectField from "../../components/shared/FormSelectField"; 

/**
 * مكون يعرض تفاصيل منتج واحد في قائمة المنتجات.
 *
 * @param {object} props
 * @param {object} props.product - كائن المنتج الذي يحتوي على التفاصيل، بما في ذلك `prices_by_currency` و `category`.
 * @param {function} props.onEdit - دالة تستدعى عند النقر على زر التعديل.
 * @param {function} props.onDelete - دالة تستدعى عند النقر على زر الحذف.
 * @param {Array<object>} props.availableCurrencies - قائمة بالعملات المتاحة {id, code, name}.
 * @param {Array<object>} props.availableCategories - قائمة بالفئات المتاحة {id, name, slug}.
 */
export default function ProductItem({ product, onEdit, onDelete, availableCurrencies, availableCategories }) {
  // حالة لرمز العملة المحدد حاليًا للعرض في هذا المنتج
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState('');
  // حالة لتفاصيل السعر المعروضة حاليًا (قيمة السعر + نوع المستخدم)
  const [selectedPriceDetails, setSelectedPriceDetails] = useState(null);

  // دالة مساعدة لترجمة نوع المستخدم للعرض
  const getTypeUserLabel = (typeUser) => {
    switch (typeUser) {
      case 'general':
        return 'عام';
      case 'retail':
      case 'retail_rep':
        return 'تجزئة';
      case 'wholesale':
      case 'ws_rep':
        return 'جملة';
      case 'both_reps': // إذا كان الباك إند يرسل هذا النوع
        return 'جملة وتجزئة';
      default:
        return typeUser;
    }
  };

  // دالة لجلب اسم الفئة بناءً على ID الفئة (كخيار احتياطي إذا لم يكن كائن الفئة مدمجًا)
  const getCategoryNameById = (categoryId) => {
    const category = availableCategories?.find(cat => cat.id === categoryId);
    return category ? category.name : 'غير محدد';
  };

  // دالة لتحديث تفاصيل السعر بناءً على رمز العملة المحدد
  const updateSelectedPriceDetails = (currencyCodeToFilter, pricesByCurrencyObject) => {
    // الوصول إلى الأسعار مباشرة من الكائن باستخدام رمز العملة كالمفتاح
    const pricesForSelectedCurrency = pricesByCurrencyObject?.[currencyCodeToFilter] || [];
    
    if (pricesForSelectedCurrency.length > 0) {
      // اختر أول سعر لنوع المستخدم 'general' إذا وجد، وإلا اختر الأول المتاح
      const generalPrice = pricesForSelectedCurrency.find(p => p.type_user === 'general');
      setSelectedPriceDetails(generalPrice || pricesForSelectedCurrency[0]);
    } else {
      setSelectedPriceDetails(null); // لا توجد أسعار لهذه العملة
    }
  };

  // useEffect لتهيئة العملة والسعر عند تحميل المكون أو تغيير بيانات المنتج/العملات
  useEffect(() => {
    if (product && availableCurrencies && availableCurrencies.length > 0) {
      let initialCurrencyCode = '';
      // ✅ تم التعديل: استخدام prices_by_currency من استجابة الباك إند
      const pricesByCurrency = product?.prices_by_currency; 

      if (pricesByCurrency && Object.keys(pricesByCurrency).length > 0) {
        // أولاً، حاول العثور على 'YER' إذا كانت موجودة كمفتاح في الكائن
        if (pricesByCurrency['YER'] && pricesByCurrency['YER'].length > 0) {
          initialCurrencyCode = 'YER';
        } else {
          // إذا لم يتم العثور على 'YER'، استخدم رمز العملة لأول مفتاح متاح في prices_by_currency
          initialCurrencyCode = Object.keys(pricesByCurrency)[0];
        }
      } else {
        // إذا لم تكن هناك أسعار للمنتج، استخدم رمز العملة لأول عملة متاحة بشكل عام
        initialCurrencyCode = availableCurrencies[0].code;
      }

      setSelectedCurrencyCode(initialCurrencyCode);
      // ✅ تم التعديل: تمرير كائن pricesByCurrency إلى دالة التحديث
      updateSelectedPriceDetails(initialCurrencyCode, pricesByCurrency);
    } else {
      // إعادة تعيين الحالات إذا لم يكن المنتج أو العملات متاحة
      setSelectedCurrencyCode('');
      setSelectedPriceDetails(null);
    }
  }, [product, availableCurrencies]); 

  // معالج التغيير للعملة
  const handleCurrencyChange = (e) => {
    const newCurrencyCode = e.target.value;
    setSelectedCurrencyCode(newCurrencyCode);
    // ✅ تم التعديل: استخدام prices_by_currency
    updateSelectedPriceDetails(newCurrencyCode, product.prices_by_currency); 
  };

  // تهيئة خيارات العملة للقائمة المنسدلة
  const currencyOptions = availableCurrencies.map((currency) => ({
    label: currency.code, // عرض رمز العملة (YER, USD)
    value: currency.code, // القيمة هي رمز العملة
  }));

  // تهيئة خيارات الأسعار للقائمة المنسدلة بناءً على العملة المختارة
  // ✅ تم التعديل: الوصول مباشرة إلى الأسعار باستخدام رمز العملة من prices_by_currency
  const pricesForCurrentCurrency = product?.prices_by_currency?.[selectedCurrencyCode] || []; 
  
  const priceOptions = pricesForCurrentCurrency.map((price, index) => ({
    label: `${price.price} (${getTypeUserLabel(price.type_user)})`,
    value: JSON.stringify(price), // نستخدم JSON.stringify لتخزين الكائن بأكمله في القيمة
  }));

  // معالج التغيير للسعر (إذا كانت هناك قائمة منسدلة للأسعار)
  const handlePriceDetailsChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      setSelectedPriceDetails(JSON.parse(selectedValue));
    } else {
      setSelectedPriceDetails(null);
    }
  };

  // إعطاء الأولوية لـ product.category.name، ثم الرجوع إلى البحث بواسطة product_category_id
  const displayedCategoryName = product.category?.name || getCategoryNameById(product.product_category_id); 

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Action Buttons (left/top) */}
      <div className="flex gap-2">
        <button
          className="bg-red-500 hover:bg-red-600 p-2 rounded"
          onClick={() => onDelete(product)}
        >
          <TrashIcon className="w-4 h-4 text-white" />
        </button>
        <button
          className="bg-yellow-400 hover:bg-yellow-600 p-2 rounded"
          onClick={() => onEdit(product)}
        >
          <PencilIcon className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Product Details (middle) */}
      <div className="flex-1 text-center sm:text-right"> {/* Added text alignment for better visual */}
        <h3 className="amiriFont text-xl font-bold mb-2">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-1">
          <span className="font-semibold">الفئة:</span> {displayedCategoryName}
        </p>
        <p className="text-gray-400 text-sm mb-2">
          <span className="font-semibold">السعة (الوحدة):</span> {product.unit || 'غير محدد'}
        </p>
      </div>

      {/* Currency and Price Selection (right) */}
      <div className="flex flex-col md:flex-row gap-4 flex-1">
        {/* Price Display / Selection for the chosen currency */}
        <div className="flex-1">
          <label className="block mb-1 text-gray-400">السعر</label>
          {selectedCurrencyCode && pricesForCurrentCurrency.length > 0 ? (
              pricesForCurrentCurrency.length === 1 ? ( 
                <p className="w-full p-2 rounded bg-gray-700 border border-gray-600">
                  {selectedPriceDetails?.price} ({getTypeUserLabel(selectedPriceDetails?.type_user)}) 
                </p>
              ) : ( 
                <FormSelectField
                  label=""
                  value={selectedPriceDetails ? JSON.stringify(selectedPriceDetails) : ''}
                  onChange={handlePriceDetailsChange}
                  options={priceOptions}
                  className="w-full"
                />
              )
            ) : (
              <p className="w-full p-2 rounded bg-gray-700 text-gray-400 border border-gray-600">
                لا توجد أسعار لهذه العملة
              </p>
            )}
        </div>

        {/* Currency Dropdown */}
        <div className="flex-1">
          {availableCurrencies && availableCurrencies.length > 0 ? (
            <FormSelectField
              label="العملة"
              value={selectedCurrencyCode}
              onChange={handleCurrencyChange}
              options={currencyOptions}
              className="w-full"
            />
          ) : (
            <div className="mb-3">
              <label className="block mb-1 text-gray-400">العملة</label>
              <p className="w-full p-2 rounded bg-gray-700 text-gray-400 border border-gray-600">
                لا توجد عملات متاحة
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
