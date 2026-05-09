const phoneRegex = /^09\d{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[\p{L}\s'.-]+$/u;
const positionRegex = /^[\p{L}\p{N}\s&+.,#/()-]+$/u;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const earliestHireDate = "1990-01-01";

export const normalizePhone = (value) => value.replace(/\D/g, "").slice(0, 10);

export const todayDateInputValue = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

export const validateEmployeeForm = (form) => {
  const errors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();
  const position = form.position.trim();
  const salary = Number(form.salary);
  const today = todayDateInputValue();

  if (!name) errors.name = "الاسم الكامل مطلوب";
  else if (name.length < 2) errors.name = "الاسم يجب أن يحتوي على حرفين على الأقل";
  else if (name.length > 120) errors.name = "الاسم يجب ألا يتجاوز 120 حرفاً";
  else if (!nameRegex.test(name)) errors.name = "الاسم يجب أن يحتوي على أحرف ومسافات فقط";

  if (!email) errors.email = "البريد الإلكتروني مطلوب";
  else if (!emailRegex.test(email)) errors.email = "صيغة البريد الإلكتروني غير صحيحة";
  else if (email.length > 255) errors.email = "البريد الإلكتروني طويل جداً";

  if (!phone) errors.phone = "رقم الهاتف مطلوب";
  else if (!phoneRegex.test(phone)) errors.phone = "رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام فقط";

  if (!position) errors.position = "المسمى الوظيفي مطلوب";
  else if (position.length < 2) errors.position = "المسمى الوظيفي قصير جداً";
  else if (position.length > 120) errors.position = "المسمى الوظيفي يجب ألا يتجاوز 120 حرفاً";
  else if (!positionRegex.test(position)) errors.position = "المسمى الوظيفي يحتوي على رموز غير مسموحة";

  if (form.salary === "") errors.salary = "الراتب مطلوب";
  else if (!Number.isFinite(salary) || salary <= 0) errors.salary = "الراتب يجب أن يكون رقماً أكبر من صفر";
  else if (salary > 999999999.99) errors.salary = "الراتب كبير جداً";

  if (!form.hire_date) errors.hire_date = "تاريخ التعيين مطلوب";
  else if (form.hire_date < earliestHireDate) errors.hire_date = "تاريخ التعيين قديم جداً";
  else if (form.hire_date > today) errors.hire_date = "تاريخ التعيين لا يمكن أن يكون في المستقبل";

  if (form.image && !allowedImageTypes.includes(form.image.type)) {
    errors.image = "الصورة يجب أن تكون JPG أو PNG أو WEBP";
  } else if (form.image && form.image.size > 2 * 1024 * 1024) {
    errors.image = "حجم الصورة يجب ألا يتجاوز 2MB";
  }

  return errors;
};

export const firstEmployeeError = (errors) => {
  const first = Object.values(errors).find(Boolean);
  return Array.isArray(first) ? first[0] : first || "يرجى مراجعة البيانات المدخلة";
};
