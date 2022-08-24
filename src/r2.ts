import { sanitizeHeaders } from "./headers";
const getFromR2 = async (R2: R2Bucket, path: string, etag: string) => {
	const res = await R2.get(`roxi${path.replaceAll("/-/", "/")}`);
	if (!res || res.customMetadata.etag !== etag) {
		return undefined;
	}
	return new Response(res.body, {
		headers: sanitizeHeaders(
			new Headers({
				"content-type": res.httpMetadata.contentType || "application/octet-stream",
				etag: res.customMetadata.etag,
			}),
		),
	});
};

const putToR2 = (R2: R2Bucket, path: string, res: Response) =>
	R2.put(`roxi${path.replaceAll("/-/", "/")}`, res.body, {
		httpMetadata: { contentType: res.headers.get("content-type") || undefined },
		customMetadata: { etag: res.headers.get("etag") as string },
	});

export { getFromR2, putToR2 };
