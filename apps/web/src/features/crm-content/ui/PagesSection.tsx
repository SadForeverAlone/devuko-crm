import { useEffect, useMemo, useState } from "react";
import { faFileLines } from "@fortawesome/free-solid-svg-icons";
import { EmptyState, PlatformPage } from "@/shared/ui/platform";
import { crmCopy } from "@/widgets/crm-app/model/i18n";
import type { PagesSectionProps } from "@/shared/crm/ui/sectionTypes";
import { CrmTablePagination, formatCrmPaginationRange } from "@/shared/crm/ui/CrmTablePagination";

const PAGE_SIZE = 12;

export function PagesSection({ crmLang, pages }: PagesSectionProps) {
  const ui = crmCopy[crmLang];
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"views" | "unique" | "page">("views");
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const totalViews = pages.reduce((sum, item) => sum + item.views, 0);
    const totalUnique = pages.reduce((sum, item) => sum + item.uniqueUsers, 0);
    const topPage = [...pages].sort((left, right) => right.views - left.views)[0];
    return { totalViews, totalUnique, topPage };
  }, [pages]);

  const visiblePages = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = pages.filter((item) =>
      query ? item.page.toLowerCase().includes(query) : true
    );
    return [...filtered].sort((left, right) => {
      if (sortBy === "page") {
        return left.page.localeCompare(right.page, crmLang === "ru" ? "ru" : "en");
      }
      if (sortBy === "unique") {
        return right.uniqueUsers - left.uniqueUsers;
      }
      return right.views - left.views;
    });
  }, [pages, search, sortBy, crmLang]);

  const pageCount = Math.max(1, Math.ceil(visiblePages.length / PAGE_SIZE));

  const paginatedPages = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return visiblePages.slice(start, start + PAGE_SIZE);
  }, [visiblePages, page]);

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, pages]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  return (
    <PlatformPage
      title={ui.pagesTitle}
      subtitle={`${ui.pagesSubtitle} · ${pages.length}`}
    >
      <div className="crm-stat-row crm-stat-row--platform">
        <article className="crm-stat-card crm-panel crm-panel--static">
          <p className="crm-stat-card__label">{ui.pagesStatViews}</p>
          <h3>{stats.totalViews.toLocaleString(crmLang === "ru" ? "ru-RU" : "en-US")}</h3>
        </article>
        <article className="crm-stat-card crm-panel crm-panel--static">
          <p className="crm-stat-card__label">{ui.pagesStatUnique}</p>
          <h3>{stats.totalUnique.toLocaleString(crmLang === "ru" ? "ru-RU" : "en-US")}</h3>
        </article>
        <article className="crm-stat-card crm-panel crm-panel--static crm-stat-card--accent">
          <p className="crm-stat-card__label">{ui.pagesStatTop}</p>
          <h3 className="crm-stat-card__path">{stats.topPage?.page ?? "—"}</h3>
          {stats.topPage ? (
            <b className="crm-stat-card__value">
              {stats.topPage.views.toLocaleString(crmLang === "ru" ? "ru-RU" : "en-US")}{" "}
              {ui.pagesColViews.toLowerCase()}
            </b>
          ) : null}
        </article>
      </div>

      <article className="crm-panel crm-table-card">
        <div className="crm-chip-row crm-chip-row--filters">
          <input
            className="spx-input crm-input crm-chip-search"
            placeholder={ui.pagesSearchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <button
            type="button"
            className={sortBy === "views" ? "crm-chip crm-chip--active" : "crm-chip"}
            onClick={() => setSortBy("views")}
          >
            {ui.pagesColViews}
          </button>
          <button
            type="button"
            className={sortBy === "unique" ? "crm-chip crm-chip--active" : "crm-chip"}
            onClick={() => setSortBy("unique")}
          >
            {ui.pagesColUnique}
          </button>
          <button
            type="button"
            className={sortBy === "page" ? "crm-chip crm-chip--active" : "crm-chip"}
            onClick={() => setSortBy("page")}
          >
            {ui.pagesColPage}
          </button>
        </div>

        {visiblePages.length === 0 ? (
          <EmptyState icon={faFileLines} title={ui.pagesEmpty} description={ui.pagesEmptyHint} />
        ) : (
          <>
            <div className="crm-table-wrap">
              <table className="crm-data-table">
                <thead>
                  <tr>
                    <th>{ui.pagesColHash}</th>
                    <th>{ui.pagesColPage}</th>
                    <th>{ui.pagesColViews}</th>
                    <th>{ui.pagesColUnique}</th>
                    <th>{ui.pagesColConversion}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPages.map((item, index) => (
                    <tr key={item.id}>
                      <td>{(page - 1) * PAGE_SIZE + index + 1}</td>
                      <td className="crm-data-table__cell--mono">{item.page}</td>
                      <td>{item.views.toLocaleString(crmLang === "ru" ? "ru-RU" : "en-US")}</td>
                      <td>{item.uniqueUsers.toLocaleString(crmLang === "ru" ? "ru-RU" : "en-US")}</td>
                      <td>{item.conversion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CrmTablePagination
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
              summary={formatCrmPaginationRange(page, PAGE_SIZE, visiblePages.length, crmLang)}
              prevLabel={ui.paginationPrev}
              nextLabel={ui.paginationNext}
            />
          </>
        )}
      </article>
    </PlatformPage>
  );
}
