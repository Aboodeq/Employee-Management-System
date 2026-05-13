import { translate } from "../i18n/i18n";

const phoneRegex = /^09\d{8}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameRegex = /^[\p{L}\s'.-]+$/u;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const earliestHireDate = "1990-01-01";

export const normalizePhone = (value) => value.replace(/\D/g, "").slice(0, 10);

export const todayDateInputValue = () => {
  const today = new Date();
  const timezoneOffset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

export const validateEmployeeForm = (form, t = translate) => {
  const errors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();
  const salary = Number(form.salary);
  const today = todayDateInputValue();

  if (!name) errors.name = t("validation.nameRequired");
  else if (name.length < 2) errors.name = t("validation.nameMin");
  else if (name.length > 120) errors.name = t("validation.nameMax");
  else if (!nameRegex.test(name)) errors.name = t("validation.nameRegex");

  if (!email) errors.email = t("validation.emailRequired");
  else if (!emailRegex.test(email)) errors.email = t("validation.emailInvalid");
  else if (email.length > 255) errors.email = t("validation.emailMax");

  if (!phone) errors.phone = t("validation.phoneRequired");
  else if (!phoneRegex.test(phone)) errors.phone = t("validation.phoneInvalid");

  if (!form.department_id) errors.department_id = t("validation.departmentRequired");
  if (!form.job_title_id) errors.job_title_id = t("validation.jobTitleRequired");

  if (form.salary === "") errors.salary = t("validation.salaryRequired");
  else if (!Number.isFinite(salary) || salary <= 0) errors.salary = t("validation.salaryInvalid");
  else if (salary > 999999999.99) errors.salary = t("validation.salaryMax");

  if (!form.hire_date) errors.hire_date = t("validation.hireDateRequired");
  else if (form.hire_date < earliestHireDate) errors.hire_date = t("validation.hireDateOld");
  else if (form.hire_date > today) errors.hire_date = t("validation.hireDateFuture");

  if (form.image && !allowedImageTypes.includes(form.image.type)) {
    errors.image = t("validation.imageType");
  } else if (form.image && form.image.size > 2 * 1024 * 1024) {
    errors.image = t("validation.imageSize");
  }

  return errors;
};

export const firstEmployeeError = (errors, t = translate) => {
  const first = Object.values(errors).find(Boolean);
  return Array.isArray(first) ? first[0] : first || t("validation.reviewData");
};
