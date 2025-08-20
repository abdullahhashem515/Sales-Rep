// src/pages/inventories/Inventorieslist.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
// import FormSelectField from "../../components/shared/FormSelectField"; // REMOVED: No longer needed
import SearchableSelectField from "../../components/shared/SearchableSelectField"; // NEW: Import the SearchableSelectField
import Table from '../../components/shared/Table'; 
import { get } from '../../utils/apiService'; // Assuming apiService.js is in utils
import { toast } from 'react-toastify';
import { AuthContext } from "../../contexts/AuthContext";


export default function Inventorieslist() {
  const { token } = useContext(AuthContext);

  const [salesReps, setSalesReps] = useState([]);
  const [loadingReps, setLoadingReps] = useState(true);
  const [errorReps, setErrorReps] = useState(null);
  
  const [selectedRep, setSelectedRep] = useState(''); // State to hold the selected rep's slug
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [errorInventory, setErrorInventory] = useState(null);


  // --- Fetch Sales Representatives ---
  // MODIFIED: Accepts token as an argument
  const fetchSalesReps = async (currentToken) => { 
    setLoadingReps(true);
    setErrorReps(null);
    try {
      // REMOVED: Redundant check, useEffect will handle token presence
      const repsResponse = await get('admin/users', currentToken); 
      const reps = repsResponse.users || repsResponse.data || [];
      setSalesReps(reps);
      // Optional: Automatically select the first rep if the list is not empty
      if (reps.length > 0) {
        // After fetching, if there are retail reps, select the first one by default
        const retailReps = reps.filter(rep => rep.type_user === 'retail_rep');
        if (retailReps.length > 0 && selectedRep === '') { // Only auto-select if no rep is already selected
          // Do not set default selected rep here, let the user explicitly choose.
          // This will ensure "اختر المندوب..." remains a placeholder initially.
        } 
      }
    } catch (err) {
      console.error("Failed to fetch sales representatives:", err);
      setErrorReps(err.message || 'فشل في جلب المندوبين.');
      toast.error('فشل في جلب المندوبين: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoadingReps(false);
    }
  };


  // --- Fetch Inventory for the Selected Rep ---
  // MODIFIED: Accepts token as an argument
  const fetchInventory = async (repSlug, currentToken) => {
    // If no repSlug is selected or token is missing, clear inventory and return
    if (!repSlug || !currentToken) { // Use currentToken here
      setInventory([]);
      return;
    }

    setLoadingInventory(true);
    setErrorInventory(null);
    try {
      // The `repSlug` from the selected rep acts as the `user_id` here.
      const inventoryResponse = await get(`admin/car-stocks/${repSlug}`, currentToken); // Use currentToken here
      console.log("Inventory API Response (car-stocks):", inventoryResponse);
      const inventoryData = inventoryResponse.data || []; 
      setInventory(inventoryData);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      // Check if the error is a 404 (Not Found) which might mean no stock for that user
      if (err.status === 404) {
        setInventory([]); // Clear inventory if no stock is found
        toast.info('لا يوجد مخزون لهذا المندوب.');
      } else {
        setErrorInventory(err.message || 'فشل في جلب المخزون.');
        toast.error('فشل في جلب المخزون: ' + (err.message || 'خطأ غير معروف.'));
      }
    } finally {
      setLoadingInventory(false);
    }
  };


  // Effect to fetch reps when token becomes available
  // MODIFIED: Only call fetchSalesReps if token is present, and pass token explicitly
  useEffect(() => {
    if (token) { // Only attempt to fetch if token exists
      fetchSalesReps(token); // Pass the token explicitly
    } else {
      // If token is not available, reset states and indicate loading finished
      setSalesReps([]);
      setLoadingReps(false);
      setErrorReps('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
      setInventory([]); // Clear inventory if no token
    }
  }, [token]); // Dependency array: re-run when `token` changes


  // Effect to fetch inventory when the selected rep changes or token changes
  // MODIFIED: Pass token explicitly
  useEffect(() => {
    fetchInventory(selectedRep, token); // Pass the selectedRep and token explicitly
  }, [selectedRep, token]); // Dependency array: re-run when `selectedRep` or `token` changes


  // --- Table Headers ---
  const tableHeaders = [
    { key: 'product_name_unit', label: 'المنتج' }, // Updated label for clarity
    { key: 'quantity', label: 'الكمية' },
  ];

  // --- Render Row for Inventory Table ---
  const renderInventoryRow = (item) => (
    <>
      {/* UPDATED: Display product name and unit together */}
      <td className="py-3 px-4">{item.product} {item.unit}</td> 
      <td className="py-3 px-4">{item.quantity}</td>
    </>
  );

  // --- Get the name of the selected rep for the header ---
  const getSelectedRepName = useMemo(() => {
    const rep = salesReps.find(r => r.slug === selectedRep);
    // Return the rep's name if selected, otherwise return the placeholder text
    return rep?.name || 'اختر مندوب...';
  }, [salesReps, selectedRep]);


  // Options for the representative select field
  const repSelectOptions = useMemo(() => {
    // UPDATED: No longer adding a default value here, as SearchableSelectField handles placeholder
    const options = []; 
    // Filter salesReps to include only 'retail_rep'
    const retailReps = salesReps.filter(rep => rep.type_user === 'retail_rep');
    // Map filtered retail reps to options
    retailReps.forEach(rep => {
      options.push({ value: rep.slug, label: rep.name });
    });
    return options;
  }, [salesReps]);


  return (
    <MainLayout>
      <div className="text-white">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <PageHeader title="مخزون المندوبين" />
          <div className="w-full md:w-1/3">
            <SearchableSelectField
              label="اختر المندوب"
              value={selectedRep} // The selectedRep state will be empty initially for placeholder
              onChange={(value) => setSelectedRep(value)}
              options={repSelectOptions}
              placeholder="ابحث أو اختر مندوب..." // This will now truly act as a placeholder
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
              rowKeyField="id" // Changed from product_id to id, as id is top-level and unique per stock item
            />
          </div>
        </div>

      </div>
    </MainLayout>
  );
}
