const replaceNPM = (body: string) => {
	console.log("Replacing NPM Links...");
	return body.replaceAll("registry.npmjs.org", "roxi.cloudflare.community");
};

export default replaceNPM;
