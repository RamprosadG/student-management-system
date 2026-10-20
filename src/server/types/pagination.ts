export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const DEFAULT_PAGE_SIZE = 10;

export function parsePagination(
  searchParams: URLSearchParams,
  defaultPageSize: number = DEFAULT_PAGE_SIZE
): PaginationParams {
  const rawPage = Number(searchParams.get("page"));
  const rawPageSize = Number(searchParams.get("pageSize"));

  const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
  const pageSize =
    Number.isFinite(rawPageSize) && rawPageSize > 0
      ? Math.floor(rawPageSize)
      : defaultPageSize;

  return { page, pageSize };
}

export function buildPaginationMeta(
  page: number,
  pageSize: number,
  total: number
): PaginationMeta {
  const totalPages = pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  const safePage = Math.min(Math.max(1, page), totalPages);

  return {
    page: safePage,
    pageSize,
    total,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
}
