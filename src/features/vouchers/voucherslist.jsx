import React, { useState, useMemo, useEffect, useContext } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import AddEntityButton from "../../components/shared/AddEntityButton";
import SearchFilterBar from "../../components/shared/SearchFilterBar";
import { EyeIcon, PencilIcon, TrashIcon, CreditCardIcon, ArrowDownOnSquareIcon } from "@heroicons/react/24/solid";
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal";
import { toast } from 'react-toastify';
import { get, del } from '../../utils/apiService';
import { AuthContext } from "../../contexts/AuthContext";

export default function Voucherslist() {
  const { token } = useContext(AuthContext);

  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('voucher_number');

  const [showAddClientVoucherModal, setShowAddClientVoucherModal] = useState(false);
  const [showAddSalespersonVoucherModal, setShowAddSalespersonVoucherModal] = useState(false);
  const [showDeleteVoucherModal, setShowDeleteVoucherModal] = useState(false);
  const [showVoucherDetailsModal, setShowVoucherDetailsModal] = useState(false);
  const [showEditVoucherModal, setShowEditVoucherModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [voucherToView, setVoucherToView] = useState(null);
  const [voucherToEdit, setVoucherToEdit] = useState(null);
  const [voucherToDelete, setVoucherToDelete] = useState(null);

  const searchOptionsVouchers = [
    { value: 'voucher_number', label: 'رقم السند' },
    { value: 'customer', label: 'اسم العميل' },
    { value: 'sales_rep', label: 'اسم المندوب' },
    { value: 'payment_type', label: 'نوع الدفع' },
  ];

  const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

  const fetchVouchers = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await get('admin/payment-vouchers', token);
      if (response.status === true && Array.isArray(response.data)) {
        setVouchers(response.data);
      } else {
        setError(response.message || 'فشل جلب السندات.');
        toast.error(response.message || 'فشل جلب السندات.');
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع عند جلب السندات.');
      toast.error(err.message || 'حدث خطأ غير متوقع عند جلب السندات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchVouchers();
  }, [token]);

  const filteredVouchers = useMemo(() => {
    if (!searchTerm) return vouchers;
    const term = searchTerm.toLowerCase();
    return vouchers.filter(vouch => String(getNestedValue(vouch, searchBy) || '').toLowerCase().includes(term));
  }, [vouchers, searchTerm, searchBy]);

  const handleVoucherModalClose = (isSuccess = false) => {
    setShowAddClientVoucherModal(false);
    setShowAddSalespersonVoucherModal(false);
    setShowDeleteVoucherModal(false);
    setShowVoucherDetailsModal(false);
    setShowEditVoucherModal(false);
    setVoucherToView(null);
    setVoucherToEdit(null);
    setVoucherToDelete(null);
    if (isSuccess) fetchVouchers();
  };

  const handleAddClientVoucherClick = () => setShowAddClientVoucherModal(true);
  const handleAddSalespersonVoucherClick = () => setShowAddSalespersonVoucherModal(true);

  const handleViewVoucherClick = (voucher) => {
    setVoucherToView(voucher);
    setShowVoucherDetailsModal(true);
  };
  
  const handleEditVoucherClick = (voucher) => {
    setVoucherToEdit(voucher);
    setShowEditVoucherModal(true);
  };

  const handleDeleteVoucherClick = (voucher) => {
    setVoucherToDelete(voucher);
    setShowDeleteVoucherModal(true);
  };

  const handleConfirmDeleteVoucher = async () => {
    if (!voucherToDelete || !token) return;
    setDeleting(true);
    try {
      const response = await del(`admin/payment-vouchers/${voucherToDelete.slug}`, token);
      if (response?.status === true) {
        toast.success('تم حذف السند بنجاح!');
        handleVoucherModalClose(true);
      } else {
        toast.error(response?.message || 'فشل حذف السند.');
      }
    } catch (err) {
      toast.error(err.message || 'حدث خطأ غير متوقع أثناء حذف السند.');
      console.error("Error deleting voucher:", err);
    } finally {
      setDeleting(false);
    }
  };
  
  // ✅ تم حذف هذا الشرط من هنا
  // if (loading) return ( ... );

  return (
    <MainLayout>
      <div className="text-white">
        <div className="flex justify-between mb-4 items-center"><PageHeader title="السندات" /></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex gap-4 flex-col md:flex-row w-full md:w-auto">
            <AddEntityButton label="سند تسديد للعميل" onClick={handleAddClientVoucherClick} icon={CreditCardIcon} className="w-full md:w-auto" />
            <AddEntityButton label="سند سحب من المندوب" onClick={handleAddSalespersonVoucherClick} icon={ArrowDownOnSquareIcon} className="w-full md:w-auto" />
          </div>
          <SearchFilterBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchBy={searchBy} setSearchBy={setSearchBy} options={searchOptionsVouchers} placeholder="بحث عن سند" className="w-full md:w-auto" />
        </div>

        <div className="mt-8 mb-4">
          <h3 className="amiriFont text-xl font-bold mb-4">قائمة السندات</h3>
          
          <div className="max-h-[70vh] overflow-y-auto pr-2 border-2 border-accentColor rounded-lg p-2">
            {/* ✅ تم إضافة الشرط هنا بدلاً من الأعلى */}
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <svg className="animate-spin h-8 w-8 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-gray-300">جاري تحميل السندات...</span>
                </div>
            ) : error ? (
                <p className="text-center text-red-500 py-4">خطأ: {error}</p>
            ) : filteredVouchers.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredVouchers.map(voucher => (
                  <div key={voucher.slug} className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-accentColor">
                        {voucher.customer || voucher.sales_rep || 'غير محدد'}
                      </h4>
                      <p className="text-gray-300 text-sm">
                        ({voucher.customer ? 'سند تسديد عميل' : 'سند سحب مندوب'})
                      </p>
                      <p className="text-gray-400 text-xs">رقم السند: {voucher.voucher_number || 'غير متوفر'}</p>
                      <p className="text-gray-400 text-xs">المبلغ: {voucher.amount || 0}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full" title="عرض تفاصيل السند" onClick={() => handleViewVoucherClick(voucher)}>
                        <EyeIcon className="w-5 h-5 text-white" />
                      </button>
                      <button 
                          className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-full" 
                          title="تعديل السند" 
                          onClick={() => handleEditVoucherClick(voucher)}
                      >
                          <PencilIcon className="w-5 h-5 text-white" />
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 p-2 rounded-full" onClick={() => handleDeleteVoucherClick(voucher)} title="حذف السند">
                        <TrashIcon className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="amiriFont text-center text-lg col-span-full">لا توجد سندات مطابقة لنتائج البحث.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* <AddClientVoucherModal show={showAddClientVoucherModal} onClose={handleVoucherModalClose} /> */}
      {/* <AddSalespersonVoucherModal show={showAddSalespersonVoucherModal} onClose={handleVoucherModalClose} /> */}
      {/* <VoucherDetailsModal show={showVoucherDetailsModal} onClose={handleVoucherModalClose} voucher={voucherToView} /> */}
      {/* <EditVoucherModal show={showEditVoucherModal} onClose={handleVoucherModalClose} voucher={voucherToEdit} /> */}
      <ConfirmDeleteModal
        show={showDeleteVoucherModal}
        onClose={() => handleVoucherModalClose(false)}
        onConfirm={handleConfirmDeleteVoucher}
        loading={deleting}
        title="تأكيد حذف السند"
        message={`هل أنت متأكد أنك تريد حذف السند رقم "${voucherToDelete?.voucher_number}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />
    </MainLayout>
  );
}