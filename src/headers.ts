import replaceNPM from "./rewriter";

const sanitizeHeaders = (headers: Headers): Headers => {
	const newHeaders: any = {
		"access-control-allow-origin": "*",
		"cache-control":
			"public, max-age=300, s-maxage=300, stale-while-revalidate=60",
		"x-powered-by": "roxi",
	};
	if (headers.has("content-type")) {
		newHeaders["content-type"] = headers.get("content-type");
	}
	if (headers.has("etag")) {
		newHeaders.etag = headers.get("etag");
	}
	if (headers.has("npm-notice")) {
		newHeaders["npm-notice"] = headers.get("npm-notice");
	}
	if (headers.has("x-npm-meta-sec-count-high")) {
		newHeaders["x-npm-meta-sec-count-high"] = headers.get(
			"x-npm-meta-sec-count-high",
		);
	}
	if (headers.has("npm-notice")) {
		newHeaders["x-npm-meta-sec-version"] = headers.get("x-npm-meta-sec-version");
	}

	return new Headers(newHeaders);
};

const sanitizeResponse = async (
	res: Response,
	npmReplace: boolean = false,
): Promise<Response> =>
	new Response(npmReplace ? replaceNPM(await res.text()) : res.body, {
		status: res.status,
		statusText: res.statusText,
		headers: sanitizeHeaders(res.headers),
	});

const headersToString = (headers: Headers) =>
	JSON.stringify(Object.fromEntries(headers.entries()));

export { sanitizeHeaders, sanitizeResponse, headersToString };
