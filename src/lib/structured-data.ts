import { siteMetadata } from "./seo-config";

export interface WebSiteStructuredData {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  potentialAction?: {
    "@type": string;
    target: string | { "@type": string; urlTemplate: string };
    "query-input"?: string;
  };
}

export interface WebApplicationStructuredData {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    "@type": string;
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    "@type": string;
    ratingValue: string;
    ratingCount: string;
  };
}

export interface OrganizationStructuredData {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo?: string;
  description: string;
  contactPoint?: {
    "@type": string;
    email: string;
    contactType: string;
  };
}

export interface FAQStructuredData {
  "@context": string;
  "@type": string;
  mainEntity: Array<{
    "@type": string;
    name: string;
    acceptedAnswer: {
      "@type": string;
      text: string;
    };
  }>;
}

export function getWebSiteStructuredData(): WebSiteStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteMetadata.siteName,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteMetadata.siteUrl}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function getWebApplicationStructuredData(): WebApplicationStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteMetadata.applicationName,
    description: siteMetadata.description,
    url: siteMetadata.siteUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function getOrganizationStructuredData(): OrganizationStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteMetadata.siteName,
    url: siteMetadata.siteUrl,
    description: siteMetadata.description,
  };
}

export function getFAQStructuredData(): FAQStructuredData {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the Etsy Listing Optimizer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Etsy Listing Optimizer is a free AI-powered tool that helps Etsy sellers optimize their product listings using the Who, What, Where, When, Why SEO Method. It generates optimized titles, tags, and keywords to improve visibility in Etsy search results.",
        },
      },
      {
        "@type": "Question",
        name: "How does the Etsy SEO optimizer work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Simply paste your Etsy listing URL into the tool. Our AI analyzes your product and generates SEO-optimized titles, tags, and keywords based on proven Etsy SEO strategies. You'll receive multiple title variations and 30 optimized tags, each with quality scores.",
        },
      },
      {
        "@type": "Question",
        name: "Is the Etsy Listing Optimizer free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, the tool is free to use with a daily limit of 5 optimizations per email address. This ensures fair access for all Etsy sellers while maintaining service quality.",
        },
      },
      {
        "@type": "Question",
        name: "What is the Who, What, Where, When, Why SEO Method?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The Who, What, Where, When, Why SEO Method is a proven strategy for Etsy listings that focuses on keyword eligibility rather than ranking. It uses cross-matching between titles, tags, and attributes to maximize visibility in Etsy search results, particularly effective for new listings with 0-3 sales.",
        },
      },
      {
        "@type": "Question",
        name: "How many optimizations can I do per day?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can optimize up to 5 Etsy listings per day per email address. The limit resets daily at midnight to ensure fair usage for all users.",
        },
      },
    ],
  };
}

export function getAllStructuredData() {
  return [
    getWebSiteStructuredData(),
    getWebApplicationStructuredData(),
    getOrganizationStructuredData(),
    getFAQStructuredData(),
  ];
}
