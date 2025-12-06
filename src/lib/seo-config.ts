import type { Metadata, Viewport } from "next";
import siteMetadata from "../../metadata.json";

export function getBaseMetadata(): Metadata {
  return {
    metadataBase: new URL(siteMetadata.siteUrl),
    title: {
      default: siteMetadata.title.default,
      template: siteMetadata.title.template,
    },
    description: siteMetadata.description,
    keywords: siteMetadata.keywords,
    authors: siteMetadata.authors,
    creator: siteMetadata.creator,
    publisher: siteMetadata.publisher,
    applicationName: siteMetadata.applicationName,
    category: siteMetadata.category,
    classification: siteMetadata.classification,
    robots: {
      index: siteMetadata.robots.index,
      follow: siteMetadata.robots.follow,
      googleBot: {
        index: siteMetadata.robots.googleBot.index,
        follow: siteMetadata.robots.googleBot.follow,
        "max-video-preview": siteMetadata.robots.googleBot["max-video-preview"],
        "max-image-preview": siteMetadata.robots.googleBot[
          "max-image-preview"
        ] as "large",
        "max-snippet": siteMetadata.robots.googleBot["max-snippet"],
      },
    },
    openGraph: {
      type: "website",
      locale: siteMetadata.openGraph.locale,
      url: siteMetadata.openGraph.url,
      siteName: siteMetadata.openGraph.siteName,
      title: siteMetadata.openGraph.title,
      description: siteMetadata.openGraph.description,
      images: siteMetadata.openGraph.images.map((img) => ({
        url: img.url,
        width: img.width,
        height: img.height,
        alt: img.alt,
        type: img.type,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title: siteMetadata.twitter.title,
      description: siteMetadata.twitter.description,
      creator: siteMetadata.twitter.creator,
      images: siteMetadata.twitter.images,
    },
    alternates: {
      canonical: siteMetadata.alternates.canonical,
    },
    icons: {
      icon: siteMetadata.icons.icon,
      apple: siteMetadata.icons.apple,
    },
    manifest: siteMetadata.manifest,
    verification: siteMetadata.verification,
    appleWebApp: {
      capable: siteMetadata.appleWebApp.capable,
      title: siteMetadata.appleWebApp.title,
      statusBarStyle: siteMetadata.appleWebApp
        .statusBarStyle as "black-translucent",
    },
    formatDetection: {
      telephone: siteMetadata.formatDetection.telephone,
      date: siteMetadata.formatDetection.date,
      address: siteMetadata.formatDetection.address,
      email: siteMetadata.formatDetection.email,
    },
    other: siteMetadata.other,
  };
}

export function getViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    viewportFit: "cover",
    themeColor: siteMetadata.themeColor,
  };
}

export { siteMetadata };
