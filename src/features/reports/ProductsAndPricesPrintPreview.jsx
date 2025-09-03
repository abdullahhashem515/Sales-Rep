// src/features/reports/ProductsAndPricesPrintPreview.jsx
import React, { useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import logo from "/logo.png";

const companyInfo = {
  arabic: {
    name: "شركة الأمين للتجارة والصناعة بحضرموت",
    address: "حضرموت، اليمن",
    phone: "777888555 / 712345678",
    email: "alamininhadrahmout@company.com",
  },
  english: {
    name: "Al-Ameen Trading & Industry Co.",
    address: "Hadhramout, Yemen",
    phone: "777888555 967+ / 712345678 967+",
    email: "alamininhadrahmout@company.com",
  },
};

export default function ProductsAndPricesPrintPreview({ show, onClose, reportData }) {
  const dataToDisplay = reportData && reportData.length > 0 ? reportData : [];

  const headers = useMemo(() => {
    const baseHeaders = [
      { key: "name", label: "اسم المنتج" },
    ];
    
    const priceTypes = ["wholesale", "retail", "general"];
    const currencyCodes = new Set();
    dataToDisplay.forEach(product => {
      Object.keys(product.prices_by_currency || {}).forEach(code => currencyCodes.add(code));
    });

    const dynamicHeaders = [];
    currencyCodes.forEach(code => {
      priceTypes.forEach(type => {
        const currencyName = dataToDisplay.find(p => p.prices_by_currency?.[code]?.[0])?.prices_by_currency[code].find(pr => pr.type_user === type)?.currency_name || code;
        dynamicHeaders.push({
          key: `${type}_${code}`,
          label: `سعر ${type === "wholesale" ? "الجملة" : type === "retail" ? "التجزئة" : "العام"} (${currencyName})`,
          currencyCode: code,
          priceType: type,
        });
      });
    });

    return [...baseHeaders, ...dynamicHeaders];
  }, [dataToDisplay]);
  
  const getPriceForProduct = (product, currencyCode, priceType) => {
    const prices = product.prices_by_currency?.[currencyCode];
    if (prices) {
      const priceObject = prices.find(p => p.type_user === priceType);
      return priceObject ? priceObject.price.toLocaleString() : "N/A";
    }
    return "N/A";
  };

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={true}
      title="معاينة تقرير الأصناف"
      maxWidth="max-w-6xl"
      maxHeight="max-h-4x1"
    >
      <div className="bg-white p-3 text-gray-900 overflow-y-auto max-h-[80vh] print-container">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start text-left flex-1 text-sm">
            <p className="font-bold text-gray-800 text-lg">{companyInfo.arabic.name}</p>
            <p className="text-gray-600">{companyInfo.arabic.address}</p>
            <p className="text-gray-600">{companyInfo.arabic.phone}</p>
            <p className="text-gray-600">{companyInfo.arabic.email}</p>
          </div>
          <div className="flex-shrink-0 mx-4">
            <img src={logo} alt="Company Logo" className="h-25 object-contain" />
          </div>
          <div className="flex flex-col items-end text-right flex-1 text-sm">
            <p className="font-bold text-gray-800 text-lg">{companyInfo.english.name}</p>
            <p className="text-gray-600">{companyInfo.english.address}</p>
            <p className="text-gray-600">{companyInfo.english.phone}</p>
            <p className="text-gray-600">{companyInfo.english.email}</p>
          </div>
        </div>

        <div className="relative flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-xl font-semibold text-gray-700">
            تقرير الأصناف وأسعارها
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="min-w-full text-right text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300 text-gray-700">
                <th className="py-2 px-3 border border-gray-300">م</th>
                {headers.map(header => (
                  <th key={header.key} className="py-2 px-3 border border-gray-300">
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataToDisplay.length > 0 ? (
                dataToDisplay.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-2 px-3 border border-gray-200 text-center">{index + 1}</td>
                    <td className="py-2 px-3 border border-gray-200">{item.name} ({item.unit})</td>
                    {headers.slice(1).map((header) => (
                      <td key={header.key} className="py-2 px-3 border border-gray-200">
                        {getPriceForProduct(item, header.currencyCode, header.priceType)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length + 1} className="py-4 text-center text-gray-500">لا توجد بيانات في هذا التقرير.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-500 text-center mt-3">
          تاريخ التقرير: {new Date().toLocaleDateString("en-GB")}
        </p>

        <div className="flex justify-center mt-8 print:hidden">
          <button
            onClick={() => window.print()}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition duration-200"
          >
            طباعة التقرير
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}