import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import AddEntityButton from "../../components/shared/AddEntityButton";
import SearchFilterBar from "../../components/shared/SearchFilterBar";
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal";
import CustomerCard from "./CustomerCard";
import ViewCustomerModal from "./ViewCustomerModal";
import AddUpdateCustomerModal from "./AddUpdateCustomerModal"; 

import { get, del } from '../../utils/apiService';
import { toast } from 'react-toastify';

export default function Customerslist() {
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [errorCustomers, setErrorCustomers] = useState(null);
  const [deleting, setDeleting] = useState(false); // NEW: حالة التحميل الخاصة بالحذف

  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 6; 

  const [showAddUpdateCustomerModal, setShowAddUpdateCustomerModal] = useState(false); 
  const [showDeleteCustomerModal, setShowDeleteCustomerModal] = useState(false);
  const [showViewCustomerModal, setShowViewCustomerModal] = useState(false); 

  const [customerToEditOrAdd, setCustomerToEditOrAdd] = useState(null); 
  const [customerToDelete, setCustomerToDelete] = useState(null); 
  const [customerToView, setCustomerToView] = useState(null); 

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

      const params = {};
      if (searchTerm) {
        if (searchBy === 'name') params.name = searchTerm;
        if (searchBy === 'phone') params.phone = searchTerm;
        if (searchBy === 'city') params.city = searchTerm;
        if (searchBy === 'address') params.address = searchTerm;
        if (searchBy === 'gender') params.gender = searchTerm.toLowerCase();
      }
      
      const response = await get('admin/customers', token, params);
      
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

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm, searchBy]); 

  useEffect(() => {
    setCurrentPage(1);
  }, [customers]); 

  const searchOptions = [
    { value: 'name', label: 'الاسم' },
    { value: 'phone', label: 'رقم الجوال' },
    { value: 'city', label: 'المدينة' },
    { value: 'address', label: 'العنوان' },
    { value: 'gender', label: 'الجنس' },
  ];

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

  const handleAddCustomerClick = () => {
    setCustomerToEditOrAdd(null); 
    setShowAddUpdateCustomerModal(true);
  };

  const handleViewCustomerClick = (customer) => { 
    setCustomerToView(customer);
    setShowViewCustomerModal(true);
  };

  const handleEditCustomerClick = (customer) => {
    setCustomerToEditOrAdd(customer); 
    setShowAddUpdateCustomerModal(true);
  };

  const handleDeleteCustomerClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteCustomerModal(true);
  };

  const handleCustomerModalClose = (isSuccess = false) => {
    setShowAddUpdateCustomerModal(false); 
    setShowDeleteCustomerModal(false);
    setShowViewCustomerModal(false); 
    setCustomerToEditOrAdd(null); 
    setCustomerToDelete(null);
    setCustomerToView(null); 
    if (isSuccess) {
      setTimeout(() => fetchCustomers(), 100); 
    }
  };

  const handleConfirmDeleteCustomer = async () => {
    if (!customerToDelete) return;

    setDeleting(true); // NEW: بدء حالة التحميل
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('لا يوجد رمز مصادقة للحذف. يرجى تسجيل الدخول.');
        setDeleting(false);
        return;
      }

      await del(`admin/customers/${customerToDelete.slug}`, token); 

      toast.success('تم حذف العميل بنجاح!');

      setCustomers(prev => prev.filter(cust => cust.id !== customerToDelete.id));

    } catch (err) {
      console.error("Error deleting customer:", err);
      toast.error('فشل في حذف العميل: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setDeleting(false); // NEW: إنهاء حالة التحميل
      handleCustomerModalClose(true);
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 rounded-2xl max-h-96 pr-4 border pt-5 pb-5 pl-5 border-white">
              {currentCustomers.map((customer) => (
                <CustomerCard 
                  key={customer.id} 
                  customer={customer} 
                  onView={handleViewCustomerClick} 
                  onEdit={handleEditCustomerClick} 
                  onDelete={handleDeleteCustomerClick} 
                />
              ))}
            </div>

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

      <AddUpdateCustomerModal
        show={showAddUpdateCustomerModal}
        onClose={handleCustomerModalClose}
        customerToEdit={customerToEditOrAdd}
      />
      
      <ConfirmDeleteModal
        show={showDeleteCustomerModal}
        onClose={() => handleCustomerModalClose(false)}
        onConfirm={handleConfirmDeleteCustomer}
        loading={deleting} // NEW: تمرير حالة التحميل
        title="تأكيد حذف العميل"
        message={`هل أنت متأكد أنك تريد حذف العميل "${customerToDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />

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