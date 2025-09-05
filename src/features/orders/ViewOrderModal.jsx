// src/pages/orders/ViewOrderModal.jsx
import React, { useState, useEffect, useContext, useMemo } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import UpdateOrderStatusWithNoteModal from "./UpdateOrderStatusWithNoteModal";
import OrderPrintPreviewModal from "./OrderPrintPreviewModal";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

export default function ViewOrderModal({
  show,
  onClose,
  order,
  onUpdateOrderStatus,
}) {
  const { token } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  const handleOpenUpdateStatusModal = (status) => {
    setStatusToUpdate(status);
    setShowUpdateStatusModal(true);
  };

  const handleCloseUpdateStatusModal = (isSuccess, updatedOrder) => {
    setShowUpdateStatusModal(false);
    setStatusToUpdate(null);

    if (isSuccess && updatedOrder) {
      if (onUpdateOrderStatus) {
        onUpdateOrderStatus(updatedOrder);
        toast.success(`تم تحديث حالة الطلب بنجاح`);
      }
      onClose(true);
    }
  };

  const grandTotal = useMemo(() => {
    if (order?.type_order !== "wholesale") {
      return null;
    }
    return (order.products || [])
      .reduce(
        (sum, item) =>
          sum + (parseFloat(item.unit_price) * parseFloat(item.quantity) || 0),
        0
      )
      .toFixed(2);
  }, [order]);

  if (!show || !order) return null;

  const customerName = order.customer_name || order.customer_id || "-";
  const salespersonName = order.salesperson_name || order.user_id || "-";

  const getStatusDetails = (status) => {
    switch (status) {
      case "accepted":
        return { text: "مقبول", color: "bg-green-500" };
      case "pending":
        return { text: "معلق", color: "bg-yellow-500" };
      case "cancelled":
        return { text: "ملغى", color: "bg-red-500" };
      default:
        return { text: status, color: "bg-gray-500" };
    }
  };

  const statusDetails = getStatusDetails(order.status);

  return (
    <>
      <ModalWrapper
        show={show}
        onClose={() => onClose(false)}
        isVisible={isVisible}
        title={`تفاصيل الطلب رقم: ${
          order.order_number || order.shipment_number || "غير معروف"
        }`}
        maxWidth="max-w-4xl"
      >
        <div className="flex flex-col gap-4 p-4 text-right text-gray-200">
          <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 text-sm">
            <p>
              <span className="font-semibold text-gray-300">تاريخ الطلب:</span>{" "}
              {new Date(
                order.order_date || order.shipment_date
              ).toLocaleDateString("ar-SA")}
            </p>
            <p>
              <span className="font-semibold text-gray-300">العميل:</span>{" "}
              {customerName}
            </p>
            <p>
              <span className="font-semibold text-gray-300">المندوب:</span>{" "}
              {salespersonName}
            </p>
            <p>
              <span className="font-semibold text-gray-300">الحالة:</span>{" "}
              <span
                className={`px-2 py-1 rounded-full text-sm font-semibold ${statusDetails.color}`}
              >
                {statusDetails.text}
              </span>
            </p>
            <p>
              <span className="font-semibold text-gray-300">نوع الطلب:</span>{" "}
              {order.type_order === "wholesale" ? "جملة" : "تجزئة"}
            </p>
            {order.type_order === "wholesale" && order.currency && (
              <p>
                <span className="font-semibold text-gray-300">العملة:</span>{" "}
                {order.currency.name}
              </p>
            )}
            {order.type_order === "wholesale" && order.payment_type && (
              <p>
                <span className="font-semibold text-gray-300">نوع الدفع:</span>{" "}
                {order.payment_type === "cash" ? "نقد" : "آجل"}
              </p>
            )}
          </div>

          <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 max-h-52 overflow-y-auto">
            <h3 className="text-xl font-bold text-accentColor mb-3">
              المنتجات في الطلب:
            </h3>
            {order.products && order.products.length > 0 ? (
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="py-2 pr-2 font-semibold text-gray-300">المنتج</th>
                    <th className="py-2 font-semibold text-gray-300">الكمية</th>
                    {order.type_order === "wholesale" && (
                      <>
                        <th className="py-2 font-semibold text-gray-300">سعر الوحدة</th>
                        <th className="py-2 font-semibold text-gray-300">الإجمالي</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(order.products || []).map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-700 last:border-b-0"
                    >
                      <td className="py-2 pr-2">
                        {item.name || `منتج ${item.product_id}`}
                        {item.unit && ` (${item.unit})`}
                      </td>
                      <td className="py-2">{item.quantity}</td>
                      {order.type_order === "wholesale" && (
                        <>
                          <td className="py-2">{item.unit_price}</td>
                          <td className="py-2">
                            {(
                              parseFloat(item.unit_price) *
                                parseFloat(item.quantity) || 0
                            ).toFixed(2)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-400 text-center py-4">
                لا توجد منتجات في هذا الطلب.
              </p>
            )}
          </div>

          {order.type_order === "wholesale" && (
            <div className="text-left font-bold text-accentColor text-xl">
              <span className="font-semibold text-gray-300">الإجمالي الكلي:</span>{" "}
              {grandTotal} {order.currency?.code || ""}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {order.note && (
              <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
                <h3 className="text-xl font-bold text-accentColor mb-2">
                  ملاحظة عند إنشاء الطلب:
                </h3>
                <p className="text-gray-300">{order.note}</p>
              </div>
            )}

            {order.status === "pending" && (
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

            {order.status !== "pending" && order.status_note && (
              <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 text-sm">
                <h3 className="font-semibold text-accentColor mb-1">
                  ملاحظة حالة الطلب:
                </h3>
                <p>{order.status_note}</p>
              </div>
            )}
          </div>

          {order.status === "accepted" && (
            <div className="flex justify-left mt-3">
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="bg-blue-500 hover:bg-blue-600 py-2 px-4 rounded flex items-center gap-1"
              >
                معاينة للطباعة
              </button>
            </div>
          )}
        </div>

        {showUpdateStatusModal && (
          <UpdateOrderStatusWithNoteModal
            show={showUpdateStatusModal}
            onClose={handleCloseUpdateStatusModal}
            order={order}
            newStatus={statusToUpdate}
            onUpdateSuccess={(
              orderId,
              updatedStatus,
              notes,
              userId,
              timestamp
            ) => {
              const updatedOrder = {
                ...order,
                status: updatedStatus,
                status_note: notes,
                processed_at: timestamp,
                salesperson_name: "مندوب 1",
              };
              handleCloseUpdateStatusModal(true, updatedOrder);
            }}
          />
        )}
      </ModalWrapper>

      <OrderPrintPreviewModal
        show={showPrintModal}
        onClose={setShowPrintModal}
        order={order}
      />
    </>
  );
}