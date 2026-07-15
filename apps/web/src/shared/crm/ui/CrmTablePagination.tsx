type CrmTablePaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  summary?: string;
  prevLabel?: string;
  nextLabel?: string;
};

function getVisiblePages(page: number, pageCount: number, maxVisible = 7): number[] {
  if (pageCount <= maxVisible) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const half = Math.floor(maxVisible / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(pageCount, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function CrmTablePagination({
  page,
  pageCount,
  onPageChange,
  summary,
  prevLabel = "Previous",
  nextLabel = "Next",
}: CrmTablePaginationProps) {
  if (pageCount <= 0) {
    return summary ? (
      <div className="crm-pagination crm-pagination--pages">
        <span className="crm-pagination__summary crm-muted">{summary}</span>
      </div>
    ) : null;
  }

  const visiblePages = getVisiblePages(page, pageCount);

  return (
    <div className="crm-pagination crm-pagination--pages">
      {summary ? <span className="crm-pagination__summary crm-muted">{summary}</span> : null}
      <div className="crm-pagination__controls">
        <button
          type="button"
          className="crm-chip"
          disabled={page <= 1}
          aria-label={prevLabel}
          onClick={() => onPageChange(page - 1)}
        >
          ‹
        </button>
        {visiblePages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={pageNumber === page ? "crm-chip crm-chip--active" : "crm-chip"}
            aria-label={`Page ${pageNumber}`}
            aria-current={pageNumber === page ? "page" : undefined}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          className="crm-chip"
          disabled={page >= pageCount}
          aria-label={nextLabel}
          onClick={() => onPageChange(page + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}

export function formatCrmPaginationRange(
  page: number,
  pageSize: number,
  total: number,
  crmLang: "ru" | "en",
): string {
  if (total === 0) {
    return crmLang === "ru" ? "0 записей" : "0 entries";
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  return crmLang === "ru" ? `${from}–${to} из ${total}` : `${from}–${to} of ${total}`;
}
