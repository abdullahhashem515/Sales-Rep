import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader"; 
import AddEntityButton from "../../components/shared/AddEntityButton"; 
import SearchFilterBar from "../../components/shared/SearchFilterBar"; 
import FormSelectField from "../../components/shared/FormSelectField"; // For status filter
import { EyeIcon, TrashIcon, PlusIcon, CalendarDaysIcon, PencilIcon } from "@heroicons/react/24/solid"; // Added PencilIcon

import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal"; 
// Import the new and updated modals
import AddOrderModal from "./AddOrderModal"; // NEW: Import AddOrderModal
import ViewOrderModal from "./ViewOrderModal"; // UPDATED: Now includes status change logic
import UpdateOrderModal from "./UpdateOrderModal"; // NEW: Import UpdateOrderModal
import DateRangeFilterModal from './DateRangeFilterModal'; // NEW: Import date range filter modal

import { get, del } from '../../utils/apiService'; 
import { toast } from 'react-toastify';


export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('user_id'); 
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [dateRangeFilter, setDateRangeFilter] = useState({ startDate: null, endDate: null }); 

  // States for Modals
  const [showAddOrderModal, setShowAddOrderModal] = useState(false); // NEW: State for AddOrderModal
  const [showViewOrderModal, setShowViewOrderModal] = useState(false);
  const [showUpdateOrderModal, setShowUpdateOrderModal] = useState(false); // NEW: State for UpdateOrderModal
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [showDateRangeFilterModal, setShowDateRangeFilterModal] = useState(false); 

  // Data for Modals
  const [orderToView, setOrderToView] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [orderToEdit, setOrderToEdit] = useState(null); // NEW: State for order to be edited

  // --- Dummy Data for local development ---
  const dummyOrdersData = [
    {
      order_id: 'ORD001',
      customer_id: 'CUST001', // Added customer_id for dummy data
      user_id: 'USER001', 
      order_date: '2024-07-20T10:00:00Z',
      total: 15000.50,
      status: 'pending',
      notes: 'يحتاج تأكيد سريع من المدير.',
      type: 'cash', // Added type
      currency_id: 1, // Added currency_id
      products: [ 
        { product_id: 'PROD001', name: 'أرز المجد 10 كجم', quantity: 2, unit_price: 7500.25, total: 15000.50 },
        { product_id: 'PROD002', name: 'زيت طبخ 3 لتر', quantity: 1, unit_price: 5000.00, total: 5000.00 }
      ]
    },
    {
      order_id: 'ORD002',
      customer_id: 'CUST002',
      user_id: 'USER002', 
      order_date: '2024-07-19T14:30:00Z',
      total: 2500.00,
      status: 'approved',
      approved_by: 'ADMIN001',
      approved_at: '2024-07-19T15:00:00Z',
      notes: 'تمت الموافقة من المدير.',
      type: 'credit', // Added type
      currency_id: 2, // Added currency_id
      products: [
        { product_id: 'PROD003', name: 'سكر 5 كجم', quantity: 1, unit_price: 2500.00, total: 2500.00 }
      ]
    },
    {
      order_id: 'ORD003',
      customer_id: 'CUST001',
      user_id: 'USER001', 
      order_date: '2024-07-18T09:15:00Z',
      total: 7500.00,
      status: 'rejected',
      approved_by: 'ADMIN002',
      approved_at: '2024-07-18T10:00:00Z',
      notes: 'الكمية المطلوبة من الأرز غير متوفرة حالياً.',
      type: 'cash', // Added type
      currency_id: 1, // Added currency_id
      products: [
        { product_id: 'PROD001', name: 'أرز المجد 10 كجم', quantity: 1, unit_price: 7500.00, total: 7500.00 }
      ]
    },
    {
      order_id: 'ORD004',
      customer_id: 'CUST003',
      user_id: 'USER003', 
      order_date: '2024-07-21T11:45:00Z',
      total: 12000.75,
      status: 'pending',
      notes: 'طلب جديد. يحتاج مراجعة المخزون.',
      type: 'cash', // Added type
      currency_id: 1, // Added currency_id
      products: [
        { product_id: 'PROD004', name: 'شاي الربيع 100 كيس', quantity: 3, unit_price: 4000.25, total: 12000.75 }
      ]
    },
    {
      order_id: 'ORD005',
      customer_id: 'CUST002',
      user_id: 'USER002', 
      order_date: '2024-07-17T16:00:00Z',
      total: 3000.00,
      status: 'approved',
      approved_by: 'ADMIN001',
      approved_at: '2024-07-17T16:30:00Z',
      notes: 'موافقة تلقائية لطلب صغير.',
      type: 'credit', // Added type
      currency_id: 2, // Added currency_id
      products: [
        { product_id: 'PROD005', name: 'مياه صحية 20 لتر', quantity: 5, unit_price: 600.00, total: 3000.00 }
      ]
    },
    {
        order_id: 'ORD006',
        customer_id: 'CUST001',
        user_id: 'USER001',
        order_date: '2024-06-25T08:00:00Z',
        total: 800.00,
        status: 'pending',
        notes: 'طلب عاجل من عميل مميز.',
        type: 'cash',
        currency_id: 1,
        products: [{ product_id: 'PROD006', name: 'صابون سائل', quantity: 4, unit_price: 200.00, total: 800.00 }]
    },
    {
        order_id: 'ORD007',
        customer_id: 'CUST003',
        user_id: 'USER003',
        order_date: '2024-07-01T13:00:00Z',
        total: 1250.00,
        status: 'approved',
        approved_by: 'ADMIN002',
        approved_at: '2024-07-01T14:00:00Z',
        notes: 'تمت مراجعة الفواتير.',
        type: 'cash',
        currency_id: 1,
        products: [{ product_id: 'PROD007', name: 'مناديل ورقية', quantity: 5, unit_price: 250.00, total: 1250.00 }]
    },
    {
        order_id: 'ORD008',
        customer_id: 'CUST002',
        user_id: 'USER002',
        order_date: '2024-07-05T10:00:00Z',
        total: 900.00,
        status: 'rejected',
        approved_by: 'ADMIN001',
        approved_at: '2024-07-05T11:00:00Z',
        notes: 'كمية المنتج غير متوفرة حالياً.',
        type: 'credit',
        currency_id: 2,
        products: [{ product_id: 'PROD008', name: 'معكرونة 1 كجم', quantity: 3, unit_price: 300.00, total: 900.00 }]
    },
  ];

  // Dummy Salespersons Data for mapping user_id to name
  const dummySalespersons = {
    'USER001': 'أحمد (مندوب جملة)',
    'USER002': 'سارة (مندوب تجزئة)',
    'USER003': 'علي (مندوب جملة)',
    'ADMIN001': 'مدير النظام 1', // Added admin dummy data for approved_by field
    'ADMIN002': 'مدير النظام 2',
  };

  // Dummy Currencies for display
  const dummyCurrenciesForDisplay = {
    1: { name: 'ريال يمني', code: 'YER' },
    2: { name: 'دولار أمريكي', code: 'USD' },
    3: { name: 'ريال سعودي', code: 'SAR' },
  };

  // Helper function to get salesperson name from user_id
  const getSalespersonName = (userId) => {
    return dummySalespersons[userId] || `مندوب غير معروف (${userId})`;
  };

  // Helper to get currency code from currency_id
  const getCurrencyCode = (currencyId) => {
    return dummyCurrenciesForDisplay[currencyId]?.code || 'N/A';
  };

  // --- Fetch Orders from API (simulated with dummy data) ---
  const fetchOrders = async () => {
    setLoadingOrders(true);
    setErrorOrders(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); 
      setOrders(dummyOrdersData);
      console.log("Orders (Dummy) Data Loaded:", dummyOrdersData);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setErrorOrders(err.message || 'فشل في جلب الطلبات.');
      toast.error('فشل في جلب الطلبات: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- Filtering Logic for Orders ---
  const searchOptionsOrders = [
    { value: 'order_id', label: 'رقم الطلب' },
    { value: 'user_id', label: 'المندوب (معرف)' }, 
    { value: 'customer_id', label: 'العميل (معرف)' }, // NEW: Search by customer ID
  ];

  const statusFilterOptions = [
    { value: 'all', label: 'كل الحالات' },
    { value: 'pending', label: 'معلق' },
    { value: 'approved', label: 'موافق' },
    { value: 'rejected', label: 'مرفوض' },
  ];

  const filteredOrders = useMemo(() => {
    let currentFilteredOrders = orders;

    // 1. Search Term Filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFilteredOrders = currentFilteredOrders.filter(order => {
        if (searchBy === 'order_id') {
          return String(order.order_id).toLowerCase().includes(lowerCaseSearchTerm);
        } else if (searchBy === 'user_id') {
          const salespersonName = getSalespersonName(order.user_id);
          return salespersonName.toLowerCase().includes(lowerCaseSearchTerm);
        } else if (searchBy === 'customer_id') { 
          return String(order.customer_id).toLowerCase().includes(lowerCaseSearchTerm);
        }
        return false;
      });
    }

    // 2. Status Filter
    if (filterStatus !== 'all') {
      currentFilteredOrders = currentFilteredOrders.filter(order => order.status === filterStatus);
    }

    // 3. Date Range Filter
    if (dateRangeFilter.startDate || dateRangeFilter.endDate) {
        currentFilteredOrders = currentFilteredOrders.filter(order => {
            const orderDate = new Date(order.order_date);
            const startDateObj = dateRangeFilter.startDate ? new Date(dateRangeFilter.startDate) : null;
            const endDateObj = dateRangeFilter.endDate ? new Date(dateRangeFilter.endDate) : null;

            if (startDateObj) startDateObj.setHours(0, 0, 0, 0);
            if (endDateObj) endDateObj.setHours(23, 59, 59, 999);

            const isAfterStart = !startDateObj || orderDate >= startDateObj;
            const isBeforeEnd = !endDateObj || orderDate <= endDateObj;

            return isAfterStart && isBeforeEnd;
        });
    }

    return currentFilteredOrders;
  }, [orders, searchTerm, searchBy, filterStatus, dateRangeFilter]);

  // --- Handlers for Modals ---
  // Modified handleOrderModalClose to also update individual order state if status changes
  const handleOrderModalClose = (isSuccess = false, updatedOrderId = null, updatedStatus = null, updatedNotes = null, updatedApprovedBy = null, updatedApprovedAt = null) => {
    setShowAddOrderModal(false);
    setShowViewOrderModal(false);
    setShowUpdateOrderModal(false); // Close UpdateOrderModal
    setShowDeleteOrderModal(false);
    setShowDateRangeFilterModal(false); 
    setOrderToView(null);
    setOrderToDelete(null);
    setOrderToEdit(null); // Clear order to edit

    if (isSuccess) {
        if (updatedOrderId && updatedStatus) {
            setOrders(prevOrders => prevOrders.map(order => 
                order.order_id === updatedOrderId 
                ? { ...order, status: updatedStatus, notes: updatedNotes, approved_by: updatedApprovedBy, approved_at: updatedApprovedAt } 
                : order
            ));
            toast.success('تم تحديث الطلب بنجاح محليًا!');
        }
        setTimeout(() => {
            fetchOrders(); 
        }, 500);
    }
  };

  const handleAddOrderClick = () => setShowAddOrderModal(true); // Open AddOrderModal
  const handleViewOrderClick = (order) => {
    setOrderToView(order);
    setShowViewOrderModal(true);
  };
  
  const handleEditOrderClick = (order) => { // Open UpdateOrderModal
    setOrderToEdit(order);
    setShowUpdateOrderModal(true);
  };

  const handleDeleteOrderClick = (order) => {
    setOrderToDelete(order);
    setShowDeleteOrderModal(true);
  };

  const handleApplyDateRangeFilter = ({ startDate, endDate }) => {
    setDateRangeFilter({ startDate, endDate });
    handleOrderModalClose(false); 
  };

  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    setLoadingOrders(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('لا يوجد رمز مصادقة للحذف. يرجى تسجيل الدخول.');
        setLoadingOrders(false);
        return;
      }
      
      setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderToDelete.order_id));
      toast.success('تم حذف الطلب بنجاح (محاكاة)!'); 
      handleOrderModalClose(true); 
      
    } catch (err) {
      console.error("Error deleting order:", err);
      const errorMessage = err.message || 'فشل في حذف الطلب: خطأ غير معروف.';
      toast.error(errorMessage);
      handleOrderModalClose(false);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Helper to map order status for display
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'معلق';
      case 'approved': return 'موافق';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  // Helper to get status color
  const getStatusColorClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <MainLayout>
      <div className="text-white">
        {/* Orders Section */}
        <div className="flex justify-between mb-4 items-center">
          <PageHeader title="الطلبات" />
        </div>
        
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-75 flex justify-between items-center">
            {/* زر إضافة طلب على اليسار */}
            <div className="">
              <AddEntityButton
                label="+ إضافة طلب"
                onClick={handleAddOrderClick}
                className="w-full"
              />
            </div>

            {/* زر الفلترة بالتاريخ على اليمين */}
            <div className="">
              <AddEntityButton
                onClick={() => setShowDateRangeFilterModal(true)}
                label="فلترة الطلبات بالتاريخ"
                className="w-full flex items-center justify-center"
              >
                <CalendarDaysIcon className="w-5 h-5 mr-1" />
              </AddEntityButton>
            </div>
          </div>
          <div className="flex-col">
            {/* Search Filter Bar */}
            <SearchFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              searchBy={searchBy}
              setSearchBy={setSearchBy}
              options={searchOptionsOrders}
              placeholder="بحث عن طلب"
              className="w-full md:w-auto"
            />
            {/* Status Filter Dropdown */}
            <FormSelectField
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={statusFilterOptions}
              className="w-full md:w-48 text-right" // Align text right for Arabic
              labelClassName="text-gray-400"
            />
          </div>
        </div>

        <div className="mt-8 mb-4">
          <h3 className="amiriFont text-xl font-bold mb-4">قائمة الطلبات</h3>
          <div className="max-h-[70vh] overflow-y-auto pr-2 border-2 border-accentColor rounded-lg p-2"> 
            {loadingOrders ? (
              <p className="text-center text-lg">جاري تحميل الطلبات...</p>
            ) : errorOrders ? (
              <p className="text-center text-red-500 text-lg">خطأ: {errorOrders}</p>
            ) : filteredOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"> 
                {filteredOrders.map((order) => (
                  <div key={order.order_id} className="bg-gray-800 p-5 rounded-lg shadow-md flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-lg font-bold text-accentColor">طلب رقم: {order.order_id}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColorClass(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-1">
                        <span className="font-semibold">العميل:</span> {order.customer_id}
                      </p>
                      <p className="text-gray-300 text-sm mb-1">
                        <span className="font-semibold">المندوب:</span> {getSalespersonName(order.user_id)}
                      </p>
                      <p className="text-gray-300 text-sm mb-1">
                        <span className="font-semibold">تاريخ الطلب:</span> {new Date(order.order_date).toLocaleDateString('ar-SA')}
                      </p>
                      <p className="text-gray-300 text-sm mb-3">
                        <span className="font-semibold">الإجمالي:</span> {order.total.toFixed(2)} {getCurrencyCode(order.currency_id)}
                      </p>
                      {order.notes && (
                        <p className="text-gray-400 text-xs italic truncate">
                          <span className="font-semibold">ملاحظات:</span> {order.notes}
                        </p>
                      )}
                    </div>
                    
                    {/* Conditional Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4">
                      {/* View Button (Always visible) */}
                      <button
                        className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full"
                        onClick={() => handleViewOrderClick(order)}
                        title="عرض التفاصيل"
                      >
                        <EyeIcon className="w-5 h-5 text-white" />
                      </button>

                      {/* Edit Button (Always visible, to UpdateOrder page) */}
                      <button
                        className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-full"
                        onClick={() => handleEditOrderClick(order)}
                        title="تعديل الطلب"
                      >
                        <PencilIcon className="w-5 h-5 text-white" />
                      </button>

                      {/* Delete Button (Visible for approved or rejected orders) */}
                      {(order.status === 'approved' || order.status === 'rejected') && (
                        <button
                          className="bg-red-500 hover:bg-red-600 p-2 rounded-full"
                          onClick={() => handleDeleteOrderClick(order)}
                          title="حذف الطلب"
                        >
                          <TrashIcon className="w-5 h-5 text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="amiriFont text-center text-lg col-span-full">لا توجد طلبات مطابقة لنتائج البحث.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddOrderModal
        show={showAddOrderModal}
        onClose={handleOrderModalClose}
      />
      <ViewOrderModal
        show={showViewOrderModal}
        onClose={handleOrderModalClose}
        order={orderToView}
        onUpdateOrderStatus={handleOrderModalClose} 
      />
      <UpdateOrderModal
        show={showUpdateOrderModal}
        onClose={handleOrderModalClose}
        orderToEdit={orderToEdit}
      />
      <ConfirmDeleteModal
        show={showDeleteOrderModal}
        onClose={() => handleOrderModalClose(false)}
        onConfirm={handleConfirmDeleteOrder}
        title="تأكيد حذف الطلب"
        message={`هل أنت متأكد أنك تريد حذف الطلب رقم "${orderToDelete?.order_id}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />
      <DateRangeFilterModal
        show={showDateRangeFilterModal}
        onClose={() => handleOrderModalClose(false)}
        currentDateRange={dateRangeFilter}
        onApplyFilter={handleApplyDateRangeFilter}
      />
    </MainLayout>
  );
}
