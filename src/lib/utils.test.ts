import { describe, expect, it } from "vitest";
import { validateEtsyUrl } from "./utils";

describe("validateEtsyUrl", () => {
  describe("valid URLs", () => {
    it("should validate a standard Etsy listing URL", () => {
      const result = validateEtsyUrl(
        "https://www.etsy.com/listing/123456/product-name",
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate Etsy listing URL without www", () => {
      const result = validateEtsyUrl(
        "https://etsy.com/listing/789/custom-product",
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate Etsy listing URL with subdomain", () => {
      const result = validateEtsyUrl("https://shop.etsy.com/listing/456/item");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate Etsy listing URL with query parameters", () => {
      const result = validateEtsyUrl(
        "https://www.etsy.com/listing/123/product?ref=shop_home",
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate Etsy listing URL with hash fragment", () => {
      const result = validateEtsyUrl(
        "https://www.etsy.com/listing/123/product#reviews",
      );
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("invalid URLs - empty or missing", () => {
    it("should reject empty string", () => {
      const result = validateEtsyUrl("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("URL is required");
    });

    it("should reject whitespace-only string", () => {
      const result = validateEtsyUrl("   ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("URL is required");
    });

    it("should reject null converted to string", () => {
      const result = validateEtsyUrl(null as unknown as string);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("URL is required");
    });

    it("should reject undefined converted to string", () => {
      const result = validateEtsyUrl(undefined as unknown as string);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("URL is required");
    });
  });

  describe("invalid URLs - malformed", () => {
    it("should reject malformed URL", () => {
      const result = validateEtsyUrl("not-a-url");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Invalid URL format. Please provide a valid Etsy listing URL.",
      );
    });

    it("should reject URL without protocol", () => {
      const result = validateEtsyUrl("etsy.com/listing/123/product");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Invalid URL format. Please provide a valid Etsy listing URL.",
      );
    });

    it("should reject completely invalid string", () => {
      const result = validateEtsyUrl(":::invalid:::");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Invalid URL format. Please provide a valid Etsy listing URL.",
      );
    });
  });

  describe("invalid URLs - wrong domain", () => {
    it("should reject Amazon URL", () => {
      const result = validateEtsyUrl(
        "https://www.amazon.com/listing/123/product",
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "This doesn't appear to be an Etsy URL. Please provide a valid Etsy listing link.",
      );
    });

    it("should reject eBay URL", () => {
      const result = validateEtsyUrl("https://www.ebay.com/itm/123456");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "This doesn't appear to be an Etsy URL. Please provide a valid Etsy listing link.",
      );
    });

    it("should reject generic URL", () => {
      const result = validateEtsyUrl("https://www.example.com/listing/123");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "This doesn't appear to be an Etsy URL. Please provide a valid Etsy listing link.",
      );
    });

    it("should reject similar-sounding domain", () => {
      const result = validateEtsyUrl(
        "https://www.etsy-fake.com/listing/123/product",
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "This doesn't appear to be an Etsy URL. Please provide a valid Etsy listing link.",
      );
    });
  });

  describe("invalid URLs - not a listing", () => {
    it("should reject Etsy homepage", () => {
      const result = validateEtsyUrl("https://www.etsy.com");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "This doesn't appear to be an Etsy listing URL. Please provide a link to a specific product listing.",
      );
    });

    it("should reject Etsy shop page", () => {
      const result = validateEtsyUrl("https://www.etsy.com/shop/shopname");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "This doesn't appear to be an Etsy listing URL. Please provide a link to a specific product listing.",
      );
    });

    it("should reject Etsy search page", () => {
      const result = validateEtsyUrl("https://www.etsy.com/search?q=handmade");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "This doesn't appear to be an Etsy listing URL. Please provide a link to a specific product listing.",
      );
    });

    it("should reject Etsy category page", () => {
      const result = validateEtsyUrl("https://www.etsy.com/c/jewelry");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "This doesn't appear to be an Etsy listing URL. Please provide a link to a specific product listing.",
      );
    });

    it("should reject Etsy cart page", () => {
      const result = validateEtsyUrl("https://www.etsy.com/cart");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "This doesn't appear to be an Etsy listing URL. Please provide a link to a specific product listing.",
      );
    });
  });

  describe("edge cases", () => {
    it("should handle URL with multiple query parameters", () => {
      const result = validateEtsyUrl(
        "https://www.etsy.com/listing/123/product?ref=shop&variation=456&color=blue",
      );
      expect(result.isValid).toBe(true);
    });

    it("should handle URL with port number", () => {
      const result = validateEtsyUrl(
        "https://www.etsy.com:443/listing/123/product",
      );
      expect(result.isValid).toBe(true);
    });

    it("should handle URL with trailing slash", () => {
      const result = validateEtsyUrl(
        "https://www.etsy.com/listing/123/product/",
      );
      expect(result.isValid).toBe(true);
    });

    it("should handle URL with uppercase domain", () => {
      const result = validateEtsyUrl(
        "https://WWW.ETSY.COM/listing/123/product",
      );
      expect(result.isValid).toBe(true);
    });

    it("should handle URL with mixed case domain", () => {
      const result = validateEtsyUrl(
        "https://Www.Etsy.Com/listing/123/product",
      );
      expect(result.isValid).toBe(true);
    });

    it("should handle very long product slug", () => {
      const longSlug = "a".repeat(500);
      const result = validateEtsyUrl(
        `https://www.etsy.com/listing/123/${longSlug}`,
      );
      expect(result.isValid).toBe(true);
    });

    it("should handle URL with special characters in slug", () => {
      const result = validateEtsyUrl(
        "https://www.etsy.com/listing/123/custom-made-50%-off-sale",
      );
      expect(result.isValid).toBe(true);
    });

    it("should handle URL with encoded characters", () => {
      const result = validateEtsyUrl(
        "https://www.etsy.com/listing/123/product%20name%20with%20spaces",
      );
      expect(result.isValid).toBe(true);
    });
  });

  describe("security edge cases", () => {
    it("should reject javascript protocol", () => {
      const result = validateEtsyUrl("javascript:alert('xss')");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "This doesn't appear to be an Etsy URL. Please provide a valid Etsy listing link.",
      );
    });

    it("should reject data URI", () => {
      const result = validateEtsyUrl(
        "data:text/html,<script>alert('xss')</script>",
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "This doesn't appear to be an Etsy URL. Please provide a valid Etsy listing link.",
      );
    });

    it("should reject file protocol", () => {
      const result = validateEtsyUrl("file:///etc/passwd");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "This doesn't appear to be an Etsy URL. Please provide a valid Etsy listing link.",
      );
    });
  });
});
