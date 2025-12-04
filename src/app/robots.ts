import type { MetadataRoute } from "next";
import { siteMetadata } from "@/lib/seo-config";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/api/", "/admin/"],
			},
			{
				userAgent: "Googlebot",
				allow: "/",
				disallow: ["/api/", "/admin/"],
			},
			{
				userAgent: "Bingbot",
				allow: "/",
				disallow: ["/api/", "/admin/"],
			},
		],
		sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
		host: siteMetadata.siteUrl,
	};
}
