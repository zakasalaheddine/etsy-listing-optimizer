import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateOptimizationResult } from "@/__mocks__/data-generator";
import { useOptimize } from "./use-optimize";

// Mock fetch globally
global.fetch = vi.fn();

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };

  return Wrapper;
};

describe("useOptimize", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful optimization", () => {
    it("should successfully optimize listing", async () => {
      const mockData = generateOptimizationResult();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useOptimize(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        url: "https://www.etsy.com/listing/123/test",
        email: "test@example.com",
        name: "Test User",
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
    });

    it("should make correct API call", async () => {
      const mockData = generateOptimizationResult();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useOptimize(), {
        wrapper: createWrapper(),
      });

      const requestData = {
        url: "https://www.etsy.com/listing/123/test",
        email: "test@example.com",
        name: "Test User",
      };

      result.current.mutate(requestData);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(global.fetch).toHaveBeenCalledWith("/api/optimizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
    });
  });

  describe("error scenarios", () => {
    it("should handle network error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error("Network error"),
      );

      const { result } = renderHook(() => useOptimize(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        url: "https://www.etsy.com/listing/123/test",
        email: "test@example.com",
        name: "Test User",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toContain(
        "Connection failed. Please check your internet connection",
      );
    });

    it("should handle 400 error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid URL" }),
      });

      const { result } = renderHook(() => useOptimize(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        url: "invalid-url",
        email: "test@example.com",
        name: "Test User",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Invalid URL");
    });

    it("should handle 500 error", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Server error" }),
      });

      const { result } = renderHook(() => useOptimize(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        url: "https://www.etsy.com/listing/123/test",
        email: "test@example.com",
        name: "Test User",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe("Server error");
    });

    it("should handle rate limit error (429)", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: "Daily limit reached. Request more access:",
          contactEmail: "support@example.com",
          remaining: 0,
          maxPerDay: 5,
        }),
      });

      const { result } = renderHook(() => useOptimize(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        url: "https://www.etsy.com/listing/123/test",
        email: "test@example.com",
        name: "Test User",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      const error = result.current.error as {
        rateLimitExceeded?: boolean;
        contactEmail?: string;
        remaining?: number;
        maxPerDay?: number;
      };

      expect(error.rateLimitExceeded).toBe(true);
      expect(error.contactEmail).toBe("support@example.com");
      expect(error.remaining).toBe(0);
      expect(error.maxPerDay).toBe(5);
    });

    it("should handle malformed JSON response", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const { result } = renderHook(() => useOptimize(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        url: "https://www.etsy.com/listing/123/test",
        email: "test@example.com",
        name: "Test User",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe(
        "Failed to optimize listing. Please try again.",
      );
    });
  });

  describe("loading states", () => {
    it("should set loading state during request", async () => {
      const mockData = generateOptimizationResult();
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => mockData,
                }),
              100,
            ),
          ),
      );

      const { result } = renderHook(() => useOptimize(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(false);

      result.current.mutate({
        url: "https://www.etsy.com/listing/123/test",
        email: "test@example.com",
        name: "Test User",
      });

      await waitFor(() => expect(result.current.isPending).toBe(true));
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  describe("edge cases", () => {
    it("should handle empty error response", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({}),
      });

      const { result } = renderHook(() => useOptimize(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        url: "https://www.etsy.com/listing/123/test",
        email: "test@example.com",
        name: "Test User",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error?.message).toBe(
        "Failed to optimize listing. Please try again.",
      );
    });

    it("should handle rate limit without contact email", async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({
          error: "Daily limit reached",
          remaining: 0,
          maxPerDay: 5,
        }),
      });

      const { result } = renderHook(() => useOptimize(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        url: "https://www.etsy.com/listing/123/test",
        email: "test@example.com",
        name: "Test User",
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      const error = result.current.error as {
        rateLimitExceeded?: boolean;
        contactEmail?: string;
      };

      expect(error.rateLimitExceeded).toBe(true);
      expect(error.contactEmail).toBeUndefined();
    });
  });
});
