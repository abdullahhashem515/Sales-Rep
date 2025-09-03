import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import SearchableSelectFieldV4 from "../../components/shared/SearchableSelectFieldV4";
import FormInputField from "../../components/shared/FormInputField";
import Table2 from "../../components/shared/Table2";
import { get } from "../../utils/apiService";
import { useAuth } from "../../contexts/AuthContext";
import AddEntityButton from "../../components/shared/AddEntityButton";

const RetailRepAndOrdersModal = ({ show, onClose, title, onPreviewAndPrint, onOpenOrderDetails }) => {
  console.log("🔄 RetailRepAndOrdersModal component rendered, show=", show);

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

  const statusMap = {
    accepted: "مقبول",
    pending: "معلق",
    cancelled: "مرفوض",
  };

  useEffect(() => {
    console.log("📢 useEffect(show) triggered =>", show);
    if (show) {
      fetchOrders();
    }
  }, [show]);

  const fetchOrders = async () => {
    console.log("🚀 Starting fetchOrders...");
    try {
      setLoading(true);
      console.log("📡 Calling API: admin/shipment-requests");
      const response = await get("admin/shipment-requests", token);
      console.log("✅ Full API response:", response);

      if (!response || !response["shipment-Request"]) {
        console.warn("⚠️ No shipment-Request found in response:", response);
        return;
      }

      const extractedOrders = response["shipment-Request"];
      console.log("📦 Extracted orders:", extractedOrders);

      if (Array.isArray(extractedOrders)) {
        setAllOrders(extractedOrders);
        setData(extractedOrders);

        const reps = extractedOrders
          .map((order) => order.user)
          .filter((u) => u && u.id && u.name)
          .map((u) => ({ label: u.name, value: u.id }));

        const uniqueReps = Array.from(new Map(reps.map((r) => [r.value, r])).values());
        setRepOptions(uniqueReps);

        const statuses = extractedOrders
          .map((order) => order.status)
          .filter((s) => s)
          .map((s) => ({ label: statusMap[s] || s, value: s }));

        const uniqueStatuses = Array.from(new Map(statuses.map((s) => [s.value, s])).values());
        setStatusOptions(uniqueStatuses);
      } else {
        console.warn("⚠️ Extracted orders is not an array:", extractedOrders);
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
    } finally {
      setLoading(false);
      console.log("🏁 fetchOrders finished.");
    }
  };

  // ✅ تم إزالة onClose()
  const handleShowOrderDetails = (order) => {
    console.log("🔍 handleShowOrderDetails clicked, order:", order);
    const formattedOrder = {
      ...order,
      order_id: order.shipment_number,
      customer_name: null,
      salesperson_name: order.user?.name,
      products: order.items,
    };
    console.log("📄 Formatted order for modal:", formattedOrder);
    onOpenOrderDetails(formattedOrder);
  };
  
  // ✅ تم إزالة onClose()
  const handlePreviewAndPrint = () => {
    onPreviewAndPrint(data);
  };

  useEffect(() => {
    if (allOrders.length > 0) {
      const shipmentDates = allOrders
        .map(order => new Date(order.shipment_date))
        .filter(d => !isNaN(d));

      if (shipmentDates.length > 0) {
        const minDate = new Date(Math.min(...shipmentDates));
        const today = new Date();

        const formatDate = (date) => {
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, "0");
          const d = String(date.getDate()).padStart(2, "0");
          return `${y}-${m}-${d}`;
        };

        setFilters(prev => ({
          ...prev,
          fromDate: formatDate(minDate),
          toDate: formatDate(today)
        }));
      }
    }
  }, [allOrders]);

  useEffect(() => {
    console.log("🔎 useEffect(filters) triggered =>", filters);

    const filtered = allOrders.filter((order) => {
      const repMatch = !filters.repName || order.user?.id === filters.repName;
      const statusMatch = !filters.status || order.status === filters.status;
      const orderDate = new Date(order.shipment_date);
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;
      const dateMatch =
        (!fromDate || orderDate >= fromDate) && (!toDate || orderDate <= toDate);

      return repMatch && statusMatch && dateMatch;
    });

    setData(filtered);
  }, [filters, allOrders]);

  const headers = [
    { key: "repName", label: "المندوب" },
    { key: "shipment_number", label: "رقم الطلب" },
    { key: "shipment_date", label: "تاريخ الطلب" },
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
        <div className="flex flex-row flex-wrap items-center gap-4 pb-4 border-b border-gray-300">
          <SearchableSelectFieldV4
            label="المندوب"
            value={filters.repName}
            onChange={(val) => setFilters((prev) => ({ ...prev, repName: val }))}
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
            onChange={(e) => setFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
          />
          <FormInputField
            type="date"
            name="toDate"
            label="إلى تاريخ"
            value={filters.toDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, toDate: e.target.value }))}
          />
        </div>

        <Table2
          headers={headers}
          data={data}
          totalCount={data.length}
          loading={loading}
          renderRow={(row) => (
            <>
              <td className="py-2 px-3">{row.user?.name || "غير معروف"}</td>
              <td className="py-2 px-3">{row.shipment_number}</td>
              <td className="py-2 px-3">{new Date(row.shipment_date).toLocaleDateString("ar-EG")}</td>
              <td className="py-2 px-3">{statusMap[row.status] || row.status}</td>
              <td className="py-2 px-3">
                <AddEntityButton
                  label="تفاصيل الطلب"
                  onClick={() => handleShowOrderDetails(row)}
                />
              </td>
            </>
          )}
        />

        {data.length === 0 && !loading && (
          <p className="text-center py-4 text-gray-500">⚠️ لا توجد بيانات</p>
        )}
      </div>

      <div className="flex justify-center">
        <AddEntityButton label="معاينة للطباعه" onClick={handlePreviewAndPrint} />
      </div>
    </ModalWrapper>
  );
};

export default RetailRepAndOrdersModal;