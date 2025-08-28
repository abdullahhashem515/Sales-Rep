import React, { useState, useMemo, useEffect, useContext } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import AddEntityButton from "../../components/shared/AddEntityButton";
import SearchFilterBar from "../../components/shared/SearchFilterBar";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal";
import { toast } from 'react-toastify';
import { get, del } from '../../utils/apiService';
import { AuthContext } from "../../contexts/AuthContext";

import AddReturnModal from "./AddReturnModal";
import ReturnDetailsModal from "./ReturnDetailsModal"; 

export default function ReturnsList() {
  const { token } = useContext(AuthContext);

  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('return_number');

  const [showAddReturnModal, setShowAddReturnModal] = useState(false);
  const [showDeleteReturnModal, setShowDeleteReturnModal] = useState(false);
  const [showReturnDetailsModal, setShowReturnDetailsModal] = useState(false);
  const [showEditReturnModal, setShowEditReturnModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [returnToView, setReturnToView] = useState(null);
  const [returnToEdit, setReturnToEdit] = useState(null);
  const [returnToDelete, setReturnToDelete] = useState(null);

  // تحديث خيارات البحث لتتوافق مع البيانات الجديدة
  const searchOptionsReturns = [
    { value: 'return_number', label: 'رقم المرتجع' },
    { value: 'customer', label: 'اسم العميل' }, 
    { value: 'payment_type', label: 'نوع الدفع' },
  ];

  // لم يتم تغيير هذه الدالة، فهي تعمل بشكل صحيح مع المسارات البسيطة والمعقدة
  const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

  const fetchReturns = async () => {
    if (!token) {
      setError("لا يوجد رمز مصادقة. يرجى تسجيل الدخول.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await get('admin/sale-returns', token);
      if (response.status === true && Array.isArray(response.data)) {
        setReturns(response.data);
      } else {
        setError(response.message || 'فشل جلب المرتجعات.');
        toast.error(response.message || 'فشل جلب المرتجعات.');
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع عند جلب المرتجعات.');
      toast.error(err.message || 'حدث خطأ غير متوقع عند جلب المرتجعات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchReturns();
  }, [token]);

  const filteredReturns = useMemo(() => {
    if (!searchTerm) return returns;
    const term = searchTerm.toLowerCase();
    return returns.filter(ret => String(getNestedValue(ret, searchBy) || '').toLowerCase().includes(term));
  }, [returns, searchTerm, searchBy]);

  const handleReturnModalClose = (isSuccess = false) => {
    setShowAddReturnModal(false);
    setShowDeleteReturnModal(false);
    setShowReturnDetailsModal(false);
    setShowEditReturnModal(false);
    setReturnToView(null);
    setReturnToEdit(null);
    setReturnToDelete(null);
    if (isSuccess) fetchReturns();
  };

  const handleAddReturnClick = () => setShowAddReturnModal(true);

  const handleViewReturnClick = (saleReturn) => {
    setReturnToView(saleReturn);
    setShowReturnDetailsModal(true);
  };

  const handleEditReturnClick = (saleReturn) => {
    setReturnToEdit(saleReturn);
    setShowEditReturnModal(true);
  };

  const handleDeleteReturnClick = (saleReturn) => {
    setReturnToDelete(saleReturn);
    setShowDeleteReturnModal(true);
  };

  // ✨ تم تعديل الدالة لإرسال slug بدلاً من id
  const handleConfirmDeleteReturn = async () => {
    if (!returnToDelete || !token) return;
    setDeleting(true);
    try {
      const response = await del(`admin/sale-returns/${returnToDelete.slug}`, token);
      if (response?.status === true) {
        toast.success('تم حذف المرتجع بنجاح!');
        handleReturnModalClose(true);
      } else {
        toast.error(response?.message || 'فشل حذف المرتجع.');
      }
    } catch (err) {
      toast.error(err.message || 'حدث خطأ غير متوقع أثناء حذف المرتجع.');
      console.error("Error deleting return:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-900 text-gray-300">
        <svg className="animate-spin h-8 w-8 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="ml-3">جاري تحميل المرتجعات...</span>
      </div>
    </MainLayout>
  );

  if (error) return <MainLayout><div className="text-center py-8 text-red-500 bg-gray-900 min-h-[calc(100vh-80px)]">خطأ: {error}</div></MainLayout>;
  
  return (
    <MainLayout>
      <div className="text-white">
        <div className="flex justify-between mb-4 items-center"><PageHeader title="المرتجعات" /></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <AddEntityButton label="+ إنشاء مرتجع" onClick={handleAddReturnClick} className="w-full md:w-auto" />
          <SearchFilterBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchBy={searchBy} setSearchBy={setSearchBy} options={searchOptionsReturns} placeholder="بحث عن مرتجع" className="w-full md:w-auto" />
        </div>

        <div className="mt-8 mb-4">
          <h3 className="amiriFont text-xl font-bold mb-4">قائمة المرتجعات</h3>
          <div className="max-h-[70vh] overflow-y-auto pr-2 border-2 border-accentColor rounded-lg p-2">
            {filteredReturns.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredReturns.map(saleReturn => (
                  <div key={saleReturn.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between" style={{ height: '100px' }}>
                    <div>
                      {/* التعديل هنا لاستخدام اسم العميل مباشرة */}
                      <h4 className="text-lg font-bold text-accentColor">{saleReturn.customer || 'غير متوفر'}</h4>
                      <p className="text-gray-300 text-sm">(نوع الدفع: {saleReturn.payment_type === 'cash' ? 'نقدي' : saleReturn.payment_type === 'credit' ? 'آجل' : 'غير محدد'})</p>
                      <p className="text-gray-400 text-xs">رقم المرتجع: {saleReturn.return_number}</p>
                      <p className="text-gray-400 text-xs">عدد المنتجات: {saleReturn.items?.length || 0}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full" title="عرض تفاصيل المرتجع" onClick={() => handleViewReturnClick(saleReturn)}>
                        <EyeIcon className="w-5 h-5 text-white" />
                      </button>
                      <button 
                          className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-full" 
                          title="تعديل المرتجع" 
                          onClick={() => handleEditReturnClick(saleReturn)}
                      >
                          <PencilIcon className="w-5 h-5 text-white" />
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 p-2 rounded-full" onClick={() => handleDeleteReturnClick(saleReturn)} title="حذف المرتجع">
                        <TrashIcon className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="amiriFont text-center text-lg col-span-full">لا توجد مرتجعات مطابقة لنتائج البحث.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddReturnModal 
        show={showAddReturnModal} 
        onClose={handleReturnModalClose}
      />

      <ReturnDetailsModal 
        show={showReturnDetailsModal}
        onClose={handleReturnModalClose}
        returnData={returnToView} 
      />

      <ConfirmDeleteModal
        show={showDeleteReturnModal}
        onClose={() => handleReturnModalClose(false)}
        onConfirm={handleConfirmDeleteReturn}
        loading={deleting}
        title="تأكيد حذف المرتجع"
        message={`هل أنت متأكد أنك تريد حذف المرتجع رقم "${returnToDelete?.return_number}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />
    </MainLayout>
  );
}