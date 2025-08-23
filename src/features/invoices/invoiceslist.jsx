// src/pages/invoices/InvoicesList.jsx

import React, { useState, useMemo, useEffect, useContext } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import AddEntityButton from "../../components/shared/AddEntityButton";
import SearchFilterBar from "../../components/shared/SearchFilterBar";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal";
import { toast } from 'react-toastify';
import AddInvoiceModal from './AddInvoiceModal';
import InvoiceDetailsModal from './InvoiceDetailsModal';
import EditInvoiceModal from './EditInvoiceModal';
import { get, del } from '../../utils/apiService';
import { AuthContext } from "../../contexts/AuthContext";

export default function InvoicesList() {
  const { token } = useContext(AuthContext);

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('invoice_number');

  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showDeleteInvoiceModal, setShowDeleteInvoiceModal] = useState(false);
  const [showInvoiceDetailsModal, setShowInvoiceDetailsModal] = useState(false);
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [invoiceToView, setInvoiceToView] = useState(null);
  const [invoiceToEdit, setInvoiceToEdit] = useState(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const searchOptionsInvoices = [
    { value: 'invoice_number', label: 'رقم الفاتورة' },
    { value: 'customer.name', label: 'اسم العميل' },
    { value: 'payment_type', label: 'نوع الدفع' },
  ];

  const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

  const fetchInvoices = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await get('admin/invoices', token);
      if (response.status === true && Array.isArray(response.data)) {
        setInvoices(response.data);
      } else {
        setError(response.message || 'فشل جلب الفواتير.');
        toast.error(response.message || 'فشل جلب الفواتير.');
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع عند جلب الفواتير.');
      toast.error(err.message || 'حدث خطأ غير متوقع عند جلب الفواتير.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchInvoices();
  }, [token]);

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    const term = searchTerm.toLowerCase();
    return invoices.filter(inv => String(getNestedValue(inv, searchBy) || '').toLowerCase().includes(term));
  }, [invoices, searchTerm, searchBy]);

  const handleInvoiceModalClose = (isSuccess = false) => {
    setShowAddInvoiceModal(false);
    setShowDeleteInvoiceModal(false);
    setShowInvoiceDetailsModal(false);
    setShowEditInvoiceModal(false);
    setInvoiceToView(null);
    setInvoiceToEdit(null);
    setInvoiceToDelete(null);
    if (isSuccess) fetchInvoices();
  };

  const handleAddInvoiceClick = () => setShowAddInvoiceModal(true);

  const handleViewInvoiceClick = (invoice) => {
    setInvoiceToView(invoice);
    setShowInvoiceDetailsModal(true);
  };

  const handleEditInvoiceClick = (invoice) => {
    setInvoiceToEdit(invoice);
    setShowEditInvoiceModal(true);
  };

  const handleDeleteInvoiceClick = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteInvoiceModal(true);
  };

  const handleConfirmDeleteInvoice = async () => {
    if (!invoiceToDelete || !token) return;
    setDeleting(true);
    try {
      const response = await del(`admin/invoices/${invoiceToDelete.id}`, token);
      if (response?.status === true) {
        toast.success('تم حذف الفاتورة بنجاح!');
        handleInvoiceModalClose(true);
      } else {
        toast.error(response?.message || 'فشل حذف الفاتورة.');
      }
    } catch (err) {
      toast.error(err.message || 'حدث خطأ غير متوقع أثناء حذف الفاتورة.');
      console.error("Error deleting invoice:", err);
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
        <span className="ml-3">جاري تحميل الفواتير...</span>
      </div>
    </MainLayout>
  );

  if (error) return <MainLayout><div className="text-center py-8 text-red-500 bg-gray-900 min-h-[calc(100vh-80px)]">خطأ: {error}</div></MainLayout>;
  
  return (
    <MainLayout>
      <div className="text-white">
        <div className="flex justify-between mb-4 items-center"><PageHeader title="الفواتير" /></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <AddEntityButton label="+ إنشاء فاتورة" onClick={handleAddInvoiceClick} className="w-full md:w-auto" />
          <SearchFilterBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} searchBy={searchBy} setSearchBy={setSearchBy} options={searchOptionsInvoices} placeholder="بحث عن فاتورة" className="w-full md:w-auto" />
        </div>

        <div className="mt-8 mb-4">
          <h3 className="amiriFont text-xl font-bold mb-4">قائمة الفواتير</h3>
          <div className="max-h-[70vh] overflow-y-auto pr-2 border-2 border-accentColor rounded-lg p-2">
            {filteredInvoices.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredInvoices.map(invoice => (
                  <div key={invoice.id} className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between" style={{ height: '100px' }}>
                    <div>
                      <h4 className="text-lg font-bold text-accentColor">{invoice.customer?.name || 'غير متوفر'}</h4>
                      <p className="text-gray-300 text-sm">(نوع الدفع: {invoice.payment_type === 'cash' ? 'نقدي' : invoice.payment_type === 'credit' ? 'آجل' : 'غير محدد'})</p>
                      <p className="text-gray-400 text-xs">رقم الفاتورة: {invoice.invoice_number}</p>
                      <p className="text-gray-400 text-xs">عدد المنتجات: {invoice.items?.length || 0}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full" title="عرض تفاصيل الفاتورة" onClick={() => handleViewInvoiceClick(invoice)}>
                        <EyeIcon className="w-5 h-5 text-white" />
                      </button>
                      <button 
                          className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-full" 
                          title="تعديل الفاتورة" 
                          onClick={() => handleEditInvoiceClick(invoice)}
                      >
                          <PencilIcon className="w-5 h-5 text-white" />
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 p-2 rounded-full" onClick={() => handleDeleteInvoiceClick(invoice)} title="حذف الفاتورة">
                        <TrashIcon className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="amiriFont text-center text-lg col-span-full">لا توجد فواتير مطابقة لنتائج البحث.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddInvoiceModal show={showAddInvoiceModal} onClose={handleInvoiceModalClose} />
      <InvoiceDetailsModal show={showInvoiceDetailsModal} onClose={handleInvoiceModalClose} invoice={invoiceToView} />
      <EditInvoiceModal 
          show={showEditInvoiceModal}
          onClose={handleInvoiceModalClose}
          invoice={invoiceToEdit} // ✨ تم التعديل لتمرير الكائن بالكامل
      />
      <ConfirmDeleteModal
        show={showDeleteInvoiceModal}
        onClose={() => handleInvoiceModalClose(false)}
        onConfirm={handleConfirmDeleteInvoice}
        loading={deleting}
        title="تأكيد حذف الفاتورة"
        message={`هل أنت متأكد أنك تريد حذف الفاتورة رقم "${invoiceToDelete?.invoice_number}" الخاصة بالعميل "${invoiceToDelete?.customer?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />
    </MainLayout>
  );
}