
const success = (res, message, data = null) => {
  return res.status(200).json({ status: "success", message, data });
};

const failure = (res, message, code = 400) => {
  return res.status(code).json({ status: "error", message });
};

export { success, failure };
