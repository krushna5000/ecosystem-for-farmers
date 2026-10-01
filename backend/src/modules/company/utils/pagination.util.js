export const getPagination = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

export const getPaginationMeta = ({ page, limit, totalItems }) => {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    currentPage: page,
    limit,
    totalItems,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
