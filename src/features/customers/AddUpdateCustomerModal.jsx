import React, { useState, useEffect } from "react";
import ModalWrapper from "../../components/shared/ModalWrapper";
import FormInputField from "../../components/shared/FormInputField";
import FormSelectField from "../../components/shared/FormSelectField";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from 'react-toastify'; 
import { post, put, get } from '../../utils/apiService';
import SearchableSelectFieldV2 from "../../components/shared/SearchableSelectFieldV2";


/**
 * مكون مودال موحد لإضافة أو تعديل بيانات عميل.
 * يدعم إضافة أرقام هواتف متعددة.
 *
 * @param {object} props
 * @param {boolean} props.show - لتحديد ما إذا كان المودال مرئيًا.
 * @param {function} props.onClose - دالة لاستدعائها عند إغلاق المودال.
 * @param {object} [props.customerToEdit] - كائن العميل الذي سيتم تعديله. إذا كان فارغًا، فهو وضع إضافة.
 */
export default function AddUpdateCustomerModal({ show, onClose, customerToEdit }) {
  const [isVisible, setIsVisible] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumbers, setPhoneNumbers] = useState(['']); // CHANGED: Array for multiple phone numbers
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState('male'); // Default gender
  const [country, setCountry] = useState('اليمن'); // Default country
  const [representativeId, setRepresentativeId] = useState(''); // State for selected representative ID
  const [representatives, setRepresentatives] = useState([]); // State for list of representatives

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalCustomerData, setOriginalCustomerData] = useState(null); // To detect changes in edit mode

  // Fetch representatives when the modal is shown
  useEffect(() => {
    const fetchRepresentatives = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          toast.error('لا يوجد رمز مصادقة لجلب المندوبين. يرجى تسجيل الدخول أولاً.');
          return;
        }
        const response = await get('admin/users', token); 
        const reps = (response.users || response.data || [])
          .filter(user => user.type_user === 'ws_rep' || user.type_user === 'retail_rep')
          .map(user => ({
            label: `${user.name} (${user.type_user === 'ws_rep' ? 'مندوب جملة' : 'مندوب تجزئة'})`,
            value: user.id 
          }));
setRepresentatives(reps);
      } catch (err) {
        console.error("Failed to fetch representatives:", err);
        toast.error('فشل في جلب قائمة المندوبين.');
      }
    };

    if (show) {
      fetchRepresentatives();
    }
  }, [show]);

  // Populate form fields when modal opens or customerToEdit changes
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setErrors({}); // Clear errors on open
      setIsLoading(false); // Reset loading state

      if (customerToEdit) {
        // Edit mode
        setIsEditMode(true);
        setName(customerToEdit.name || '');
        // UPDATED: Handle incoming 'phone' as an array directly (if object, extract 'phone_number' or 'phone')
        let phonesToSet = [''];
        if (Array.isArray(customerToEdit.phone) && customerToEdit.phone.length > 0) {
          phonesToSet = customerToEdit.phone.map(p => {
            if (typeof p === 'object' && p !== null) {
              return p.phone_number?.toString() || p.phone?.toString() || '';
            }
            return p?.toString() || '';
          }).filter(p => p.trim() !== '');
        } else if (typeof customerToEdit.phone === 'object' && customerToEdit.phone !== null) {
            // If phone itself is a single object, e.g., { phone_number: "77..." }
            phonesToSet = [customerToEdit.phone.phone_number?.toString() || customerToEdit.phone.phone?.toString() || ''];
        } else if (typeof customerToEdit.phone === 'string' || typeof customerToEdit.phone === 'number') {
            phonesToSet = [customerToEdit.phone.toString()];
        }

        setPhoneNumbers(phonesToSet.length > 0 ? phonesToSet : ['']);
        
        setCity(customerToEdit.city || '');
        setAddress(customerToEdit.address || '');
        setGender(customerToEdit.gender || 'male');
        setCountry(customerToEdit.country || 'اليمن');
        setRepresentativeId(customerToEdit.user_id || ''); // Use user_id from backend response if available

        // Store original data for change detection
        let originalPhonesForComparison = [];
        if (Array.isArray(customerToEdit.phone) && customerToEdit.phone.length > 0) {
          originalPhonesForComparison = customerToEdit.phone.map(p => {
            if (typeof p === 'object' && p !== null) {
              return p.phone_number?.toString() || p.phone?.toString() || '';
            }
            return p?.toString() || '';
          }).filter(p => p.trim() !== '').sort();
        } else if (typeof customerToEdit.phone === 'object' && customerToEdit.phone !== null) {
            originalPhonesForComparison = [(customerToEdit.phone.phone_number?.toString() || customerToEdit.phone.phone?.toString() || '')].sort();
        } else if (typeof customerToEdit.phone === 'string' || typeof customerToEdit.phone === 'number') {
            originalPhonesForComparison = [customerToEdit.phone.toString()].sort();
        }


        setOriginalCustomerData({
          name: customerToEdit.name || '',
          phone: originalPhonesForComparison, // Store as sorted array of strings
          city: customerToEdit.city || '',
          address: customerToEdit.address || '',
          gender: customerToEdit.gender || 'male',
          country: customerToEdit.country || 'اليمن',
          user_id: customerToEdit.user_id || '', // Use user_id for comparison
        });
      } else {
        // Add mode
        setIsEditMode(false);
        setName('');
        setPhoneNumbers(['']); // Reset to empty string array
        setCity('');
        setAddress('');
        setGender('male');
        setCountry('اليمن');
        setRepresentativeId(''); 
        setOriginalCustomerData(null); 
      }
    } else {
      setIsVisible(false);
      // Reset all states after modal fully closes
      setTimeout(() => {
        setName('');
        setPhoneNumbers(['']); // Reset to empty string array
        setCity('');
        setAddress('');
        setGender('male');
        setCountry('اليمن');
        setRepresentativeId(''); 
        setErrors({});
        setIsLoading(false);
        setIsEditMode(false);
        setOriginalCustomerData(null);
      }, 100);
    }
  }, [show, customerToEdit]);

  // Handle phone number input changes
  const handlePhoneNumberChange = (index, value) => {
    const newPhoneNumbers = [...phoneNumbers];
    newPhoneNumbers[index] = value;
    setPhoneNumbers(newPhoneNumbers);
  };

  // Add a new phone number field
  const handleAddPhoneNumberField = () => {
    if (phoneNumbers.length < 5) { // Limit to 5 phone numbers
      setPhoneNumbers([...phoneNumbers, '']);
    } else {
      toast.info('لا يمكنك إضافة أكثر من 5 أرقام جوال.');
    }
  };

  // Remove a phone number field
  const handleRemovePhoneNumberField = (indexToRemove) => {
    if (phoneNumbers.length > 1) { // Ensure at least one field remains
      setPhoneNumbers(phoneNumbers.filter((_, index) => index !== indexToRemove));
    } else {
      toast.warn('يجب أن يكون هناك رقم جوال واحد على الأقل.');
      setPhoneNumbers(['']); // Ensure it's not completely empty
    }
  };

  // Handle modal close with animation
  const handleClose = (isSuccess = false) => {
    setIsVisible(false);
    setTimeout(() => {
      onClose(isSuccess); 
    }, 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    let currentErrors = {};

    // Validate fields
    if (!name.trim()) {
      currentErrors.name = 'الاسم مطلوب.';
    }

    const filteredPhoneNumbers = phoneNumbers.filter(p => p.trim() !== '');
    if (filteredPhoneNumbers.length === 0) {
      currentErrors.phoneNumbers = 'رقم جوال واحد على الأقل مطلوب.';
    } else {
      filteredPhoneNumbers.forEach((phone, index) => {
        // Find the original index to link error correctly
        const originalIndex = phoneNumbers.findIndex(p => p === phone);
        if (originalIndex !== -1 && !/^[7][0-9]{8}$/.test(phone)) {
          currentErrors[`phoneNumber_${originalIndex}`] = 'رقم الجوال يجب أن يكون 9 أرقام ويبدأ بـ 7.';
        }
      });
    }
    if (!city.trim()) {
      currentErrors.city = 'المدينة مطلوبة.';
    }
    if (!address.trim()) {
      currentErrors.address = 'العنوان مطلوب.';
    }
    if (!representativeId) { 
      currentErrors.user_id = 'يجب اختيار مندوب.'; // Error for user_id
    }

    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      toast.error('يرجى تصحيح الأخطاء في النموذج.');
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول أولاً.');
        setIsLoading(false);
        return;
      }

      // Prepare phone numbers as array of objects for payload (for both add and update if phones changed)
      const phonesPayload = filteredPhoneNumbers.map(p => ({ phone: parseInt(p, 10) }));

      let response;
      if (isEditMode && customerToEdit) {
        // Prepare the FULL payload for PUT request
        const fullPayload = {
          name: name.trim(),
          phones: phonesPayload, 
          city: city.trim(),
          address: address.trim(),
          gender: gender,
          country: country.trim(),
          user_id: parseInt(representativeId, 10), 
        };

        let hasChanges = false;

        // Compare each field to determine if there are changes
        if (originalCustomerData && fullPayload.name !== originalCustomerData.name) {
          hasChanges = true;
        }

        // Deep comparison for phone numbers (transform to comparable structure and sort)
        const currentPhoneNumbersForComparison = filteredPhoneNumbers.map(p => p.trim()).sort();
        // Check if originalCustomerData exists before accessing its properties
        const originalPhoneNumbersForComparison = originalCustomerData ? originalCustomerData.phone : []; 
        
        // Convert originalPhoneNumbersForComparison (which is already a sorted array of strings)
        // to a new array by mapping each element to `p.trim()`
        // This makes sure both arrays are processed identically before comparison.
        const originalPhonesTrimmedAndSorted = originalPhoneNumbersForComparison.map(p => p.trim()).sort();

        if (JSON.stringify(currentPhoneNumbersForComparison) !== JSON.stringify(originalPhonesTrimmedAndSorted)) {
          hasChanges = true;
        }


        if (originalCustomerData && fullPayload.city !== originalCustomerData.city) {
          hasChanges = true;
        }
        if (originalCustomerData && fullPayload.address !== originalCustomerData.address) {
          hasChanges = true;
        }
        if (originalCustomerData && fullPayload.gender !== originalCustomerData.gender) {
          hasChanges = true;
        }
        if (originalCustomerData && fullPayload.country !== originalCustomerData.country) {
          hasChanges = true;
        }
        if (originalCustomerData && fullPayload.user_id !== originalCustomerData.user_id) {
          hasChanges = true;
        }

        if (!hasChanges) {
          toast.info('لم يتم إجراء أي تغييرات للحفظ.');
          handleClose(true); 
          return;
        }
        
        console.log("Update Customer Payload (full payload):", fullPayload);
        response = await put(`admin/customers/${customerToEdit.slug}`, fullPayload, token); // Send full payload
      } else {
        // For add mode, send the full payload
        const payload = {
          name: name.trim(),
          phones: phonesPayload, 
          city: city.trim(),
          address: address.trim(),
          gender: gender,
          country: country.trim(),
          user_id: parseInt(representativeId, 10), 
        };
        console.log("Add Customer Payload:", payload);
        response = await post('admin/customers', payload, token);
      }

      if (response.status) {
        toast.success(isEditMode ? 'تم تحديث العميل بنجاح!' : 'تم إضافة العميل بنجاح!');
        handleClose(true);
      } else {
        const apiErrorMessage = response.message || 'فشل العملية.';
        setErrors({ general: apiErrorMessage });
        toast.error(apiErrorMessage);
      }
    } catch (err) {
      console.error("Error submitting customer data:", err);
      const errorMessage = err.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
      
      if (err.status === 422 && err.errors) { 
        const backendErrors = err.errors; 
        let newErrors = {};
        for (const field in backendErrors) {
          if (field === 'name') newErrors.name = backendErrors[field][0];
          // Handle 'phones' array validation errors
          if (field === 'phones' || field.startsWith('phones.')) {
            newErrors.phoneNumbers = backendErrors[field][0]; // General message for phone array
            const match = field.match(/phones\.(\d+)\.phone/); // Match for specific phone field error
            if (match) {
              const index = parseInt(match[1], 10);
              newErrors[`phoneNumber_${index}`] = backendErrors[field][0];
            }
          }
          if (field === 'city') newErrors.city = backendErrors[field][0];
          if (field === 'address') newErrors.address = backendErrors[field][0];
          if (field === 'gender') newErrors.gender = backendErrors[field][0];
          if (field === 'country') newErrors.country = backendErrors[field][0];
          if (field === 'user_id') newErrors.user_id = backendErrors[field][0]; // Error for user_id
        }
        setErrors(newErrors);
        toast.error('يرجى تصحيح الأخطاء في النموذج (من الواجهة الخلفية).');
      } else {
        setErrors({ general: errorMessage });
        toast.error(errorMessage);
        handleClose(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const genderOptions = [
    { value: 'male', label: 'ذكر' },
    { value: 'female', label: 'أنثى' },
  ];

  return (
    <ModalWrapper
      show={show}
      onClose={handleClose}
      isVisible={isVisible}
      title={isEditMode ? `تعديل العميل: ${customerToEdit?.name || ''}` : "إضافة عميل جديد"}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 text-right max-h-[calc(100vh-120px)] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInputField
            label="الاسم الكامل"
            type="text"
            placeholder="أدخل الاسم الكامل"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <FormInputField
            label="المدينة"
            type="text"
            placeholder="أدخل المدينة"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={errors.city}
          />
        </div>

        {/* Phone Numbers Section */}
        <div className="flex flex-col gap-2 border border-gray-700 p-3 rounded-lg">
          <label className="block text-white text-lg font-bold mb-1">أرقام الجوال:</label>
          {/* Scrollable container for phone numbers */}
          <div className="max-h-24 overflow-y-auto pr-2"> 
            {phoneNumbers.map((phone, index) => (
              <div key={index} className="flex items-center gap-2 mb-2"> 
                {/* Direct input for better control over layout */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="مثال: 77xxxxxxx"
                    value={phone}
                    onChange={(e) => handlePhoneNumberChange(index, e.target.value)}
                    className={`w-full p-2 rounded bg-gray-800 border ${errors[`phoneNumber_${index}`] ? 'border-red-500' : 'border-gray-600'}`}
                  />
                  {errors[`phoneNumber_${index}`] && (
                    <p className="text-red-500 text-xs mt-1">{errors[`phoneNumber_${index}`]}</p>
                  )}
                </div>
                {phoneNumbers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePhoneNumberField(index)}
                    className="bg-red-500 hover:bg-red-600 p-2 rounded-full flex-shrink-0"
                    title="إزالة رقم الجوال"
                  >
                    <XMarkIcon className="w-4 h-4 text-white" /> 
                  </button>
                )}
              </div>
            ))}
            {errors.phoneNumbers && <p className="text-red-500 text-xs mt-1 text-center">{errors.phoneNumbers}</p>}
          </div> {/* End of scrollable div */}

          <button
            type="button"
            onClick={handleAddPhoneNumberField}
            className="bg-green-500 hover:bg-green-600 py-2 px-3 rounded flex items-center justify-center gap-1 mt-1"
          >
            <PlusIcon className="w-4 h-4 text-white" /> 
            <span>إضافة رقم جوال آخر</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInputField
            label="العنوان"
            type="text"
            placeholder="أدخل العنوان"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            error={errors.address}
          />
          <FormSelectField
            label="الجنس"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={genderOptions}
            error={errors.gender}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
   <SearchableSelectFieldV2
  label="تابع للمندوب"
  value={representativeId}
  onChange={(val) => setRepresentativeId(val)}
  options={representatives}
  placeholder="اختر مندوب..."
  error={errors.user_id}
/>



          <FormInputField
            label="الدولة"
            type="text"
            placeholder="أدخل الدولة"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            error={errors.country}
          />
        </div>

        {errors.general && <p className="text-red-500 text-xs mt-1 text-center">{errors.general}</p>}

        <div className="flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => handleClose(false)}
            className="bg-gray-600 hover:bg-gray-700 py-2 px-4 rounded"
            disabled={isLoading}
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="accentColor hover:bg-purple-700 py-2 px-4 rounded"
            disabled={isLoading}
          >
            {isLoading ? (isEditMode ? 'جاري حفظ التعديل...' : 'جاري الإضافة...') : (isEditMode ? 'حفظ التعديل' : 'إضافة عميل')}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
