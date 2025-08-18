import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import AddEntityButton from "../../components/shared/AddEntityButton";
import SearchFilterBar from "../../components/shared/SearchFilterBar";
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal";
import AddUpdateVisitModal from "./AddUpdateVisitModal"; // Import the unified Add/Update modal
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid"; // Import icons for card actions

import { get, del } from "../../utils/apiService"; // Keep imports for future API connection
import { toast } from "react-toastify";

export default function Visitslist() {
  const [visits, setVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(true);
  const [errorVisits, setErrorVisits] = useState(null);

  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("customer_name"); // Default search by customer name
  const [currentPage, setCurrentPage] = useState(1);
  const visitsPerPage = 6; // Adjusted for card layout, typically fewer items per page

  // Modals visibility states
  const [showAddUpdateVisitModal, setShowAddUpdateVisitModal] = useState(false);
  const [showDeleteVisitModal, setShowDeleteVisitModal] = useState(false);

  // State to hold the visit object for editing or deleting
  const [visitToEdit, setVisitToEdit] = useState(null);
  const [visitToDelete, setVisitToDelete] = useState(null);

  // Dummy Data for Visits

  // Function to fetch visits (now from dummy data)
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
      console.log("API Response:", response); // للتأكد

      // هنا نستخدم response مباشرة لأنه مصفوفة الزيارات
      const visitsData = response;

      const mappedVisits = visitsData.map((v) => ({
        id: v.id, // ← أضفنا هذا
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

      console.log("Mapped Visits:", mappedVisits); // هنا نرى النتيجة النهائية

      setVisits(mappedVisits);
    } catch (err) {
      console.error("Failed to fetch visits:", err);
      setErrorVisits(err.message || "فشل في جلب الزيارات.");
      toast.error("فشل في جلب الزيارات: " + (err.message || "خطأ غير معروف."));
    } finally {
      setLoadingVisits(false);
    }
  };

  // Fetch visits on component mount and when search terms change
  useEffect(() => {
    fetchVisits();
  }, []); // فقط عند mount
  // Keep dependencies for search filtering

  // Reset pagination when filtered data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [visits]);

  // Memoized filtered visits
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
        return visit.customer?.name
          ?.toLowerCase()
          .includes(lowerCaseSearchTerm);
      if (searchBy === "salesman_name")
        return visit.salesman?.name
          ?.toLowerCase()
          .includes(lowerCaseSearchTerm);
      if (searchBy === "type")
        return visit.type?.toLowerCase().includes(lowerCaseSearchTerm);
      if (searchBy === "purpose")
        return visit.purpose?.toLowerCase().includes(lowerCaseSearchTerm);
      return false;
    });
  }, [visits, searchTerm, searchBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredVisits.length / visitsPerPage);
  const indexOfLastVisit = currentPage * visitsPerPage;
  const indexOfFirstVisit = indexOfLastVisit - visitsPerPage;
  const currentVisits = filteredVisits.slice(
    indexOfFirstVisit,
    indexOfLastVisit
  );

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
    const token = localStorage.getItem("userToken");

    try {
      // إرسال طلب الحذف للباك باستخدام slug
      await del(`admin/visits/${visitToDelete.visit_id}`, token);
      toast.success("تم حذف الزيارة بنجاح!");

      // تحديث القائمة محليًا
      setVisits((prev) =>
        prev.filter((v) => v.visit_id !== visitToDelete.visit_id)
      );
    } catch (err) {
      console.error("Error deleting visit:", err);
      toast.error("فشل في حذف الزيارة: " + (err.message || "خطأ غير معروف"));
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
          <AddEntityButton
            label="+ إضافة زيارة"
            onClick={handleAddVisitClick}
          />
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
                  <h3 className="amiriFont text-xl font-bold mb-2 text-white">
                    الزيارة رقم: {visit.id}
                  </h3>
                  <p className="text-gray-300 mb-1">
                    <span className="font-semibold text-accentColor">
                      المندوب:
                    </span>{" "}
                    {visit.salesman?.name || "N/A"}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <span className="font-semibold text-accentColor">
                      العميل:
                    </span>{" "}
                    {visit.customer?.name || "N/A"}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <span className="font-semibold text-accentColor">
                      التاريخ:
                    </span>{" "}
                    {new Date(visit.date).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="flex items-center gap-2 mt-2 mb-3">
                    <span className="font-semibold text-accentColor">
                      النوع:
                    </span>
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
  <span className="font-semibold text-white">الغرض:</span>{" "}
  {visit.purpose}
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
