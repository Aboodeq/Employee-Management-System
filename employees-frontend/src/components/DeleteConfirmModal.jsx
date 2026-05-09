export default function DeleteConfirmModal({
  open,
  employeeName,
  loading = false,
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return (
    <div
      style={s.overlay}
      role="presentation"
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <style>{`
        @keyframes confirmPop { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes confirmSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div
        style={s.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div style={s.iconWrap}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <polyline
              points="3 6 5 6 21 6"
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M10 11v6M14 11v6"
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h2 id="delete-confirm-title" style={s.title}>
          تأكيد حذف الموظف
        </h2>
        <p style={s.text}>سيتم حذف بيانات الموظف نهائياً من قاعدة البيانات.</p>
        <div style={s.nameBox}>{employeeName || "هذا الموظف"}</div>

        <div style={s.actions}>
          <button type="button" style={s.cancelBtn} onClick={onCancel} disabled={loading}>
            إلغاء
          </button>
          <button type="button" style={s.deleteBtn} onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <span style={s.spinner} />
                جاري الحذف...
              </>
            ) : (
              "نعم، حذف"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 998,
    background: "rgba(15, 23, 42, 0.45)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px",
    direction: "rtl",
    fontFamily: "'Cairo', sans-serif",
  },
  modal: {
    width: "100%",
    maxWidth: "420px",
    background: "#fff",
    borderRadius: "18px",
    border: "1px solid #fee2e2",
    padding: "28px",
    boxShadow: "0 24px 70px rgba(15,23,42,0.22)",
    animation: "confirmPop 0.2s ease both",
    textAlign: "center",
  },
  iconWrap: {
    width: "64px",
    height: "64px",
    borderRadius: "18px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  title: {
    color: "#0f172a",
    fontSize: "20px",
    fontWeight: "800",
    margin: 0,
  },
  text: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
    lineHeight: 1.8,
    margin: "10px 0 14px",
  },
  nameBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "800",
    padding: "11px 14px",
    wordBreak: "break-word",
  },
  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "22px",
  },
  cancelBtn: {
    height: "46px",
    borderRadius: "12px",
    border: "1.5px solid #e2e8f0",
    background: "#fff",
    color: "#475569",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
  },
  deleteBtn: {
    height: "46px",
    borderRadius: "12px",
    border: "none",
    background: "#dc2626",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "800",
    cursor: "pointer",
    fontFamily: "'Cairo', sans-serif",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 10px 24px rgba(220,38,38,0.25)",
  },
  spinner: {
    width: "15px",
    height: "15px",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "confirmSpin 0.75s linear infinite",
  },
};
