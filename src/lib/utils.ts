/**
 * Validates if a URL is a valid Etsy listing URL
 * @param url - The URL to validate
 * @returns Object with isValid boolean and optional error message
 */
export function validateEtsyUrl(url: string): {
  isValid: boolean;
  error?: string;
} {
  // Check if URL is provided
  if (!url || typeof url !== "string" || url.trim().length === 0) {
    return {
      isValid: false,
      error: "URL is required",
    };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      isValid: false,
      error: "Invalid URL format. Please provide a valid Etsy listing URL.",
    };
  }

  // Check if it's an Etsy domain
  const hostname = parsedUrl.hostname.toLowerCase();
  const isEtsyDomain =
    hostname === "etsy.com" ||
    hostname === "www.etsy.com" ||
    hostname.endsWith(".etsy.com");

  if (!isEtsyDomain) {
    return {
      isValid: false,
      error:
        "This doesn't appear to be an Etsy URL. Please provide a valid Etsy listing link.",
    };
  }

  // Check if it's a listing URL (contains /listing/)
  const isListingUrl = parsedUrl.pathname.includes("/listing/");

  if (!isListingUrl) {
    return {
      isValid: false,
      error:
        "This doesn't appear to be an Etsy listing URL. Please provide a link to a specific product listing.",
    };
  }

  return {
    isValid: true,
  };
}
