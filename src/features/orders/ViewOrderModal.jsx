import React, { useState, useEffect, useContext } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import UpdateOrderStatusWithNoteModal from "./UpdateOrderStatusWithNoteModal";
import { get } from "../../utils/apiService";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from 'react-toastify';

export default function ViewOrderModal({ 
  show, 
  onClose, 
  order, 
  onUpdateOrderStatus 
}) {
  const { token } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState(null);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  // جلب العملات
  const fetchCurrencies = async () => {
    if (!token) return;
    try {
      const res = await get("admin/currencies", token);
      if (Array.isArray(res)) setCurrencies(res);
      else console.error("تنسيق استجابة العملات غير متوقع");
    } catch (err) {
      console.error("فشل جلب العملات:", err);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, [token]);

  // الحصول على رمز العملة
  const getCurrencyCodeById = (id) => {
    return currencies.find((c) => c.id === id)?.code || "-";
  };

  // فتح نافذة تحديث الحالة
  const handleOpenUpdateStatusModal = (status) => {
    setStatusToUpdate(status);
    setShowUpdateStatusModal(true);
  };

  // إغلاق نافذة تحديث الحالة
const handleCloseUpdateStatusModal = (isSuccess, updatedOrder) => {
  setShowUpdateStatusModal(false);
  setStatusToUpdate(null);

  if (isSuccess && updatedOrder) {
    if (onUpdateOrderStatus) {
      onUpdateOrderStatus(updatedOrder); // تحديث الطلب في القائمة
      toast.success(`تم تحديث حالة الطلب بنجاح`);
    }
    // اغلاق نافذة تفاصيل الطلب بعد التحديث
    onClose(true); 
  }
};



  if (!show || !order) return null;

  // تحضير البيانات للعرض
  const customerName = order.customer_name || order.customer_id || "-";
  const salespersonName = order.salesperson_name || order.user_id || "-";
const totalAmount = order.products?.reduce(
  (sum, p) => sum + (parseFloat(p.total) || 0),
  0
) || 0;
  // تحديد لون ونص الحالة
  const getStatusDetails = (status) => {
    switch(status) {
      case 'accepted':
        return { text: 'مقبول', color: 'bg-green-500' };
      case 'pending':
        return { text: 'معلق', color: 'bg-yellow-500' };
      case 'cancelled':
        return { text: 'ملغى', color: 'bg-red-500' };
      default:
        return { text: status, color: 'bg-gray-500' };
    }
  };

  const statusDetails = getStatusDetails(order.status);

  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title={`تفاصيل الطلب رقم: ${order.order_id || "غير معروف"}`}
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col gap-4 p-4 text-right text-gray-200">
        {/* المعلومات الأساسية */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 text-sm">
          <p>
            <span className="font-semibold text-gray-300">تاريخ الطلب:</span>{" "}
            {new Date(order.order_date || order.shipment_date).toLocaleDateString("ar-SA")}
          </p>
          <p>
            <span className="font-semibold text-gray-300">العميل:</span>{" "}
            {customerName}
          </p>
          <p>
            <span className="font-semibold text-gray-300">نوع الدفع:</span>{" "}
            {order.type === "cash" ? "نقدي" : "آجل"}
          </p>
          <p>
            <span className="font-semibold text-gray-300">الحالة:</span>{" "}
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${statusDetails.color}`}>
              {statusDetails.text}
            </span>
          </p>
          <p>
            <span className="font-semibold text-gray-300">العملة:</span>{" "}
            {getCurrencyCodeById(order.currency_id)}
          </p>
          <p>
            <span className="font-semibold text-gray-300">نوع الطلب:</span>{" "}
            {order.type_order === 'wholesale' ? 'جملة' : 'تجزئة'}
          </p>
          
        </div>

        {/* المنتجات */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 max-h-52 overflow-y-auto">
          <h3 className="text-xl font-bold text-accentColor mb-3">المنتجات في الطلب:</h3>
          {order.products && order.products.length > 0 ? (
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="py-2 pr-2 font-semibold text-gray-300">المنتج</th>
                  <th className="py-2 font-semibold text-gray-300">الكمية</th>
                  <th className="py-2 font-semibold text-gray-300">سعر الوحدة</th>
                  <th className="py-2 pl-2 font-semibold text-gray-300">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((product, idx) => (
                  <tr key={idx} className="border-b border-gray-700 last:border-b-0">
                    <td className="py-2 pr-2">{product.name || `منتج ${product.product_id}`}</td>
                    <td className="py-2">{product.quantity}</td>
                    <td className="py-2">{parseFloat(product.unit_price).toFixed(2)}</td>
                    <td className="py-2 pl-2 font-semibold">{parseFloat(product.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400 text-center py-4">لا توجد منتجات في هذا الطلب.</p>
          )}
        </div>

        {/* الإجمالي */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 mt-2 text-left">
          <p className="text-xl font-bold text-accentColor">
            <span className="font-semibold">الإجمالي الكلي:</span>{" "}
            {totalAmount.toFixed(2)} {getCurrencyCodeById(order.currency_id)}
          </p>
        </div>

        {/* الملاحظات والإجراءات */}
  {/* الملاحظات والإجراءات */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">

{console.log("يقاقااياياياقياقياقيا", order)}

  {order.note && (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
      <h3 className="text-xl font-bold text-accentColor mb-2">ملاحظة عند إنشاء الطلب:</h3>
      <p className="text-gray-300">{order.note}</p>
    </div>
  )}

  {/* أزرار قبول/رفض الطلب إذا الحالة معلق */}
  {order.status === 'pending' && (
    <div className="flex justify-left gap-3">
      <button
        type="button"
        onClick={() => handleOpenUpdateStatusModal("accepted")}
        className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded flex items-center gap-1"
      >
        قبول الطلب
      </button>
      <button
        type="button"
        onClick={() => handleOpenUpdateStatusModal("cancelled")}
        className="bg-red-500 hover:bg-red-600 py-2 px-4 rounded flex items-center gap-1"
      >
        إلغاء الطلب
      </button>
    </div>
  )}

  {/* ملاحظة الحالة بعد قبول أو رفض الطلب */}
  {order.status !== 'pending' && order.status_note && (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 text-sm">
      <h3 className="font-semibold text-accentColor mb-1">ملاحظة حالة الطلب:</h3>
      <p>{order.status_note}</p>
    </div>
  )}
</div>
</div>

      

      {/* نافذة تحديث الحالة */}
 {/* نافذة تحديث الحالة */}
{showUpdateStatusModal && (
<UpdateOrderStatusWithNoteModal
  show={showUpdateStatusModal}
  onClose={handleCloseUpdateStatusModal}
  order={order}
  newStatus={statusToUpdate}
  onUpdateSuccess={(orderId, updatedStatus, notes, userId, timestamp) => {
    const updatedOrder = {
      ...order,
      status: updatedStatus,
      status_note: notes,
      processed_at: timestamp,
      salesperson_name: "مندوب 1", // أو القيمة الحقيقية
    };
    handleCloseUpdateStatusModal(true, updatedOrder);
  }}
/>
)}
    </ModalWrapper>
  );
};