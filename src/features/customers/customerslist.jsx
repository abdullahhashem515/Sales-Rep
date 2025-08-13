import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import AddEntityButton from "../../components/shared/AddEntityButton";
import SearchFilterBar from "../../components/shared/SearchFilterBar";
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal";
import CustomerCard from "./CustomerCard";
// import AddCustomerModal from "./AddCustomerModal"; // To be created later
// import UpdateCustomerModal from "./UpdateCustomerModal"; // To be created later
import ViewCustomerModal from "./ViewCustomerModal";


import { get, del } from '../../utils/apiService';
import { toast } from 'react-toastify';

export default function Customerslist() {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [errorCustomers, setErrorCustomers] = useState(null);

  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 6; // Display 6 cards per page

  // Modals visibility states
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [showUpdateCustomerModal, setShowUpdateCustomerModal] = useState(false);
  const [showDeleteCustomerModal, setShowDeleteCustomerModal] = useState(false);
  const [showViewCustomerModal, setShowViewCustomerModal] = useState(false); // NEW: State for View Customer Modal

  // States to hold the customer object for editing, deleting or viewing
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null); // Full customer object for deletion message
  const [customerToView, setCustomerToView] = useState(null); // NEW: State to hold customer for viewing

  // Function to fetch customers from the API
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    setErrorCustomers(null);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setErrorCustomers('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        toast.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        setLoadingCustomers(false);
        return;
      }

      // Construct query parameters for search
      const params = {};
      if (searchTerm) {
        if (searchBy === 'name') params.name = searchTerm;
        if (searchBy === 'phone') params.phone = searchTerm;
        if (searchBy === 'city') params.city = searchTerm;
        if (searchBy === 'address') params.address = searchTerm;
        if (searchBy === 'gender') params.gender = searchTerm.toLowerCase(); // Assuming gender is 'male' or 'female'
      }
      
      const response = await get('admin/customers', token, params);
      
      // The API returns an array directly, or an object with a 'customers' array
      if (Array.isArray(response)) {
        setCustomers(response);
      } else if (response && Array.isArray(response.customers)) {
        setCustomers(response.customers);
      } else {
        console.warn("API response for customers is unexpected:", response);
        setCustomers([]);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setErrorCustomers(err.message || 'فشل في جلب العملاء.');
      toast.error('فشل في جلب العملاء: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Fetch customers on component mount and when search terms change
  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, searchBy]); // Re-fetch when search terms change

  // Reset pagination when filtered data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [customers]); // Reset page when base customer list changes (e.g., after add/edit/delete)

  // Memoized filtered and paginated customers
  const searchOptions = [
    { value: 'name', label: 'الاسم' },
    { value: 'phone', label: 'رقم الجوال' },
    { value: 'city', label: 'المدينة' },
    { value: 'address', label: 'العنوان' },
    { value: 'gender', label: 'الجنس' },
  ];

  // Pagination Logic
  const totalPages = Math.ceil(customers.length / customersPerPage);
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Handlers for Modals
  const handleAddCustomerClick = () => setShowAddCustomerModal(true);

  const handleViewCustomerClick = (customer) => { // NEW: Handle View action
    setCustomerToView(customer);
    setShowViewCustomerModal(true);
  };

  const handleEditCustomerClick = (customer) => {
    setCustomerToEdit(customer);
    setShowUpdateCustomerModal(true);
  };

  const handleDeleteCustomerClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteCustomerModal(true);
  };

  const handleCustomerModalClose = (isSuccess = false) => {
    setShowAddCustomerModal(false);
    setShowUpdateCustomerModal(false);
    setShowDeleteCustomerModal(false);
    setShowViewCustomerModal(false); // NEW: Close View modal
    setCustomerToEdit(null);
    setCustomerToDelete(null);
    setCustomerToView(null); // NEW: Clear customer to view
    if (isSuccess) {
      fetchCustomers(); // Re-fetch customers if an operation was successful
    }
  };

  // Handle actual deletion
  const handleConfirmDeleteCustomer = async () => {
    if (!customerToDelete) return;

    setLoadingCustomers(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('لا يوجد رمز مصادقة للحذف. يرجى تسجيل الدخول.');
        setLoadingCustomers(false);
        return;
      }
      
      // Assuming customer.id is the unique identifier for deletion
      const response = await del(`admin/customers/${customerToDelete.id}`, token); 

      if (response.status) {
        toast.success('تم حذف العميل بنجاح!');
        fetchCustomers(); // Re-fetch customers
      } else {
        const apiErrorMessage = response.message || 'فشل حذف العميل.';
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("Error deleting customer:", err);
      toast.error('فشل في حذف العميل: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoadingCustomers(false);
      setShowDeleteCustomerModal(false); // Close delete confirmation modal
      setCustomerToDelete(null); // Clear customer to delete
    }
  };


  return (
    <MainLayout>
      <div className="text-white">
        <div className="flex justify-between mb-4 items-center">
          <PageHeader title="إدارة العملاء" />
        </div>
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <AddEntityButton label="+ إضافة عميل" onClick={handleAddCustomerClick} />
          <SearchFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchBy={searchBy}
            setSearchBy={setSearchBy}
            options={searchOptions}
            placeholder="بحث عن عميل..."
          />
        </div>

        {loadingCustomers ? (
          <p className="text-center text-lg mt-8">جاري تحميل العملاء...</p>
        ) : errorCustomers ? (
          <p className="text-center text-red-500 text-lg mt-8">خطأ: {errorCustomers}</p>
        ) : customers.length === 0 ? (
          <p className="text-center text-lg text-white mt-8">لا توجد بيانات للعملاء لعرضها.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {currentCustomers.map((customer) => (
                <CustomerCard 
                  key={customer.id} 
                  customer={customer} 
                  onView={handleViewCustomerClick} // NEW: Pass View handler
                  onEdit={handleEditCustomerClick} 
                  onDelete={handleDeleteCustomerClick} 
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {customers.length > customersPerPage && (
              <div className="flex justify-center mt-8 items-center">
                <button
                  className="text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg mx-2 transition-colors duration-200"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  &lt;&lt; السابق
                </button>
                <span className="text-white bg-accentColor px-4 py-2 rounded-lg mx-1 font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  className="text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg mx-2 transition-colors duration-200"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  التالي &gt;&gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals for Add, Update, Delete Customer */}
      {/* <AddCustomerModal
        show={showAddCustomerModal}
        onClose={handleCustomerModalClose}
      />
      <UpdateCustomerModal
        show={showUpdateCustomerModal}
        onClose={handleCustomerModalClose}
        customerToEdit={customerToEdit}
      /> */}
      <ConfirmDeleteModal
        show={showDeleteCustomerModal}
        onClose={() => handleCustomerModalClose(false)}
        onConfirm={handleConfirmDeleteCustomer}
        title="تأكيد حذف العميل"
        message={`هل أنت متأكد أنك تريد حذف العميل "${customerToDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />

      {/* NEW: View Customer Modal */}
      {showViewCustomerModal && (
        <ViewCustomerModal
          show={showViewCustomerModal}
          onClose={() => handleCustomerModalClose(false)}
          customer={customerToView}
        />
      )}
    </MainLayout>
  );
}
