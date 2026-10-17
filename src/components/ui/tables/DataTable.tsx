import React from "react";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  rowClassName?: string | ((item: T, index: number) => string);
}

function DataTable<T extends { id?: string }>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No records found.",
  onRowClick,
  className = "",
  rowClassName = "",
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-xs ${className}`}>
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-sm text-gray-500">Loading records...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 shadow-xs ${className}`}>
        <div className="p-12 text-center">
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-full divide-y divide-gray-200 text-left">
          <thead>
            <tr className="bg-gray-50/80">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-600 ${
                    column.headerClassName || ""
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.map((item, index) => {
              const computedRowClassName =
                typeof rowClassName === "function"
                  ? rowClassName(item, index)
                  : rowClassName;

              return (
                <tr
                  key={item.id || index}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${computedRowClassName}`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-3.5 text-sm text-gray-700 whitespace-nowrap ${
                        column.className || ""
                      }`}
                    >
                      {column.render
                        ? column.render(item, index)
                        : (item as any)[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
