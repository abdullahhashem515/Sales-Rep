import React, { useEffect, useState } from "react";

export default function ConfirmDeleteModal({
  show,
  onClose,
  onConfirm,
  loading = false, // استقبال حالة الحذف
  title = "تأكيد الحذف",
  message = "هل أنت متأكد من أنك تريد تنفيذ هذه العملية؟",
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) setIsVisible(true);
    else setIsVisible(false);
  }, [show]);

  const handleClose = () => {
    if (loading) return; // منع الإغلاق أثناء الحذف
    setIsVisible(false);
    setTimeout(() => onClose(), 100);
  };

  const handleConfirm = async () => {
    if (loading) return; // منع الضغط المتكرر
    await onConfirm(); // انتظار تنفيذ عملية الحذف
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
            disabled={loading}
          >
            إلغاء
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                جاري الحذف...
              </>
            ) : (
              "تأكيد"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
