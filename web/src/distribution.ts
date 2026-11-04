/** Only the explicit release mode omits historical comparison. Dev/full remain unchanged. */
export const ORIGINAL_COMPARISON = import.meta.env.MODE !== "expedition-release";
