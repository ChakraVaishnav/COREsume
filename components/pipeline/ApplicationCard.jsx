"use client";

const PRIORITY_STYLES = {
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low",
};

export default function ApplicationCard({ application, provided, isDragging, onClick }) {
  const initial = application.companyName?.charAt(0)?.toUpperCase() || "?";
  const appDate = new Date(application.applicationDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const updatedDate = new Date(application.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const priorityClass = application.priority ? PRIORITY_STYLES[application.priority.toLowerCase()] || "" : "";

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`pipeline-card ${priorityClass} ${isDragging ? "pipeline-card-dragging" : ""}`}
      onClick={() => onClick && onClick(application)}
      style={{ 
        ...provided.draggableProps.style,
        cursor: "pointer", 
        border: "1px solid #000", 
        background: "#fff" 
      }}
    >
      <div className="pipeline-card-company">
        <div className="pipeline-card-logo" style={{ background: "#facc15", color: "#000", fontWeight: "700" }}>
          {application.companyLogo ? (
            <img src={application.companyLogo} alt={application.companyName} />
          ) : (
            initial
          )}
        </div>
        <div className="pipeline-card-company-info">
          <div className="pipeline-card-company-name" style={{ color: "#000" }}>{application.companyName}</div>
          <div className="pipeline-card-role" style={{ color: "#374151" }}>{application.role}</div>
        </div>
      </div>

      <div className="pipeline-card-meta">
        {application.salary && (
          <span className="pipeline-card-chip" style={{ background: "#f9fafb", color: "#000", border: "1px solid #e5e7eb" }}>
            {application.salary}
          </span>
        )}
        {application.priority && (
          <span
            className="pipeline-card-chip"
            style={{
              background: "#000",
              color: "#fff",
            }}
          >
            {application.priority.charAt(0).toUpperCase() + application.priority.slice(1)}
          </span>
        )}
      </div>

      <div className="pipeline-card-footer">
        <span className="pipeline-card-date" style={{ color: "#6b7280" }}>Applied {appDate}</span>
        <span className="pipeline-card-date" style={{ color: "#6b7280" }}>Updated {updatedDate}</span>
      </div>
    </div>
  );
}
