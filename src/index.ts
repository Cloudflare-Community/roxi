import { sanitizeResponse, sanitizeHeaders, headersToString } from "./headers";
import { getFromCache, putToCache } from "./cache";
import { getFromR2, putToR2 } from "./r2";
import { getFromKV, putToKV } from "./kv";
import { getHeaders, putHeadersToKV } from "./originHeaders";
import getFromOrigin from "./origin";

const handler: ExportedHandler<Environment> = {
	async fetch(req, { KV, R2 }, ctx) {
		const { url, headers, method } = req;
		const urlObj = new URL(url);
		const path = urlObj.pathname;
		if (path.startsWith("/-/")) {
			urlObj.hostname = "registry.npmjs.org";
			return fetch(urlObj.toString(), req);
		}
		const originHeaders = await getHeaders(KV, ctx, path);
		const etag = originHeaders.get("etag") as string;
		if (headers.has("if-none-match") && headers.get("if-none-match") === etag) {
			return new Response(null, {
				status: 304,
				headers: sanitizeHeaders(originHeaders),
			});
		}
		let returnVal = await getFromCache(url);
		if (returnVal && returnVal.headers.get("etag") === etag) {
			return returnVal;
		}
		const promArr: Promise<any>[] = [];
		if (path.endsWith(".tgz")) {
			returnVal = await getFromR2(R2, path, etag);
			if (!returnVal) {
				returnVal = await sanitizeResponse(await getFromOrigin(path, method));
				promArr.push(
					putHeadersToKV(KV, path, headersToString(headers)),
					putToR2(R2, path, returnVal.clone()),
				);
			}
		} else {
			returnVal = await getFromKV(KV, path, etag);
			if (!returnVal) {
				returnVal = await sanitizeResponse(await getFromOrigin(path, method), true);
				promArr.push(
					putHeadersToKV(KV, path, headersToString(headers)),
					putToKV(KV, path, returnVal.clone()),
				);
			}
		}
		promArr.push(putToCache(url, returnVal.clone()));
		ctx.waitUntil(Promise.all(promArr));
		return returnVal;
	},
};

export default handler;
