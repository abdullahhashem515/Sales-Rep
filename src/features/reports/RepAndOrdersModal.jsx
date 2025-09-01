// src/features/reports/RepAndOrdersModal.jsx
import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import SearchableSelectFieldV4 from "../../components/shared/SearchableSelectFieldV4";
import FormInputField from "../../components/shared/FormInputField";
import Table2 from "../../components/shared/Table2";
import { get } from "../../utils/apiService";
import { useAuth } from "../../contexts/AuthContext";
import AddEntityButton from "../../components/shared/AddEntityButton";
// ✅ تم حذف استيراد OrderPrintPreviewModal لأنه لم يعد موجودًا هنا

const RepAndOrdersModal = ({ show, onClose, title, onPreviewAndPrint, onOpenOrderDetails }) => {
  const { token } = useAuth();
  const [filters, setFilters] = useState({
    repName: null,
    status: null,
    fromDate: "",
    toDate: "",
  });

  const [allOrders, setAllOrders] = useState([]);
  const [data, setData] = useState([]);
  const [repOptions, setRepOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ تم حذف الحالات الخاصة بـ OrderPrintPreviewModal

  const statusMap = {
    accepted: "مقبول",
    pending: "معلق",
    cancelled: "مرفوض",
  };

  useEffect(() => {
    if (show) fetchOrders();
  }, [show]);

  const fetchOrders = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await get("admin/orders", token);
      if (res.status && res.data) {
        const orders = res.data;
        setAllOrders(orders);
        setData(orders);

        const reps = Array.from(new Set(orders.map((o) => o.user.id))).map(
          (uid) => {
            const order = orders.find((o) => o.user.id === uid);
            return { value: uid, label: order.user.name };
          }
        );
        setRepOptions(reps);

        const statuses = Array.from(new Set(orders.map((o) => o.status)));
        setStatusOptions(
          statuses.map((s) => ({ value: s, label: statusMap[s] || s }))
        );

        const dates = orders.map((o) => new Date(o.order_date));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date();
        setFilters((prev) => ({
          ...prev,
          fromDate: minDate.toISOString().split("T")[0],
          toDate: maxDate.toISOString().split("T")[0],
        }));
      }
    } catch (err) {
      console.error("خطأ عند جلب الطلبات:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowOrderDetails = (order) => {
    const formattedOrder = {
      ...order,
      order_id: order.order_number,
      customer_name: order.customer?.name,
      salesperson_name: order.user?.name,
      products: order.items,
    };

    console.log("بيانات الطلب المرسلة:", formattedOrder);

    // ✅ تم تعديل هذه الدالة لاستدعاء الدالة من الأب
    onOpenOrderDetails(formattedOrder);
  };

  useEffect(() => {
    const filtered = allOrders.filter((order) => {
      const repMatch = !filters.repName || order.user.id === filters.repName;
      const statusMatch = !filters.status || order.status === filters.status;
      const dateMatch =
        new Date(order.order_date) >= new Date(filters.fromDate) &&
        new Date(order.order_date) <= new Date(filters.toDate);
      return repMatch && statusMatch && dateMatch;
    });
    setData(filtered);
  }, [filters, allOrders]);

  const headers = [
    { key: "repName", label: "المندوب" },
    { key: "order_number", label: "رقم الطلب" },
    { key: "customer", label: "العميل" },
    { key: "order_date", label: "تاريخ الطلب" },
    { key: "status", label: "حالة الطلب" },
    { key: "actions", label: "الإجراءات" },
  ];

  return (
    <ModalWrapper
      show={show}
      isVisible={show}
      onClose={onClose}
      title={title}
      maxWidth="max-w-7xl"
    >
      <div className="p-4 space-y-6">
        {/* الفلاتر */}
        <div className="flex flex-row flex-wrap items-center gap-4 pb-4 border-b border-gray-300">
          <SearchableSelectFieldV4
            label="المندوب"
            value={filters.repName}
            onChange={(val) =>
              setFilters((prev) => ({ ...prev, repName: val }))
            }
            options={[{ label: "كل المندوبين", value: null }, ...repOptions]}
            placeholder="اختر المندوب"
            isClearable
          />

          <SearchableSelectFieldV4
            label="الحالة"
            value={filters.status}
            onChange={(val) => setFilters((prev) => ({ ...prev, status: val }))}
            options={[{ label: "كل الحالات", value: null }, ...statusOptions]}
            placeholder="اختر الحالة"
            isClearable
          />

          <FormInputField
            type="date"
            name="fromDate"
            label="من تاريخ"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, fromDate: e.target.value }))
            }
          />
          <FormInputField
            type="date"
            name="toDate"
            label="إلى تاريخ"
            value={filters.toDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, toDate: e.target.value }))
            }
          />
        </div>

        {/* الجدول */}
        <Table2
          headers={headers}
          data={data}
          totalCount={data.length}
          loading={loading}
          renderRow={(row, index) => (
            <>
              <td className="py-2 px-3">{row.user.name}</td>
              <td className="py-2 px-3">{row.order_number}</td>
              <td className="py-2 px-3">{row.customer.name}</td>
              <td className="py-2 px-3">{row.order_date}</td>
              <td className="py-2 px-3">
                {statusMap[row.status] || row.status}
              </td>
              <td className="py-2 px-3">
                <AddEntityButton
                  label="تفاصيل الطلب"
                  onClick={() => handleShowOrderDetails(row)}
                />
              </td>
            </>
          )}
        />
      </div>

      {/* زر المعاينة للطباعة */}
      <div className="flex justify-center">
        <AddEntityButton
          label="معاينة للطباعه"
          onClick={() => onPreviewAndPrint(data)}
        />
      </div>

      {/* ✅ تم حذف OrderPrintPreviewModal من هنا */}
    </ModalWrapper>
  );
};

export default RepAndOrdersModal;