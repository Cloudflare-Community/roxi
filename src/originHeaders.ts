import { headersToString } from "./headers";
const getHeadersFromKV = (KV: KVNamespace, path: string) =>
	KV.get<HeadersInit>(`roxi-etag${path}`, "json");
const putHeadersToKV = (KV: KVNamespace, path: string, headers: string) =>
	KV.put(`roxi-etag${path}`, headers, { expirationTtl: 300 });
const getHeadersFromOrigin = async (path: string): Promise<Headers> =>
	(await fetch(`https://registry.npmjs.org${path}`, { method: "HEAD" }))
		.headers;

const getHeaders = async (
	KV: KVNamespace,
	ctx: ExecutionContext,
	path: string,
) => {
	const kvHeaders = await getHeadersFromKV(KV, path);
	if (kvHeaders) {
		return new Headers(kvHeaders);
	}
	const headers = await getHeadersFromOrigin(path);
	ctx.waitUntil(putHeadersToKV(KV, path, headersToString(headers)));
	return headers;
};

export { getHeaders, putHeadersToKV };
