import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper"; // Assuming this path is correct
import FormInputField from "../../components/shared/FormInputField"; // Assuming this path is correct
import { toast } from 'react-toastify';

/**
 * مكون مودال لاختيار نطاق تاريخ لفلترة الطلبات.
 *
 * @param {object} props
 * @param {boolean} props.show - لتحديد ما إذا كان المودال مرئيًا.
 * @param {function} props.onClose - دالة لاستدعائها عند إغلاق المودال.
 * @param {object} props.currentDateRange - كائن يحتوي على startDate و endDate الحاليين.
 * @param {function} props.onApplyFilter - دالة لاستدعائها عند تطبيق الفلتر، تمرر { startDate, endDate }.
 */
export default function DateRangeFilterModal({ show, onClose, currentDateRange, onApplyFilter }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // تهيئة قيم الحقول بقيم الفلتر الحالية عند فتح المودال
      setStartDate(currentDateRange.startDate || '');
      setEndDate(currentDateRange.endDate || '');
      setError(null);
    } else {
      setIsVisible(false);
    }
  }, [show, currentDateRange]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // التحقق من صحة التواريخ
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (startDate && !start.getTime()) { // Check for invalid date
      setError('تاريخ البدء غير صالح.');
      toast.error('تاريخ البدء غير صالح.');
      return;
    }
    if (endDate && !end.getTime()) { // Check for invalid date
      setError('تاريخ الانتهاء غير صالح.');
      toast.error('تاريخ الانتهاء غير صالح.');
      return;
    }

    if (start && end && start > end) {
      setError('تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء.');
      toast.error('تاريخ البدء يجب أن يكون قبل تاريخ الانتهاء.');
      return;
    }

    onApplyFilter({ startDate: startDate || null, endDate: endDate || null });
    onClose(true); // Close modal and indicate success
  };

  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title="فلترة الطلبات حسب التاريخ"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        <FormInputField
          label="من تاريخ"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          error={error && error.includes('البدء') ? error : null}
        />
        <FormInputField
          label="إلى تاريخ"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          error={error && error.includes('الانتهاء') ? error : null}
        />

        {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="accentColor hover:bg-purple-700 py-2 px-4 rounded"
          >
            تطبيق الفلتر
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
