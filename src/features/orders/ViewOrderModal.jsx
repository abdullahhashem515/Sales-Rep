import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper"; // Assuming this path is correct
import UpdateOrderStatusWithNoteModal from './UpdateOrderStatusWithNoteModal'; // NEW: Import the new modal

export default function ViewOrderModal({ show, onClose, order, onUpdateOrderStatus }) {
  const [isVisible, setIsVisible] = useState(false);
  // NEW States for UpdateOrderStatusWithNoteModal
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState(null); // 'approved' or 'rejected'

  // Dummy Salespersons Data (should ideally come from a shared context or API in a real app)
  const dummySalespersons = {
    'USER001': 'أحمد (مندوب جملة)',
    'USER002': 'سارة (مندوب تجزئة)',
    'USER003': 'علي (مندوب جملة)',
    'ADMIN001': 'مدير النظام 1',
    'ADMIN002': 'مدير النظام 2',
  };

  // Helper function to get salesperson/admin name from user_id
  const getSalespersonName = (userId) => {
    return dummySalespersons[userId] || `غير معروف (${userId})`;
  };

  // Helper to map order status for display
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'approved': return 'موافق عليه';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [show]);

  const handleOpenUpdateStatusModal = (status) => {
    setStatusToUpdate(status);
    setShowUpdateStatusModal(true);
  };

  const handleCloseUpdateStatusModal = (isSuccess) => {
    setShowUpdateStatusModal(false);
    setStatusToUpdate(null);
    if (isSuccess) {
      onUpdateOrderStatus(true); // Notify parent to re-fetch orders
    }
  };

  if (!show || !order) return null; // Ensure order object exists before rendering

  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title={`تفاصيل الطلب رقم: ${order.order_id}`}
      maxWidth="max-w-4xl" // UPDATED: Increased width to max-w-4xl
    >
      <div className="flex flex-col gap-4 p-4 text-right text-gray-200">
        {/* Order Basic Info - Distributed in a grid */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-2 gap-x-4 text-sm"> {/* UPDATED: Grid layout */}
          <p>
            <span className="font-semibold text-gray-300">تاريخ الطلب:</span>{' '}
            <span className="text-gray-300">{new Date(order.order_date).toLocaleString('ar-SA')}</span>
          </p>
          <p>
            <span className="font-semibold text-gray-300">المندوب:</span>{' '}
            <span className="text-gray-300">{getSalespersonName(order.user_id)}</span>
          </p>
          {order.customer_id && ( // Display customer only if it exists
            <p>
              <span className="font-semibold text-gray-300">العميل:</span>{' '}
              <span className="text-gray-300">{order.customer_id}</span> {/* Replace with actual customer name if available */}
            </p>
          )}
          <p>
            <span className="font-semibold text-gray-300">نوع الطلب:</span>{' '}
            <span className="text-gray-300">{order.type === 'cash' ? 'نقدي' : 'آجل'}</span>
          </p>
          <p>
            <span className="font-semibold text-gray-300">الحالة:</span>{' '}
            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
              order.status === 'pending' ? 'bg-yellow-500' :
              order.status === 'approved' ? 'bg-green-500' :
              'bg-red-500'
            }`}>
              {getStatusLabel(order.status)}
            </span>
          </p>
          <p>
            <span className="font-semibold text-gray-300">العملة:</span>{' '}
            <span className="text-gray-300">{order.currency_code}</span>
          </p>
        </div>

        {/* Products List - Now with more controlled height */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 max-h-52 overflow-y-auto"> {/* UPDATED: Reduced max-h for products */}
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
                {order.products.map((product, index) => (
                  <tr key={index} className="border-b border-gray-700 last:border-b-0">
                    <td className="py-2 pr-2">{product.name}</td>
                    <td className="py-2">{product.quantity}</td>
                    <td className="py-2">{typeof product.unit_price === 'number' ? product.unit_price.toFixed(2) : 'N/A'}</td>
                    <td className="py-2 pl-2 font-semibold">{typeof product.total === 'number' ? product.total.toFixed(2) : (0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-400 text-center py-4">لا توجد منتجات في هذا الطلب.</p>
          )}
        </div>

        {/* Total Amount */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 mt-2 text-left">
          <p className="text-xl font-bold text-accentColor">
            <span className="font-semibold">الإجمالي الكلي:</span>{' '}
            {typeof order.total_amount === 'number' ? order.total_amount.toFixed(2) : (0).toFixed(2)}{' '}
            {order.currency_code}
          </p>
        </div>

        {/* Notes (if any) and Approval/Rejection Details in a single row for large screens */}
        {(order.notes || order.status === 'approved' || order.status === 'rejected') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"> {/* UPDATED: Grid for notes/details */}
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
                <div>
                  <span className="font-semibold">تمت المعالجة بواسطة:</span>{' '}
                  <span className="text-gray-300">{getSalespersonName(order.processed_by || 'N/A')}</span>
                </div>
                <div>
                  <span className="font-semibold">تاريخ المعالجة:</span>{' '}
                  <span className="text-gray-300">{order.processed_at ? new Date(order.processed_at).toLocaleString('ar-SA') : 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons at the bottom of the modal */}
        
      </div>

      {/* NEW: Update Status With Note Modal */}
      {showUpdateStatusModal && (
        <UpdateOrderStatusWithNoteModal
          show={showUpdateStatusModal}
          onClose={handleCloseUpdateStatusModal}
          order={order}
          newStatus={statusToUpdate}
          onUpdateSuccess={onUpdateOrderStatus} // This will trigger the re-fetch
        />
      )}
    </ModalWrapper>
  );
}
