import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper"; // Assuming this path is correct
import ModalTitle from "../../components/shared/ModalTitle"; // Assuming this path is correct
import { PhoneIcon, MapPinIcon, GlobeAltIcon, UserIcon, IdentificationIcon } from "@heroicons/react/24/solid"; // Import necessary icons

/**
 * مكون مودال لعرض التفاصيل الكاملة لعميل.
 *
 * @param {object} props
 * @param {boolean} props.show - لتحديد ما إذا كان المودال مرئيًا.
 * @param {function} props.onClose - دالة لاستدعائها عند إغلاق المودال.
 * @param {object} props.customer - كائن العميل الذي سيتم عرض تفاصيله.
 */
export default function ViewCustomerModal({ show, onClose, customer }) {
  const [isVisible, setIsVisible] = useState(false);

  // Effect to handle modal visibility transition
  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  // دالة مساعدة لترجمة الجنس
  const getGenderLabel = (gender) => {
    switch (gender) {
      case 'male': return 'ذكر';
      case 'female': return 'أنثى';
      default: return 'غير محدد';
    }
  };

  if (!customer) return null; // Don't render if no customer data

  return (
    <ModalWrapper
      show={show}
      onClose={onClose}
      isVisible={isVisible}
      title={`تفاصيل العميل: ${customer.name || 'غير معروف'}`}
      maxWidth="max-w-xl" // Adjust max-width as needed for content
    >
      <div className="flex flex-col gap-4 p-4 text-right text-white">
        {/* Customer ID */}
        <div className="flex items-center gap-3 border-b border-gray-700 pb-3">
          <IdentificationIcon className="w-7 h-7 text-accentColor" />
          <p className="text-xl font-bold">معرف العميل:</p>
          <span className="text-lg text-gray-300 flex-1">{customer.id || 'N/A'}</span>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <PhoneIcon className="w-6 h-6 text-accentColor" />
            <span className="font-semibold">الجوال:</span>
            <span>{customer.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-accentColor" />
            <span className="font-semibold">الجنس:</span>
            <span>{getGenderLabel(customer.gender)}</span>
          </div>
        </div>

        {/* Address Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MapPinIcon className="w-6 h-6 text-accentColor" />
            <span className="font-semibold">المدينة:</span>
            <span>{customer.city || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <GlobeAltIcon className="w-6 h-6 text-accentColor" />
            <span className="font-semibold">الدولة:</span>
            <span>{customer.country || 'اليمن'}</span> {/* Assuming Yemen as default */}
          </div>
          <div className="flex items-start gap-2 col-span-full"> {/* Full width for address */}
            <MapPinIcon className="w-6 h-6 text-accentColor mt-1" /> {/* Align icon with text */}
            <span className="font-semibold">العنوان:</span>
            <p className="flex-1">{customer.address || 'N/A'}</p>
          </div>
        </div>

        {/* Created/Updated Dates - Optional, based on your API response structure */}
        {customer.created_at && (
          <div className="border-t border-gray-700 pt-4 mt-4 text-gray-400 text-sm">
            <p><span className="font-semibold">تاريخ الإنشاء:</span> {new Date(customer.created_at).toLocaleString('ar-SA')}</p>
            {customer.updated_at && (
              <p><span className="font-semibold">آخر تحديث:</span> {new Date(customer.updated_at).toLocaleString('ar-SA')}</p>
            )}
          </div>
        )}

      </div>
    </ModalWrapper>
  );
}
