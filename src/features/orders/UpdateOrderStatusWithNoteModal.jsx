import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper"; // Assuming this path is correct
import FormInputField from "../../components/shared/FormInputField"; // Assuming this path is correct
import { toast } from 'react-toastify';
import { put } from '../../utils/apiService'; // Assuming PUT method is used for status update

/**
 * مكون مودال لتحديث حالة الطلب (قبول/رفض) مع إضافة ملاحظة.
 *
 * @param {object} props
 * @param {boolean} props.show - لتحديد ما إذا كان المودال مرئيًا.
 * @param {function} props.onClose - دالة لاستدعائها عند إغلاق المودال.
 * @param {object} props.order - كائن الطلب الذي يتم تحديث حالته.
 * @param {string} props.newStatus - الحالة الجديدة المراد تعيينها ('approved' أو 'rejected').
 * @param {function} props.onUpdateSuccess - دالة لاستدعائها عند نجاح التحديث (عادة لإعادة جلب الطلبات).
 */
export default function UpdateOrderStatusWithNoteModal({ show, onClose, order, newStatus, onUpdateSuccess }) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const statusLabel = newStatus === 'approved' ? 'قبول' : 'رفض';
  const buttonColorClass = newStatus === 'approved' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600';

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setNotes(''); // Clear notes when modal opens
      setError(null);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newStatus === 'rejected' && !notes.trim()) {
      setError('يرجى إدخال ملاحظة لسبب الرفض.');
      toast.error('ملاحظة الرفض مطلوبة.');
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

      // Assuming API endpoint for updating order status is PUT /admin/orders/{order_id}/status
      // And it expects { status: 'new_status', notes: '...', approved_by: 'userId' }
      // For dummy data, we'll just simulate success
      
      // In a real app, you'd get the actual user ID from auth context
      const currentUserId = 'ADMIN001'; // Dummy admin ID for simulation

      const payload = {
        status: newStatus,
        notes: notes.trim(),
        approved_by: currentUserId, // Replace with actual authenticated user ID
        approved_at: new Date().toISOString(), // Current timestamp
      };

      console.log(`Simulating ${statusLabel} Order API Call for ORD:${order.order_id}`, payload);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay

      // Assuming 'put' function from apiService returns the response directly
      // In a real scenario, you'd check response.status or similar
      // const apiResponse = await put(`admin/orders/${order.order_id}/status`, payload, token);
      
      // For dummy data, we simulate success
      const apiResponse = { status: true, message: `Order ${statusLabel}ed successfully` }; // Simulated success response

      if (apiResponse.status) { // Assuming 'status' field in API response indicates success
        toast.success(`تم ${statusLabel} الطلب رقم ${order.order_id} بنجاح!`);
        onUpdateSuccess(order.order_id, newStatus, notes, currentUserId, new Date().toISOString()); // Pass updated details
        onClose(true); // Close modal and indicate success
      } else {
        const apiErrorMessage = apiResponse.message || `فشل ${statusLabel} الطلب.`;
        toast.error(apiErrorMessage);
        setError(apiErrorMessage);
      }
    } catch (err) {
      console.error(`Error ${statusLabel}ing order:`, err);
      const errorMessage = err.message || `فشل في ${statusLabel} الطلب: خطأ غير معروف.`;
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)} // Always close without success on direct close
      isVisible={isVisible}
      title={`${statusLabel} الطلب رقم: ${order?.order_id || ''}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right">
        <p className="text-gray-300 text-sm mb-2">
          {newStatus === 'approved'
            ? 'يمكنك إضافة ملاحظة اختيارية لقبول الطلب.'
            : 'يرجى إدخال ملاحظة توضح سبب رفض الطلب.'}
        </p>
        <FormInputField
          label="الملاحظات"
          type="textarea" // Use textarea for multi-line input
          placeholder={newStatus === 'rejected' ? 'سبب الرفض...' : 'ملاحظات إضافية...'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          error={error}
          rows={4} // Adjust height for textarea
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
