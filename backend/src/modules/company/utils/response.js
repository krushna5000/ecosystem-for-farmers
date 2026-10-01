// { success, message, data } style (inventory)
export const success = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const failure = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

// { status: "success" | "error", message, data } style (brands, sub-categories, products)
export const statusSuccess = (res, message, data = null) =>
  res.status(200).json({ status: "success", message, data });

export const statusFailure = (res, message, code = 400) =>
  res.status(code).json({ status: "error", message });
