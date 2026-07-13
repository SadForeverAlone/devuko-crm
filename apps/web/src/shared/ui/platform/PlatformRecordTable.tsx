import { useId, useState, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export type PlatformRecordColumn<T> = {
  id: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
  align?: "start" | "end" | "center";
  mono?: boolean;
  muted?: boolean;
  truncate?: boolean;
};

export type PlatformRecordGroup<T> = {
  id: string;
  title: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  rows: T[];
};

type PlatformRecordTableProps<T> = {
  rows?: T[];
  groups?: PlatformRecordGroup<T>[];
  columns: PlatformRecordColumn<T>[];
  rowKey: (row: T) => string;
  template: string;
  defaultExpanded?: boolean;
};

function RecordRows<T>({
  rows,
  columns,
  rowKey,
  nested = false,
}: {
  rows: T[];
  columns: PlatformRecordColumn<T>[];
  rowKey: (row: T) => string;
  nested?: boolean;
}) {
  return (
    <ul className={`crm-platform-records__list${nested ? " crm-platform-records__list--nested" : ""}`}>
      {rows.map((row) => (
        <li key={rowKey(row)} className="crm-platform-record">
          {columns.map((column) => (
            <div
              key={column.id}
              data-label={typeof column.header === "string" ? column.header : column.id}
              className={[
                "crm-platform-record__cell",
                column.mono ? "crm-platform-record__cell--mono" : "",
                column.muted ? "crm-platform-record__cell--muted" : "",
                column.truncate ? "crm-platform-record__cell--truncate" : "",
                column.align === "end" ? "crm-platform-record__cell--end" : "",
                column.align === "center" ? "crm-platform-record__cell--center" : "",
                column.className ?? "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {column.render(row)}
            </div>
          ))}
        </li>
      ))}
    </ul>
  );
}

function RecordGroup<T>({
  group,
  columns,
  rowKey,
  defaultExpanded,
}: {
  group: PlatformRecordGroup<T>;
  columns: PlatformRecordColumn<T>[];
  rowKey: (row: T) => string;
  defaultExpanded: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const panelId = useId();

  return (
    <section
      className={`crm-platform-record-group${expanded ? " crm-platform-record-group--expanded" : " crm-platform-record-group--collapsed"}`}
    >
      <header className="crm-platform-record-group__head">
        <button
          type="button"
          className="crm-platform-record-group__toggle"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((value) => !value)}
        >
          <span className="crm-platform-record-group__chevron" aria-hidden>
            <FontAwesomeIcon icon={faChevronDown} />
          </span>
          <span className="crm-platform-record-group__lead">
            <span className="crm-platform-record-group__title">{group.title}</span>
            {group.meta ? <span className="crm-platform-record-group__meta">{group.meta}</span> : null}
          </span>
        </button>
        <span className="crm-platform-record-group__count" aria-hidden>
          {group.rows.length}
        </span>
        {group.action ? <div className="crm-platform-record-group__action">{group.action}</div> : null}
      </header>
      <div
        id={panelId}
        className="crm-platform-record-group__body"
        aria-hidden={!expanded}
        {...(!expanded ? { inert: true } : {})}
      >
        <div className="crm-platform-record-group__body-inner">
          <RecordRows rows={group.rows} columns={columns} rowKey={rowKey} nested />
        </div>
      </div>
    </section>
  );
}

export function PlatformRecordTable<T>({
  rows,
  groups,
  columns,
  rowKey,
  template,
  defaultExpanded = false,
}: PlatformRecordTableProps<T>) {
  const style = { "--crm-records-template": template } as React.CSSProperties;
  const grouped = (groups ?? []).length > 0;
  const flatRows = grouped ? [] : (rows ?? []);

  return (
    <div
      className={`crm-platform-records${grouped ? " crm-platform-records--grouped" : ""}`}
      style={style}
    >
      <div className="crm-platform-records__head" aria-hidden>
        {columns.map((column) => (
          <span
            key={column.id}
            className={[
              "crm-platform-records__label",
              column.align === "end" ? "crm-platform-records__label--end" : "",
              column.align === "center" ? "crm-platform-records__label--center" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {column.header}
          </span>
        ))}
      </div>

      {grouped ? (
        <div className="crm-platform-record-groups">
          {groups!.map((group) => (
            <RecordGroup
              key={group.id}
              group={group}
              columns={columns}
              rowKey={rowKey}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </div>
      ) : (
        <RecordRows rows={flatRows} columns={columns} rowKey={rowKey} />
      )}
    </div>
  );
}
