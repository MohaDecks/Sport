const statusColors = {
  Upcoming: 'badge-info',
  Live: 'badge-danger',
  Finished: 'badge-success',
  Ongoing: 'badge-warning',
  Completed: 'badge-success',
  Cancelled: 'badge-danger',
  Minor: 'badge-warning',
  Serious: 'badge-danger',
  Recovered: 'badge-success',
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${statusColors[status] || 'badge-info'}`}>{status}</span>;
}
