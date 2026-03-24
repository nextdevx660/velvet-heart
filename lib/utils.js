// This function returns a stable YYYY-MM-DD string for usage tracking.
export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

// This function builds the Firestore usage document id for a user and date.
export function getUsageDocumentId(userId, date = getTodayDateString()) {
  return `${userId}_${date}`;
}

// This function extracts a bearer token from the Authorization header.
export function extractBearerToken(headerValue = "") {
  if (!headerValue.startsWith("Bearer ")) {
    return null;
  }

  return headerValue.slice(7);
}
