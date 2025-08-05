import React, { useEffect, useState } from "react";

export default function ConfirmDeleteModal({
  show,
  onClose,
  onConfirm,
  title = "تأكيد الحذف",
  message = "هل أنت متأكد من أنك تريد تنفيذ هذه العملية؟",
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
    }
  }, [show]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 100); // مدة الأنميشن
  };

  if (!show) return null;

  return (
    <div className="amiriFont fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50">
      <div
        className={`bg-gray-900 text-white p-6 rounded-lg w-full max-w-md transition-all transform duration-300 flex flex-col items-center text-center ${
          isVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="mb-6 text-sm">{message}</p>

        <div className="flex justify-center gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white"
          >
            إلغاء
          </button>
          <button
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
}
