//#region node_modules/vinext/dist/utils/base-path.js
/**
* Shared basePath helpers.
*
* Next.js only treats a pathname as being under basePath when it is an exact
* match ("/app") or starts with the basePath followed by a path separator
* ("/app/..."). Prefix-only matches like "/application" must be left intact.
*/
/**
* Check whether a pathname is inside the configured basePath.
*/
function hasBasePath(pathname, basePath) {
	if (!basePath) return false;
	return pathname === basePath || pathname.startsWith(basePath + "/");
}
/**
* Strip the basePath prefix from a pathname when it matches on a segment
* boundary. Returns the original pathname when it is outside the basePath.
*/
function stripBasePath(pathname, basePath) {
	if (!hasBasePath(pathname, basePath)) return pathname;
	return pathname.slice(basePath.length) || "/";
}
//#endregion
//#region node_modules/vinext/dist/shims/url-utils.js
/**
* Shared URL utilities for same-origin detection.
*
* Used by link.tsx, navigation.ts, and router.ts to normalize
* same-origin absolute URLs to local paths for client-side navigation.
*/
/**
* If `url` is an absolute same-origin URL, return the local path
* (pathname + search + hash). Returns null for truly external URLs
* or on the server (where origin is unknown).
*/
function toSameOriginPath(url) {
	if (typeof window === "undefined") return null;
	try {
		const parsed = url.startsWith("//") ? new URL(url, window.location.origin) : new URL(url);
		if (parsed.origin === window.location.origin) return parsed.pathname + parsed.search + parsed.hash;
	} catch {}
	return null;
}
/**
* If `url` is an absolute same-origin URL, return the app-relative path
* (basePath stripped from the pathname, if configured). Returns null for
* truly external URLs or on the server.
*/
function toSameOriginAppPath(url, basePath) {
	const localPath = toSameOriginPath(url);
	if (localPath == null || !basePath) return localPath;
	try {
		const parsed = new URL(localPath, "http://vinext.local");
		if (!hasBasePath(parsed.pathname, basePath)) return null;
		return stripBasePath(parsed.pathname, basePath) + parsed.search + parsed.hash;
	} catch {
		return localPath;
	}
}
/**
* Prepend basePath to a local path for browser URLs / fetches.
*/
function withBasePath$1(path, basePath) {
	if (!basePath || !path.startsWith("/") || path.startsWith("http://") || path.startsWith("https://") || path.startsWith("//")) return path;
	return basePath + path;
}
/**
* Resolve a potentially relative href against the current URL.
* Handles: "#hash", "?query", "?query#hash", and relative paths.
*/
function resolveRelativeHref(href, currentUrl, basePath = "") {
	const base = currentUrl ?? (typeof window !== "undefined" ? window.location.href : void 0);
	if (!base) return href;
	if (href.startsWith("/") || href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//")) return href;
	try {
		const resolved = new URL(href, base);
		return (basePath && resolved.pathname === basePath ? "" : basePath ? stripBasePath(resolved.pathname, basePath) : resolved.pathname) + resolved.search + resolved.hash;
	} catch {
		return href;
	}
}
/**
* Convert a local navigation target into the browser URL that should be used
* for history entries, fetches, and onNavigate callbacks.
*/
function toBrowserNavigationHref(href, currentUrl, basePath = "") {
	const resolved = resolveRelativeHref(href, currentUrl, basePath);
	if (!basePath) return withBasePath$1(resolved, basePath);
	if (resolved === "") return basePath;
	if (resolved.startsWith("?") || resolved.startsWith("#")) return basePath + resolved;
	return withBasePath$1(resolved, basePath);
}
//#endregion
//#region node_modules/vinext/dist/utils/domain-locale.js
function normalizeDomainHostname(hostname) {
	if (!hostname) return void 0;
	return hostname.split(",", 1)[0]?.trim().split(":", 1)[0]?.toLowerCase() || void 0;
}
/**
* Match a configured domain either by hostname or locale.
* When both are provided, the checks intentionally use OR semantics so the
* same helper can cover Next.js's hostname lookup and preferred-locale lookup.
* If both are passed, the first domain matching either input wins, so callers
* should pass hostname or detectedLocale, not both.
*/
function detectDomainLocale(domainItems, hostname, detectedLocale) {
	if (!domainItems?.length) return void 0;
	const normalizedHostname = normalizeDomainHostname(hostname);
	const normalizedLocale = detectedLocale?.toLowerCase();
	for (const item of domainItems) if (normalizedHostname === normalizeDomainHostname(item.domain) || normalizedLocale === item.defaultLocale.toLowerCase() || item.locales?.some((locale) => locale.toLowerCase() === normalizedLocale)) return item;
}
function addLocalePrefix(path, locale, localeDefault) {
	const normalizedLocale = locale.toLowerCase();
	if (normalizedLocale === localeDefault.toLowerCase()) return path;
	const pathWithLeadingSlash = path.startsWith("/") ? path : `/${path}`;
	const normalizedPathname = (pathWithLeadingSlash.split(/[?#]/, 1)[0] ?? pathWithLeadingSlash).toLowerCase();
	const localePrefix = `/${normalizedLocale}`;
	if (normalizedPathname === localePrefix || normalizedPathname.startsWith(`${localePrefix}/`)) return path.startsWith("/") ? path : pathWithLeadingSlash;
	return `/${locale}${pathWithLeadingSlash}`;
}
function withBasePath(path, basePath = "") {
	if (!basePath) return path;
	return basePath + path;
}
function getDomainLocaleUrl(url, locale, { basePath, currentHostname, domainItems }) {
	if (!domainItems?.length) return void 0;
	const targetDomain = detectDomainLocale(domainItems, void 0, locale);
	if (!targetDomain) return void 0;
	const currentDomain = detectDomainLocale(domainItems, currentHostname ?? void 0);
	const localizedPath = addLocalePrefix(url, locale, targetDomain.defaultLocale);
	if (currentDomain && normalizeDomainHostname(currentDomain.domain) === normalizeDomainHostname(targetDomain.domain)) return;
	return `${`http${targetDomain.http ? "" : "s"}://`}${targetDomain.domain}${withBasePath(localizedPath, basePath)}`;
}
//#endregion
//#region node_modules/vinext/dist/utils/query.js
function setOwnQueryValue(obj, key, value) {
	Object.defineProperty(obj, key, {
		value,
		enumerable: true,
		writable: true,
		configurable: true
	});
}
function addQueryParam(obj, key, value) {
	if (Object.hasOwn(obj, key)) {
		const current = obj[key];
		setOwnQueryValue(obj, key, Array.isArray(current) ? current.concat(value) : [current, value]);
	} else setOwnQueryValue(obj, key, value);
}
/**
* Convert a Next.js-style query object into URLSearchParams while preserving
* repeated keys for array values.
*
* Ported from Next.js `urlQueryToSearchParams()`:
* https://github.com/vercel/next.js/blob/canary/packages/next/src/shared/lib/router/utils/querystring.ts
*/
function stringifyUrlQueryParam(param) {
	if (typeof param === "string") return param;
	if (typeof param === "number" && !isNaN(param) || typeof param === "boolean") return String(param);
	return "";
}
function urlQueryToSearchParams(query) {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (Array.isArray(value)) {
			for (const item of value) params.append(key, stringifyUrlQueryParam(item));
			continue;
		}
		params.set(key, stringifyUrlQueryParam(value));
	}
	return params;
}
/**
* Append query parameters to a URL while preserving any existing query string
* and fragment identifier.
*/
function appendSearchParamsToUrl(url, params) {
	const hashIndex = url.indexOf("#");
	const beforeHash = hashIndex === -1 ? url : url.slice(0, hashIndex);
	const hash = hashIndex === -1 ? "" : url.slice(hashIndex);
	const queryIndex = beforeHash.indexOf("?");
	const base = queryIndex === -1 ? beforeHash : beforeHash.slice(0, queryIndex);
	const existingQuery = queryIndex === -1 ? "" : beforeHash.slice(queryIndex + 1);
	const merged = new URLSearchParams(existingQuery);
	for (const [key, value] of params) merged.append(key, value);
	const search = merged.toString();
	return `${base}${search ? `?${search}` : ""}${hash}`;
}
//#endregion
export { getDomainLocaleUrl as a, toSameOriginAppPath as c, addLocalePrefix as i, withBasePath$1 as l, appendSearchParamsToUrl as n, resolveRelativeHref as o, urlQueryToSearchParams as r, toBrowserNavigationHref as s, addQueryParam as t, stripBasePath as u };
