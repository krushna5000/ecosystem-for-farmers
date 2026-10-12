import { z } from "zod";

// `parseInt(x) || fallback`, the pagination rule every list endpoint of this portal has always used.
const intOr = (fallback) => z.preprocess((v) => parseInt(v) || fallback, z.number().int());

// Shared `?page=&limit=` query schema (defaults 1 / 10); never rejects, like the legacy parsePagination.
export const paginationQuerySchema = z
  .object({
    page: intOr(1),
    limit: intOr(10),
  })
  .passthrough();

export const buildPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    currentPage: page,
    itemsPerPage: limit,
    totalItems: total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
