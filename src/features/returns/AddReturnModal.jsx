import React, { useState, useEffect, useMemo, useContext } from 'react';
import ModalWrapper from '../../components/shared/ModalWrapper';
import FormInputField from '../../components/shared/FormInputField';
import FormSelectField from '../../components/shared/FormSelectField';
import SearchableSelectField from '../../components/shared/SearchableSelectFieldV2';
import { toast } from 'react-toastify';
import { get, post } from '../../utils/apiService';
import { AuthContext } from "../../contexts/AuthContext";
import { XMarkIcon } from '@heroicons/react/24/solid';

export default function AddReturnModal({ show, onClose }) {
  const { token } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(false);

  const [invoiceId, setInvoiceId] = useState('');
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState('cash');
  const [notes, setNotes] = useState('');
  const [returnItems, setReturnItems] = useState([]);

  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!token) {
        toast.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        return;
      }

      setLoadingInvoices(true);
      try {
        const response = await get('admin/invoices', token);
        const fetchedData = response?.data || [];
        setInvoices(Array.isArray(fetchedData) ? fetchedData : []);
      } catch (err) {
        toast.error('فشل جلب الفواتير.');
        console.error("Failed to fetch invoices:", err);
      } finally {
        setLoadingInvoices(false);
      }
    };

    if (show) {
      setIsVisible(true);
      setInvoiceId('');
      setReturnDate(new Date().toISOString().split('T')[0]);
      setPaymentType('cash');
      setNotes('');
      setReturnItems([]);
      setSelectedInvoice(null);
      setErrors({});
      setIsLoading(false);
      fetchInvoices();
    } else {
      setIsVisible(false);
    }
  }, [show, token]);

  const invoiceOptions = useMemo(() => {
    return invoices.map(inv => ({
      value: inv.id,
      label: `فاتورة رقم ${inv.invoice_number} - ${inv.customer.name}`,
      data: inv // حفظ الكائن الكامل هنا
    }));
  }, [invoices]);

  const paymentTypeOptions = [
    { value: 'cash', label: 'نقدي' },
    { value: 'credit', label: 'آجل' },
  ];

  const handleInvoiceChange = (id) => {
    setInvoiceId(id);
    if (id) {
      const selected = invoices.find(inv => inv.id === id);
      if (selected) {
        setSelectedInvoice(selected);
        // تعبئة البيانات من المنتجات الموجودة بالفعل في الفاتورة
        setReturnItems(selected.items.map(item => ({
          invoice_item_id: item.id, // استخدام ID بند الفاتورة كمفتاح
          product_name: item.name,
          unit:item.unit,
          max_quantity: item.quantity,
          quantity: 0,
          reason: '',
          price: item.unit_price
        })));
      } else {
        setSelectedInvoice(null);
        setReturnItems([]);
      }
    } else {
      setSelectedInvoice(null);
      setReturnItems([]);
    }
  };

  const handleReturnItemChange = (itemId, field, value) => {
    setReturnItems(prevItems => prevItems.map(item => {
      if (item.invoice_item_id === itemId) {
        let updatedValue = value;
        if (field === 'quantity') {
          const parsedValue = parseInt(value, 10) || 0;
          updatedValue = Math.min(parsedValue, item.max_quantity);
          updatedValue = Math.max(updatedValue, 0);
        }
        return { ...item, [field]: updatedValue };
      }
      return item;
    }));
  };

  const handleRemoveItem = (itemId) => {
    setReturnItems(prevItems => prevItems.filter(item => item.invoice_item_id !== itemId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let currentErrors = {};

    if (!invoiceId) currentErrors.invoice_number = 'الرجاء اختيار الفاتورة.';
    if (!paymentType) currentErrors.payment_type = 'الرجاء اختيار نوع الدفع.';
    if (!returnDate) currentErrors.return_date = 'الرجاء إدخال تاريخ المرتجع.';

    const finalReturnItems = returnItems
      .filter(item => parseInt(item.quantity) > 0 && item.reason.trim() !== '');

    if (finalReturnItems.length === 0) {
      currentErrors.items = 'يجب تحديد منتج واحد على الأقل مع تحديد كمية وسبب للارتجاع.';
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      toast.error('يرجى تصحيح الأخطاء في النموذج.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        invoice_number: selectedInvoice.invoice_number,
        payment_type: paymentType,
        return_date: returnDate,
        notes: notes,
        items: finalReturnItems.map(item => ({
          invoice_item_id: item.invoice_item_id,
          quantity: parseInt(item.quantity),
          reason: item.reason,
        })),
      };

      const response = await post('admin/sale-returns', payload, token);

      if (response?.status === true) {
        toast.success('تم إنشاء المرتجع بنجاح!');
        onClose(true);
      } else {
        toast.error(response?.message || 'فشل إنشاء المرتجع.');
        setErrors(response?.errors || { general: response?.message || 'خطأ غير معروف.' });
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء الاتصال بالخادم.');
      console.error("Error creating return:", err);
    } finally {
      setIsLoading(false);
    }
  };
console.log("hhhhhhhh",returnItems);
  return (
    <ModalWrapper
      show={show}
      onClose={() => onClose(false)}
      isVisible={isVisible}
      title="إنشاء مرتجع"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          <SearchableSelectField
            label="الفاتورة"
            value={invoiceId}
            onChange={handleInvoiceChange}
            options={invoiceOptions}
            placeholder={loadingInvoices ? 'جاري التحميل...' : 'اختر الفاتورة...'}
            error={errors.invoice_number}
          />
          <FormInputField
            label="تاريخ المرتجع"
            type="date"
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
            error={errors.return_date}
          />
          <FormSelectField
            label="نوع الدفع"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            options={paymentTypeOptions}
            error={errors.payment_type}
          />
        </div>
        
        {selectedInvoice && (
          <div className="border border-gray-700 p-3 rounded-lg flex flex-col gap-3 mt-4">
            <h4 className="text-base font-bold border-b border-gray-700 pb-2 mb-2">
              المنتجات في فاتورة: {selectedInvoice.invoice_number}
            </h4>
            <div className="max-h-96 overflow-y-auto ">
              {returnItems.length > 0 ? (
                returnItems.map((item) => (
                  <div key={item.invoice_item_id} className="flex gap-4 items-center  border-b border-gray-700 last:border-b-0">
                    <div className="col-span-1">
                      <p className="font-semibold text-white">
                        {item.product_name + item.unit}
                      </p>
                      <p className="text-xs text-gray-400">
                        الكمية في الفاتورة: {item.max_quantity}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <FormInputField
                        label="الكمية المرتجعة"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleReturnItemChange(item.invoice_item_id, 'quantity', e.target.value)}
                        min="0"
                        max={item.max_quantity}
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <FormInputField
                        label="السبب"
                        type="text"
                        value={item.reason}
                        onChange={(e) => handleReturnItemChange(item.invoice_item_id, 'reason', e.target.value)}
                        placeholder="سبب الارتجاع"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.invoice_item_id)}
                        className="bg-red-500 hover:bg-red-600 p-2 rounded-full flex-shrink-0"
                        title="إزالة المنتج من المرتجع"
                      >
                        <XMarkIcon className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4 text-sm">
                  لا توجد منتجات في الفاتورة المحددة.
                </p>
              )}
            </div>
            {errors.items && <p className="text-red-500 text-xs mt-1 text-center">{errors.items}</p>}
          </div>
        )}

        <div className="mt-4">
          <FormInputField
            label="ملاحظات"
            type="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        
        {errors.general && <p className="text-red-500 text-xs mt-1 text-center">{errors.general}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded flex-1"
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded flex-1"
            disabled={isLoading}
          >
            {isLoading ? 'جاري إنشاء المرتجع...' : 'إنشاء المرتجع'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}