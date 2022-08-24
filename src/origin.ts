const getFromOrigin = async (path: string, method: string) =>
	fetch(`https://registry.npmjs.org${path}`, { method });
export default getFromOrigin;
