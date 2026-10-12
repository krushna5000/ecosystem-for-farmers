// Pagination maths for the company portal. The page/limit query values are parsed by
// `pageQuerySchema` (companyValidation.js) before they reach a service.
export const pageOffset = (page, limit) => (page - 1) * limit;

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
