function isErrorLike(value) {
  return value instanceof Error || (
    value &&
    typeof value === "object" &&
    typeof value.message === "string"
  );
}

function serializeError(error) {
  if (!error) return null;

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack || null,
    };
  }

  if (typeof error === "object") {
    return {
      name: error.name || "Error",
      message: error.message || String(error),
      stack: error.stack || null,
    };
  }

  return {
    name: "Error",
    message: String(error),
    stack: null,
  };
}

function normalizeContextLabel(context) {
  const fallback = "API/GENERAL/ERROR";
  if (typeof context !== "string") return fallback;

  const trimmed = context.trim();
  if (!trimmed) return fallback;

  const collapsed = trimmed
    .replace(/[^A-Za-z0-9/]+/g, "/")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "")
    .toUpperCase();

  if (!collapsed) return fallback;
  return collapsed.startsWith("API/") ? collapsed : `API/${collapsed}`;
}

export function logApiError(context, errorOrDetails, maybeDetails) {
  const timestamp = new Date().toISOString();
  const contextIsError = isErrorLike(context);
  let error = null;
  let details = null;
  let normalizedContext = normalizeContextLabel(context);

  if (contextIsError && errorOrDetails === undefined && maybeDetails === undefined) {
    error = context;
    normalizedContext = "API/GENERAL/ERROR";
  } else if (isErrorLike(errorOrDetails)) {
    error = errorOrDetails;
    details = maybeDetails ?? null;
  } else {
    details = errorOrDetails ?? null;
    if (isErrorLike(maybeDetails)) {
      error = maybeDetails;
    }
  }

  if (!error && details && isErrorLike(details.error)) {
    error = details.error;
  }

  console.error(`[${normalizedContext}]`, {
    timestamp,
    error: serializeError(error),
    details,
  });
}
