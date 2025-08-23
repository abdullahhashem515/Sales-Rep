import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../components/shared/MainLayout";
import AddUserModal from "./addUserModal"; // Used for both reps and admins now
import UpdateUserModel from "./updateUserModel"; // Used for both reps and admins now
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal";
import { get, del } from '../../utils/apiService';
import { toast } from 'react-toastify';

import PageHeader from '../../components/shared/PageHeader';
import AddEntityButton from '../../components/shared/AddEntityButton';
import SearchFilterBar from '../../components/shared/SearchFilterBar';
import ActionButtons from '../../components/shared/ActionButtons'; 
import Table2 from "../../components/shared/Table2";
export default function UsersList() {
  // State for sales representatives (wholesale and retail)
  const [salesReps, setSalesReps] = useState([]);
  // State for administrators
  const [adminsList, setAdminsList] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false); // NEW: حالة التحميل للحذف

  // States for modals (can be shared as they operate on one user/admin at a time)
  const [showAddRepModal, setShowAddRepModal] = useState(false);
  const [showUpdateUserModal, setShowUpdateUserModal] = useState(false); // Unified update modal
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false); // Unified delete modal
  const [userToDelete, setUserToDelete] = useState(null); // { slug, type }
  const [userToEdit, setUserToEdit] = useState(null); // Full user object

  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  // Search and Pagination states for Sales Reps
  const [searchTermReps, setSearchTermReps] = useState('');
  const [searchByReps, setSearchByReps] = useState('name');
  const [currentPageReps, setCurrentPageReps] = useState(1);
  const repsPerPage = 7;

  // Search and Pagination states for Admins
  const [searchTermAdmins, setSearchTermAdmins] = useState('');
  const [searchByAdmins, setSearchByAdmins] = useState('name');
  const [currentPageAdmins, setCurrentPageAdmins] = useState(1);
  const adminsPerPage = 7;

  // Function to fetch both sales representatives and administrators from their respective APIs
  const fetchUsersAndAdmins = async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setErrorUsers('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        toast.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        setLoadingUsers(false);
        return;
      }

      // Fetch Sales Representatives
      const repsResponse = await get('admin/users', token); 
      setSalesReps(repsResponse.users || repsResponse.data || []); 

      // Fetch Administrators
      const adminsResponse = await get('admin/admins', token);
      setAdminsList(adminsResponse.admins || adminsResponse.data || []);

    } catch (err) {
      console.error("Failed to fetch users and admins:", err);
      setErrorUsers(err.message || 'فشل في جلب المستخدمين والمدراء.');
      toast.error('فشل في جلب البيانات: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch all users and admins when the component mounts
  useEffect(() => {
    fetchUsersAndAdmins();
  }, []);

  // Memoized filtered lists for reps and admins directly from their states
  
  // --- Filtering Logic for Reps ---
  const searchOptionsReps = [
    { value: 'name', label: 'الاسم الكامل' },
    { value: 'phone_number', label: 'رقم الجوال' },
    { value: 'status', label: 'حالة الحساب' }, // ADDED: Search by status for reps
  ];
  const filteredReps = useMemo(() => {
    if (!searchTermReps) return salesReps;
    const lowerCaseSearchTerm = searchTermReps.toLowerCase();
    return salesReps.filter(rep => {
      if (searchByReps === 'name') return rep.name?.toLowerCase().includes(lowerCaseSearchTerm);
      if (searchByReps === 'phone_number') return rep.phone_number?.toLowerCase().includes(lowerCaseSearchTerm);
      if (searchByReps === 'status') { // NEW: Handle search by status for reps
        const displayStatus = rep.status === 'active' ? 'نشط' : 'غير نشط';
        return displayStatus.toLowerCase().includes(lowerCaseSearchTerm);
      }
      return false;
    });
  }, [salesReps, searchTermReps, searchByReps]);

  // --- Filtering Logic for Admins ---
  const searchOptionsAdmins = [
    { value: 'name', label: 'الاسم الكامل' },
    // Removed email from search options for admins as per new requirement
    { value: 'phone_number', label: 'رقم الجوال' }, 
    { value: 'status', label: 'حالة الحساب' }, // ADDED: Search by status for admins
  ];
  const filteredAdmins = useMemo(() => {
    if (!searchTermAdmins) return adminsList;
    const lowerCaseSearchTerm = searchTermAdmins.toLowerCase();
    return adminsList.filter(admin => {
      if (searchByAdmins === 'name') return admin.name?.toLowerCase().includes(lowerCaseSearchTerm);
      // Removed email from search logic for admins as per new requirement
      if (searchByAdmins === 'phone_number') return admin.phone_number?.toLowerCase().includes(lowerCaseSearchTerm);
      if (searchByAdmins === 'status') { // NEW: Handle search by status for admins
        const displayStatus = admin.status === 'active' ? 'نشط' : 'غير نشط';
        return displayStatus.toLowerCase().includes(lowerCaseSearchTerm);
      }
      return false;
    });
  }, [adminsList, searchTermAdmins, searchByAdmins]);

  // --- Handlers for Adding Users/Admins ---
  const handleAddRepClick = () => setShowAddRepModal(true);
  const handleAddAdminClick = () => setShowAddAdminModal(true);
  
  // Callback after adding/updating user/admin
  // This function is passed to AddUserModal and UpdateUserModel
  const handleUserModalClose = (isSuccess) => {
    setShowAddRepModal(false);
    setShowAddAdminModal(false);
    setShowUpdateUserModal(false);
    if (isSuccess) {
      fetchUsersAndAdmins(); // Re-fetch both lists to update display
    }
  };

  // --- Handlers for Editing Users/Admins ---
  const handleEditClick = (user) => {
    setUserToEdit(user);
    setShowUpdateUserModal(true);
  };

  // --- Handlers for Deleting Users/Admins ---
  const handleDeleteClick = (userSlug, userType) => {
    setUserToDelete({ slug: userSlug, type: userType });
    setShowDeleteUserModal(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;

    setDeletingUser(true); // NEW: بدء حالة التحميل للحذف
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('لا يوجد رمز مصادقة للحذف. يرجى تسجيل الدخول.');
        return;
      }

      let deleteEndpoint = '';
      if (userToDelete.type === 'admin') {
        deleteEndpoint = `admin/delete-admin/${userToDelete.slug}`;
      } else {
        deleteEndpoint = `admin/delete-user/${userToDelete.slug}`;
      }

      const response = await del(deleteEndpoint, token);

      if (response.status) {
        toast.success('تم حذف المستخدم بنجاح!');
        fetchUsersAndAdmins(); // Re-fetch both lists to update display
      } else {
        const apiErrorMessage = response.message || 'فشل حذف المستخدم.';
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error('فشل في حذف المستخدم: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setDeletingUser(false); // NEW: إنهاء حالة التحميل
      setShowDeleteUserModal(false);
      setUserToDelete(null);
    }
  };

  // --- Pagination Logic for Reps ---
  useEffect(() => { setCurrentPageReps(1); }, [filteredReps]);
  const totalPagesReps = Math.ceil(filteredReps.length / repsPerPage);
  const indexOfLastRep = currentPageReps * repsPerPage;
  const indexOfFirstRep = indexOfLastRep - repsPerPage;
  const currentReps = filteredReps.slice(indexOfFirstRep, indexOfLastRep);
  const nextPageReps = () => { if (currentPageReps < totalPagesReps) setCurrentPageReps(currentPageReps + 1); };
  const prevPageReps = () => { if (currentPageReps > 1) setCurrentPageReps(currentPageReps - 1); };

  // --- Pagination Logic for Admins ---
  useEffect(() => { setCurrentPageAdmins(1); }, [filteredAdmins]);
  const totalPagesAdmins = Math.ceil(filteredAdmins.length / adminsPerPage);
  const indexOfLastAdmin = currentPageAdmins * adminsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - adminsPerPage;
  const currentAdmins = filteredAdmins.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const nextPageAdmins = () => { if (currentPageAdmins < totalPagesAdmins) setCurrentPageAdmins(currentPageAdmins + 1); };
  const prevPageAdmins = () => { if (currentPageAdmins > 1) setCurrentPageAdmins(currentPageAdmins - 1); };

  // --- Table Headers ---
  const tableHeaders = [
    { key: 'id', label: '#' },
    { key: 'name', label: 'الاسم الكامل' },
    { key: 'phone_number', label: 'رقم الجوال' },
    { key: 'email', label: 'البريد الإلكتروني' },
    { key: 'type_user', label: 'الدور' },
    { key: 'status', label: 'حالة الحساب' },
    { key: 'actions', label: 'الإجراءات' },
  ];

  // --- Render Row for Reps Table ---
  const renderRepRow = (user) => (
    <>
      <td className="py-3 px-4">{user.id}</td>
      <td className="py-3 px-4">{user.name}</td>
      <td className="py-3 px-4">{user.phone_number}</td>
      <td className="py-3 px-4">{user.email || 'N/A'}</td> {/* Email can be N/A for reps */}
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            user.type_user === "ws_rep" ? "bg-blue-600 text-white" : 
            user.type_user === "retail_rep" ? "bg-purple-600 text-white" : 
            "bg-gray-600 text-white" 
          }`}
        >
          {user.type_user === 'ws_rep' ? 'مندوب جملة' : 'مندوب التجزئة'}
        </span>
      </td>
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            user.status === "active" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {user.status === "active" ? "نشط" : "غير نشط"}
        </span>
      </td>
      <ActionButtons
        onEdit={() => handleEditClick(user)}
        onDelete={() => handleDeleteClick(user.slug, user.type_user)}
      />
    </>
  );

  // --- Render Row for Admins Table ---
  const renderAdminRow = (adminUser) => (
    <>
      <td className="py-3 px-4">{adminUser.id}</td>
      <td className="py-3 px-4">{adminUser.name}</td>
      <td className="py-3 px-4">{adminUser.phone_number}</td>
      <td className="py-3 px-4">{adminUser.email}</td> {/* Admins always have email */}
      <td className="py-3 px-4">
        <span className="px-2 py-1 rounded-full text-sm accentColor text-white">مدير</span>
      </td>
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 rounded-full text-sm ${
            adminUser.status === "active" ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {adminUser.status === "active" ? "نشط" : "غير نشط"}
        </span>
      </td>
      <ActionButtons
        onEdit={() => handleEditClick(adminUser)}
        onDelete={() => handleDeleteClick(adminUser.slug, adminUser.type_user)}
      />
    </>
  );

  return (
    <MainLayout>
      <div className="text-white">
        {/* Sales Reps Section (المستخدمين - مندوبين) */}
        <div className="flex justify-between mb-4 items-center">
          <PageHeader title="المستخدمين (مندوبين)" />
        </div>
        <div className="mb-4 flex justify-between items-center">
          <AddEntityButton label="+ إضافة مندوب" onClick={handleAddRepClick} />
          <SearchFilterBar
            searchTerm={searchTermReps}
            setSearchTerm={setSearchTermReps}
            searchBy={searchByReps}
            setSearchBy={setSearchByReps}
            options={searchOptionsReps}
            placeholder="بحث عن مندوب"
          />
        </div>

        <Table2
          headers={tableHeaders}
          data={currentReps}
          loading={loadingUsers}
          error={errorUsers}
          totalCount={filteredReps.length}
          renderRow={renderRepRow}
          rowKeyField="id"
        />

        {!loadingUsers && !errorUsers && filteredReps.length > 0 && (
          <div className="flex justify-center mt-4 items-center">
            <button
              className="text-white bg-gray-800 px-4 py-2 rounded-lg mx-2"
              onClick={prevPageReps}
              disabled={currentPageReps === 1}
            >
              &lt;&lt;
            </button>
            <span className="text-white bg-green-700 px-4 py-2 rounded-lg mx-1 font-bold">
              {currentPageReps}
            </span>
            <button
              className="text-white bg-gray-800 px-4 py-2 rounded-lg mx-2"
              onClick={nextPageReps}
              disabled={currentPageReps === totalPagesReps}
            >
              &gt;&gt;
            </button>
          </div>
        )}

        {/* Divider between Reps and Admins Sections */}
        <div className="my-[15px]"> 
          <hr className="border-t-2 border-gray-700" />
        </div>

        {/* Admins Section (المدراء) */}
        <div className="flex justify-between mb-4 items-center">
          <PageHeader title="المدراء" />
        </div>
        <div className="mb-4 flex justify-between items-center">
          <AddEntityButton label="+ إضافة مدير" onClick={handleAddAdminClick} />
          <SearchFilterBar
            searchTerm={searchTermAdmins}
            setSearchTerm={setSearchTermAdmins}
            searchBy={searchByAdmins}
            setSearchBy={setSearchByAdmins}
            options={searchOptionsAdmins}
            placeholder="بحث عن مدير"
          />
        </div>

        <Table2
          headers={tableHeaders}
          data={currentAdmins}
          loading={loadingUsers}
          error={errorUsers}
          totalCount={filteredAdmins.length}
          renderRow={renderAdminRow}
          rowKeyField="id"
        />

        {!loadingUsers && !errorUsers && filteredAdmins.length > 0 && (
          <div className="flex justify-center mt-4 items-center">
            <button
              className="text-white bg-gray-800 px-4 py-2 rounded-lg mx-2"
              onClick={prevPageAdmins}
              disabled={currentPageAdmins === 1}
            >
              &lt;&lt;
            </button>
            <span className="text-white bg-green-700 px-4 py-2 rounded-lg mx-1 font-bold">
              {currentPageAdmins}
            </span>
            <button
              className="text-white bg-gray-800 px-4 py-2 rounded-lg mx-2"
              onClick={nextPageAdmins}
              disabled={currentPageAdmins === totalPagesAdmins}
            >
              &gt;&gt;
            </button>
          </div>
        )}

      </div>

      {/* Add Rep Modal */}
      <AddUserModal 
        show={showAddRepModal} 
        onClose={handleUserModalClose} 
        defaultRole="مندوب جملة" // Set default role for reps
      />
      
      {/* Add Admin Modal */}
      <AddUserModal 
        show={showAddAdminModal} 
        onClose={handleUserModalClose} 
        defaultRole="مدير" // Set default role for admins
      />

      {/* Update User/Admin Modal (Shared) */}
      <UpdateUserModel
        show={showUpdateUserModal}
        onClose={handleUserModalClose}
        userToEdit={userToEdit}
      />

      {/* Confirm Delete Modal (Shared) */}
      <ConfirmDeleteModal
        show={showDeleteUserModal}
        onClose={() => {
            setShowDeleteUserModal(false);
            setUserToDelete(null);
        }}
        onConfirm={handleConfirmDeleteUser}
        loading={deletingUser} // NEW: تمرير حالة التحميل
      />
    </MainLayout>
  );
}