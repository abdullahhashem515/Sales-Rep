import React, { useEffect, useState } from "react";

export default function UpdateUserModel({ show, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  // State for form fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(''); // NEW: Email state
  const [role, setRole] = useState('مدير'); // Default role
  const [accountStatus, setAccountStatus] = useState('نشط'); // Default status

  // عند تغيير show من الخارج (props)
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      // Reset form fields when modal opens
      setFullName('');
      setPhoneNumber('');
      setEmail('');
      setRole('مدير');
      setAccountStatus('نشط');
    }
  }, [show]);

  // دالة إغلاق مع أنميشن
  const handleClose = () => {
    setIsVisible(false);
    // انتظر 300ms قبل إغلاق المودال نهائيًا
    setTimeout(() => {
      onClose();
    }, 100);
  };

  // Handle form submission (add your logic here later)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      fullName,
      phoneNumber,
      email,
      role,
      accountStatus,
    });
    // Add your API call or further processing here
    handleClose(); // Close modal after submission (for now)
  };

  // لا تعرض شيئًا إذا المودال لم يتم استدعاؤه بعد الإغلاق
  if (!show) return null;

  return (
    <div className="amiriFont fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div
        className={`bg-gray-900 text-white p-6 rounded-lg w-full max-w-2xl relative transform transition-all duration-300 ${ // Adjusted width for two columns
          isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-xl font-bold mb-4 text-right">تعديل بيانات مستخدم</h2>

        <button
          onClick={handleClose}
          className="absolute top-2 left-2 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-right">
          {/* Row 1: Full Name and Phone Number */}
          <div className="flex flex-col md:flex-row md:gap-4"> {/* Use flex-col for small screens, flex-row for medium+ */}
            <div className="flex-1 mb-3 md:mb-0"> {/* flex-1 makes it take equal width */}
              <label className="block mb-1">الاسم الكامل</label>
              <input
                type="text"
                placeholder="الاسم الكامل"
                className="w-full p-2 rounded bg-gray-800 border border-gray-600"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="flex-1">
              <label className="block mb-1">رقم الجوال</label>
              <input
                type="text"
                placeholder="رقم الجوال"
                className="w-full p-2 rounded bg-gray-800 border border-gray-600"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Row 2: Email and Role */}
          <div className="flex flex-col md:flex-row md:gap-4">
            <div className="flex-1 mb-3 md:mb-0">
              <label className="block mb-1">البريد الإلكتروني</label> {/* NEW: Email field */}
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className="w-full p-2 rounded bg-gray-800 border border-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1">الدور</label>
              <select
                className="w-full p-2 rounded bg-gray-800 border border-gray-600"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>مدير</option>
                <option>مندوب جملة</option>
                <option>مندوب التجزئة</option>
              </select>
            </div>
          </div>

          
          {/* Row 4: Account Status (single field in this row as per request) */}
          <div className="flex flex-col md:flex-row md:gap-4">
            <div className="flex-1">
              <label className="block mb-1">حالة الحساب</label>
              <select
                className="w-full p-2 rounded bg-gray-800 border border-gray-600"
                value={accountStatus}
                onChange={(e) => setAccountStatus(e.target.value)}
              >
                <option>نشط</option>
                <option>غير نشط</option>
              </select>
            </div>
            <div className="flex-1"></div> {/* Empty div to maintain two-column layout if needed, or remove if you want single column */}
          </div>

          <button
            type="submit"
            className="mt-4 accentColor hover:bg-purple-700 py-2 px-4 rounded"
          >
            حفظ التعديل
          </button>
        </form>
      </div>
    </div>
  );
}
