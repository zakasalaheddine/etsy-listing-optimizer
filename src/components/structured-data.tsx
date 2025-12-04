import type React from "react";

interface StructuredDataProps {
	data:
		| Record<string, unknown>
		| Array<Record<string, unknown>>;
}

export default function StructuredData({ data }: StructuredDataProps) {
	const jsonLd = Array.isArray(data) ? data : [data];

	return (
		<>
			{jsonLd.map((item, index) => (
				<script
					key={index}
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: Required for JSON-LD structured data
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(item),
					}}
				/>
			))}
		</>
	);
}
