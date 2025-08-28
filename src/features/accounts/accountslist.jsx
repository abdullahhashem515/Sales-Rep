import React, { useState, useMemo, useEffect, useContext } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import SearchFilterBar from "../../components/shared/SearchFilterBar";
import { EyeIcon, TrashIcon } from "@heroicons/react/24/solid";
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal";
import { toast } from 'react-toastify';
import { get, del } from '../../utils/apiService';
import { AuthContext } from "../../contexts/AuthContext";
import AddEntityButton from "../../components/shared/AddEntityButton"; 
// استيراد المودال الجديد
import AddAccountModal from './AddAccountModal';

export default function Accountslist() {
  const { token } = useContext(AuthContext);

  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name');
  
  // حالة المودال الجديد
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const searchOptionsAccounts = [
    { value: 'name', label: 'الاسم' },
    { value: 'type', label: 'النوع' },
    { value: 'currency', label: 'العملة' },
  ];

  const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

  const getAccountTypeInArabic = (type) => {
    switch (type) {
      case 'sales_rep':
        return 'مندوب تجزئة';
      case 'customer':
        return 'عميل';
      case 'bank':
        return 'بنك';
      default:
        return type;
    }
  };

  const fetchAccounts = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await get('admin/accounts', token);
      if (response.status === true && Array.isArray(response.data)) {
        setAccounts(response.data);
      } else {
        setError(response.message || 'فشل جلب الحسابات.');
        toast.error(response.message || 'فشل جلب الحسابات.');
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع عند جلب الحسابات.');
      toast.error(err.message || 'حدث خطأ غير متوقع عند جلب الحسابات.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchAccounts();
  }, [token]);

  const filteredAccounts = useMemo(() => {
    if (!searchTerm) return accounts;
    const term = searchTerm.toLowerCase();
    return accounts.filter(account => {
      const value = getNestedValue(account, searchBy);
      // تعديل منطق البحث ليدعم البحث بالأسماء العربية
      if (searchBy === 'type') {
        const arabicType = getAccountTypeInArabic(value);
        return (
          String(value || '').toLowerCase().includes(term) ||
          String(arabicType || '').toLowerCase().includes(term)
        );
      }
      return String(value || '').toLowerCase().includes(term);
    });
  }, [accounts, searchTerm, searchBy]);

  // دالة موحدة لإغلاق جميع المودالات وإعادة جلب البيانات عند النجاح
  const handleModalClose = (isSuccess = false) => {
    setShowAddAccountModal(false);
    setShowDeleteAccountModal(false);
    setAccountToDelete(null);
    if (isSuccess) fetchAccounts();
  };

  const handleAddAccountClick = () => {
    setShowAddAccountModal(true);
  };

  const handleDeleteAccountClick = (account) => {
    setAccountToDelete(account);
    setShowDeleteAccountModal(true);
  };

  const handleConfirmDeleteAccount = async () => {
    if (!accountToDelete || !token) return;
    setDeleting(true);
    try {
      const response = await del(`admin/accounts/${accountToDelete.slug}`, token);
      if (response?.status === true) {
        toast.success('تم حذف الحساب بنجاح!');
        handleModalClose(true);
      } else {
        toast.error(response?.message || 'فشل حذف الحساب.');
      }
    } catch (err) {
      toast.error(err.message || 'حدث خطأ غير متوقع أثناء حذف الحساب.');
      console.error("Error deleting account:", err);
    } finally {
      setDeleting(false);
    }
  };

  const getAccountsCountByType = (type) => {
    return accounts.filter(account => account.type === type).length;
  };
  
  const adminAccountsCount = getAccountsCountByType('bank');
  const salesRepAccountsCount = getAccountsCountByType('sales_rep');
  const customerAccountsCount = getAccountsCountByType('customer');

  return (
    <MainLayout>
      <div className="text-white">
        <div className="flex justify-between mb-4 items-center">
          <PageHeader title="الحسابات" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="flex gap-4 flex-col md:flex-row w-full md:w-auto">
                <AddEntityButton 
                  label="إضافة حساب جديد" 
                  onClick={handleAddAccountClick} 
                />
            </div>
            <SearchFilterBar 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
                searchBy={searchBy} 
                setSearchBy={setSearchBy} 
                options={searchOptionsAccounts} 
                placeholder="بحث عن حساب" 
                className="w-full md:w-auto" 
            />
        </div>

       
        
        <div className="mt-8 mb-4">
          <h3 className="amiriFont text-xl font-bold mb-4">قائمة الحسابات</h3>
          
          <div className="max-h-[70vh] overflow-y-auto pr-2 border-2 border-accentColor rounded-lg p-2">
            {loading ? (
                <div className="flex items-center justify-center py-10">
                    <svg className="animate-spin h-8 w-8 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="ml-3 text-gray-300">جاري تحميل الحسابات...</span>
                </div>
            ) : error ? (
                <p className="text-center text-red-500 py-4">خطأ: {error}</p>
            ) : filteredAccounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto text-right">
                  <thead>
                    <tr className="bg-gray-700 text-gray-400 uppercase text-sm leading-normal">
                      <th className="py-3 px-6 text-right">الاسم</th>
                      <th className="py-3 px-6 text-right">النوع</th>
                      <th className="py-3 px-6 text-right">العملة</th>
                      <th className="py-3 px-6 text-right">رصيد وارد</th>
                      <th className="py-3 px-6 text-right">رصيد صادر</th>
                      <th className="py-3 px-6 text-right">الرصيد النهائي</th>
                      <th className="py-3 px-6 text-right">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-200 text-sm font-light">
                    {filteredAccounts.map(account => (
                      <tr key={account.slug} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="py-3 px-6 text-right whitespace-nowrap">{account.name}</td>
                        <td className="py-3 px-6 text-right">{getAccountTypeInArabic(account.type)}</td>
                        <td className="py-3 px-6 text-right">{account.currency}</td>
                        <td className="py-3 px-6 text-right">{account.balance_in}</td>
                        <td className="py-3 px-6 text-right">{account.balance_out}</td>
                        <td className="py-3 px-6 text-right">{account.balance}</td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex item-center justify-end gap-2">
                              {/* <button className="bg-blue-500 hover:bg-blue-600 p-2 rounded-full" title="عرض التفاصيل">
                                  <EyeIcon className="w-5 h-5 text-white" />
                              </button> */}
                              <button className="bg-red-500 hover:bg-red-600 p-2 rounded-full" title="حذف" onClick={() => handleDeleteAccountClick(account)}>
                                  <TrashIcon className="w-5 h-5 text-white" />
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
                <p className="  text-center text-lg col-span-full">لا توجد حسابات مطابقة لنتائج البحث.</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal for adding a new account */}
      <AddAccountModal
        show={showAddAccountModal}
        onClose={handleModalClose}
      />
      
      <ConfirmDeleteModal
        show={showDeleteAccountModal}
        onClose={() => handleModalClose(false)}
        onConfirm={handleConfirmDeleteAccount}
        loading={deleting}
        title="تأكيد حذف الحساب"
        message={`هل أنت متأكد أنك تريد حذف حساب "${accountToDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />
    </MainLayout>
  );
}