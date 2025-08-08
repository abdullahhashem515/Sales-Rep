// src/services/validationService.js

/**
 * دالة شاملة للتحقق من صحة نموذج إضافة المستخدم.
 * @param {object} formData - كائن يحتوي على جميع بيانات النموذج.
 * @returns {object} - كائن يحتوي على رسائل الخطأ، أو يكون فارغًا إذا لم توجد أخطاء.
 */
export const validateAddUserForm = (formData) => {
  const errors = {};

  // Validation: Full Name not empty
  if (!formData.fullName.trim()) {
    errors.fullName = 'الاسم الكامل مطلوب.';
  }

  // Validation: Phone Number (9 digits, starts with 7)
  if (!formData.phoneNumber.trim()) {
    errors.phoneNumber = 'رقم الجوال مطلوب.';
  } else if (!/^[7][0-9]{8}$/.test(formData.phoneNumber)) {
    errors.phoneNumber = 'رقم الجوال يجب أن يكون 9 أرقام ويبدأ بـ 7.';
  }

  // Validation: Email format
  if (!formData.email.trim()) {
    errors.email = 'البريد الإلكتروني مطلوب.';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'صيغة البريد الإلكتروني غير صحيحة.';
  }

  // Validation: Role specific for this API
  if (formData.role === 'مدير') {
    errors.role = 'لا يمكن تسجيل "مدير" عبر هذا النموذج. يرجى اختيار دور آخر.';
  } else if (formData.role !== 'مندوب جملة' && formData.role !== 'مندوب التجزئة') {
    errors.role = 'الدور غير صالح.';
  }

  // Validation: Password not empty and minimum length
  if (!formData.password.trim()) {
    errors.password = 'كلمة المرور مطلوبة.';
  } else if (formData.password.length < 8) { // Assuming minimum password length is 8 characters
    errors.password = 'كلمة المرور يجب أن لا تقل عن 8 أحرف.';
  }

  // Validation: Confirm Password not empty and matches password
  if (!formData.confirmPassword.trim()) {
    errors.confirmPassword = 'تأكيد كلمة المرور مطلوب.';
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'كلمة المرور وتأكيدها غير متطابقتين.';
  }

  return errors;
};

// يمكنك إضافة دوال تحقق أخرى (مثل validateLoginForm, validateProductForm, etc.) هنا
