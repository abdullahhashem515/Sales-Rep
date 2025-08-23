// src/pages/visits/Visitslist.jsx
import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import AddEntityButton from "../../components/shared/AddEntityButton";
import SearchFilterBar from "../../components/shared/SearchFilterBar";
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal";

import AddVisitModal from "./AddVisitModal";
import UpdateVisitModal from "./UpdateVisitModal";

import { PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { get, del } from "../../utils/apiService";
import { toast } from "react-toastify";

export default function Visitslist() {
  const [visits, setVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [errorVisits, setErrorVisits] = useState(null);

  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("customer_name");
  const [currentPage, setCurrentPage] = useState(1);
  const visitsPerPage = 6;

  // Modals visibility states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteVisitModal, setShowDeleteVisitModal] = useState(false);

  const [visitToEdit, setVisitToEdit] = useState(null);
  const [visitToDelete, setVisitToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false); // ✅ حالة لودينق الحذف

  const fetchVisits = async () => {
    setLoadingVisits(true);
    setErrorVisits(null);

    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.error("رمز المصادقة مفقود. يرجى تسجيل الدخول أولاً.");
        setLoadingVisits(false);
        return;
      }

      const response = await get("admin/visits", token);
      const visitsData = response;

      const mappedVisits = visitsData.map((v) => ({
        id: v.id,
        visit_id: v.slug,
        salesman_id: v.user.slug,
        customer_id: v.customer.slug,
        type:
          v.visit_type === "in_person"
            ? "حضوري"
            : v.visit_type === "call"
            ? "عن بعد (اتصال)"
            : "اجتماع أونلاين",
        purpose: v.note || "",
        date: v.visit_date,
        salesman: v.user,
        customer: v.customer,
      }));

      setVisits(mappedVisits);
    } catch (err) {
      console.error("Failed to fetch visits:", err);
      setErrorVisits(err.message || "فشل في جلب الزيارات.");
      toast.error("فشل في جلب الزيارات: " + (err.message || "خطأ غير معروف."));
    } finally {
      setLoadingVisits(false);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [visits]);

  const searchOptions = [
    { value: "customer_name", label: "اسم العميل" },
    { value: "salesman_name", label: "اسم المندوب" },
    { value: "type", label: "نوع الزيارة" },
    { value: "purpose", label: "الغرض من الزيارة" },
  ];

  const filteredVisits = useMemo(() => {
    if (!searchTerm) return visits;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return visits.filter((visit) => {
      if (searchBy === "customer_name")
        return visit.customer?.name?.toLowerCase().includes(lowerCaseSearchTerm);
      if (searchBy === "salesman_name")
        return visit.salesman?.name?.toLowerCase().includes(lowerCaseSearchTerm);
      if (searchBy === "type") return visit.type?.toLowerCase().includes(lowerCaseSearchTerm);
      if (searchBy === "purpose") return visit.purpose?.toLowerCase().includes(lowerCaseSearchTerm);
      return false;
    });
  }, [visits, searchTerm, searchBy]);

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

  const handleAddVisitClick = () => setShowAddModal(true);
  const handleEditVisitClick = (visit) => {
    setVisitToEdit(visit);
    setShowUpdateModal(true);
  };
  const handleDeleteVisitClick = (visit) => {
    setVisitToDelete(visit);
    setShowDeleteVisitModal(true);
  };
  const handleVisitModalClose = (isSuccess = false) => {
    setShowAddModal(false);
    setShowUpdateModal(false);
    setShowDeleteVisitModal(false);
    setVisitToEdit(null);
    setVisitToDelete(null);
    setDeleting(false); // ✅ إعادة تعيين حالة اللودينق
    if (isSuccess) fetchVisits();
  };

  const handleConfirmDeleteVisit = async () => {
    if (!visitToDelete) return;
    setDeleting(true);
    const token = localStorage.getItem("userToken");

    try {
      await del(`admin/visits/${visitToDelete.visit_id}`, token);
      toast.success("تم حذف الزيارة بنجاح!");
      setVisits((prev) => prev.filter((v) => v.visit_id !== visitToDelete.visit_id));
    } catch (err) {
      console.error("Error deleting visit:", err);
      toast.error("فشل في حذف الزيارة: " + (err.message || "خطأ غير معروف"));
    } finally {
      setDeleting(false);
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {currentVisits.map((visit) => (
                <div
                  key={visit.visit_id}
                  className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <div>
                    <h3 className="amiriFont text-xl font-bold mb-2 text-white">
                      الزيارة رقم: {visit.id}
                    </h3>
                    <p className="text-gray-300 mb-1">
                      <span className="font-semibold text-accentColor">المندوب:</span>{" "}
                      {visit.salesman?.name || "N/A"}
                    </p>
                    <p className="text-gray-300 mb-1">
                      <span className="font-semibold text-accentColor">العميل:</span>{" "}
                      {visit.customer?.name || "N/A"}
                    </p>
                    <p className="text-gray-300 mb-1">
                      <span className="font-semibold text-accentColor">التاريخ:</span>{" "}
                      {new Date(visit.date).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <div className="flex items-center gap-2 mt-2 mb-3">
                      <span className="font-semibold text-accentColor">النوع:</span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          visit.type === "حضوري"
                            ? "bg-blue-600 text-white"
                            : visit.type === "عن بعد (اتصال)"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {visit.type}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm italic border-t border-gray-700 pt-3 break-words whitespace-pre-wrap">
                      <span className="font-semibold text-white">الغرض:</span> {visit.purpose}
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

            {/* Pagination Controls with Icons */}
            <div className="flex justify-center mt-6 items-center gap-3">
              <button
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
                onClick={prevPage}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="w-6 h-6 text-white" />
              </button>
              <span className="text-white bg-accentColor px-4 py-1 rounded-full font-bold">
                {currentPage} / {totalPages}
              </span>
              <button
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
                onClick={nextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRightIcon className="w-6 h-6 text-white" />
              </button>
            </div>
          </>
        ) : (
          <p className="amiriFont text-center text-lg col-span-full">
            لا توجد زيارات مطابقة لنتائج البحث.
          </p>
        )}
      </div>

      <AddVisitModal show={showAddModal} onClose={handleVisitModalClose} />
      <UpdateVisitModal show={showUpdateModal} onClose={handleVisitModalClose} visitToEdit={visitToEdit} />
      <ConfirmDeleteModal
        show={showDeleteVisitModal}
        onClose={() => handleVisitModalClose(false)}
        onConfirm={handleConfirmDeleteVisit}
        loading={deleting} // ✅ تمرير حالة الحذف
        title="تأكيد حذف الزيارة"
        message={`هل أنت متأكد أنك تريد حذف الزيارة رقم "${visitToDelete?.id}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />
    </MainLayout>
  );
}
