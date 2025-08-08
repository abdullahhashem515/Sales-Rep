import MainLayout from "../../components/shared/MainLayout";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid";
import AddUserModal from "./addUserModal"; // تأكد من المسار الصحيح
import React, { useState } from "react";
import UpdateUserModel from "./updateUserModel";
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal";

const users = [
  {
    id: 1,
    fullName: "أحمد محمد العلي",
    username: "ahmad123",
    phone: "771234567", // NEW: Added phone number
    role: "مدير",
    status: "نشط",
  },
  {
    id: 2,
    fullName: "سارة يوسف",
    username: "sara.y",
    phone: "772345678", // NEW: Added phone number
    role: "مشرف",
    status: "غير نشط",
  },
  {
    id: 3,
    fullName: "محمد علي",
    username: "m.ali",
    phone: "773456789", // NEW: Added phone number
    role: "موظف",
    status: "نشط",
  },
  {
    id: 4, // Changed ID to be unique
    fullName: "أحمد محمد العلي", // هذا المستخدم كان مكرراً، تم تغيير الاسم لتمييزه أو يمكن حذفه إذا كان تكراراً كاملاً
    username: "ahmad123_new", // تغيير اسم المستخدم لتمييزه
    phone: "774567890", // NEW: Added phone number
    role: "مدير",
    status: "نشط",
  },
  {
    id: 5, // Changed ID to be unique
    fullName: "سارة يوسف",
    username: "sara.y_new", // تغيير اسم المستخدم لتمييزه
    phone: "775678901", // NEW: Added phone number
    role: "مشرف",
    status: "غير نشط",
  },
  {
    id: 6, // Changed ID to be unique
    fullName: "محمد علي",
    username: "m.ali_new", // تغيير اسم المستخدم لتمييزه
    phone: "776789012", // NEW: Added phone number
    role: "موظف",
    status: "نشط",
  },
  {
    id: 7, // Changed ID to be unique
    fullName: "أحمد محمد العلي",
    username: "ahmad123_last", // تغيير اسم المستخدم لتمييزه
    phone: "777890123", // NEW: Added phone number
    role: "مدير",
    status: "نشط",
  },
  {
    id: 8, // Added more users for pagination example
    fullName: "فاطمة سعيد",
    username: "fatima.s",
    phone: "778901234",
    role: "موظف",
    status: "نشط",
  },
  {
    id: 9,
    fullName: "خالد ناصر",
    username: "khalid.n",
    phone: "779012345",
    role: "مدير",
    status: "غير نشط",
  },
  {
    id: 10,
    fullName: "ليلى أحمد",
    username: "laila.a",
    phone: "770123456",
    role: "مشرف",
    status: "نشط",
  },
  {
    id: 11,
    fullName: "ياسر فهد",
    username: "yaser.f",
    phone: "771122334",
    role: "موظف",
    status: "نشط",
  },
];

export default function UsersList() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 7; // Number of users to display per page

  // Calculate the total number of pages
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Get current users for the displayed page
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

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
            />
            <select className="amiriFont bg-gray-900 text-white border border-gray-600 py-2 px-3 rounded-l-md focus:outline-none">
              <option value="fullName">الاسم الكامل</option>
              <option value="username">اسم المستخدم</option>
              <option value="role">الدور</option>
              <option value="status">الحالة</option>
              <option value="phone">رقم الجوال</option> {/* NEW: Added phone to search options */}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="amiriFont min-w-full text-white border-collapse">
            <thead>
              <tr className="accentColor text-white">
                <th className="py-3 px-4 text-right">#</th>
                <th className="py-3 px-4 text-right">الاسم الكامل</th>
                <th className="py-3 px-4 text-right">رقم الجوال</th>
                <th className="py-3 px-4 text-right">اسم المستخدم</th>
                <th className="py-3 px-4 text-right">الدور</th>
                <th className="py-3 px-4 text-right">حالة الحساب</th>
                <th className="py-3 px-4 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {/* Render only currentUsers */}
              {currentUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-700">
                  <td className="py-3 px-4">{user.id}</td>
                  <td className="py-3 px-4">{user.fullName}</td>
                  <td className="py-3 px-4">{user.phone}</td>
                  <td className="py-3 px-4">{user.username}</td>
                  <td className="py-3 px-4">{user.role}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        user.status === "نشط"
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 flex gap-2">
                    <button
                      className="bg-yellow-400 hover:bg-yellow-600 p-2 rounded"
                      onClick={() => setShowEditModal(true)}
                    >
                      <PencilIcon className="w-4 h-4 text-white" />
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 p-2 rounded"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <TrashIcon className="w-4 h-4 text-white" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
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

          <AddUserModal show={showModal} onClose={() => setShowModal(false)} />
          <UpdateUserModel
            show={showEditModal}
            onClose={() => setShowEditModal(false)}
          />
          <ConfirmDeleteModal
            show={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
          />
        </div>
      </div>
    </MainLayout>
  );
}
