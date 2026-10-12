// Declares which legacy envelope a router speaks. Mount it first in a module's routes file:
//
//   router.use(responseStyle("status"));
//
// utils/response.js (success) and middleware/errorHandler.js (errors) both read it.
export const RESPONSE_STYLES = ["flag", "status"];

export function responseStyle(style = "flag") {
  if (!RESPONSE_STYLES.includes(style)) throw new Error(`Unknown response style: ${style}`);
  return (req, res, next) => {
    res.locals.responseStyle = style;
    next();
  };
}
