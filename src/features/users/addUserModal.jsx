import React, { useEffect, useState } from "react";

export default function AddUserModal({ show, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  // عند تغيير show من الخارج (props)
  useEffect(() => {
    if (show) {
      setIsVisible(true);
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

  // لا تعرض شيئًا إذا المودال لم يتم استدعاؤه بعد الإغلاق
  if (!show) return null;

  return (
    <div className="amiriFont fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div
        className={`bg-gray-900 text-white p-6 rounded-lg w-96 relative transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <h2 className="text-xl font-bold mb-4 text-right">إضافة مستخدم</h2>

        <button
          onClick={handleClose}
          className="absolute top-2 left-2 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <form className="flex flex-col gap-3 text-right">
          <div>
            <label className="block mb-1">الاسم الكامل</label>
            <input
              type="text"
              placeholder="الاسم الكامل"
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1">رقم الجوال</label>
            <input
              type="text"
              placeholder="رقم الجوال"
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1">الدور</label>
            <select className="w-full p-2 rounded bg-gray-800 border border-gray-600">
              <option>مدير</option>
              <option>مشرف</option>
              <option>موظف</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">كلمة المرور</label>
            <input
              type="password"
              placeholder="كلمة المرور"
              className="w-full p-2 rounded bg-gray-800 border border-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1">حالة الحساب</label>
            <select className="w-full p-2 rounded bg-gray-800 border border-gray-600">
              <option>نشط</option>
              <option>غير نشط</option>
            </select>
          </div>

          <button
            type="submit"
            className="mt-4 accentColor hover:bg-purple-700 py-2 px-4 rounded"
          >
            إنشاء المستخدم
          </button>
        </form>
      </div>
    </div>
  );
}
