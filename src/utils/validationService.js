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

  // Validation: Email format - ONLY REQUIRED IF ROLE IS 'مدير'
  if (formData.role === 'مدير') {
    // NEW: Add a defensive check to ensure formData.email is a string before trimming
    // If it's not a string or if it's an empty string after trimming, mark as error
    if (typeof formData.email !== 'string' || !formData.email.trim()) {
      errors.email = 'البريد الإلكتروني مطلوب لدور المدير.';
    } else if (!/\S+@\S+\.\S/.test(formData.email)) {
      errors.email = 'صيغة البريد الإلكتروني غير صحيحة.';
    }
  }

  // Validation: Role specific for this API
  if (formData.role !== 'مدير' && formData.role !== 'مندوب جملة' && formData.role !== 'مندوب التجزئة') {
    errors.role = 'الدور غير صالح.';
  }

  // Validation: Password not empty and minimum length
  // Note: Passwords are not part of UpdateUserModel's form by default,
  // so these errors might only be relevant for AddUserModal.
  if (!formData.password?.trim()) { // Use optional chaining for safety if password might be undefined
    // Check if password field exists in formData (only for AddUserModal usually)
    if (formData.password !== undefined) { // Only show error if password field was expected
        errors.password = 'كلمة المرور مطلوبة.';
    }
  } else if (formData.password?.length < 8) {
    errors.password = 'كلمة المرور يجب أن لا تقل عن 8 أحرف.';
  }

  // Validation: Confirm Password not empty and matches password
  if (!formData.confirmPassword?.trim()) { // Use optional chaining for safety
    if (formData.confirmPassword !== undefined) { // Only show error if confirmPassword was expected
        errors.confirmPassword = 'تأكيد كلمة المرور مطلوب.';
    }
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'كلمة المرور وتأكيدها غير متطابقتين.';
  }

  return errors;
};
