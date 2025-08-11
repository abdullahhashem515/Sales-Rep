// src/utils/validationService.js

/**
 * دالة شاملة للتحقق من صحة نموذج إضافة المستخدم.
 * @param {object} formData - كائن يحتوي على جميع بيانات النموذج (fullName, phoneNumber, email, role, password, confirmPassword, accountStatus).
 * @param {boolean} [isUpdate=false] - علامة تشير إذا كانت العملية تحديث (true) أو إضافة (false).
 * @param {string} [originalEmail=''] - البريد الإلكتروني الأصلي للمستخدم إذا كانت العملية تحديث.
 * @returns {object} - كائن يحتوي على رسائل الخطأ، أو يكون فارغًا إذا لم توجد أخطاء.
 */
export const validateAddUserForm = (formData, isUpdate = false, originalEmail = '') => {
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
    // NEW LOGIC FOR UPDATE SCENARIO
    if (isUpdate && (formData.email === originalEmail) && !originalEmail.trim()) {
      // If it's an update, and the email hasn't changed from its original (empty) state,
      // and the original email was empty, then don't require it.
      // This allows updating other fields for an admin with a previously empty email.
    } else if (typeof formData.email !== 'string' || !formData.email.trim()) {
      // Otherwise, if email is required for the role and it's empty/not a string, show error
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
  // These fields are typically not present in the UpdateUserModel's formData unless explicitly added.
  // We use optional chaining and check if the field was even provided.
  if (formData.password !== undefined) { // Only validate if password field exists in formData
    if (!formData.password?.trim()) {
      errors.password = 'كلمة المرور مطلوبة.';
    } else if (formData.password.length < 8) {
      errors.password = 'كلمة المرور يجب أن لا تقل عن 8 أحرف.';
    }
  }

  // Validation: Confirm Password not empty and matches password
  if (formData.confirmPassword !== undefined) { // Only validate if confirmPassword field exists in formData
    if (!formData.confirmPassword?.trim()) {
      errors.confirmPassword = 'تأكيد كلمة المرور مطلوب.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'كلمة المرور وتأكيدها غير متطابقتين.';
    }
  }

  return errors;
};
