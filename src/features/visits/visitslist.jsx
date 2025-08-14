import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import AddEntityButton from "../../components/shared/AddEntityButton";
import SearchFilterBar from "../../components/shared/SearchFilterBar";
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal";
import AddUpdateVisitModal from "./AddUpdateVisitModal"; // Import the unified Add/Update modal
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid"; // Import icons for card actions

import { get, del } from '../../utils/apiService'; // Keep imports for future API connection
import { toast } from 'react-toastify';

export default function Visitslist() {
  const [visits, setVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [errorVisits, setErrorVisits] = useState(null);

  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('customer_name'); // Default search by customer name
  const [currentPage, setCurrentPage] = useState(1);
  const visitsPerPage = 6; // Adjusted for card layout, typically fewer items per page

  // Modals visibility states
  const [showAddUpdateVisitModal, setShowAddUpdateVisitModal] = useState(false);
  const [showDeleteVisitModal, setShowDeleteVisitModal] = useState(false);
  
  // State to hold the visit object for editing or deleting
  const [visitToEdit, setVisitToEdit] = useState(null);
  const [visitToDelete, setVisitToDelete] = useState(null);

  // Dummy Data for Visits
  const dummyVisits = [
    { 
      visit_id: 'V001', 
      salesman_id: 'rep_001', 
      customer_id: 'cust_001', 
      type: 'حضوري', 
      purpose: 'عرض منتجات جديدة والتحقق من المخزون.', 
      date: '2024-07-20',
      salesman: { id: 'rep_001', name: 'أحمد (مندوب جملة)' }, // Dummy salesman data
      customer: { id: 'cust_001', name: 'متجر الأمانة' } // Dummy customer data
    },
    { 
      visit_id: 'V002', 
      salesman_id: 'rep_002', 
      customer_id: 'cust_002', 
      type: 'عن بعد (اتصال)', 
      purpose: 'متابعة طلبات العميل وتأكيد التسليم.', 
      date: '2024-07-19',
      salesman: { id: 'rep_002', name: 'سارة (مندوب تجزئة)' },
      customer: { id: 'cust_002', name: 'بقالة السعادة' }
    },
    { 
      visit_id: 'V003', 
      salesman_id: 'rep_001', 
      customer_id: 'cust_003', 
      type: 'حضوري', 
      purpose: 'تحصيل أموال مستحقة وتحديث بيانات العميل.', 
      date: '2024-07-18',
      salesman: { id: 'rep_001', name: 'أحمد (مندوب جملة)' },
      customer: { id: 'cust_003', name: 'سوبر ماركت الهدى' }
    },
    { 
      visit_id: 'V004', 
      salesman_id: 'rep_003', 
      customer_id: 'cust_004', 
      type: 'حضوري', 
      purpose: 'تقديم عروض خاصة لعمليات الشراء الكبيرة.', 
      date: '2024-07-17',
      salesman: { id: 'rep_003', name: 'علي (مندوب جملة)' },
      customer: { id: 'cust_004', name: 'مؤسسة النور للتجارة' }
    },
    { 
      visit_id: 'V005', 
      salesman_id: 'rep_002', 
      customer_id: 'cust_001', 
      type: 'عن بعد (اتصال)', 
      purpose: 'مناقشة مشاكل في توصيل الطلبات.', 
      date: '2024-07-16',
      salesman: { id: 'rep_002', name: 'سارة (مندوب تجزئة)' },
      customer: { id: 'cust_001', name: 'متجر الأمانة' }
    },
    { 
      visit_id: 'V006', 
      salesman_id: 'rep_004', 
      customer_id: 'cust_002', 
      type: 'حضوري', 
      purpose: 'استعراض المنتجات الأكثر مبيعاً.', 
      date: '2024-07-15',
      salesman: { id: 'rep_004', name: 'فاطمة (مندوب تجزئة)' },
      customer: { id: 'cust_002', name: 'بقالة السعادة' }
    },
    { 
      visit_id: 'V007', 
      salesman_id: 'rep_003', 
      customer_id: 'cust_003', 
      type: 'عن بعد (اتصال)', 
      purpose: 'تنسيق زيارة ميدانية قادمة.', 
      date: '2024-07-14',
      salesman: { id: 'rep_003', name: 'علي (مندوب جملة)' },
      customer: { id: 'cust_003', name: 'سوبر ماركت الهدى' }
    },
    { 
      visit_id: 'V008', 
      salesman_id: 'rep_001', 
      customer_id: 'cust_004', 
      type: 'حضوري', 
      purpose: 'تقديم تقرير أداء شهري.', 
      date: '2024-07-13',
      salesman: { id: 'rep_001', name: 'أحمد (مندوب جملة)' },
      customer: { id: 'cust_004', name: 'مؤسسة النور للتجارة' }
    },
    { 
      visit_id: 'V009', 
      salesman_id: 'rep_004', 
      customer_id: 'cust_001', 
      type: 'حضوري', 
      purpose: 'التفاوض على شروط الدفع الجديدة.', 
      date: '2024-07-12',
      salesman: { id: 'rep_004', name: 'فاطمة (مندوب تجزئة)' },
      customer: { id: 'cust_001', name: 'متجر الأمانة' }
    },
  ];

  // Function to fetch visits (now from dummy data)
  const fetchVisits = async () => {
    setLoadingVisits(true);
    setErrorVisits(null);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500)); 
      setVisits(dummyVisits); // Use dummy data
    } catch (err) {
      console.error("Failed to fetch visits (simulated):", err);
      setErrorVisits(err.message || 'فشل في جلب الزيارات (محاكاة).');
      toast.error('فشل في جلب الزيارات: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoadingVisits(false);
    }
  };

  // Fetch visits on component mount and when search terms change
  useEffect(() => {
    fetchVisits();
  }, [searchTerm, searchBy]); // Keep dependencies for search filtering

  // Reset pagination when filtered data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [visits]);

  // Memoized filtered visits
  const searchOptions = [
    { value: 'customer_name', label: 'اسم العميل' },
    { value: 'salesman_name', label: 'اسم المندوب' },
    { value: 'type', label: 'نوع الزيارة' },
    { value: 'purpose', label: 'الغرض من الزيارة' },
  ];

  const filteredVisits = useMemo(() => {
    if (!searchTerm) return visits;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return visits.filter(visit => {
      if (searchBy === 'customer_name') return visit.customer?.name?.toLowerCase().includes(lowerCaseSearchTerm);
      if (searchBy === 'salesman_name') return visit.salesman?.name?.toLowerCase().includes(lowerCaseSearchTerm);
      if (searchBy === 'type') return visit.type?.toLowerCase().includes(lowerCaseSearchTerm);
      if (searchBy === 'purpose') return visit.purpose?.toLowerCase().includes(lowerCaseSearchTerm);
      return false;
    });
  }, [visits, searchTerm, searchBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredVisits.length / visitsPerPage);
  const indexOfLastVisit = currentPage * visitsPerPage;
  const indexOfFirstVisit = indexOfLastVisit - visitsPerPage;
  const currentVisits = filteredVisits.slice(indexOfFirstVisit, indexOfLastVisit);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Handlers for Modals
  const handleAddVisitClick = () => {
    setVisitToEdit(null); // Set to null for add mode
    setShowAddUpdateVisitModal(true);
  };

  const handleEditVisitClick = (visit) => {
    setVisitToEdit(visit); // Set visit object for edit mode
    setShowAddUpdateVisitModal(true);
  };

  const handleDeleteVisitClick = (visit) => {
    setVisitToDelete(visit);
    setShowDeleteVisitModal(true);
  };

  const handleVisitModalClose = (isSuccess = false) => {
    setShowAddUpdateVisitModal(false);
    setShowDeleteVisitModal(false);
    setVisitToEdit(null);
    setVisitToDelete(null);
    if (isSuccess) {
      // For dummy data, if an operation was "successful", we simulate the change
      // by updating the dummy data directly, or just re-fetching the original dummy list.
      // For a real API, this would trigger a re-fetch from API to get updated data.
      fetchVisits(); 
    }
  };

  // Handle actual deletion (now simulated)
  const handleConfirmDeleteVisit = async () => {
    if (!visitToDelete) return;

    setLoadingVisits(true);
    try {
      // Simulate deletion success
      await new Promise(resolve => setTimeout(resolve, 500)); 
      toast.success('Visit deleted successfully (simulated)!');
      // For dummy data, we'll actually filter it out
      setVisits(prevVisits => prevVisits.filter(v => v.visit_id !== visitToDelete.visit_id));
    } catch (err) {
      console.error("Error deleting visit (simulated):", err);
      toast.error('Failed to delete visit (simulated): ' + (err.message || 'Unknown error.'));
    } finally {
      setLoadingVisits(false);
      setShowDeleteVisitModal(false);
      setVisitToDelete(null);
    }
  };

  return (
    <MainLayout>
      <div className="text-white">
        <div className="flex justify-between mb-4 items-center">
          <PageHeader title="إدارة الزيارات" />
        </div>
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <AddEntityButton label="+ إضافة زيارة" onClick={handleAddVisitClick} />
          <SearchFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchBy={searchBy}
            setSearchBy={setSearchBy}
            options={searchOptions}
            placeholder="بحث عن زيارة..."
          />
        </div>

        {loadingVisits ? (
          <p className="text-center text-lg">جاري تحميل الزيارات...</p>
        ) : errorVisits ? (
          <p className="text-center text-red-500 text-lg">خطأ: {errorVisits}</p>
        ) : filteredVisits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {currentVisits.map((visit) => (
              <div 
                key={visit.visit_id} 
                className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div>
                  <h3 className="amiriFont text-xl font-bold mb-2 text-white">الزيارة رقم: {visit.visit_id}</h3>
                  <p className="text-gray-300 mb-1">
                    <span className="font-semibold text-accentColor">المندوب:</span> {visit.salesman?.name || 'N/A'}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <span className="font-semibold text-accentColor">العميل:</span> {visit.customer?.name || 'N/A'}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <span className="font-semibold text-accentColor">التاريخ:</span> {new Date(visit.date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2 mt-2 mb-3">
                    <span className="font-semibold text-accentColor">النوع:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        visit.type === "حضوري" ? "bg-blue-600 text-white" : 
                        visit.type === "عن بعد (اتصال)" ? "bg-purple-600 text-white" : 
                        "bg-gray-600 text-white" 
                      }`}
                    >
                      {visit.type}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm italic border-t border-gray-700 pt-3">
                    <span className="font-semibold text-accentColor">الغرض:</span> {visit.purpose}
                  </p>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg transition-colors duration-200"
                    onClick={() => handleEditVisitClick(visit)}
                    title="تعديل الزيارة"
                  >
                    <PencilIcon className="w-5 h-5 text-white" />
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 p-2 rounded-lg transition-colors duration-200"
                    onClick={() => handleDeleteVisitClick(visit)}
                    title="حذف الزيارة"
                  >
                    <TrashIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="amiriFont text-center text-lg col-span-full">
            لا توجد زيارات مطابقة لنتائج البحث.
          </p>
        )}

        {/* Pagination Controls */}
        {!loadingVisits && !errorVisits && filteredVisits.length > 0 && (
          <div className="flex justify-center mt-6 items-center">
            <button
              className="text-white bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-full mx-2 transition-colors duration-200"
              onClick={prevPage}
              disabled={currentPage === 1}
            >
              &lt;&lt; السابق
            </button>
            <span className="text-white bg-accentColor px-5 py-2 rounded-full mx-1 font-bold">
              {currentPage} / {totalPages}
            </span>
            <button
              className="text-white bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-full mx-2 transition-colors duration-200"
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              التالي &gt;&gt;
            </button>
          </div>
        )}
      </div>

      {/* Add/Update Visit Modal */}
      <AddUpdateVisitModal
        show={showAddUpdateVisitModal}
        onClose={handleVisitModalClose}
        visitToEdit={visitToEdit}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        show={showDeleteVisitModal}
        onClose={() => handleVisitModalClose(false)}
        onConfirm={handleConfirmDeleteVisit}
        title="تأكيد حذف الزيارة"
        message={`هل أنت متأكد أنك تريد حذف الزيارة رقم "${visitToDelete?.visit_id}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />
    </MainLayout>
  );
}
