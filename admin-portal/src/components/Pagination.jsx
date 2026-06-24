export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, hasPrev, hasNext } = pagination;

  return (
    <div className="pagination">
      <button disabled={!hasPrev} onClick={() => onPageChange(page - 1)}>Previous</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
        .map((p, idx, arr) => (
          <span key={p}>
            {idx > 0 && arr[idx - 1] !== p - 1 && <span>...</span>}
            <button className={p === page ? 'active' : ''} onClick={() => onPageChange(p)}>{p}</button>
          </span>
        ))}
      <button disabled={!hasNext} onClick={() => onPageChange(page + 1)}>Next</button>
    </div>
  );
}
