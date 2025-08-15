import React, { useState, useEffect, useContext } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import UpdateOrderStatusWithNoteModal from './UpdateOrderStatusWithNoteModal';
import { get } from "../../utils/apiService";
import { AuthContext } from "../../contexts/AuthContext";

export default function ViewOrderModal({ show, onClose, order, onUpdateOrderStatus }) {
  const { token } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState(null);

  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  // Fetch currencies
  const fetchCurrencies = async () => {
    if (!token) return;
    try {
      const res = await get("admin/currencies", token);
      if (Array.isArray(res)) setCurrencies(res);
      else console.error("Unexpected currencies response format");
    } catch (err) {
      console.error("Failed to fetch currencies:", err);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, [token]);

  const getCurrencyCodeById = (id) => {
    return currencies.find(c => c.id === id)?.code || "-";
  };

  const handleOpenUpdateStatusModal = (status) => {
    setStatusToUpdate(status);
    setShowUpdateStatusModal(true);
  };

  const handleCloseUpdateStatusModal = (isSuccess) => {
    setShowUpdateStatusModal(false);
    setStatusToUpdate(null);
    if (isSuccess) onUpdateOrderStatus(true);
  };

  if (!show || !order) return null;

const customerName = order.customer_name || "-";
const salespersonName = order.salesperson_name || "-";

  const totalAmount = order.products?.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0) || 0;

  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title={`تفاصيل الطلب رقم: ${order.order_id || order.slug}`}
      maxWidth="max-w-4xl"
    >
      <div className="flex flex-col gap-4 p-4 text-right text-gray-200">

        {/* Basic Info */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 text-sm">
          <p><span className="font-semibold text-gray-300">تاريخ الطلب:</span> {new Date(order.order_date || order.shipment_date).toLocaleString('ar-SA')}</p>
          <p><span className="font-semibold text-gray-300">المندوب:</span> {salespersonName}</p>
          <p><span className="font-semibold text-gray-300">العميل:</span> {customerName}</p>
          <p><span className="font-semibold text-gray-300">نوع الطلب:</span> {order.type === 'cash' ? 'نقدي' : 'آجل'}</p>
          <p>
            <span className="font-semibold text-gray-300">الحالة:</span>{' '}
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
              order.status === 'pending' ? 'bg-yellow-500' :
              order.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {order.status === 'pending' ? 'معلق' :
               order.status === 'approved' ? 'موافق عليه' : 'مرفوض'}
            </span>
          </p>
          <p><span className="font-semibold text-gray-300">العملة:</span> {getCurrencyCodeById(order.currency_id)}</p>
        </div>

        {/* Products */}
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
                    <td className="py-2 pr-2">{product.name || product.product_id}</td>
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

        {/* Total */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 mt-2 text-left">
          <p className="text-xl font-bold text-accentColor">
            <span className="font-semibold">الإجمالي الكلي:</span> {totalAmount.toFixed(2)} {getCurrencyCodeById(order.currency_id)}
          </p>
        </div>

        {/* Notes & Actions */}
        {(order.notes || order.status) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {order.notes && (
              <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700">
                <h3 className="text-xl font-bold text-accentColor mb-2">ملاحظات:</h3>
                <p className="text-gray-300">{order.notes}</p>
              </div>
            )}

            {order.status === 'pending' && (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => handleOpenUpdateStatusModal('approved')}
                  className="bg-green-500 hover:bg-green-600 py-2 px-4 rounded flex items-center gap-1"
                >
                  قبول الطلب
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenUpdateStatusModal('rejected')}
                  className="bg-red-500 hover:bg-red-600 py-2 px-4 rounded flex items-center gap-1"
                >
                  رفض الطلب
                </button>
              </div>
            )}

            {(order.status === 'approved' || order.status === 'rejected') && (
              <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 text-sm">
                <div><span className="font-semibold">تمت المعالجة بواسطة:</span> {salespersonName}</div>
                <div><span className="font-semibold">تاريخ المعالجة:</span> {order.processed_at ? new Date(order.processed_at).toLocaleString('ar-SA') : 'N/A'}</div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Update Status Modal */}
      {showUpdateStatusModal && (
        <UpdateOrderStatusWithNoteModal
          show={showUpdateStatusModal}
          onClose={handleCloseUpdateStatusModal}
          order={order}
          newStatus={statusToUpdate}
          onUpdateSuccess={onUpdateOrderStatus}
        />
      )}
    </ModalWrapper>
  );
}
