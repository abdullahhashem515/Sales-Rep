import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import AddEntityButton from "../../components/shared/AddEntityButton";
import SearchFilterBar from "../../components/shared/SearchFilterBar";
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal";
import AddUpdateInventoryModal from "./AddUpdateInventoryModal"; // NEW: Import the unified Add/Update inventory modal
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid"; // Import icons for card actions

import { get, del } from '../../utils/apiService'; // Keep imports for future API connection
import { toast } from 'react-toastify';

export default function Inventorieslist() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [errorInventory, setErrorInventory] = useState(null);

  // Search and Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('product_name'); // Default search by product name
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Adjusted for card layout

  // Modals visibility states
  const [showAddUpdateInventoryModal, setShowAddUpdateInventoryModal] = useState(false);
  const [showDeleteInventoryModal, setShowDeleteInventoryModal] = useState(false);
  
  // State to hold the inventory item object for editing or deleting
  const [itemToEdit, setItemToEdit] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Dummy Data for Inventory Items (simulating data from backend)
  const dummyInventoryItems = useMemo(() => ([
    { 
      inventory_id: 'INV001', 
      salesman_id: 'rep_001', 
      salesman_name: 'أحمد (مندوب جملة)', 
      product_id: 'PROD001', 
      product_name: 'أرز المجد 10 كجم', 
      category_name: 'حبوب', 
      unit: 'كجم', 
      quantity: 50, 
      currency_code: 'YER', 
      price: 7000.00, 
      last_updated_date: '2024-07-28',
      type_user: 'wholesale' // Assuming this would come from product price tier or rep type
    },
    { 
      inventory_id: 'INV002', 
      salesman_id: 'rep_002', 
      salesman_name: 'سارة (مندوب تجزئة)', 
      product_id: 'PROD002', 
      product_name: 'زيت طبخ 3 لتر', 
      category_name: 'زيوت', 
      unit: 'لتر', 
      quantity: 30, 
      currency_code: 'YER', 
      price: 4800.00, 
      last_updated_date: '2024-07-27',
      type_user: 'retail'
    },
    { 
      inventory_id: 'INV003', 
      salesman_id: 'rep_001', 
      salesman_name: 'أحمد (مندوب جملة)', 
      product_id: 'PROD003', 
      product_name: 'سكر 5 كجم', 
      category_name: 'سكر', 
      unit: 'كجم', 
      quantity: 100, 
      currency_code: 'YER', 
      price: 2300.00, 
      last_updated_date: '2024-07-26',
      type_user: 'wholesale'
    },
    { 
      inventory_id: 'INV004', 
      salesman_id: 'rep_003', 
      salesman_name: 'علي (مندوب جملة)', 
      product_id: 'PROD004', 
      product_name: 'شاي الربيع 100 كيس', 
      category_name: 'مشروبات', 
      unit: 'كيس', 
      quantity: 75, 
      currency_code: 'YER', 
      price: 3800.00, 
      last_updated_date: '2024-07-25',
      type_user: 'wholesale'
    },
    { 
      inventory_id: 'INV005', 
      salesman_id: 'rep_002', 
      salesman_name: 'سارة (مندوب تجزئة)', 
      product_id: 'PROD005', 
      product_name: 'مياه صحية 20 لتر', 
      category_name: 'مشروبات', 
      unit: 'لتر', 
      quantity: 40, 
      currency_code: 'YER', 
      price: 550.00, 
      last_updated_date: '2024-07-24',
      type_user: 'retail'
    },
    { 
      inventory_id: 'INV006', 
      salesman_id: 'rep_004', 
      salesman_name: 'فاطمة (مندوب تجزئة)', 
      product_id: 'PROD001', 
      product_name: 'أرز المجد 10 كجم', 
      category_name: 'حبوب', 
      unit: 'كجم', 
      quantity: 20, 
      currency_code: 'YER', 
      price: 7500.25, 
      last_updated_date: '2024-07-23',
      type_user: 'retail'
    },
    { 
      inventory_id: 'INV007', 
      salesman_id: 'rep_001', 
      salesman_name: 'أحمد (مندوب جملة)', 
      product_id: 'PROD002', 
      product_name: 'زيت طبخ 3 لتر', 
      category_name: 'زيوت', 
      unit: 'لتر', 
      quantity: 60, 
      currency_code: 'YER', 
      price: 4800.00, 
      last_updated_date: '2024-07-22',
      type_user: 'wholesale'
    },
  ]), []);

  // Function to fetch inventory items (now from dummy data)
  const fetchInventoryItems = async () => {
    setLoadingInventory(true);
    setErrorInventory(null);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 700)); 
      setInventoryItems(dummyInventoryItems); // Use dummy data
    } catch (err) {
      console.error("Failed to fetch inventory items (simulated):", err);
      setErrorInventory(err.message || 'فشل في جلب عناصر المخزون (محاكاة).');
      toast.error('فشل في جلب المخزون: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoadingInventory(false);
    }
  };

  // Fetch inventory items on component mount and when search terms change
  useEffect(() => {
    fetchInventoryItems();
  }, [searchTerm, searchBy]); // Keep dependencies for search filtering

  // Reset pagination when filtered data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [inventoryItems]);

  // Memoized filtered inventory items
  const searchOptions = [
    { value: 'product_name', label: 'اسم المنتج' },
    { value: 'salesman_name', label: 'اسم المندوب' },
    { value: 'category_name', label: 'اسم الفئة' },
    { value: 'unit', label: 'الوحدة' },
  ];

  const filteredItems = useMemo(() => {
    if (!searchTerm) return inventoryItems;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return inventoryItems.filter(item => {
      if (searchBy === 'product_name') return item.product_name?.toLowerCase().includes(lowerCaseSearchTerm);
      if (searchBy === 'salesman_name') return item.salesman_name?.toLowerCase().includes(lowerCaseSearchTerm);
      if (searchBy === 'category_name') return item.category_name?.toLowerCase().includes(lowerCaseSearchTerm);
      if (searchBy === 'unit') return item.unit?.toLowerCase().includes(lowerCaseSearchTerm);
      return false;
    });
  }, [inventoryItems, searchTerm, searchBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Handlers for Modals
  const handleAddInventoryItemClick = () => {
    setItemToEdit(null); // Set to null for add mode
    setShowAddUpdateInventoryModal(true);
  };

  const handleEditInventoryItemClick = (item) => {
    setItemToEdit(item); // Set item object for edit mode
    setShowAddUpdateInventoryModal(true);
  };

  const handleDeleteInventoryItemClick = (item) => {
    setItemToDelete(item);
    setShowDeleteInventoryModal(true);
  };

  const handleInventoryModalClose = (isSuccess = false) => {
    setShowAddUpdateInventoryModal(false);
    setShowDeleteInventoryModal(false);
    setItemToEdit(null);
    setItemToDelete(null);
    if (isSuccess) {
      // For dummy data, if an operation was "successful", we simulate the change
      // by re-fetching the original dummy list or updating it manually.
      fetchInventoryItems(); 
    }
  };

  // Handle actual deletion (now simulated)
  const handleConfirmDeleteInventoryItem = async () => {
    if (!itemToDelete) return;

    setLoadingInventory(true);
    try {
      // Simulate deletion success
      await new Promise(resolve => setTimeout(resolve, 500)); 
      toast.success('Inventory item deleted successfully (simulated)!');
      // For dummy data, we'll actually filter it out
      setInventoryItems(prevItems => prevItems.filter(item => item.inventory_id !== itemToDelete.inventory_id));
    } catch (err) {
      console.error("Error deleting inventory item (simulated):", err);
      toast.error('فشل في حذف عنصر المخزون (محاكاة): ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoadingInventory(false);
      setShowDeleteInventoryModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <MainLayout>
      <div className="text-white">
        <div className="flex justify-between mb-4 items-center">
          <PageHeader title="إدارة المخزون" />
        </div>
        <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <AddEntityButton label="+ إضافة عنصر مخزون" onClick={handleAddInventoryItemClick} />
          <SearchFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchBy={searchBy}
            setSearchBy={setSearchBy}
            options={searchOptions}
            placeholder="بحث عن عنصر مخزون..."
          />
        </div>

        {loadingInventory ? (
          <p className="text-center text-lg">جاري تحميل عناصر المخزون...</p>
        ) : errorInventory ? (
          <p className="text-center text-red-500 text-lg">خطأ: {errorInventory}</p>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {currentItems.map((item) => (
              <div 
                key={item.inventory_id} 
                className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div>
                  <h3 className="amiriFont text-xl font-bold mb-2 text-white">المنتج: {item.product_name}</h3>
                  <p className="text-gray-300 mb-1">
                    <span className="font-semibold text-accentColor">الفئة:</span> {item.category_name || 'N/A'}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <span className="font-semibold text-accentColor">المندوب:</span> {item.salesman_name || 'N/A'}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <span className="font-semibold text-accentColor">الوحدة:</span> {item.unit || 'N/A'}
                  </p>
                  <p className="text-gray-300 mb-1">
                    <span className="font-semibold text-accentColor">الكمية:</span> 
                    <span className="text-xl font-bold text-green-400 mr-2">
                        {item.quantity}
                    </span>
                  </p>
                  <div className="flex items-center gap-2 mt-2 mb-3">
                    <span className="font-semibold text-accentColor">السعر:</span>
                    <span className="text-xl font-bold text-blue-400">
                        {item.price?.toFixed(2) || 'N/A'} {item.currency_code || 'N/A'}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm italic border-t border-gray-700 pt-3">
                    <span className="font-semibold text-accentColor">آخر تحديث:</span> 
                    {item.last_updated_date ? new Date(item.last_updated_date).toLocaleDateString('ar-SA', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    }) : 'N/A'}
                  </p>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-lg transition-colors duration-200"
                    onClick={() => handleEditInventoryItemClick(item)}
                    title="تعديل عنصر المخزون"
                  >
                    <PencilIcon className="w-5 h-5 text-white" />
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 p-2 rounded-lg transition-colors duration-200"
                    onClick={() => handleDeleteInventoryItemClick(item)}
                    title="حذف عنصر المخزون"
                  >
                    <TrashIcon className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="amiriFont text-center text-lg col-span-full">
            لا توجد عناصر مخزون مطابقة لنتائج البحث.
          </p>
        )}

        {/* Pagination Controls */}
        {!loadingInventory && !errorInventory && filteredItems.length > 0 && (
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

      {/* Add/Update Inventory Modal */}
      <AddUpdateInventoryModal
        show={showAddUpdateInventoryModal}
        onClose={handleInventoryModalClose}
        itemToEdit={itemToEdit}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        show={showDeleteInventoryModal}
        onClose={() => handleInventoryModalClose(false)}
        onConfirm={handleConfirmDeleteInventoryItem}
        title="تأكيد حذف عنصر المخزون"
        message={`هل أنت متأكد أنك تريد حذف عنصر المخزون للمنتج "${itemToDelete?.product_name}" للمندوب "${itemToDelete?.salesman_name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />
    </MainLayout>
  );
}
