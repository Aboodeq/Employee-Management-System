import { useEffect, useMemo, useState } from "react";
import { getDepartments, getJobTitles } from "../api/employeeApi";

export default function EmployeeOrganizationFields({ errors, form, setErrors, setForm, t }) {
  const [departments, setDepartments] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Promise.all([getDepartments({ activeOnly: true }), getJobTitles({ activeOnly: true })])
      .then(([departmentRes, jobTitleRes]) => {
        if (!isMounted) return;
        setDepartments(departmentRes.success ? departmentRes.data || [] : []);
        setJobTitles(jobTitleRes.success ? jobTitleRes.data || [] : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setDepartments([]);
        setJobTitles([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const availableJobTitles = useMemo(
    () => jobTitles.filter((item) => String(item.department_id) === String(form.department_id)),
    [form.department_id, jobTitles],
  );

  const fieldError = (name) => {
    const error = errors[name];
    return Array.isArray(error) ? error[0] : error;
  };

  const handleDepartmentChange = (value) => {
    setForm((current) => ({
      ...current,
      department_id: value,
      job_title_id: "",
      position: "",
    }));
    setErrors((current) => ({ ...current, department_id: null, job_title_id: null }));
  };

  const handleJobTitleChange = (value) => {
    const selected = jobTitles.find((item) => String(item.id) === String(value));
    setForm((current) => ({
      ...current,
      job_title_id: value,
      position: selected?.name || "",
    }));
    setErrors((current) => ({ ...current, job_title_id: null, position: null }));
  };

  return (
    <>
      <div style={s.field}>
        <label style={s.label}>{t("form.fields.department")}</label>
        <select
          className={`form-input employee-form-input${fieldError("department_id") ? " error" : ""}`}
          style={s.input}
          name="department_id"
          value={form.department_id}
          onChange={(event) => handleDepartmentChange(event.target.value)}
          disabled={loading}
          required
        >
          <option value="">{loading ? t("common.loading") : t("organization.selectDepartment")}</option>
          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
        {fieldError("department_id") && <span style={s.errorMsg}>{fieldError("department_id")}</span>}
      </div>

      <div style={s.field}>
        <label style={s.label}>{t("form.fields.jobTitle")}</label>
        <select
          className={`form-input employee-form-input${fieldError("job_title_id") ? " error" : ""}`}
          style={s.input}
          name="job_title_id"
          value={form.job_title_id}
          onChange={(event) => handleJobTitleChange(event.target.value)}
          disabled={loading || !form.department_id}
          required
        >
          <option value="">
            {!form.department_id ? t("organization.selectDepartmentFirst") : t("organization.selectJobTitle")}
          </option>
          {availableJobTitles.map((jobTitle) => (
            <option key={jobTitle.id} value={jobTitle.id}>
              {jobTitle.name}
            </option>
          ))}
        </select>
        {fieldError("job_title_id") && <span style={s.errorMsg}>{fieldError("job_title_id")}</span>}
      </div>
    </>
  );
}

const s = {
  field: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", fontWeight: "700", color: "#374151" },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "11px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    outline: "none",
    textAlign: "right",
    direction: "rtl",
    background: "#f8fafc",
    color: "#0f172a",
    transition: "all 0.2s",
    fontFamily: "'Cairo', sans-serif",
    fontWeight: "500",
  },
  errorMsg: { fontSize: "12px", color: "#dc2626", fontWeight: "600" },
};
