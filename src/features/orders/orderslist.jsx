// src/pages/orders/OrdersList.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader"; 
import AddEntityButton from "../../components/shared/AddEntityButton"; 
import SearchFilterBar from "../../components/shared/SearchFilterBar"; 
import FormSelectField from "../../components/shared/FormSelectField"; 
import { EyeIcon, TrashIcon, PlusIcon, CalendarDaysIcon, PencilIcon } from "@heroicons/react/24/solid";
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal"; 
import AddOrderModal from "./AddOrderModal"; 
import ViewOrderModal from "./ViewOrderModal"; 
import UpdateOrderModal from "./UpdateOrderModal"; 
import DateRangeFilterModal from './DateRangeFilterModal'; 
import { get, del } from "../../utils/apiService";
import { toast } from 'react-toastify';
import { AuthContext } from "../../contexts/AuthContext";

export default function OrdersList() {
  const { token } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [errorOrders, setErrorOrders] = useState(null);

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('user_id'); 
  const [filterStatus, setFilterStatus] = useState('all'); 
  const [dateRangeFilter, setDateRangeFilter] = useState({ startDate: null, endDate: null }); 

  const [showAddOrderModal, setShowAddOrderModal] = useState(false); 
  const [showViewOrderModal, setShowViewOrderModal] = useState(false);
  const [showUpdateOrderModal, setShowUpdateOrderModal] = useState(false); 
  const [showDeleteOrderModal, setShowDeleteOrderModal] = useState(false);
  const [showDateRangeFilterModal, setShowDateRangeFilterModal] = useState(false); 

  const [orderToView, setOrderToView] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [orderToEdit, setOrderToEdit] = useState(null); 




  // --- Fetch Users ---
  const fetchUsers = async () => {
    setLoadingUsers(true);
        if (!token) return; // انتظر التوكن
    try {
      const usersRes = await get('admin/users', token);
      if (!usersRes.users) throw new Error("Unexpected users response format");
      setUsers(usersRes.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      toast.error("فشل جلب المندوبين: " + err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  // --- Fetch Orders ---
// --- Fetch Orders ---
const fetchOrders = async () => {
  setLoadingOrders(true);
  setErrorOrders(null);

  try {
    if (!token) throw new Error("لا يوجد رمز مصادقة.");

    let wholesaleOrders = [];
    let retailOrders = [];

    // --- جلب طلبات الجملة ---
    try {
      const wholesaleRes = await get('admin/orders', token);

      wholesaleOrders = Array.isArray(wholesaleRes.data)
        ? wholesaleRes.data.map(item => ({
            order_id: item.order_number,
            customer_id: item.customer?.name || `عميل ${item.customer_id}`,
            user_id: item.user_id?.toString(),
            order_date: item.order_date,
            total: parseFloat(item.total_cost || 0),
            status: item.status,
            type: item.type,
            slug: item.slug || item.order_number,
            products: (item.items || []).map(p => ({
              product_id: p.product_id,
              name: p.name || `منتج ${p.product_id}`,
              quantity: p.quantity || 0,
              unit_price: parseFloat(p.unit_price || 0),
              total: parseFloat(p.total || 0),
              unit: p.unit || "",
            })),
            type_order: 'wholesale',
            note: item.note || '',
            status_note: item.status_note || ''
        }))
        : [];
    } catch (wholesaleError) {
      console.error("Error fetching wholesale orders:", wholesaleError);
      toast.error('حدث خطأ في جلب طلبات الجملة: ' + (wholesaleError.message || ''));
    }

    // --- جلب طلبات التجزئة ---
    try {
      const retailRes = await get('admin/shipment-requests', token);

      retailOrders = Array.isArray(retailRes["shipment-Request"])
        ? retailRes["shipment-Request"].map(item => ({
            order_id: item.shipment_number,
            customer_id: null,
            user_id: item.user_id?.toString(),
            order_date: item.shipment_date,
            total: parseFloat(item.total_cost) || 0,
            status: item.status,
            type: item.payment_type,
            currency_id: 2,
            slug: item.slug || item.shipment_number,
            products: (item.items || []).map(p => ({
              product_id: p.product_id,
              name: p.name || `منتج ${p.product_id}`,
              quantity: p.quantity || 0,
              unit_price: parseFloat(p.unit_price || 0),
              total: parseFloat(p.total_price || 0),
              unit: p.unit || "",
            })),
            type_order: 'retail',
            note: item.note || '',
            status_note: item.status_note || ''
          }))
        : [];
    } catch (retailError) {
      if (retailError.status === 404) {
        console.log("No retail orders found - this is expected behavior");
      } else {
        console.error("Error fetching retail orders:", retailError);
        toast.error('حدث خطأ في جلب طلبات التجزئة: ' + (retailError.message || ''));
      }
    }

   

    // أخيراً ضع الطلبات في الـ state
    setOrders({ wholesaleOrders, retailOrders });

  } catch (err) {
    console.error("General error in fetchOrders:", err);
    setErrorOrders(err.message || 'فشل في جلب الطلبات.');
    toast.error('فشل في جلب الطلبات: ' + (err.message || 'خطأ غير معروف.'));
  } finally {
    setLoadingOrders(false);
  }
};




  useEffect(() => {
    fetchUsers();
  }, [token]);

  useEffect(() => {
    if (users.length > 0) fetchOrders();
  }, [users, token]);

  

  // --- Helpers ---
  const getUserName = (id) => {
    const user = users.find(u => u.id.toString() === id);
    return user?.name || id;
  };

  const handleOrderModalClose = (isSuccess = false) => {
    setShowAddOrderModal(false);
    setShowViewOrderModal(false);
    setShowUpdateOrderModal(false);
    setShowDeleteOrderModal(false);
    setShowDateRangeFilterModal(false); 
    setOrderToView(null);
    setOrderToDelete(null);
    setOrderToEdit(null);
    if (isSuccess) fetchOrders();
  };

  const handleAddOrderClick = () => setShowAddOrderModal(true);
const handleViewOrderClick = (order) => {
  // أنشئ نسخة جديدة مع تضمين اسم العميل والمندوب مباشرة
  const orderWithNames = {
    ...order,
    customer_name: order.customer_id || (order.customer?.name || '-'),
    salesperson_name: order.user_id ? getUserName(order.user_id) : (order.user?.name || '-')
  };
  setOrderToView(orderWithNames);
  setShowViewOrderModal(true);
};
  const handleEditOrderClick = (order) => {
    setOrderToEdit(order);
    setShowUpdateOrderModal(true);
  };

  const handleDeleteOrderClick = (order) => {
    setOrderToDelete(order);
    setShowDeleteOrderModal(true);
  };

  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete || !token) return;
    try {
      const endpoint = orderToDelete.type_order === 'wholesale' 
        ? `admin/orders/${orderToDelete.slug}` 
        : `admin/shipment-requests/${orderToDelete.slug}`;
      await del(endpoint, token);
      toast.success('تم حذف الطلب بنجاح');
      handleOrderModalClose(true);
    } catch (err) {
      console.error("Failed to delete order:", err);
      toast.error('فشل حذف الطلب: ' + err.message);
    }
  };

  const searchOptionsOrders = [
    { value: 'order_id', label: 'رقم الطلب' },
    { value: 'user_id', label: 'المندوب' }, 
    { value: 'customer_id', label: 'العميل' }, 
  ];

const statusFilterOptions = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'pending', label: 'معلق' },
  { value: 'accepted', label: 'مقبول' },
  { value: 'cancelled', label: 'ملغى' },
];

const filteredOrders = useMemo(() => {
  // دمج الطلبات الجملة + الشحنات التجزئة في مصفوفة واحدة
  const allOrders = [...(orders.wholesaleOrders || []), ...(orders.retailOrders || [])];

  let currentFilteredOrders = allOrders;

  // فلترة حسب البحث
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    currentFilteredOrders = currentFilteredOrders.filter(order => {
      if (searchBy === 'order_id') return String(order.order_id).toLowerCase().includes(term);
      if (searchBy === 'user_id') return getUserName(order.user_id).toLowerCase().includes(term);
      if (searchBy === 'customer_id') return String(order.customer_id || '').toLowerCase().includes(term);
      return false;
    });
  }

  // فلترة حسب الحالة
  if (filterStatus !== 'all') {
    currentFilteredOrders = currentFilteredOrders.filter(order => order.status === filterStatus);
  }

  // فلترة حسب التاريخ
  if (dateRangeFilter.startDate || dateRangeFilter.endDate) {
    currentFilteredOrders = currentFilteredOrders.filter(order => {
      const orderDate = new Date(order.order_date);
      const startDateObj = dateRangeFilter.startDate ? new Date(dateRangeFilter.startDate) : null;
      const endDateObj = dateRangeFilter.endDate ? new Date(dateRangeFilter.endDate) : null;
      if (startDateObj) startDateObj.setHours(0,0,0,0);
      if (endDateObj) endDateObj.setHours(23,59,59,999);
      return (!startDateObj || orderDate >= startDateObj) && (!endDateObj || orderDate <= endDateObj);
    });
  }

  return currentFilteredOrders;
}, [orders, searchTerm, searchBy, filterStatus, dateRangeFilter]);


  const getStatusLabel = (status) => {
  switch(status) {
    case 'pending': return 'معلق';
    case 'accepted': return 'مقبول';
    case 'cancelled': return 'ملغى';
    default: return status;
  }
};

