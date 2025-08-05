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
    role: "مدير",
    status: "نشط",
  },
  {
    id: 2,
    fullName: "سارة يوسف",
    username: "sara.y",
    role: "مشرف",
    status: "غير نشط",
  },
  {
    id: 3,
    fullName: "محمد علي",
    username: "m.ali",
    role: "موظف",
    status: "نشط",
  },
  {
    id: 1,
    fullName: "أحمد محمد العلي",
    username: "ahmad123",
    role: "مدير",
    status: "نشط",
  },
  {
    id: 2,
    fullName: "سارة يوسف",
    username: "sara.y",
    role: "مشرف",
    status: "غير نشط",
  },
  {
    id: 3,
    fullName: "محمد علي",
    username: "m.ali",
    role: "موظف",
    status: "نشط",
  },
  {
    id: 1,
    fullName: "أحمد محمد العلي",
    username: "ahmad123",
    role: "مدير",
    status: "نشط",
  },
];

export default function UsersList() {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="amiriFont min-w-full text-white border-collapse">
            <thead>
              <tr className="accentColor text-white">
                <th className="py-3 px-4 text-right">#</th>
                <th className="py-3 px-4 text-right">الاسم الكامل</th>
                <th className="py-3 px-4 text-right">اسم المستخدم</th>
                <th className="py-3 px-4 text-right">الدور</th>
                <th className="py-3 px-4 text-right">حالة الحساب</th>
                <th className="py-3 px-4 text-right">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700">
                  <td className="py-3 px-4">{user.id}</td>
                  <td className="py-3 px-4">{user.fullName}</td>
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

          <div className="flex justify-center mt-4">
            <button className="text-white bg-gray-800 px-3 py-1 rounded mx-1">
              &lt;&lt;
            </button>
            <button className="text-white bg-green-700 px-3 py-1 rounded mx-1">
              1
            </button>
            <button className="text-white bg-gray-800 px-3 py-1 rounded mx-1">
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
