const cache = caches.default;

const getFromCache = (url: string) => cache.match(url);

const putToCache = (url: string, res: Response) => {
	res.headers.set("cloudflare-cdn-cache-control", "max-age=31557600");
	res.headers.set("cache-tag", "roxi");
	return cache.put(url, res);
};

export { getFromCache, putToCache };
