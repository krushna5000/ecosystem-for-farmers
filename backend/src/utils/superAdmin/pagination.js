export const parsePagination = (query = {}) => ({
  page: parseInt(query.page) || 1,
  limit: parseInt(query.limit) || 10,
});

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
