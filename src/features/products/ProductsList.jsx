import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../components/shared/MainLayout";
import PageHeader from "../../components/shared/PageHeader";
import AddEntityButton from "../../components/shared/AddEntityButton";
import SearchFilterBar from "../../components/shared/SearchFilterBar";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/solid"; 

import AddCategoryModal from "../../features/products/AddCategoryModal"; 
import AddCurrencyModal from "../../features/products/AddCurrencyModal"; 
import AddProductModal from "../../features/products/AddProductModal"; 
import ProductItem from "../../features/products/ProductItem"; 
import UpdateCategoryModal from "../../features/products/UpdateCategoryModal"; 
import UpdateCurrencyModal from "../../features/products/UpdateCurrencyModal"; 
import UpdateProductModal from "../../features/products/UpdateProductModal"; // NEW: Import UpdateProductModal
import ConfirmDeleteModal from "../../components/shared/ConfirmDeleteModal"; 

import { get, del } from '../../utils/apiService'; 
import { toast } from 'react-toastify';


export default function ProductsList() {
  // Placeholder states for SearchFilterBar (Categories)
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('name');

  // State for Modal visibility
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddCurrencyModal, setShowAddCurrencyModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  
  // States for Update Category Modal
  const [showUpdateCategoryModal, setShowUpdateCategoryModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null); 
  // States for Delete Category Confirmation Modal
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null); 

  // Categories data fetched from API
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);

  // Products data fetched from API
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);
  
  // States for Currencies data fetched from API
  const [currencies, setCurrencies] = useState([]); // This will now store objects {id, code, name}
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const [errorCurrencies, setErrorCurrencies] = useState(null);

  // States for Update Currency Modal
  const [showUpdateCurrencyModal, setShowUpdateCurrencyModal] = useState(false);
  const [currencyToEdit, setCurrencyToEdit] = useState(null);
  // States for Delete Currency Confirmation Modal
  const [showDeleteCurrencyModal, setShowDeleteCurrencyModal] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState(null);

  // NEW: States for Update Product Modal
  const [showUpdateProductModal, setShowUpdateProductModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  // NEW: States for Delete Product Confirmation Modal
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);


  // Pagination states for products
  const [currentPageProducts, setCurrentPageProducts] = useState(1);
  const productsPerPage = 4; // Number of products to display per page

  // --- Fetch Categories from API ---
  const fetchCategories = async () => {
    setLoadingCategories(true);
    setErrorCategories(null);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setErrorCategories('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        toast.error('لا يوجد رمز مصادقة.');
        setLoadingCategories(false);
        return;
      }
      const response = await get('admin/categories', token); 
      console.log("Categories API Response:", response); 
      setCategories(Array.isArray(response) ? response : response.categories || response.data || []);
      
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setErrorCategories(err.message || 'فشل في جلب الفئات.');
      toast.error('فشل في جلب الفئات: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoadingCategories(false);
    }
  };

  // --- Fetch Products from API ---
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setErrorProducts(null);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setErrorProducts('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        toast.error('لا يوجد رمز مصادحة.');
        setLoadingProducts(false);
        return;
      }
      const response = await get('admin/products', token);
      console.log("Products API Response:", response);
      setProducts(Array.isArray(response) ? response : response.products || response.data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setErrorProducts(err.message || 'فشل في جلب المنتجات.');
      toast.error('فشل في جلب المنتجات: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoadingProducts(false);
    }
  };

  // --- Fetch Currencies from API ---
  const fetchCurrencies = async () => {
    setLoadingCurrencies(true);
    setErrorCurrencies(null);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setErrorCurrencies('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        toast.error('لا يوجد رمز مصادقة.');
        setLoadingCurrencies(false);
        return;
      }
      const response = await get('admin/currencies', token);
      console.log("Currencies API Response:", response);
      // Filter and ensure currencies are stored as objects with 'id' and 'code'
      const fetchedCurrencies = Array.isArray(response) ? response : response.currencies || response.data || [];
      setCurrencies(fetchedCurrencies.filter(c => c && typeof c === 'object' && c.id && c.code));

    } catch (err) {
      console.error("Failed to fetch currencies:", err);
      setErrorCurrencies(err.message || 'فشل في جلب العملات.');
      toast.error('فشل في جلب العملات: ' + (err.message || 'خطأ غير معروف.'));
    } finally {
      setLoadingCurrencies(false);
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchCategories();
    fetchProducts(); 
    fetchCurrencies(); 
  }, []);

  // --- Handlers for Modals ---
  const handleAddCategoryClick = () => setShowAddCategoryModal(true);
  const handleConfirmAddCategory = (newCategoryData) => {
    setShowAddCategoryModal(false);
  };

  const handleAddCurrencyClick = () => setShowAddCurrencyModal(true);
  const handleConfirmAddCurrency = (isSuccess) => {
    setShowAddCurrencyModal(false);
    if (isSuccess) fetchCurrencies(); 
  };

  const handleAddProductClick = () => setShowAddProductModal(true);
  const handleConfirmAddProduct = (isSuccess) => { // Updated to accept isSuccess
    setShowAddProductModal(false);
    if (isSuccess) fetchProducts(); // Only re-fetch if successful
  };

  // Centralized handler for category modal closures
  const handleCategoryModalClose = (isSuccess) => {
    setShowAddCategoryModal(false);
    setShowUpdateCategoryModal(false);
    setShowDeleteCategoryModal(false);
    if (isSuccess) {
      fetchCategories(); 
    }
    setCategoryToEdit(null); 
    setCategoryToDelete(null); 
  };

  // Centralized handler for currency modal closures
  const handleCurrencyModalClose = (isSuccess) => {
    setShowAddCurrencyModal(false);
    setShowUpdateCurrencyModal(false);
    setShowDeleteCurrencyModal(false);
    if (isSuccess) {
      fetchCurrencies(); 
    }
    setCurrencyToEdit(null); 
    setCurrencyToDelete(null); 
  };

  // NEW: Centralized handler for product modal closures
  const handleProductModalClose = (isSuccess) => {
    setShowAddProductModal(false);
    setShowUpdateProductModal(false);
    setShowDeleteProductModal(false);
    if (isSuccess) {
      fetchProducts(); // Re-fetch products to update the list
    }
    setProductToEdit(null); // Clear product being edited
    setProductToDelete(null); // Clear product being deleted
  };

  // --- Category Edit/Delete Handlers ---
  const handleEditCategory = (category) => {
    setCategoryToEdit(category); 
    setShowUpdateCategoryModal(true); 
  };

  const handleDeleteCategory = async (category) => {
    setCategoryToDelete(category); 
    setShowDeleteCategoryModal(true); 
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setLoadingCategories(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('لا يوجد رمز مصادقة للحذف. يرجى تسجيل الدخول.');
        setLoadingCategories(false);
        return;
      }

      const response = await del(`admin/categories/${categoryToDelete.slug}`, token);

      if (response.status) {
        toast.success('تم حذف الفئة بنجاح!');
        handleCategoryModalClose(true); 
      } else {
        const apiErrorMessage = response.message || 'فشل حذف الفئة.';
        toast.error(apiErrorMessage);
        handleCategoryModalClose(false);
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error('فشل في حذف الفئة: ' + (err.message || 'خطأ غير معروف.'));
      handleCategoryModalClose(false);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Currency Edit/Delete Handlers
  const handleEditCurrency = (currency) => {
    setCurrencyToEdit(currency);
    setShowUpdateCurrencyModal(true);
  };

  const handleDeleteCurrency = (currency) => {
    setCurrencyToDelete(currency);
    setShowDeleteCurrencyModal(true);
  };

  const handleConfirmDeleteCurrency = async () => {
    if (!currencyToDelete) return;

    setLoadingCurrencies(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('لا يوجد رمز مصادقة للحذف. يرجى تسجيل الدخول.');
        setLoadingCurrencies(false);
        return;
      }

      const response = await del(`admin/currencies/${currencyToDelete.slug}`, token);

      if (response.status) {
        toast.success('تم حذف العملة بنجاح!');
        handleCurrencyModalClose(true); 
      } else {
        const apiErrorMessage = response.message || 'فشل حذف العملة.';
        toast.error(apiErrorMessage);
        handleCurrencyModalClose(false);
      }
    } catch (err) {
      console.error("Error deleting currency:", err);
      toast.error('فشل في حذف العملة: ' + (err.message || 'خطأ غير معروف.'));
      handleCurrencyModalClose(false);
    } finally {
      setLoadingCurrencies(false);
    }
  };


  // NEW: Product Delete Handler
  const handleDeleteProduct = (product) => { // Accept full product object
    setProductToDelete(product);
    setShowDeleteProductModal(true);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) {
      toast.error('لا يوجد منتج للحذف.');
      return;
    }
    // ✅ ADDED: Check if productToDelete.slug exists before attempting deletion
    if (!productToDelete.slug) {
      toast.error('معرف المنتج (Slug) مفقود. لا يمكن حذف المنتج.');
      console.error("Deletion Error: Product slug is missing for product:", productToDelete);
      setShowDeleteProductModal(false); // Close the modal as there's no slug to delete
      setProductToDelete(null); // Clear the productToDelete state
      return;
    }

    setLoadingProducts(true);
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('لا يوجد رمز مصادقة للحذف. يرجى تسجيل الدخول.');
        setLoadingProducts(false);
        return;
      }

      // Use product.slug for deletion
      const response = await del(`admin/products/${productToDelete.slug}`, token);

      if (response.status) {
        toast.success('تم حذف المنتج بنجاح!');
        handleProductModalClose(true); // Re-fetch products to update the list
      } else {
        const apiErrorMessage = response.message || 'فشل حذف المنتج.';
        toast.error(apiErrorMessage);
        handleProductModalClose(false);
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error('فشل في حذف المنتج: ' + (err.message || 'خطأ غير معروف.'));
      handleProductModalClose(false);
    } finally {
      setLoadingProducts(false);
    }
  };

  // NEW: Product Edit Handler
  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setShowUpdateProductModal(true);
  };


  // --- Filtering Logic ---
  const searchOptions = [
    { value: 'name', label: 'اسم الفئة' },
  ];

  const filteredCategories = useMemo(() => {
    if (loadingCategories || !categories) return []; 
    if (!searchTerm) return categories;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return categories.filter(category => {
      return category.name?.toLowerCase().includes(lowerCaseSearchTerm);
    });
  }, [categories, searchTerm, loadingCategories]); 

  // Filtering logic for Products
  const [searchTermProducts, setSearchTermProducts] = useState('');
  const [searchByProducts, setSearchByProducts] = useState('name');
  const searchOptionsProducts = [
    { value: 'name', label: 'اسم المنتج' },
    { value: 'slug', label: 'معرف المنتج (Slug)' }, 
    { value: 'category', label: 'الفئة' },
  ];

  const filteredProducts = useMemo(() => {
    if (loadingProducts || !products) return []; 
    if (!searchTermProducts) {
      return products;
    }

    const lowerCaseSearchTerm = searchTermProducts.toLowerCase();
    
    return products.filter(product => {
      if (searchByProducts === 'name') {
        return product.name?.toLowerCase().includes(lowerCaseSearchTerm);
      } else if (searchByProducts === 'slug') { 
        return product.slug?.toLowerCase().includes(lowerCaseSearchTerm);
      } else if (searchByProducts === 'category') {
        return product.category_name?.toLowerCase().includes(lowerCaseSearchTerm); 
      }
      return true;
    });
  }, [products, searchTermProducts, searchByProducts, loadingProducts]);

  // Reset product pagination to 1 whenever filteredProducts changes
  useEffect(() => {
    setCurrentPageProducts(1);
  }, [filteredProducts]);

  // Calculate pagination variables for products
  const totalPagesProducts = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPageProducts * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Pagination functions for products
  const paginateProducts = (pageNumber) => setCurrentPageProducts(pageNumber);
  const nextPageProducts = () => {
    if (currentPageProducts < totalPagesProducts) {
      setCurrentPageProducts(currentPageProducts + 1);
    }
  };
  const prevPageProducts = () => {
    if (currentPageProducts > 1) {
      setCurrentPageProducts(currentPageProducts - 1);
    }
  };


  return (
    <MainLayout>
      <div className="text-white">
        {/* Categories Section */}
        <div className="flex justify-between mb-4 items-center">
          <PageHeader title="الفئات" />
        </div>
        <div className="mb-4 flex justify-between items-center">
          <AddEntityButton label="+ إضافة فئة" onClick={handleAddCategoryClick} />
          <SearchFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            searchBy={searchBy}
            setSearchBy={setSearchBy}
            options={searchOptions}
            placeholder="بحث عن فئة"
          />
        </div>

        <div className="mt-8 mb-4">
          <h3 className="amiriFont text-xl font-bold mb-4">قائمة الفئات</h3>
          <div className="h-[210px] overflow-y-auto pr-2 border-2 border-accentColor rounded-lg p-2">
            {loadingCategories ? (
              <p className="text-center text-lg">جاري تحميل الفئات...</p>
            ) : errorCategories ? (
              <p className="text-center text-red-500 text-lg">خطأ: {errorCategories}</p>
            ) : filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredCategories.map((category) => (
                  <div
                    key={category.slug || category.id} 
                    className="bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <span className="amiriFont text-lg">{category.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="bg-yellow-400 hover:bg-yellow-600 p-2 rounded"
                        onClick={() => handleEditCategory(category)} 
                      >
                        <PencilIcon className="w-4 h-4 text-white" />
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 p-2 rounded"
                        onClick={() => handleDeleteCategory(category)} 
                      >
                        <TrashIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="amiriFont text-center text-lg col-span-full">لا توجد فئات مطابقة لنتائج البحث.</p>
            )}
          </div>
        </div>

        {/* Divider between Categories and Currencies */}
        <div className="my-10">
          <hr className="border-t-2 border-gray-700" />
        </div>

        {/* Currencies Section */}
        <div className="flex justify-between mb-4 items-center">
          <PageHeader title="العملات" />
        </div>
        <div className="mb-4 flex justify-start items-center">
          <AddEntityButton label="+ إضافة عملة" onClick={handleAddCurrencyClick} />
        </div>

        <div className="mt-8 mb-4">
          <h3 className="amiriFont text-xl font-bold mb-4">قائمة العملات</h3>
          <div className="h-[210px] overflow-y-auto pr-2 border-2 border-accentColor rounded-lg p-2">
            {loadingCurrencies ? (
              <p className="text-center text-lg">جاري تحميل العملات...</p>
            ) : errorCurrencies ? (
              <p className="text-center text-red-500 text-lg">خطأ: {errorCurrencies}</p>
            ) : currencies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {currencies.map((currency) => (
                  <div
                    key={currency.slug || currency.id} 
                    className="bg-gray-800 p-4 rounded-lg shadow flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <span className="amiriFont text-lg">{currency.name} ({currency.code})</span> 
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="bg-yellow-400 hover:bg-yellow-600 p-2 rounded"
                        onClick={() => handleEditCurrency(currency)}
                      >
                        <PencilIcon className="w-4 h-4 text-white" />
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 p-2 rounded"
                        onClick={() => handleDeleteCurrency(currency)} 
                      >
                        <TrashIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="amiriFont text-center text-lg col-span-full">لا توجد عملات لعرضها.</p>
            )}
          </div>
        </div>

        {/* Divider between Currencies and Products */}
        <div className="my-10">
          <hr className="border-t-2 border-gray-700" />
        </div>

        {/* Products Section */}
        <div className="flex justify-between mb-4 items-center">
          <PageHeader title="المنتجات" />
        </div>
        <div className="mb-4 flex justify-between items-center">
          <AddEntityButton label="+ إضافة منتج" onClick={handleAddProductClick} />
          <SearchFilterBar
            searchTerm={searchTermProducts}
            setSearchTerm={setSearchTermProducts}
            searchBy={searchByProducts}
            setSearchBy={setSearchByProducts}
            options={searchOptionsProducts}
            placeholder="بحث عن منتج"
          />
        </div>

        <div className="mt-8 mb-4">
          <h3 className="amiriFont text-xl font-bold mb-4">قائمة المنتجات</h3>
          {loadingProducts ? (
              <p className="text-center text-lg">جاري تحميل المنتجات...</p>
            ) : errorProducts ? (
              <p className="text-center text-red-500 text-lg">خطأ: {errorProducts}</p>
            ) : filteredProducts.length > 0 ? (
              <div className="pr-2 border-2 border-accentColor rounded-lg p-2">
                <div className="grid grid-cols-1 gap-4"> 
                  {currentProducts.map((product) => (
                    <ProductItem 
                      key={product.slug || product.id} 
                      product={product} 
                      onEdit={handleEditProduct} // Pass the full product object
                      onDelete={() => handleDeleteProduct(product)} // Pass the full product object for deletion
                      availableCurrencies={currencies} // ✅ NEW: Pass full currencies to ProductItem
                    />
                  ))}
                </div>
              </div>
            ) : (
              <p className="amiriFont text-center text-lg col-span-full">لا توجد منتجات مطابقة لنتائج البحث.</p>
            )}
        </div>

        {/* Pagination Controls for Products */}
        {!loadingProducts && filteredProducts.length > 0 && (
          <div className="flex justify-center mt-4 items-center">
            <button
              className="text-white bg-gray-800 px-4 py-2 rounded-lg mx-2"
              onClick={prevPageProducts}
              disabled={currentPageProducts === 1}
            >
              &lt;&lt;
            </button>
            <span className="text-white bg-green-700 px-4 py-2 rounded-lg mx-1 font-bold">
              {currentPageProducts}
            </span>
            <button
              className="text-white bg-gray-800 px-4 py-2 rounded-lg mx-2"
              onClick={nextPageProducts}
              disabled={currentPageProducts === totalPagesProducts}
            >
              &gt;&gt;
            </button>
          </div>
        )}

      </div>

      {/* Render the Modals */}
      <AddCategoryModal
        show={showAddCategoryModal}
        onClose={handleCategoryModalClose} 
        onAddCategoryConfirm={handleConfirmAddCategory} 
      />
      
      <UpdateCategoryModal
        show={showUpdateCategoryModal}
        onClose={handleCategoryModalClose} 
        categoryToEdit={categoryToEdit} 
      />

      <ConfirmDeleteModal
        show={showDeleteCategoryModal}
        onClose={() => handleCategoryModalClose(false)} 
        onConfirm={handleConfirmDeleteCategory} 
        title="تأكيد حذف الفئة"
        message={`هل أنت متأكد أنك تريد حذف الفئة "${categoryToDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />

      <AddCurrencyModal
        show={showAddCurrencyModal}
        onClose={handleCurrencyModalClose} 
        onAddCurrencyConfirm={handleConfirmAddCurrency}
      />

      <UpdateCurrencyModal
        show={showUpdateCurrencyModal}
        onClose={handleCurrencyModalClose} 
        currencyToEdit={currencyToEdit} 
      />

      <ConfirmDeleteModal
        show={showDeleteCurrencyModal}
        onClose={() => handleCurrencyModalClose(false)} 
        onConfirm={handleConfirmDeleteCurrency} 
        title="تأكيد حذف العملة"
        message={`هل أنت متأكد أنك تريد حذف العملة "${currencyToDelete?.name}" (${currencyToDelete?.code})؟ هذا الإجراء لا يمكن التراجع عنه.`} 
      />

      <AddProductModal
        show={showAddProductModal}
        onClose={handleProductModalClose} // Use new centralized handler
        onAddProductConfirm={handleConfirmAddProduct}
        availableCategories={categories.map(cat => cat.name)} 
        availableCurrencies={currencies} // ✅ NEW: Pass the full currency objects
      />

      {/* NEW: Update Product Modal */}
      <UpdateProductModal
        show={showUpdateProductModal}
        onClose={handleProductModalClose} // Use new centralized handler
        productToEdit={productToEdit} // Pass the full product object
        availableCategories={categories.map(cat => cat.name)} 
        availableCurrencies={currencies} // ✅ NEW: Pass the full currency objects
      />

      {/* NEW: Confirm Delete Product Modal */}
      <ConfirmDeleteModal
        show={showDeleteProductModal}
        onClose={() => handleProductModalClose(false)} // Just close without re-fetching if cancelled
        onConfirm={handleConfirmDeleteProduct} // Call the specific delete handler
        title="تأكيد حذف المنتج"
        message={`هل أنت متأكد أنك تريد حذف المنتج "${productToDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
      />
    </MainLayout>
  );
}