const getStatusColorClass = (status) => {
  switch(status) {
    case 'pending': return 'bg-yellow-500';
    case 'accepted': return 'bg-green-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const filteredWholesaleOrders = useMemo(() => {
  return filteredOrders.filter(order => order.type_order === 'wholesale');
}, [filteredOrders]);

const filteredRetailOrders = useMemo(() => {
  return filteredOrders.filter(order => order.type_order === 'retail');
}, [filteredOrders]);


  return (
    <MainLayout>
      <div className="text-white">
        <div className="flex justify-between mb-4 items-center">
          <PageHeader title="الطلبات" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-75 flex justify-between items-center">
            <div className="">
              <AddEntityButton
                label="+ إضافة طلب"
                onClick={handleAddOrderClick}
                className="w-full"
              />
            </div>
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
            <SearchFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              searchBy={searchBy}
              setSearchBy={setSearchBy}
              options={searchOptionsOrders}
              placeholder="بحث عن طلب"
              className="w-full md:w-auto"
            />
            <FormSelectField
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={statusFilterOptions}
              className="w-full md:w-48 text-right"
              labelClassName="text-gray-400"
            />
          </div>
        </div>

 <div className="mt-8 mb-4">
  <h3 className="amiriFont text-xl font-bold mb-4">طلبات الجملة</h3>
  <div className="max-h-[70vh] overflow-y-auto pr-2 border-2 border-accentColor rounded-lg p-2">
    {loadingOrders ? (
      <p className="text-center text-lg">جاري تحميل طلبات الجملة...</p>
    ) : orders.wholesaleOrders.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredWholesaleOrders.map(order => (
  <div key={order.order_id} className="bg-gray-800 p-5 rounded-lg shadow-md flex flex-col justify-between">
    <div>
      <h4 className="text-lg font-bold text-accentColor">طلب رقم: {order.order_id}</h4>
      <p>العميل: {order.customer_id || '-'}</p>
      <p>المندوب: {getUserName(order.user_id)}</p>
      <p>التاريخ: {new Date(order.order_date).toLocaleDateString()}</p>
      <p>الحالة: <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColorClass(order.status)}`}>{getStatusLabel(order.status)}</span></p>
    </div>
    <div className="flex justify-end gap-2 mt-4">
      <button onClick={() => handleViewOrderClick(order)} className="bg-blue-500 p-2 rounded-full hover:bg-blue-600">
        <EyeIcon className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => handleEditOrderClick(order)} className="bg-yellow-500 p-2 rounded-full hover:bg-yellow-600">
        <PencilIcon className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => handleDeleteOrderClick(order)} className="bg-red-500 p-2 rounded-full hover:bg-red-600">
        <TrashIcon className="w-5 h-5 text-white" />
      </button>
    </div>
  </div>
))}

      </div>
    ) : (
      <p className="amiriFont text-center text-lg">لا توجد طلبات جملة.</p>
    )}
  </div>
</div>

{/* شحنات التجزئة */}
<div className="mt-8 mb-4">
  <h3 className="amiriFont text-xl font-bold mb-4">شحنات التجزئة</h3>
  <div className="max-h-[70vh] overflow-y-auto pr-2 border-2 border-accentColor rounded-lg p-2">
    {loadingOrders ? (
      <p className="text-center text-lg">جاري تحميل شحنات التجزئة...</p>
    ) : orders.retailOrders.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredRetailOrders.map(order => (
  <div key={order.order_id} className="bg-gray-800 p-5 rounded-lg shadow-md flex flex-col justify-between">
    <div>
      <h4 className="text-lg font-bold text-accentColor">شحنة رقم: {order.order_id}</h4>
      <p>المندوب: {getUserName(order.user_id)}</p>
      <p>التاريخ: {new Date(order.order_date).toLocaleDateString()}</p>
      <p>الحالة: <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColorClass(order.status)}`}>{getStatusLabel(order.status)}</span></p>
    </div>
    <div className="flex justify-end gap-2 mt-4">
      <button onClick={() => handleViewOrderClick(order)} className="bg-blue-500 p-2 rounded-full hover:bg-blue-600">
        <EyeIcon className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => handleEditOrderClick(order)} className="bg-yellow-500 p-2 rounded-full hover:bg-yellow-600">
        <PencilIcon className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => handleDeleteOrderClick(order)} className="bg-red-500 p-2 rounded-full hover:bg-red-600">
        <TrashIcon className="w-5 h-5 text-white" />
      </button>
    </div>
  </div>
))}
      </div>
    ) : (
      <p className="amiriFont text-center text-lg">لا توجد شحنات تجزئة.</p>
    )}
  </div>
</div>
      </div>

      {/* Modals */}
      <AddOrderModal show={showAddOrderModal} onClose={handleOrderModalClose} />
<ViewOrderModal
  show={showViewOrderModal}
  onClose={handleOrderModalClose}
  order={orderToView}
  onUpdateOrderStatus={() => fetchOrders()}
/>
    <UpdateOrderModal show={showUpdateOrderModal} onClose={handleOrderModalClose} orderToEdit={orderToEdit} />
      <ConfirmDeleteModal
        show={showDeleteOrderModal}
        onClose={() => handleOrderModalClose(false)}
        onConfirm={handleConfirmDeleteOrder}
        title="تأكيد حذف الطلب"
        message={`هل أنت متأكد أنك تريد حذف الطلب رقم "${orderToDelete?.order_id}"؟`}
      />
      <DateRangeFilterModal
        show={showDateRangeFilterModal}
        onClose={() => handleOrderModalClose(false)}
        currentDateRange={dateRangeFilter}
        onApplyFilter={(range) => { setDateRangeFilter(range); handleOrderModalClose(false); }}
      />
    </MainLayout>
  );
}
