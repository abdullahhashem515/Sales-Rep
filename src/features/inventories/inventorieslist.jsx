import React, { useState, useEffect, useMemo, useContext } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import SearchableSelectFieldV4 from "../../components/shared/SearchableSelectFieldV4";
import Table from '../../components/shared/Table';
import { get } from '../../utils/apiService';
import { toast } from 'react-toastify';
import { AuthContext } from "../../contexts/AuthContext";

export default function Inventorieslist() {
  const { token } = useContext(AuthContext);

  const [salesReps, setSalesReps] = useState([]);
  const [loadingReps, setLoadingReps] = useState(true);
  const [errorReps, setErrorReps] = useState(null);
  
  const [selectedRep, setSelectedRep] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [errorInventory, setErrorInventory] = useState(null);

  const fetchSalesReps = async (currentToken) => {
    setLoadingReps(true);
    setErrorReps(null);
    try {
      const repsResponse = await get('admin/users', currentToken);
      const reps = repsResponse.users || repsResponse.data || [];
      const retailReps = reps.filter(rep => rep.type_user === 'retail_rep');
      setSalesReps(retailReps);
    } catch (err) {
      console.error("Failed to fetch sales representatives:", err);
      setErrorReps(err.message || 'فشل في جلب المندوبين.');
      toast.error('فشل في جلب المندوبين: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoadingReps(false);
    }
  };

  const fetchInventory = async (repSlug, currentToken) => {
    if (!repSlug || !currentToken) {
      setInventory([]);
      return;
    }

    setLoadingInventory(true);
    setErrorInventory(null);
    try {
      const inventoryResponse = await get(`admin/car-stocks/${repSlug}`, currentToken);
      const inventoryData = inventoryResponse.data || [];
      setInventory(inventoryData);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      if (err.status === 404) {
        setInventory([]);
        toast.info('لا يوجد مخزون لهذا المندوب.');
      } else {
        setErrorInventory(err.message || 'فشل في جلب المخزون.');
        toast.error('فشل في جلب المخزون: ' + (err.message || 'خطأ غير معروف.'));
      }
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSalesReps(token);
    } else {
      setSalesReps([]);
      setLoadingReps(false);
      setErrorReps('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
      setInventory([]);
    }
  }, [token]);

  useEffect(() => {
    fetchInventory(selectedRep, token);
  }, [selectedRep, token]);

  const tableHeaders = [
    { key: 'product_name_unit', label: 'المنتج' },
    { key: 'quantity', label: 'الكمية' },
  ];

  const renderInventoryRow = (item) => (
    <>
      <td className="py-3 px-4">{item.product} {item.unit}</td>
      <td className="py-3 px-4">{item.quantity}</td>
    </>
  );

  const getSelectedRepName = useMemo(() => {
    const rep = salesReps.find(r => r.slug === selectedRep);
    return rep?.name || 'اختر مندوب...';
  }, [salesReps, selectedRep]);

  const repSelectOptions = useMemo(() => {
    return salesReps.map(rep => ({
      value: rep.slug,
      label: rep.name
    }));
  }, [salesReps]);

  return (
    <MainLayout>
      <div className="text-white">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <PageHeader title="مخزون المندوبين" />
          <div className="w-full md:w-1/3">
            <SearchableSelectFieldV4
              label="اختر المندوب"
              value={selectedRep}
              onChange={(value) => setSelectedRep(value)}
              options={repSelectOptions}
              placeholder="ابحث أو اختر مندوب..."
              className="w-full text-right"
            />
          </div>
        </div>

        <h3 className="amiriFont text-xl font-bold mb-4 text-center">
          مخزون المندوب ({getSelectedRepName})
        </h3>

        <div className="flex justify-center">
          <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-md p-2">
            <Table
              headers={tableHeaders}
              data={inventory}
              loading={loadingInventory || loadingReps}
              error={errorInventory || errorReps}
              totalCount={inventory.length}
              renderRow={renderInventoryRow}
              rowKeyField="id"
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}