// src/features/reports/ProductsAndPricesModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import SearchableSelectFieldV4 from "../../components/shared/SearchableSelectFieldV4";
import Table2 from "../../components/shared/Table2";
import { get } from "../../utils/apiService";
import { useAuth } from "../../contexts/AuthContext";
import AddEntityButton from "../../components/shared/AddEntityButton";

const ProductsAndPricesModal = ({ show, onClose, onPreviewAndPrint }) => {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    category: null,
    unit: null,
    currency: null,
  });

  const [allProducts, setAllProducts] = useState([]);
  const [data, setData] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      fetchProducts();
    }
  }, [show]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await get("admin/products", token);
      if (response && Array.isArray(response)) {
        setAllProducts(response);

        const uniqueCategories = Array.from(
          new Map(
            response.map((p) => [
              p.category?.id,
              { label: p.category?.name, value: p.category?.id },
            ])
          ).values()
        ).filter(opt => opt.value);
        setCategoryOptions(uniqueCategories);

        const uniqueUnits = Array.from(
          new Set(response.map((p) => p.unit))
        ).map((unit) => ({ label: unit, value: unit }));
        setUnitOptions(uniqueUnits);

        const uniqueCurrencies = Array.from(
          new Set(response.flatMap(p => Object.keys(p.prices_by_currency || {})))
        ).map(code => {
          const currencyName = response.find(p => p.prices_by_currency?.[code])?.prices_by_currency[code][0]?.currency_name || code;
          return { label: currencyName, value: code };
        });
        setCurrencyOptions(uniqueCurrencies);

        // تعيين القيمة الافتراضية للعملة بعد جلب الخيارات
        if (uniqueCurrencies.length > 0) {
          setFilters(prev => ({ ...prev, currency: uniqueCurrencies[0].value }));
        }

        setData(response);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = allProducts.filter((product) => {
      const categoryMatch = !filters.category || product.category?.id === filters.category;
      const unitMatch = !filters.unit || product.unit === filters.unit;
      return categoryMatch && unitMatch;
    });
    setData(filtered);
  }, [filters.category, filters.unit, allProducts]);

  const headers = useMemo(() => {
    const baseHeaders = [{ key: "name", label: "اسم المنتج" }];
    const priceTypeMap = {
      "wholesale": "سعر الجملة",
      "retail": "سعر التجزئة",
      "general": "السعر العام",
    };

    const selectedCurrency = filters.currency;
    if (!selectedCurrency) {
      return baseHeaders; // إذا لم يتم اختيار عملة، أظهر فقط عمود اسم المنتج
    }

    // إيجاد الحد الأقصى لعدد الأسعار لكل نوع (مثال: سعر عام 2)
    const maxPriceCounts = allProducts.reduce((acc, product) => {
      const prices = product.prices_by_currency?.[selectedCurrency] || [];
      const counts = prices.reduce((c, p) => {
        c[p.type_user] = (c[p.type_user] || 0) + 1;
        return c;
      }, {});
      for (const type in counts) {
        if (counts[type] > (acc[type] || 0)) {
          acc[type] = counts[type];
        }
      }
      return acc;
    }, {});

    const dynamicHeaders = [];
    const priceTypes = ["wholesale", "retail", "general"];
    const currencyName = allProducts.find(p => p.prices_by_currency?.[selectedCurrency])?.prices_by_currency[selectedCurrency][0]?.currency_name || selectedCurrency;

    priceTypes.forEach(type => {
      const count = maxPriceCounts[type] || 0;
      for (let i = 0; i < count; i++) {
        const label = `${priceTypeMap[type]}${count > 1 ? ` ${i + 1}` : ''} (${currencyName})`;
        dynamicHeaders.push({
          key: `${type}_${selectedCurrency}_${i}`,
          label,
          currencyCode: selectedCurrency,
          priceType: type,
          priceIndex: i,
        });
      }
    });

    return [...baseHeaders, ...dynamicHeaders];
  }, [filters.currency, allProducts]);

  const getPriceForProduct = (product, currencyCode, priceType, priceIndex) => {
    const prices = product.prices_by_currency?.[currencyCode];
    if (prices) {
      // ✅ تصفية الأسعار حسب النوع ثم اختيار السعر بناءً على الفهرس
      const pricesOfType = prices.filter(p => p.type_user === priceType);
      const priceObject = pricesOfType[priceIndex];
      return priceObject ? priceObject.price : "N/A";
    }
    return "N/A";
  };

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={true}
      title="تقرير الأصناف وأسعارها"
      maxWidth="max-w-7xl"
      maxHeight="max-h-[100vh]"
    >
      <div className="p-4 space-y-6">
        <div className="flex flex-row flex-wrap items-center gap-4 pb-4 border-b border-gray-300">
          <SearchableSelectFieldV4
            label="الفئة"
            value={filters.category}
            onChange={(val) => setFilters((prev) => ({ ...prev, category: val }))}
            options={[{ label: "كل الفئات", value: null }, ...categoryOptions]}
            placeholder="اختر الفئة"
            isClearable
          />
          <SearchableSelectFieldV4
            label="الوحدة"
            value={filters.unit}
            onChange={(val) => setFilters((prev) => ({ ...prev, unit: val }))}
            options={[{ label: "كل الوحدات", value: null }, ...unitOptions]}
            placeholder="اختر الوحدة"
            isClearable
          />
          <SearchableSelectFieldV4
            label="العملة"
            value={filters.currency}
            onChange={(val) => setFilters((prev) => ({ ...prev, currency: val }))}
            options={currencyOptions}
            placeholder="اختر العملة"
            isClearable={false}
          />
        </div>
        <Table2
          headers={headers}
          data={data}
          totalCount={data.length}
          loading={loading}
          renderRow={(product) => (
            <>
              <td className="py-2 px-3">
                {product.name} ({product.unit})
              </td>
              {headers.slice(1).map((header) => (
                <td key={header.key} className="py-2 px-3">
                  {getPriceForProduct(product, header.currencyCode, header.priceType, header.priceIndex)}
                </td>
              ))}
            </>
          )}
        />
      </div>
      <div className="flex justify-center">
        <AddEntityButton label="معاينة للطباعة" onClick={() => onPreviewAndPrint(data)} />
      </div>
    </ModalWrapper>
  );
};

export default ProductsAndPricesModal;