import MainLayout from "../../components/shared/MainLayout";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import AddUserModal from "./addUserModal"; // تأكد من المسار الصحيح
import React, { useState, useEffect, useMemo } from "react";
import UpdateUserModel from "./updateUserModel"; // استيراد مكون التعديل
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal";
import { get, del } from '../../utils/apiService'; // NEW: Import the generic get and del functions
import { toast } from 'react-toastify'; // Import toast for notifications

export default function UsersList() {
  const [users, setUsers] = useState([]); // State to store fetched users
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const [showModal, setShowModal] = useState(false); // لإضافة مستخدم جديد
  const [showEditModal, setShowEditModal] = useState(false); // لتعديل مستخدم
  const [showDeleteModal, setShowDeleteModal] = useState(false); // لحذف مستخدم
  const [userToDelete, setUserToDelete] = useState(null); // State to store user SLUG to be deleted
  const [userToEdit, setUserToEdit] = useState(null); // NEW: State to store user data to be edited

  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name'); // Default search by full name (name from API)

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 7; // Number of users to display per page

  // Function to fetch users (can be called on mount and after delete/add/update)
  const fetchUsers = async () => {
    setLoading(true); // Start loading
    setError(null); // Reset any previous errors
    try {
      const token = localStorage.getItem('userToken'); // Get token from localStorage
      if (!token) {
        setError('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        toast.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        setLoading(false);
        return;
      }

      const response = await get('admin/users', token); 
      setUsers(response.users || response.data || response); 

    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.message || 'فشل في جلب المستخدمين.');
      toast.error('فشل في جلب المستخدمين: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoading(false); // End loading
    }
  };

  // useEffect to fetch users when the component mounts
  useEffect(() => {
    fetchUsers();
  }, []); // Empty dependency array means this runs once on mount

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!userToDelete) return; // Ensure there's a user selected for deletion

    setLoading(true); // Show loading during deletion
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('لا يوجد رمز مصادقة للحذف. يرجى تسجيل الدخول.');
        setLoading(false);
        return;
      }

      // UPDATED: Pass userToDelete (which is now slug) in the URL path
      const response = await del(`admin/delete-user/${userToDelete}`, token);

      if (response.status) { // Assuming 'status: true' indicates success
        toast.success('تم حذف المستخدم بنجاح!');
        fetchUsers(); // Re-fetch users to update the list
      } else {
        const apiErrorMessage = response.message || 'فشل حذف المستخدم.';
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error('فشل في حذف المستخدم: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoading(false); // Hide loading
      setShowDeleteModal(false); // Close the confirmation modal
      setUserToDelete(null); // Reset user to delete
    }
  };

  // Function to open edit modal and pass user data
  const handleEditClick = (user) => {
    setUserToEdit(user); // Set the user object to be edited (contains slug)
    setShowEditModal(true); // Open the edit modal
  };

  // Memoized filtered users based on search term and searchBy
  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return users; // If no search term, return all users
    }

    return users.filter(user => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      let valueToSearch = '';

      if (searchBy === 'name') { // Search by user's name (الاسم الكامل)
        valueToSearch = user.name ? user.name.toLowerCase() : '';
      } else if (searchBy === 'role') { // Search by user's role (الدور)
        // Map API role values to their display text for searching
        const displayRole = user.type_user === 'ws_rep' ? 'مندوب جملة' : 
                            user.type_user === 'retail_rep' ? 'مندوب التجزئة' : 
                            user.type_user; // Fallback if API role is not mapped
        valueToSearch = displayRole.toLowerCase();
      }
      return valueToSearch.includes(lowerCaseSearchTerm);
    });
  }, [users, searchTerm, searchBy]);

  // Reset currentPage to 1 whenever filteredUsers changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredUsers]);


  // Calculate the total number of pages based on filtered users
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Get current users for the displayed page (from filteredUsers)
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Function to go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <MainLayout>
      <div className="text-white">
        <div className="flex justify-between mb-4 items-center">
          <h2 className="amiriFont text-2xl font-bold">المستخدمين</h2>
        </div>

        <div className="mb-4 flex justify-between items-center">
          <button
            className="amiriFont accentColor text-white py-2 px-4 rounded"
            onClick={() => setShowModal(true)}
          >
            + إضافة مستخدم
          </button>

          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="بحث عن مستخدم"
              className="amiriFont ml-2 bg-gray-900 text-white border border-gray-600 py-2 px-4 w-64 rounded-r-md focus:outline-none"
              value={searchTerm} // Bind input value
              onChange={(e) => setSearchTerm(e.target.value)} // Update search term
            />
            <select 
              className="amiriFont bg-gray-900 text-white border border-gray-600 py-2 px-3 rounded-l-md focus:outline-none"
              value={searchBy} // Bind select value
              onChange={(e) => setSearchBy(e.target.value)} // Update search by field
            >
              <option value="name">الاسم الكامل</option> {/* Corresponds to user.name from API */}
              <option value="role">الدور</option> {/* Corresponds to user.type_user from API */}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading && <p className="text-center text-lg">جاري تحميل المستخدمين...</p>}
          {error && <p className="text-center text-red-500 text-lg">خطأ: {error}</p>}

          {!loading && !error && filteredUsers.length === 0 && (
            <p className="text-center text-lg">لا توجد بيانات للمستخدمين لعرضها.</p>
          )}

          {!loading && !error && filteredUsers.length > 0 && (
            <table className="amiriFont min-w-full text-white border-collapse">
              <thead>
                <tr className="accentColor text-white">
                  <th className="py-3 px-4 text-right">#</th><th className="py-3 px-4 text-right">الاسم الكامل</th><th className="py-3 px-4 text-right">رقم الجوال</th><th className="py-3 px-4 text-right">البريد الإلكتروني</th>
                  <th className="py-3 px-4 text-right">الدور</th><th className="py-3 px-4 text-right">حالة الحساب</th><th className="py-3 px-4 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {/* Render only currentUsers */}
                {currentUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-700"> {/* Keep key as user.id for stability */}
                    <td className="py-3 px-4">{user.id}</td>
                    <td className="py-3 px-4">{user.name}</td> {/* Assuming API returns 'name' */}
                    <td className="py-3 px-4">{user.phone_number}</td> {/* Assuming API returns 'phone_number' */}
                    <td className="py-3 px-4">{user.email}</td> {/* Display user.email */}
                    <td className="py-3 px-4">{user.type_user === 'ws_rep' ? 'مندوب جملة' : user.type_user === 'retail_rep' ? 'مندوب التجزئة' : user.type_user}</td> {/* Map API role to display text */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          user.status === "active"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {user.status === "active" ? "نشط" : "غير نشط"} {/* Map API status to display text */}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <button
                        className="bg-yellow-400 hover:bg-yellow-600 p-2 rounded"
                        onClick={() => handleEditClick(user)} // Pass the user object to handleEditClick
                      >
                        <PencilIcon className="w-4 h-4 text-white" />
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 p-2 rounded"
                        onClick={() => {
                          setUserToDelete(user.slug); // UPDATED: Set the SLUG of the user to be deleted
                          setShowDeleteModal(true); // Open the confirmation modal
                        }}
                      >
                        <TrashIcon className="w-4 h-4 text-white" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination Controls */}
          {!loading && !error && filteredUsers.length > 0 && (
            <div className="flex justify-center mt-4">
              <button
                className="text-white bg-gray-800 px-3 py-1 rounded mx-1"
                onClick={prevPage}
                disabled={currentPage === 1} // Disable if on first page
              >
                &lt;&lt;
              </button>
              {/* Render page numbers */}
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`text-white px-3 py-1 rounded mx-1 ${
                    currentPage === index + 1 ? "bg-green-700" : "bg-gray-800"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="text-white bg-gray-800 px-3 py-1 rounded mx-1"
                onClick={nextPage}
                disabled={currentPage === totalPages} // Disable if on last page
              >
                &gt;&gt;
              </button>
            </div>
          )}

          <AddUserModal 
            show={showModal} 
            onClose={() => {
              setShowModal(false);
              fetchUsers(); // NEW: Call fetchUsers after AddUserModal closes
            }} 
          />
          <UpdateUserModel
            show={showEditModal}
            onClose={() => {
                setShowEditModal(false); // Close modal
                setUserToEdit(null); // Reset user to edit
                fetchUsers(); // Re-fetch users after update to reflect changes
            }}
            userToEdit={userToEdit} // Pass the user data to the UpdateUserModel
          />
          <ConfirmDeleteModal
            show={showDeleteModal}
            onClose={() => {
                setShowDeleteModal(false); // Close modal
                setUserToDelete(null); // Reset user to delete
            }}
            onConfirm={handleDeleteUser} // Pass the delete function to the modal
          />
        </div>
      </div>
    </MainLayout>
  );
}
