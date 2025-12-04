import { ImageResponse } from "next/og";
import { siteMetadata } from "@/lib/seo-config";

export const runtime = "edge";
export const alt = siteMetadata.openGraph.images[0].alt;
export const size = {
	width: siteMetadata.openGraph.images[0].width,
	height: siteMetadata.openGraph.images[0].height,
};
export const contentType = "image/png";

export default async function Image() {
	return new ImageResponse(
		<div
			style={{
				fontSize: 60,
				background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				color: "white",
				padding: "60px",
			}}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					textAlign: "center",
				}}
			>
				<h1
					style={{
						fontSize: 72,
						fontWeight: "bold",
						marginBottom: 20,
						lineHeight: 1.2,
					}}
				>
					Etsy Listing Optimizer
				</h1>
				<p
					style={{
						fontSize: 32,
						opacity: 0.9,
						maxWidth: 900,
						lineHeight: 1.4,
					}}
				>
					AI-Powered SEO Tool for Etsy Sellers
				</p>
				<div
					style={{
						marginTop: 40,
						fontSize: 24,
						opacity: 0.8,
						display: "flex",
						alignItems: "center",
					}}
				>
					🚀 Free • AI-Powered • 2025 SEO Method
				</div>
			</div>
		</div>,
		{
			...size,
		},
	);
}
