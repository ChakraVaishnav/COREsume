"use client";

export default function PipelineFilters({ search, onSearchChange, sortBy, onSortChange }) {
  return (
    <div className="pipeline-filters">
      <div className="pipeline-search">
        <svg
          className="pipeline-search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search by company or role..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        className="pipeline-filter-select"
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="updatedAt-desc">Last Updated ↓</option>
        <option value="updatedAt-asc">Last Updated ↑</option>
        <option value="applicationDate-desc">Date Applied ↓</option>
        <option value="applicationDate-asc">Date Applied ↑</option>
        <option value="createdAt-desc">Created ↓</option>
        <option value="createdAt-asc">Created ↑</option>
      </select>
    </div>
  );
}
