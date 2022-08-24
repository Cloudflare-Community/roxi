const getFromKV = async (KV: KVNamespace, path: string, etag: string) => {
	const res = await KV.getWithMetadata<any>(`roxi-json${path}`, "stream");
	if (!res.value || res.metadata.etag !== etag) {
		return undefined;
	}
	return new Response(res.value, { headers: res.metadata });
};

const putToKV = async (
	KV: KVNamespace,
	path: string,
	{ body, headers }: Response,
) =>
	body ? KV.put(`roxi-json${path}`, body, {
		metadata: Object.fromEntries(headers.entries()),
	}) : null;

export { getFromKV, putToKV };
