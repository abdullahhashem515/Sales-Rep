import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import { toast } from 'react-toastify';
import { put } from '../../utils/apiService';

/**
 * مكون مودال لتحديث حالة الطلب (قبول/إلغاء) مع إضافة ملاحظة.
 *
 * @param {object} props
 * @param {boolean} props.show - لتحديد ما إذا كان المودال مرئيًا.
 * @param {function} props.onClose - دالة لاستدعائها عند إغلاق المودال.
 * @param {object} props.order - كائن الطلب الذي يتم تحديث حالته.
 * @param {string} props.newStatus - الحالة الجديدة المراد تعيينها ('accepted' أو 'cancelled').
 * @param {function} props.onUpdateSuccess - دالة لاستدعائها عند نجاح التحديث.
 */
export default function UpdateOrderStatusWithNoteModal({ show, onClose, order, newStatus, onUpdateSuccess }) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

const statusLabel = newStatus === 'accepted' ? 'قبول' : 'رفض';
const buttonColorClass = newStatus === 'accepted' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setNotes('');
      setError(null);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(null);

  if (!notes.trim() && newStatus === 'cancelled') {
    setError('يرجى إدخال ملاحظة لسبب الإلغاء.');
    toast.error('ملاحظة الإلغاء مطلوبة.');
    return;
  }

  if (!order || !order.order_id) {
    toast.error('خطأ: معلومات الطلب غير متوفرة.');
    onClose(false);
    return;
  }

  setIsLoading(true);
  try {
    const token = localStorage.getItem('userToken');
    if (!token) {
      toast.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
      setIsLoading(false);
      return;
    }

    const payload = {
      status: newStatus,
      note: notes.trim(),
    };

    let apiResponse;

    if (order.type_order === 'wholesale') {
      // طلب الجملة: قبول أو إلغاء
      apiResponse = await put(`admin/orders-changeStatus/${order.slug}`, payload, token);
    } else {
      // طلب التجزئة: قبول أو إلغاء
      apiResponse = await put(`admin/ShipmentRequestStatus/${order.slug}`, payload, token);
    }

    if (apiResponse.status) {
      toast.success(`تم ${newStatus === 'accepted' ? 'قبول' : 'إلغاء'} الطلب رقم ${order.order_id} بنجاح!`);
      onUpdateSuccess(order.order_id, newStatus, notes, 'ADMIN001', new Date().toISOString());
      onClose(true);
    } else {
      const apiErrorMessage = apiResponse.message || `فشل تحديث الطلب.`;
      toast.error(apiErrorMessage);
      setError(apiErrorMessage);
    }

  } catch (err) {
    console.error(`Error updating order:`, err);
    const errorMessage = err.message || `فشل في تحديث الطلب: خطأ غير معروف.`;
    toast.error(errorMessage);
    setError(errorMessage);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title={`${statusLabel} الطلب رقم: ${order?.order_id || ''}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        <p className="text-gray-300 text-sm mb-2">
          {newStatus === 'accepted'
            ? 'يمكنك إضافة ملاحظة اختيارية لقبول الطلب.'
            : 'يرجى إدخال ملاحظة توضح سبب إلغاء الطلب.'}
        </p>
        <FormInputField
          label="الملاحظات"
          type="textarea"
          placeholder={newStatus === 'cancelled' ? 'سبب الإلغاء...' : 'ملاحظات إضافية...'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          error={error}
          rows={4}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded"
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className={`${buttonColorClass} py-2 px-4 rounded`}
            disabled={isLoading}
          >
            {isLoading ? 'جاري المعالجة...' : statusLabel}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
