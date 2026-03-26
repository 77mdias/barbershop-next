import { a as __toCommonJS, i as __require, n as __esmMin, o as __toESM, r as __exportAll, t as __commonJSMin } from "./chunk-D3zDcpJC.js";
import { t as logger } from "./logger-LhUDQoFP.js";
import { t as db } from "./prisma-CFYhdy0e.js";
import { t as bcryptjs_default } from "./bcryptjs-ZbfoOrmW.js";
import { AsyncLocalStorage } from "node:async_hooks";
import nodeCrypto from "crypto";
import { UserRole } from "@prisma/client";
//#region node_modules/vinext/dist/server/middleware-request-headers.js
function getMiddlewareHeaderValue(source, key) {
	if (source instanceof Headers) return source.get(key);
	const value = source[key];
	if (value === void 0) return null;
	return Array.isArray(value) ? value[0] ?? null : value;
}
function getOverrideHeaderNames(source) {
	const rawValue = getMiddlewareHeaderValue(source, MIDDLEWARE_OVERRIDE_HEADERS);
	if (rawValue === null) return null;
	return rawValue.split(",").map((key) => key.trim()).filter(Boolean);
}
function getForwardedRequestHeaders(source) {
	const forwardedHeaders = /* @__PURE__ */ new Map();
	if (source instanceof Headers) {
		for (const [key, value] of source.entries()) if (key.startsWith("x-middleware-request-")) forwardedHeaders.set(key.slice(21), value);
		return forwardedHeaders;
	}
	for (const [key, value] of Object.entries(source)) {
		if (!key.startsWith("x-middleware-request-")) continue;
		const normalizedValue = Array.isArray(value) ? value[0] ?? "" : value;
		forwardedHeaders.set(key.slice(21), normalizedValue);
	}
	return forwardedHeaders;
}
function cloneHeaders(source) {
	const cloned = new Headers();
	for (const [key, value] of source.entries()) cloned.append(key, value);
	return cloned;
}
function encodeMiddlewareRequestHeaders(targetHeaders, requestHeaders) {
	const overrideHeaderNames = [...requestHeaders.keys()];
	targetHeaders.set(MIDDLEWARE_OVERRIDE_HEADERS, overrideHeaderNames.join(","));
	for (const [key, value] of requestHeaders.entries()) targetHeaders.set(`${MIDDLEWARE_REQUEST_HEADER_PREFIX}${key}`, value);
}
function buildRequestHeadersFromMiddlewareResponse(baseHeaders, middlewareHeaders) {
	const overrideHeaderNames = getOverrideHeaderNames(middlewareHeaders);
	const forwardedHeaders = getForwardedRequestHeaders(middlewareHeaders);
	if (overrideHeaderNames === null && forwardedHeaders.size === 0) return null;
	const nextHeaders = overrideHeaderNames === null ? cloneHeaders(baseHeaders) : new Headers();
	if (overrideHeaderNames === null) {
		for (const [key, value] of forwardedHeaders) nextHeaders.set(key, value);
		return nextHeaders;
	}
	for (const key of overrideHeaderNames) {
		const value = forwardedHeaders.get(key);
		if (value !== void 0) nextHeaders.set(key, value);
	}
	return nextHeaders;
}
var MIDDLEWARE_REQUEST_HEADER_PREFIX, MIDDLEWARE_OVERRIDE_HEADERS;
var init_middleware_request_headers = __esmMin((() => {
	MIDDLEWARE_REQUEST_HEADER_PREFIX = "x-middleware-request-";
	MIDDLEWARE_OVERRIDE_HEADERS = "x-middleware-override-headers";
}));
//#endregion
//#region node_modules/vinext/dist/shims/internal/parse-cookie-header.js
/**
* Port of the current Next.js/@edge-runtime request cookie parser semantics.
*
* Important details:
* - split on a semicolon-plus-optional-spaces pattern
* - preserve whitespace around names/values otherwise
* - bare tokens become "true"
* - malformed percent-encoded values are skipped
* - duplicate names collapse to the last value via Map.set()
*/
function parseCookieHeader(cookieHeader) {
	const cookies = /* @__PURE__ */ new Map();
	for (const pair of cookieHeader.split(/; */)) {
		if (!pair) continue;
		const splitAt = pair.indexOf("=");
		if (splitAt === -1) {
			cookies.set(pair, "true");
			continue;
		}
		const key = pair.slice(0, splitAt);
		const value = pair.slice(splitAt + 1);
		try {
			cookies.set(key, decodeURIComponent(value));
		} catch {}
	}
	return cookies;
}
var init_parse_cookie_header = __esmMin((() => {}));
//#endregion
//#region node_modules/vinext/dist/shims/unified-request-context.js
function _getInheritedExecutionContext() {
	const unifiedStore = _als$1.getStore();
	if (unifiedStore) return unifiedStore.executionContext;
	return _g$1[_REQUEST_CONTEXT_ALS_KEY]?.getStore() ?? null;
}
/**
* Create a fresh `UnifiedRequestContext` with defaults for all fields.
* Pass partial overrides for the fields you need to pre-populate.
*/
function createRequestContext(opts) {
	return {
		headersContext: null,
		dynamicUsageDetected: false,
		pendingSetCookies: [],
		draftModeCookieHeader: null,
		phase: "render",
		i18nContext: null,
		serverContext: null,
		serverInsertedHTMLCallbacks: [],
		requestScopedCacheLife: null,
		_privateCache: null,
		currentRequestTags: [],
		executionContext: _getInheritedExecutionContext(),
		ssrContext: null,
		ssrHeadChildren: [],
		...opts
	};
}
/**
* Run `fn` within a unified request context scope.
* All shim modules will read/write their state from `ctx` for the
* duration of the call, including async continuations.
*/
function runWithRequestContext(ctx, fn) {
	return _als$1.run(ctx, fn);
}
/**
* Run `fn` in a nested unified scope derived from the current request context.
* Used by legacy runWith* wrappers to reset or override one sub-state while
* preserving proper async isolation for continuations created inside `fn`.
* The child scope is a shallow clone of the parent store, so untouched fields
* keep sharing their existing references while overridden slices can be reset.
*
* @internal
*/
function runWithUnifiedStateMutation(mutate, fn) {
	const parentCtx = _als$1.getStore();
	if (!parentCtx) return fn();
	const childCtx = { ...parentCtx };
	mutate(childCtx);
	return _als$1.run(childCtx, fn);
}
/**
* Get the current unified request context.
* Returns the ALS store when inside a `runWithRequestContext()` scope,
* or a fresh detached context otherwise. Unlike the legacy per-shim fallback
* singletons, this detached value is ephemeral — mutations do not persist
* across calls. This is intentional to prevent state leakage outside request
* scopes.
*
* Only direct callers observe this detached fallback. Shim `_getState()`
* helpers should continue to gate on `isInsideUnifiedScope()` and fall back
* to their standalone ALS/fallback singletons outside the unified scope.
* If called inside a standalone `runWithExecutionContext()` scope, the
* detached context still reflects that inherited `executionContext`.
*/
function getRequestContext() {
	return _als$1.getStore() ?? createRequestContext();
}
/**
* Check whether the current execution is inside a `runWithRequestContext()` scope.
* Shim modules use this to decide whether to read from the unified store
* or fall back to their own standalone ALS.
*/
function isInsideUnifiedScope() {
	return _als$1.getStore() != null;
}
var _ALS_KEY$1, _REQUEST_CONTEXT_ALS_KEY, _g$1, _als$1;
var init_unified_request_context = __esmMin((() => {
	_ALS_KEY$1 = Symbol.for("vinext.unifiedRequestContext.als");
	_REQUEST_CONTEXT_ALS_KEY = Symbol.for("vinext.requestContext.als");
	_g$1 = globalThis;
	_als$1 = _g$1[_ALS_KEY$1] ??= new AsyncLocalStorage();
}));
//#endregion
//#region node_modules/vinext/dist/shims/headers.js
var headers_exports = /* @__PURE__ */ __exportAll({
	applyMiddlewareRequestHeaders: () => applyMiddlewareRequestHeaders,
	consumeDynamicUsage: () => consumeDynamicUsage,
	cookies: () => cookies,
	draftMode: () => draftMode,
	getAndClearPendingCookies: () => getAndClearPendingCookies,
	getDraftModeCookieHeader: () => getDraftModeCookieHeader,
	getHeadersContext: () => getHeadersContext,
	headers: () => headers,
	headersContextFromRequest: () => headersContextFromRequest,
	markDynamicUsage: () => markDynamicUsage,
	runWithHeadersContext: () => runWithHeadersContext,
	setHeadersAccessPhase: () => setHeadersAccessPhase,
	setHeadersContext: () => setHeadersContext,
	throwIfInsideCacheScope: () => throwIfInsideCacheScope
});
function _getState() {
	if (isInsideUnifiedScope()) return getRequestContext();
	return _als.getStore() ?? _fallbackState;
}
/**
* Dynamic usage flag — set when a component calls connection(), cookies(),
* headers(), or noStore() during rendering. When true, ISR caching is
* bypassed and the response gets Cache-Control: no-store.
*/
/**
* Mark the current render as requiring dynamic (uncached) rendering.
* Called by connection(), cookies(), headers(), and noStore().
*/
function markDynamicUsage() {
	_getState().dynamicUsageDetected = true;
}
function _isInsideUseCache() {
	return _gHeaders[_USE_CACHE_ALS_KEY]?.getStore() != null;
}
function _isInsideUnstableCache() {
	return _gHeaders[_UNSTABLE_CACHE_ALS_KEY]?.getStore() === true;
}
/**
* Throw if the current execution is inside a "use cache" or unstable_cache()
* scope. Called by dynamic request APIs (headers, cookies, connection) to
* prevent request-specific data from being frozen into cached results.
*
* @param apiName - The name of the API being called (e.g. "connection()")
*/
function throwIfInsideCacheScope(apiName) {
	if (_isInsideUseCache()) throw new Error(`\`${apiName}\` cannot be called inside "use cache". If you need this data inside a cached function, call \`${apiName}\` outside and pass the required data as an argument.`);
	if (_isInsideUnstableCache()) throw new Error(`\`${apiName}\` cannot be called inside a function cached with \`unstable_cache()\`. If you need this data inside a cached function, call \`${apiName}\` outside and pass the required data as an argument.`);
}
/**
* Check and reset the dynamic usage flag.
* Called by the server after rendering to decide on caching.
*/
function consumeDynamicUsage() {
	const state = _getState();
	const used = state.dynamicUsageDetected;
	state.dynamicUsageDetected = false;
	return used;
}
function _setStatePhase(state, phase) {
	const previous = state.phase;
	state.phase = phase;
	return previous;
}
function _areCookiesMutableInCurrentPhase() {
	const phase = _getState().phase;
	return phase === "action" || phase === "route-handler";
}
function setHeadersAccessPhase(phase) {
	return _setStatePhase(_getState(), phase);
}
/**
* Set the headers/cookies context for the current RSC render.
* Called by the framework's RSC entry before rendering each request.
*
* @deprecated Prefer runWithHeadersContext() which uses als.run() for
* proper per-request isolation. This function mutates the ALS store
* in-place and is only safe for cleanup (ctx=null) within an existing
* als.run() scope.
*/
/**
* Returns the current live HeadersContext from ALS (or the fallback).
* Used after applyMiddlewareRequestHeaders() to build a post-middleware
* request context for afterFiles/fallback rewrite has/missing evaluation.
*/
function getHeadersContext() {
	return _getState().headersContext;
}
function setHeadersContext(ctx) {
	const state = _getState();
	if (ctx !== null) {
		state.headersContext = ctx;
		state.dynamicUsageDetected = false;
		state.pendingSetCookies = [];
		state.draftModeCookieHeader = null;
		state.phase = "render";
	} else {
		state.headersContext = null;
		state.phase = "render";
	}
}
/**
* Run a function with headers context, ensuring the context propagates
* through all async operations (including RSC streaming).
*
* Uses AsyncLocalStorage.run() to guarantee per-request isolation.
* The ALS store propagates through all async continuations including
* ReadableStream consumption, setTimeout callbacks, and Promise chains,
* so RSC streaming works correctly — components that render when the
* stream is consumed still see the correct request's context.
*/
function runWithHeadersContext(ctx, fn) {
	if (isInsideUnifiedScope()) return runWithUnifiedStateMutation((uCtx) => {
		uCtx.headersContext = ctx;
		uCtx.dynamicUsageDetected = false;
		uCtx.pendingSetCookies = [];
		uCtx.draftModeCookieHeader = null;
		uCtx.phase = "render";
	}, fn);
	const state = {
		headersContext: ctx,
		dynamicUsageDetected: false,
		pendingSetCookies: [],
		draftModeCookieHeader: null,
		phase: "render"
	};
	return _als.run(state, fn);
}
/**
* Apply middleware-forwarded request headers to the current headers context.
*
* When Next.js middleware calls `NextResponse.next()` or `NextResponse.rewrite()`
* with `{ request: { headers } }`, the modified headers are encoded on the
* middleware response. This function decodes that protocol and applies the
* resulting request header set to the live `HeadersContext`. When an override
* list is present, omitted headers are deleted as part of the rebuild.
*/
function applyMiddlewareRequestHeaders(middlewareResponseHeaders) {
	const state = _getState();
	if (!state.headersContext) return;
	const ctx = state.headersContext;
	const previousCookieHeader = ctx.headers.get("cookie");
	const nextHeaders = buildRequestHeadersFromMiddlewareResponse(ctx.headers, middlewareResponseHeaders);
	if (!nextHeaders) return;
	ctx.headers = nextHeaders;
	const nextCookieHeader = nextHeaders.get("cookie");
	if (previousCookieHeader === nextCookieHeader) return;
	ctx.cookies.clear();
	if (nextCookieHeader !== null) {
		const nextCookies = parseCookieHeader(nextCookieHeader);
		for (const [name, value] of nextCookies) ctx.cookies.set(name, value);
	}
}
function _decorateRequestApiPromise(promise, target) {
	return new Proxy(promise, {
		get(promiseTarget, prop) {
			if (prop in promiseTarget) {
				const value = Reflect.get(promiseTarget, prop, promiseTarget);
				return typeof value === "function" ? value.bind(promiseTarget) : value;
			}
			const value = Reflect.get(target, prop, target);
			return typeof value === "function" ? value.bind(target) : value;
		},
		has(promiseTarget, prop) {
			return prop in promiseTarget || prop in target;
		},
		ownKeys(promiseTarget) {
			return Array.from(new Set([...Reflect.ownKeys(promiseTarget), ...Reflect.ownKeys(target)]));
		},
		getOwnPropertyDescriptor(promiseTarget, prop) {
			return Reflect.getOwnPropertyDescriptor(promiseTarget, prop) ?? Reflect.getOwnPropertyDescriptor(target, prop);
		}
	});
}
function _decorateRejectedRequestApiPromise(error) {
	const normalizedError = error instanceof Error ? error : new Error(String(error));
	const promise = Promise.reject(normalizedError);
	promise.catch(() => {});
	return _decorateRequestApiPromise(promise, new Proxy({}, { get(_target, prop) {
		if (prop === "then" || prop === "catch" || prop === "finally") return;
		throw normalizedError;
	} }));
}
function _sealHeaders(headers) {
	return new Proxy(headers, { get(target, prop) {
		if (typeof prop === "string" && _HEADERS_MUTATING_METHODS.has(prop)) throw new ReadonlyHeadersError();
		const value = Reflect.get(target, prop, target);
		return typeof value === "function" ? value.bind(target) : value;
	} });
}
function _wrapMutableCookies(cookies) {
	return new Proxy(cookies, { get(target, prop) {
		if (prop === "set" || prop === "delete") return (...args) => {
			if (!_areCookiesMutableInCurrentPhase()) throw new ReadonlyRequestCookiesError();
			return Reflect.get(target, prop, target).apply(target, args);
		};
		const value = Reflect.get(target, prop, target);
		return typeof value === "function" ? value.bind(target) : value;
	} });
}
function _sealCookies(cookies) {
	return new Proxy(cookies, { get(target, prop) {
		if (prop === "set" || prop === "delete") throw new ReadonlyRequestCookiesError();
		const value = Reflect.get(target, prop, target);
		return typeof value === "function" ? value.bind(target) : value;
	} });
}
function _getMutableCookies(ctx) {
	if (!ctx.mutableCookies) ctx.mutableCookies = _wrapMutableCookies(new RequestCookies(ctx.cookies));
	return ctx.mutableCookies;
}
function _getReadonlyCookies(ctx) {
	if (!ctx.readonlyCookies) ctx.readonlyCookies = _sealCookies(new RequestCookies(ctx.cookies));
	return ctx.readonlyCookies;
}
function _getReadonlyHeaders(ctx) {
	if (!ctx.readonlyHeaders) ctx.readonlyHeaders = _sealHeaders(ctx.headers);
	return ctx.readonlyHeaders;
}
/**
* Create a HeadersContext from a standard Request object.
*
* Performance note: In Workerd (Cloudflare Workers), `new Headers(request.headers)`
* copies the entire header map across the V8/C++ boundary, which shows up as
* ~815 ms self-time in production profiles when requests carry many headers.
* We defer this copy with a lazy proxy:
*
* - Reads (`get`, `has`, `entries`, …) are forwarded directly to the original
*   immutable `request.headers` — zero copy cost on the hot path.
* - The first mutating call (`set`, `delete`, `append`) materialises
*   `new Headers(request.headers)` once, then applies the mutation to the copy.
*   All subsequent operations go to the copy.
*
* This means the ~815 ms copy only occurs when middleware actually rewrites
* request headers via `NextResponse.next({ request: { headers } })`, which is
* uncommon.  Pure read requests (the vast majority) pay zero copy cost.
*
* Cookie parsing is also deferred: the `cookie` header string is not split
* until the first call to `cookies()` or `draftMode()`.
*/
function headersContextFromRequest(request) {
	let _mutable = null;
	const headersProxy = new Proxy(request.headers, { get(target, prop) {
		const src = _mutable ?? target;
		if (typeof prop === "string" && _HEADERS_MUTATING_METHODS.has(prop)) return (...args) => {
			if (!_mutable) _mutable = new Headers(target);
			return _mutable[prop](...args);
		};
		const value = Reflect.get(src, prop, src);
		return typeof value === "function" ? value.bind(src) : value;
	} });
	let _cookies = null;
	function getCookies() {
		if (_cookies) return _cookies;
		_cookies = parseCookieHeader(headersProxy.get("cookie") || "");
		return _cookies;
	}
	return {
		headers: headersProxy,
		get cookies() {
			return getCookies();
		}
	};
}
/**
* Read-only Headers instance from the incoming request.
* Returns a Promise in Next.js 15+ style (but resolves synchronously since
* the context is already available).
*/
function headers() {
	try {
		throwIfInsideCacheScope("headers()");
	} catch (error) {
		return _decorateRejectedRequestApiPromise(error);
	}
	const state = _getState();
	if (!state.headersContext) return _decorateRejectedRequestApiPromise(/* @__PURE__ */ new Error("headers() can only be called from a Server Component, Route Handler, or Server Action. Make sure you're not calling it from a Client Component."));
	if (state.headersContext.accessError) return _decorateRejectedRequestApiPromise(state.headersContext.accessError);
	markDynamicUsage();
	const readonlyHeaders = _getReadonlyHeaders(state.headersContext);
	return _decorateRequestApiPromise(Promise.resolve(readonlyHeaders), readonlyHeaders);
}
/**
* Cookie jar from the incoming request.
* Returns a ReadonlyRequestCookies-like object.
*/
function cookies() {
	try {
		throwIfInsideCacheScope("cookies()");
	} catch (error) {
		return _decorateRejectedRequestApiPromise(error);
	}
	const state = _getState();
	if (!state.headersContext) return _decorateRejectedRequestApiPromise(/* @__PURE__ */ new Error("cookies() can only be called from a Server Component, Route Handler, or Server Action."));
	if (state.headersContext.accessError) return _decorateRejectedRequestApiPromise(state.headersContext.accessError);
	markDynamicUsage();
	const cookieStore = _areCookiesMutableInCurrentPhase() ? _getMutableCookies(state.headersContext) : _getReadonlyCookies(state.headersContext);
	return _decorateRequestApiPromise(Promise.resolve(cookieStore), cookieStore);
}
/** Accumulated Set-Cookie headers from cookies().set() / .delete() calls */
/**
* Get and clear all pending Set-Cookie headers generated by cookies().set()/delete().
* Called by the framework after rendering to attach headers to the response.
*/
function getAndClearPendingCookies() {
	const state = _getState();
	const cookies = state.pendingSetCookies;
	state.pendingSetCookies = [];
	return cookies;
}
function getDraftSecret() {
	return "57cd4d6e-0447-4af8-a42e-8306e3dcb637";
}
/**
* Get any Set-Cookie header generated by draftMode().enable()/disable().
* Called by the framework after rendering to attach the header to the response.
*/
function getDraftModeCookieHeader() {
	const state = _getState();
	const header = state.draftModeCookieHeader;
	state.draftModeCookieHeader = null;
	return header;
}
/**
* Draft mode — check/toggle via a `__prerender_bypass` cookie.
*
* - `isEnabled`: true if the bypass cookie is present in the request
* - `enable()`: sets the bypass cookie (for Route Handlers)
* - `disable()`: clears the bypass cookie
*/
async function draftMode() {
	throwIfInsideCacheScope("draftMode()");
	const state = _getState();
	if (state.headersContext?.accessError) throw state.headersContext.accessError;
	markDynamicUsage();
	const secret = getDraftSecret();
	return {
		isEnabled: state.headersContext ? state.headersContext.cookies.get(DRAFT_MODE_COOKIE) === secret : false,
		enable() {
			if (state.headersContext?.accessError) throw state.headersContext.accessError;
			if (state.headersContext) state.headersContext.cookies.set(DRAFT_MODE_COOKIE, secret);
			state.draftModeCookieHeader = `${DRAFT_MODE_COOKIE}=${secret}; Path=/; HttpOnly; SameSite=Lax${typeof process !== "undefined" && true ? "; Secure" : ""}`;
		},
		disable() {
			if (state.headersContext?.accessError) throw state.headersContext.accessError;
			if (state.headersContext) state.headersContext.cookies.delete(DRAFT_MODE_COOKIE);
			state.draftModeCookieHeader = `${DRAFT_MODE_COOKIE}=; Path=/; HttpOnly; SameSite=Lax${typeof process !== "undefined" && true ? "; Secure" : ""}; Max-Age=0`;
		}
	};
}
function validateCookieName(name) {
	if (!name || !VALID_COOKIE_NAME_RE.test(name)) throw new Error(`Invalid cookie name: ${JSON.stringify(name)}`);
}
/**
* Validate cookie attribute values (path, domain) to prevent injection
* via semicolons, newlines, or other control characters.
*/
function validateCookieAttributeValue(value, attributeName) {
	for (let i = 0; i < value.length; i++) {
		const code = value.charCodeAt(i);
		if (code <= 31 || code === 127 || value[i] === ";") throw new Error(`Invalid cookie ${attributeName} value: ${JSON.stringify(value)}`);
	}
}
var _ALS_KEY, _FALLBACK_KEY, _g, _als, _fallbackState, EXPIRED_COOKIE_DATE, _USE_CACHE_ALS_KEY, _UNSTABLE_CACHE_ALS_KEY, _gHeaders, _HEADERS_MUTATING_METHODS, ReadonlyHeadersError, ReadonlyRequestCookiesError, DRAFT_MODE_COOKIE, VALID_COOKIE_NAME_RE, RequestCookies;
var init_headers = __esmMin((() => {
	init_middleware_request_headers();
	init_parse_cookie_header();
	init_unified_request_context();
	_ALS_KEY = Symbol.for("vinext.nextHeadersShim.als");
	_FALLBACK_KEY = Symbol.for("vinext.nextHeadersShim.fallback");
	_g = globalThis;
	_als = _g[_ALS_KEY] ??= new AsyncLocalStorage();
	_fallbackState = _g[_FALLBACK_KEY] ??= {
		headersContext: null,
		dynamicUsageDetected: false,
		pendingSetCookies: [],
		draftModeCookieHeader: null,
		phase: "render"
	};
	EXPIRED_COOKIE_DATE = (/* @__PURE__ */ new Date(0)).toUTCString();
	_USE_CACHE_ALS_KEY = Symbol.for("vinext.cacheRuntime.contextAls");
	_UNSTABLE_CACHE_ALS_KEY = Symbol.for("vinext.unstableCache.als");
	_gHeaders = globalThis;
	_HEADERS_MUTATING_METHODS = new Set([
		"set",
		"delete",
		"append"
	]);
	ReadonlyHeadersError = class ReadonlyHeadersError extends Error {
		constructor() {
			super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
		}
		static callable() {
			throw new ReadonlyHeadersError();
		}
	};
	ReadonlyRequestCookiesError = class ReadonlyRequestCookiesError extends Error {
		constructor() {
			super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options");
		}
		static callable() {
			throw new ReadonlyRequestCookiesError();
		}
	};
	DRAFT_MODE_COOKIE = "__prerender_bypass";
	VALID_COOKIE_NAME_RE = /^[\x21\x23-\x27\x2A\x2B\x2D\x2E\x30-\x39\x41-\x5A\x5E-\x7A\x7C\x7E]+$/;
	RequestCookies = class {
		_cookies;
		constructor(cookies) {
			this._cookies = cookies;
		}
		get(name) {
			const value = this._cookies.get(name);
			if (value === void 0) return void 0;
			return {
				name,
				value
			};
		}
		getAll(nameOrOptions) {
			const name = typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions?.name;
			const result = [];
			for (const [cookieName, value] of this._cookies) if (name === void 0 || cookieName === name) result.push({
				name: cookieName,
				value
			});
			return result;
		}
		has(name) {
			return this._cookies.has(name);
		}
		/**
		* Set a cookie. In Route Handlers and Server Actions, this produces
		* a Set-Cookie header on the response.
		*/
		set(nameOrOptions, value, options) {
			let cookieName;
			let cookieValue;
			let opts;
			if (typeof nameOrOptions === "string") {
				cookieName = nameOrOptions;
				cookieValue = value ?? "";
				opts = options;
			} else {
				cookieName = nameOrOptions.name;
				cookieValue = nameOrOptions.value;
				opts = nameOrOptions;
			}
			validateCookieName(cookieName);
			this._cookies.set(cookieName, cookieValue);
			const parts = [`${cookieName}=${encodeURIComponent(cookieValue)}`];
			const path = opts?.path ?? "/";
			validateCookieAttributeValue(path, "Path");
			parts.push(`Path=${path}`);
			if (opts?.domain) {
				validateCookieAttributeValue(opts.domain, "Domain");
				parts.push(`Domain=${opts.domain}`);
			}
			if (opts?.maxAge !== void 0) parts.push(`Max-Age=${opts.maxAge}`);
			if (opts?.expires) parts.push(`Expires=${opts.expires.toUTCString()}`);
			if (opts?.httpOnly) parts.push("HttpOnly");
			if (opts?.secure) parts.push("Secure");
			if (opts?.sameSite) parts.push(`SameSite=${opts.sameSite}`);
			_getState().pendingSetCookies.push(parts.join("; "));
			return this;
		}
		/**
		* Delete a cookie by emitting an expired Set-Cookie header.
		*/
		delete(nameOrOptions) {
			const name = typeof nameOrOptions === "string" ? nameOrOptions : nameOrOptions.name;
			const path = typeof nameOrOptions === "string" ? "/" : nameOrOptions.path ?? "/";
			const domain = typeof nameOrOptions === "string" ? void 0 : nameOrOptions.domain;
			validateCookieName(name);
			validateCookieAttributeValue(path, "Path");
			if (domain) validateCookieAttributeValue(domain, "Domain");
			this._cookies.delete(name);
			const parts = [`${name}=`, `Path=${path}`];
			if (domain) parts.push(`Domain=${domain}`);
			parts.push(`Expires=${EXPIRED_COOKIE_DATE}`);
			_getState().pendingSetCookies.push(parts.join("; "));
			return this;
		}
		get size() {
			return this._cookies.size;
		}
		[Symbol.iterator]() {
			const entries = this._cookies.entries();
			const iter = {
				[Symbol.iterator]() {
					return iter;
				},
				next() {
					const { value, done } = entries.next();
					if (done) return {
						value: void 0,
						done: true
					};
					const [name, val] = value;
					return {
						value: [name, {
							name,
							value: val
						}],
						done: false
					};
				}
			};
			return iter;
		}
		toString() {
			const parts = [];
			for (const [name, value] of this._cookies) parts.push(`${name}=${value}`);
			return parts.join("; ");
		}
	};
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/interopRequireDefault.js
var require_interopRequireDefault = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _interopRequireDefault(e) {
		return e && e.__esModule ? e : { "default": e };
	}
	module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/digest.js
var require_digest = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var crypto_1$18 = __require("crypto");
	var digest = (algorithm, data) => (0, crypto_1$18.createHash)(algorithm).update(data).digest();
	exports.default = digest;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/buffer_utils.js
var require_buffer_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.concatKdf = exports.lengthAndInput = exports.uint32be = exports.uint64be = exports.p2s = exports.concat = exports.decoder = exports.encoder = void 0;
	var digest_js_1 = require_digest();
	exports.encoder = new TextEncoder();
	exports.decoder = new TextDecoder();
	var MAX_INT32 = 2 ** 32;
	function concat(...buffers) {
		const size = buffers.reduce((acc, { length }) => acc + length, 0);
		const buf = new Uint8Array(size);
		let i = 0;
		buffers.forEach((buffer) => {
			buf.set(buffer, i);
			i += buffer.length;
		});
		return buf;
	}
	exports.concat = concat;
	function p2s(alg, p2sInput) {
		return concat(exports.encoder.encode(alg), new Uint8Array([0]), p2sInput);
	}
	exports.p2s = p2s;
	function writeUInt32BE(buf, value, offset) {
		if (value < 0 || value >= MAX_INT32) throw new RangeError(`value must be >= 0 and <= ${MAX_INT32 - 1}. Received ${value}`);
		buf.set([
			value >>> 24,
			value >>> 16,
			value >>> 8,
			value & 255
		], offset);
	}
	function uint64be(value) {
		const high = Math.floor(value / MAX_INT32);
		const low = value % MAX_INT32;
		const buf = new Uint8Array(8);
		writeUInt32BE(buf, high, 0);
		writeUInt32BE(buf, low, 4);
		return buf;
	}
	exports.uint64be = uint64be;
	function uint32be(value) {
		const buf = new Uint8Array(4);
		writeUInt32BE(buf, value);
		return buf;
	}
	exports.uint32be = uint32be;
	function lengthAndInput(input) {
		return concat(uint32be(input.length), input);
	}
	exports.lengthAndInput = lengthAndInput;
	async function concatKdf(secret, bits, value) {
		const iterations = Math.ceil((bits >> 3) / 32);
		const res = new Uint8Array(iterations * 32);
		for (let iter = 0; iter < iterations; iter++) {
			const buf = new Uint8Array(4 + secret.length + value.length);
			buf.set(uint32be(iter + 1));
			buf.set(secret, 4);
			buf.set(value, 4 + secret.length);
			res.set(await (0, digest_js_1.default)("sha256", buf), iter * 32);
		}
		return res.slice(0, bits >> 3);
	}
	exports.concatKdf = concatKdf;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/base64url.js
var require_base64url$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decode = exports.encode = exports.encodeBase64 = exports.decodeBase64 = void 0;
	var buffer_1$5 = __require("buffer");
	var buffer_utils_js_1 = require_buffer_utils();
	function normalize(input) {
		let encoded = input;
		if (encoded instanceof Uint8Array) encoded = buffer_utils_js_1.decoder.decode(encoded);
		return encoded;
	}
	if (buffer_1$5.Buffer.isEncoding("base64url")) exports.encode = (input) => buffer_1$5.Buffer.from(input).toString("base64url");
	else exports.encode = (input) => buffer_1$5.Buffer.from(input).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
	var decodeBase64 = (input) => buffer_1$5.Buffer.from(input, "base64");
	exports.decodeBase64 = decodeBase64;
	var encodeBase64 = (input) => buffer_1$5.Buffer.from(input).toString("base64");
	exports.encodeBase64 = encodeBase64;
	var decode = (input) => buffer_1$5.Buffer.from(normalize(input), "base64");
	exports.decode = decode;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/util/errors.js
var require_errors$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.JWSSignatureVerificationFailed = exports.JWKSTimeout = exports.JWKSMultipleMatchingKeys = exports.JWKSNoMatchingKey = exports.JWKSInvalid = exports.JWKInvalid = exports.JWTInvalid = exports.JWSInvalid = exports.JWEInvalid = exports.JWEDecompressionFailed = exports.JWEDecryptionFailed = exports.JOSENotSupported = exports.JOSEAlgNotAllowed = exports.JWTExpired = exports.JWTClaimValidationFailed = exports.JOSEError = void 0;
	var JOSEError = class extends Error {
		static get code() {
			return "ERR_JOSE_GENERIC";
		}
		constructor(message) {
			var _a;
			super(message);
			this.code = "ERR_JOSE_GENERIC";
			this.name = this.constructor.name;
			(_a = Error.captureStackTrace) === null || _a === void 0 || _a.call(Error, this, this.constructor);
		}
	};
	exports.JOSEError = JOSEError;
	var JWTClaimValidationFailed = class extends JOSEError {
		static get code() {
			return "ERR_JWT_CLAIM_VALIDATION_FAILED";
		}
		constructor(message, claim = "unspecified", reason = "unspecified") {
			super(message);
			this.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
			this.claim = claim;
			this.reason = reason;
		}
	};
	exports.JWTClaimValidationFailed = JWTClaimValidationFailed;
	var JWTExpired = class extends JOSEError {
		static get code() {
			return "ERR_JWT_EXPIRED";
		}
		constructor(message, claim = "unspecified", reason = "unspecified") {
			super(message);
			this.code = "ERR_JWT_EXPIRED";
			this.claim = claim;
			this.reason = reason;
		}
	};
	exports.JWTExpired = JWTExpired;
	var JOSEAlgNotAllowed = class extends JOSEError {
		constructor() {
			super(...arguments);
			this.code = "ERR_JOSE_ALG_NOT_ALLOWED";
		}
		static get code() {
			return "ERR_JOSE_ALG_NOT_ALLOWED";
		}
	};
	exports.JOSEAlgNotAllowed = JOSEAlgNotAllowed;
	var JOSENotSupported = class extends JOSEError {
		constructor() {
			super(...arguments);
			this.code = "ERR_JOSE_NOT_SUPPORTED";
		}
		static get code() {
			return "ERR_JOSE_NOT_SUPPORTED";
		}
	};
	exports.JOSENotSupported = JOSENotSupported;
	var JWEDecryptionFailed = class extends JOSEError {
		constructor() {
			super(...arguments);
			this.code = "ERR_JWE_DECRYPTION_FAILED";
			this.message = "decryption operation failed";
		}
		static get code() {
			return "ERR_JWE_DECRYPTION_FAILED";
		}
	};
	exports.JWEDecryptionFailed = JWEDecryptionFailed;
	var JWEDecompressionFailed = class extends JOSEError {
		constructor() {
			super(...arguments);
			this.code = "ERR_JWE_DECOMPRESSION_FAILED";
			this.message = "decompression operation failed";
		}
		static get code() {
			return "ERR_JWE_DECOMPRESSION_FAILED";
		}
	};
	exports.JWEDecompressionFailed = JWEDecompressionFailed;
	var JWEInvalid = class extends JOSEError {
		constructor() {
			super(...arguments);
			this.code = "ERR_JWE_INVALID";
		}
		static get code() {
			return "ERR_JWE_INVALID";
		}
	};
	exports.JWEInvalid = JWEInvalid;
	var JWSInvalid = class extends JOSEError {
		constructor() {
			super(...arguments);
			this.code = "ERR_JWS_INVALID";
		}
		static get code() {
			return "ERR_JWS_INVALID";
		}
	};
	exports.JWSInvalid = JWSInvalid;
	var JWTInvalid = class extends JOSEError {
		constructor() {
			super(...arguments);
			this.code = "ERR_JWT_INVALID";
		}
		static get code() {
			return "ERR_JWT_INVALID";
		}
	};
	exports.JWTInvalid = JWTInvalid;
	var JWKInvalid = class extends JOSEError {
		constructor() {
			super(...arguments);
			this.code = "ERR_JWK_INVALID";
		}
		static get code() {
			return "ERR_JWK_INVALID";
		}
	};
	exports.JWKInvalid = JWKInvalid;
	var JWKSInvalid = class extends JOSEError {
		constructor() {
			super(...arguments);
			this.code = "ERR_JWKS_INVALID";
		}
		static get code() {
			return "ERR_JWKS_INVALID";
		}
	};
	exports.JWKSInvalid = JWKSInvalid;
	var JWKSNoMatchingKey = class extends JOSEError {
		constructor() {
			super(...arguments);
			this.code = "ERR_JWKS_NO_MATCHING_KEY";
			this.message = "no applicable key found in the JSON Web Key Set";
		}
		static get code() {
			return "ERR_JWKS_NO_MATCHING_KEY";
		}
	};
	exports.JWKSNoMatchingKey = JWKSNoMatchingKey;
	var JWKSMultipleMatchingKeys = class extends JOSEError {
		constructor() {
			super(...arguments);
			this.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
			this.message = "multiple matching keys found in the JSON Web Key Set";
		}
		static get code() {
			return "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
		}
	};
	exports.JWKSMultipleMatchingKeys = JWKSMultipleMatchingKeys;
	var JWKSTimeout = class extends JOSEError {
		constructor() {
			super(...arguments);
			this.code = "ERR_JWKS_TIMEOUT";
			this.message = "request timed out";
		}
		static get code() {
			return "ERR_JWKS_TIMEOUT";
		}
	};
	exports.JWKSTimeout = JWKSTimeout;
	var JWSSignatureVerificationFailed = class extends JOSEError {
		constructor() {
			super(...arguments);
			this.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
			this.message = "signature verification failed";
		}
		static get code() {
			return "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
		}
	};
	exports.JWSSignatureVerificationFailed = JWSSignatureVerificationFailed;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/random.js
var require_random = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = void 0;
	var crypto_1$17 = __require("crypto");
	Object.defineProperty(exports, "default", {
		enumerable: true,
		get: function() {
			return crypto_1$17.randomFillSync;
		}
	});
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/iv.js
var require_iv = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.bitLength = void 0;
	var errors_js_1 = require_errors$2();
	var random_js_1 = require_random();
	function bitLength(alg) {
		switch (alg) {
			case "A128GCM":
			case "A128GCMKW":
			case "A192GCM":
			case "A192GCMKW":
			case "A256GCM":
			case "A256GCMKW": return 96;
			case "A128CBC-HS256":
			case "A192CBC-HS384":
			case "A256CBC-HS512": return 128;
			default: throw new errors_js_1.JOSENotSupported(`Unsupported JWE Algorithm: ${alg}`);
		}
	}
	exports.bitLength = bitLength;
	exports.default = (alg) => (0, random_js_1.default)(new Uint8Array(bitLength(alg) >> 3));
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/check_iv_length.js
var require_check_iv_length = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var errors_js_1 = require_errors$2();
	var iv_js_1 = require_iv();
	var checkIvLength = (enc, iv) => {
		if (iv.length << 3 !== (0, iv_js_1.bitLength)(enc)) throw new errors_js_1.JWEInvalid("Invalid Initialization Vector length");
	};
	exports.default = checkIvLength;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/is_key_object.js
var require_is_key_object$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var crypto_1$16 = __require("crypto");
	var util$2 = __require("util");
	exports.default = util$2.types.isKeyObject ? (obj) => util$2.types.isKeyObject(obj) : (obj) => obj != null && obj instanceof crypto_1$16.KeyObject;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/check_cek_length.js
var require_check_cek_length = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var errors_js_1 = require_errors$2();
	var is_key_object_js_1 = require_is_key_object$1();
	var checkCekLength = (enc, cek) => {
		let expected;
		switch (enc) {
			case "A128CBC-HS256":
			case "A192CBC-HS384":
			case "A256CBC-HS512":
				expected = parseInt(enc.slice(-3), 10);
				break;
			case "A128GCM":
			case "A192GCM":
			case "A256GCM":
				expected = parseInt(enc.slice(1, 4), 10);
				break;
			default: throw new errors_js_1.JOSENotSupported(`Content Encryption Algorithm ${enc} is not supported either by JOSE or your javascript runtime`);
		}
		if (cek instanceof Uint8Array) {
			const actual = cek.byteLength << 3;
			if (actual !== expected) throw new errors_js_1.JWEInvalid(`Invalid Content Encryption Key length. Expected ${expected} bits, got ${actual} bits`);
			return;
		}
		if ((0, is_key_object_js_1.default)(cek) && cek.type === "secret") {
			const actual = cek.symmetricKeySize << 3;
			if (actual !== expected) throw new errors_js_1.JWEInvalid(`Invalid Content Encryption Key length. Expected ${expected} bits, got ${actual} bits`);
			return;
		}
		throw new TypeError("Invalid Content Encryption Key type");
	};
	exports.default = checkCekLength;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/timing_safe_equal.js
var require_timing_safe_equal = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = __require("crypto").timingSafeEqual;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/cbc_tag.js
var require_cbc_tag = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var crypto_1$15 = __require("crypto");
	var buffer_utils_js_1 = require_buffer_utils();
	function cbcTag(aad, iv, ciphertext, macSize, macKey, keySize) {
		const macData = (0, buffer_utils_js_1.concat)(aad, iv, ciphertext, (0, buffer_utils_js_1.uint64be)(aad.length << 3));
		const hmac = (0, crypto_1$15.createHmac)(`sha${macSize}`, macKey);
		hmac.update(macData);
		return hmac.digest().slice(0, keySize >> 3);
	}
	exports.default = cbcTag;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/webcrypto.js
var require_webcrypto = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.isCryptoKey = void 0;
	var crypto$7 = __require("crypto");
	var util$1 = __require("util");
	exports.default = crypto$7.webcrypto;
	exports.isCryptoKey = util$1.types.isCryptoKey ? (key) => util$1.types.isCryptoKey(key) : (key) => false;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/crypto_key.js
var require_crypto_key = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.checkEncCryptoKey = exports.checkSigCryptoKey = void 0;
	function unusable(name, prop = "algorithm.name") {
		return /* @__PURE__ */ new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
	}
	function isAlgorithm(algorithm, name) {
		return algorithm.name === name;
	}
	function getHashLength(hash) {
		return parseInt(hash.name.slice(4), 10);
	}
	function getNamedCurve(alg) {
		switch (alg) {
			case "ES256": return "P-256";
			case "ES384": return "P-384";
			case "ES512": return "P-521";
			default: throw new Error("unreachable");
		}
	}
	function checkUsage(key, usages) {
		if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
			let msg = "CryptoKey does not support this operation, its usages must include ";
			if (usages.length > 2) {
				const last = usages.pop();
				msg += `one of ${usages.join(", ")}, or ${last}.`;
			} else if (usages.length === 2) msg += `one of ${usages[0]} or ${usages[1]}.`;
			else msg += `${usages[0]}.`;
			throw new TypeError(msg);
		}
	}
	function checkSigCryptoKey(key, alg, ...usages) {
		switch (alg) {
			case "HS256":
			case "HS384":
			case "HS512": {
				if (!isAlgorithm(key.algorithm, "HMAC")) throw unusable("HMAC");
				const expected = parseInt(alg.slice(2), 10);
				if (getHashLength(key.algorithm.hash) !== expected) throw unusable(`SHA-${expected}`, "algorithm.hash");
				break;
			}
			case "RS256":
			case "RS384":
			case "RS512": {
				if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5")) throw unusable("RSASSA-PKCS1-v1_5");
				const expected = parseInt(alg.slice(2), 10);
				if (getHashLength(key.algorithm.hash) !== expected) throw unusable(`SHA-${expected}`, "algorithm.hash");
				break;
			}
			case "PS256":
			case "PS384":
			case "PS512": {
				if (!isAlgorithm(key.algorithm, "RSA-PSS")) throw unusable("RSA-PSS");
				const expected = parseInt(alg.slice(2), 10);
				if (getHashLength(key.algorithm.hash) !== expected) throw unusable(`SHA-${expected}`, "algorithm.hash");
				break;
			}
			case "EdDSA":
				if (key.algorithm.name !== "Ed25519" && key.algorithm.name !== "Ed448") throw unusable("Ed25519 or Ed448");
				break;
			case "ES256":
			case "ES384":
			case "ES512": {
				if (!isAlgorithm(key.algorithm, "ECDSA")) throw unusable("ECDSA");
				const expected = getNamedCurve(alg);
				if (key.algorithm.namedCurve !== expected) throw unusable(expected, "algorithm.namedCurve");
				break;
			}
			default: throw new TypeError("CryptoKey does not support this operation");
		}
		checkUsage(key, usages);
	}
	exports.checkSigCryptoKey = checkSigCryptoKey;
	function checkEncCryptoKey(key, alg, ...usages) {
		switch (alg) {
			case "A128GCM":
			case "A192GCM":
			case "A256GCM": {
				if (!isAlgorithm(key.algorithm, "AES-GCM")) throw unusable("AES-GCM");
				const expected = parseInt(alg.slice(1, 4), 10);
				if (key.algorithm.length !== expected) throw unusable(expected, "algorithm.length");
				break;
			}
			case "A128KW":
			case "A192KW":
			case "A256KW": {
				if (!isAlgorithm(key.algorithm, "AES-KW")) throw unusable("AES-KW");
				const expected = parseInt(alg.slice(1, 4), 10);
				if (key.algorithm.length !== expected) throw unusable(expected, "algorithm.length");
				break;
			}
			case "ECDH":
				switch (key.algorithm.name) {
					case "ECDH":
					case "X25519":
					case "X448": break;
					default: throw unusable("ECDH, X25519, or X448");
				}
				break;
			case "PBES2-HS256+A128KW":
			case "PBES2-HS384+A192KW":
			case "PBES2-HS512+A256KW":
				if (!isAlgorithm(key.algorithm, "PBKDF2")) throw unusable("PBKDF2");
				break;
			case "RSA-OAEP":
			case "RSA-OAEP-256":
			case "RSA-OAEP-384":
			case "RSA-OAEP-512": {
				if (!isAlgorithm(key.algorithm, "RSA-OAEP")) throw unusable("RSA-OAEP");
				const expected = parseInt(alg.slice(9), 10) || 1;
				if (getHashLength(key.algorithm.hash) !== expected) throw unusable(`SHA-${expected}`, "algorithm.hash");
				break;
			}
			default: throw new TypeError("CryptoKey does not support this operation");
		}
		checkUsage(key, usages);
	}
	exports.checkEncCryptoKey = checkEncCryptoKey;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/invalid_key_input.js
var require_invalid_key_input = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.withAlg = void 0;
	function message(msg, actual, ...types) {
		if (types.length > 2) {
			const last = types.pop();
			msg += `one of type ${types.join(", ")}, or ${last}.`;
		} else if (types.length === 2) msg += `one of type ${types[0]} or ${types[1]}.`;
		else msg += `of type ${types[0]}.`;
		if (actual == null) msg += ` Received ${actual}`;
		else if (typeof actual === "function" && actual.name) msg += ` Received function ${actual.name}`;
		else if (typeof actual === "object" && actual != null) {
			if (actual.constructor && actual.constructor.name) msg += ` Received an instance of ${actual.constructor.name}`;
		}
		return msg;
	}
	exports.default = (actual, ...types) => {
		return message("Key must be ", actual, ...types);
	};
	function withAlg(alg, actual, ...types) {
		return message(`Key for the ${alg} algorithm must be `, actual, ...types);
	}
	exports.withAlg = withAlg;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/ciphers.js
var require_ciphers = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var crypto_1$14 = __require("crypto");
	var ciphers;
	exports.default = (algorithm) => {
		ciphers || (ciphers = new Set((0, crypto_1$14.getCiphers)()));
		return ciphers.has(algorithm);
	};
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/is_key_like.js
var require_is_key_like = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.types = void 0;
	var webcrypto_js_1 = require_webcrypto();
	var is_key_object_js_1 = require_is_key_object$1();
	exports.default = (key) => (0, is_key_object_js_1.default)(key) || (0, webcrypto_js_1.isCryptoKey)(key);
	var types = ["KeyObject"];
	exports.types = types;
	if (globalThis.CryptoKey || (webcrypto_js_1.default === null || webcrypto_js_1.default === void 0 ? void 0 : webcrypto_js_1.default.CryptoKey)) types.push("CryptoKey");
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/decrypt.js
var require_decrypt$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var crypto_1$13 = __require("crypto");
	var check_iv_length_js_1 = require_check_iv_length();
	var check_cek_length_js_1 = require_check_cek_length();
	var buffer_utils_js_1 = require_buffer_utils();
	var errors_js_1 = require_errors$2();
	var timing_safe_equal_js_1 = require_timing_safe_equal();
	var cbc_tag_js_1 = require_cbc_tag();
	var webcrypto_js_1 = require_webcrypto();
	var crypto_key_js_1 = require_crypto_key();
	var is_key_object_js_1 = require_is_key_object$1();
	var invalid_key_input_js_1 = require_invalid_key_input();
	var ciphers_js_1 = require_ciphers();
	var is_key_like_js_1 = require_is_key_like();
	function cbcDecrypt(enc, cek, ciphertext, iv, tag, aad) {
		const keySize = parseInt(enc.slice(1, 4), 10);
		if ((0, is_key_object_js_1.default)(cek)) cek = cek.export();
		const encKey = cek.subarray(keySize >> 3);
		const macKey = cek.subarray(0, keySize >> 3);
		const macSize = parseInt(enc.slice(-3), 10);
		const algorithm = `aes-${keySize}-cbc`;
		if (!(0, ciphers_js_1.default)(algorithm)) throw new errors_js_1.JOSENotSupported(`alg ${enc} is not supported by your javascript runtime`);
		const expectedTag = (0, cbc_tag_js_1.default)(aad, iv, ciphertext, macSize, macKey, keySize);
		let macCheckPassed;
		try {
			macCheckPassed = (0, timing_safe_equal_js_1.default)(tag, expectedTag);
		} catch {}
		if (!macCheckPassed) throw new errors_js_1.JWEDecryptionFailed();
		let plaintext;
		try {
			const decipher = (0, crypto_1$13.createDecipheriv)(algorithm, encKey, iv);
			plaintext = (0, buffer_utils_js_1.concat)(decipher.update(ciphertext), decipher.final());
		} catch {}
		if (!plaintext) throw new errors_js_1.JWEDecryptionFailed();
		return plaintext;
	}
	function gcmDecrypt(enc, cek, ciphertext, iv, tag, aad) {
		const algorithm = `aes-${parseInt(enc.slice(1, 4), 10)}-gcm`;
		if (!(0, ciphers_js_1.default)(algorithm)) throw new errors_js_1.JOSENotSupported(`alg ${enc} is not supported by your javascript runtime`);
		try {
			const decipher = (0, crypto_1$13.createDecipheriv)(algorithm, cek, iv, { authTagLength: 16 });
			decipher.setAuthTag(tag);
			if (aad.byteLength) decipher.setAAD(aad, { plaintextLength: ciphertext.length });
			const plaintext = decipher.update(ciphertext);
			decipher.final();
			return plaintext;
		} catch {
			throw new errors_js_1.JWEDecryptionFailed();
		}
	}
	var decrypt = (enc, cek, ciphertext, iv, tag, aad) => {
		let key;
		if ((0, webcrypto_js_1.isCryptoKey)(cek)) {
			(0, crypto_key_js_1.checkEncCryptoKey)(cek, enc, "decrypt");
			key = crypto_1$13.KeyObject.from(cek);
		} else if (cek instanceof Uint8Array || (0, is_key_object_js_1.default)(cek)) key = cek;
		else throw new TypeError((0, invalid_key_input_js_1.default)(cek, ...is_key_like_js_1.types, "Uint8Array"));
		(0, check_cek_length_js_1.default)(enc, key);
		(0, check_iv_length_js_1.default)(enc, iv);
		switch (enc) {
			case "A128CBC-HS256":
			case "A192CBC-HS384":
			case "A256CBC-HS512": return cbcDecrypt(enc, key, ciphertext, iv, tag, aad);
			case "A128GCM":
			case "A192GCM":
			case "A256GCM": return gcmDecrypt(enc, key, ciphertext, iv, tag, aad);
			default: throw new errors_js_1.JOSENotSupported("Unsupported JWE Content Encryption Algorithm");
		}
	};
	exports.default = decrypt;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/zlib.js
var require_zlib = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.deflate = exports.inflate = void 0;
	var util_1$5 = __require("util");
	var zlib_1 = __require("zlib");
	var errors_js_1 = require_errors$2();
	var inflateRaw = (0, util_1$5.promisify)(zlib_1.inflateRaw);
	var deflateRaw = (0, util_1$5.promisify)(zlib_1.deflateRaw);
	var inflate = (input) => inflateRaw(input, { maxOutputLength: 25e4 }).catch(() => {
		throw new errors_js_1.JWEDecompressionFailed();
	});
	exports.inflate = inflate;
	var deflate = (input) => deflateRaw(input);
	exports.deflate = deflate;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/is_disjoint.js
var require_is_disjoint = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var isDisjoint = (...headers) => {
		const sources = headers.filter(Boolean);
		if (sources.length === 0 || sources.length === 1) return true;
		let acc;
		for (const header of sources) {
			const parameters = Object.keys(header);
			if (!acc || acc.size === 0) {
				acc = new Set(parameters);
				continue;
			}
			for (const parameter of parameters) {
				if (acc.has(parameter)) return false;
				acc.add(parameter);
			}
		}
		return true;
	};
	exports.default = isDisjoint;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/is_object.js
var require_is_object = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	function isObjectLike(value) {
		return typeof value === "object" && value !== null;
	}
	function isObject(input) {
		if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") return false;
		if (Object.getPrototypeOf(input) === null) return true;
		let proto = input;
		while (Object.getPrototypeOf(proto) !== null) proto = Object.getPrototypeOf(proto);
		return Object.getPrototypeOf(input) === proto;
	}
	exports.default = isObject;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/aeskw.js
var require_aeskw = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.unwrap = exports.wrap = void 0;
	var buffer_1$4 = __require("buffer");
	var crypto_1$12 = __require("crypto");
	var errors_js_1 = require_errors$2();
	var buffer_utils_js_1 = require_buffer_utils();
	var webcrypto_js_1 = require_webcrypto();
	var crypto_key_js_1 = require_crypto_key();
	var is_key_object_js_1 = require_is_key_object$1();
	var invalid_key_input_js_1 = require_invalid_key_input();
	var ciphers_js_1 = require_ciphers();
	var is_key_like_js_1 = require_is_key_like();
	function checkKeySize(key, alg) {
		if (key.symmetricKeySize << 3 !== parseInt(alg.slice(1, 4), 10)) throw new TypeError(`Invalid key size for alg: ${alg}`);
	}
	function ensureKeyObject(key, alg, usage) {
		if ((0, is_key_object_js_1.default)(key)) return key;
		if (key instanceof Uint8Array) return (0, crypto_1$12.createSecretKey)(key);
		if ((0, webcrypto_js_1.isCryptoKey)(key)) {
			(0, crypto_key_js_1.checkEncCryptoKey)(key, alg, usage);
			return crypto_1$12.KeyObject.from(key);
		}
		throw new TypeError((0, invalid_key_input_js_1.default)(key, ...is_key_like_js_1.types, "Uint8Array"));
	}
	var wrap = (alg, key, cek) => {
		const algorithm = `aes${parseInt(alg.slice(1, 4), 10)}-wrap`;
		if (!(0, ciphers_js_1.default)(algorithm)) throw new errors_js_1.JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
		const keyObject = ensureKeyObject(key, alg, "wrapKey");
		checkKeySize(keyObject, alg);
		const cipher = (0, crypto_1$12.createCipheriv)(algorithm, keyObject, buffer_1$4.Buffer.alloc(8, 166));
		return (0, buffer_utils_js_1.concat)(cipher.update(cek), cipher.final());
	};
	exports.wrap = wrap;
	var unwrap = (alg, key, encryptedKey) => {
		const algorithm = `aes${parseInt(alg.slice(1, 4), 10)}-wrap`;
		if (!(0, ciphers_js_1.default)(algorithm)) throw new errors_js_1.JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
		const keyObject = ensureKeyObject(key, alg, "unwrapKey");
		checkKeySize(keyObject, alg);
		const cipher = (0, crypto_1$12.createDecipheriv)(algorithm, keyObject, buffer_1$4.Buffer.alloc(8, 166));
		return (0, buffer_utils_js_1.concat)(cipher.update(encryptedKey), cipher.final());
	};
	exports.unwrap = unwrap;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/get_named_curve.js
var require_get_named_curve = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.setCurve = exports.weakMap = void 0;
	var buffer_1$3 = __require("buffer");
	var crypto_1$11 = __require("crypto");
	var errors_js_1 = require_errors$2();
	var webcrypto_js_1 = require_webcrypto();
	var is_key_object_js_1 = require_is_key_object$1();
	var invalid_key_input_js_1 = require_invalid_key_input();
	var is_key_like_js_1 = require_is_key_like();
	var p256 = buffer_1$3.Buffer.from([
		42,
		134,
		72,
		206,
		61,
		3,
		1,
		7
	]);
	var p384 = buffer_1$3.Buffer.from([
		43,
		129,
		4,
		0,
		34
	]);
	var p521 = buffer_1$3.Buffer.from([
		43,
		129,
		4,
		0,
		35
	]);
	var secp256k1 = buffer_1$3.Buffer.from([
		43,
		129,
		4,
		0,
		10
	]);
	exports.weakMap = /* @__PURE__ */ new WeakMap();
	var namedCurveToJOSE = (namedCurve) => {
		switch (namedCurve) {
			case "prime256v1": return "P-256";
			case "secp384r1": return "P-384";
			case "secp521r1": return "P-521";
			case "secp256k1": return "secp256k1";
			default: throw new errors_js_1.JOSENotSupported("Unsupported key curve for this operation");
		}
	};
	var getNamedCurve = (kee, raw) => {
		var _a;
		let key;
		if ((0, webcrypto_js_1.isCryptoKey)(kee)) key = crypto_1$11.KeyObject.from(kee);
		else if ((0, is_key_object_js_1.default)(kee)) key = kee;
		else throw new TypeError((0, invalid_key_input_js_1.default)(kee, ...is_key_like_js_1.types));
		if (key.type === "secret") throw new TypeError("only \"private\" or \"public\" type keys can be used for this operation");
		switch (key.asymmetricKeyType) {
			case "ed25519":
			case "ed448": return `Ed${key.asymmetricKeyType.slice(2)}`;
			case "x25519":
			case "x448": return `X${key.asymmetricKeyType.slice(1)}`;
			case "ec": {
				if (exports.weakMap.has(key)) return exports.weakMap.get(key);
				let namedCurve = (_a = key.asymmetricKeyDetails) === null || _a === void 0 ? void 0 : _a.namedCurve;
				if (!namedCurve && key.type === "private") namedCurve = getNamedCurve((0, crypto_1$11.createPublicKey)(key), true);
				else if (!namedCurve) {
					const buf = key.export({
						format: "der",
						type: "spki"
					});
					const i = buf[1] < 128 ? 14 : 15;
					const len = buf[i];
					const curveOid = buf.slice(i + 1, i + 1 + len);
					if (curveOid.equals(p256)) namedCurve = "prime256v1";
					else if (curveOid.equals(p384)) namedCurve = "secp384r1";
					else if (curveOid.equals(p521)) namedCurve = "secp521r1";
					else if (curveOid.equals(secp256k1)) namedCurve = "secp256k1";
					else throw new errors_js_1.JOSENotSupported("Unsupported key curve for this operation");
				}
				if (raw) return namedCurve;
				const curve = namedCurveToJOSE(namedCurve);
				exports.weakMap.set(key, curve);
				return curve;
			}
			default: throw new TypeError("Invalid asymmetric key type for this operation");
		}
	};
	function setCurve(keyObject, curve) {
		exports.weakMap.set(keyObject, curve);
	}
	exports.setCurve = setCurve;
	exports.default = getNamedCurve;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/ecdhes.js
var require_ecdhes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ecdhAllowed = exports.generateEpk = exports.deriveKey = void 0;
	var crypto_1$10 = __require("crypto");
	var util_1$4 = __require("util");
	var get_named_curve_js_1 = require_get_named_curve();
	var buffer_utils_js_1 = require_buffer_utils();
	var errors_js_1 = require_errors$2();
	var webcrypto_js_1 = require_webcrypto();
	var crypto_key_js_1 = require_crypto_key();
	var is_key_object_js_1 = require_is_key_object$1();
	var invalid_key_input_js_1 = require_invalid_key_input();
	var is_key_like_js_1 = require_is_key_like();
	var generateKeyPair = (0, util_1$4.promisify)(crypto_1$10.generateKeyPair);
	async function deriveKey(publicKee, privateKee, algorithm, keyLength, apu = new Uint8Array(0), apv = new Uint8Array(0)) {
		let publicKey;
		if ((0, webcrypto_js_1.isCryptoKey)(publicKee)) {
			(0, crypto_key_js_1.checkEncCryptoKey)(publicKee, "ECDH");
			publicKey = crypto_1$10.KeyObject.from(publicKee);
		} else if ((0, is_key_object_js_1.default)(publicKee)) publicKey = publicKee;
		else throw new TypeError((0, invalid_key_input_js_1.default)(publicKee, ...is_key_like_js_1.types));
		let privateKey;
		if ((0, webcrypto_js_1.isCryptoKey)(privateKee)) {
			(0, crypto_key_js_1.checkEncCryptoKey)(privateKee, "ECDH", "deriveBits");
			privateKey = crypto_1$10.KeyObject.from(privateKee);
		} else if ((0, is_key_object_js_1.default)(privateKee)) privateKey = privateKee;
		else throw new TypeError((0, invalid_key_input_js_1.default)(privateKee, ...is_key_like_js_1.types));
		const value = (0, buffer_utils_js_1.concat)((0, buffer_utils_js_1.lengthAndInput)(buffer_utils_js_1.encoder.encode(algorithm)), (0, buffer_utils_js_1.lengthAndInput)(apu), (0, buffer_utils_js_1.lengthAndInput)(apv), (0, buffer_utils_js_1.uint32be)(keyLength));
		const sharedSecret = (0, crypto_1$10.diffieHellman)({
			privateKey,
			publicKey
		});
		return (0, buffer_utils_js_1.concatKdf)(sharedSecret, keyLength, value);
	}
	exports.deriveKey = deriveKey;
	async function generateEpk(kee) {
		let key;
		if ((0, webcrypto_js_1.isCryptoKey)(kee)) key = crypto_1$10.KeyObject.from(kee);
		else if ((0, is_key_object_js_1.default)(kee)) key = kee;
		else throw new TypeError((0, invalid_key_input_js_1.default)(kee, ...is_key_like_js_1.types));
		switch (key.asymmetricKeyType) {
			case "x25519": return generateKeyPair("x25519");
			case "x448": return generateKeyPair("x448");
			case "ec": return generateKeyPair("ec", { namedCurve: (0, get_named_curve_js_1.default)(key) });
			default: throw new errors_js_1.JOSENotSupported("Invalid or unsupported EPK");
		}
	}
	exports.generateEpk = generateEpk;
	var ecdhAllowed = (key) => [
		"P-256",
		"P-384",
		"P-521",
		"X25519",
		"X448"
	].includes((0, get_named_curve_js_1.default)(key));
	exports.ecdhAllowed = ecdhAllowed;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/check_p2s.js
var require_check_p2s = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var errors_js_1 = require_errors$2();
	function checkP2s(p2s) {
		if (!(p2s instanceof Uint8Array) || p2s.length < 8) throw new errors_js_1.JWEInvalid("PBES2 Salt Input must be 8 or more octets");
	}
	exports.default = checkP2s;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/pbes2kw.js
var require_pbes2kw = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decrypt = exports.encrypt = void 0;
	var util_1$3 = __require("util");
	var crypto_1$9 = __require("crypto");
	var random_js_1 = require_random();
	var buffer_utils_js_1 = require_buffer_utils();
	var base64url_js_1 = require_base64url$2();
	var aeskw_js_1 = require_aeskw();
	var check_p2s_js_1 = require_check_p2s();
	var webcrypto_js_1 = require_webcrypto();
	var crypto_key_js_1 = require_crypto_key();
	var is_key_object_js_1 = require_is_key_object$1();
	var invalid_key_input_js_1 = require_invalid_key_input();
	var is_key_like_js_1 = require_is_key_like();
	var pbkdf2 = (0, util_1$3.promisify)(crypto_1$9.pbkdf2);
	function getPassword(key, alg) {
		if ((0, is_key_object_js_1.default)(key)) return key.export();
		if (key instanceof Uint8Array) return key;
		if ((0, webcrypto_js_1.isCryptoKey)(key)) {
			(0, crypto_key_js_1.checkEncCryptoKey)(key, alg, "deriveBits", "deriveKey");
			return crypto_1$9.KeyObject.from(key).export();
		}
		throw new TypeError((0, invalid_key_input_js_1.default)(key, ...is_key_like_js_1.types, "Uint8Array"));
	}
	var encrypt = async (alg, key, cek, p2c = 2048, p2s = (0, random_js_1.default)(new Uint8Array(16))) => {
		(0, check_p2s_js_1.default)(p2s);
		const salt = (0, buffer_utils_js_1.p2s)(alg, p2s);
		const keylen = parseInt(alg.slice(13, 16), 10) >> 3;
		const derivedKey = await pbkdf2(getPassword(key, alg), salt, p2c, keylen, `sha${alg.slice(8, 11)}`);
		return {
			encryptedKey: await (0, aeskw_js_1.wrap)(alg.slice(-6), derivedKey, cek),
			p2c,
			p2s: (0, base64url_js_1.encode)(p2s)
		};
	};
	exports.encrypt = encrypt;
	var decrypt = async (alg, key, encryptedKey, p2c, p2s) => {
		(0, check_p2s_js_1.default)(p2s);
		const salt = (0, buffer_utils_js_1.p2s)(alg, p2s);
		const keylen = parseInt(alg.slice(13, 16), 10) >> 3;
		const derivedKey = await pbkdf2(getPassword(key, alg), salt, p2c, keylen, `sha${alg.slice(8, 11)}`);
		return (0, aeskw_js_1.unwrap)(alg.slice(-6), derivedKey, encryptedKey);
	};
	exports.decrypt = decrypt;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/check_modulus_length.js
var require_check_modulus_length = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.setModulusLength = exports.weakMap = void 0;
	exports.weakMap = /* @__PURE__ */ new WeakMap();
	var getLength = (buf, index) => {
		let len = buf.readUInt8(1);
		if ((len & 128) === 0) {
			if (index === 0) return len;
			return getLength(buf.subarray(2 + len), index - 1);
		}
		const num = len & 127;
		len = 0;
		for (let i = 0; i < num; i++) {
			len <<= 8;
			const j = buf.readUInt8(2 + i);
			len |= j;
		}
		if (index === 0) return len;
		return getLength(buf.subarray(2 + len), index - 1);
	};
	var getLengthOfSeqIndex = (sequence, index) => {
		const len = sequence.readUInt8(1);
		if ((len & 128) === 0) return getLength(sequence.subarray(2), index);
		const num = len & 127;
		return getLength(sequence.subarray(2 + num), index);
	};
	var getModulusLength = (key) => {
		var _a, _b;
		if (exports.weakMap.has(key)) return exports.weakMap.get(key);
		const modulusLength = (_b = (_a = key.asymmetricKeyDetails) === null || _a === void 0 ? void 0 : _a.modulusLength) !== null && _b !== void 0 ? _b : getLengthOfSeqIndex(key.export({
			format: "der",
			type: "pkcs1"
		}), key.type === "private" ? 1 : 0) - 1 << 3;
		exports.weakMap.set(key, modulusLength);
		return modulusLength;
	};
	var setModulusLength = (keyObject, modulusLength) => {
		exports.weakMap.set(keyObject, modulusLength);
	};
	exports.setModulusLength = setModulusLength;
	exports.default = (key, alg) => {
		if (getModulusLength(key) < 2048) throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
	};
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/rsaes.js
var require_rsaes = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decrypt = exports.encrypt = void 0;
	var crypto_1$8 = __require("crypto");
	var check_modulus_length_js_1 = require_check_modulus_length();
	var webcrypto_js_1 = require_webcrypto();
	var crypto_key_js_1 = require_crypto_key();
	var is_key_object_js_1 = require_is_key_object$1();
	var invalid_key_input_js_1 = require_invalid_key_input();
	var is_key_like_js_1 = require_is_key_like();
	var checkKey = (key, alg) => {
		if (key.asymmetricKeyType !== "rsa") throw new TypeError("Invalid key for this operation, its asymmetricKeyType must be rsa");
		(0, check_modulus_length_js_1.default)(key, alg);
	};
	var resolvePadding = (alg) => {
		switch (alg) {
			case "RSA-OAEP":
			case "RSA-OAEP-256":
			case "RSA-OAEP-384":
			case "RSA-OAEP-512": return crypto_1$8.constants.RSA_PKCS1_OAEP_PADDING;
			case "RSA1_5": return crypto_1$8.constants.RSA_PKCS1_PADDING;
			default: return;
		}
	};
	var resolveOaepHash = (alg) => {
		switch (alg) {
			case "RSA-OAEP": return "sha1";
			case "RSA-OAEP-256": return "sha256";
			case "RSA-OAEP-384": return "sha384";
			case "RSA-OAEP-512": return "sha512";
			default: return;
		}
	};
	function ensureKeyObject(key, alg, ...usages) {
		if ((0, is_key_object_js_1.default)(key)) return key;
		if ((0, webcrypto_js_1.isCryptoKey)(key)) {
			(0, crypto_key_js_1.checkEncCryptoKey)(key, alg, ...usages);
			return crypto_1$8.KeyObject.from(key);
		}
		throw new TypeError((0, invalid_key_input_js_1.default)(key, ...is_key_like_js_1.types));
	}
	var encrypt = (alg, key, cek) => {
		const padding = resolvePadding(alg);
		const oaepHash = resolveOaepHash(alg);
		const keyObject = ensureKeyObject(key, alg, "wrapKey", "encrypt");
		checkKey(keyObject, alg);
		return (0, crypto_1$8.publicEncrypt)({
			key: keyObject,
			oaepHash,
			padding
		}, cek);
	};
	exports.encrypt = encrypt;
	var decrypt = (alg, key, encryptedKey) => {
		const padding = resolvePadding(alg);
		const oaepHash = resolveOaepHash(alg);
		const keyObject = ensureKeyObject(key, alg, "unwrapKey", "decrypt");
		checkKey(keyObject, alg);
		return (0, crypto_1$8.privateDecrypt)({
			key: keyObject,
			oaepHash,
			padding
		}, encryptedKey);
	};
	exports.decrypt = decrypt;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/cek.js
var require_cek = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.bitLength = void 0;
	var errors_js_1 = require_errors$2();
	var random_js_1 = require_random();
	function bitLength(alg) {
		switch (alg) {
			case "A128GCM": return 128;
			case "A192GCM": return 192;
			case "A256GCM":
			case "A128CBC-HS256": return 256;
			case "A192CBC-HS384": return 384;
			case "A256CBC-HS512": return 512;
			default: throw new errors_js_1.JOSENotSupported(`Unsupported JWE Algorithm: ${alg}`);
		}
	}
	exports.bitLength = bitLength;
	exports.default = (alg) => (0, random_js_1.default)(new Uint8Array(bitLength(alg) >> 3));
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/asn1.js
var require_asn1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.fromX509 = exports.fromSPKI = exports.fromPKCS8 = exports.toPKCS8 = exports.toSPKI = void 0;
	var crypto_1$7 = __require("crypto");
	var buffer_1$2 = __require("buffer");
	var webcrypto_js_1 = require_webcrypto();
	var is_key_object_js_1 = require_is_key_object$1();
	var invalid_key_input_js_1 = require_invalid_key_input();
	var is_key_like_js_1 = require_is_key_like();
	var genericExport = (keyType, keyFormat, key) => {
		let keyObject;
		if ((0, webcrypto_js_1.isCryptoKey)(key)) {
			if (!key.extractable) throw new TypeError("CryptoKey is not extractable");
			keyObject = crypto_1$7.KeyObject.from(key);
		} else if ((0, is_key_object_js_1.default)(key)) keyObject = key;
		else throw new TypeError((0, invalid_key_input_js_1.default)(key, ...is_key_like_js_1.types));
		if (keyObject.type !== keyType) throw new TypeError(`key is not a ${keyType} key`);
		return keyObject.export({
			format: "pem",
			type: keyFormat
		});
	};
	var toSPKI = (key) => {
		return genericExport("public", "spki", key);
	};
	exports.toSPKI = toSPKI;
	var toPKCS8 = (key) => {
		return genericExport("private", "pkcs8", key);
	};
	exports.toPKCS8 = toPKCS8;
	var fromPKCS8 = (pem) => (0, crypto_1$7.createPrivateKey)({
		key: buffer_1$2.Buffer.from(pem.replace(/(?:-----(?:BEGIN|END) PRIVATE KEY-----|\s)/g, ""), "base64"),
		type: "pkcs8",
		format: "der"
	});
	exports.fromPKCS8 = fromPKCS8;
	var fromSPKI = (pem) => (0, crypto_1$7.createPublicKey)({
		key: buffer_1$2.Buffer.from(pem.replace(/(?:-----(?:BEGIN|END) PUBLIC KEY-----|\s)/g, ""), "base64"),
		type: "spki",
		format: "der"
	});
	exports.fromSPKI = fromSPKI;
	var fromX509 = (pem) => (0, crypto_1$7.createPublicKey)({
		key: pem,
		type: "spki",
		format: "pem"
	});
	exports.fromX509 = fromX509;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/asn1_sequence_encoder.js
var require_asn1_sequence_encoder = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var buffer_1$1 = __require("buffer");
	var errors_js_1 = require_errors$2();
	var tagInteger = 2;
	var tagBitStr = 3;
	var tagOctStr = 4;
	var tagSequence = 48;
	var bZero = buffer_1$1.Buffer.from([0]);
	var bTagInteger = buffer_1$1.Buffer.from([tagInteger]);
	var bTagBitStr = buffer_1$1.Buffer.from([tagBitStr]);
	var bTagSequence = buffer_1$1.Buffer.from([tagSequence]);
	var bTagOctStr = buffer_1$1.Buffer.from([tagOctStr]);
	var encodeLength = (len) => {
		if (len < 128) return buffer_1$1.Buffer.from([len]);
		const buffer = buffer_1$1.Buffer.alloc(5);
		buffer.writeUInt32BE(len, 1);
		let offset = 1;
		while (buffer[offset] === 0) offset++;
		buffer[offset - 1] = 128 | 5 - offset;
		return buffer.slice(offset - 1);
	};
	var oids = new Map([
		["P-256", buffer_1$1.Buffer.from("06 08 2A 86 48 CE 3D 03 01 07".replace(/ /g, ""), "hex")],
		["secp256k1", buffer_1$1.Buffer.from("06 05 2B 81 04 00 0A".replace(/ /g, ""), "hex")],
		["P-384", buffer_1$1.Buffer.from("06 05 2B 81 04 00 22".replace(/ /g, ""), "hex")],
		["P-521", buffer_1$1.Buffer.from("06 05 2B 81 04 00 23".replace(/ /g, ""), "hex")],
		["ecPublicKey", buffer_1$1.Buffer.from("06 07 2A 86 48 CE 3D 02 01".replace(/ /g, ""), "hex")],
		["X25519", buffer_1$1.Buffer.from("06 03 2B 65 6E".replace(/ /g, ""), "hex")],
		["X448", buffer_1$1.Buffer.from("06 03 2B 65 6F".replace(/ /g, ""), "hex")],
		["Ed25519", buffer_1$1.Buffer.from("06 03 2B 65 70".replace(/ /g, ""), "hex")],
		["Ed448", buffer_1$1.Buffer.from("06 03 2B 65 71".replace(/ /g, ""), "hex")]
	]);
	var DumbAsn1Encoder = class {
		constructor() {
			this.length = 0;
			this.elements = [];
		}
		oidFor(oid) {
			const bOid = oids.get(oid);
			if (!bOid) throw new errors_js_1.JOSENotSupported("Invalid or unsupported OID");
			this.elements.push(bOid);
			this.length += bOid.length;
		}
		zero() {
			this.elements.push(bTagInteger, buffer_1$1.Buffer.from([1]), bZero);
			this.length += 3;
		}
		one() {
			this.elements.push(bTagInteger, buffer_1$1.Buffer.from([1]), buffer_1$1.Buffer.from([1]));
			this.length += 3;
		}
		unsignedInteger(integer) {
			if (integer[0] & 128) {
				const len = encodeLength(integer.length + 1);
				this.elements.push(bTagInteger, len, bZero, integer);
				this.length += 2 + len.length + integer.length;
			} else {
				let i = 0;
				while (integer[i] === 0 && (integer[i + 1] & 128) === 0) i++;
				const len = encodeLength(integer.length - i);
				this.elements.push(bTagInteger, encodeLength(integer.length - i), integer.slice(i));
				this.length += 1 + len.length + integer.length - i;
			}
		}
		octStr(octStr) {
			const len = encodeLength(octStr.length);
			this.elements.push(bTagOctStr, encodeLength(octStr.length), octStr);
			this.length += 1 + len.length + octStr.length;
		}
		bitStr(bitS) {
			const len = encodeLength(bitS.length + 1);
			this.elements.push(bTagBitStr, encodeLength(bitS.length + 1), bZero, bitS);
			this.length += 1 + len.length + bitS.length + 1;
		}
		add(seq) {
			this.elements.push(seq);
			this.length += seq.length;
		}
		end(tag = bTagSequence) {
			const len = encodeLength(this.length);
			return buffer_1$1.Buffer.concat([
				tag,
				len,
				...this.elements
			], 1 + len.length + this.length);
		}
	};
	exports.default = DumbAsn1Encoder;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/flags.js
var require_flags = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.jwkImport = exports.jwkExport = exports.rsaPssParams = exports.oneShotCallback = void 0;
	var [major, minor] = process.versions.node.split(".").map((str) => parseInt(str, 10));
	exports.oneShotCallback = major >= 16 || major === 15 && minor >= 13;
	exports.rsaPssParams = !("electron" in process.versions) && (major >= 17 || major === 16 && minor >= 9);
	exports.jwkExport = major >= 16 || major === 15 && minor >= 9;
	exports.jwkImport = major >= 16 || major === 15 && minor >= 12;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/jwk_to_key.js
var require_jwk_to_key = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var buffer_1 = __require("buffer");
	var crypto_1$6 = __require("crypto");
	var base64url_js_1 = require_base64url$2();
	var errors_js_1 = require_errors$2();
	var get_named_curve_js_1 = require_get_named_curve();
	var check_modulus_length_js_1 = require_check_modulus_length();
	var asn1_sequence_encoder_js_1 = require_asn1_sequence_encoder();
	var flags_js_1 = require_flags();
	var parse = (jwk) => {
		if (flags_js_1.jwkImport && jwk.kty !== "oct") return jwk.d ? (0, crypto_1$6.createPrivateKey)({
			format: "jwk",
			key: jwk
		}) : (0, crypto_1$6.createPublicKey)({
			format: "jwk",
			key: jwk
		});
		switch (jwk.kty) {
			case "oct": return (0, crypto_1$6.createSecretKey)((0, base64url_js_1.decode)(jwk.k));
			case "RSA": {
				const enc = new asn1_sequence_encoder_js_1.default();
				const isPrivate = jwk.d !== void 0;
				const modulus = buffer_1.Buffer.from(jwk.n, "base64");
				const exponent = buffer_1.Buffer.from(jwk.e, "base64");
				if (isPrivate) {
					enc.zero();
					enc.unsignedInteger(modulus);
					enc.unsignedInteger(exponent);
					enc.unsignedInteger(buffer_1.Buffer.from(jwk.d, "base64"));
					enc.unsignedInteger(buffer_1.Buffer.from(jwk.p, "base64"));
					enc.unsignedInteger(buffer_1.Buffer.from(jwk.q, "base64"));
					enc.unsignedInteger(buffer_1.Buffer.from(jwk.dp, "base64"));
					enc.unsignedInteger(buffer_1.Buffer.from(jwk.dq, "base64"));
					enc.unsignedInteger(buffer_1.Buffer.from(jwk.qi, "base64"));
				} else {
					enc.unsignedInteger(modulus);
					enc.unsignedInteger(exponent);
				}
				const createInput = {
					key: enc.end(),
					format: "der",
					type: "pkcs1"
				};
				const keyObject = isPrivate ? (0, crypto_1$6.createPrivateKey)(createInput) : (0, crypto_1$6.createPublicKey)(createInput);
				(0, check_modulus_length_js_1.setModulusLength)(keyObject, modulus.length << 3);
				return keyObject;
			}
			case "EC": {
				const enc = new asn1_sequence_encoder_js_1.default();
				const isPrivate = jwk.d !== void 0;
				const pub = buffer_1.Buffer.concat([
					buffer_1.Buffer.alloc(1, 4),
					buffer_1.Buffer.from(jwk.x, "base64"),
					buffer_1.Buffer.from(jwk.y, "base64")
				]);
				if (isPrivate) {
					enc.zero();
					const enc$1 = new asn1_sequence_encoder_js_1.default();
					enc$1.oidFor("ecPublicKey");
					enc$1.oidFor(jwk.crv);
					enc.add(enc$1.end());
					const enc$2 = new asn1_sequence_encoder_js_1.default();
					enc$2.one();
					enc$2.octStr(buffer_1.Buffer.from(jwk.d, "base64"));
					const enc$3 = new asn1_sequence_encoder_js_1.default();
					enc$3.bitStr(pub);
					const f2 = enc$3.end(buffer_1.Buffer.from([161]));
					enc$2.add(f2);
					const f = enc$2.end();
					const enc$4 = new asn1_sequence_encoder_js_1.default();
					enc$4.add(f);
					const f3 = enc$4.end(buffer_1.Buffer.from([4]));
					enc.add(f3);
					const der = enc.end();
					const keyObject = (0, crypto_1$6.createPrivateKey)({
						key: der,
						format: "der",
						type: "pkcs8"
					});
					(0, get_named_curve_js_1.setCurve)(keyObject, jwk.crv);
					return keyObject;
				}
				const enc$1 = new asn1_sequence_encoder_js_1.default();
				enc$1.oidFor("ecPublicKey");
				enc$1.oidFor(jwk.crv);
				enc.add(enc$1.end());
				enc.bitStr(pub);
				const der = enc.end();
				const keyObject = (0, crypto_1$6.createPublicKey)({
					key: der,
					format: "der",
					type: "spki"
				});
				(0, get_named_curve_js_1.setCurve)(keyObject, jwk.crv);
				return keyObject;
			}
			case "OKP": {
				const enc = new asn1_sequence_encoder_js_1.default();
				if (jwk.d !== void 0) {
					enc.zero();
					const enc$1 = new asn1_sequence_encoder_js_1.default();
					enc$1.oidFor(jwk.crv);
					enc.add(enc$1.end());
					const enc$2 = new asn1_sequence_encoder_js_1.default();
					enc$2.octStr(buffer_1.Buffer.from(jwk.d, "base64"));
					const f = enc$2.end(buffer_1.Buffer.from([4]));
					enc.add(f);
					const der = enc.end();
					return (0, crypto_1$6.createPrivateKey)({
						key: der,
						format: "der",
						type: "pkcs8"
					});
				}
				const enc$1 = new asn1_sequence_encoder_js_1.default();
				enc$1.oidFor(jwk.crv);
				enc.add(enc$1.end());
				enc.bitStr(buffer_1.Buffer.from(jwk.x, "base64"));
				const der = enc.end();
				return (0, crypto_1$6.createPublicKey)({
					key: der,
					format: "der",
					type: "spki"
				});
			}
			default: throw new errors_js_1.JOSENotSupported("Invalid or unsupported JWK \"kty\" (Key Type) Parameter value");
		}
	};
	exports.default = parse;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/key/import.js
var require_import = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.importJWK = exports.importPKCS8 = exports.importX509 = exports.importSPKI = void 0;
	var base64url_js_1 = require_base64url$2();
	var asn1_js_1 = require_asn1();
	var jwk_to_key_js_1 = require_jwk_to_key();
	var errors_js_1 = require_errors$2();
	var is_object_js_1 = require_is_object();
	async function importSPKI(spki, alg, options) {
		if (typeof spki !== "string" || spki.indexOf("-----BEGIN PUBLIC KEY-----") !== 0) throw new TypeError("\"spki\" must be SPKI formatted string");
		return (0, asn1_js_1.fromSPKI)(spki, alg, options);
	}
	exports.importSPKI = importSPKI;
	async function importX509(x509, alg, options) {
		if (typeof x509 !== "string" || x509.indexOf("-----BEGIN CERTIFICATE-----") !== 0) throw new TypeError("\"x509\" must be X.509 formatted string");
		return (0, asn1_js_1.fromX509)(x509, alg, options);
	}
	exports.importX509 = importX509;
	async function importPKCS8(pkcs8, alg, options) {
		if (typeof pkcs8 !== "string" || pkcs8.indexOf("-----BEGIN PRIVATE KEY-----") !== 0) throw new TypeError("\"pkcs8\" must be PKCS#8 formatted string");
		return (0, asn1_js_1.fromPKCS8)(pkcs8, alg, options);
	}
	exports.importPKCS8 = importPKCS8;
	async function importJWK(jwk, alg, octAsKeyObject) {
		var _a;
		if (!(0, is_object_js_1.default)(jwk)) throw new TypeError("JWK must be an object");
		alg || (alg = jwk.alg);
		switch (jwk.kty) {
			case "oct":
				if (typeof jwk.k !== "string" || !jwk.k) throw new TypeError("missing \"k\" (Key Value) Parameter value");
				octAsKeyObject !== null && octAsKeyObject !== void 0 || (octAsKeyObject = jwk.ext !== true);
				if (octAsKeyObject) return (0, jwk_to_key_js_1.default)({
					...jwk,
					alg,
					ext: (_a = jwk.ext) !== null && _a !== void 0 ? _a : false
				});
				return (0, base64url_js_1.decode)(jwk.k);
			case "RSA": if (jwk.oth !== void 0) throw new errors_js_1.JOSENotSupported("RSA JWK \"oth\" (Other Primes Info) Parameter value is not supported");
			case "EC":
			case "OKP": return (0, jwk_to_key_js_1.default)({
				...jwk,
				alg
			});
			default: throw new errors_js_1.JOSENotSupported("Unsupported \"kty\" (Key Type) Parameter value");
		}
	}
	exports.importJWK = importJWK;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/check_key_type.js
var require_check_key_type = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var invalid_key_input_js_1 = require_invalid_key_input();
	var is_key_like_js_1 = require_is_key_like();
	var symmetricTypeCheck = (alg, key) => {
		if (key instanceof Uint8Array) return;
		if (!(0, is_key_like_js_1.default)(key)) throw new TypeError((0, invalid_key_input_js_1.withAlg)(alg, key, ...is_key_like_js_1.types, "Uint8Array"));
		if (key.type !== "secret") throw new TypeError(`${is_key_like_js_1.types.join(" or ")} instances for symmetric algorithms must be of type "secret"`);
	};
	var asymmetricTypeCheck = (alg, key, usage) => {
		if (!(0, is_key_like_js_1.default)(key)) throw new TypeError((0, invalid_key_input_js_1.withAlg)(alg, key, ...is_key_like_js_1.types));
		if (key.type === "secret") throw new TypeError(`${is_key_like_js_1.types.join(" or ")} instances for asymmetric algorithms must not be of type "secret"`);
		if (usage === "sign" && key.type === "public") throw new TypeError(`${is_key_like_js_1.types.join(" or ")} instances for asymmetric algorithm signing must be of type "private"`);
		if (usage === "decrypt" && key.type === "public") throw new TypeError(`${is_key_like_js_1.types.join(" or ")} instances for asymmetric algorithm decryption must be of type "private"`);
		if (key.algorithm && usage === "verify" && key.type === "private") throw new TypeError(`${is_key_like_js_1.types.join(" or ")} instances for asymmetric algorithm verifying must be of type "public"`);
		if (key.algorithm && usage === "encrypt" && key.type === "private") throw new TypeError(`${is_key_like_js_1.types.join(" or ")} instances for asymmetric algorithm encryption must be of type "public"`);
	};
	var checkKeyType = (alg, key, usage) => {
		if (alg.startsWith("HS") || alg === "dir" || alg.startsWith("PBES2") || /^A\d{3}(?:GCM)?KW$/.test(alg)) symmetricTypeCheck(alg, key);
		else asymmetricTypeCheck(alg, key, usage);
	};
	exports.default = checkKeyType;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/encrypt.js
var require_encrypt$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var crypto_1$5 = __require("crypto");
	var check_iv_length_js_1 = require_check_iv_length();
	var check_cek_length_js_1 = require_check_cek_length();
	var buffer_utils_js_1 = require_buffer_utils();
	var cbc_tag_js_1 = require_cbc_tag();
	var webcrypto_js_1 = require_webcrypto();
	var crypto_key_js_1 = require_crypto_key();
	var is_key_object_js_1 = require_is_key_object$1();
	var invalid_key_input_js_1 = require_invalid_key_input();
	var errors_js_1 = require_errors$2();
	var ciphers_js_1 = require_ciphers();
	var is_key_like_js_1 = require_is_key_like();
	function cbcEncrypt(enc, plaintext, cek, iv, aad) {
		const keySize = parseInt(enc.slice(1, 4), 10);
		if ((0, is_key_object_js_1.default)(cek)) cek = cek.export();
		const encKey = cek.subarray(keySize >> 3);
		const macKey = cek.subarray(0, keySize >> 3);
		const algorithm = `aes-${keySize}-cbc`;
		if (!(0, ciphers_js_1.default)(algorithm)) throw new errors_js_1.JOSENotSupported(`alg ${enc} is not supported by your javascript runtime`);
		const cipher = (0, crypto_1$5.createCipheriv)(algorithm, encKey, iv);
		const ciphertext = (0, buffer_utils_js_1.concat)(cipher.update(plaintext), cipher.final());
		const macSize = parseInt(enc.slice(-3), 10);
		return {
			ciphertext,
			tag: (0, cbc_tag_js_1.default)(aad, iv, ciphertext, macSize, macKey, keySize)
		};
	}
	function gcmEncrypt(enc, plaintext, cek, iv, aad) {
		const algorithm = `aes-${parseInt(enc.slice(1, 4), 10)}-gcm`;
		if (!(0, ciphers_js_1.default)(algorithm)) throw new errors_js_1.JOSENotSupported(`alg ${enc} is not supported by your javascript runtime`);
		const cipher = (0, crypto_1$5.createCipheriv)(algorithm, cek, iv, { authTagLength: 16 });
		if (aad.byteLength) cipher.setAAD(aad, { plaintextLength: plaintext.length });
		const ciphertext = cipher.update(plaintext);
		cipher.final();
		return {
			ciphertext,
			tag: cipher.getAuthTag()
		};
	}
	var encrypt = (enc, plaintext, cek, iv, aad) => {
		let key;
		if ((0, webcrypto_js_1.isCryptoKey)(cek)) {
			(0, crypto_key_js_1.checkEncCryptoKey)(cek, enc, "encrypt");
			key = crypto_1$5.KeyObject.from(cek);
		} else if (cek instanceof Uint8Array || (0, is_key_object_js_1.default)(cek)) key = cek;
		else throw new TypeError((0, invalid_key_input_js_1.default)(cek, ...is_key_like_js_1.types, "Uint8Array"));
		(0, check_cek_length_js_1.default)(enc, key);
		(0, check_iv_length_js_1.default)(enc, iv);
		switch (enc) {
			case "A128CBC-HS256":
			case "A192CBC-HS384":
			case "A256CBC-HS512": return cbcEncrypt(enc, plaintext, key, iv, aad);
			case "A128GCM":
			case "A192GCM":
			case "A256GCM": return gcmEncrypt(enc, plaintext, key, iv, aad);
			default: throw new errors_js_1.JOSENotSupported("Unsupported JWE Content Encryption Algorithm");
		}
	};
	exports.default = encrypt;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/aesgcmkw.js
var require_aesgcmkw = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.unwrap = exports.wrap = void 0;
	var encrypt_js_1 = require_encrypt$4();
	var decrypt_js_1 = require_decrypt$4();
	var iv_js_1 = require_iv();
	var base64url_js_1 = require_base64url$2();
	async function wrap(alg, key, cek, iv) {
		const jweAlgorithm = alg.slice(0, 7);
		iv || (iv = (0, iv_js_1.default)(jweAlgorithm));
		const { ciphertext: encryptedKey, tag } = await (0, encrypt_js_1.default)(jweAlgorithm, cek, key, iv, new Uint8Array(0));
		return {
			encryptedKey,
			iv: (0, base64url_js_1.encode)(iv),
			tag: (0, base64url_js_1.encode)(tag)
		};
	}
	exports.wrap = wrap;
	async function unwrap(alg, key, encryptedKey, iv, tag) {
		const jweAlgorithm = alg.slice(0, 7);
		return (0, decrypt_js_1.default)(jweAlgorithm, key, encryptedKey, iv, tag, new Uint8Array(0));
	}
	exports.unwrap = unwrap;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/decrypt_key_management.js
var require_decrypt_key_management = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var aeskw_js_1 = require_aeskw();
	var ECDH = require_ecdhes();
	var pbes2kw_js_1 = require_pbes2kw();
	var rsaes_js_1 = require_rsaes();
	var base64url_js_1 = require_base64url$2();
	var errors_js_1 = require_errors$2();
	var cek_js_1 = require_cek();
	var import_js_1 = require_import();
	var check_key_type_js_1 = require_check_key_type();
	var is_object_js_1 = require_is_object();
	var aesgcmkw_js_1 = require_aesgcmkw();
	async function decryptKeyManagement(alg, key, encryptedKey, joseHeader, options) {
		(0, check_key_type_js_1.default)(alg, key, "decrypt");
		switch (alg) {
			case "dir":
				if (encryptedKey !== void 0) throw new errors_js_1.JWEInvalid("Encountered unexpected JWE Encrypted Key");
				return key;
			case "ECDH-ES": if (encryptedKey !== void 0) throw new errors_js_1.JWEInvalid("Encountered unexpected JWE Encrypted Key");
			case "ECDH-ES+A128KW":
			case "ECDH-ES+A192KW":
			case "ECDH-ES+A256KW": {
				if (!(0, is_object_js_1.default)(joseHeader.epk)) throw new errors_js_1.JWEInvalid(`JOSE Header "epk" (Ephemeral Public Key) missing or invalid`);
				if (!ECDH.ecdhAllowed(key)) throw new errors_js_1.JOSENotSupported("ECDH with the provided key is not allowed or not supported by your javascript runtime");
				const epk = await (0, import_js_1.importJWK)(joseHeader.epk, alg);
				let partyUInfo;
				let partyVInfo;
				if (joseHeader.apu !== void 0) {
					if (typeof joseHeader.apu !== "string") throw new errors_js_1.JWEInvalid(`JOSE Header "apu" (Agreement PartyUInfo) invalid`);
					try {
						partyUInfo = (0, base64url_js_1.decode)(joseHeader.apu);
					} catch {
						throw new errors_js_1.JWEInvalid("Failed to base64url decode the apu");
					}
				}
				if (joseHeader.apv !== void 0) {
					if (typeof joseHeader.apv !== "string") throw new errors_js_1.JWEInvalid(`JOSE Header "apv" (Agreement PartyVInfo) invalid`);
					try {
						partyVInfo = (0, base64url_js_1.decode)(joseHeader.apv);
					} catch {
						throw new errors_js_1.JWEInvalid("Failed to base64url decode the apv");
					}
				}
				const sharedSecret = await ECDH.deriveKey(epk, key, alg === "ECDH-ES" ? joseHeader.enc : alg, alg === "ECDH-ES" ? (0, cek_js_1.bitLength)(joseHeader.enc) : parseInt(alg.slice(-5, -2), 10), partyUInfo, partyVInfo);
				if (alg === "ECDH-ES") return sharedSecret;
				if (encryptedKey === void 0) throw new errors_js_1.JWEInvalid("JWE Encrypted Key missing");
				return (0, aeskw_js_1.unwrap)(alg.slice(-6), sharedSecret, encryptedKey);
			}
			case "RSA1_5":
			case "RSA-OAEP":
			case "RSA-OAEP-256":
			case "RSA-OAEP-384":
			case "RSA-OAEP-512":
				if (encryptedKey === void 0) throw new errors_js_1.JWEInvalid("JWE Encrypted Key missing");
				return (0, rsaes_js_1.decrypt)(alg, key, encryptedKey);
			case "PBES2-HS256+A128KW":
			case "PBES2-HS384+A192KW":
			case "PBES2-HS512+A256KW": {
				if (encryptedKey === void 0) throw new errors_js_1.JWEInvalid("JWE Encrypted Key missing");
				if (typeof joseHeader.p2c !== "number") throw new errors_js_1.JWEInvalid(`JOSE Header "p2c" (PBES2 Count) missing or invalid`);
				const p2cLimit = (options === null || options === void 0 ? void 0 : options.maxPBES2Count) || 1e4;
				if (joseHeader.p2c > p2cLimit) throw new errors_js_1.JWEInvalid(`JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds`);
				if (typeof joseHeader.p2s !== "string") throw new errors_js_1.JWEInvalid(`JOSE Header "p2s" (PBES2 Salt) missing or invalid`);
				let p2s;
				try {
					p2s = (0, base64url_js_1.decode)(joseHeader.p2s);
				} catch {
					throw new errors_js_1.JWEInvalid("Failed to base64url decode the p2s");
				}
				return (0, pbes2kw_js_1.decrypt)(alg, key, encryptedKey, joseHeader.p2c, p2s);
			}
			case "A128KW":
			case "A192KW":
			case "A256KW":
				if (encryptedKey === void 0) throw new errors_js_1.JWEInvalid("JWE Encrypted Key missing");
				return (0, aeskw_js_1.unwrap)(alg, key, encryptedKey);
			case "A128GCMKW":
			case "A192GCMKW":
			case "A256GCMKW": {
				if (encryptedKey === void 0) throw new errors_js_1.JWEInvalid("JWE Encrypted Key missing");
				if (typeof joseHeader.iv !== "string") throw new errors_js_1.JWEInvalid(`JOSE Header "iv" (Initialization Vector) missing or invalid`);
				if (typeof joseHeader.tag !== "string") throw new errors_js_1.JWEInvalid(`JOSE Header "tag" (Authentication Tag) missing or invalid`);
				let iv;
				try {
					iv = (0, base64url_js_1.decode)(joseHeader.iv);
				} catch {
					throw new errors_js_1.JWEInvalid("Failed to base64url decode the iv");
				}
				let tag;
				try {
					tag = (0, base64url_js_1.decode)(joseHeader.tag);
				} catch {
					throw new errors_js_1.JWEInvalid("Failed to base64url decode the tag");
				}
				return (0, aesgcmkw_js_1.unwrap)(alg, key, encryptedKey, iv, tag);
			}
			default: throw new errors_js_1.JOSENotSupported("Invalid or unsupported \"alg\" (JWE Algorithm) header value");
		}
	}
	exports.default = decryptKeyManagement;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/validate_crit.js
var require_validate_crit = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var errors_js_1 = require_errors$2();
	function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
		if (joseHeader.crit !== void 0 && protectedHeader.crit === void 0) throw new Err("\"crit\" (Critical) Header Parameter MUST be integrity protected");
		if (!protectedHeader || protectedHeader.crit === void 0) return /* @__PURE__ */ new Set();
		if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) throw new Err("\"crit\" (Critical) Header Parameter MUST be an array of non-empty strings when present");
		let recognized;
		if (recognizedOption !== void 0) recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
		else recognized = recognizedDefault;
		for (const parameter of protectedHeader.crit) {
			if (!recognized.has(parameter)) throw new errors_js_1.JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
			if (joseHeader[parameter] === void 0) throw new Err(`Extension Header Parameter "${parameter}" is missing`);
			else if (recognized.get(parameter) && protectedHeader[parameter] === void 0) throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
		}
		return new Set(protectedHeader.crit);
	}
	exports.default = validateCrit;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/validate_algorithms.js
var require_validate_algorithms = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var validateAlgorithms = (option, algorithms) => {
		if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) throw new TypeError(`"${option}" option must be an array of strings`);
		if (!algorithms) return;
		return new Set(algorithms);
	};
	exports.default = validateAlgorithms;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwe/flattened/decrypt.js
var require_decrypt$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.flattenedDecrypt = void 0;
	var base64url_js_1 = require_base64url$2();
	var decrypt_js_1 = require_decrypt$4();
	var zlib_js_1 = require_zlib();
	var errors_js_1 = require_errors$2();
	var is_disjoint_js_1 = require_is_disjoint();
	var is_object_js_1 = require_is_object();
	var decrypt_key_management_js_1 = require_decrypt_key_management();
	var buffer_utils_js_1 = require_buffer_utils();
	var cek_js_1 = require_cek();
	var validate_crit_js_1 = require_validate_crit();
	var validate_algorithms_js_1 = require_validate_algorithms();
	async function flattenedDecrypt(jwe, key, options) {
		var _a;
		if (!(0, is_object_js_1.default)(jwe)) throw new errors_js_1.JWEInvalid("Flattened JWE must be an object");
		if (jwe.protected === void 0 && jwe.header === void 0 && jwe.unprotected === void 0) throw new errors_js_1.JWEInvalid("JOSE Header missing");
		if (typeof jwe.iv !== "string") throw new errors_js_1.JWEInvalid("JWE Initialization Vector missing or incorrect type");
		if (typeof jwe.ciphertext !== "string") throw new errors_js_1.JWEInvalid("JWE Ciphertext missing or incorrect type");
		if (typeof jwe.tag !== "string") throw new errors_js_1.JWEInvalid("JWE Authentication Tag missing or incorrect type");
		if (jwe.protected !== void 0 && typeof jwe.protected !== "string") throw new errors_js_1.JWEInvalid("JWE Protected Header incorrect type");
		if (jwe.encrypted_key !== void 0 && typeof jwe.encrypted_key !== "string") throw new errors_js_1.JWEInvalid("JWE Encrypted Key incorrect type");
		if (jwe.aad !== void 0 && typeof jwe.aad !== "string") throw new errors_js_1.JWEInvalid("JWE AAD incorrect type");
		if (jwe.header !== void 0 && !(0, is_object_js_1.default)(jwe.header)) throw new errors_js_1.JWEInvalid("JWE Shared Unprotected Header incorrect type");
		if (jwe.unprotected !== void 0 && !(0, is_object_js_1.default)(jwe.unprotected)) throw new errors_js_1.JWEInvalid("JWE Per-Recipient Unprotected Header incorrect type");
		let parsedProt;
		if (jwe.protected) try {
			const protectedHeader = (0, base64url_js_1.decode)(jwe.protected);
			parsedProt = JSON.parse(buffer_utils_js_1.decoder.decode(protectedHeader));
		} catch {
			throw new errors_js_1.JWEInvalid("JWE Protected Header is invalid");
		}
		if (!(0, is_disjoint_js_1.default)(parsedProt, jwe.header, jwe.unprotected)) throw new errors_js_1.JWEInvalid("JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint");
		const joseHeader = {
			...parsedProt,
			...jwe.header,
			...jwe.unprotected
		};
		(0, validate_crit_js_1.default)(errors_js_1.JWEInvalid, /* @__PURE__ */ new Map(), options === null || options === void 0 ? void 0 : options.crit, parsedProt, joseHeader);
		if (joseHeader.zip !== void 0) {
			if (!parsedProt || !parsedProt.zip) throw new errors_js_1.JWEInvalid("JWE \"zip\" (Compression Algorithm) Header MUST be integrity protected");
			if (joseHeader.zip !== "DEF") throw new errors_js_1.JOSENotSupported("Unsupported JWE \"zip\" (Compression Algorithm) Header Parameter value");
		}
		const { alg, enc } = joseHeader;
		if (typeof alg !== "string" || !alg) throw new errors_js_1.JWEInvalid("missing JWE Algorithm (alg) in JWE Header");
		if (typeof enc !== "string" || !enc) throw new errors_js_1.JWEInvalid("missing JWE Encryption Algorithm (enc) in JWE Header");
		const keyManagementAlgorithms = options && (0, validate_algorithms_js_1.default)("keyManagementAlgorithms", options.keyManagementAlgorithms);
		const contentEncryptionAlgorithms = options && (0, validate_algorithms_js_1.default)("contentEncryptionAlgorithms", options.contentEncryptionAlgorithms);
		if (keyManagementAlgorithms && !keyManagementAlgorithms.has(alg)) throw new errors_js_1.JOSEAlgNotAllowed("\"alg\" (Algorithm) Header Parameter not allowed");
		if (contentEncryptionAlgorithms && !contentEncryptionAlgorithms.has(enc)) throw new errors_js_1.JOSEAlgNotAllowed("\"enc\" (Encryption Algorithm) Header Parameter not allowed");
		let encryptedKey;
		if (jwe.encrypted_key !== void 0) try {
			encryptedKey = (0, base64url_js_1.decode)(jwe.encrypted_key);
		} catch {
			throw new errors_js_1.JWEInvalid("Failed to base64url decode the encrypted_key");
		}
		let resolvedKey = false;
		if (typeof key === "function") {
			key = await key(parsedProt, jwe);
			resolvedKey = true;
		}
		let cek;
		try {
			cek = await (0, decrypt_key_management_js_1.default)(alg, key, encryptedKey, joseHeader, options);
		} catch (err) {
			if (err instanceof TypeError || err instanceof errors_js_1.JWEInvalid || err instanceof errors_js_1.JOSENotSupported) throw err;
			cek = (0, cek_js_1.default)(enc);
		}
		let iv;
		let tag;
		try {
			iv = (0, base64url_js_1.decode)(jwe.iv);
		} catch {
			throw new errors_js_1.JWEInvalid("Failed to base64url decode the iv");
		}
		try {
			tag = (0, base64url_js_1.decode)(jwe.tag);
		} catch {
			throw new errors_js_1.JWEInvalid("Failed to base64url decode the tag");
		}
		const protectedHeader = buffer_utils_js_1.encoder.encode((_a = jwe.protected) !== null && _a !== void 0 ? _a : "");
		let additionalData;
		if (jwe.aad !== void 0) additionalData = (0, buffer_utils_js_1.concat)(protectedHeader, buffer_utils_js_1.encoder.encode("."), buffer_utils_js_1.encoder.encode(jwe.aad));
		else additionalData = protectedHeader;
		let ciphertext;
		try {
			ciphertext = (0, base64url_js_1.decode)(jwe.ciphertext);
		} catch {
			throw new errors_js_1.JWEInvalid("Failed to base64url decode the ciphertext");
		}
		let plaintext = await (0, decrypt_js_1.default)(enc, cek, ciphertext, iv, tag, additionalData);
		if (joseHeader.zip === "DEF") plaintext = await ((options === null || options === void 0 ? void 0 : options.inflateRaw) || zlib_js_1.inflate)(plaintext);
		const result = { plaintext };
		if (jwe.protected !== void 0) result.protectedHeader = parsedProt;
		if (jwe.aad !== void 0) try {
			result.additionalAuthenticatedData = (0, base64url_js_1.decode)(jwe.aad);
		} catch {
			throw new errors_js_1.JWEInvalid("Failed to base64url decode the aad");
		}
		if (jwe.unprotected !== void 0) result.sharedUnprotectedHeader = jwe.unprotected;
		if (jwe.header !== void 0) result.unprotectedHeader = jwe.header;
		if (resolvedKey) return {
			...result,
			key
		};
		return result;
	}
	exports.flattenedDecrypt = flattenedDecrypt;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwe/compact/decrypt.js
var require_decrypt$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.compactDecrypt = void 0;
	var decrypt_js_1 = require_decrypt$3();
	var errors_js_1 = require_errors$2();
	var buffer_utils_js_1 = require_buffer_utils();
	async function compactDecrypt(jwe, key, options) {
		if (jwe instanceof Uint8Array) jwe = buffer_utils_js_1.decoder.decode(jwe);
		if (typeof jwe !== "string") throw new errors_js_1.JWEInvalid("Compact JWE must be a string or Uint8Array");
		const { 0: protectedHeader, 1: encryptedKey, 2: iv, 3: ciphertext, 4: tag, length } = jwe.split(".");
		if (length !== 5) throw new errors_js_1.JWEInvalid("Invalid Compact JWE");
		const decrypted = await (0, decrypt_js_1.flattenedDecrypt)({
			ciphertext,
			iv: iv || void 0,
			protected: protectedHeader || void 0,
			tag: tag || void 0,
			encrypted_key: encryptedKey || void 0
		}, key, options);
		const result = {
			plaintext: decrypted.plaintext,
			protectedHeader: decrypted.protectedHeader
		};
		if (typeof key === "function") return {
			...result,
			key: decrypted.key
		};
		return result;
	}
	exports.compactDecrypt = compactDecrypt;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwe/general/decrypt.js
var require_decrypt$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.generalDecrypt = void 0;
	var decrypt_js_1 = require_decrypt$3();
	var errors_js_1 = require_errors$2();
	var is_object_js_1 = require_is_object();
	async function generalDecrypt(jwe, key, options) {
		if (!(0, is_object_js_1.default)(jwe)) throw new errors_js_1.JWEInvalid("General JWE must be an object");
		if (!Array.isArray(jwe.recipients) || !jwe.recipients.every(is_object_js_1.default)) throw new errors_js_1.JWEInvalid("JWE Recipients missing or incorrect type");
		if (!jwe.recipients.length) throw new errors_js_1.JWEInvalid("JWE Recipients has no members");
		for (const recipient of jwe.recipients) try {
			return await (0, decrypt_js_1.flattenedDecrypt)({
				aad: jwe.aad,
				ciphertext: jwe.ciphertext,
				encrypted_key: recipient.encrypted_key,
				header: recipient.header,
				iv: jwe.iv,
				protected: jwe.protected,
				tag: jwe.tag,
				unprotected: jwe.unprotected
			}, key, options);
		} catch {}
		throw new errors_js_1.JWEDecryptionFailed();
	}
	exports.generalDecrypt = generalDecrypt;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/asn1_sequence_decoder.js
var require_asn1_sequence_decoder = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var tagInteger = 2;
	var tagSequence = 48;
	var Asn1SequenceDecoder = class {
		constructor(buffer) {
			if (buffer[0] !== tagSequence) throw new TypeError();
			this.buffer = buffer;
			this.offset = 1;
			if (this.decodeLength() !== buffer.length - this.offset) throw new TypeError();
		}
		decodeLength() {
			let length = this.buffer[this.offset++];
			if (length & 128) {
				const nBytes = length & -129;
				length = 0;
				for (let i = 0; i < nBytes; i++) length = length << 8 | this.buffer[this.offset + i];
				this.offset += nBytes;
			}
			return length;
		}
		unsignedInteger() {
			if (this.buffer[this.offset++] !== tagInteger) throw new TypeError();
			let length = this.decodeLength();
			if (this.buffer[this.offset] === 0) {
				this.offset++;
				length--;
			}
			const result = this.buffer.slice(this.offset, this.offset + length);
			this.offset += length;
			return result;
		}
		end() {
			if (this.offset !== this.buffer.length) throw new TypeError();
		}
	};
	exports.default = Asn1SequenceDecoder;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/key_to_jwk.js
var require_key_to_jwk = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var crypto_1$4 = __require("crypto");
	var base64url_js_1 = require_base64url$2();
	var asn1_sequence_decoder_js_1 = require_asn1_sequence_decoder();
	var errors_js_1 = require_errors$2();
	var get_named_curve_js_1 = require_get_named_curve();
	var webcrypto_js_1 = require_webcrypto();
	var is_key_object_js_1 = require_is_key_object$1();
	var invalid_key_input_js_1 = require_invalid_key_input();
	var is_key_like_js_1 = require_is_key_like();
	var flags_js_1 = require_flags();
	var keyToJWK = (key) => {
		let keyObject;
		if ((0, webcrypto_js_1.isCryptoKey)(key)) {
			if (!key.extractable) throw new TypeError("CryptoKey is not extractable");
			keyObject = crypto_1$4.KeyObject.from(key);
		} else if ((0, is_key_object_js_1.default)(key)) keyObject = key;
		else if (key instanceof Uint8Array) return {
			kty: "oct",
			k: (0, base64url_js_1.encode)(key)
		};
		else throw new TypeError((0, invalid_key_input_js_1.default)(key, ...is_key_like_js_1.types, "Uint8Array"));
		if (flags_js_1.jwkExport) {
			if (keyObject.type !== "secret" && ![
				"rsa",
				"ec",
				"ed25519",
				"x25519",
				"ed448",
				"x448"
			].includes(keyObject.asymmetricKeyType)) throw new errors_js_1.JOSENotSupported("Unsupported key asymmetricKeyType");
			return keyObject.export({ format: "jwk" });
		}
		switch (keyObject.type) {
			case "secret": return {
				kty: "oct",
				k: (0, base64url_js_1.encode)(keyObject.export())
			};
			case "private":
			case "public": switch (keyObject.asymmetricKeyType) {
				case "rsa": {
					const der = keyObject.export({
						format: "der",
						type: "pkcs1"
					});
					const dec = new asn1_sequence_decoder_js_1.default(der);
					if (keyObject.type === "private") dec.unsignedInteger();
					const n = (0, base64url_js_1.encode)(dec.unsignedInteger());
					const e = (0, base64url_js_1.encode)(dec.unsignedInteger());
					let jwk;
					if (keyObject.type === "private") jwk = {
						d: (0, base64url_js_1.encode)(dec.unsignedInteger()),
						p: (0, base64url_js_1.encode)(dec.unsignedInteger()),
						q: (0, base64url_js_1.encode)(dec.unsignedInteger()),
						dp: (0, base64url_js_1.encode)(dec.unsignedInteger()),
						dq: (0, base64url_js_1.encode)(dec.unsignedInteger()),
						qi: (0, base64url_js_1.encode)(dec.unsignedInteger())
					};
					dec.end();
					return {
						kty: "RSA",
						n,
						e,
						...jwk
					};
				}
				case "ec": {
					const crv = (0, get_named_curve_js_1.default)(keyObject);
					let len;
					let offset;
					let correction;
					switch (crv) {
						case "secp256k1":
							len = 64;
							offset = 33;
							correction = -1;
							break;
						case "P-256":
							len = 64;
							offset = 36;
							correction = -1;
							break;
						case "P-384":
							len = 96;
							offset = 35;
							correction = -3;
							break;
						case "P-521":
							len = 132;
							offset = 35;
							correction = -3;
							break;
						default: throw new errors_js_1.JOSENotSupported("Unsupported curve");
					}
					if (keyObject.type === "public") {
						const der = keyObject.export({
							type: "spki",
							format: "der"
						});
						return {
							kty: "EC",
							crv,
							x: (0, base64url_js_1.encode)(der.subarray(-len, -len / 2)),
							y: (0, base64url_js_1.encode)(der.subarray(-len / 2))
						};
					}
					const der = keyObject.export({
						type: "pkcs8",
						format: "der"
					});
					if (der.length < 100) offset += correction;
					return {
						...keyToJWK((0, crypto_1$4.createPublicKey)(keyObject)),
						d: (0, base64url_js_1.encode)(der.subarray(offset, offset + len / 2))
					};
				}
				case "ed25519":
				case "x25519": {
					const crv = (0, get_named_curve_js_1.default)(keyObject);
					if (keyObject.type === "public") {
						const der = keyObject.export({
							type: "spki",
							format: "der"
						});
						return {
							kty: "OKP",
							crv,
							x: (0, base64url_js_1.encode)(der.subarray(-32))
						};
					}
					const der = keyObject.export({
						type: "pkcs8",
						format: "der"
					});
					return {
						...keyToJWK((0, crypto_1$4.createPublicKey)(keyObject)),
						d: (0, base64url_js_1.encode)(der.subarray(-32))
					};
				}
				case "ed448":
				case "x448": {
					const crv = (0, get_named_curve_js_1.default)(keyObject);
					if (keyObject.type === "public") {
						const der = keyObject.export({
							type: "spki",
							format: "der"
						});
						return {
							kty: "OKP",
							crv,
							x: (0, base64url_js_1.encode)(der.subarray(crv === "Ed448" ? -57 : -56))
						};
					}
					const der = keyObject.export({
						type: "pkcs8",
						format: "der"
					});
					return {
						...keyToJWK((0, crypto_1$4.createPublicKey)(keyObject)),
						d: (0, base64url_js_1.encode)(der.subarray(crv === "Ed448" ? -57 : -56))
					};
				}
				default: throw new errors_js_1.JOSENotSupported("Unsupported key asymmetricKeyType");
			}
			default: throw new errors_js_1.JOSENotSupported("Unsupported key type");
		}
	};
	exports.default = keyToJWK;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/key/export.js
var require_export = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.exportJWK = exports.exportPKCS8 = exports.exportSPKI = void 0;
	var asn1_js_1 = require_asn1();
	var asn1_js_2 = require_asn1();
	var key_to_jwk_js_1 = require_key_to_jwk();
	async function exportSPKI(key) {
		return (0, asn1_js_1.toSPKI)(key);
	}
	exports.exportSPKI = exportSPKI;
	async function exportPKCS8(key) {
		return (0, asn1_js_2.toPKCS8)(key);
	}
	exports.exportPKCS8 = exportPKCS8;
	async function exportJWK(key) {
		return (0, key_to_jwk_js_1.default)(key);
	}
	exports.exportJWK = exportJWK;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/encrypt_key_management.js
var require_encrypt_key_management = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var aeskw_js_1 = require_aeskw();
	var ECDH = require_ecdhes();
	var pbes2kw_js_1 = require_pbes2kw();
	var rsaes_js_1 = require_rsaes();
	var base64url_js_1 = require_base64url$2();
	var cek_js_1 = require_cek();
	var errors_js_1 = require_errors$2();
	var export_js_1 = require_export();
	var check_key_type_js_1 = require_check_key_type();
	var aesgcmkw_js_1 = require_aesgcmkw();
	async function encryptKeyManagement(alg, enc, key, providedCek, providedParameters = {}) {
		let encryptedKey;
		let parameters;
		let cek;
		(0, check_key_type_js_1.default)(alg, key, "encrypt");
		switch (alg) {
			case "dir":
				cek = key;
				break;
			case "ECDH-ES":
			case "ECDH-ES+A128KW":
			case "ECDH-ES+A192KW":
			case "ECDH-ES+A256KW": {
				if (!ECDH.ecdhAllowed(key)) throw new errors_js_1.JOSENotSupported("ECDH with the provided key is not allowed or not supported by your javascript runtime");
				const { apu, apv } = providedParameters;
				let { epk: ephemeralKey } = providedParameters;
				ephemeralKey || (ephemeralKey = (await ECDH.generateEpk(key)).privateKey);
				const { x, y, crv, kty } = await (0, export_js_1.exportJWK)(ephemeralKey);
				const sharedSecret = await ECDH.deriveKey(key, ephemeralKey, alg === "ECDH-ES" ? enc : alg, alg === "ECDH-ES" ? (0, cek_js_1.bitLength)(enc) : parseInt(alg.slice(-5, -2), 10), apu, apv);
				parameters = { epk: {
					x,
					crv,
					kty
				} };
				if (kty === "EC") parameters.epk.y = y;
				if (apu) parameters.apu = (0, base64url_js_1.encode)(apu);
				if (apv) parameters.apv = (0, base64url_js_1.encode)(apv);
				if (alg === "ECDH-ES") {
					cek = sharedSecret;
					break;
				}
				cek = providedCek || (0, cek_js_1.default)(enc);
				const kwAlg = alg.slice(-6);
				encryptedKey = await (0, aeskw_js_1.wrap)(kwAlg, sharedSecret, cek);
				break;
			}
			case "RSA1_5":
			case "RSA-OAEP":
			case "RSA-OAEP-256":
			case "RSA-OAEP-384":
			case "RSA-OAEP-512":
				cek = providedCek || (0, cek_js_1.default)(enc);
				encryptedKey = await (0, rsaes_js_1.encrypt)(alg, key, cek);
				break;
			case "PBES2-HS256+A128KW":
			case "PBES2-HS384+A192KW":
			case "PBES2-HS512+A256KW": {
				cek = providedCek || (0, cek_js_1.default)(enc);
				const { p2c, p2s } = providedParameters;
				({encryptedKey, ...parameters} = await (0, pbes2kw_js_1.encrypt)(alg, key, cek, p2c, p2s));
				break;
			}
			case "A128KW":
			case "A192KW":
			case "A256KW":
				cek = providedCek || (0, cek_js_1.default)(enc);
				encryptedKey = await (0, aeskw_js_1.wrap)(alg, key, cek);
				break;
			case "A128GCMKW":
			case "A192GCMKW":
			case "A256GCMKW": {
				cek = providedCek || (0, cek_js_1.default)(enc);
				const { iv } = providedParameters;
				({encryptedKey, ...parameters} = await (0, aesgcmkw_js_1.wrap)(alg, key, cek, iv));
				break;
			}
			default: throw new errors_js_1.JOSENotSupported("Invalid or unsupported \"alg\" (JWE Algorithm) header value");
		}
		return {
			cek,
			encryptedKey,
			parameters
		};
	}
	exports.default = encryptKeyManagement;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwe/flattened/encrypt.js
var require_encrypt$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.FlattenedEncrypt = exports.unprotected = void 0;
	var base64url_js_1 = require_base64url$2();
	var encrypt_js_1 = require_encrypt$4();
	var zlib_js_1 = require_zlib();
	var iv_js_1 = require_iv();
	var encrypt_key_management_js_1 = require_encrypt_key_management();
	var errors_js_1 = require_errors$2();
	var is_disjoint_js_1 = require_is_disjoint();
	var buffer_utils_js_1 = require_buffer_utils();
	var validate_crit_js_1 = require_validate_crit();
	exports.unprotected = Symbol();
	var FlattenedEncrypt = class {
		constructor(plaintext) {
			if (!(plaintext instanceof Uint8Array)) throw new TypeError("plaintext must be an instance of Uint8Array");
			this._plaintext = plaintext;
		}
		setKeyManagementParameters(parameters) {
			if (this._keyManagementParameters) throw new TypeError("setKeyManagementParameters can only be called once");
			this._keyManagementParameters = parameters;
			return this;
		}
		setProtectedHeader(protectedHeader) {
			if (this._protectedHeader) throw new TypeError("setProtectedHeader can only be called once");
			this._protectedHeader = protectedHeader;
			return this;
		}
		setSharedUnprotectedHeader(sharedUnprotectedHeader) {
			if (this._sharedUnprotectedHeader) throw new TypeError("setSharedUnprotectedHeader can only be called once");
			this._sharedUnprotectedHeader = sharedUnprotectedHeader;
			return this;
		}
		setUnprotectedHeader(unprotectedHeader) {
			if (this._unprotectedHeader) throw new TypeError("setUnprotectedHeader can only be called once");
			this._unprotectedHeader = unprotectedHeader;
			return this;
		}
		setAdditionalAuthenticatedData(aad) {
			this._aad = aad;
			return this;
		}
		setContentEncryptionKey(cek) {
			if (this._cek) throw new TypeError("setContentEncryptionKey can only be called once");
			this._cek = cek;
			return this;
		}
		setInitializationVector(iv) {
			if (this._iv) throw new TypeError("setInitializationVector can only be called once");
			this._iv = iv;
			return this;
		}
		async encrypt(key, options) {
			if (!this._protectedHeader && !this._unprotectedHeader && !this._sharedUnprotectedHeader) throw new errors_js_1.JWEInvalid("either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()");
			if (!(0, is_disjoint_js_1.default)(this._protectedHeader, this._unprotectedHeader, this._sharedUnprotectedHeader)) throw new errors_js_1.JWEInvalid("JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint");
			const joseHeader = {
				...this._protectedHeader,
				...this._unprotectedHeader,
				...this._sharedUnprotectedHeader
			};
			(0, validate_crit_js_1.default)(errors_js_1.JWEInvalid, /* @__PURE__ */ new Map(), options === null || options === void 0 ? void 0 : options.crit, this._protectedHeader, joseHeader);
			if (joseHeader.zip !== void 0) {
				if (!this._protectedHeader || !this._protectedHeader.zip) throw new errors_js_1.JWEInvalid("JWE \"zip\" (Compression Algorithm) Header MUST be integrity protected");
				if (joseHeader.zip !== "DEF") throw new errors_js_1.JOSENotSupported("Unsupported JWE \"zip\" (Compression Algorithm) Header Parameter value");
			}
			const { alg, enc } = joseHeader;
			if (typeof alg !== "string" || !alg) throw new errors_js_1.JWEInvalid("JWE \"alg\" (Algorithm) Header Parameter missing or invalid");
			if (typeof enc !== "string" || !enc) throw new errors_js_1.JWEInvalid("JWE \"enc\" (Encryption Algorithm) Header Parameter missing or invalid");
			let encryptedKey;
			if (alg === "dir") {
				if (this._cek) throw new TypeError("setContentEncryptionKey cannot be called when using Direct Encryption");
			} else if (alg === "ECDH-ES") {
				if (this._cek) throw new TypeError("setContentEncryptionKey cannot be called when using Direct Key Agreement");
			}
			let cek;
			{
				let parameters;
				({cek, encryptedKey, parameters} = await (0, encrypt_key_management_js_1.default)(alg, enc, key, this._cek, this._keyManagementParameters));
				if (parameters) if (options && exports.unprotected in options) if (!this._unprotectedHeader) this.setUnprotectedHeader(parameters);
				else this._unprotectedHeader = {
					...this._unprotectedHeader,
					...parameters
				};
				else if (!this._protectedHeader) this.setProtectedHeader(parameters);
				else this._protectedHeader = {
					...this._protectedHeader,
					...parameters
				};
			}
			this._iv || (this._iv = (0, iv_js_1.default)(enc));
			let additionalData;
			let protectedHeader;
			let aadMember;
			if (this._protectedHeader) protectedHeader = buffer_utils_js_1.encoder.encode((0, base64url_js_1.encode)(JSON.stringify(this._protectedHeader)));
			else protectedHeader = buffer_utils_js_1.encoder.encode("");
			if (this._aad) {
				aadMember = (0, base64url_js_1.encode)(this._aad);
				additionalData = (0, buffer_utils_js_1.concat)(protectedHeader, buffer_utils_js_1.encoder.encode("."), buffer_utils_js_1.encoder.encode(aadMember));
			} else additionalData = protectedHeader;
			let ciphertext;
			let tag;
			if (joseHeader.zip === "DEF") {
				const deflated = await ((options === null || options === void 0 ? void 0 : options.deflateRaw) || zlib_js_1.deflate)(this._plaintext);
				({ciphertext, tag} = await (0, encrypt_js_1.default)(enc, deflated, cek, this._iv, additionalData));
			} else ({ciphertext, tag} = await (0, encrypt_js_1.default)(enc, this._plaintext, cek, this._iv, additionalData));
			const jwe = {
				ciphertext: (0, base64url_js_1.encode)(ciphertext),
				iv: (0, base64url_js_1.encode)(this._iv),
				tag: (0, base64url_js_1.encode)(tag)
			};
			if (encryptedKey) jwe.encrypted_key = (0, base64url_js_1.encode)(encryptedKey);
			if (aadMember) jwe.aad = aadMember;
			if (this._protectedHeader) jwe.protected = buffer_utils_js_1.decoder.decode(protectedHeader);
			if (this._sharedUnprotectedHeader) jwe.unprotected = this._sharedUnprotectedHeader;
			if (this._unprotectedHeader) jwe.header = this._unprotectedHeader;
			return jwe;
		}
	};
	exports.FlattenedEncrypt = FlattenedEncrypt;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwe/general/encrypt.js
var require_encrypt$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.GeneralEncrypt = void 0;
	var encrypt_js_1 = require_encrypt$3();
	var errors_js_1 = require_errors$2();
	var cek_js_1 = require_cek();
	var is_disjoint_js_1 = require_is_disjoint();
	var encrypt_key_management_js_1 = require_encrypt_key_management();
	var base64url_js_1 = require_base64url$2();
	var validate_crit_js_1 = require_validate_crit();
	var IndividualRecipient = class {
		constructor(enc, key, options) {
			this.parent = enc;
			this.key = key;
			this.options = options;
		}
		setUnprotectedHeader(unprotectedHeader) {
			if (this.unprotectedHeader) throw new TypeError("setUnprotectedHeader can only be called once");
			this.unprotectedHeader = unprotectedHeader;
			return this;
		}
		addRecipient(...args) {
			return this.parent.addRecipient(...args);
		}
		encrypt(...args) {
			return this.parent.encrypt(...args);
		}
		done() {
			return this.parent;
		}
	};
	var GeneralEncrypt = class {
		constructor(plaintext) {
			this._recipients = [];
			this._plaintext = plaintext;
		}
		addRecipient(key, options) {
			const recipient = new IndividualRecipient(this, key, { crit: options === null || options === void 0 ? void 0 : options.crit });
			this._recipients.push(recipient);
			return recipient;
		}
		setProtectedHeader(protectedHeader) {
			if (this._protectedHeader) throw new TypeError("setProtectedHeader can only be called once");
			this._protectedHeader = protectedHeader;
			return this;
		}
		setSharedUnprotectedHeader(sharedUnprotectedHeader) {
			if (this._unprotectedHeader) throw new TypeError("setSharedUnprotectedHeader can only be called once");
			this._unprotectedHeader = sharedUnprotectedHeader;
			return this;
		}
		setAdditionalAuthenticatedData(aad) {
			this._aad = aad;
			return this;
		}
		async encrypt(options) {
			var _a, _b, _c;
			if (!this._recipients.length) throw new errors_js_1.JWEInvalid("at least one recipient must be added");
			options = { deflateRaw: options === null || options === void 0 ? void 0 : options.deflateRaw };
			if (this._recipients.length === 1) {
				const [recipient] = this._recipients;
				const flattened = await new encrypt_js_1.FlattenedEncrypt(this._plaintext).setAdditionalAuthenticatedData(this._aad).setProtectedHeader(this._protectedHeader).setSharedUnprotectedHeader(this._unprotectedHeader).setUnprotectedHeader(recipient.unprotectedHeader).encrypt(recipient.key, {
					...recipient.options,
					...options
				});
				let jwe = {
					ciphertext: flattened.ciphertext,
					iv: flattened.iv,
					recipients: [{}],
					tag: flattened.tag
				};
				if (flattened.aad) jwe.aad = flattened.aad;
				if (flattened.protected) jwe.protected = flattened.protected;
				if (flattened.unprotected) jwe.unprotected = flattened.unprotected;
				if (flattened.encrypted_key) jwe.recipients[0].encrypted_key = flattened.encrypted_key;
				if (flattened.header) jwe.recipients[0].header = flattened.header;
				return jwe;
			}
			let enc;
			for (let i = 0; i < this._recipients.length; i++) {
				const recipient = this._recipients[i];
				if (!(0, is_disjoint_js_1.default)(this._protectedHeader, this._unprotectedHeader, recipient.unprotectedHeader)) throw new errors_js_1.JWEInvalid("JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint");
				const joseHeader = {
					...this._protectedHeader,
					...this._unprotectedHeader,
					...recipient.unprotectedHeader
				};
				const { alg } = joseHeader;
				if (typeof alg !== "string" || !alg) throw new errors_js_1.JWEInvalid("JWE \"alg\" (Algorithm) Header Parameter missing or invalid");
				if (alg === "dir" || alg === "ECDH-ES") throw new errors_js_1.JWEInvalid("\"dir\" and \"ECDH-ES\" alg may only be used with a single recipient");
				if (typeof joseHeader.enc !== "string" || !joseHeader.enc) throw new errors_js_1.JWEInvalid("JWE \"enc\" (Encryption Algorithm) Header Parameter missing or invalid");
				if (!enc) enc = joseHeader.enc;
				else if (enc !== joseHeader.enc) throw new errors_js_1.JWEInvalid("JWE \"enc\" (Encryption Algorithm) Header Parameter must be the same for all recipients");
				(0, validate_crit_js_1.default)(errors_js_1.JWEInvalid, /* @__PURE__ */ new Map(), recipient.options.crit, this._protectedHeader, joseHeader);
				if (joseHeader.zip !== void 0) {
					if (!this._protectedHeader || !this._protectedHeader.zip) throw new errors_js_1.JWEInvalid("JWE \"zip\" (Compression Algorithm) Header MUST be integrity protected");
				}
			}
			const cek = (0, cek_js_1.default)(enc);
			let jwe = {
				ciphertext: "",
				iv: "",
				recipients: [],
				tag: ""
			};
			for (let i = 0; i < this._recipients.length; i++) {
				const recipient = this._recipients[i];
				const target = {};
				jwe.recipients.push(target);
				const p2c = {
					...this._protectedHeader,
					...this._unprotectedHeader,
					...recipient.unprotectedHeader
				}.alg.startsWith("PBES2") ? 2048 + i : void 0;
				if (i === 0) {
					const flattened = await new encrypt_js_1.FlattenedEncrypt(this._plaintext).setAdditionalAuthenticatedData(this._aad).setContentEncryptionKey(cek).setProtectedHeader(this._protectedHeader).setSharedUnprotectedHeader(this._unprotectedHeader).setUnprotectedHeader(recipient.unprotectedHeader).setKeyManagementParameters({ p2c }).encrypt(recipient.key, {
						...recipient.options,
						...options,
						[encrypt_js_1.unprotected]: true
					});
					jwe.ciphertext = flattened.ciphertext;
					jwe.iv = flattened.iv;
					jwe.tag = flattened.tag;
					if (flattened.aad) jwe.aad = flattened.aad;
					if (flattened.protected) jwe.protected = flattened.protected;
					if (flattened.unprotected) jwe.unprotected = flattened.unprotected;
					target.encrypted_key = flattened.encrypted_key;
					if (flattened.header) target.header = flattened.header;
					continue;
				}
				const { encryptedKey, parameters } = await (0, encrypt_key_management_js_1.default)(((_a = recipient.unprotectedHeader) === null || _a === void 0 ? void 0 : _a.alg) || ((_b = this._protectedHeader) === null || _b === void 0 ? void 0 : _b.alg) || ((_c = this._unprotectedHeader) === null || _c === void 0 ? void 0 : _c.alg), enc, recipient.key, cek, { p2c });
				target.encrypted_key = (0, base64url_js_1.encode)(encryptedKey);
				if (recipient.unprotectedHeader || parameters) target.header = {
					...recipient.unprotectedHeader,
					...parameters
				};
			}
			return jwe;
		}
	};
	exports.GeneralEncrypt = GeneralEncrypt;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/dsa_digest.js
var require_dsa_digest = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var errors_js_1 = require_errors$2();
	function dsaDigest(alg) {
		switch (alg) {
			case "PS256":
			case "RS256":
			case "ES256":
			case "ES256K": return "sha256";
			case "PS384":
			case "RS384":
			case "ES384": return "sha384";
			case "PS512":
			case "RS512":
			case "ES512": return "sha512";
			case "EdDSA": return;
			default: throw new errors_js_1.JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
		}
	}
	exports.default = dsaDigest;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/node_key.js
var require_node_key = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var crypto_1$3 = __require("crypto");
	var get_named_curve_js_1 = require_get_named_curve();
	var errors_js_1 = require_errors$2();
	var check_modulus_length_js_1 = require_check_modulus_length();
	var flags_js_1 = require_flags();
	var PSS = {
		padding: crypto_1$3.constants.RSA_PKCS1_PSS_PADDING,
		saltLength: crypto_1$3.constants.RSA_PSS_SALTLEN_DIGEST
	};
	var ecCurveAlgMap = new Map([
		["ES256", "P-256"],
		["ES256K", "secp256k1"],
		["ES384", "P-384"],
		["ES512", "P-521"]
	]);
	function keyForCrypto(alg, key) {
		switch (alg) {
			case "EdDSA":
				if (!["ed25519", "ed448"].includes(key.asymmetricKeyType)) throw new TypeError("Invalid key for this operation, its asymmetricKeyType must be ed25519 or ed448");
				return key;
			case "RS256":
			case "RS384":
			case "RS512":
				if (key.asymmetricKeyType !== "rsa") throw new TypeError("Invalid key for this operation, its asymmetricKeyType must be rsa");
				(0, check_modulus_length_js_1.default)(key, alg);
				return key;
			case flags_js_1.rsaPssParams && "PS256":
			case flags_js_1.rsaPssParams && "PS384":
			case flags_js_1.rsaPssParams && "PS512":
				if (key.asymmetricKeyType === "rsa-pss") {
					const { hashAlgorithm, mgf1HashAlgorithm, saltLength } = key.asymmetricKeyDetails;
					const length = parseInt(alg.slice(-3), 10);
					if (hashAlgorithm !== void 0 && (hashAlgorithm !== `sha${length}` || mgf1HashAlgorithm !== hashAlgorithm)) throw new TypeError(`Invalid key for this operation, its RSA-PSS parameters do not meet the requirements of "alg" ${alg}`);
					if (saltLength !== void 0 && saltLength > length >> 3) throw new TypeError(`Invalid key for this operation, its RSA-PSS parameter saltLength does not meet the requirements of "alg" ${alg}`);
				} else if (key.asymmetricKeyType !== "rsa") throw new TypeError("Invalid key for this operation, its asymmetricKeyType must be rsa or rsa-pss");
				(0, check_modulus_length_js_1.default)(key, alg);
				return {
					key,
					...PSS
				};
			case !flags_js_1.rsaPssParams && "PS256":
			case !flags_js_1.rsaPssParams && "PS384":
			case !flags_js_1.rsaPssParams && "PS512":
				if (key.asymmetricKeyType !== "rsa") throw new TypeError("Invalid key for this operation, its asymmetricKeyType must be rsa");
				(0, check_modulus_length_js_1.default)(key, alg);
				return {
					key,
					...PSS
				};
			case "ES256":
			case "ES256K":
			case "ES384":
			case "ES512": {
				if (key.asymmetricKeyType !== "ec") throw new TypeError("Invalid key for this operation, its asymmetricKeyType must be ec");
				const actual = (0, get_named_curve_js_1.default)(key);
				const expected = ecCurveAlgMap.get(alg);
				if (actual !== expected) throw new TypeError(`Invalid key curve for the algorithm, its curve must be ${expected}, got ${actual}`);
				return {
					dsaEncoding: "ieee-p1363",
					key
				};
			}
			default: throw new errors_js_1.JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
		}
	}
	exports.default = keyForCrypto;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/hmac_digest.js
var require_hmac_digest = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var errors_js_1 = require_errors$2();
	function hmacDigest(alg) {
		switch (alg) {
			case "HS256": return "sha256";
			case "HS384": return "sha384";
			case "HS512": return "sha512";
			default: throw new errors_js_1.JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
		}
	}
	exports.default = hmacDigest;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/get_sign_verify_key.js
var require_get_sign_verify_key = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var crypto_1$2 = __require("crypto");
	var webcrypto_js_1 = require_webcrypto();
	var crypto_key_js_1 = require_crypto_key();
	var invalid_key_input_js_1 = require_invalid_key_input();
	var is_key_like_js_1 = require_is_key_like();
	function getSignVerifyKey(alg, key, usage) {
		if (key instanceof Uint8Array) {
			if (!alg.startsWith("HS")) throw new TypeError((0, invalid_key_input_js_1.default)(key, ...is_key_like_js_1.types));
			return (0, crypto_1$2.createSecretKey)(key);
		}
		if (key instanceof crypto_1$2.KeyObject) return key;
		if ((0, webcrypto_js_1.isCryptoKey)(key)) {
			(0, crypto_key_js_1.checkSigCryptoKey)(key, alg, usage);
			return crypto_1$2.KeyObject.from(key);
		}
		throw new TypeError((0, invalid_key_input_js_1.default)(key, ...is_key_like_js_1.types, "Uint8Array"));
	}
	exports.default = getSignVerifyKey;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/sign.js
var require_sign$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var crypto$6 = __require("crypto");
	var util_1$2 = __require("util");
	var dsa_digest_js_1 = require_dsa_digest();
	var hmac_digest_js_1 = require_hmac_digest();
	var node_key_js_1 = require_node_key();
	var get_sign_verify_key_js_1 = require_get_sign_verify_key();
	var oneShotSign;
	if (crypto$6.sign.length > 3) oneShotSign = (0, util_1$2.promisify)(crypto$6.sign);
	else oneShotSign = crypto$6.sign;
	var sign = async (alg, key, data) => {
		const keyObject = (0, get_sign_verify_key_js_1.default)(alg, key, "sign");
		if (alg.startsWith("HS")) {
			const hmac = crypto$6.createHmac((0, hmac_digest_js_1.default)(alg), keyObject);
			hmac.update(data);
			return hmac.digest();
		}
		return oneShotSign((0, dsa_digest_js_1.default)(alg), data, (0, node_key_js_1.default)(alg, keyObject));
	};
	exports.default = sign;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/verify.js
var require_verify$4 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var crypto$5 = __require("crypto");
	var util_1$1 = __require("util");
	var dsa_digest_js_1 = require_dsa_digest();
	var node_key_js_1 = require_node_key();
	var sign_js_1 = require_sign$4();
	var get_sign_verify_key_js_1 = require_get_sign_verify_key();
	var flags_js_1 = require_flags();
	var oneShotVerify;
	if (crypto$5.verify.length > 4 && flags_js_1.oneShotCallback) oneShotVerify = (0, util_1$1.promisify)(crypto$5.verify);
	else oneShotVerify = crypto$5.verify;
	var verify = async (alg, key, signature, data) => {
		const keyObject = (0, get_sign_verify_key_js_1.default)(alg, key, "verify");
		if (alg.startsWith("HS")) {
			const expected = await (0, sign_js_1.default)(alg, keyObject, data);
			const actual = signature;
			try {
				return crypto$5.timingSafeEqual(actual, expected);
			} catch {
				return false;
			}
		}
		const algorithm = (0, dsa_digest_js_1.default)(alg);
		const keyInput = (0, node_key_js_1.default)(alg, keyObject);
		try {
			return await oneShotVerify(algorithm, data, keyInput, signature);
		} catch {
			return false;
		}
	};
	exports.default = verify;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jws/flattened/verify.js
var require_verify$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.flattenedVerify = void 0;
	var base64url_js_1 = require_base64url$2();
	var verify_js_1 = require_verify$4();
	var errors_js_1 = require_errors$2();
	var buffer_utils_js_1 = require_buffer_utils();
	var is_disjoint_js_1 = require_is_disjoint();
	var is_object_js_1 = require_is_object();
	var check_key_type_js_1 = require_check_key_type();
	var validate_crit_js_1 = require_validate_crit();
	var validate_algorithms_js_1 = require_validate_algorithms();
	async function flattenedVerify(jws, key, options) {
		var _a;
		if (!(0, is_object_js_1.default)(jws)) throw new errors_js_1.JWSInvalid("Flattened JWS must be an object");
		if (jws.protected === void 0 && jws.header === void 0) throw new errors_js_1.JWSInvalid("Flattened JWS must have either of the \"protected\" or \"header\" members");
		if (jws.protected !== void 0 && typeof jws.protected !== "string") throw new errors_js_1.JWSInvalid("JWS Protected Header incorrect type");
		if (jws.payload === void 0) throw new errors_js_1.JWSInvalid("JWS Payload missing");
		if (typeof jws.signature !== "string") throw new errors_js_1.JWSInvalid("JWS Signature missing or incorrect type");
		if (jws.header !== void 0 && !(0, is_object_js_1.default)(jws.header)) throw new errors_js_1.JWSInvalid("JWS Unprotected Header incorrect type");
		let parsedProt = {};
		if (jws.protected) try {
			const protectedHeader = (0, base64url_js_1.decode)(jws.protected);
			parsedProt = JSON.parse(buffer_utils_js_1.decoder.decode(protectedHeader));
		} catch {
			throw new errors_js_1.JWSInvalid("JWS Protected Header is invalid");
		}
		if (!(0, is_disjoint_js_1.default)(parsedProt, jws.header)) throw new errors_js_1.JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
		const joseHeader = {
			...parsedProt,
			...jws.header
		};
		const extensions = (0, validate_crit_js_1.default)(errors_js_1.JWSInvalid, new Map([["b64", true]]), options === null || options === void 0 ? void 0 : options.crit, parsedProt, joseHeader);
		let b64 = true;
		if (extensions.has("b64")) {
			b64 = parsedProt.b64;
			if (typeof b64 !== "boolean") throw new errors_js_1.JWSInvalid("The \"b64\" (base64url-encode payload) Header Parameter must be a boolean");
		}
		const { alg } = joseHeader;
		if (typeof alg !== "string" || !alg) throw new errors_js_1.JWSInvalid("JWS \"alg\" (Algorithm) Header Parameter missing or invalid");
		const algorithms = options && (0, validate_algorithms_js_1.default)("algorithms", options.algorithms);
		if (algorithms && !algorithms.has(alg)) throw new errors_js_1.JOSEAlgNotAllowed("\"alg\" (Algorithm) Header Parameter not allowed");
		if (b64) {
			if (typeof jws.payload !== "string") throw new errors_js_1.JWSInvalid("JWS Payload must be a string");
		} else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) throw new errors_js_1.JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
		let resolvedKey = false;
		if (typeof key === "function") {
			key = await key(parsedProt, jws);
			resolvedKey = true;
		}
		(0, check_key_type_js_1.default)(alg, key, "verify");
		const data = (0, buffer_utils_js_1.concat)(buffer_utils_js_1.encoder.encode((_a = jws.protected) !== null && _a !== void 0 ? _a : ""), buffer_utils_js_1.encoder.encode("."), typeof jws.payload === "string" ? buffer_utils_js_1.encoder.encode(jws.payload) : jws.payload);
		let signature;
		try {
			signature = (0, base64url_js_1.decode)(jws.signature);
		} catch {
			throw new errors_js_1.JWSInvalid("Failed to base64url decode the signature");
		}
		if (!await (0, verify_js_1.default)(alg, key, signature, data)) throw new errors_js_1.JWSSignatureVerificationFailed();
		let payload;
		if (b64) try {
			payload = (0, base64url_js_1.decode)(jws.payload);
		} catch {
			throw new errors_js_1.JWSInvalid("Failed to base64url decode the payload");
		}
		else if (typeof jws.payload === "string") payload = buffer_utils_js_1.encoder.encode(jws.payload);
		else payload = jws.payload;
		const result = { payload };
		if (jws.protected !== void 0) result.protectedHeader = parsedProt;
		if (jws.header !== void 0) result.unprotectedHeader = jws.header;
		if (resolvedKey) return {
			...result,
			key
		};
		return result;
	}
	exports.flattenedVerify = flattenedVerify;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jws/compact/verify.js
var require_verify$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.compactVerify = void 0;
	var verify_js_1 = require_verify$3();
	var errors_js_1 = require_errors$2();
	var buffer_utils_js_1 = require_buffer_utils();
	async function compactVerify(jws, key, options) {
		if (jws instanceof Uint8Array) jws = buffer_utils_js_1.decoder.decode(jws);
		if (typeof jws !== "string") throw new errors_js_1.JWSInvalid("Compact JWS must be a string or Uint8Array");
		const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
		if (length !== 3) throw new errors_js_1.JWSInvalid("Invalid Compact JWS");
		const verified = await (0, verify_js_1.flattenedVerify)({
			payload,
			protected: protectedHeader,
			signature
		}, key, options);
		const result = {
			payload: verified.payload,
			protectedHeader: verified.protectedHeader
		};
		if (typeof key === "function") return {
			...result,
			key: verified.key
		};
		return result;
	}
	exports.compactVerify = compactVerify;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jws/general/verify.js
var require_verify$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.generalVerify = void 0;
	var verify_js_1 = require_verify$3();
	var errors_js_1 = require_errors$2();
	var is_object_js_1 = require_is_object();
	async function generalVerify(jws, key, options) {
		if (!(0, is_object_js_1.default)(jws)) throw new errors_js_1.JWSInvalid("General JWS must be an object");
		if (!Array.isArray(jws.signatures) || !jws.signatures.every(is_object_js_1.default)) throw new errors_js_1.JWSInvalid("JWS Signatures missing or incorrect type");
		for (const signature of jws.signatures) try {
			return await (0, verify_js_1.flattenedVerify)({
				header: signature.header,
				payload: jws.payload,
				protected: signature.protected,
				signature: signature.signature
			}, key, options);
		} catch {}
		throw new errors_js_1.JWSSignatureVerificationFailed();
	}
	exports.generalVerify = generalVerify;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/epoch.js
var require_epoch = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = (date) => Math.floor(date.getTime() / 1e3);
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/secs.js
var require_secs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var minute = 60;
	var hour = minute * 60;
	var day = hour * 24;
	var week = day * 7;
	var year = day * 365.25;
	var REGEX = /^(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)$/i;
	exports.default = (str) => {
		const matched = REGEX.exec(str);
		if (!matched) throw new TypeError("Invalid time period format");
		const value = parseFloat(matched[1]);
		switch (matched[2].toLowerCase()) {
			case "sec":
			case "secs":
			case "second":
			case "seconds":
			case "s": return Math.round(value);
			case "minute":
			case "minutes":
			case "min":
			case "mins":
			case "m": return Math.round(value * minute);
			case "hour":
			case "hours":
			case "hr":
			case "hrs":
			case "h": return Math.round(value * hour);
			case "day":
			case "days":
			case "d": return Math.round(value * day);
			case "week":
			case "weeks":
			case "w": return Math.round(value * week);
			default: return Math.round(value * year);
		}
	};
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/lib/jwt_claims_set.js
var require_jwt_claims_set = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var errors_js_1 = require_errors$2();
	var buffer_utils_js_1 = require_buffer_utils();
	var epoch_js_1 = require_epoch();
	var secs_js_1 = require_secs();
	var is_object_js_1 = require_is_object();
	var normalizeTyp = (value) => value.toLowerCase().replace(/^application\//, "");
	var checkAudiencePresence = (audPayload, audOption) => {
		if (typeof audPayload === "string") return audOption.includes(audPayload);
		if (Array.isArray(audPayload)) return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
		return false;
	};
	exports.default = (protectedHeader, encodedPayload, options = {}) => {
		const { typ } = options;
		if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) throw new errors_js_1.JWTClaimValidationFailed("unexpected \"typ\" JWT header value", "typ", "check_failed");
		let payload;
		try {
			payload = JSON.parse(buffer_utils_js_1.decoder.decode(encodedPayload));
		} catch {}
		if (!(0, is_object_js_1.default)(payload)) throw new errors_js_1.JWTInvalid("JWT Claims Set must be a top-level JSON object");
		const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
		if (maxTokenAge !== void 0) requiredClaims.push("iat");
		if (audience !== void 0) requiredClaims.push("aud");
		if (subject !== void 0) requiredClaims.push("sub");
		if (issuer !== void 0) requiredClaims.push("iss");
		for (const claim of new Set(requiredClaims.reverse())) if (!(claim in payload)) throw new errors_js_1.JWTClaimValidationFailed(`missing required "${claim}" claim`, claim, "missing");
		if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) throw new errors_js_1.JWTClaimValidationFailed("unexpected \"iss\" claim value", "iss", "check_failed");
		if (subject && payload.sub !== subject) throw new errors_js_1.JWTClaimValidationFailed("unexpected \"sub\" claim value", "sub", "check_failed");
		if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) throw new errors_js_1.JWTClaimValidationFailed("unexpected \"aud\" claim value", "aud", "check_failed");
		let tolerance;
		switch (typeof options.clockTolerance) {
			case "string":
				tolerance = (0, secs_js_1.default)(options.clockTolerance);
				break;
			case "number":
				tolerance = options.clockTolerance;
				break;
			case "undefined":
				tolerance = 0;
				break;
			default: throw new TypeError("Invalid clockTolerance option type");
		}
		const { currentDate } = options;
		const now = (0, epoch_js_1.default)(currentDate || /* @__PURE__ */ new Date());
		if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") throw new errors_js_1.JWTClaimValidationFailed("\"iat\" claim must be a number", "iat", "invalid");
		if (payload.nbf !== void 0) {
			if (typeof payload.nbf !== "number") throw new errors_js_1.JWTClaimValidationFailed("\"nbf\" claim must be a number", "nbf", "invalid");
			if (payload.nbf > now + tolerance) throw new errors_js_1.JWTClaimValidationFailed("\"nbf\" claim timestamp check failed", "nbf", "check_failed");
		}
		if (payload.exp !== void 0) {
			if (typeof payload.exp !== "number") throw new errors_js_1.JWTClaimValidationFailed("\"exp\" claim must be a number", "exp", "invalid");
			if (payload.exp <= now - tolerance) throw new errors_js_1.JWTExpired("\"exp\" claim timestamp check failed", "exp", "check_failed");
		}
		if (maxTokenAge) {
			const age = now - payload.iat;
			const max = typeof maxTokenAge === "number" ? maxTokenAge : (0, secs_js_1.default)(maxTokenAge);
			if (age - tolerance > max) throw new errors_js_1.JWTExpired("\"iat\" claim timestamp check failed (too far in the past)", "iat", "check_failed");
			if (age < 0 - tolerance) throw new errors_js_1.JWTClaimValidationFailed("\"iat\" claim timestamp check failed (it should be in the past)", "iat", "check_failed");
		}
		return payload;
	};
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwt/verify.js
var require_verify = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.jwtVerify = void 0;
	var verify_js_1 = require_verify$2();
	var jwt_claims_set_js_1 = require_jwt_claims_set();
	var errors_js_1 = require_errors$2();
	async function jwtVerify(jwt, key, options) {
		var _a;
		const verified = await (0, verify_js_1.compactVerify)(jwt, key, options);
		if (((_a = verified.protectedHeader.crit) === null || _a === void 0 ? void 0 : _a.includes("b64")) && verified.protectedHeader.b64 === false) throw new errors_js_1.JWTInvalid("JWTs MUST NOT use unencoded payload");
		const result = {
			payload: (0, jwt_claims_set_js_1.default)(verified.protectedHeader, verified.payload, options),
			protectedHeader: verified.protectedHeader
		};
		if (typeof key === "function") return {
			...result,
			key: verified.key
		};
		return result;
	}
	exports.jwtVerify = jwtVerify;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwt/decrypt.js
var require_decrypt = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.jwtDecrypt = void 0;
	var decrypt_js_1 = require_decrypt$2();
	var jwt_claims_set_js_1 = require_jwt_claims_set();
	var errors_js_1 = require_errors$2();
	async function jwtDecrypt(jwt, key, options) {
		const decrypted = await (0, decrypt_js_1.compactDecrypt)(jwt, key, options);
		const payload = (0, jwt_claims_set_js_1.default)(decrypted.protectedHeader, decrypted.plaintext, options);
		const { protectedHeader } = decrypted;
		if (protectedHeader.iss !== void 0 && protectedHeader.iss !== payload.iss) throw new errors_js_1.JWTClaimValidationFailed("replicated \"iss\" claim header parameter mismatch", "iss", "mismatch");
		if (protectedHeader.sub !== void 0 && protectedHeader.sub !== payload.sub) throw new errors_js_1.JWTClaimValidationFailed("replicated \"sub\" claim header parameter mismatch", "sub", "mismatch");
		if (protectedHeader.aud !== void 0 && JSON.stringify(protectedHeader.aud) !== JSON.stringify(payload.aud)) throw new errors_js_1.JWTClaimValidationFailed("replicated \"aud\" claim header parameter mismatch", "aud", "mismatch");
		const result = {
			payload,
			protectedHeader
		};
		if (typeof key === "function") return {
			...result,
			key: decrypted.key
		};
		return result;
	}
	exports.jwtDecrypt = jwtDecrypt;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwe/compact/encrypt.js
var require_encrypt$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CompactEncrypt = void 0;
	var encrypt_js_1 = require_encrypt$3();
	var CompactEncrypt = class {
		constructor(plaintext) {
			this._flattened = new encrypt_js_1.FlattenedEncrypt(plaintext);
		}
		setContentEncryptionKey(cek) {
			this._flattened.setContentEncryptionKey(cek);
			return this;
		}
		setInitializationVector(iv) {
			this._flattened.setInitializationVector(iv);
			return this;
		}
		setProtectedHeader(protectedHeader) {
			this._flattened.setProtectedHeader(protectedHeader);
			return this;
		}
		setKeyManagementParameters(parameters) {
			this._flattened.setKeyManagementParameters(parameters);
			return this;
		}
		async encrypt(key, options) {
			const jwe = await this._flattened.encrypt(key, options);
			return [
				jwe.protected,
				jwe.encrypted_key,
				jwe.iv,
				jwe.ciphertext,
				jwe.tag
			].join(".");
		}
	};
	exports.CompactEncrypt = CompactEncrypt;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jws/flattened/sign.js
var require_sign$3 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.FlattenedSign = void 0;
	var base64url_js_1 = require_base64url$2();
	var sign_js_1 = require_sign$4();
	var is_disjoint_js_1 = require_is_disjoint();
	var errors_js_1 = require_errors$2();
	var buffer_utils_js_1 = require_buffer_utils();
	var check_key_type_js_1 = require_check_key_type();
	var validate_crit_js_1 = require_validate_crit();
	var FlattenedSign = class {
		constructor(payload) {
			if (!(payload instanceof Uint8Array)) throw new TypeError("payload must be an instance of Uint8Array");
			this._payload = payload;
		}
		setProtectedHeader(protectedHeader) {
			if (this._protectedHeader) throw new TypeError("setProtectedHeader can only be called once");
			this._protectedHeader = protectedHeader;
			return this;
		}
		setUnprotectedHeader(unprotectedHeader) {
			if (this._unprotectedHeader) throw new TypeError("setUnprotectedHeader can only be called once");
			this._unprotectedHeader = unprotectedHeader;
			return this;
		}
		async sign(key, options) {
			if (!this._protectedHeader && !this._unprotectedHeader) throw new errors_js_1.JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
			if (!(0, is_disjoint_js_1.default)(this._protectedHeader, this._unprotectedHeader)) throw new errors_js_1.JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
			const joseHeader = {
				...this._protectedHeader,
				...this._unprotectedHeader
			};
			const extensions = (0, validate_crit_js_1.default)(errors_js_1.JWSInvalid, new Map([["b64", true]]), options === null || options === void 0 ? void 0 : options.crit, this._protectedHeader, joseHeader);
			let b64 = true;
			if (extensions.has("b64")) {
				b64 = this._protectedHeader.b64;
				if (typeof b64 !== "boolean") throw new errors_js_1.JWSInvalid("The \"b64\" (base64url-encode payload) Header Parameter must be a boolean");
			}
			const { alg } = joseHeader;
			if (typeof alg !== "string" || !alg) throw new errors_js_1.JWSInvalid("JWS \"alg\" (Algorithm) Header Parameter missing or invalid");
			(0, check_key_type_js_1.default)(alg, key, "sign");
			let payload = this._payload;
			if (b64) payload = buffer_utils_js_1.encoder.encode((0, base64url_js_1.encode)(payload));
			let protectedHeader;
			if (this._protectedHeader) protectedHeader = buffer_utils_js_1.encoder.encode((0, base64url_js_1.encode)(JSON.stringify(this._protectedHeader)));
			else protectedHeader = buffer_utils_js_1.encoder.encode("");
			const data = (0, buffer_utils_js_1.concat)(protectedHeader, buffer_utils_js_1.encoder.encode("."), payload);
			const signature = await (0, sign_js_1.default)(alg, key, data);
			const jws = {
				signature: (0, base64url_js_1.encode)(signature),
				payload: ""
			};
			if (b64) jws.payload = buffer_utils_js_1.decoder.decode(payload);
			if (this._unprotectedHeader) jws.header = this._unprotectedHeader;
			if (this._protectedHeader) jws.protected = buffer_utils_js_1.decoder.decode(protectedHeader);
			return jws;
		}
	};
	exports.FlattenedSign = FlattenedSign;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jws/compact/sign.js
var require_sign$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.CompactSign = void 0;
	var sign_js_1 = require_sign$3();
	var CompactSign = class {
		constructor(payload) {
			this._flattened = new sign_js_1.FlattenedSign(payload);
		}
		setProtectedHeader(protectedHeader) {
			this._flattened.setProtectedHeader(protectedHeader);
			return this;
		}
		async sign(key, options) {
			const jws = await this._flattened.sign(key, options);
			if (jws.payload === void 0) throw new TypeError("use the flattened module for creating JWS with b64: false");
			return `${jws.protected}.${jws.payload}.${jws.signature}`;
		}
	};
	exports.CompactSign = CompactSign;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jws/general/sign.js
var require_sign$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.GeneralSign = void 0;
	var sign_js_1 = require_sign$3();
	var errors_js_1 = require_errors$2();
	var IndividualSignature = class {
		constructor(sig, key, options) {
			this.parent = sig;
			this.key = key;
			this.options = options;
		}
		setProtectedHeader(protectedHeader) {
			if (this.protectedHeader) throw new TypeError("setProtectedHeader can only be called once");
			this.protectedHeader = protectedHeader;
			return this;
		}
		setUnprotectedHeader(unprotectedHeader) {
			if (this.unprotectedHeader) throw new TypeError("setUnprotectedHeader can only be called once");
			this.unprotectedHeader = unprotectedHeader;
			return this;
		}
		addSignature(...args) {
			return this.parent.addSignature(...args);
		}
		sign(...args) {
			return this.parent.sign(...args);
		}
		done() {
			return this.parent;
		}
	};
	var GeneralSign = class {
		constructor(payload) {
			this._signatures = [];
			this._payload = payload;
		}
		addSignature(key, options) {
			const signature = new IndividualSignature(this, key, options);
			this._signatures.push(signature);
			return signature;
		}
		async sign() {
			if (!this._signatures.length) throw new errors_js_1.JWSInvalid("at least one signature must be added");
			const jws = {
				signatures: [],
				payload: ""
			};
			for (let i = 0; i < this._signatures.length; i++) {
				const signature = this._signatures[i];
				const flattened = new sign_js_1.FlattenedSign(this._payload);
				flattened.setProtectedHeader(signature.protectedHeader);
				flattened.setUnprotectedHeader(signature.unprotectedHeader);
				const { payload, ...rest } = await flattened.sign(signature.key, signature.options);
				if (i === 0) jws.payload = payload;
				else if (jws.payload !== payload) throw new errors_js_1.JWSInvalid("inconsistent use of JWS Unencoded Payload (RFC7797)");
				jws.signatures.push(rest);
			}
			return jws;
		}
	};
	exports.GeneralSign = GeneralSign;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwt/produce.js
var require_produce = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ProduceJWT = void 0;
	var epoch_js_1 = require_epoch();
	var is_object_js_1 = require_is_object();
	var secs_js_1 = require_secs();
	var ProduceJWT = class {
		constructor(payload) {
			if (!(0, is_object_js_1.default)(payload)) throw new TypeError("JWT Claims Set MUST be an object");
			this._payload = payload;
		}
		setIssuer(issuer) {
			this._payload = {
				...this._payload,
				iss: issuer
			};
			return this;
		}
		setSubject(subject) {
			this._payload = {
				...this._payload,
				sub: subject
			};
			return this;
		}
		setAudience(audience) {
			this._payload = {
				...this._payload,
				aud: audience
			};
			return this;
		}
		setJti(jwtId) {
			this._payload = {
				...this._payload,
				jti: jwtId
			};
			return this;
		}
		setNotBefore(input) {
			if (typeof input === "number") this._payload = {
				...this._payload,
				nbf: input
			};
			else this._payload = {
				...this._payload,
				nbf: (0, epoch_js_1.default)(/* @__PURE__ */ new Date()) + (0, secs_js_1.default)(input)
			};
			return this;
		}
		setExpirationTime(input) {
			if (typeof input === "number") this._payload = {
				...this._payload,
				exp: input
			};
			else this._payload = {
				...this._payload,
				exp: (0, epoch_js_1.default)(/* @__PURE__ */ new Date()) + (0, secs_js_1.default)(input)
			};
			return this;
		}
		setIssuedAt(input) {
			if (typeof input === "undefined") this._payload = {
				...this._payload,
				iat: (0, epoch_js_1.default)(/* @__PURE__ */ new Date())
			};
			else this._payload = {
				...this._payload,
				iat: input
			};
			return this;
		}
	};
	exports.ProduceJWT = ProduceJWT;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwt/sign.js
var require_sign = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SignJWT = void 0;
	var sign_js_1 = require_sign$2();
	var errors_js_1 = require_errors$2();
	var buffer_utils_js_1 = require_buffer_utils();
	var produce_js_1 = require_produce();
	var SignJWT = class extends produce_js_1.ProduceJWT {
		setProtectedHeader(protectedHeader) {
			this._protectedHeader = protectedHeader;
			return this;
		}
		async sign(key, options) {
			var _a;
			const sig = new sign_js_1.CompactSign(buffer_utils_js_1.encoder.encode(JSON.stringify(this._payload)));
			sig.setProtectedHeader(this._protectedHeader);
			if (Array.isArray((_a = this._protectedHeader) === null || _a === void 0 ? void 0 : _a.crit) && this._protectedHeader.crit.includes("b64") && this._protectedHeader.b64 === false) throw new errors_js_1.JWTInvalid("JWTs MUST NOT use unencoded payload");
			return sig.sign(key, options);
		}
	};
	exports.SignJWT = SignJWT;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwt/encrypt.js
var require_encrypt = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EncryptJWT = void 0;
	var encrypt_js_1 = require_encrypt$1();
	var buffer_utils_js_1 = require_buffer_utils();
	var produce_js_1 = require_produce();
	var EncryptJWT = class extends produce_js_1.ProduceJWT {
		setProtectedHeader(protectedHeader) {
			if (this._protectedHeader) throw new TypeError("setProtectedHeader can only be called once");
			this._protectedHeader = protectedHeader;
			return this;
		}
		setKeyManagementParameters(parameters) {
			if (this._keyManagementParameters) throw new TypeError("setKeyManagementParameters can only be called once");
			this._keyManagementParameters = parameters;
			return this;
		}
		setContentEncryptionKey(cek) {
			if (this._cek) throw new TypeError("setContentEncryptionKey can only be called once");
			this._cek = cek;
			return this;
		}
		setInitializationVector(iv) {
			if (this._iv) throw new TypeError("setInitializationVector can only be called once");
			this._iv = iv;
			return this;
		}
		replicateIssuerAsHeader() {
			this._replicateIssuerAsHeader = true;
			return this;
		}
		replicateSubjectAsHeader() {
			this._replicateSubjectAsHeader = true;
			return this;
		}
		replicateAudienceAsHeader() {
			this._replicateAudienceAsHeader = true;
			return this;
		}
		async encrypt(key, options) {
			const enc = new encrypt_js_1.CompactEncrypt(buffer_utils_js_1.encoder.encode(JSON.stringify(this._payload)));
			if (this._replicateIssuerAsHeader) this._protectedHeader = {
				...this._protectedHeader,
				iss: this._payload.iss
			};
			if (this._replicateSubjectAsHeader) this._protectedHeader = {
				...this._protectedHeader,
				sub: this._payload.sub
			};
			if (this._replicateAudienceAsHeader) this._protectedHeader = {
				...this._protectedHeader,
				aud: this._payload.aud
			};
			enc.setProtectedHeader(this._protectedHeader);
			if (this._iv) enc.setInitializationVector(this._iv);
			if (this._cek) enc.setContentEncryptionKey(this._cek);
			if (this._keyManagementParameters) enc.setKeyManagementParameters(this._keyManagementParameters);
			return enc.encrypt(key, options);
		}
	};
	exports.EncryptJWT = EncryptJWT;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwk/thumbprint.js
var require_thumbprint = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.calculateJwkThumbprintUri = exports.calculateJwkThumbprint = void 0;
	var digest_js_1 = require_digest();
	var base64url_js_1 = require_base64url$2();
	var errors_js_1 = require_errors$2();
	var buffer_utils_js_1 = require_buffer_utils();
	var is_object_js_1 = require_is_object();
	var check = (value, description) => {
		if (typeof value !== "string" || !value) throw new errors_js_1.JWKInvalid(`${description} missing or invalid`);
	};
	async function calculateJwkThumbprint(jwk, digestAlgorithm) {
		if (!(0, is_object_js_1.default)(jwk)) throw new TypeError("JWK must be an object");
		digestAlgorithm !== null && digestAlgorithm !== void 0 || (digestAlgorithm = "sha256");
		if (digestAlgorithm !== "sha256" && digestAlgorithm !== "sha384" && digestAlgorithm !== "sha512") throw new TypeError("digestAlgorithm must one of \"sha256\", \"sha384\", or \"sha512\"");
		let components;
		switch (jwk.kty) {
			case "EC":
				check(jwk.crv, "\"crv\" (Curve) Parameter");
				check(jwk.x, "\"x\" (X Coordinate) Parameter");
				check(jwk.y, "\"y\" (Y Coordinate) Parameter");
				components = {
					crv: jwk.crv,
					kty: jwk.kty,
					x: jwk.x,
					y: jwk.y
				};
				break;
			case "OKP":
				check(jwk.crv, "\"crv\" (Subtype of Key Pair) Parameter");
				check(jwk.x, "\"x\" (Public Key) Parameter");
				components = {
					crv: jwk.crv,
					kty: jwk.kty,
					x: jwk.x
				};
				break;
			case "RSA":
				check(jwk.e, "\"e\" (Exponent) Parameter");
				check(jwk.n, "\"n\" (Modulus) Parameter");
				components = {
					e: jwk.e,
					kty: jwk.kty,
					n: jwk.n
				};
				break;
			case "oct":
				check(jwk.k, "\"k\" (Key Value) Parameter");
				components = {
					k: jwk.k,
					kty: jwk.kty
				};
				break;
			default: throw new errors_js_1.JOSENotSupported("\"kty\" (Key Type) Parameter missing or unsupported");
		}
		const data = buffer_utils_js_1.encoder.encode(JSON.stringify(components));
		return (0, base64url_js_1.encode)(await (0, digest_js_1.default)(digestAlgorithm, data));
	}
	exports.calculateJwkThumbprint = calculateJwkThumbprint;
	async function calculateJwkThumbprintUri(jwk, digestAlgorithm) {
		digestAlgorithm !== null && digestAlgorithm !== void 0 || (digestAlgorithm = "sha256");
		const thumbprint = await calculateJwkThumbprint(jwk, digestAlgorithm);
		return `urn:ietf:params:oauth:jwk-thumbprint:sha-${digestAlgorithm.slice(-3)}:${thumbprint}`;
	}
	exports.calculateJwkThumbprintUri = calculateJwkThumbprintUri;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwk/embedded.js
var require_embedded = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.EmbeddedJWK = void 0;
	var import_js_1 = require_import();
	var is_object_js_1 = require_is_object();
	var errors_js_1 = require_errors$2();
	async function EmbeddedJWK(protectedHeader, token) {
		const joseHeader = {
			...protectedHeader,
			...token === null || token === void 0 ? void 0 : token.header
		};
		if (!(0, is_object_js_1.default)(joseHeader.jwk)) throw new errors_js_1.JWSInvalid("\"jwk\" (JSON Web Key) Header Parameter must be a JSON object");
		const key = await (0, import_js_1.importJWK)({
			...joseHeader.jwk,
			ext: true
		}, joseHeader.alg, true);
		if (key instanceof Uint8Array || key.type !== "public") throw new errors_js_1.JWSInvalid("\"jwk\" (JSON Web Key) Header Parameter must be a public key");
		return key;
	}
	exports.EmbeddedJWK = EmbeddedJWK;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwks/local.js
var require_local = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createLocalJWKSet = exports.LocalJWKSet = exports.isJWKSLike = void 0;
	var import_js_1 = require_import();
	var errors_js_1 = require_errors$2();
	var is_object_js_1 = require_is_object();
	function getKtyFromAlg(alg) {
		switch (typeof alg === "string" && alg.slice(0, 2)) {
			case "RS":
			case "PS": return "RSA";
			case "ES": return "EC";
			case "Ed": return "OKP";
			default: throw new errors_js_1.JOSENotSupported("Unsupported \"alg\" value for a JSON Web Key Set");
		}
	}
	function isJWKSLike(jwks) {
		return jwks && typeof jwks === "object" && Array.isArray(jwks.keys) && jwks.keys.every(isJWKLike);
	}
	exports.isJWKSLike = isJWKSLike;
	function isJWKLike(key) {
		return (0, is_object_js_1.default)(key);
	}
	function clone(obj) {
		if (typeof structuredClone === "function") return structuredClone(obj);
		return JSON.parse(JSON.stringify(obj));
	}
	var LocalJWKSet = class {
		constructor(jwks) {
			this._cached = /* @__PURE__ */ new WeakMap();
			if (!isJWKSLike(jwks)) throw new errors_js_1.JWKSInvalid("JSON Web Key Set malformed");
			this._jwks = clone(jwks);
		}
		async getKey(protectedHeader, token) {
			const { alg, kid } = {
				...protectedHeader,
				...token === null || token === void 0 ? void 0 : token.header
			};
			const kty = getKtyFromAlg(alg);
			const candidates = this._jwks.keys.filter((jwk) => {
				let candidate = kty === jwk.kty;
				if (candidate && typeof kid === "string") candidate = kid === jwk.kid;
				if (candidate && typeof jwk.alg === "string") candidate = alg === jwk.alg;
				if (candidate && typeof jwk.use === "string") candidate = jwk.use === "sig";
				if (candidate && Array.isArray(jwk.key_ops)) candidate = jwk.key_ops.includes("verify");
				if (candidate && alg === "EdDSA") candidate = jwk.crv === "Ed25519" || jwk.crv === "Ed448";
				if (candidate) switch (alg) {
					case "ES256":
						candidate = jwk.crv === "P-256";
						break;
					case "ES256K":
						candidate = jwk.crv === "secp256k1";
						break;
					case "ES384":
						candidate = jwk.crv === "P-384";
						break;
					case "ES512":
						candidate = jwk.crv === "P-521";
						break;
				}
				return candidate;
			});
			const { 0: jwk, length } = candidates;
			if (length === 0) throw new errors_js_1.JWKSNoMatchingKey();
			else if (length !== 1) {
				const error = new errors_js_1.JWKSMultipleMatchingKeys();
				const { _cached } = this;
				error[Symbol.asyncIterator] = async function* () {
					for (const jwk of candidates) try {
						yield await importWithAlgCache(_cached, jwk, alg);
					} catch {
						continue;
					}
				};
				throw error;
			}
			return importWithAlgCache(this._cached, jwk, alg);
		}
	};
	exports.LocalJWKSet = LocalJWKSet;
	async function importWithAlgCache(cache, jwk, alg) {
		const cached = cache.get(jwk) || cache.set(jwk, {}).get(jwk);
		if (cached[alg] === void 0) {
			const key = await (0, import_js_1.importJWK)({
				...jwk,
				ext: true
			}, alg);
			if (key instanceof Uint8Array || key.type !== "public") throw new errors_js_1.JWKSInvalid("JSON Web Key Set members must be public keys");
			cached[alg] = key;
		}
		return cached[alg];
	}
	function createLocalJWKSet(jwks) {
		const set = new LocalJWKSet(jwks);
		return async function(protectedHeader, token) {
			return set.getKey(protectedHeader, token);
		};
	}
	exports.createLocalJWKSet = createLocalJWKSet;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/fetch_jwks.js
var require_fetch_jwks = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var http$3 = __require("http");
	var https$3 = __require("https");
	var events_1 = __require("events");
	var errors_js_1 = require_errors$2();
	var buffer_utils_js_1 = require_buffer_utils();
	var fetchJwks = async (url, timeout, options) => {
		let get;
		switch (url.protocol) {
			case "https:":
				get = https$3.get;
				break;
			case "http:":
				get = http$3.get;
				break;
			default: throw new TypeError("Unsupported URL protocol.");
		}
		const { agent, headers } = options;
		const req = get(url.href, {
			agent,
			timeout,
			headers
		});
		const [response] = await Promise.race([(0, events_1.once)(req, "response"), (0, events_1.once)(req, "timeout")]);
		if (!response) {
			req.destroy();
			throw new errors_js_1.JWKSTimeout();
		}
		if (response.statusCode !== 200) throw new errors_js_1.JOSEError("Expected 200 OK from the JSON Web Key Set HTTP response");
		const parts = [];
		for await (const part of response) parts.push(part);
		try {
			return JSON.parse(buffer_utils_js_1.decoder.decode((0, buffer_utils_js_1.concat)(...parts)));
		} catch {
			throw new errors_js_1.JOSEError("Failed to parse the JSON Web Key Set HTTP response as JSON");
		}
	};
	exports.default = fetchJwks;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwks/remote.js
var require_remote = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createRemoteJWKSet = void 0;
	var fetch_jwks_js_1 = require_fetch_jwks();
	var errors_js_1 = require_errors$2();
	var local_js_1 = require_local();
	function isCloudflareWorkers() {
		return typeof WebSocketPair !== "undefined" || typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers" || typeof EdgeRuntime !== "undefined" && EdgeRuntime === "vercel";
	}
	var RemoteJWKSet = class extends local_js_1.LocalJWKSet {
		constructor(url, options) {
			super({ keys: [] });
			this._jwks = void 0;
			if (!(url instanceof URL)) throw new TypeError("url must be an instance of URL");
			this._url = new URL(url.href);
			this._options = {
				agent: options === null || options === void 0 ? void 0 : options.agent,
				headers: options === null || options === void 0 ? void 0 : options.headers
			};
			this._timeoutDuration = typeof (options === null || options === void 0 ? void 0 : options.timeoutDuration) === "number" ? options === null || options === void 0 ? void 0 : options.timeoutDuration : 5e3;
			this._cooldownDuration = typeof (options === null || options === void 0 ? void 0 : options.cooldownDuration) === "number" ? options === null || options === void 0 ? void 0 : options.cooldownDuration : 3e4;
			this._cacheMaxAge = typeof (options === null || options === void 0 ? void 0 : options.cacheMaxAge) === "number" ? options === null || options === void 0 ? void 0 : options.cacheMaxAge : 6e5;
		}
		coolingDown() {
			return typeof this._jwksTimestamp === "number" ? Date.now() < this._jwksTimestamp + this._cooldownDuration : false;
		}
		fresh() {
			return typeof this._jwksTimestamp === "number" ? Date.now() < this._jwksTimestamp + this._cacheMaxAge : false;
		}
		async getKey(protectedHeader, token) {
			if (!this._jwks || !this.fresh()) await this.reload();
			try {
				return await super.getKey(protectedHeader, token);
			} catch (err) {
				if (err instanceof errors_js_1.JWKSNoMatchingKey) {
					if (this.coolingDown() === false) {
						await this.reload();
						return super.getKey(protectedHeader, token);
					}
				}
				throw err;
			}
		}
		async reload() {
			if (this._pendingFetch && isCloudflareWorkers()) this._pendingFetch = void 0;
			this._pendingFetch || (this._pendingFetch = (0, fetch_jwks_js_1.default)(this._url, this._timeoutDuration, this._options).then((json) => {
				if (!(0, local_js_1.isJWKSLike)(json)) throw new errors_js_1.JWKSInvalid("JSON Web Key Set malformed");
				this._jwks = { keys: json.keys };
				this._jwksTimestamp = Date.now();
				this._pendingFetch = void 0;
			}).catch((err) => {
				this._pendingFetch = void 0;
				throw err;
			}));
			await this._pendingFetch;
		}
	};
	function createRemoteJWKSet(url, options) {
		const set = new RemoteJWKSet(url, options);
		return async function(protectedHeader, token) {
			return set.getKey(protectedHeader, token);
		};
	}
	exports.createRemoteJWKSet = createRemoteJWKSet;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/jwt/unsecured.js
var require_unsecured = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.UnsecuredJWT = void 0;
	var base64url = require_base64url$2();
	var buffer_utils_js_1 = require_buffer_utils();
	var errors_js_1 = require_errors$2();
	var jwt_claims_set_js_1 = require_jwt_claims_set();
	var produce_js_1 = require_produce();
	var UnsecuredJWT = class extends produce_js_1.ProduceJWT {
		encode() {
			return `${base64url.encode(JSON.stringify({ alg: "none" }))}.${base64url.encode(JSON.stringify(this._payload))}.`;
		}
		static decode(jwt, options) {
			if (typeof jwt !== "string") throw new errors_js_1.JWTInvalid("Unsecured JWT must be a string");
			const { 0: encodedHeader, 1: encodedPayload, 2: signature, length } = jwt.split(".");
			if (length !== 3 || signature !== "") throw new errors_js_1.JWTInvalid("Invalid Unsecured JWT");
			let header;
			try {
				header = JSON.parse(buffer_utils_js_1.decoder.decode(base64url.decode(encodedHeader)));
				if (header.alg !== "none") throw new Error();
			} catch {
				throw new errors_js_1.JWTInvalid("Invalid Unsecured JWT");
			}
			return {
				payload: (0, jwt_claims_set_js_1.default)(header, base64url.decode(encodedPayload), options),
				header
			};
		}
	};
	exports.UnsecuredJWT = UnsecuredJWT;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/util/base64url.js
var require_base64url$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decode = exports.encode = void 0;
	var base64url = require_base64url$2();
	exports.encode = base64url.encode;
	exports.decode = base64url.decode;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/util/decode_protected_header.js
var require_decode_protected_header = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decodeProtectedHeader = void 0;
	var base64url_js_1 = require_base64url$1();
	var buffer_utils_js_1 = require_buffer_utils();
	var is_object_js_1 = require_is_object();
	function decodeProtectedHeader(token) {
		let protectedB64u;
		if (typeof token === "string") {
			const parts = token.split(".");
			if (parts.length === 3 || parts.length === 5) [protectedB64u] = parts;
		} else if (typeof token === "object" && token) if ("protected" in token) protectedB64u = token.protected;
		else throw new TypeError("Token does not contain a Protected Header");
		try {
			if (typeof protectedB64u !== "string" || !protectedB64u) throw new Error();
			const result = JSON.parse(buffer_utils_js_1.decoder.decode((0, base64url_js_1.decode)(protectedB64u)));
			if (!(0, is_object_js_1.default)(result)) throw new Error();
			return result;
		} catch {
			throw new TypeError("Invalid Token or Protected Header formatting");
		}
	}
	exports.decodeProtectedHeader = decodeProtectedHeader;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/util/decode_jwt.js
var require_decode_jwt$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.decodeJwt = void 0;
	var base64url_js_1 = require_base64url$1();
	var buffer_utils_js_1 = require_buffer_utils();
	var is_object_js_1 = require_is_object();
	var errors_js_1 = require_errors$2();
	function decodeJwt(jwt) {
		if (typeof jwt !== "string") throw new errors_js_1.JWTInvalid("JWTs must use Compact JWS serialization, JWT must be a string");
		const { 1: payload, length } = jwt.split(".");
		if (length === 5) throw new errors_js_1.JWTInvalid("Only JWTs using Compact JWS serialization can be decoded");
		if (length !== 3) throw new errors_js_1.JWTInvalid("Invalid JWT");
		if (!payload) throw new errors_js_1.JWTInvalid("JWTs must contain a payload");
		let decoded;
		try {
			decoded = (0, base64url_js_1.decode)(payload);
		} catch {
			throw new errors_js_1.JWTInvalid("Failed to base64url decode the payload");
		}
		let result;
		try {
			result = JSON.parse(buffer_utils_js_1.decoder.decode(decoded));
		} catch {
			throw new errors_js_1.JWTInvalid("Failed to parse the decoded payload as JSON");
		}
		if (!(0, is_object_js_1.default)(result)) throw new errors_js_1.JWTInvalid("Invalid JWT Claims Set");
		return result;
	}
	exports.decodeJwt = decodeJwt;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/generate.js
var require_generate = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.generateKeyPair = exports.generateSecret = void 0;
	var crypto_1$1 = __require("crypto");
	var util_1 = __require("util");
	var random_js_1 = require_random();
	var check_modulus_length_js_1 = require_check_modulus_length();
	var errors_js_1 = require_errors$2();
	var generate = (0, util_1.promisify)(crypto_1$1.generateKeyPair);
	async function generateSecret(alg, options) {
		let length;
		switch (alg) {
			case "HS256":
			case "HS384":
			case "HS512":
			case "A128CBC-HS256":
			case "A192CBC-HS384":
			case "A256CBC-HS512":
				length = parseInt(alg.slice(-3), 10);
				break;
			case "A128KW":
			case "A192KW":
			case "A256KW":
			case "A128GCMKW":
			case "A192GCMKW":
			case "A256GCMKW":
			case "A128GCM":
			case "A192GCM":
			case "A256GCM":
				length = parseInt(alg.slice(1, 4), 10);
				break;
			default: throw new errors_js_1.JOSENotSupported("Invalid or unsupported JWK \"alg\" (Algorithm) Parameter value");
		}
		return (0, crypto_1$1.createSecretKey)((0, random_js_1.default)(new Uint8Array(length >> 3)));
	}
	exports.generateSecret = generateSecret;
	async function generateKeyPair(alg, options) {
		var _a, _b;
		switch (alg) {
			case "RS256":
			case "RS384":
			case "RS512":
			case "PS256":
			case "PS384":
			case "PS512":
			case "RSA-OAEP":
			case "RSA-OAEP-256":
			case "RSA-OAEP-384":
			case "RSA-OAEP-512":
			case "RSA1_5": {
				const modulusLength = (_a = options === null || options === void 0 ? void 0 : options.modulusLength) !== null && _a !== void 0 ? _a : 2048;
				if (typeof modulusLength !== "number" || modulusLength < 2048) throw new errors_js_1.JOSENotSupported("Invalid or unsupported modulusLength option provided, 2048 bits or larger keys must be used");
				const keypair = await generate("rsa", {
					modulusLength,
					publicExponent: 65537
				});
				(0, check_modulus_length_js_1.setModulusLength)(keypair.privateKey, modulusLength);
				(0, check_modulus_length_js_1.setModulusLength)(keypair.publicKey, modulusLength);
				return keypair;
			}
			case "ES256": return generate("ec", { namedCurve: "P-256" });
			case "ES256K": return generate("ec", { namedCurve: "secp256k1" });
			case "ES384": return generate("ec", { namedCurve: "P-384" });
			case "ES512": return generate("ec", { namedCurve: "P-521" });
			case "EdDSA": switch (options === null || options === void 0 ? void 0 : options.crv) {
				case void 0:
				case "Ed25519": return generate("ed25519");
				case "Ed448": return generate("ed448");
				default: throw new errors_js_1.JOSENotSupported("Invalid or unsupported crv option provided, supported values are Ed25519 and Ed448");
			}
			case "ECDH-ES":
			case "ECDH-ES+A128KW":
			case "ECDH-ES+A192KW":
			case "ECDH-ES+A256KW":
				const crv = (_b = options === null || options === void 0 ? void 0 : options.crv) !== null && _b !== void 0 ? _b : "P-256";
				switch (crv) {
					case void 0:
					case "P-256":
					case "P-384":
					case "P-521": return generate("ec", { namedCurve: crv });
					case "X25519": return generate("x25519");
					case "X448": return generate("x448");
					default: throw new errors_js_1.JOSENotSupported("Invalid or unsupported crv option provided, supported values are P-256, P-384, P-521, X25519, and X448");
				}
			default: throw new errors_js_1.JOSENotSupported("Invalid or unsupported JWK \"alg\" (Algorithm) Parameter value");
		}
	}
	exports.generateKeyPair = generateKeyPair;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/key/generate_key_pair.js
var require_generate_key_pair = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.generateKeyPair = void 0;
	var generate_js_1 = require_generate();
	async function generateKeyPair(alg, options) {
		return (0, generate_js_1.generateKeyPair)(alg, options);
	}
	exports.generateKeyPair = generateKeyPair;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/key/generate_secret.js
var require_generate_secret = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.generateSecret = void 0;
	var generate_js_1 = require_generate();
	async function generateSecret(alg, options) {
		return (0, generate_js_1.generateSecret)(alg, options);
	}
	exports.generateSecret = generateSecret;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/runtime/runtime.js
var require_runtime$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = "node:crypto";
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/util/runtime.js
var require_runtime = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = require_runtime$1().default;
}));
//#endregion
//#region node_modules/jose/dist/node/cjs/index.js
var require_cjs$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.cryptoRuntime = exports.base64url = exports.generateSecret = exports.generateKeyPair = exports.errors = exports.decodeJwt = exports.decodeProtectedHeader = exports.importJWK = exports.importX509 = exports.importPKCS8 = exports.importSPKI = exports.exportJWK = exports.exportSPKI = exports.exportPKCS8 = exports.UnsecuredJWT = exports.createRemoteJWKSet = exports.createLocalJWKSet = exports.EmbeddedJWK = exports.calculateJwkThumbprintUri = exports.calculateJwkThumbprint = exports.EncryptJWT = exports.SignJWT = exports.GeneralSign = exports.FlattenedSign = exports.CompactSign = exports.FlattenedEncrypt = exports.CompactEncrypt = exports.jwtDecrypt = exports.jwtVerify = exports.generalVerify = exports.flattenedVerify = exports.compactVerify = exports.GeneralEncrypt = exports.generalDecrypt = exports.flattenedDecrypt = exports.compactDecrypt = void 0;
	var decrypt_js_1 = require_decrypt$2();
	Object.defineProperty(exports, "compactDecrypt", {
		enumerable: true,
		get: function() {
			return decrypt_js_1.compactDecrypt;
		}
	});
	var decrypt_js_2 = require_decrypt$3();
	Object.defineProperty(exports, "flattenedDecrypt", {
		enumerable: true,
		get: function() {
			return decrypt_js_2.flattenedDecrypt;
		}
	});
	var decrypt_js_3 = require_decrypt$1();
	Object.defineProperty(exports, "generalDecrypt", {
		enumerable: true,
		get: function() {
			return decrypt_js_3.generalDecrypt;
		}
	});
	var encrypt_js_1 = require_encrypt$2();
	Object.defineProperty(exports, "GeneralEncrypt", {
		enumerable: true,
		get: function() {
			return encrypt_js_1.GeneralEncrypt;
		}
	});
	var verify_js_1 = require_verify$2();
	Object.defineProperty(exports, "compactVerify", {
		enumerable: true,
		get: function() {
			return verify_js_1.compactVerify;
		}
	});
	var verify_js_2 = require_verify$3();
	Object.defineProperty(exports, "flattenedVerify", {
		enumerable: true,
		get: function() {
			return verify_js_2.flattenedVerify;
		}
	});
	var verify_js_3 = require_verify$1();
	Object.defineProperty(exports, "generalVerify", {
		enumerable: true,
		get: function() {
			return verify_js_3.generalVerify;
		}
	});
	var verify_js_4 = require_verify();
	Object.defineProperty(exports, "jwtVerify", {
		enumerable: true,
		get: function() {
			return verify_js_4.jwtVerify;
		}
	});
	var decrypt_js_4 = require_decrypt();
	Object.defineProperty(exports, "jwtDecrypt", {
		enumerable: true,
		get: function() {
			return decrypt_js_4.jwtDecrypt;
		}
	});
	var encrypt_js_2 = require_encrypt$1();
	Object.defineProperty(exports, "CompactEncrypt", {
		enumerable: true,
		get: function() {
			return encrypt_js_2.CompactEncrypt;
		}
	});
	var encrypt_js_3 = require_encrypt$3();
	Object.defineProperty(exports, "FlattenedEncrypt", {
		enumerable: true,
		get: function() {
			return encrypt_js_3.FlattenedEncrypt;
		}
	});
	var sign_js_1 = require_sign$2();
	Object.defineProperty(exports, "CompactSign", {
		enumerable: true,
		get: function() {
			return sign_js_1.CompactSign;
		}
	});
	var sign_js_2 = require_sign$3();
	Object.defineProperty(exports, "FlattenedSign", {
		enumerable: true,
		get: function() {
			return sign_js_2.FlattenedSign;
		}
	});
	var sign_js_3 = require_sign$1();
	Object.defineProperty(exports, "GeneralSign", {
		enumerable: true,
		get: function() {
			return sign_js_3.GeneralSign;
		}
	});
	var sign_js_4 = require_sign();
	Object.defineProperty(exports, "SignJWT", {
		enumerable: true,
		get: function() {
			return sign_js_4.SignJWT;
		}
	});
	var encrypt_js_4 = require_encrypt();
	Object.defineProperty(exports, "EncryptJWT", {
		enumerable: true,
		get: function() {
			return encrypt_js_4.EncryptJWT;
		}
	});
	var thumbprint_js_1 = require_thumbprint();
	Object.defineProperty(exports, "calculateJwkThumbprint", {
		enumerable: true,
		get: function() {
			return thumbprint_js_1.calculateJwkThumbprint;
		}
	});
	Object.defineProperty(exports, "calculateJwkThumbprintUri", {
		enumerable: true,
		get: function() {
			return thumbprint_js_1.calculateJwkThumbprintUri;
		}
	});
	var embedded_js_1 = require_embedded();
	Object.defineProperty(exports, "EmbeddedJWK", {
		enumerable: true,
		get: function() {
			return embedded_js_1.EmbeddedJWK;
		}
	});
	var local_js_1 = require_local();
	Object.defineProperty(exports, "createLocalJWKSet", {
		enumerable: true,
		get: function() {
			return local_js_1.createLocalJWKSet;
		}
	});
	var remote_js_1 = require_remote();
	Object.defineProperty(exports, "createRemoteJWKSet", {
		enumerable: true,
		get: function() {
			return remote_js_1.createRemoteJWKSet;
		}
	});
	var unsecured_js_1 = require_unsecured();
	Object.defineProperty(exports, "UnsecuredJWT", {
		enumerable: true,
		get: function() {
			return unsecured_js_1.UnsecuredJWT;
		}
	});
	var export_js_1 = require_export();
	Object.defineProperty(exports, "exportPKCS8", {
		enumerable: true,
		get: function() {
			return export_js_1.exportPKCS8;
		}
	});
	Object.defineProperty(exports, "exportSPKI", {
		enumerable: true,
		get: function() {
			return export_js_1.exportSPKI;
		}
	});
	Object.defineProperty(exports, "exportJWK", {
		enumerable: true,
		get: function() {
			return export_js_1.exportJWK;
		}
	});
	var import_js_1 = require_import();
	Object.defineProperty(exports, "importSPKI", {
		enumerable: true,
		get: function() {
			return import_js_1.importSPKI;
		}
	});
	Object.defineProperty(exports, "importPKCS8", {
		enumerable: true,
		get: function() {
			return import_js_1.importPKCS8;
		}
	});
	Object.defineProperty(exports, "importX509", {
		enumerable: true,
		get: function() {
			return import_js_1.importX509;
		}
	});
	Object.defineProperty(exports, "importJWK", {
		enumerable: true,
		get: function() {
			return import_js_1.importJWK;
		}
	});
	var decode_protected_header_js_1 = require_decode_protected_header();
	Object.defineProperty(exports, "decodeProtectedHeader", {
		enumerable: true,
		get: function() {
			return decode_protected_header_js_1.decodeProtectedHeader;
		}
	});
	var decode_jwt_js_1 = require_decode_jwt$1();
	Object.defineProperty(exports, "decodeJwt", {
		enumerable: true,
		get: function() {
			return decode_jwt_js_1.decodeJwt;
		}
	});
	exports.errors = require_errors$2();
	var generate_key_pair_js_1 = require_generate_key_pair();
	Object.defineProperty(exports, "generateKeyPair", {
		enumerable: true,
		get: function() {
			return generate_key_pair_js_1.generateKeyPair;
		}
	});
	var generate_secret_js_1 = require_generate_secret();
	Object.defineProperty(exports, "generateSecret", {
		enumerable: true,
		get: function() {
			return generate_secret_js_1.generateSecret;
		}
	});
	exports.base64url = require_base64url$1();
	var runtime_js_1 = require_runtime();
	Object.defineProperty(exports, "cryptoRuntime", {
		enumerable: true,
		get: function() {
			return runtime_js_1.default;
		}
	});
}));
//#endregion
//#region node_modules/@panva/hkdf/dist/node/cjs/runtime/fallback.js
var require_fallback = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var crypto_1 = __require("crypto");
	exports.default = (digest, ikm, salt, info, keylen) => {
		const hashlen = parseInt(digest.substr(3), 10) >> 3 || 20;
		const prk = (0, crypto_1.createHmac)(digest, salt.byteLength ? salt : new Uint8Array(hashlen)).update(ikm).digest();
		const N = Math.ceil(keylen / hashlen);
		const T = new Uint8Array(hashlen * N + info.byteLength + 1);
		let prev = 0;
		let start = 0;
		for (let c = 1; c <= N; c++) {
			T.set(info, start);
			T[start + info.byteLength] = c;
			T.set((0, crypto_1.createHmac)(digest, prk).update(T.subarray(prev, start + info.byteLength + 1)).digest(), start);
			prev = start;
			start += hashlen;
		}
		return T.slice(0, keylen);
	};
}));
//#endregion
//#region node_modules/@panva/hkdf/dist/node/cjs/runtime/hkdf.js
var require_hkdf = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var crypto$4 = __require("crypto");
	var fallback_js_1 = require_fallback();
	var hkdf;
	if (typeof crypto$4.hkdf === "function" && !process.versions.electron) hkdf = async (...args) => new Promise((resolve, reject) => {
		crypto$4.hkdf(...args, (err, arrayBuffer) => {
			if (err) reject(err);
			else resolve(new Uint8Array(arrayBuffer));
		});
	});
	exports.default = async (digest, ikm, salt, info, keylen) => (hkdf || fallback_js_1.default)(digest, ikm, salt, info, keylen);
}));
//#endregion
//#region node_modules/@panva/hkdf/dist/node/cjs/index.js
var require_cjs = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = exports.hkdf = void 0;
	var hkdf_js_1 = require_hkdf();
	function normalizeDigest(digest) {
		switch (digest) {
			case "sha256":
			case "sha384":
			case "sha512":
			case "sha1": return digest;
			default: throw new TypeError("unsupported \"digest\" value");
		}
	}
	function normalizeUint8Array(input, label) {
		if (typeof input === "string") return new TextEncoder().encode(input);
		if (!(input instanceof Uint8Array)) throw new TypeError(`"${label}"" must be an instance of Uint8Array or a string`);
		return input;
	}
	function normalizeIkm(input) {
		const ikm = normalizeUint8Array(input, "ikm");
		if (!ikm.byteLength) throw new TypeError(`"ikm" must be at least one byte in length`);
		return ikm;
	}
	function normalizeInfo(input) {
		const info = normalizeUint8Array(input, "info");
		if (info.byteLength > 1024) throw TypeError("\"info\" must not contain more than 1024 bytes");
		return info;
	}
	function normalizeKeylen(input, digest) {
		if (typeof input !== "number" || !Number.isInteger(input) || input < 1) throw new TypeError("\"keylen\" must be a positive integer");
		if (input > 255 * (parseInt(digest.substr(3), 10) >> 3 || 20)) throw new TypeError("\"keylen\" too large");
		return input;
	}
	async function hkdf(digest, ikm, salt, info, keylen) {
		return (0, hkdf_js_1.default)(normalizeDigest(digest), normalizeIkm(ikm), normalizeUint8Array(salt, "salt"), normalizeInfo(info), normalizeKeylen(keylen, digest));
	}
	exports.hkdf = hkdf;
	exports.default = hkdf;
}));
//#endregion
//#region node_modules/uuid/dist/esm-node/rng.js
function rng() {
	if (poolPtr > rnds8Pool.length - 16) {
		nodeCrypto.randomFillSync(rnds8Pool);
		poolPtr = 0;
	}
	return rnds8Pool.slice(poolPtr, poolPtr += 16);
}
var rnds8Pool, poolPtr;
var init_rng = __esmMin((() => {
	rnds8Pool = new Uint8Array(256);
	poolPtr = rnds8Pool.length;
}));
//#endregion
//#region node_modules/uuid/dist/esm-node/regex.js
var regex_default;
var init_regex = __esmMin((() => {
	regex_default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
}));
//#endregion
//#region node_modules/uuid/dist/esm-node/validate.js
function validate(uuid) {
	return typeof uuid === "string" && regex_default.test(uuid);
}
var init_validate = __esmMin((() => {
	init_regex();
}));
//#endregion
//#region node_modules/uuid/dist/esm-node/stringify.js
function stringify(arr, offset = 0) {
	const uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
	if (!validate(uuid)) throw TypeError("Stringified UUID is invalid");
	return uuid;
}
var byteToHex;
var init_stringify = __esmMin((() => {
	init_validate();
	byteToHex = [];
	for (let i = 0; i < 256; ++i) byteToHex.push((i + 256).toString(16).substr(1));
}));
//#endregion
//#region node_modules/uuid/dist/esm-node/v1.js
function v1(options, buf, offset) {
	let i = buf && offset || 0;
	const b = buf || new Array(16);
	options = options || {};
	let node = options.node || _nodeId;
	let clockseq = options.clockseq !== void 0 ? options.clockseq : _clockseq;
	if (node == null || clockseq == null) {
		const seedBytes = options.random || (options.rng || rng)();
		if (node == null) node = _nodeId = [
			seedBytes[0] | 1,
			seedBytes[1],
			seedBytes[2],
			seedBytes[3],
			seedBytes[4],
			seedBytes[5]
		];
		if (clockseq == null) clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
	}
	let msecs = options.msecs !== void 0 ? options.msecs : Date.now();
	let nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
	const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
	if (dt < 0 && options.clockseq === void 0) clockseq = clockseq + 1 & 16383;
	if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) nsecs = 0;
	if (nsecs >= 1e4) throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
	_lastMSecs = msecs;
	_lastNSecs = nsecs;
	_clockseq = clockseq;
	msecs += 0xb1d069b5400;
	const tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
	b[i++] = tl >>> 24 & 255;
	b[i++] = tl >>> 16 & 255;
	b[i++] = tl >>> 8 & 255;
	b[i++] = tl & 255;
	const tmh = msecs / 4294967296 * 1e4 & 268435455;
	b[i++] = tmh >>> 8 & 255;
	b[i++] = tmh & 255;
	b[i++] = tmh >>> 24 & 15 | 16;
	b[i++] = tmh >>> 16 & 255;
	b[i++] = clockseq >>> 8 | 128;
	b[i++] = clockseq & 255;
	for (let n = 0; n < 6; ++n) b[i + n] = node[n];
	return buf || stringify(b);
}
var _nodeId, _clockseq, _lastMSecs, _lastNSecs;
var init_v1 = __esmMin((() => {
	init_rng();
	init_stringify();
	_lastMSecs = 0;
	_lastNSecs = 0;
}));
//#endregion
//#region node_modules/uuid/dist/esm-node/parse.js
function parse(uuid) {
	if (!validate(uuid)) throw TypeError("Invalid UUID");
	let v;
	const arr = new Uint8Array(16);
	arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
	arr[1] = v >>> 16 & 255;
	arr[2] = v >>> 8 & 255;
	arr[3] = v & 255;
	arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
	arr[5] = v & 255;
	arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
	arr[7] = v & 255;
	arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
	arr[9] = v & 255;
	arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
	arr[11] = v / 4294967296 & 255;
	arr[12] = v >>> 24 & 255;
	arr[13] = v >>> 16 & 255;
	arr[14] = v >>> 8 & 255;
	arr[15] = v & 255;
	return arr;
}
var init_parse = __esmMin((() => {
	init_validate();
}));
//#endregion
//#region node_modules/uuid/dist/esm-node/v35.js
function stringToBytes(str) {
	str = unescape(encodeURIComponent(str));
	const bytes = [];
	for (let i = 0; i < str.length; ++i) bytes.push(str.charCodeAt(i));
	return bytes;
}
function v35_default(name, version, hashfunc) {
	function generateUUID(value, namespace, buf, offset) {
		if (typeof value === "string") value = stringToBytes(value);
		if (typeof namespace === "string") namespace = parse(namespace);
		if (namespace.length !== 16) throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
		let bytes = new Uint8Array(16 + value.length);
		bytes.set(namespace);
		bytes.set(value, namespace.length);
		bytes = hashfunc(bytes);
		bytes[6] = bytes[6] & 15 | version;
		bytes[8] = bytes[8] & 63 | 128;
		if (buf) {
			offset = offset || 0;
			for (let i = 0; i < 16; ++i) buf[offset + i] = bytes[i];
			return buf;
		}
		return stringify(bytes);
	}
	try {
		generateUUID.name = name;
	} catch (err) {}
	generateUUID.DNS = DNS;
	generateUUID.URL = URL$5;
	return generateUUID;
}
var DNS, URL$5;
var init_v35 = __esmMin((() => {
	init_stringify();
	init_parse();
	DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
	URL$5 = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
}));
//#endregion
//#region node_modules/uuid/dist/esm-node/md5.js
function md5(bytes) {
	if (Array.isArray(bytes)) bytes = Buffer.from(bytes);
	else if (typeof bytes === "string") bytes = Buffer.from(bytes, "utf8");
	return nodeCrypto.createHash("md5").update(bytes).digest();
}
var init_md5 = __esmMin((() => {}));
//#endregion
//#region node_modules/uuid/dist/esm-node/v3.js
var v3;
var init_v3 = __esmMin((() => {
	init_v35();
	init_md5();
	v3 = v35_default("v3", 48, md5);
}));
//#endregion
//#region node_modules/uuid/dist/esm-node/v4.js
function v4(options, buf, offset) {
	options = options || {};
	const rnds = options.random || (options.rng || rng)();
	rnds[6] = rnds[6] & 15 | 64;
	rnds[8] = rnds[8] & 63 | 128;
	if (buf) {
		offset = offset || 0;
		for (let i = 0; i < 16; ++i) buf[offset + i] = rnds[i];
		return buf;
	}
	return stringify(rnds);
}
var init_v4 = __esmMin((() => {
	init_rng();
	init_stringify();
}));
//#endregion
//#region node_modules/uuid/dist/esm-node/sha1.js
function sha1$1(bytes) {
	if (Array.isArray(bytes)) bytes = Buffer.from(bytes);
	else if (typeof bytes === "string") bytes = Buffer.from(bytes, "utf8");
	return nodeCrypto.createHash("sha1").update(bytes).digest();
}
var init_sha1 = __esmMin((() => {}));
//#endregion
//#region node_modules/uuid/dist/esm-node/v5.js
var v5;
var init_v5 = __esmMin((() => {
	init_v35();
	init_sha1();
	v5 = v35_default("v5", 80, sha1$1);
}));
//#endregion
//#region node_modules/uuid/dist/esm-node/nil.js
var nil_default;
var init_nil = __esmMin((() => {
	nil_default = "00000000-0000-0000-0000-000000000000";
}));
//#endregion
//#region node_modules/uuid/dist/esm-node/version.js
function version$1(uuid) {
	if (!validate(uuid)) throw TypeError("Invalid UUID");
	return parseInt(uuid.substr(14, 1), 16);
}
var init_version = __esmMin((() => {
	init_validate();
}));
//#endregion
//#region node_modules/uuid/dist/esm-node/index.js
var esm_node_exports = /* @__PURE__ */ __exportAll({
	NIL: () => nil_default,
	parse: () => parse,
	stringify: () => stringify,
	v1: () => v1,
	v3: () => v3,
	v4: () => v4,
	v5: () => v5,
	validate: () => validate,
	version: () => version$1
});
var init_esm_node = __esmMin((() => {
	init_v1();
	init_v3();
	init_v4();
	init_v5();
	init_nil();
	init_version();
	init_validate();
	init_stringify();
	init_parse();
}));
//#endregion
//#region node_modules/next-auth/core/lib/cookie.js
var require_cookie$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SessionStore = void 0;
	exports.defaultCookies = defaultCookies;
	function _classPrivateMethodInitSpec(e, a) {
		_checkPrivateRedeclaration(e, a), a.add(e);
	}
	function _classPrivateFieldInitSpec(e, t, a) {
		_checkPrivateRedeclaration(e, t), t.set(e, a);
	}
	function _checkPrivateRedeclaration(e, t) {
		if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object");
	}
	function _classPrivateFieldGet(s, a) {
		return s.get(_assertClassBrand(s, a));
	}
	function _classPrivateFieldSet(s, a, r) {
		return s.set(_assertClassBrand(s, a), r), r;
	}
	function _assertClassBrand(e, t, n) {
		if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n;
		throw new TypeError("Private element is not present on this object");
	}
	var ALLOWED_COOKIE_SIZE = 4096;
	var ESTIMATED_EMPTY_COOKIE_SIZE = 163;
	var CHUNK_SIZE = ALLOWED_COOKIE_SIZE - ESTIMATED_EMPTY_COOKIE_SIZE;
	function defaultCookies(useSecureCookies) {
		const cookiePrefix = useSecureCookies ? "__Secure-" : "";
		return {
			sessionToken: {
				name: `${cookiePrefix}next-auth.session-token`,
				options: {
					httpOnly: true,
					sameSite: "lax",
					path: "/",
					secure: useSecureCookies
				}
			},
			callbackUrl: {
				name: `${cookiePrefix}next-auth.callback-url`,
				options: {
					httpOnly: true,
					sameSite: "lax",
					path: "/",
					secure: useSecureCookies
				}
			},
			csrfToken: {
				name: `${useSecureCookies ? "__Host-" : ""}next-auth.csrf-token`,
				options: {
					httpOnly: true,
					sameSite: "lax",
					path: "/",
					secure: useSecureCookies
				}
			},
			pkceCodeVerifier: {
				name: `${cookiePrefix}next-auth.pkce.code_verifier`,
				options: {
					httpOnly: true,
					sameSite: "lax",
					path: "/",
					secure: useSecureCookies,
					maxAge: 900
				}
			},
			state: {
				name: `${cookiePrefix}next-auth.state`,
				options: {
					httpOnly: true,
					sameSite: "lax",
					path: "/",
					secure: useSecureCookies,
					maxAge: 900
				}
			},
			nonce: {
				name: `${cookiePrefix}next-auth.nonce`,
				options: {
					httpOnly: true,
					sameSite: "lax",
					path: "/",
					secure: useSecureCookies
				}
			}
		};
	}
	var _chunks = /* @__PURE__ */ new WeakMap();
	var _option = /* @__PURE__ */ new WeakMap();
	var _logger = /* @__PURE__ */ new WeakMap();
	var _SessionStore_brand = /* @__PURE__ */ new WeakSet();
	var SessionStore = class {
		constructor(option, req, logger) {
			_classPrivateMethodInitSpec(this, _SessionStore_brand);
			_classPrivateFieldInitSpec(this, _chunks, {});
			_classPrivateFieldInitSpec(this, _option, void 0);
			_classPrivateFieldInitSpec(this, _logger, void 0);
			_classPrivateFieldSet(_logger, this, logger);
			_classPrivateFieldSet(_option, this, option);
			const { cookies: _cookies } = req;
			const { name: cookieName } = option;
			if (typeof (_cookies === null || _cookies === void 0 ? void 0 : _cookies.getAll) === "function") {
				for (const { name, value } of _cookies.getAll()) if (name.startsWith(cookieName)) _classPrivateFieldGet(_chunks, this)[name] = value;
			} else if (_cookies instanceof Map) {
				for (const name of _cookies.keys()) if (name.startsWith(cookieName)) _classPrivateFieldGet(_chunks, this)[name] = _cookies.get(name);
			} else for (const name in _cookies) if (name.startsWith(cookieName)) _classPrivateFieldGet(_chunks, this)[name] = _cookies[name];
		}
		get value() {
			return Object.keys(_classPrivateFieldGet(_chunks, this)).sort((a, b) => {
				var _a$split$pop, _b$split$pop;
				return parseInt((_a$split$pop = a.split(".").pop()) !== null && _a$split$pop !== void 0 ? _a$split$pop : "0") - parseInt((_b$split$pop = b.split(".").pop()) !== null && _b$split$pop !== void 0 ? _b$split$pop : "0");
			}).map((key) => _classPrivateFieldGet(_chunks, this)[key]).join("");
		}
		chunk(value, options) {
			const cookies = _assertClassBrand(_SessionStore_brand, this, _clean).call(this);
			const chunked = _assertClassBrand(_SessionStore_brand, this, _chunk).call(this, {
				name: _classPrivateFieldGet(_option, this).name,
				value,
				options: {
					..._classPrivateFieldGet(_option, this).options,
					...options
				}
			});
			for (const chunk of chunked) cookies[chunk.name] = chunk;
			return Object.values(cookies);
		}
		clean() {
			return Object.values(_assertClassBrand(_SessionStore_brand, this, _clean).call(this));
		}
	};
	exports.SessionStore = SessionStore;
	function _chunk(cookie) {
		const chunkCount = Math.ceil(cookie.value.length / CHUNK_SIZE);
		if (chunkCount === 1) {
			_classPrivateFieldGet(_chunks, this)[cookie.name] = cookie.value;
			return [cookie];
		}
		const cookies = [];
		for (let i = 0; i < chunkCount; i++) {
			const name = `${cookie.name}.${i}`;
			const value = cookie.value.substr(i * CHUNK_SIZE, CHUNK_SIZE);
			cookies.push({
				...cookie,
				name,
				value
			});
			_classPrivateFieldGet(_chunks, this)[name] = value;
		}
		_classPrivateFieldGet(_logger, this).debug("CHUNKING_SESSION_COOKIE", {
			message: `Session cookie exceeds allowed ${ALLOWED_COOKIE_SIZE} bytes.`,
			emptyCookieSize: ESTIMATED_EMPTY_COOKIE_SIZE,
			valueSize: cookie.value.length,
			chunks: cookies.map((c) => c.value.length + ESTIMATED_EMPTY_COOKIE_SIZE)
		});
		return cookies;
	}
	function _clean() {
		const cleanedChunks = {};
		for (const name in _classPrivateFieldGet(_chunks, this)) {
			var _classPrivateFieldGet2;
			(_classPrivateFieldGet2 = _classPrivateFieldGet(_chunks, this)) === null || _classPrivateFieldGet2 === void 0 || delete _classPrivateFieldGet2[name];
			cleanedChunks[name] = {
				name,
				value: "",
				options: {
					..._classPrivateFieldGet(_option, this).options,
					maxAge: 0
				}
			};
		}
		return cleanedChunks;
	}
}));
//#endregion
//#region node_modules/next-auth/jwt/types.js
var require_types$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/next-auth/jwt/index.js
var require_jwt = /* @__PURE__ */ __commonJSMin(((exports) => {
	var _interopRequireDefault = require_interopRequireDefault();
	Object.defineProperty(exports, "__esModule", { value: true });
	var _exportNames = {
		encode: true,
		decode: true,
		getToken: true
	};
	exports.decode = decode;
	exports.encode = encode;
	exports.getToken = getToken;
	var _jose = require_cjs$1();
	var _hkdf = _interopRequireDefault(require_cjs());
	var _uuid = (init_esm_node(), __toCommonJS(esm_node_exports));
	var _cookie = require_cookie$1();
	var _types = require_types$1();
	Object.keys(_types).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
		if (key in exports && exports[key] === _types[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function() {
				return _types[key];
			}
		});
	});
	var DEFAULT_MAX_AGE = 720 * 60 * 60;
	var now = () => Date.now() / 1e3 | 0;
	async function encode(params) {
		const { token = {}, secret, maxAge = DEFAULT_MAX_AGE, salt = "" } = params;
		const encryptionSecret = await getDerivedEncryptionKey(secret, salt);
		return await new _jose.EncryptJWT(token).setProtectedHeader({
			alg: "dir",
			enc: "A256GCM"
		}).setIssuedAt().setExpirationTime(now() + maxAge).setJti((0, _uuid.v4)()).encrypt(encryptionSecret);
	}
	async function decode(params) {
		const { token, secret, salt = "" } = params;
		if (!token) return null;
		const encryptionSecret = await getDerivedEncryptionKey(secret, salt);
		const { payload } = await (0, _jose.jwtDecrypt)(token, encryptionSecret, { clockTolerance: 15 });
		return payload;
	}
	async function getToken(params) {
		var _process$env$NEXTAUTH, _process$env$NEXTAUTH2, _process$env$NEXTAUTH3, _req$headers;
		const { req, secureCookie = (_process$env$NEXTAUTH = (_process$env$NEXTAUTH2 = process.env.NEXTAUTH_URL) === null || _process$env$NEXTAUTH2 === void 0 ? void 0 : _process$env$NEXTAUTH2.startsWith("https://")) !== null && _process$env$NEXTAUTH !== void 0 ? _process$env$NEXTAUTH : !!process.env.VERCEL, cookieName = secureCookie ? "__Secure-next-auth.session-token" : "next-auth.session-token", raw, decode: _decode = decode, logger = console, secret = (_process$env$NEXTAUTH3 = process.env.NEXTAUTH_SECRET) !== null && _process$env$NEXTAUTH3 !== void 0 ? _process$env$NEXTAUTH3 : process.env.AUTH_SECRET } = params;
		if (!req) throw new Error("Must pass `req` to JWT getToken()");
		let token = new _cookie.SessionStore({
			name: cookieName,
			options: { secure: secureCookie }
		}, {
			cookies: req.cookies,
			headers: req.headers
		}, logger).value;
		const authorizationHeader = req.headers instanceof Headers ? req.headers.get("authorization") : (_req$headers = req.headers) === null || _req$headers === void 0 ? void 0 : _req$headers.authorization;
		if (!token && (authorizationHeader === null || authorizationHeader === void 0 ? void 0 : authorizationHeader.split(" ")[0]) === "Bearer") {
			const urlEncodedToken = authorizationHeader.split(" ")[1];
			token = decodeURIComponent(urlEncodedToken);
		}
		if (!token) return null;
		if (raw) return token;
		try {
			return await _decode({
				token,
				secret
			});
		} catch (_unused) {
			return null;
		}
	}
	async function getDerivedEncryptionKey(keyMaterial, salt) {
		return await (0, _hkdf.default)("sha256", keyMaterial, salt, `NextAuth.js Generated Encryption Key${salt ? ` (${salt})` : ""}`, 32);
	}
}));
//#endregion
//#region node_modules/next-auth/core/types.js
var require_types = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/OverloadYield.js
var require_OverloadYield = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _OverloadYield(e, d) {
		this.v = e, this.k = d;
	}
	module.exports = _OverloadYield, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/regeneratorDefine.js
var require_regeneratorDefine = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _regeneratorDefine(e, r, n, t) {
		var i = Object.defineProperty;
		try {
			i({}, "", {});
		} catch (e) {
			i = 0;
		}
		module.exports = _regeneratorDefine = function regeneratorDefine(e, r, n, t) {
			function o(r, n) {
				_regeneratorDefine(e, r, function(e) {
					return this._invoke(r, n, e);
				});
			}
			r ? i ? i(e, r, {
				value: n,
				enumerable: !t,
				configurable: !t,
				writable: !t
			}) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2));
		}, module.exports.__esModule = true, module.exports["default"] = module.exports, _regeneratorDefine(e, r, n, t);
	}
	module.exports = _regeneratorDefine, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/regenerator.js
var require_regenerator$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var regeneratorDefine = require_regeneratorDefine();
	function _regenerator() {
		/*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */
		var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag";
		function i(r, n, o, i) {
			var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype);
			return regeneratorDefine(u, "_invoke", function(r, n, o) {
				var i, c, u, f = 0, p = o || [], y = !1, G = {
					p: 0,
					n: 0,
					v: e,
					a: d,
					f: d.bind(e, 4),
					d: function d(t, r) {
						return i = t, c = 0, u = e, G.n = r, a;
					}
				};
				function d(r, n) {
					for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) {
						var o, i = p[t], d = G.p, l = i[2];
						r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0));
					}
					if (o || r > 1) return a;
					throw y = !0, n;
				}
				return function(o, p, l) {
					if (f > 1) throw TypeError("Generator is already running");
					for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) {
						i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u);
						try {
							if (f = 2, i) {
								if (c || (o = "next"), t = i[o]) {
									if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object");
									if (!t.done) return t;
									u = t.value, c < 2 && (c = 0);
								} else 1 === c && (t = i["return"]) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1);
								i = e;
							} else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break;
						} catch (t) {
							i = e, c = 1, u = t;
						} finally {
							f = 1;
						}
					}
					return {
						value: t,
						done: y
					};
				};
			}(r, o, i), !0), u;
		}
		var a = {};
		function Generator() {}
		function GeneratorFunction() {}
		function GeneratorFunctionPrototype() {}
		t = Object.getPrototypeOf;
		var c = [][n] ? t(t([][n]())) : (regeneratorDefine(t = {}, n, function() {
			return this;
		}), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c);
		function f(e) {
			return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, regeneratorDefine(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e;
		}
		return GeneratorFunction.prototype = GeneratorFunctionPrototype, regeneratorDefine(u, "constructor", GeneratorFunctionPrototype), regeneratorDefine(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", regeneratorDefine(GeneratorFunctionPrototype, o, "GeneratorFunction"), regeneratorDefine(u), regeneratorDefine(u, o, "Generator"), regeneratorDefine(u, n, function() {
			return this;
		}), regeneratorDefine(u, "toString", function() {
			return "[object Generator]";
		}), (module.exports = _regenerator = function _regenerator() {
			return {
				w: i,
				m: f
			};
		}, module.exports.__esModule = true, module.exports["default"] = module.exports)();
	}
	module.exports = _regenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/regeneratorAsyncIterator.js
var require_regeneratorAsyncIterator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var OverloadYield = require_OverloadYield();
	var regeneratorDefine = require_regeneratorDefine();
	function AsyncIterator(t, e) {
		function n(r, o, i, f) {
			try {
				var c = t[r](o), u = c.value;
				return u instanceof OverloadYield ? e.resolve(u.v).then(function(t) {
					n("next", t, i, f);
				}, function(t) {
					n("throw", t, i, f);
				}) : e.resolve(u).then(function(t) {
					c.value = t, i(c);
				}, function(t) {
					return n("throw", t, i, f);
				});
			} catch (t) {
				f(t);
			}
		}
		var r;
		this.next || (regeneratorDefine(AsyncIterator.prototype), regeneratorDefine(AsyncIterator.prototype, "function" == typeof Symbol && Symbol.asyncIterator || "@asyncIterator", function() {
			return this;
		})), regeneratorDefine(this, "_invoke", function(t, o, i) {
			function f() {
				return new e(function(e, r) {
					n(t, i, e, r);
				});
			}
			return r = r ? r.then(f, f) : f();
		}, !0);
	}
	module.exports = AsyncIterator, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/regeneratorAsyncGen.js
var require_regeneratorAsyncGen = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var regenerator = require_regenerator$1();
	var regeneratorAsyncIterator = require_regeneratorAsyncIterator();
	function _regeneratorAsyncGen(r, e, t, o, n) {
		return new regeneratorAsyncIterator(regenerator().w(r, e, t, o), n || Promise);
	}
	module.exports = _regeneratorAsyncGen, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/regeneratorAsync.js
var require_regeneratorAsync = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var regeneratorAsyncGen = require_regeneratorAsyncGen();
	function _regeneratorAsync(n, e, r, t, o) {
		var a = regeneratorAsyncGen(n, e, r, t, o);
		return a.next().then(function(n) {
			return n.done ? n.value : a.next();
		});
	}
	module.exports = _regeneratorAsync, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/regeneratorKeys.js
var require_regeneratorKeys = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _regeneratorKeys(e) {
		var n = Object(e), r = [];
		for (var t in n) r.unshift(t);
		return function e() {
			for (; r.length;) if ((t = r.pop()) in n) return e.value = t, e.done = !1, e;
			return e.done = !0, e;
		};
	}
	module.exports = _regeneratorKeys, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/typeof.js
var require_typeof = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _typeof(o) {
		"@babel/helpers - typeof";
		return module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o) {
			return typeof o;
		} : function(o) {
			return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
		}, module.exports.__esModule = true, module.exports["default"] = module.exports, _typeof(o);
	}
	module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/regeneratorValues.js
var require_regeneratorValues = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var _typeof = require_typeof()["default"];
	function _regeneratorValues(e) {
		if (null != e) {
			var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0;
			if (t) return t.call(e);
			if ("function" == typeof e.next) return e;
			if (!isNaN(e.length)) return { next: function next() {
				return e && r >= e.length && (e = void 0), {
					value: e && e[r++],
					done: !e
				};
			} };
		}
		throw new TypeError(_typeof(e) + " is not iterable");
	}
	module.exports = _regeneratorValues, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/regeneratorRuntime.js
var require_regeneratorRuntime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var OverloadYield = require_OverloadYield();
	var regenerator = require_regenerator$1();
	var regeneratorAsync = require_regeneratorAsync();
	var regeneratorAsyncGen = require_regeneratorAsyncGen();
	var regeneratorAsyncIterator = require_regeneratorAsyncIterator();
	var regeneratorKeys = require_regeneratorKeys();
	var regeneratorValues = require_regeneratorValues();
	function _regeneratorRuntime() {
		"use strict";
		var r = regenerator(), e = r.m(_regeneratorRuntime), t = (Object.getPrototypeOf ? Object.getPrototypeOf(e) : e.__proto__).constructor;
		function n(r) {
			var e = "function" == typeof r && r.constructor;
			return !!e && (e === t || "GeneratorFunction" === (e.displayName || e.name));
		}
		var o = {
			"throw": 1,
			"return": 2,
			"break": 3,
			"continue": 3
		};
		function a(r) {
			var e, t;
			return function(n) {
				e || (e = {
					stop: function stop() {
						return t(n.a, 2);
					},
					"catch": function _catch() {
						return n.v;
					},
					abrupt: function abrupt(r, e) {
						return t(n.a, o[r], e);
					},
					delegateYield: function delegateYield(r, o, a) {
						return e.resultName = o, t(n.d, regeneratorValues(r), a);
					},
					finish: function finish(r) {
						return t(n.f, r);
					}
				}, t = function t(r, _t, o) {
					n.p = e.prev, n.n = e.next;
					try {
						return r(_t, o);
					} finally {
						e.next = n.n;
					}
				}), e.resultName && (e[e.resultName] = n.v, e.resultName = void 0), e.sent = n.v, e.next = n.n;
				try {
					return r.call(this, e);
				} finally {
					n.p = e.prev, n.n = e.next;
				}
			};
		}
		return (module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
			return {
				wrap: function wrap(e, t, n, o) {
					return r.w(a(e), t, n, o && o.reverse());
				},
				isGeneratorFunction: n,
				mark: r.m,
				awrap: function awrap(r, e) {
					return new OverloadYield(r, e);
				},
				AsyncIterator: regeneratorAsyncIterator,
				async: function async(r, e, t, o, u) {
					return (n(e) ? regeneratorAsyncGen : regeneratorAsync)(a(r), e, t, o, u);
				},
				keys: regeneratorKeys,
				values: regeneratorValues
			};
		}, module.exports.__esModule = true, module.exports["default"] = module.exports)();
	}
	module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/regenerator/index.js
var require_regenerator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var runtime = require_regeneratorRuntime()();
	module.exports = runtime;
	try {
		regeneratorRuntime = runtime;
	} catch (accidentalStrictMode) {
		if (typeof globalThis === "object") globalThis.regeneratorRuntime = runtime;
		else Function("r", "regeneratorRuntime = r")(runtime);
	}
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/toPrimitive.js
var require_toPrimitive = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var _typeof = require_typeof()["default"];
	function toPrimitive(t, r) {
		if ("object" != _typeof(t) || !t) return t;
		var e = t[Symbol.toPrimitive];
		if (void 0 !== e) {
			var i = e.call(t, r || "default");
			if ("object" != _typeof(i)) return i;
			throw new TypeError("@@toPrimitive must return a primitive value.");
		}
		return ("string" === r ? String : Number)(t);
	}
	module.exports = toPrimitive, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/toPropertyKey.js
var require_toPropertyKey = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var _typeof = require_typeof()["default"];
	var toPrimitive = require_toPrimitive();
	function toPropertyKey(t) {
		var i = toPrimitive(t, "string");
		return "symbol" == _typeof(i) ? i : i + "";
	}
	module.exports = toPropertyKey, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/defineProperty.js
var require_defineProperty = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var toPropertyKey = require_toPropertyKey();
	function _defineProperty(e, r, t) {
		return (r = toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
			value: t,
			enumerable: !0,
			configurable: !0,
			writable: !0
		}) : e[r] = t, e;
	}
	module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/asyncToGenerator.js
var require_asyncToGenerator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function asyncGeneratorStep(n, t, e, r, o, a, c) {
		try {
			var i = n[a](c), u = i.value;
		} catch (n) {
			e(n);
			return;
		}
		i.done ? t(u) : Promise.resolve(u).then(r, o);
	}
	function _asyncToGenerator(n) {
		return function() {
			var t = this, e = arguments;
			return new Promise(function(r, o) {
				var a = n.apply(t, e);
				function _next(n) {
					asyncGeneratorStep(a, r, o, _next, _throw, "next", n);
				}
				function _throw(n) {
					asyncGeneratorStep(a, r, o, _next, _throw, "throw", n);
				}
				_next(void 0);
			});
		};
	}
	module.exports = _asyncToGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/classCallCheck.js
var require_classCallCheck = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _classCallCheck(a, n) {
		if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
	}
	module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/createClass.js
var require_createClass = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var toPropertyKey = require_toPropertyKey();
	function _defineProperties(e, r) {
		for (var t = 0; t < r.length; t++) {
			var o = r[t];
			o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, toPropertyKey(o.key), o);
		}
	}
	function _createClass(e, r, t) {
		return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e;
	}
	module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/assertThisInitialized.js
var require_assertThisInitialized = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _assertThisInitialized(e) {
		if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
		return e;
	}
	module.exports = _assertThisInitialized, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/possibleConstructorReturn.js
var require_possibleConstructorReturn = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var _typeof = require_typeof()["default"];
	var assertThisInitialized = require_assertThisInitialized();
	function _possibleConstructorReturn(t, e) {
		if (e && ("object" == _typeof(e) || "function" == typeof e)) return e;
		if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined");
		return assertThisInitialized(t);
	}
	module.exports = _possibleConstructorReturn, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/getPrototypeOf.js
var require_getPrototypeOf = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _getPrototypeOf(t) {
		return module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function(t) {
			return t.__proto__ || Object.getPrototypeOf(t);
		}, module.exports.__esModule = true, module.exports["default"] = module.exports, _getPrototypeOf(t);
	}
	module.exports = _getPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/setPrototypeOf.js
var require_setPrototypeOf = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _setPrototypeOf(t, e) {
		return module.exports = _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function(t, e) {
			return t.__proto__ = e, t;
		}, module.exports.__esModule = true, module.exports["default"] = module.exports, _setPrototypeOf(t, e);
	}
	module.exports = _setPrototypeOf, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/inherits.js
var require_inherits = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var setPrototypeOf = require_setPrototypeOf();
	function _inherits(t, e) {
		if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function");
		t.prototype = Object.create(e && e.prototype, { constructor: {
			value: t,
			writable: !0,
			configurable: !0
		} }), Object.defineProperty(t, "prototype", { writable: !1 }), e && setPrototypeOf(t, e);
	}
	module.exports = _inherits, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/isNativeFunction.js
var require_isNativeFunction = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _isNativeFunction(t) {
		try {
			return -1 !== Function.toString.call(t).indexOf("[native code]");
		} catch (n) {
			return "function" == typeof t;
		}
	}
	module.exports = _isNativeFunction, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/isNativeReflectConstruct.js
var require_isNativeReflectConstruct = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _isNativeReflectConstruct() {
		try {
			var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
		} catch (t) {}
		return (module.exports = _isNativeReflectConstruct = function _isNativeReflectConstruct() {
			return !!t;
		}, module.exports.__esModule = true, module.exports["default"] = module.exports)();
	}
	module.exports = _isNativeReflectConstruct, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/construct.js
var require_construct = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isNativeReflectConstruct = require_isNativeReflectConstruct();
	var setPrototypeOf = require_setPrototypeOf();
	function _construct(t, e, r) {
		if (isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments);
		var o = [null];
		o.push.apply(o, e);
		var p = new (t.bind.apply(t, o))();
		return r && setPrototypeOf(p, r.prototype), p;
	}
	module.exports = _construct, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/wrapNativeSuper.js
var require_wrapNativeSuper = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var getPrototypeOf = require_getPrototypeOf();
	var setPrototypeOf = require_setPrototypeOf();
	var isNativeFunction = require_isNativeFunction();
	var construct = require_construct();
	function _wrapNativeSuper(t) {
		var r = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
		return module.exports = _wrapNativeSuper = function _wrapNativeSuper(t) {
			if (null === t || !isNativeFunction(t)) return t;
			if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function");
			if (void 0 !== r) {
				if (r.has(t)) return r.get(t);
				r.set(t, Wrapper);
			}
			function Wrapper() {
				return construct(t, arguments, getPrototypeOf(this).constructor);
			}
			return Wrapper.prototype = Object.create(t.prototype, { constructor: {
				value: Wrapper,
				enumerable: !1,
				writable: !0,
				configurable: !0
			} }), setPrototypeOf(Wrapper, t);
		}, module.exports.__esModule = true, module.exports["default"] = module.exports, _wrapNativeSuper(t);
	}
	module.exports = _wrapNativeSuper, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/next-auth/core/errors.js
var require_errors$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var _interopRequireDefault = require_interopRequireDefault();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.UnsupportedStrategy = exports.UnknownError = exports.OAuthCallbackError = exports.MissingSecret = exports.MissingAuthorize = exports.MissingAdapterMethods = exports.MissingAdapter = exports.MissingAPIRoute = exports.InvalidCallbackUrl = exports.AccountNotLinkedError = void 0;
	exports.adapterErrorHandler = adapterErrorHandler;
	exports.capitalize = capitalize;
	exports.eventsErrorHandler = eventsErrorHandler;
	exports.upperSnake = upperSnake;
	var _regenerator = _interopRequireDefault(require_regenerator());
	var _asyncToGenerator2 = _interopRequireDefault(require_asyncToGenerator());
	var _defineProperty2 = _interopRequireDefault(require_defineProperty());
	var _classCallCheck2 = _interopRequireDefault(require_classCallCheck());
	var _createClass2 = _interopRequireDefault(require_createClass());
	var _possibleConstructorReturn2 = _interopRequireDefault(require_possibleConstructorReturn());
	var _getPrototypeOf2 = _interopRequireDefault(require_getPrototypeOf());
	var _inherits2 = _interopRequireDefault(require_inherits());
	var _wrapNativeSuper2 = _interopRequireDefault(require_wrapNativeSuper());
	function _callSuper(t, o, e) {
		return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e));
	}
	function _isNativeReflectConstruct() {
		try {
			var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
		} catch (t) {}
		return (_isNativeReflectConstruct = function _isNativeReflectConstruct() {
			return !!t;
		})();
	}
	var UnknownError = exports.UnknownError = function(_Error) {
		function UnknownError(error) {
			var _message;
			var _this;
			(0, _classCallCheck2.default)(this, UnknownError);
			_this = _callSuper(this, UnknownError, [(_message = error === null || error === void 0 ? void 0 : error.message) !== null && _message !== void 0 ? _message : error]);
			_this.name = "UnknownError";
			_this.code = error.code;
			if (error instanceof Error) _this.stack = error.stack;
			return _this;
		}
		(0, _inherits2.default)(UnknownError, _Error);
		return (0, _createClass2.default)(UnknownError, [{
			key: "toJSON",
			value: function toJSON() {
				return {
					name: this.name,
					message: this.message,
					stack: this.stack
				};
			}
		}]);
	}((0, _wrapNativeSuper2.default)(Error));
	exports.OAuthCallbackError = function(_UnknownError) {
		function OAuthCallbackError() {
			var _this2;
			(0, _classCallCheck2.default)(this, OAuthCallbackError);
			for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) args[_key] = arguments[_key];
			_this2 = _callSuper(this, OAuthCallbackError, [].concat(args));
			(0, _defineProperty2.default)(_this2, "name", "OAuthCallbackError");
			return _this2;
		}
		(0, _inherits2.default)(OAuthCallbackError, _UnknownError);
		return (0, _createClass2.default)(OAuthCallbackError);
	}(UnknownError);
	exports.AccountNotLinkedError = function(_UnknownError2) {
		function AccountNotLinkedError() {
			var _this3;
			(0, _classCallCheck2.default)(this, AccountNotLinkedError);
			for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) args[_key2] = arguments[_key2];
			_this3 = _callSuper(this, AccountNotLinkedError, [].concat(args));
			(0, _defineProperty2.default)(_this3, "name", "AccountNotLinkedError");
			return _this3;
		}
		(0, _inherits2.default)(AccountNotLinkedError, _UnknownError2);
		return (0, _createClass2.default)(AccountNotLinkedError);
	}(UnknownError);
	exports.MissingAPIRoute = function(_UnknownError3) {
		function MissingAPIRoute() {
			var _this4;
			(0, _classCallCheck2.default)(this, MissingAPIRoute);
			for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) args[_key3] = arguments[_key3];
			_this4 = _callSuper(this, MissingAPIRoute, [].concat(args));
			(0, _defineProperty2.default)(_this4, "name", "MissingAPIRouteError");
			(0, _defineProperty2.default)(_this4, "code", "MISSING_NEXTAUTH_API_ROUTE_ERROR");
			return _this4;
		}
		(0, _inherits2.default)(MissingAPIRoute, _UnknownError3);
		return (0, _createClass2.default)(MissingAPIRoute);
	}(UnknownError);
	exports.MissingSecret = function(_UnknownError4) {
		function MissingSecret() {
			var _this5;
			(0, _classCallCheck2.default)(this, MissingSecret);
			for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) args[_key4] = arguments[_key4];
			_this5 = _callSuper(this, MissingSecret, [].concat(args));
			(0, _defineProperty2.default)(_this5, "name", "MissingSecretError");
			(0, _defineProperty2.default)(_this5, "code", "NO_SECRET");
			return _this5;
		}
		(0, _inherits2.default)(MissingSecret, _UnknownError4);
		return (0, _createClass2.default)(MissingSecret);
	}(UnknownError);
	exports.MissingAuthorize = function(_UnknownError5) {
		function MissingAuthorize() {
			var _this6;
			(0, _classCallCheck2.default)(this, MissingAuthorize);
			for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) args[_key5] = arguments[_key5];
			_this6 = _callSuper(this, MissingAuthorize, [].concat(args));
			(0, _defineProperty2.default)(_this6, "name", "MissingAuthorizeError");
			(0, _defineProperty2.default)(_this6, "code", "CALLBACK_CREDENTIALS_HANDLER_ERROR");
			return _this6;
		}
		(0, _inherits2.default)(MissingAuthorize, _UnknownError5);
		return (0, _createClass2.default)(MissingAuthorize);
	}(UnknownError);
	exports.MissingAdapter = function(_UnknownError6) {
		function MissingAdapter() {
			var _this7;
			(0, _classCallCheck2.default)(this, MissingAdapter);
			for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) args[_key6] = arguments[_key6];
			_this7 = _callSuper(this, MissingAdapter, [].concat(args));
			(0, _defineProperty2.default)(_this7, "name", "MissingAdapterError");
			(0, _defineProperty2.default)(_this7, "code", "EMAIL_REQUIRES_ADAPTER_ERROR");
			return _this7;
		}
		(0, _inherits2.default)(MissingAdapter, _UnknownError6);
		return (0, _createClass2.default)(MissingAdapter);
	}(UnknownError);
	exports.MissingAdapterMethods = function(_UnknownError7) {
		function MissingAdapterMethods() {
			var _this8;
			(0, _classCallCheck2.default)(this, MissingAdapterMethods);
			for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) args[_key7] = arguments[_key7];
			_this8 = _callSuper(this, MissingAdapterMethods, [].concat(args));
			(0, _defineProperty2.default)(_this8, "name", "MissingAdapterMethodsError");
			(0, _defineProperty2.default)(_this8, "code", "MISSING_ADAPTER_METHODS_ERROR");
			return _this8;
		}
		(0, _inherits2.default)(MissingAdapterMethods, _UnknownError7);
		return (0, _createClass2.default)(MissingAdapterMethods);
	}(UnknownError);
	exports.UnsupportedStrategy = function(_UnknownError8) {
		function UnsupportedStrategy() {
			var _this9;
			(0, _classCallCheck2.default)(this, UnsupportedStrategy);
			for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) args[_key8] = arguments[_key8];
			_this9 = _callSuper(this, UnsupportedStrategy, [].concat(args));
			(0, _defineProperty2.default)(_this9, "name", "UnsupportedStrategyError");
			(0, _defineProperty2.default)(_this9, "code", "CALLBACK_CREDENTIALS_JWT_ERROR");
			return _this9;
		}
		(0, _inherits2.default)(UnsupportedStrategy, _UnknownError8);
		return (0, _createClass2.default)(UnsupportedStrategy);
	}(UnknownError);
	exports.InvalidCallbackUrl = function(_UnknownError9) {
		function InvalidCallbackUrl() {
			var _this10;
			(0, _classCallCheck2.default)(this, InvalidCallbackUrl);
			for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) args[_key9] = arguments[_key9];
			_this10 = _callSuper(this, InvalidCallbackUrl, [].concat(args));
			(0, _defineProperty2.default)(_this10, "name", "InvalidCallbackUrl");
			(0, _defineProperty2.default)(_this10, "code", "INVALID_CALLBACK_URL_ERROR");
			return _this10;
		}
		(0, _inherits2.default)(InvalidCallbackUrl, _UnknownError9);
		return (0, _createClass2.default)(InvalidCallbackUrl);
	}(UnknownError);
	function upperSnake(s) {
		return s.replace(/([A-Z])/g, "_$1").toUpperCase();
	}
	function capitalize(s) {
		return "".concat(s[0].toUpperCase()).concat(s.slice(1));
	}
	function eventsErrorHandler(methods, logger) {
		return Object.keys(methods).reduce(function(acc, name) {
			acc[name] = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee() {
				var method, _args = arguments;
				return _regenerator.default.wrap(function _callee$(_context) {
					while (1) switch (_context.prev = _context.next) {
						case 0:
							_context.prev = 0;
							method = methods[name];
							_context.next = 4;
							return method.apply(void 0, _args);
						case 4: return _context.abrupt("return", _context.sent);
						case 7:
							_context.prev = 7;
							_context.t0 = _context["catch"](0);
							logger.error("".concat(upperSnake(name), "_EVENT_ERROR"), _context.t0);
						case 10:
						case "end": return _context.stop();
					}
				}, _callee, null, [[0, 7]]);
			}));
			return acc;
		}, {});
	}
	function adapterErrorHandler(adapter, logger) {
		if (!adapter) return;
		return Object.keys(adapter).reduce(function(acc, name) {
			acc[name] = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee2() {
				var _len10, args, _key10, method, e, _args2 = arguments;
				return _regenerator.default.wrap(function _callee2$(_context2) {
					while (1) switch (_context2.prev = _context2.next) {
						case 0:
							_context2.prev = 0;
							for (_len10 = _args2.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) args[_key10] = _args2[_key10];
							logger.debug("adapter_".concat(name), { args });
							method = adapter[name];
							_context2.next = 6;
							return method.apply(void 0, args);
						case 6: return _context2.abrupt("return", _context2.sent);
						case 9:
							_context2.prev = 9;
							_context2.t0 = _context2["catch"](0);
							logger.error("adapter_error_".concat(name), _context2.t0);
							e = new UnknownError(_context2.t0);
							e.name = "".concat(capitalize(name), "Error");
							throw e;
						case 15:
						case "end": return _context2.stop();
					}
				}, _callee2, null, [[0, 9]]);
			}));
			return acc;
		}, {});
	}
}));
//#endregion
//#region node_modules/next-auth/utils/logger.js
var require_logger = /* @__PURE__ */ __commonJSMin(((exports) => {
	var _interopRequireDefault = require_interopRequireDefault();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = void 0;
	exports.proxyLogger = proxyLogger;
	exports.setLogger = setLogger;
	var _regenerator = _interopRequireDefault(require_regenerator());
	var _defineProperty2 = _interopRequireDefault(require_defineProperty());
	var _asyncToGenerator2 = _interopRequireDefault(require_asyncToGenerator());
	var _errors = require_errors$1();
	function ownKeys(e, r) {
		var t = Object.keys(e);
		if (Object.getOwnPropertySymbols) {
			var o = Object.getOwnPropertySymbols(e);
			r && (o = o.filter(function(r) {
				return Object.getOwnPropertyDescriptor(e, r).enumerable;
			})), t.push.apply(t, o);
		}
		return t;
	}
	function _objectSpread(e) {
		for (var r = 1; r < arguments.length; r++) {
			var t = null != arguments[r] ? arguments[r] : {};
			r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
				(0, _defineProperty2.default)(e, r, t[r]);
			}) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
				Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
			});
		}
		return e;
	}
	function formatError(o) {
		if (o instanceof Error && !(o instanceof _errors.UnknownError)) return {
			message: o.message,
			stack: o.stack,
			name: o.name
		};
		if (hasErrorProperty(o)) {
			var _o$message;
			o.error = formatError(o.error);
			o.message = (_o$message = o.message) !== null && _o$message !== void 0 ? _o$message : o.error.message;
		}
		return o;
	}
	function hasErrorProperty(x) {
		return !!(x !== null && x !== void 0 && x.error);
	}
	var _logger = {
		error: function error(code, metadata) {
			metadata = formatError(metadata);
			console.error("[next-auth][error][".concat(code, "]"), "\nhttps://next-auth.js.org/errors#".concat(code.toLowerCase()), metadata.message, metadata);
		},
		warn: function warn(code) {
			console.warn("[next-auth][warn][".concat(code, "]"), "\nhttps://next-auth.js.org/warnings#".concat(code.toLowerCase()));
		},
		debug: function debug(code, metadata) {
			console.log("[next-auth][debug][".concat(code, "]"), metadata);
		}
	};
	function setLogger() {
		var newLogger = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
		if (!(arguments.length > 1 ? arguments[1] : void 0)) _logger.debug = function() {};
		if (newLogger.error) _logger.error = newLogger.error;
		if (newLogger.warn) _logger.warn = newLogger.warn;
		if (newLogger.debug) _logger.debug = newLogger.debug;
	}
	exports.default = _logger;
	function proxyLogger() {
		var logger = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : _logger;
		var basePath = arguments.length > 1 ? arguments[1] : void 0;
		try {
			if (typeof window === "undefined") return logger;
			var clientLogger = {};
			var _loop = function _loop(level) {
				clientLogger[level] = function() {
					var _ref = (0, _asyncToGenerator2.default)(_regenerator.default.mark(function _callee(code, metadata) {
						var url, body;
						return _regenerator.default.wrap(function _callee$(_context) {
							while (1) switch (_context.prev = _context.next) {
								case 0:
									_logger[level](code, metadata);
									if (level === "error") metadata = formatError(metadata);
									metadata.client = true;
									url = "".concat(basePath, "/_log");
									body = new URLSearchParams(_objectSpread({
										level,
										code
									}, metadata));
									if (!navigator.sendBeacon) {
										_context.next = 8;
										break;
									}
									return _context.abrupt("return", navigator.sendBeacon(url, body));
								case 8:
									_context.next = 10;
									return fetch(url, {
										method: "POST",
										body,
										keepalive: true
									});
								case 10: return _context.abrupt("return", _context.sent);
								case 11:
								case "end": return _context.stop();
							}
						}, _callee);
					}));
					return function(_x, _x2) {
						return _ref.apply(this, arguments);
					};
				}();
			};
			for (var level in logger) _loop(level);
			return clientLogger;
		} catch (_unused) {
			return _logger;
		}
	}
}));
//#endregion
//#region node_modules/next-auth/utils/detect-origin.js
var require_detect_origin = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.detectOrigin = detectOrigin;
	function detectOrigin(forwardedHost, protocol) {
		var _process$env$VERCEL;
		if ((_process$env$VERCEL = process.env.VERCEL) !== null && _process$env$VERCEL !== void 0 ? _process$env$VERCEL : process.env.AUTH_TRUST_HOST) return `${protocol === "http" ? "http" : "https"}://${forwardedHost}`;
		return process.env.NEXTAUTH_URL;
	}
}));
//#endregion
//#region node_modules/openid-client/lib/errors.js
var require_errors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { format: format$3 } = __require("util");
	var OPError = class extends Error {
		constructor({ error_description, error, error_uri, session_state, state, scope }, response) {
			super(!error_description ? error : `${error} (${error_description})`);
			Object.assign(this, { error }, error_description && { error_description }, error_uri && { error_uri }, state && { state }, scope && { scope }, session_state && { session_state });
			if (response) Object.defineProperty(this, "response", { value: response });
			this.name = this.constructor.name;
			Error.captureStackTrace(this, this.constructor);
		}
	};
	var RPError = class extends Error {
		constructor(...args) {
			if (typeof args[0] === "string") super(format$3(...args));
			else {
				const { message, printf, response, ...rest } = args[0];
				if (printf) super(format$3(...printf));
				else super(message);
				Object.assign(this, rest);
				if (response) Object.defineProperty(this, "response", { value: response });
			}
			this.name = this.constructor.name;
			Error.captureStackTrace(this, this.constructor);
		}
	};
	module.exports = {
		OPError,
		RPError
	};
}));
//#endregion
//#region node_modules/oidc-token-hash/lib/index.js
var require_lib$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { strict: assert$2 } = __require("assert");
	var { createHash: createHash$1 } = __require("crypto");
	var { format: format$2 } = __require("util");
	var encode;
	if (Buffer.isEncoding("base64url")) encode = (input) => input.toString("base64url");
	else {
		const fromBase64 = (base64) => base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
		encode = (input) => fromBase64(input.toString("base64"));
	}
	/** SPECIFICATION
	* Its (_hash) value is the base64url encoding of the left-most half of the hash of the octets of
	* the ASCII representation of the token value, where the hash algorithm used is the hash algorithm
	* used in the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is
	* RS256, hash the token value with SHA-256, then take the left-most 128 bits and base64url encode
	* them. The _hash value is a case sensitive string.
	*/
	/**
	* @name getHash
	* @api private
	*
	* returns the sha length based off the JOSE alg heade value, defaults to sha256
	*
	* @param token {String} token value to generate the hash from
	* @param alg {String} ID Token JOSE header alg value (i.e. RS256, HS384, ES512, PS256)
	* @param [crv] {String} For EdDSA the curve decides what hash algorithm is used. Required for EdDSA
	*/
	function getHash(alg, crv) {
		switch (alg) {
			case "HS256":
			case "RS256":
			case "PS256":
			case "ES256":
			case "ES256K": return createHash$1("sha256");
			case "HS384":
			case "RS384":
			case "PS384":
			case "ES384": return createHash$1("sha384");
			case "HS512":
			case "RS512":
			case "PS512":
			case "ES512":
			case "Ed25519": return createHash$1("sha512");
			case "Ed448": return createHash$1("shake256", { outputLength: 114 });
			case "EdDSA": switch (crv) {
				case "Ed25519": return createHash$1("sha512");
				case "Ed448": return createHash$1("shake256", { outputLength: 114 });
				default: throw new TypeError("unrecognized or invalid EdDSA curve provided");
			}
			default: throw new TypeError("unrecognized or invalid JWS algorithm provided");
		}
	}
	function generate(token, alg, crv) {
		const digest = getHash(alg, crv).update(token).digest();
		return encode(digest.slice(0, digest.length / 2));
	}
	function validate(names, actual, source, alg, crv) {
		if (typeof names.claim !== "string" || !names.claim) throw new TypeError("names.claim must be a non-empty string");
		if (typeof names.source !== "string" || !names.source) throw new TypeError("names.source must be a non-empty string");
		assert$2(typeof actual === "string" && actual, `${names.claim} must be a non-empty string`);
		assert$2(typeof source === "string" && source, `${names.source} must be a non-empty string`);
		let expected;
		let msg;
		try {
			expected = generate(source, alg, crv);
		} catch (err) {
			msg = format$2("%s could not be validated (%s)", names.claim, err.message);
		}
		msg = msg || format$2("%s mismatch, expected %s, got: %s", names.claim, expected, actual);
		assert$2.equal(expected, actual, msg);
	}
	module.exports = {
		validate,
		generate
	};
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/is_key_object.js
var require_is_key_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var util = __require("util");
	var crypto$3 = __require("crypto");
	module.exports = util.types.isKeyObject || ((obj) => obj && obj instanceof crypto$3.KeyObject);
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/base64url.js
var require_base64url = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var encode;
	if (Buffer.isEncoding("base64url")) encode = (input, encoding = "utf8") => Buffer.from(input, encoding).toString("base64url");
	else {
		const fromBase64 = (base64) => base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
		encode = (input, encoding = "utf8") => fromBase64(Buffer.from(input, encoding).toString("base64"));
	}
	var decode = (input) => Buffer.from(input, "base64");
	module.exports.decode = decode;
	module.exports.encode = encode;
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/decode_jwt.js
var require_decode_jwt = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var base64url = require_base64url();
	module.exports = (token) => {
		if (typeof token !== "string" || !token) throw new TypeError("JWT must be a string");
		const { 0: header, 1: payload, 2: signature, length } = token.split(".");
		if (length === 5) throw new TypeError("encrypted JWTs cannot be decoded");
		if (length !== 3) throw new Error("JWTs must have three components");
		try {
			return {
				header: JSON.parse(base64url.decode(header)),
				payload: JSON.parse(base64url.decode(payload)),
				signature
			};
		} catch (err) {
			throw new Error("JWT is malformed");
		}
	};
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/is_plain_object.js
var require_is_plain_object = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = (a) => !!a && a.constructor === Object;
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/defaults.js
var require_defaults = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isPlainObject = require_is_plain_object();
	function defaults(deep, target, ...sources) {
		for (const source of sources) {
			if (!isPlainObject(source)) continue;
			for (const [key, value] of Object.entries(source)) {
				/* istanbul ignore if */
				if (key === "__proto__" || key === "constructor") continue;
				if (typeof target[key] === "undefined" && typeof value !== "undefined") target[key] = value;
				if (deep && isPlainObject(target[key]) && isPlainObject(value)) defaults(true, target[key], value);
			}
		}
		return target;
	}
	module.exports = defaults.bind(void 0, false);
	module.exports.deep = defaults.bind(void 0, true);
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/www_authenticate_parser.js
var require_www_authenticate_parser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var REGEXP = /(\w+)=("[^"]*")/g;
	module.exports = (wwwAuthenticate) => {
		const params = {};
		try {
			while (REGEXP.exec(wwwAuthenticate) !== null) if (RegExp.$1 && RegExp.$2) params[RegExp.$1] = RegExp.$2.slice(1, -1);
		} catch (err) {}
		return params;
	};
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/assert.js
var require_assert$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function assertSigningAlgValuesSupport(endpoint, issuer, properties) {
		if (!issuer[`${endpoint}_endpoint`]) return;
		const eam = `${endpoint}_endpoint_auth_method`;
		const easa = `${endpoint}_endpoint_auth_signing_alg`;
		const easavs = `${endpoint}_endpoint_auth_signing_alg_values_supported`;
		if (properties[eam] && properties[eam].endsWith("_jwt") && !properties[easa] && !issuer[easavs]) throw new TypeError(`${easavs} must be configured on the issuer if ${easa} is not defined on a client`);
	}
	function assertIssuerConfiguration(issuer, endpoint) {
		if (!issuer[endpoint]) throw new TypeError(`${endpoint} must be configured on the issuer`);
	}
	module.exports = {
		assertSigningAlgValuesSupport,
		assertIssuerConfiguration
	};
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/pick.js
var require_pick = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function pick(object, ...paths) {
		const obj = {};
		for (const path of paths) if (object[path] !== void 0) obj[path] = object[path];
		return obj;
	};
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/process_response.js
var require_process_response = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { STATUS_CODES } = __require("http");
	var { format: format$1 } = __require("util");
	var { OPError } = require_errors();
	var parseWwwAuthenticate = require_www_authenticate_parser();
	var throwAuthenticateErrors = (response) => {
		const params = parseWwwAuthenticate(response.headers["www-authenticate"]);
		if (params.error) throw new OPError(params, response);
	};
	var isStandardBodyError = (response) => {
		let result = false;
		try {
			let jsonbody;
			if (typeof response.body !== "object" || Buffer.isBuffer(response.body)) jsonbody = JSON.parse(response.body);
			else jsonbody = response.body;
			result = typeof jsonbody.error === "string" && jsonbody.error.length;
			if (result) Object.defineProperty(response, "body", {
				value: jsonbody,
				configurable: true
			});
		} catch (err) {}
		return result;
	};
	function processResponse(response, { statusCode = 200, body = true, bearer = false } = {}) {
		if (response.statusCode !== statusCode) {
			if (bearer) throwAuthenticateErrors(response);
			if (isStandardBodyError(response)) throw new OPError(response.body, response);
			throw new OPError({ error: format$1("expected %i %s, got: %i %s", statusCode, STATUS_CODES[statusCode], response.statusCode, STATUS_CODES[response.statusCode]) }, response);
		}
		if (body && !response.body) throw new OPError({ error: format$1("expected %i %s with body but no body was returned", statusCode, STATUS_CODES[statusCode]) }, response);
		return response.body;
	}
	module.exports = processResponse;
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/unix_timestamp.js
var require_unix_timestamp = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = () => Math.floor(Date.now() / 1e3);
}));
//#endregion
//#region node_modules/openid-client/lib/token_set.js
var require_token_set = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var base64url = require_base64url();
	var now = require_unix_timestamp();
	var TokenSet = class {
		constructor(values) {
			Object.assign(this, values);
			const { constructor, ...properties } = Object.getOwnPropertyDescriptors(this.constructor.prototype);
			Object.defineProperties(this, properties);
		}
		set expires_in(value) {
			this.expires_at = now() + Number(value);
		}
		get expires_in() {
			return Math.max.apply(null, [this.expires_at - now(), 0]);
		}
		expired() {
			return this.expires_in === 0;
		}
		claims() {
			if (!this.id_token) throw new TypeError("id_token not present in TokenSet");
			return JSON.parse(base64url.decode(this.id_token.split(".")[1]));
		}
	};
	module.exports = TokenSet;
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/generators.js
var require_generators = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { createHash, randomBytes } = __require("crypto");
	var base64url = require_base64url();
	var random = (bytes = 32) => base64url.encode(randomBytes(bytes));
	module.exports = {
		random,
		state: random,
		nonce: random,
		codeVerifier: random,
		codeChallenge: (codeVerifier) => base64url.encode(createHash("sha256").update(codeVerifier).digest())
	};
}));
//#endregion
//#region node_modules/yallist/iterator.js
var require_iterator = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function(Yallist) {
		Yallist.prototype[Symbol.iterator] = function* () {
			for (let walker = this.head; walker; walker = walker.next) yield walker.value;
		};
	};
}));
//#endregion
//#region node_modules/yallist/yallist.js
var require_yallist = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = Yallist;
	Yallist.Node = Node;
	Yallist.create = Yallist;
	function Yallist(list) {
		var self = this;
		if (!(self instanceof Yallist)) self = new Yallist();
		self.tail = null;
		self.head = null;
		self.length = 0;
		if (list && typeof list.forEach === "function") list.forEach(function(item) {
			self.push(item);
		});
		else if (arguments.length > 0) for (var i = 0, l = arguments.length; i < l; i++) self.push(arguments[i]);
		return self;
	}
	Yallist.prototype.removeNode = function(node) {
		if (node.list !== this) throw new Error("removing node which does not belong to this list");
		var next = node.next;
		var prev = node.prev;
		if (next) next.prev = prev;
		if (prev) prev.next = next;
		if (node === this.head) this.head = next;
		if (node === this.tail) this.tail = prev;
		node.list.length--;
		node.next = null;
		node.prev = null;
		node.list = null;
		return next;
	};
	Yallist.prototype.unshiftNode = function(node) {
		if (node === this.head) return;
		if (node.list) node.list.removeNode(node);
		var head = this.head;
		node.list = this;
		node.next = head;
		if (head) head.prev = node;
		this.head = node;
		if (!this.tail) this.tail = node;
		this.length++;
	};
	Yallist.prototype.pushNode = function(node) {
		if (node === this.tail) return;
		if (node.list) node.list.removeNode(node);
		var tail = this.tail;
		node.list = this;
		node.prev = tail;
		if (tail) tail.next = node;
		this.tail = node;
		if (!this.head) this.head = node;
		this.length++;
	};
	Yallist.prototype.push = function() {
		for (var i = 0, l = arguments.length; i < l; i++) push(this, arguments[i]);
		return this.length;
	};
	Yallist.prototype.unshift = function() {
		for (var i = 0, l = arguments.length; i < l; i++) unshift(this, arguments[i]);
		return this.length;
	};
	Yallist.prototype.pop = function() {
		if (!this.tail) return;
		var res = this.tail.value;
		this.tail = this.tail.prev;
		if (this.tail) this.tail.next = null;
		else this.head = null;
		this.length--;
		return res;
	};
	Yallist.prototype.shift = function() {
		if (!this.head) return;
		var res = this.head.value;
		this.head = this.head.next;
		if (this.head) this.head.prev = null;
		else this.tail = null;
		this.length--;
		return res;
	};
	Yallist.prototype.forEach = function(fn, thisp) {
		thisp = thisp || this;
		for (var walker = this.head, i = 0; walker !== null; i++) {
			fn.call(thisp, walker.value, i, this);
			walker = walker.next;
		}
	};
	Yallist.prototype.forEachReverse = function(fn, thisp) {
		thisp = thisp || this;
		for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
			fn.call(thisp, walker.value, i, this);
			walker = walker.prev;
		}
	};
	Yallist.prototype.get = function(n) {
		for (var i = 0, walker = this.head; walker !== null && i < n; i++) walker = walker.next;
		if (i === n && walker !== null) return walker.value;
	};
	Yallist.prototype.getReverse = function(n) {
		for (var i = 0, walker = this.tail; walker !== null && i < n; i++) walker = walker.prev;
		if (i === n && walker !== null) return walker.value;
	};
	Yallist.prototype.map = function(fn, thisp) {
		thisp = thisp || this;
		var res = new Yallist();
		for (var walker = this.head; walker !== null;) {
			res.push(fn.call(thisp, walker.value, this));
			walker = walker.next;
		}
		return res;
	};
	Yallist.prototype.mapReverse = function(fn, thisp) {
		thisp = thisp || this;
		var res = new Yallist();
		for (var walker = this.tail; walker !== null;) {
			res.push(fn.call(thisp, walker.value, this));
			walker = walker.prev;
		}
		return res;
	};
	Yallist.prototype.reduce = function(fn, initial) {
		var acc;
		var walker = this.head;
		if (arguments.length > 1) acc = initial;
		else if (this.head) {
			walker = this.head.next;
			acc = this.head.value;
		} else throw new TypeError("Reduce of empty list with no initial value");
		for (var i = 0; walker !== null; i++) {
			acc = fn(acc, walker.value, i);
			walker = walker.next;
		}
		return acc;
	};
	Yallist.prototype.reduceReverse = function(fn, initial) {
		var acc;
		var walker = this.tail;
		if (arguments.length > 1) acc = initial;
		else if (this.tail) {
			walker = this.tail.prev;
			acc = this.tail.value;
		} else throw new TypeError("Reduce of empty list with no initial value");
		for (var i = this.length - 1; walker !== null; i--) {
			acc = fn(acc, walker.value, i);
			walker = walker.prev;
		}
		return acc;
	};
	Yallist.prototype.toArray = function() {
		var arr = new Array(this.length);
		for (var i = 0, walker = this.head; walker !== null; i++) {
			arr[i] = walker.value;
			walker = walker.next;
		}
		return arr;
	};
	Yallist.prototype.toArrayReverse = function() {
		var arr = new Array(this.length);
		for (var i = 0, walker = this.tail; walker !== null; i++) {
			arr[i] = walker.value;
			walker = walker.prev;
		}
		return arr;
	};
	Yallist.prototype.slice = function(from, to) {
		to = to || this.length;
		if (to < 0) to += this.length;
		from = from || 0;
		if (from < 0) from += this.length;
		var ret = new Yallist();
		if (to < from || to < 0) return ret;
		if (from < 0) from = 0;
		if (to > this.length) to = this.length;
		for (var i = 0, walker = this.head; walker !== null && i < from; i++) walker = walker.next;
		for (; walker !== null && i < to; i++, walker = walker.next) ret.push(walker.value);
		return ret;
	};
	Yallist.prototype.sliceReverse = function(from, to) {
		to = to || this.length;
		if (to < 0) to += this.length;
		from = from || 0;
		if (from < 0) from += this.length;
		var ret = new Yallist();
		if (to < from || to < 0) return ret;
		if (from < 0) from = 0;
		if (to > this.length) to = this.length;
		for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) walker = walker.prev;
		for (; walker !== null && i > from; i--, walker = walker.prev) ret.push(walker.value);
		return ret;
	};
	Yallist.prototype.splice = function(start, deleteCount, ...nodes) {
		if (start > this.length) start = this.length - 1;
		if (start < 0) start = this.length + start;
		for (var i = 0, walker = this.head; walker !== null && i < start; i++) walker = walker.next;
		var ret = [];
		for (var i = 0; walker && i < deleteCount; i++) {
			ret.push(walker.value);
			walker = this.removeNode(walker);
		}
		if (walker === null) walker = this.tail;
		if (walker !== this.head && walker !== this.tail) walker = walker.prev;
		for (var i = 0; i < nodes.length; i++) walker = insert(this, walker, nodes[i]);
		return ret;
	};
	Yallist.prototype.reverse = function() {
		var head = this.head;
		var tail = this.tail;
		for (var walker = head; walker !== null; walker = walker.prev) {
			var p = walker.prev;
			walker.prev = walker.next;
			walker.next = p;
		}
		this.head = tail;
		this.tail = head;
		return this;
	};
	function insert(self, node, value) {
		var inserted = node === self.head ? new Node(value, null, node, self) : new Node(value, node, node.next, self);
		if (inserted.next === null) self.tail = inserted;
		if (inserted.prev === null) self.head = inserted;
		self.length++;
		return inserted;
	}
	function push(self, item) {
		self.tail = new Node(item, self.tail, null, self);
		if (!self.head) self.head = self.tail;
		self.length++;
	}
	function unshift(self, item) {
		self.head = new Node(item, null, self.head, self);
		if (!self.tail) self.tail = self.head;
		self.length++;
	}
	function Node(value, prev, next, list) {
		if (!(this instanceof Node)) return new Node(value, prev, next, list);
		this.list = list;
		this.value = value;
		if (prev) {
			prev.next = this;
			this.prev = prev;
		} else this.prev = null;
		if (next) {
			next.prev = this;
			this.next = next;
		} else this.next = null;
	}
	try {
		require_iterator()(Yallist);
	} catch (er) {}
}));
//#endregion
//#region node_modules/lru-cache/index.js
var require_lru_cache = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Yallist = require_yallist();
	var MAX = Symbol("max");
	var LENGTH = Symbol("length");
	var LENGTH_CALCULATOR = Symbol("lengthCalculator");
	var ALLOW_STALE = Symbol("allowStale");
	var MAX_AGE = Symbol("maxAge");
	var DISPOSE = Symbol("dispose");
	var NO_DISPOSE_ON_SET = Symbol("noDisposeOnSet");
	var LRU_LIST = Symbol("lruList");
	var CACHE = Symbol("cache");
	var UPDATE_AGE_ON_GET = Symbol("updateAgeOnGet");
	var naiveLength = () => 1;
	var LRUCache = class {
		constructor(options) {
			if (typeof options === "number") options = { max: options };
			if (!options) options = {};
			if (options.max && (typeof options.max !== "number" || options.max < 0)) throw new TypeError("max must be a non-negative number");
			this[MAX] = options.max || Infinity;
			const lc = options.length || naiveLength;
			this[LENGTH_CALCULATOR] = typeof lc !== "function" ? naiveLength : lc;
			this[ALLOW_STALE] = options.stale || false;
			if (options.maxAge && typeof options.maxAge !== "number") throw new TypeError("maxAge must be a number");
			this[MAX_AGE] = options.maxAge || 0;
			this[DISPOSE] = options.dispose;
			this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
			this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
			this.reset();
		}
		set max(mL) {
			if (typeof mL !== "number" || mL < 0) throw new TypeError("max must be a non-negative number");
			this[MAX] = mL || Infinity;
			trim(this);
		}
		get max() {
			return this[MAX];
		}
		set allowStale(allowStale) {
			this[ALLOW_STALE] = !!allowStale;
		}
		get allowStale() {
			return this[ALLOW_STALE];
		}
		set maxAge(mA) {
			if (typeof mA !== "number") throw new TypeError("maxAge must be a non-negative number");
			this[MAX_AGE] = mA;
			trim(this);
		}
		get maxAge() {
			return this[MAX_AGE];
		}
		set lengthCalculator(lC) {
			if (typeof lC !== "function") lC = naiveLength;
			if (lC !== this[LENGTH_CALCULATOR]) {
				this[LENGTH_CALCULATOR] = lC;
				this[LENGTH] = 0;
				this[LRU_LIST].forEach((hit) => {
					hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
					this[LENGTH] += hit.length;
				});
			}
			trim(this);
		}
		get lengthCalculator() {
			return this[LENGTH_CALCULATOR];
		}
		get length() {
			return this[LENGTH];
		}
		get itemCount() {
			return this[LRU_LIST].length;
		}
		rforEach(fn, thisp) {
			thisp = thisp || this;
			for (let walker = this[LRU_LIST].tail; walker !== null;) {
				const prev = walker.prev;
				forEachStep(this, fn, walker, thisp);
				walker = prev;
			}
		}
		forEach(fn, thisp) {
			thisp = thisp || this;
			for (let walker = this[LRU_LIST].head; walker !== null;) {
				const next = walker.next;
				forEachStep(this, fn, walker, thisp);
				walker = next;
			}
		}
		keys() {
			return this[LRU_LIST].toArray().map((k) => k.key);
		}
		values() {
			return this[LRU_LIST].toArray().map((k) => k.value);
		}
		reset() {
			if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) this[LRU_LIST].forEach((hit) => this[DISPOSE](hit.key, hit.value));
			this[CACHE] = /* @__PURE__ */ new Map();
			this[LRU_LIST] = new Yallist();
			this[LENGTH] = 0;
		}
		dump() {
			return this[LRU_LIST].map((hit) => isStale(this, hit) ? false : {
				k: hit.key,
				v: hit.value,
				e: hit.now + (hit.maxAge || 0)
			}).toArray().filter((h) => h);
		}
		dumpLru() {
			return this[LRU_LIST];
		}
		set(key, value, maxAge) {
			maxAge = maxAge || this[MAX_AGE];
			if (maxAge && typeof maxAge !== "number") throw new TypeError("maxAge must be a number");
			const now = maxAge ? Date.now() : 0;
			const len = this[LENGTH_CALCULATOR](value, key);
			if (this[CACHE].has(key)) {
				if (len > this[MAX]) {
					del(this, this[CACHE].get(key));
					return false;
				}
				const item = this[CACHE].get(key).value;
				if (this[DISPOSE]) {
					if (!this[NO_DISPOSE_ON_SET]) this[DISPOSE](key, item.value);
				}
				item.now = now;
				item.maxAge = maxAge;
				item.value = value;
				this[LENGTH] += len - item.length;
				item.length = len;
				this.get(key);
				trim(this);
				return true;
			}
			const hit = new Entry(key, value, len, now, maxAge);
			if (hit.length > this[MAX]) {
				if (this[DISPOSE]) this[DISPOSE](key, value);
				return false;
			}
			this[LENGTH] += hit.length;
			this[LRU_LIST].unshift(hit);
			this[CACHE].set(key, this[LRU_LIST].head);
			trim(this);
			return true;
		}
		has(key) {
			if (!this[CACHE].has(key)) return false;
			const hit = this[CACHE].get(key).value;
			return !isStale(this, hit);
		}
		get(key) {
			return get(this, key, true);
		}
		peek(key) {
			return get(this, key, false);
		}
		pop() {
			const node = this[LRU_LIST].tail;
			if (!node) return null;
			del(this, node);
			return node.value;
		}
		del(key) {
			del(this, this[CACHE].get(key));
		}
		load(arr) {
			this.reset();
			const now = Date.now();
			for (let l = arr.length - 1; l >= 0; l--) {
				const hit = arr[l];
				const expiresAt = hit.e || 0;
				if (expiresAt === 0) this.set(hit.k, hit.v);
				else {
					const maxAge = expiresAt - now;
					if (maxAge > 0) this.set(hit.k, hit.v, maxAge);
				}
			}
		}
		prune() {
			this[CACHE].forEach((value, key) => get(this, key, false));
		}
	};
	var get = (self, key, doUse) => {
		const node = self[CACHE].get(key);
		if (node) {
			const hit = node.value;
			if (isStale(self, hit)) {
				del(self, node);
				if (!self[ALLOW_STALE]) return void 0;
			} else if (doUse) {
				if (self[UPDATE_AGE_ON_GET]) node.value.now = Date.now();
				self[LRU_LIST].unshiftNode(node);
			}
			return hit.value;
		}
	};
	var isStale = (self, hit) => {
		if (!hit || !hit.maxAge && !self[MAX_AGE]) return false;
		const diff = Date.now() - hit.now;
		return hit.maxAge ? diff > hit.maxAge : self[MAX_AGE] && diff > self[MAX_AGE];
	};
	var trim = (self) => {
		if (self[LENGTH] > self[MAX]) for (let walker = self[LRU_LIST].tail; self[LENGTH] > self[MAX] && walker !== null;) {
			const prev = walker.prev;
			del(self, walker);
			walker = prev;
		}
	};
	var del = (self, node) => {
		if (node) {
			const hit = node.value;
			if (self[DISPOSE]) self[DISPOSE](hit.key, hit.value);
			self[LENGTH] -= hit.length;
			self[CACHE].delete(hit.key);
			self[LRU_LIST].removeNode(node);
		}
	};
	var Entry = class {
		constructor(key, value, length, now, maxAge) {
			this.key = key;
			this.value = value;
			this.length = length;
			this.now = now;
			this.maxAge = maxAge || 0;
		}
	};
	var forEachStep = (self, fn, node, thisp) => {
		let hit = node.value;
		if (isStale(self, hit)) {
			del(self, node);
			if (!self[ALLOW_STALE]) hit = void 0;
		}
		if (hit) fn.call(thisp, hit.value, hit.key, self);
	};
	module.exports = LRUCache;
}));
//#endregion
//#region node_modules/openid-client/package.json
var package_exports = /* @__PURE__ */ __exportAll({
	author: () => author,
	default: () => package_default,
	dependencies: () => dependencies,
	description: () => description,
	devDependencies: () => devDependencies,
	exports: () => exports$1,
	files: () => files,
	funding: () => funding,
	homepage: () => homepage,
	keywords: () => keywords,
	license: () => "MIT",
	main: () => main,
	name: () => name,
	repository: () => repository,
	scripts: () => scripts,
	types: () => types,
	version: () => version
}), name, version, description, keywords, homepage, repository, funding, author, exports$1, main, types, files, scripts, dependencies, devDependencies, package_default;
var init_package = __esmMin((() => {
	name = "openid-client";
	version = "5.7.1";
	description = "OpenID Connect Relying Party (RP, Client) implementation for Node.js runtime, supports passportjs";
	keywords = [
		"auth",
		"authentication",
		"basic",
		"certified",
		"client",
		"connect",
		"dynamic",
		"electron",
		"hybrid",
		"identity",
		"implicit",
		"oauth",
		"oauth2",
		"oidc",
		"openid",
		"passport",
		"relying party",
		"strategy"
	];
	homepage = "https://github.com/panva/openid-client";
	repository = "panva/openid-client";
	funding = { "url": "https://github.com/sponsors/panva" };
	author = "Filip Skokan <panva.ip@gmail.com>";
	exports$1 = {
		"types": "./types/index.d.ts",
		"import": "./lib/index.mjs",
		"require": "./lib/index.js"
	};
	main = "./lib/index.js";
	types = "./types/index.d.ts";
	files = ["lib", "types/index.d.ts"];
	scripts = {
		"format": "npx prettier --loglevel silent --write ./lib ./test ./certification ./types",
		"test": "mocha test/**/*.test.js"
	};
	dependencies = {
		"jose": "^4.15.9",
		"lru-cache": "^6.0.0",
		"object-hash": "^2.2.0",
		"oidc-token-hash": "^5.0.3"
	};
	devDependencies = {
		"@types/node": "^16.18.106",
		"@types/passport": "^1.0.16",
		"base64url": "^3.0.1",
		"chai": "^4.5.0",
		"mocha": "^10.7.3",
		"nock": "^13.5.5",
		"prettier": "^2.8.8",
		"readable-mock-req": "^0.2.2",
		"sinon": "^9.2.4",
		"timekeeper": "^2.3.1"
	};
	package_default = {
		name,
		version,
		description,
		keywords,
		homepage,
		repository,
		funding,
		license: "MIT",
		author,
		exports: exports$1,
		main,
		types,
		files,
		scripts,
		dependencies,
		devDependencies,
		"standard-version": {
			"scripts": { "postchangelog": "sed -i '' -e 's/### \\[/## [/g' CHANGELOG.md" },
			"types": [
				{
					"type": "feat",
					"section": "Features"
				},
				{
					"type": "fix",
					"section": "Fixes"
				},
				{
					"type": "chore",
					"hidden": true
				},
				{
					"type": "docs",
					"hidden": true
				},
				{
					"type": "style",
					"hidden": true
				},
				{
					"type": "refactor",
					"section": "Refactor",
					"hidden": false
				},
				{
					"type": "perf",
					"section": "Performance",
					"hidden": false
				},
				{
					"type": "test",
					"hidden": true
				}
			]
		}
	};
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/consts.js
var require_consts = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = {
		CLOCK_TOLERANCE: Symbol(),
		HTTP_OPTIONS: Symbol()
	};
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/request.js
var require_request = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var assert$1 = __require("assert");
	var querystring$3 = __require("querystring");
	var http$2 = __require("http");
	var https$2 = __require("https");
	var { once } = __require("events");
	var { URL: URL$4 } = __require("url");
	var LRU = require_lru_cache();
	var pkg = (init_package(), __toCommonJS(package_exports).default);
	var { RPError } = require_errors();
	var pick = require_pick();
	var { deep: defaultsDeep } = require_defaults();
	var { HTTP_OPTIONS } = require_consts();
	var DEFAULT_HTTP_OPTIONS;
	var NQCHAR = /^[\x21\x23-\x5B\x5D-\x7E]+$/;
	var allowed = [
		"agent",
		"ca",
		"cert",
		"crl",
		"headers",
		"key",
		"lookup",
		"passphrase",
		"pfx",
		"timeout"
	];
	var setDefaults = (props, options) => {
		DEFAULT_HTTP_OPTIONS = defaultsDeep({}, props.length ? pick(options, ...props) : options, DEFAULT_HTTP_OPTIONS);
	};
	setDefaults([], {
		headers: {
			"User-Agent": `${pkg.name}/${pkg.version} (${pkg.homepage})`,
			"Accept-Encoding": "identity"
		},
		timeout: 3500
	});
	function send(req, body, contentType) {
		if (contentType) {
			req.removeHeader("content-type");
			req.setHeader("content-type", contentType);
		}
		if (body) {
			req.removeHeader("content-length");
			req.setHeader("content-length", Buffer.byteLength(body));
			req.write(body);
		}
		req.end();
	}
	var nonces = new LRU({ max: 100 });
	module.exports = async function request(options, { accessToken, mTLS = false, DPoP } = {}) {
		let url;
		try {
			url = new URL$4(options.url);
			delete options.url;
			assert$1(/^(https?:)$/.test(url.protocol));
		} catch (err) {
			throw new TypeError("only valid absolute URLs can be requested");
		}
		const optsFn = this[HTTP_OPTIONS];
		let opts = options;
		const nonceKey = `${url.origin}${url.pathname}`;
		if (DPoP && "dpopProof" in this) {
			opts.headers = opts.headers || {};
			opts.headers.DPoP = await this.dpopProof({
				htu: `${url.origin}${url.pathname}`,
				htm: options.method || "GET",
				nonce: nonces.get(nonceKey)
			}, DPoP, accessToken);
		}
		let userOptions;
		if (optsFn) userOptions = pick(optsFn.call(this, url, defaultsDeep({}, opts, DEFAULT_HTTP_OPTIONS)), ...allowed);
		opts = defaultsDeep({}, userOptions, opts, DEFAULT_HTTP_OPTIONS);
		if (mTLS && !opts.pfx && !(opts.key && opts.cert)) throw new TypeError("mutual-TLS certificate and key not set");
		if (opts.searchParams) for (const [key, value] of Object.entries(opts.searchParams)) {
			url.searchParams.delete(key);
			url.searchParams.set(key, value);
		}
		let responseType;
		let form;
		let json;
		let body;
		({form, responseType, json, body, ...opts} = opts);
		for (const [key, value] of Object.entries(opts.headers || {})) if (value === void 0) delete opts.headers[key];
		let response;
		const req = (url.protocol === "https:" ? https$2.request : http$2.request)(url.href, opts);
		return (async () => {
			if (json) send(req, JSON.stringify(json), "application/json");
			else if (form) send(req, querystring$3.stringify(form), "application/x-www-form-urlencoded");
			else if (body) send(req, body);
			else send(req);
			[response] = await Promise.race([once(req, "response"), once(req, "timeout")]);
			if (!response) {
				req.destroy();
				throw new RPError(`outgoing request timed out after ${opts.timeout}ms`);
			}
			const parts = [];
			for await (const part of response) parts.push(part);
			if (parts.length) switch (responseType) {
				case "json":
					Object.defineProperty(response, "body", {
						get() {
							let value = Buffer.concat(parts);
							try {
								value = JSON.parse(value);
							} catch (err) {
								Object.defineProperty(err, "response", { value: response });
								throw err;
							} finally {
								Object.defineProperty(response, "body", {
									value,
									configurable: true
								});
							}
							return value;
						},
						configurable: true
					});
					break;
				case void 0:
				case "buffer":
					Object.defineProperty(response, "body", {
						get() {
							const value = Buffer.concat(parts);
							Object.defineProperty(response, "body", {
								value,
								configurable: true
							});
							return value;
						},
						configurable: true
					});
					break;
				default: throw new TypeError("unsupported responseType request option");
			}
			return response;
		})().catch((err) => {
			if (response) Object.defineProperty(err, "response", { value: response });
			throw err;
		}).finally(() => {
			const dpopNonce = response && response.headers["dpop-nonce"];
			if (dpopNonce && NQCHAR.test(dpopNonce)) nonces.set(nonceKey, dpopNonce);
		});
	};
	module.exports.setDefaults = setDefaults.bind(void 0, allowed);
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/weak_cache.js
var require_weak_cache = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports.keystores = /* @__PURE__ */ new WeakMap();
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/deep_clone.js
var require_deep_clone = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = globalThis.structuredClone || ((obj) => JSON.parse(JSON.stringify(obj)));
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/keystore.js
var require_keystore = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var jose = require_cjs$1();
	var clone = require_deep_clone();
	var isPlainObject = require_is_plain_object();
	var internal = Symbol();
	var keyscore = (key, { alg, use }) => {
		let score = 0;
		if (alg && key.alg) score++;
		if (use && key.use) score++;
		return score;
	};
	function getKtyFromAlg(alg) {
		switch (typeof alg === "string" && alg.slice(0, 2)) {
			case "RS":
			case "PS": return "RSA";
			case "ES": return "EC";
			case "Ed": return "OKP";
			default: return;
		}
	}
	function getAlgorithms(use, alg, kty, crv) {
		if (alg) return new Set([alg]);
		switch (kty) {
			case "EC": {
				let algs = [];
				if (use === "enc" || use === void 0) algs = algs.concat([
					"ECDH-ES",
					"ECDH-ES+A128KW",
					"ECDH-ES+A192KW",
					"ECDH-ES+A256KW"
				]);
				if (use === "sig" || use === void 0) switch (crv) {
					case "P-256":
					case "P-384":
						algs = algs.concat([`ES${crv.slice(-3)}`]);
						break;
					case "P-521":
						algs = algs.concat(["ES512"]);
						break;
					case "secp256k1":
						if (jose.cryptoRuntime === "node:crypto") algs = algs.concat(["ES256K"]);
						break;
				}
				return new Set(algs);
			}
			case "OKP": return new Set([
				"ECDH-ES",
				"ECDH-ES+A128KW",
				"ECDH-ES+A192KW",
				"ECDH-ES+A256KW"
			]);
			case "RSA": {
				let algs = [];
				if (use === "enc" || use === void 0) {
					algs = algs.concat([
						"RSA-OAEP",
						"RSA-OAEP-256",
						"RSA-OAEP-384",
						"RSA-OAEP-512"
					]);
					if (jose.cryptoRuntime === "node:crypto") algs = algs.concat(["RSA1_5"]);
				}
				if (use === "sig" || use === void 0) algs = algs.concat([
					"PS256",
					"PS384",
					"PS512",
					"RS256",
					"RS384",
					"RS512"
				]);
				return new Set(algs);
			}
			default: throw new Error("unreachable");
		}
	}
	module.exports = class KeyStore {
		#keys;
		constructor(i, keys) {
			if (i !== internal) throw new Error("invalid constructor call");
			this.#keys = keys;
		}
		toJWKS() {
			return { keys: this.map(({ jwk: { d, p, q, dp, dq, qi, ...jwk } }) => jwk) };
		}
		all({ alg, kid, use } = {}) {
			if (!use || !alg) throw new Error();
			const kty = getKtyFromAlg(alg);
			const search = {
				alg,
				use
			};
			return this.filter((key) => {
				let candidate = true;
				if (candidate && kty !== void 0 && key.jwk.kty !== kty) candidate = false;
				if (candidate && kid !== void 0 && key.jwk.kid !== kid) candidate = false;
				if (candidate && use !== void 0 && key.jwk.use !== void 0 && key.jwk.use !== use) candidate = false;
				if (candidate && key.jwk.alg && key.jwk.alg !== alg) candidate = false;
				else if (!key.algorithms.has(alg)) candidate = false;
				return candidate;
			}).sort((first, second) => keyscore(second, search) - keyscore(first, search));
		}
		get(...args) {
			return this.all(...args)[0];
		}
		static async fromJWKS(jwks, { onlyPublic = false, onlyPrivate = false } = {}) {
			if (!isPlainObject(jwks) || !Array.isArray(jwks.keys) || jwks.keys.some((k) => !isPlainObject(k) || !("kty" in k))) throw new TypeError("jwks must be a JSON Web Key Set formatted object");
			const keys = [];
			for (let jwk of jwks.keys) {
				jwk = clone(jwk);
				const { kty, kid, crv } = jwk;
				let { alg, use } = jwk;
				if (typeof kty !== "string" || !kty) continue;
				if (use !== void 0 && use !== "sig" && use !== "enc") continue;
				if (typeof alg !== "string" && alg !== void 0) continue;
				if (typeof kid !== "string" && kid !== void 0) continue;
				if (kty === "EC" && use === "sig") switch (crv) {
					case "P-256":
						alg = "ES256";
						break;
					case "P-384":
						alg = "ES384";
						break;
					case "P-521":
						alg = "ES512";
						break;
					default: break;
				}
				if (crv === "secp256k1") {
					use = "sig";
					alg = "ES256K";
				}
				if (kty === "OKP") switch (crv) {
					case "Ed25519":
					case "Ed448":
						use = "sig";
						alg = "EdDSA";
						break;
					case "X25519":
					case "X448":
						use = "enc";
						break;
					default: break;
				}
				if (alg && !use) switch (true) {
					case alg.startsWith("ECDH"):
						use = "enc";
						break;
					case alg.startsWith("RSA"):
						use = "enc";
						break;
					default: break;
				}
				if (onlyPrivate && (jwk.kty === "oct" || !jwk.d)) throw new Error("jwks must only contain private keys");
				if (onlyPublic && (jwk.d || jwk.k)) continue;
				keys.push({
					jwk: {
						...jwk,
						alg,
						use
					},
					async keyObject(alg) {
						if (this[alg]) return this[alg];
						const keyObject = await jose.importJWK(this.jwk, alg);
						this[alg] = keyObject;
						return keyObject;
					},
					get algorithms() {
						Object.defineProperty(this, "algorithms", {
							value: getAlgorithms(this.jwk.use, this.jwk.alg, this.jwk.kty, this.jwk.crv),
							enumerable: true,
							configurable: false
						});
						return this.algorithms;
					}
				});
			}
			return new this(internal, keys);
		}
		filter(...args) {
			return this.#keys.filter(...args);
		}
		find(...args) {
			return this.#keys.find(...args);
		}
		every(...args) {
			return this.#keys.every(...args);
		}
		some(...args) {
			return this.#keys.some(...args);
		}
		map(...args) {
			return this.#keys.map(...args);
		}
		forEach(...args) {
			return this.#keys.forEach(...args);
		}
		reduce(...args) {
			return this.#keys.reduce(...args);
		}
		sort(...args) {
			return this.#keys.sort(...args);
		}
		*[Symbol.iterator]() {
			for (const key of this.#keys) yield key;
		}
	};
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/merge.js
var require_merge$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var isPlainObject = require_is_plain_object();
	function merge(target, ...sources) {
		for (const source of sources) {
			if (!isPlainObject(source)) continue;
			for (const [key, value] of Object.entries(source)) {
				/* istanbul ignore if */
				if (key === "__proto__" || key === "constructor") continue;
				if (isPlainObject(target[key]) && isPlainObject(value)) target[key] = merge(target[key], value);
				else if (typeof value !== "undefined") target[key] = value;
			}
		}
		return target;
	}
	module.exports = merge;
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/client.js
var require_client$2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var jose = require_cjs$1();
	var { RPError } = require_errors();
	var { assertIssuerConfiguration } = require_assert$1();
	var { random } = require_generators();
	var now = require_unix_timestamp();
	var request = require_request();
	var { keystores } = require_weak_cache();
	var merge = require_merge$1();
	var formUrlEncode = (value) => encodeURIComponent(value).replace(/%20/g, "+");
	async function clientAssertion(endpoint, payload) {
		let alg = this[`${endpoint}_endpoint_auth_signing_alg`];
		if (!alg) assertIssuerConfiguration(this.issuer, `${endpoint}_endpoint_auth_signing_alg_values_supported`);
		if (this[`${endpoint}_endpoint_auth_method`] === "client_secret_jwt") {
			if (!alg) {
				const supported = this.issuer[`${endpoint}_endpoint_auth_signing_alg_values_supported`];
				alg = Array.isArray(supported) && supported.find((signAlg) => /^HS(?:256|384|512)/.test(signAlg));
			}
			if (!alg) throw new RPError(`failed to determine a JWS Algorithm to use for ${this[`${endpoint}_endpoint_auth_method`]} Client Assertion`);
			return new jose.CompactSign(Buffer.from(JSON.stringify(payload))).setProtectedHeader({ alg }).sign(this.secretForAlg(alg));
		}
		const keystore = await keystores.get(this);
		if (!keystore) throw new TypeError("no client jwks provided for signing a client assertion with");
		if (!alg) {
			const supported = this.issuer[`${endpoint}_endpoint_auth_signing_alg_values_supported`];
			alg = Array.isArray(supported) && supported.find((signAlg) => keystore.get({
				alg: signAlg,
				use: "sig"
			}));
		}
		if (!alg) throw new RPError(`failed to determine a JWS Algorithm to use for ${this[`${endpoint}_endpoint_auth_method`]} Client Assertion`);
		const key = keystore.get({
			alg,
			use: "sig"
		});
		if (!key) throw new RPError(`no key found in client jwks to sign a client assertion with using alg ${alg}`);
		return new jose.CompactSign(Buffer.from(JSON.stringify(payload))).setProtectedHeader({
			alg,
			kid: key.jwk && key.jwk.kid
		}).sign(await key.keyObject(alg));
	}
	async function authFor(endpoint, { clientAssertionPayload } = {}) {
		switch (this[`${endpoint}_endpoint_auth_method`]) {
			case "self_signed_tls_client_auth":
			case "tls_client_auth":
			case "none": return { form: { client_id: this.client_id } };
			case "client_secret_post":
				if (typeof this.client_secret !== "string") throw new TypeError("client_secret_post client authentication method requires a client_secret");
				return { form: {
					client_id: this.client_id,
					client_secret: this.client_secret
				} };
			case "private_key_jwt":
			case "client_secret_jwt": {
				const timestamp = now();
				const assertion = await clientAssertion.call(this, endpoint, {
					iat: timestamp,
					exp: timestamp + 60,
					jti: random(),
					iss: this.client_id,
					sub: this.client_id,
					aud: this.issuer.issuer,
					...clientAssertionPayload
				});
				return { form: {
					client_id: this.client_id,
					client_assertion: assertion,
					client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer"
				} };
			}
			case "client_secret_basic": {
				if (typeof this.client_secret !== "string") throw new TypeError("client_secret_basic client authentication method requires a client_secret");
				const encoded = `${formUrlEncode(this.client_id)}:${formUrlEncode(this.client_secret)}`;
				return { headers: { Authorization: `Basic ${Buffer.from(encoded).toString("base64")}` } };
			}
			default: throw new TypeError(`missing, or unsupported, ${endpoint}_endpoint_auth_method`);
		}
	}
	function resolveResponseType() {
		const { length, 0: value } = this.response_types;
		if (length === 1) return value;
	}
	function resolveRedirectUri() {
		const { length, 0: value } = this.redirect_uris || [];
		if (length === 1) return value;
	}
	async function authenticatedPost(endpoint, opts, { clientAssertionPayload, endpointAuthMethod = endpoint, DPoP } = {}) {
		const requestOpts = merge(opts, await authFor.call(this, endpointAuthMethod, { clientAssertionPayload }));
		const mTLS = this[`${endpointAuthMethod}_endpoint_auth_method`].includes("tls_client_auth") || endpoint === "token" && this.tls_client_certificate_bound_access_tokens;
		let targetUrl;
		if (mTLS && this.issuer.mtls_endpoint_aliases) targetUrl = this.issuer.mtls_endpoint_aliases[`${endpoint}_endpoint`];
		targetUrl = targetUrl || this.issuer[`${endpoint}_endpoint`];
		if ("form" in requestOpts) {
			for (const [key, value] of Object.entries(requestOpts.form)) if (typeof value === "undefined") delete requestOpts.form[key];
		}
		return request.call(this, {
			...requestOpts,
			method: "POST",
			url: targetUrl,
			headers: {
				...endpoint !== "revocation" ? { Accept: "application/json" } : void 0,
				...requestOpts.headers
			}
		}, {
			mTLS,
			DPoP
		});
	}
	module.exports = {
		resolveResponseType,
		resolveRedirectUri,
		authFor,
		authenticatedPost
	};
}));
//#endregion
//#region node_modules/object-hash/index.js
var require_object_hash = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var crypto$2 = __require("crypto");
	/**
	* Exported function
	*
	* Options:
	*
	*  - `algorithm` hash algo to be used by this instance: *'sha1', 'md5'
	*  - `excludeValues` {true|*false} hash object keys, values ignored
	*  - `encoding` hash encoding, supports 'buffer', '*hex', 'binary', 'base64'
	*  - `ignoreUnknown` {true|*false} ignore unknown object types
	*  - `replacer` optional function that replaces values before hashing
	*  - `respectFunctionProperties` {*true|false} consider function properties when hashing
	*  - `respectFunctionNames` {*true|false} consider 'name' property of functions for hashing
	*  - `respectType` {*true|false} Respect special properties (prototype, constructor)
	*    when hashing to distinguish between types
	*  - `unorderedArrays` {true|*false} Sort all arrays before hashing
	*  - `unorderedSets` {*true|false} Sort `Set` and `Map` instances before hashing
	*  * = default
	*
	* @param {object} object value to hash
	* @param {object} options hashing options
	* @return {string} hash value
	* @api public
	*/
	exports = module.exports = objectHash;
	function objectHash(object, options) {
		options = applyDefaults(object, options);
		return hash(object, options);
	}
	/**
	* Exported sugar methods
	*
	* @param {object} object value to hash
	* @return {string} hash value
	* @api public
	*/
	exports.sha1 = function(object) {
		return objectHash(object);
	};
	exports.keys = function(object) {
		return objectHash(object, {
			excludeValues: true,
			algorithm: "sha1",
			encoding: "hex"
		});
	};
	exports.MD5 = function(object) {
		return objectHash(object, {
			algorithm: "md5",
			encoding: "hex"
		});
	};
	exports.keysMD5 = function(object) {
		return objectHash(object, {
			algorithm: "md5",
			encoding: "hex",
			excludeValues: true
		});
	};
	var hashes = crypto$2.getHashes ? crypto$2.getHashes().slice() : ["sha1", "md5"];
	hashes.push("passthrough");
	var encodings = [
		"buffer",
		"hex",
		"binary",
		"base64"
	];
	function applyDefaults(object, sourceOptions) {
		sourceOptions = sourceOptions || {};
		var options = {};
		options.algorithm = sourceOptions.algorithm || "sha1";
		options.encoding = sourceOptions.encoding || "hex";
		options.excludeValues = sourceOptions.excludeValues ? true : false;
		options.algorithm = options.algorithm.toLowerCase();
		options.encoding = options.encoding.toLowerCase();
		options.ignoreUnknown = sourceOptions.ignoreUnknown !== true ? false : true;
		options.respectType = sourceOptions.respectType === false ? false : true;
		options.respectFunctionNames = sourceOptions.respectFunctionNames === false ? false : true;
		options.respectFunctionProperties = sourceOptions.respectFunctionProperties === false ? false : true;
		options.unorderedArrays = sourceOptions.unorderedArrays !== true ? false : true;
		options.unorderedSets = sourceOptions.unorderedSets === false ? false : true;
		options.unorderedObjects = sourceOptions.unorderedObjects === false ? false : true;
		options.replacer = sourceOptions.replacer || void 0;
		options.excludeKeys = sourceOptions.excludeKeys || void 0;
		if (typeof object === "undefined") throw new Error("Object argument required.");
		for (var i = 0; i < hashes.length; ++i) if (hashes[i].toLowerCase() === options.algorithm.toLowerCase()) options.algorithm = hashes[i];
		if (hashes.indexOf(options.algorithm) === -1) throw new Error("Algorithm \"" + options.algorithm + "\"  not supported. supported values: " + hashes.join(", "));
		if (encodings.indexOf(options.encoding) === -1 && options.algorithm !== "passthrough") throw new Error("Encoding \"" + options.encoding + "\"  not supported. supported values: " + encodings.join(", "));
		return options;
	}
	/** Check if the given function is a native function */
	function isNativeFunction(f) {
		if (typeof f !== "function") return false;
		return /^function\s+\w*\s*\(\s*\)\s*{\s+\[native code\]\s+}$/i.exec(Function.prototype.toString.call(f)) != null;
	}
	function hash(object, options) {
		var hashingStream;
		if (options.algorithm !== "passthrough") hashingStream = crypto$2.createHash(options.algorithm);
		else hashingStream = new PassThrough();
		if (typeof hashingStream.write === "undefined") {
			hashingStream.write = hashingStream.update;
			hashingStream.end = hashingStream.update;
		}
		typeHasher(options, hashingStream).dispatch(object);
		if (!hashingStream.update) hashingStream.end("");
		if (hashingStream.digest) return hashingStream.digest(options.encoding === "buffer" ? void 0 : options.encoding);
		var buf = hashingStream.read();
		if (options.encoding === "buffer") return buf;
		return buf.toString(options.encoding);
	}
	/**
	* Expose streaming API
	*
	* @param {object} object  Value to serialize
	* @param {object} options  Options, as for hash()
	* @param {object} stream  A stream to write the serializiation to
	* @api public
	*/
	exports.writeToStream = function(object, options, stream) {
		if (typeof stream === "undefined") {
			stream = options;
			options = {};
		}
		options = applyDefaults(object, options);
		return typeHasher(options, stream).dispatch(object);
	};
	function typeHasher(options, writeTo, context) {
		context = context || [];
		var write = function(str) {
			if (writeTo.update) return writeTo.update(str, "utf8");
			else return writeTo.write(str, "utf8");
		};
		return {
			dispatch: function(value) {
				if (options.replacer) value = options.replacer(value);
				var type = typeof value;
				if (value === null) type = "null";
				return this["_" + type](value);
			},
			_object: function(object) {
				var pattern = /\[object (.*)\]/i;
				var objString = Object.prototype.toString.call(object);
				var objType = pattern.exec(objString);
				if (!objType) objType = "unknown:[" + objString + "]";
				else objType = objType[1];
				objType = objType.toLowerCase();
				var objectNumber = null;
				if ((objectNumber = context.indexOf(object)) >= 0) return this.dispatch("[CIRCULAR:" + objectNumber + "]");
				else context.push(object);
				if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
					write("buffer:");
					return write(object);
				}
				if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") if (this["_" + objType]) this["_" + objType](object);
				else if (options.ignoreUnknown) return write("[" + objType + "]");
				else throw new Error("Unknown object type \"" + objType + "\"");
				else {
					var keys = Object.keys(object);
					if (options.unorderedObjects) keys = keys.sort();
					if (options.respectType !== false && !isNativeFunction(object)) keys.splice(0, 0, "prototype", "__proto__", "constructor");
					if (options.excludeKeys) keys = keys.filter(function(key) {
						return !options.excludeKeys(key);
					});
					write("object:" + keys.length + ":");
					var self = this;
					return keys.forEach(function(key) {
						self.dispatch(key);
						write(":");
						if (!options.excludeValues) self.dispatch(object[key]);
						write(",");
					});
				}
			},
			_array: function(arr, unordered) {
				unordered = typeof unordered !== "undefined" ? unordered : options.unorderedArrays !== false;
				var self = this;
				write("array:" + arr.length + ":");
				if (!unordered || arr.length <= 1) return arr.forEach(function(entry) {
					return self.dispatch(entry);
				});
				var contextAdditions = [];
				var entries = arr.map(function(entry) {
					var strm = new PassThrough();
					var localContext = context.slice();
					typeHasher(options, strm, localContext).dispatch(entry);
					contextAdditions = contextAdditions.concat(localContext.slice(context.length));
					return strm.read().toString();
				});
				context = context.concat(contextAdditions);
				entries.sort();
				return this._array(entries, false);
			},
			_date: function(date) {
				return write("date:" + date.toJSON());
			},
			_symbol: function(sym) {
				return write("symbol:" + sym.toString());
			},
			_error: function(err) {
				return write("error:" + err.toString());
			},
			_boolean: function(bool) {
				return write("bool:" + bool.toString());
			},
			_string: function(string) {
				write("string:" + string.length + ":");
				write(string.toString());
			},
			_function: function(fn) {
				write("fn:");
				if (isNativeFunction(fn)) this.dispatch("[native]");
				else this.dispatch(fn.toString());
				if (options.respectFunctionNames !== false) this.dispatch("function-name:" + String(fn.name));
				if (options.respectFunctionProperties) this._object(fn);
			},
			_number: function(number) {
				return write("number:" + number.toString());
			},
			_xml: function(xml) {
				return write("xml:" + xml.toString());
			},
			_null: function() {
				return write("Null");
			},
			_undefined: function() {
				return write("Undefined");
			},
			_regexp: function(regex) {
				return write("regex:" + regex.toString());
			},
			_uint8array: function(arr) {
				write("uint8array:");
				return this.dispatch(Array.prototype.slice.call(arr));
			},
			_uint8clampedarray: function(arr) {
				write("uint8clampedarray:");
				return this.dispatch(Array.prototype.slice.call(arr));
			},
			_int8array: function(arr) {
				write("uint8array:");
				return this.dispatch(Array.prototype.slice.call(arr));
			},
			_uint16array: function(arr) {
				write("uint16array:");
				return this.dispatch(Array.prototype.slice.call(arr));
			},
			_int16array: function(arr) {
				write("uint16array:");
				return this.dispatch(Array.prototype.slice.call(arr));
			},
			_uint32array: function(arr) {
				write("uint32array:");
				return this.dispatch(Array.prototype.slice.call(arr));
			},
			_int32array: function(arr) {
				write("uint32array:");
				return this.dispatch(Array.prototype.slice.call(arr));
			},
			_float32array: function(arr) {
				write("float32array:");
				return this.dispatch(Array.prototype.slice.call(arr));
			},
			_float64array: function(arr) {
				write("float64array:");
				return this.dispatch(Array.prototype.slice.call(arr));
			},
			_arraybuffer: function(arr) {
				write("arraybuffer:");
				return this.dispatch(new Uint8Array(arr));
			},
			_url: function(url) {
				return write("url:" + url.toString(), "utf8");
			},
			_map: function(map) {
				write("map:");
				var arr = Array.from(map);
				return this._array(arr, options.unorderedSets !== false);
			},
			_set: function(set) {
				write("set:");
				var arr = Array.from(set);
				return this._array(arr, options.unorderedSets !== false);
			},
			_file: function(file) {
				write("file:");
				return this.dispatch([
					file.name,
					file.size,
					file.type,
					file.lastModfied
				]);
			},
			_blob: function() {
				if (options.ignoreUnknown) return write("[blob]");
				throw Error("Hashing Blob objects is currently not supported\n(see https://github.com/puleos/object-hash/issues/26)\nUse \"options.replacer\" or \"options.ignoreUnknown\"\n");
			},
			_domwindow: function() {
				return write("domwindow");
			},
			_bigint: function(number) {
				return write("bigint:" + number.toString());
			},
			_process: function() {
				return write("process");
			},
			_timer: function() {
				return write("timer");
			},
			_pipe: function() {
				return write("pipe");
			},
			_tcp: function() {
				return write("tcp");
			},
			_udp: function() {
				return write("udp");
			},
			_tty: function() {
				return write("tty");
			},
			_statwatcher: function() {
				return write("statwatcher");
			},
			_securecontext: function() {
				return write("securecontext");
			},
			_connection: function() {
				return write("connection");
			},
			_zlib: function() {
				return write("zlib");
			},
			_context: function() {
				return write("context");
			},
			_nodescript: function() {
				return write("nodescript");
			},
			_httpparser: function() {
				return write("httpparser");
			},
			_dataview: function() {
				return write("dataview");
			},
			_signal: function() {
				return write("signal");
			},
			_fsevent: function() {
				return write("fsevent");
			},
			_tlswrap: function() {
				return write("tlswrap");
			}
		};
	}
	function PassThrough() {
		return {
			buf: "",
			write: function(b) {
				this.buf += b;
			},
			end: function(b) {
				this.buf += b;
			},
			read: function() {
				return this.buf;
			}
		};
	}
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/issuer.js
var require_issuer$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var objectHash = require_object_hash();
	var LRU = require_lru_cache();
	var { RPError } = require_errors();
	var { assertIssuerConfiguration } = require_assert$1();
	var KeyStore = require_keystore();
	var { keystores } = require_weak_cache();
	var processResponse = require_process_response();
	var request = require_request();
	var inFlight = /* @__PURE__ */ new WeakMap();
	var caches = /* @__PURE__ */ new WeakMap();
	var lrus = (ctx) => {
		if (!caches.has(ctx)) caches.set(ctx, new LRU({ max: 100 }));
		return caches.get(ctx);
	};
	async function getKeyStore(reload = false) {
		assertIssuerConfiguration(this, "jwks_uri");
		const keystore = keystores.get(this);
		const cache = lrus(this);
		if (reload || !keystore) {
			if (inFlight.has(this)) return inFlight.get(this);
			cache.reset();
			inFlight.set(this, (async () => {
				const jwks = processResponse(await request.call(this, {
					method: "GET",
					responseType: "json",
					url: this.jwks_uri,
					headers: { Accept: "application/json, application/jwk-set+json" }
				}).finally(() => {
					inFlight.delete(this);
				}));
				const joseKeyStore = KeyStore.fromJWKS(jwks, { onlyPublic: true });
				cache.set("throttle", true, 60 * 1e3);
				keystores.set(this, joseKeyStore);
				return joseKeyStore;
			})());
			return inFlight.get(this);
		}
		return keystore;
	}
	async function queryKeyStore({ kid, kty, alg, use }, { allowMulti = false } = {}) {
		const cache = lrus(this);
		const def = {
			kid,
			kty,
			alg,
			use
		};
		const defHash = objectHash(def, {
			algorithm: "sha256",
			ignoreUnknown: true,
			unorderedArrays: true,
			unorderedSets: true,
			respectType: false
		});
		const freshJwksUri = cache.get(defHash) || cache.get("throttle");
		const keystore = await getKeyStore.call(this, !freshJwksUri);
		const keys = keystore.all(def);
		delete def.use;
		if (keys.length === 0) throw new RPError({
			printf: ["no valid key found in issuer's jwks_uri for key parameters %j", def],
			jwks: keystore
		});
		if (!allowMulti && keys.length > 1 && !kid) throw new RPError({
			printf: ["multiple matching keys found in issuer's jwks_uri for key parameters %j, kid must be provided in this case", def],
			jwks: keystore
		});
		cache.set(defHash, true);
		return keys;
	}
	module.exports.queryKeyStore = queryKeyStore;
	module.exports.keystore = getKeyStore;
}));
//#endregion
//#region node_modules/openid-client/lib/device_flow_handle.js
var require_device_flow_handle = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { inspect: inspect$2 } = __require("util");
	var { RPError, OPError } = require_errors();
	var now = require_unix_timestamp();
	var DeviceFlowHandle = class {
		#aborted;
		#client;
		#clientAssertionPayload;
		#DPoP;
		#exchangeBody;
		#expires_at;
		#interval;
		#maxAge;
		#response;
		constructor({ client, exchangeBody, clientAssertionPayload, response, maxAge, DPoP }) {
			[
				"verification_uri",
				"user_code",
				"device_code"
			].forEach((prop) => {
				if (typeof response[prop] !== "string" || !response[prop]) throw new RPError(`expected ${prop} string to be returned by Device Authorization Response, got %j`, response[prop]);
			});
			if (!Number.isSafeInteger(response.expires_in)) throw new RPError("expected expires_in number to be returned by Device Authorization Response, got %j", response.expires_in);
			this.#expires_at = now() + response.expires_in;
			this.#client = client;
			this.#DPoP = DPoP;
			this.#maxAge = maxAge;
			this.#exchangeBody = exchangeBody;
			this.#clientAssertionPayload = clientAssertionPayload;
			this.#response = response;
			this.#interval = response.interval * 1e3 || 5e3;
		}
		abort() {
			this.#aborted = true;
		}
		async poll({ signal } = {}) {
			if (signal && signal.aborted || this.#aborted) throw new RPError("polling aborted");
			if (this.expired()) throw new RPError("the device code %j has expired and the device authorization session has concluded", this.device_code);
			await new Promise((resolve) => setTimeout(resolve, this.#interval));
			let tokenset;
			try {
				tokenset = await this.#client.grant({
					...this.#exchangeBody,
					grant_type: "urn:ietf:params:oauth:grant-type:device_code",
					device_code: this.device_code
				}, {
					clientAssertionPayload: this.#clientAssertionPayload,
					DPoP: this.#DPoP
				});
			} catch (err) {
				switch (err instanceof OPError && err.error) {
					case "slow_down": this.#interval += 5e3;
					case "authorization_pending": return this.poll({ signal });
					default: throw err;
				}
			}
			if ("id_token" in tokenset) {
				await this.#client.decryptIdToken(tokenset);
				await this.#client.validateIdToken(tokenset, void 0, "token", this.#maxAge);
			}
			return tokenset;
		}
		get device_code() {
			return this.#response.device_code;
		}
		get user_code() {
			return this.#response.user_code;
		}
		get verification_uri() {
			return this.#response.verification_uri;
		}
		get verification_uri_complete() {
			return this.#response.verification_uri_complete;
		}
		get expires_in() {
			return Math.max.apply(null, [this.#expires_at - now(), 0]);
		}
		expired() {
			return this.expires_in === 0;
		}
		/* istanbul ignore next */
		[inspect$2.custom]() {
			return `${this.constructor.name} ${inspect$2(this.#response, {
				depth: Infinity,
				colors: process.stdout.isTTY,
				compact: false,
				sorted: true
			})}`;
		}
	};
	module.exports = DeviceFlowHandle;
}));
//#endregion
//#region node_modules/openid-client/lib/client.js
var require_client$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { inspect: inspect$1 } = __require("util");
	var stdhttp = __require("http");
	var crypto$1 = __require("crypto");
	var { strict: assert } = __require("assert");
	var querystring$2 = __require("querystring");
	var url$2 = __require("url");
	var { URL: URL$3, URLSearchParams: URLSearchParams$1 } = __require("url");
	var jose = require_cjs$1();
	var tokenHash = require_lib$1();
	var isKeyObject = require_is_key_object();
	var decodeJWT = require_decode_jwt();
	var base64url = require_base64url();
	var defaults = require_defaults();
	var parseWwwAuthenticate = require_www_authenticate_parser();
	var { assertSigningAlgValuesSupport, assertIssuerConfiguration } = require_assert$1();
	var pick = require_pick();
	var isPlainObject = require_is_plain_object();
	var processResponse = require_process_response();
	var TokenSet = require_token_set();
	var { OPError, RPError } = require_errors();
	var now = require_unix_timestamp();
	var { random } = require_generators();
	var request = require_request();
	var { CLOCK_TOLERANCE } = require_consts();
	var { keystores } = require_weak_cache();
	var KeyStore = require_keystore();
	var clone = require_deep_clone();
	var { authenticatedPost, resolveResponseType, resolveRedirectUri } = require_client$2();
	var { queryKeyStore } = require_issuer$1();
	var DeviceFlowHandle = require_device_flow_handle();
	var [major, minor] = process.version.slice(1).split(".").map((str) => parseInt(str, 10));
	var rsaPssParams = major >= 17 || major === 16 && minor >= 9;
	var retryAttempt = Symbol();
	var skipNonceCheck = Symbol();
	var skipMaxAgeCheck = Symbol();
	function pickCb(input) {
		return pick(input, "access_token", "code", "error_description", "error_uri", "error", "expires_in", "id_token", "iss", "response", "session_state", "state", "token_type");
	}
	function authorizationHeaderValue(token, tokenType = "Bearer") {
		return `${tokenType} ${token}`;
	}
	function getSearchParams(input) {
		const parsed = url$2.parse(input);
		if (!parsed.search) return {};
		return querystring$2.parse(parsed.search.substring(1));
	}
	function verifyPresence(payload, jwt, prop) {
		if (payload[prop] === void 0) throw new RPError({
			message: `missing required JWT property ${prop}`,
			jwt
		});
	}
	function authorizationParams(params) {
		const authParams = {
			client_id: this.client_id,
			scope: "openid",
			response_type: resolveResponseType.call(this),
			redirect_uri: resolveRedirectUri.call(this),
			...params
		};
		Object.entries(authParams).forEach(([key, value]) => {
			if (value === null || value === void 0) delete authParams[key];
			else if (key === "claims" && typeof value === "object") authParams[key] = JSON.stringify(value);
			else if (key === "resource" && Array.isArray(value)) authParams[key] = value;
			else if (typeof value !== "string") authParams[key] = String(value);
		});
		return authParams;
	}
	function getKeystore(jwks) {
		if (!isPlainObject(jwks) || !Array.isArray(jwks.keys) || jwks.keys.some((k) => !isPlainObject(k) || !("kty" in k))) throw new TypeError("jwks must be a JSON Web Key Set formatted object");
		return KeyStore.fromJWKS(jwks, { onlyPrivate: true });
	}
	function checkBasicSupport(client, properties) {
		try {
			const supported = client.issuer.token_endpoint_auth_methods_supported;
			if (!supported.includes(properties.token_endpoint_auth_method)) {
				if (supported.includes("client_secret_post")) properties.token_endpoint_auth_method = "client_secret_post";
			}
		} catch (err) {}
	}
	function handleCommonMistakes(client, metadata, properties) {
		if (!metadata.token_endpoint_auth_method) checkBasicSupport(client, properties);
		if (metadata.redirect_uri) {
			if (metadata.redirect_uris) throw new TypeError("provide a redirect_uri or redirect_uris, not both");
			properties.redirect_uris = [metadata.redirect_uri];
			delete properties.redirect_uri;
		}
		if (metadata.response_type) {
			if (metadata.response_types) throw new TypeError("provide a response_type or response_types, not both");
			properties.response_types = [metadata.response_type];
			delete properties.response_type;
		}
	}
	function getDefaultsForEndpoint(endpoint, issuer, properties) {
		if (!issuer[`${endpoint}_endpoint`]) return;
		const tokenEndpointAuthMethod = properties.token_endpoint_auth_method;
		const tokenEndpointAuthSigningAlg = properties.token_endpoint_auth_signing_alg;
		const eam = `${endpoint}_endpoint_auth_method`;
		const easa = `${endpoint}_endpoint_auth_signing_alg`;
		if (properties[eam] === void 0 && properties[easa] === void 0) {
			if (tokenEndpointAuthMethod !== void 0) properties[eam] = tokenEndpointAuthMethod;
			if (tokenEndpointAuthSigningAlg !== void 0) properties[easa] = tokenEndpointAuthSigningAlg;
		}
	}
	var BaseClient = class {
		#metadata;
		#issuer;
		#aadIssValidation;
		#additionalAuthorizedParties;
		constructor(issuer, aadIssValidation, metadata = {}, jwks, options) {
			this.#metadata = /* @__PURE__ */ new Map();
			this.#issuer = issuer;
			this.#aadIssValidation = aadIssValidation;
			if (typeof metadata.client_id !== "string" || !metadata.client_id) throw new TypeError("client_id is required");
			const properties = {
				grant_types: ["authorization_code"],
				id_token_signed_response_alg: "RS256",
				authorization_signed_response_alg: "RS256",
				response_types: ["code"],
				token_endpoint_auth_method: "client_secret_basic",
				...this.fapi1() ? {
					grant_types: ["authorization_code", "implicit"],
					id_token_signed_response_alg: "PS256",
					authorization_signed_response_alg: "PS256",
					response_types: ["code id_token"],
					tls_client_certificate_bound_access_tokens: true,
					token_endpoint_auth_method: void 0
				} : void 0,
				...this.fapi2() ? {
					id_token_signed_response_alg: "PS256",
					authorization_signed_response_alg: "PS256",
					token_endpoint_auth_method: void 0
				} : void 0,
				...metadata
			};
			if (this.fapi()) switch (properties.token_endpoint_auth_method) {
				case "self_signed_tls_client_auth":
				case "tls_client_auth": break;
				case "private_key_jwt":
					if (!jwks) throw new TypeError("jwks is required");
					break;
				case void 0: throw new TypeError("token_endpoint_auth_method is required");
				default: throw new TypeError("invalid or unsupported token_endpoint_auth_method");
			}
			if (this.fapi2()) {
				if (properties.tls_client_certificate_bound_access_tokens && properties.dpop_bound_access_tokens) throw new TypeError("either tls_client_certificate_bound_access_tokens or dpop_bound_access_tokens must be set to true");
				if (!properties.tls_client_certificate_bound_access_tokens && !properties.dpop_bound_access_tokens) throw new TypeError("either tls_client_certificate_bound_access_tokens or dpop_bound_access_tokens must be set to true");
			}
			handleCommonMistakes(this, metadata, properties);
			assertSigningAlgValuesSupport("token", this.issuer, properties);
			["introspection", "revocation"].forEach((endpoint) => {
				getDefaultsForEndpoint(endpoint, this.issuer, properties);
				assertSigningAlgValuesSupport(endpoint, this.issuer, properties);
			});
			Object.entries(properties).forEach(([key, value]) => {
				this.#metadata.set(key, value);
				if (!this[key]) Object.defineProperty(this, key, {
					get() {
						return this.#metadata.get(key);
					},
					enumerable: true
				});
			});
			if (jwks !== void 0) {
				const keystore = getKeystore.call(this, jwks);
				keystores.set(this, keystore);
			}
			if (options != null && options.additionalAuthorizedParties) this.#additionalAuthorizedParties = clone(options.additionalAuthorizedParties);
			this[CLOCK_TOLERANCE] = 0;
		}
		authorizationUrl(params = {}) {
			if (!isPlainObject(params)) throw new TypeError("params must be a plain object");
			assertIssuerConfiguration(this.issuer, "authorization_endpoint");
			const target = new URL$3(this.issuer.authorization_endpoint);
			for (const [name, value] of Object.entries(authorizationParams.call(this, params))) if (Array.isArray(value)) {
				target.searchParams.delete(name);
				for (const member of value) target.searchParams.append(name, member);
			} else target.searchParams.set(name, value);
			return target.href.replace(/\+/g, "%20");
		}
		authorizationPost(params = {}) {
			if (!isPlainObject(params)) throw new TypeError("params must be a plain object");
			const inputs = authorizationParams.call(this, params);
			const formInputs = Object.keys(inputs).map((name) => `<input type="hidden" name="${name}" value="${inputs[name]}"/>`).join("\n");
			return `<!DOCTYPE html>
<head>
<title>Requesting Authorization</title>
</head>
<body onload="javascript:document.forms[0].submit()">
<form method="post" action="${this.issuer.authorization_endpoint}">
  ${formInputs}
</form>
</body>
</html>`;
		}
		endSessionUrl(params = {}) {
			assertIssuerConfiguration(this.issuer, "end_session_endpoint");
			const { 0: postLogout, length } = this.post_logout_redirect_uris || [];
			const { post_logout_redirect_uri = length === 1 ? postLogout : void 0 } = params;
			let id_token_hint;
			({id_token_hint, ...params} = params);
			if (id_token_hint instanceof TokenSet) {
				if (!id_token_hint.id_token) throw new TypeError("id_token not present in TokenSet");
				id_token_hint = id_token_hint.id_token;
			}
			const target = url$2.parse(this.issuer.end_session_endpoint);
			const query = defaults(getSearchParams(this.issuer.end_session_endpoint), params, {
				post_logout_redirect_uri,
				client_id: this.client_id
			}, { id_token_hint });
			Object.entries(query).forEach(([key, value]) => {
				if (value === null || value === void 0) delete query[key];
			});
			target.search = null;
			target.query = query;
			return url$2.format(target);
		}
		callbackParams(input) {
			const isIncomingMessage = input instanceof stdhttp.IncomingMessage || input && input.method && input.url;
			if (!(typeof input === "string") && !isIncomingMessage) throw new TypeError("#callbackParams only accepts string urls, http.IncomingMessage or a lookalike");
			if (isIncomingMessage) switch (input.method) {
				case "GET": return pickCb(getSearchParams(input.url));
				case "POST":
					if (input.body === void 0) throw new TypeError("incoming message body missing, include a body parser prior to this method call");
					switch (typeof input.body) {
						case "object":
						case "string":
							if (Buffer.isBuffer(input.body)) return pickCb(querystring$2.parse(input.body.toString("utf-8")));
							if (typeof input.body === "string") return pickCb(querystring$2.parse(input.body));
							return pickCb(input.body);
						default: throw new TypeError("invalid IncomingMessage body object");
					}
				default: throw new TypeError("invalid IncomingMessage method");
			}
			else return pickCb(getSearchParams(input));
		}
		async callback(redirectUri, parameters, checks = {}, { exchangeBody, clientAssertionPayload, DPoP } = {}) {
			let params = pickCb(parameters);
			if (checks.jarm && !("response" in parameters)) throw new RPError({
				message: "expected a JARM response",
				checks,
				params
			});
			else if ("response" in parameters) {
				const decrypted = await this.decryptJARM(params.response);
				params = await this.validateJARM(decrypted);
			}
			if (this.default_max_age && !checks.max_age) checks.max_age = this.default_max_age;
			if (params.state && !checks.state) throw new TypeError("checks.state argument is missing");
			if (!params.state && checks.state) throw new RPError({
				message: "state missing from the response",
				checks,
				params
			});
			if (checks.state !== params.state) throw new RPError({
				printf: [
					"state mismatch, expected %s, got: %s",
					checks.state,
					params.state
				],
				checks,
				params
			});
			if ("iss" in params) {
				assertIssuerConfiguration(this.issuer, "issuer");
				if (params.iss !== this.issuer.issuer) throw new RPError({
					printf: [
						"iss mismatch, expected %s, got: %s",
						this.issuer.issuer,
						params.iss
					],
					params
				});
			} else if (this.issuer.authorization_response_iss_parameter_supported && !("id_token" in params) && !("response" in parameters)) throw new RPError({
				message: "iss missing from the response",
				params
			});
			if (params.error) throw new OPError(params);
			const RESPONSE_TYPE_REQUIRED_PARAMS = {
				code: ["code"],
				id_token: ["id_token"],
				token: ["access_token", "token_type"]
			};
			if (checks.response_type) {
				for (const type of checks.response_type.split(" ")) if (type === "none") {
					if (params.code || params.id_token || params.access_token) throw new RPError({
						message: "unexpected params encountered for \"none\" response",
						checks,
						params
					});
				} else for (const param of RESPONSE_TYPE_REQUIRED_PARAMS[type]) if (!params[param]) throw new RPError({
					message: `${param} missing from response`,
					checks,
					params
				});
			}
			if (params.id_token) {
				const tokenset = new TokenSet(params);
				await this.decryptIdToken(tokenset);
				await this.validateIdToken(tokenset, checks.nonce, "authorization", checks.max_age, checks.state);
				if (!params.code) return tokenset;
			}
			if (params.code) {
				const tokenset = await this.grant({
					...exchangeBody,
					grant_type: "authorization_code",
					code: params.code,
					redirect_uri: redirectUri,
					code_verifier: checks.code_verifier
				}, {
					clientAssertionPayload,
					DPoP
				});
				await this.decryptIdToken(tokenset);
				await this.validateIdToken(tokenset, checks.nonce, "token", checks.max_age);
				if (params.session_state) tokenset.session_state = params.session_state;
				return tokenset;
			}
			return new TokenSet(params);
		}
		async oauthCallback(redirectUri, parameters, checks = {}, { exchangeBody, clientAssertionPayload, DPoP } = {}) {
			let params = pickCb(parameters);
			if (checks.jarm && !("response" in parameters)) throw new RPError({
				message: "expected a JARM response",
				checks,
				params
			});
			else if ("response" in parameters) {
				const decrypted = await this.decryptJARM(params.response);
				params = await this.validateJARM(decrypted);
			}
			if (params.state && !checks.state) throw new TypeError("checks.state argument is missing");
			if (!params.state && checks.state) throw new RPError({
				message: "state missing from the response",
				checks,
				params
			});
			if (checks.state !== params.state) throw new RPError({
				printf: [
					"state mismatch, expected %s, got: %s",
					checks.state,
					params.state
				],
				checks,
				params
			});
			if ("iss" in params) {
				assertIssuerConfiguration(this.issuer, "issuer");
				if (params.iss !== this.issuer.issuer) throw new RPError({
					printf: [
						"iss mismatch, expected %s, got: %s",
						this.issuer.issuer,
						params.iss
					],
					params
				});
			} else if (this.issuer.authorization_response_iss_parameter_supported && !("id_token" in params) && !("response" in parameters)) throw new RPError({
				message: "iss missing from the response",
				params
			});
			if (params.error) throw new OPError(params);
			if (typeof params.id_token === "string" && params.id_token.length) throw new RPError({
				message: "id_token detected in the response, you must use client.callback() instead of client.oauthCallback()",
				params
			});
			delete params.id_token;
			const RESPONSE_TYPE_REQUIRED_PARAMS = {
				code: ["code"],
				token: ["access_token", "token_type"]
			};
			if (checks.response_type) for (const type of checks.response_type.split(" ")) {
				if (type === "none") {
					if (params.code || params.id_token || params.access_token) throw new RPError({
						message: "unexpected params encountered for \"none\" response",
						checks,
						params
					});
				}
				if (RESPONSE_TYPE_REQUIRED_PARAMS[type]) {
					for (const param of RESPONSE_TYPE_REQUIRED_PARAMS[type]) if (!params[param]) throw new RPError({
						message: `${param} missing from response`,
						checks,
						params
					});
				}
			}
			if (params.code) {
				const tokenset = await this.grant({
					...exchangeBody,
					grant_type: "authorization_code",
					code: params.code,
					redirect_uri: redirectUri,
					code_verifier: checks.code_verifier
				}, {
					clientAssertionPayload,
					DPoP
				});
				if (typeof tokenset.id_token === "string" && tokenset.id_token.length) throw new RPError({
					message: "id_token detected in the response, you must use client.callback() instead of client.oauthCallback()",
					params
				});
				delete tokenset.id_token;
				return tokenset;
			}
			return new TokenSet(params);
		}
		async decryptIdToken(token) {
			if (!this.id_token_encrypted_response_alg) return token;
			let idToken = token;
			if (idToken instanceof TokenSet) {
				if (!idToken.id_token) throw new TypeError("id_token not present in TokenSet");
				idToken = idToken.id_token;
			}
			const expectedAlg = this.id_token_encrypted_response_alg;
			const expectedEnc = this.id_token_encrypted_response_enc;
			const result = await this.decryptJWE(idToken, expectedAlg, expectedEnc);
			if (token instanceof TokenSet) {
				token.id_token = result;
				return token;
			}
			return result;
		}
		async validateJWTUserinfo(body) {
			const expectedAlg = this.userinfo_signed_response_alg;
			return this.validateJWT(body, expectedAlg, []);
		}
		async decryptJARM(response) {
			if (!this.authorization_encrypted_response_alg) return response;
			const expectedAlg = this.authorization_encrypted_response_alg;
			const expectedEnc = this.authorization_encrypted_response_enc;
			return this.decryptJWE(response, expectedAlg, expectedEnc);
		}
		async decryptJWTUserinfo(body) {
			if (!this.userinfo_encrypted_response_alg) return body;
			const expectedAlg = this.userinfo_encrypted_response_alg;
			const expectedEnc = this.userinfo_encrypted_response_enc;
			return this.decryptJWE(body, expectedAlg, expectedEnc);
		}
		async decryptJWE(jwe, expectedAlg, expectedEnc = "A128CBC-HS256") {
			const header = JSON.parse(base64url.decode(jwe.split(".")[0]));
			if (header.alg !== expectedAlg) throw new RPError({
				printf: [
					"unexpected JWE alg received, expected %s, got: %s",
					expectedAlg,
					header.alg
				],
				jwt: jwe
			});
			if (header.enc !== expectedEnc) throw new RPError({
				printf: [
					"unexpected JWE enc received, expected %s, got: %s",
					expectedEnc,
					header.enc
				],
				jwt: jwe
			});
			const getPlaintext = (result) => new TextDecoder().decode(result.plaintext);
			let plaintext;
			if (expectedAlg.match(/^(?:RSA|ECDH)/)) {
				const keystore = await keystores.get(this);
				const protectedHeader = jose.decodeProtectedHeader(jwe);
				for (const key of keystore.all({
					...protectedHeader,
					use: "enc"
				})) {
					plaintext = await jose.compactDecrypt(jwe, await key.keyObject(protectedHeader.alg)).then(getPlaintext, () => {});
					if (plaintext) break;
				}
			} else plaintext = await jose.compactDecrypt(jwe, this.secretForAlg(expectedAlg === "dir" ? expectedEnc : expectedAlg)).then(getPlaintext, () => {});
			if (!plaintext) throw new RPError({
				message: "failed to decrypt JWE",
				jwt: jwe
			});
			return plaintext;
		}
		async validateIdToken(tokenSet, nonce, returnedBy, maxAge, state) {
			let idToken = tokenSet;
			const expectedAlg = this.id_token_signed_response_alg;
			if (idToken instanceof TokenSet) {
				if (!idToken.id_token) throw new TypeError("id_token not present in TokenSet");
				idToken = idToken.id_token;
			}
			idToken = String(idToken);
			const timestamp = now();
			const { protected: header, payload, key } = await this.validateJWT(idToken, expectedAlg);
			if (typeof maxAge === "number" || maxAge !== skipMaxAgeCheck && this.require_auth_time) {
				if (!payload.auth_time) throw new RPError({
					message: "missing required JWT property auth_time",
					jwt: idToken
				});
				if (typeof payload.auth_time !== "number") throw new RPError({
					message: "JWT auth_time claim must be a JSON numeric value",
					jwt: idToken
				});
			}
			if (typeof maxAge === "number" && payload.auth_time + maxAge < timestamp - this[CLOCK_TOLERANCE]) throw new RPError({
				printf: [
					"too much time has elapsed since the last End-User authentication, max_age %i, auth_time: %i, now %i",
					maxAge,
					payload.auth_time,
					timestamp - this[CLOCK_TOLERANCE]
				],
				now: timestamp,
				tolerance: this[CLOCK_TOLERANCE],
				auth_time: payload.auth_time,
				jwt: idToken
			});
			if (nonce !== skipNonceCheck && (payload.nonce || nonce !== void 0) && payload.nonce !== nonce) throw new RPError({
				printf: [
					"nonce mismatch, expected %s, got: %s",
					nonce,
					payload.nonce
				],
				jwt: idToken
			});
			if (returnedBy === "authorization") {
				if (!payload.at_hash && tokenSet.access_token) throw new RPError({
					message: "missing required property at_hash",
					jwt: idToken
				});
				if (!payload.c_hash && tokenSet.code) throw new RPError({
					message: "missing required property c_hash",
					jwt: idToken
				});
				if (this.fapi1()) {
					if (!payload.s_hash && (tokenSet.state || state)) throw new RPError({
						message: "missing required property s_hash",
						jwt: idToken
					});
				}
				if (payload.s_hash) {
					if (!state) throw new TypeError("cannot verify s_hash, \"checks.state\" property not provided");
					try {
						tokenHash.validate({
							claim: "s_hash",
							source: "state"
						}, payload.s_hash, state, header.alg, key.jwk && key.jwk.crv);
					} catch (err) {
						throw new RPError({
							message: err.message,
							jwt: idToken
						});
					}
				}
			}
			if (this.fapi() && payload.iat < timestamp - 3600) throw new RPError({
				printf: [
					"JWT issued too far in the past, now %i, iat %i",
					timestamp,
					payload.iat
				],
				now: timestamp,
				tolerance: this[CLOCK_TOLERANCE],
				iat: payload.iat,
				jwt: idToken
			});
			if (tokenSet.access_token && payload.at_hash !== void 0) try {
				tokenHash.validate({
					claim: "at_hash",
					source: "access_token"
				}, payload.at_hash, tokenSet.access_token, header.alg, key.jwk && key.jwk.crv);
			} catch (err) {
				throw new RPError({
					message: err.message,
					jwt: idToken
				});
			}
			if (tokenSet.code && payload.c_hash !== void 0) try {
				tokenHash.validate({
					claim: "c_hash",
					source: "code"
				}, payload.c_hash, tokenSet.code, header.alg, key.jwk && key.jwk.crv);
			} catch (err) {
				throw new RPError({
					message: err.message,
					jwt: idToken
				});
			}
			return tokenSet;
		}
		async validateJWT(jwt, expectedAlg, required = [
			"iss",
			"sub",
			"aud",
			"exp",
			"iat"
		]) {
			const isSelfIssued = this.issuer.issuer === "https://self-issued.me";
			const timestamp = now();
			let header;
			let payload;
			try {
				({header, payload} = decodeJWT(jwt, { complete: true }));
			} catch (err) {
				throw new RPError({
					printf: [
						"failed to decode JWT (%s: %s)",
						err.name,
						err.message
					],
					jwt
				});
			}
			if (header.alg !== expectedAlg) throw new RPError({
				printf: [
					"unexpected JWT alg received, expected %s, got: %s",
					expectedAlg,
					header.alg
				],
				jwt
			});
			if (isSelfIssued) required = [...required, "sub_jwk"];
			required.forEach(verifyPresence.bind(void 0, payload, jwt));
			if (payload.iss !== void 0) {
				let expectedIss = this.issuer.issuer;
				if (this.#aadIssValidation) expectedIss = this.issuer.issuer.replace("{tenantid}", payload.tid);
				if (payload.iss !== expectedIss) throw new RPError({
					printf: [
						"unexpected iss value, expected %s, got: %s",
						expectedIss,
						payload.iss
					],
					jwt
				});
			}
			if (payload.iat !== void 0) {
				if (typeof payload.iat !== "number") throw new RPError({
					message: "JWT iat claim must be a JSON numeric value",
					jwt
				});
			}
			if (payload.nbf !== void 0) {
				if (typeof payload.nbf !== "number") throw new RPError({
					message: "JWT nbf claim must be a JSON numeric value",
					jwt
				});
				if (payload.nbf > timestamp + this[CLOCK_TOLERANCE]) throw new RPError({
					printf: [
						"JWT not active yet, now %i, nbf %i",
						timestamp + this[CLOCK_TOLERANCE],
						payload.nbf
					],
					now: timestamp,
					tolerance: this[CLOCK_TOLERANCE],
					nbf: payload.nbf,
					jwt
				});
			}
			if (payload.exp !== void 0) {
				if (typeof payload.exp !== "number") throw new RPError({
					message: "JWT exp claim must be a JSON numeric value",
					jwt
				});
				if (timestamp - this[CLOCK_TOLERANCE] >= payload.exp) throw new RPError({
					printf: [
						"JWT expired, now %i, exp %i",
						timestamp - this[CLOCK_TOLERANCE],
						payload.exp
					],
					now: timestamp,
					tolerance: this[CLOCK_TOLERANCE],
					exp: payload.exp,
					jwt
				});
			}
			if (payload.aud !== void 0) {
				if (Array.isArray(payload.aud)) {
					if (payload.aud.length > 1 && !payload.azp) throw new RPError({
						message: "missing required JWT property azp",
						jwt
					});
					if (!payload.aud.includes(this.client_id)) throw new RPError({
						printf: [
							"aud is missing the client_id, expected %s to be included in %j",
							this.client_id,
							payload.aud
						],
						jwt
					});
				} else if (payload.aud !== this.client_id) throw new RPError({
					printf: [
						"aud mismatch, expected %s, got: %s",
						this.client_id,
						payload.aud
					],
					jwt
				});
			}
			if (payload.azp !== void 0) {
				let additionalAuthorizedParties = this.#additionalAuthorizedParties;
				if (typeof additionalAuthorizedParties === "string") additionalAuthorizedParties = [this.client_id, additionalAuthorizedParties];
				else if (Array.isArray(additionalAuthorizedParties)) additionalAuthorizedParties = [this.client_id, ...additionalAuthorizedParties];
				else additionalAuthorizedParties = [this.client_id];
				if (!additionalAuthorizedParties.includes(payload.azp)) throw new RPError({
					printf: ["azp mismatch, got: %s", payload.azp],
					jwt
				});
			}
			let keys;
			if (isSelfIssued) {
				try {
					assert(isPlainObject(payload.sub_jwk));
					const key = await jose.importJWK(payload.sub_jwk, header.alg);
					assert.equal(key.type, "public");
					keys = [{ keyObject() {
						return key;
					} }];
				} catch (err) {
					throw new RPError({
						message: "failed to use sub_jwk claim as an asymmetric JSON Web Key",
						jwt
					});
				}
				if (await jose.calculateJwkThumbprint(payload.sub_jwk) !== payload.sub) throw new RPError({
					message: "failed to match the subject with sub_jwk",
					jwt
				});
			} else if (header.alg.startsWith("HS")) keys = [this.secretForAlg(header.alg)];
			else if (header.alg !== "none") keys = await queryKeyStore.call(this.issuer, {
				...header,
				use: "sig"
			});
			if (!keys && header.alg === "none") return {
				protected: header,
				payload
			};
			for (const key of keys) {
				const verified = await jose.compactVerify(jwt, key instanceof Uint8Array ? key : await key.keyObject(header.alg)).catch(() => {});
				if (verified) return {
					payload,
					protected: verified.protectedHeader,
					key
				};
			}
			throw new RPError({
				message: "failed to validate JWT signature",
				jwt
			});
		}
		async refresh(refreshToken, { exchangeBody, clientAssertionPayload, DPoP } = {}) {
			let token = refreshToken;
			if (token instanceof TokenSet) {
				if (!token.refresh_token) throw new TypeError("refresh_token not present in TokenSet");
				token = token.refresh_token;
			}
			const tokenset = await this.grant({
				...exchangeBody,
				grant_type: "refresh_token",
				refresh_token: String(token)
			}, {
				clientAssertionPayload,
				DPoP
			});
			if (tokenset.id_token) {
				await this.decryptIdToken(tokenset);
				await this.validateIdToken(tokenset, skipNonceCheck, "token", skipMaxAgeCheck);
				if (refreshToken instanceof TokenSet && refreshToken.id_token) {
					const expectedSub = refreshToken.claims().sub;
					const actualSub = tokenset.claims().sub;
					if (actualSub !== expectedSub) throw new RPError({
						printf: [
							"sub mismatch, expected %s, got: %s",
							expectedSub,
							actualSub
						],
						jwt: tokenset.id_token
					});
				}
			}
			return tokenset;
		}
		async requestResource(resourceUrl, accessToken, { method, headers, body, DPoP, tokenType = DPoP ? "DPoP" : accessToken instanceof TokenSet ? accessToken.token_type : "Bearer" } = {}, retry) {
			if (accessToken instanceof TokenSet) {
				if (!accessToken.access_token) throw new TypeError("access_token not present in TokenSet");
				accessToken = accessToken.access_token;
			}
			if (!accessToken) throw new TypeError("no access token provided");
			else if (typeof accessToken !== "string") throw new TypeError("invalid access token provided");
			const requestOpts = {
				headers: {
					Authorization: authorizationHeaderValue(accessToken, tokenType),
					...headers
				},
				body
			};
			const mTLS = !!this.tls_client_certificate_bound_access_tokens;
			const response = await request.call(this, {
				...requestOpts,
				responseType: "buffer",
				method,
				url: resourceUrl
			}, {
				accessToken,
				mTLS,
				DPoP
			});
			const wwwAuthenticate = response.headers["www-authenticate"];
			if (retry !== retryAttempt && wwwAuthenticate && wwwAuthenticate.toLowerCase().startsWith("dpop ") && parseWwwAuthenticate(wwwAuthenticate).error === "use_dpop_nonce") return this.requestResource(resourceUrl, accessToken, {
				method,
				headers,
				body,
				DPoP,
				tokenType
			});
			return response;
		}
		async userinfo(accessToken, { method = "GET", via = "header", tokenType, params, DPoP } = {}) {
			assertIssuerConfiguration(this.issuer, "userinfo_endpoint");
			const options = {
				tokenType,
				method: String(method).toUpperCase(),
				DPoP
			};
			if (options.method !== "GET" && options.method !== "POST") throw new TypeError("#userinfo() method can only be POST or a GET");
			if (via === "body" && options.method !== "POST") throw new TypeError("can only send body on POST");
			const jwt = !!(this.userinfo_signed_response_alg || this.userinfo_encrypted_response_alg);
			if (jwt) options.headers = { Accept: "application/jwt" };
			else options.headers = { Accept: "application/json" };
			const mTLS = !!this.tls_client_certificate_bound_access_tokens;
			let targetUrl;
			if (mTLS && this.issuer.mtls_endpoint_aliases) targetUrl = this.issuer.mtls_endpoint_aliases.userinfo_endpoint;
			targetUrl = new URL$3(targetUrl || this.issuer.userinfo_endpoint);
			if (via === "body") {
				options.headers.Authorization = void 0;
				options.headers["Content-Type"] = "application/x-www-form-urlencoded";
				options.body = new URLSearchParams$1();
				options.body.append("access_token", accessToken instanceof TokenSet ? accessToken.access_token : accessToken);
			}
			if (params) if (options.method === "GET") Object.entries(params).forEach(([key, value]) => {
				targetUrl.searchParams.append(key, value);
			});
			else if (options.body) Object.entries(params).forEach(([key, value]) => {
				options.body.append(key, value);
			});
			else {
				options.body = new URLSearchParams$1();
				options.headers["Content-Type"] = "application/x-www-form-urlencoded";
				Object.entries(params).forEach(([key, value]) => {
					options.body.append(key, value);
				});
			}
			if (options.body) options.body = options.body.toString();
			const response = await this.requestResource(targetUrl, accessToken, options);
			let parsed = processResponse(response, { bearer: true });
			if (jwt) {
				if (!/^application\/jwt/.test(response.headers["content-type"])) throw new RPError({
					message: "expected application/jwt response from the userinfo_endpoint",
					response
				});
				const body = response.body.toString();
				const userinfo = await this.decryptJWTUserinfo(body);
				if (!this.userinfo_signed_response_alg) try {
					parsed = JSON.parse(userinfo);
					assert(isPlainObject(parsed));
				} catch (err) {
					throw new RPError({
						message: "failed to parse userinfo JWE payload as JSON",
						jwt: userinfo
					});
				}
				else ({payload: parsed} = await this.validateJWTUserinfo(userinfo));
			} else try {
				parsed = JSON.parse(response.body);
			} catch (err) {
				Object.defineProperty(err, "response", { value: response });
				throw err;
			}
			if (accessToken instanceof TokenSet && accessToken.id_token) {
				const expectedSub = accessToken.claims().sub;
				if (parsed.sub !== expectedSub) throw new RPError({
					printf: [
						"userinfo sub mismatch, expected %s, got: %s",
						expectedSub,
						parsed.sub
					],
					body: parsed,
					jwt: accessToken.id_token
				});
			}
			return parsed;
		}
		encryptionSecret(len) {
			const hash = len <= 256 ? "sha256" : len <= 384 ? "sha384" : len <= 512 ? "sha512" : false;
			if (!hash) throw new Error("unsupported symmetric encryption key derivation");
			return crypto$1.createHash(hash).update(this.client_secret).digest().slice(0, len / 8);
		}
		secretForAlg(alg) {
			if (!this.client_secret) throw new TypeError("client_secret is required");
			if (/^A(\d{3})(?:GCM)?KW$/.test(alg)) return this.encryptionSecret(parseInt(RegExp.$1, 10));
			if (/^A(\d{3})(?:GCM|CBC-HS(\d{3}))$/.test(alg)) return this.encryptionSecret(parseInt(RegExp.$2 || RegExp.$1, 10));
			return new TextEncoder().encode(this.client_secret);
		}
		async grant(body, { clientAssertionPayload, DPoP } = {}, retry) {
			assertIssuerConfiguration(this.issuer, "token_endpoint");
			const response = await authenticatedPost.call(this, "token", {
				form: body,
				responseType: "json"
			}, {
				clientAssertionPayload,
				DPoP
			});
			let responseBody;
			try {
				responseBody = processResponse(response);
			} catch (err) {
				if (retry !== retryAttempt && err instanceof OPError && err.error === "use_dpop_nonce") return this.grant(body, {
					clientAssertionPayload,
					DPoP
				}, retryAttempt);
				throw err;
			}
			return new TokenSet(responseBody);
		}
		async deviceAuthorization(params = {}, { exchangeBody, clientAssertionPayload, DPoP } = {}) {
			assertIssuerConfiguration(this.issuer, "device_authorization_endpoint");
			assertIssuerConfiguration(this.issuer, "token_endpoint");
			const body = authorizationParams.call(this, {
				client_id: this.client_id,
				redirect_uri: null,
				response_type: null,
				...params
			});
			const responseBody = processResponse(await authenticatedPost.call(this, "device_authorization", {
				responseType: "json",
				form: body
			}, {
				clientAssertionPayload,
				endpointAuthMethod: "token"
			}));
			return new DeviceFlowHandle({
				client: this,
				exchangeBody,
				clientAssertionPayload,
				response: responseBody,
				maxAge: params.max_age,
				DPoP
			});
		}
		async revoke(token, hint, { revokeBody, clientAssertionPayload } = {}) {
			assertIssuerConfiguration(this.issuer, "revocation_endpoint");
			if (hint !== void 0 && typeof hint !== "string") throw new TypeError("hint must be a string");
			const form = {
				...revokeBody,
				token
			};
			if (hint) form.token_type_hint = hint;
			processResponse(await authenticatedPost.call(this, "revocation", { form }, { clientAssertionPayload }), { body: false });
		}
		async introspect(token, hint, { introspectBody, clientAssertionPayload } = {}) {
			assertIssuerConfiguration(this.issuer, "introspection_endpoint");
			if (hint !== void 0 && typeof hint !== "string") throw new TypeError("hint must be a string");
			const form = {
				...introspectBody,
				token
			};
			if (hint) form.token_type_hint = hint;
			return processResponse(await authenticatedPost.call(this, "introspection", {
				form,
				responseType: "json"
			}, { clientAssertionPayload }));
		}
		static async register(metadata, options = {}) {
			const { initialAccessToken, jwks, ...clientOptions } = options;
			assertIssuerConfiguration(this.issuer, "registration_endpoint");
			if (jwks !== void 0 && !(metadata.jwks || metadata.jwks_uri)) metadata.jwks = (await getKeystore.call(this, jwks)).toJWKS();
			const responseBody = processResponse(await request.call(this, {
				headers: {
					Accept: "application/json",
					...initialAccessToken ? { Authorization: authorizationHeaderValue(initialAccessToken) } : void 0
				},
				responseType: "json",
				json: metadata,
				url: this.issuer.registration_endpoint,
				method: "POST"
			}), {
				statusCode: 201,
				bearer: true
			});
			return new this(responseBody, jwks, clientOptions);
		}
		get metadata() {
			return clone(Object.fromEntries(this.#metadata.entries()));
		}
		static async fromUri(registrationClientUri, registrationAccessToken, jwks, clientOptions) {
			const responseBody = processResponse(await request.call(this, {
				method: "GET",
				url: registrationClientUri,
				responseType: "json",
				headers: {
					Authorization: authorizationHeaderValue(registrationAccessToken),
					Accept: "application/json"
				}
			}), { bearer: true });
			return new this(responseBody, jwks, clientOptions);
		}
		async requestObject(requestObject = {}, { sign: signingAlgorithm = this.request_object_signing_alg || "none", encrypt: { alg: eKeyManagement = this.request_object_encryption_alg, enc: eContentEncryption = this.request_object_encryption_enc || "A128CBC-HS256" } = {} } = {}) {
			if (!isPlainObject(requestObject)) throw new TypeError("requestObject must be a plain object");
			let signed;
			let key;
			const unix = now();
			const header = {
				alg: signingAlgorithm,
				typ: "oauth-authz-req+jwt"
			};
			const payload = JSON.stringify(defaults({}, requestObject, {
				iss: this.client_id,
				aud: this.issuer.issuer,
				client_id: this.client_id,
				jti: random(),
				iat: unix,
				exp: unix + 300,
				...this.fapi() ? { nbf: unix } : void 0
			}));
			if (signingAlgorithm === "none") signed = [
				base64url.encode(JSON.stringify(header)),
				base64url.encode(payload),
				""
			].join(".");
			else {
				const symmetric = signingAlgorithm.startsWith("HS");
				if (symmetric) key = this.secretForAlg(signingAlgorithm);
				else {
					const keystore = await keystores.get(this);
					if (!keystore) throw new TypeError(`no keystore present for client, cannot sign using alg ${signingAlgorithm}`);
					key = keystore.get({
						alg: signingAlgorithm,
						use: "sig"
					});
					if (!key) throw new TypeError(`no key to sign with found for alg ${signingAlgorithm}`);
				}
				signed = await new jose.CompactSign(new TextEncoder().encode(payload)).setProtectedHeader({
					...header,
					kid: symmetric ? void 0 : key.jwk.kid
				}).sign(symmetric ? key : await key.keyObject(signingAlgorithm));
			}
			if (!eKeyManagement) return signed;
			const fields = {
				alg: eKeyManagement,
				enc: eContentEncryption,
				cty: "oauth-authz-req+jwt"
			};
			if (fields.alg.match(/^(RSA|ECDH)/)) [key] = await queryKeyStore.call(this.issuer, {
				alg: fields.alg,
				use: "enc"
			}, { allowMulti: true });
			else key = this.secretForAlg(fields.alg === "dir" ? fields.enc : fields.alg);
			return new jose.CompactEncrypt(new TextEncoder().encode(signed)).setProtectedHeader({
				...fields,
				kid: key instanceof Uint8Array ? void 0 : key.jwk.kid
			}).encrypt(key instanceof Uint8Array ? key : await key.keyObject(fields.alg));
		}
		async pushedAuthorizationRequest(params = {}, { clientAssertionPayload } = {}) {
			assertIssuerConfiguration(this.issuer, "pushed_authorization_request_endpoint");
			const body = {
				..."request" in params ? params : authorizationParams.call(this, params),
				client_id: this.client_id
			};
			const response = await authenticatedPost.call(this, "pushed_authorization_request", {
				responseType: "json",
				form: body
			}, {
				clientAssertionPayload,
				endpointAuthMethod: "token"
			});
			const responseBody = processResponse(response, { statusCode: 201 });
			if (!("expires_in" in responseBody)) throw new RPError({
				message: "expected expires_in in Pushed Authorization Successful Response",
				response
			});
			if (typeof responseBody.expires_in !== "number") throw new RPError({
				message: "invalid expires_in value in Pushed Authorization Successful Response",
				response
			});
			if (!("request_uri" in responseBody)) throw new RPError({
				message: "expected request_uri in Pushed Authorization Successful Response",
				response
			});
			if (typeof responseBody.request_uri !== "string") throw new RPError({
				message: "invalid request_uri value in Pushed Authorization Successful Response",
				response
			});
			return responseBody;
		}
		get issuer() {
			return this.#issuer;
		}
		/* istanbul ignore next */
		[inspect$1.custom]() {
			return `${this.constructor.name} ${inspect$1(this.metadata, {
				depth: Infinity,
				colors: process.stdout.isTTY,
				compact: false,
				sorted: true
			})}`;
		}
		fapi() {
			return this.fapi1() || this.fapi2();
		}
		fapi1() {
			return this.constructor.name === "FAPI1Client";
		}
		fapi2() {
			return this.constructor.name === "FAPI2Client";
		}
		async validateJARM(response) {
			const expectedAlg = this.authorization_signed_response_alg;
			const { payload } = await this.validateJWT(response, expectedAlg, [
				"iss",
				"exp",
				"aud"
			]);
			return pickCb(payload);
		}
		/**
		* @name dpopProof
		* @api private
		*/
		async dpopProof(payload, privateKeyInput, accessToken) {
			if (!isPlainObject(payload)) throw new TypeError("payload must be a plain object");
			let privateKey;
			if (isKeyObject(privateKeyInput)) privateKey = privateKeyInput;
			else if (privateKeyInput[Symbol.toStringTag] === "CryptoKey") privateKey = privateKeyInput;
			else if (jose.cryptoRuntime === "node:crypto") privateKey = crypto$1.createPrivateKey(privateKeyInput);
			else throw new TypeError("unrecognized crypto runtime");
			if (privateKey.type !== "private") throw new TypeError("\"DPoP\" option must be a private key");
			let alg = determineDPoPAlgorithm.call(this, privateKey, privateKeyInput);
			if (!alg) throw new TypeError("could not determine DPoP JWS Algorithm");
			return new jose.SignJWT({
				ath: accessToken ? base64url.encode(crypto$1.createHash("sha256").update(accessToken).digest()) : void 0,
				...payload
			}).setProtectedHeader({
				alg,
				typ: "dpop+jwt",
				jwk: await getJwk(privateKey, privateKeyInput)
			}).setIssuedAt().setJti(random()).sign(privateKey);
		}
	};
	function determineDPoPAlgorithmFromCryptoKey(cryptoKey) {
		switch (cryptoKey.algorithm.name) {
			case "Ed25519":
			case "Ed448": return "EdDSA";
			case "ECDSA":
				switch (cryptoKey.algorithm.namedCurve) {
					case "P-256": return "ES256";
					case "P-384": return "ES384";
					case "P-521": return "ES512";
					default: break;
				}
				break;
			case "RSASSA-PKCS1-v1_5": return `RS${cryptoKey.algorithm.hash.name.slice(4)}`;
			case "RSA-PSS": return `PS${cryptoKey.algorithm.hash.name.slice(4)}`;
			default: throw new TypeError("unsupported DPoP private key");
		}
	}
	var determineDPoPAlgorithm;
	if (jose.cryptoRuntime === "node:crypto") {
		determineDPoPAlgorithm = function(privateKey, privateKeyInput) {
			if (privateKeyInput[Symbol.toStringTag] === "CryptoKey") return determineDPoPAlgorithmFromCryptoKey(privateKey);
			switch (privateKey.asymmetricKeyType) {
				case "ed25519":
				case "ed448": return "EdDSA";
				case "ec": return determineEcAlgorithm(privateKey, privateKeyInput);
				case "rsa":
				case rsaPssParams && "rsa-pss": return determineRsaAlgorithm(privateKey, privateKeyInput, this.issuer.dpop_signing_alg_values_supported);
				default: throw new TypeError("unsupported DPoP private key");
			}
		};
		const RSPS = /^(?:RS|PS)(?:256|384|512)$/;
		function determineRsaAlgorithm(privateKey, privateKeyInput, valuesSupported) {
			if (typeof privateKeyInput === "object" && privateKeyInput.format === "jwk" && privateKeyInput.key && privateKeyInput.key.alg) return privateKeyInput.key.alg;
			if (Array.isArray(valuesSupported)) {
				let candidates = valuesSupported.filter(RegExp.prototype.test.bind(RSPS));
				if (privateKey.asymmetricKeyType === "rsa-pss") candidates = candidates.filter((value) => value.startsWith("PS"));
				return [
					"PS256",
					"PS384",
					"PS512",
					"RS256",
					"RS384",
					"RS384"
				].find((preferred) => candidates.includes(preferred));
			}
			return "PS256";
		}
		const p256 = Buffer.from([
			42,
			134,
			72,
			206,
			61,
			3,
			1,
			7
		]);
		const p384 = Buffer.from([
			43,
			129,
			4,
			0,
			34
		]);
		const p521 = Buffer.from([
			43,
			129,
			4,
			0,
			35
		]);
		const secp256k1 = Buffer.from([
			43,
			129,
			4,
			0,
			10
		]);
		function determineEcAlgorithm(privateKey, privateKeyInput) {
			switch (typeof privateKeyInput === "object" && typeof privateKeyInput.key === "object" && privateKeyInput.key.crv) {
				case "P-256": return "ES256";
				case "secp256k1": return "ES256K";
				case "P-384": return "ES384";
				case "P-512": return "ES512";
				default: break;
			}
			const buf = privateKey.export({
				format: "der",
				type: "pkcs8"
			});
			const i = buf[1] < 128 ? 17 : 18;
			const len = buf[i];
			const curveOid = buf.slice(i + 1, i + 1 + len);
			if (curveOid.equals(p256)) return "ES256";
			if (curveOid.equals(p384)) return "ES384";
			if (curveOid.equals(p521)) return "ES512";
			if (curveOid.equals(secp256k1)) return "ES256K";
			throw new TypeError("unsupported DPoP private key curve");
		}
	} else determineDPoPAlgorithm = determineDPoPAlgorithmFromCryptoKey;
	var jwkCache = /* @__PURE__ */ new WeakMap();
	async function getJwk(keyObject, privateKeyInput) {
		if (jose.cryptoRuntime === "node:crypto" && typeof privateKeyInput === "object" && typeof privateKeyInput.key === "object" && privateKeyInput.format === "jwk") return pick(privateKeyInput.key, "kty", "crv", "x", "y", "e", "n");
		if (jwkCache.has(privateKeyInput)) return jwkCache.get(privateKeyInput);
		const jwk = pick(await jose.exportJWK(keyObject), "kty", "crv", "x", "y", "e", "n");
		if (isKeyObject(privateKeyInput) || jose.cryptoRuntime === "WebCryptoAPI") jwkCache.set(privateKeyInput, jwk);
		return jwk;
	}
	module.exports = (issuer, aadIssValidation = false) => class Client extends BaseClient {
		constructor(...args) {
			super(issuer, aadIssValidation, ...args);
		}
		static get issuer() {
			return issuer;
		}
	};
	module.exports.BaseClient = BaseClient;
}));
//#endregion
//#region node_modules/openid-client/lib/issuer_registry.js
var require_issuer_registry = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = new (require_lru_cache())({ max: 100 });
}));
//#endregion
//#region node_modules/openid-client/lib/helpers/webfinger_normalize.js
var require_webfinger_normalize = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var PORT = /^\d+$/;
	function hasScheme(input) {
		if (input.includes("://")) return true;
		const authority = input.replace(/(\/|\?)/g, "#").split("#")[0];
		if (authority.includes(":")) {
			const index = authority.indexOf(":");
			const hostOrPort = authority.slice(index + 1);
			if (!PORT.test(hostOrPort)) return true;
		}
		return false;
	}
	function acctSchemeAssumed(input) {
		if (!input.includes("@")) return false;
		const parts = input.split("@");
		const host = parts[parts.length - 1];
		return !(host.includes(":") || host.includes("/") || host.includes("?"));
	}
	function normalize(input) {
		if (typeof input !== "string") throw new TypeError("input must be a string");
		let output;
		if (hasScheme(input)) output = input;
		else if (acctSchemeAssumed(input)) output = `acct:${input}`;
		else output = `https://${input}`;
		return output.split("#")[0];
	}
	module.exports = normalize;
}));
//#endregion
//#region node_modules/openid-client/lib/issuer.js
var require_issuer = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { inspect } = __require("util");
	var url$1 = __require("url");
	var { RPError } = require_errors();
	var getClient = require_client$1();
	var registry = require_issuer_registry();
	var processResponse = require_process_response();
	var webfingerNormalize = require_webfinger_normalize();
	var request = require_request();
	var clone = require_deep_clone();
	var { keystore } = require_issuer$1();
	var AAD_MULTITENANT_DISCOVERY = [
		"https://login.microsoftonline.com/common/.well-known/openid-configuration",
		"https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
		"https://login.microsoftonline.com/organizations/v2.0/.well-known/openid-configuration",
		"https://login.microsoftonline.com/consumers/v2.0/.well-known/openid-configuration"
	];
	var AAD_MULTITENANT = Symbol();
	var ISSUER_DEFAULTS = {
		claim_types_supported: ["normal"],
		claims_parameter_supported: false,
		grant_types_supported: ["authorization_code", "implicit"],
		request_parameter_supported: false,
		request_uri_parameter_supported: true,
		require_request_uri_registration: false,
		response_modes_supported: ["query", "fragment"],
		token_endpoint_auth_methods_supported: ["client_secret_basic"]
	};
	var Issuer = class Issuer {
		#metadata;
		constructor(meta = {}) {
			const aadIssValidation = meta[AAD_MULTITENANT];
			delete meta[AAD_MULTITENANT];
			["introspection", "revocation"].forEach((endpoint) => {
				if (meta[`${endpoint}_endpoint`] && meta[`${endpoint}_endpoint_auth_methods_supported`] === void 0 && meta[`${endpoint}_endpoint_auth_signing_alg_values_supported`] === void 0) {
					if (meta.token_endpoint_auth_methods_supported) meta[`${endpoint}_endpoint_auth_methods_supported`] = meta.token_endpoint_auth_methods_supported;
					if (meta.token_endpoint_auth_signing_alg_values_supported) meta[`${endpoint}_endpoint_auth_signing_alg_values_supported`] = meta.token_endpoint_auth_signing_alg_values_supported;
				}
			});
			this.#metadata = /* @__PURE__ */ new Map();
			Object.entries(meta).forEach(([key, value]) => {
				this.#metadata.set(key, value);
				if (!this[key]) Object.defineProperty(this, key, {
					get() {
						return this.#metadata.get(key);
					},
					enumerable: true
				});
			});
			registry.set(this.issuer, this);
			const Client = getClient(this, aadIssValidation);
			Object.defineProperties(this, {
				Client: {
					value: Client,
					enumerable: true
				},
				FAPI1Client: {
					value: class FAPI1Client extends Client {},
					enumerable: true
				},
				FAPI2Client: {
					value: class FAPI2Client extends Client {},
					enumerable: true
				}
			});
		}
		get metadata() {
			return clone(Object.fromEntries(this.#metadata.entries()));
		}
		static async webfinger(input) {
			const resource = webfingerNormalize(input);
			const { host } = url$1.parse(resource);
			const webfingerUrl = `https://${host}/.well-known/webfinger`;
			const body = processResponse(await request.call(this, {
				method: "GET",
				url: webfingerUrl,
				responseType: "json",
				searchParams: {
					resource,
					rel: "http://openid.net/specs/connect/1.0/issuer"
				},
				headers: { Accept: "application/json" }
			}));
			const location = Array.isArray(body.links) && body.links.find((link) => typeof link === "object" && link.rel === "http://openid.net/specs/connect/1.0/issuer" && link.href);
			if (!location) throw new RPError({
				message: "no issuer found in webfinger response",
				body
			});
			if (typeof location.href !== "string" || !location.href.startsWith("https://")) throw new RPError({
				printf: ["invalid issuer location %s", location.href],
				body
			});
			const expectedIssuer = location.href;
			if (registry.has(expectedIssuer)) return registry.get(expectedIssuer);
			const issuer = await this.discover(expectedIssuer);
			if (issuer.issuer !== expectedIssuer) {
				registry.del(issuer.issuer);
				throw new RPError("discovered issuer mismatch, expected %s, got: %s", expectedIssuer, issuer.issuer);
			}
			return issuer;
		}
		static async discover(uri) {
			const wellKnownUri = resolveWellKnownUri(uri);
			const body = processResponse(await request.call(this, {
				method: "GET",
				responseType: "json",
				url: wellKnownUri,
				headers: { Accept: "application/json" }
			}));
			return new Issuer({
				...ISSUER_DEFAULTS,
				...body,
				[AAD_MULTITENANT]: !!AAD_MULTITENANT_DISCOVERY.find((discoveryURL) => wellKnownUri.startsWith(discoveryURL))
			});
		}
		async reloadJwksUri() {
			await keystore.call(this, true);
		}
		/* istanbul ignore next */
		[inspect.custom]() {
			return `${this.constructor.name} ${inspect(this.metadata, {
				depth: Infinity,
				colors: process.stdout.isTTY,
				compact: false,
				sorted: true
			})}`;
		}
	};
	function resolveWellKnownUri(uri) {
		const parsed = url$1.parse(uri);
		if (parsed.pathname.includes("/.well-known/")) return uri;
		else {
			let pathname;
			if (parsed.pathname.endsWith("/")) pathname = `${parsed.pathname}.well-known/openid-configuration`;
			else pathname = `${parsed.pathname}/.well-known/openid-configuration`;
			return url$1.format({
				...parsed,
				pathname
			});
		}
	}
	module.exports = Issuer;
}));
//#endregion
//#region node_modules/openid-client/lib/passport_strategy.js
var require_passport_strategy = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var url = __require("url");
	var { format } = __require("util");
	var cloneDeep = require_deep_clone();
	var { RPError, OPError } = require_errors();
	var { BaseClient } = require_client$1();
	var { random, codeChallenge } = require_generators();
	var pick = require_pick();
	var { resolveResponseType, resolveRedirectUri } = require_client$2();
	function verified(err, user, info = {}) {
		if (err) this.error(err);
		else if (!user) this.fail(info);
		else this.success(user, info);
	}
	function OpenIDConnectStrategy({ client, params = {}, passReqToCallback = false, sessionKey, usePKCE = true, extras = {} } = {}, verify) {
		if (!(client instanceof BaseClient)) throw new TypeError("client must be an instance of openid-client Client");
		if (typeof verify !== "function") throw new TypeError("verify callback must be a function");
		if (!client.issuer || !client.issuer.issuer) throw new TypeError("client must have an issuer with an identifier");
		this._client = client;
		this._issuer = client.issuer;
		this._verify = verify;
		this._passReqToCallback = passReqToCallback;
		this._usePKCE = usePKCE;
		this._key = sessionKey || `oidc:${url.parse(this._issuer.issuer).hostname}`;
		this._params = cloneDeep(params);
		delete this._params.state;
		delete this._params.nonce;
		this._extras = cloneDeep(extras);
		if (!this._params.response_type) this._params.response_type = resolveResponseType.call(client);
		if (!this._params.redirect_uri) this._params.redirect_uri = resolveRedirectUri.call(client);
		if (!this._params.scope) this._params.scope = "openid";
		if (this._usePKCE === true) {
			const supportedMethods = Array.isArray(this._issuer.code_challenge_methods_supported) ? this._issuer.code_challenge_methods_supported : false;
			if (supportedMethods && supportedMethods.includes("S256")) this._usePKCE = "S256";
			else if (supportedMethods && supportedMethods.includes("plain")) this._usePKCE = "plain";
			else if (supportedMethods) throw new TypeError("neither code_challenge_method supported by the client is supported by the issuer");
			else this._usePKCE = "S256";
		} else if (typeof this._usePKCE === "string" && !["plain", "S256"].includes(this._usePKCE)) throw new TypeError(`${this._usePKCE} is not valid/implemented PKCE code_challenge_method`);
		this.name = url.parse(client.issuer.issuer).hostname;
	}
	OpenIDConnectStrategy.prototype.authenticate = function authenticate(req, options) {
		(async () => {
			const client = this._client;
			if (!req.session) throw new TypeError("authentication requires session support");
			const reqParams = client.callbackParams(req);
			const sessionKey = this._key;
			const { 0: parameter, length } = Object.keys(reqParams);
			/**
			* Start authentication request if this has no authorization response parameters or
			* this might a login initiated from a third party as per
			* https://openid.net/specs/openid-connect-core-1_0.html#ThirdPartyInitiatedLogin.
			*/
			if (length === 0 || length === 1 && parameter === "iss") {
				const params = {
					state: random(),
					...this._params,
					...options
				};
				if (!params.nonce && params.response_type.includes("id_token")) params.nonce = random();
				req.session[sessionKey] = pick(params, "nonce", "state", "max_age", "response_type");
				if (this._usePKCE && params.response_type.includes("code")) {
					const verifier = random();
					req.session[sessionKey].code_verifier = verifier;
					switch (this._usePKCE) {
						case "S256":
							params.code_challenge = codeChallenge(verifier);
							params.code_challenge_method = "S256";
							break;
						case "plain":
							params.code_challenge = verifier;
							break;
					}
				}
				this.redirect(client.authorizationUrl(params));
				return;
			}
			const session = req.session[sessionKey];
			if (Object.keys(session || {}).length === 0) throw new Error(format("did not find expected authorization request details in session, req.session[\"%s\"] is %j", sessionKey, session));
			const { state, nonce, max_age: maxAge, code_verifier: codeVerifier, response_type: responseType } = session;
			try {
				delete req.session[sessionKey];
			} catch (err) {}
			const opts = {
				redirect_uri: this._params.redirect_uri,
				...options
			};
			const checks = {
				state,
				nonce,
				max_age: maxAge,
				code_verifier: codeVerifier,
				response_type: responseType
			};
			const tokenset = await client.callback(opts.redirect_uri, reqParams, checks, this._extras);
			const passReq = this._passReqToCallback;
			const loadUserinfo = this._verify.length > (passReq ? 3 : 2) && client.issuer.userinfo_endpoint;
			const args = [tokenset, verified.bind(this)];
			if (loadUserinfo) {
				if (!tokenset.access_token) throw new RPError({
					message: "expected access_token to be returned when asking for userinfo in verify callback",
					tokenset
				});
				const userinfo = await client.userinfo(tokenset);
				args.splice(1, 0, userinfo);
			}
			if (passReq) args.unshift(req);
			this._verify(...args);
		})().catch((error) => {
			if (error instanceof OPError && error.error !== "server_error" && !error.error.startsWith("invalid") || error instanceof RPError) this.fail(error);
			else this.error(error);
		});
	};
	module.exports = OpenIDConnectStrategy;
}));
//#endregion
//#region node_modules/openid-client/lib/index.js
var require_lib = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var Issuer = require_issuer();
	var { OPError, RPError } = require_errors();
	var Strategy = require_passport_strategy();
	var TokenSet = require_token_set();
	var { CLOCK_TOLERANCE, HTTP_OPTIONS } = require_consts();
	var generators = require_generators();
	var { setDefaults } = require_request();
	module.exports = {
		Issuer,
		Strategy,
		TokenSet,
		errors: {
			OPError,
			RPError
		},
		custom: {
			setHttpOptionsDefaults: setDefaults,
			http_options: HTTP_OPTIONS,
			clock_tolerance: CLOCK_TOLERANCE
		},
		generators
	};
}));
//#endregion
//#region node_modules/next-auth/core/lib/oauth/client.js
var require_client = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.openidClient = openidClient;
	var _openidClient = require_lib();
	async function openidClient(options) {
		const provider = options.provider;
		if (provider.httpOptions) _openidClient.custom.setHttpOptionsDefaults(provider.httpOptions);
		let issuer;
		if (provider.wellKnown) issuer = await _openidClient.Issuer.discover(provider.wellKnown);
		else {
			var _provider$authorizati, _provider$token, _provider$userinfo;
			issuer = new _openidClient.Issuer({
				issuer: provider.issuer,
				authorization_endpoint: (_provider$authorizati = provider.authorization) === null || _provider$authorizati === void 0 ? void 0 : _provider$authorizati.url,
				token_endpoint: (_provider$token = provider.token) === null || _provider$token === void 0 ? void 0 : _provider$token.url,
				userinfo_endpoint: (_provider$userinfo = provider.userinfo) === null || _provider$userinfo === void 0 ? void 0 : _provider$userinfo.url,
				jwks_uri: provider.jwks_endpoint
			});
		}
		const client = new issuer.Client({
			client_id: provider.clientId,
			client_secret: provider.clientSecret,
			redirect_uris: [provider.callbackUrl],
			...provider.client
		}, provider.jwks);
		client[_openidClient.custom.clock_tolerance] = 10;
		return client;
	}
}));
//#endregion
//#region node_modules/oauth/lib/sha1.js
var require_sha1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var b64pad = "=";
	function b64_hmac_sha1(k, d) {
		return rstr2b64(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)));
	}
	function rstr_hmac_sha1(key, data) {
		var bkey = rstr2binb(key);
		if (bkey.length > 16) bkey = binb_sha1(bkey, key.length * 8);
		var ipad = Array(16), opad = Array(16);
		for (var i = 0; i < 16; i++) {
			ipad[i] = bkey[i] ^ 909522486;
			opad[i] = bkey[i] ^ 1549556828;
		}
		var hash = binb_sha1(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
		return binb2rstr(binb_sha1(opad.concat(hash), 672));
	}
	function rstr2b64(input) {
		var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var output = "";
		var len = input.length;
		for (var i = 0; i < len; i += 3) {
			var triplet = input.charCodeAt(i) << 16 | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
			for (var j = 0; j < 4; j++) if (i * 8 + j * 6 > input.length * 8) output += b64pad;
			else output += tab.charAt(triplet >>> 6 * (3 - j) & 63);
		}
		return output;
	}
	function str2rstr_utf8(input) {
		var output = "";
		var i = -1;
		var x, y;
		while (++i < input.length) {
			x = input.charCodeAt(i);
			y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
			if (55296 <= x && x <= 56319 && 56320 <= y && y <= 57343) {
				x = 65536 + ((x & 1023) << 10) + (y & 1023);
				i++;
			}
			if (x <= 127) output += String.fromCharCode(x);
			else if (x <= 2047) output += String.fromCharCode(192 | x >>> 6 & 31, 128 | x & 63);
			else if (x <= 65535) output += String.fromCharCode(224 | x >>> 12 & 15, 128 | x >>> 6 & 63, 128 | x & 63);
			else if (x <= 2097151) output += String.fromCharCode(240 | x >>> 18 & 7, 128 | x >>> 12 & 63, 128 | x >>> 6 & 63, 128 | x & 63);
		}
		return output;
	}
	function rstr2binb(input) {
		var output = Array(input.length >> 2);
		for (var i = 0; i < output.length; i++) output[i] = 0;
		for (var i = 0; i < input.length * 8; i += 8) output[i >> 5] |= (input.charCodeAt(i / 8) & 255) << 24 - i % 32;
		return output;
	}
	function binb2rstr(input) {
		var output = "";
		for (var i = 0; i < input.length * 32; i += 8) output += String.fromCharCode(input[i >> 5] >>> 24 - i % 32 & 255);
		return output;
	}
	function binb_sha1(x, len) {
		x[len >> 5] |= 128 << 24 - len % 32;
		x[(len + 64 >> 9 << 4) + 15] = len;
		var w = Array(80);
		var a = 1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d = 271733878;
		var e = -1009589776;
		for (var i = 0; i < x.length; i += 16) {
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;
			var olde = e;
			for (var j = 0; j < 80; j++) {
				if (j < 16) w[j] = x[i + j];
				else w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
				var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
				e = d;
				d = c;
				c = bit_rol(b, 30);
				b = a;
				a = t;
			}
			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
			e = safe_add(e, olde);
		}
		return Array(a, b, c, d, e);
	}
	function sha1_ft(t, b, c, d) {
		if (t < 20) return b & c | ~b & d;
		if (t < 40) return b ^ c ^ d;
		if (t < 60) return b & c | b & d | c & d;
		return b ^ c ^ d;
	}
	function sha1_kt(t) {
		return t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514;
	}
	function safe_add(x, y) {
		var lsw = (x & 65535) + (y & 65535);
		return (x >> 16) + (y >> 16) + (lsw >> 16) << 16 | lsw & 65535;
	}
	function bit_rol(num, cnt) {
		return num << cnt | num >>> 32 - cnt;
	}
	exports.HMACSHA1 = function(key, data) {
		return b64_hmac_sha1(key, data);
	};
}));
//#endregion
//#region node_modules/oauth/lib/_utils.js
var require__utils = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports.isAnEarlyCloseHost = function(hostName) {
		return hostName && hostName.match(".*google(apis)?.com$");
	};
}));
//#endregion
//#region node_modules/oauth/lib/oauth.js
var require_oauth$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var crypto = __require("crypto"), sha1 = require_sha1(), http$1 = __require("http"), https$1 = __require("https"), URL$2 = __require("url"), querystring$1 = __require("querystring"), OAuthUtils$1 = require__utils();
	exports.OAuth = function(requestUrl, accessUrl, consumerKey, consumerSecret, version, authorize_callback, signatureMethod, nonceSize, customHeaders) {
		this._isEcho = false;
		this._requestUrl = requestUrl;
		this._accessUrl = accessUrl;
		this._consumerKey = consumerKey;
		this._consumerSecret = this._encodeData(consumerSecret);
		if (signatureMethod == "RSA-SHA1") this._privateKey = consumerSecret;
		this._version = version;
		if (authorize_callback === void 0) this._authorize_callback = "oob";
		else this._authorize_callback = authorize_callback;
		if (signatureMethod != "PLAINTEXT" && signatureMethod != "HMAC-SHA1" && signatureMethod != "RSA-SHA1") throw new Error("Un-supported signature method: " + signatureMethod);
		this._signatureMethod = signatureMethod;
		this._nonceSize = nonceSize || 32;
		this._headers = customHeaders || {
			"Accept": "*/*",
			"Connection": "close",
			"User-Agent": "Node authentication"
		};
		this._clientOptions = this._defaultClientOptions = {
			"requestTokenHttpMethod": "POST",
			"accessTokenHttpMethod": "POST",
			"followRedirects": true
		};
		this._oauthParameterSeperator = ",";
	};
	exports.OAuthEcho = function(realm, verify_credentials, consumerKey, consumerSecret, version, signatureMethod, nonceSize, customHeaders) {
		this._isEcho = true;
		this._realm = realm;
		this._verifyCredentials = verify_credentials;
		this._consumerKey = consumerKey;
		this._consumerSecret = this._encodeData(consumerSecret);
		if (signatureMethod == "RSA-SHA1") this._privateKey = consumerSecret;
		this._version = version;
		if (signatureMethod != "PLAINTEXT" && signatureMethod != "HMAC-SHA1" && signatureMethod != "RSA-SHA1") throw new Error("Un-supported signature method: " + signatureMethod);
		this._signatureMethod = signatureMethod;
		this._nonceSize = nonceSize || 32;
		this._headers = customHeaders || {
			"Accept": "*/*",
			"Connection": "close",
			"User-Agent": "Node authentication"
		};
		this._oauthParameterSeperator = ",";
	};
	exports.OAuthEcho.prototype = exports.OAuth.prototype;
	exports.OAuth.prototype._getTimestamp = function() {
		return Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3);
	};
	exports.OAuth.prototype._encodeData = function(toEncode) {
		if (toEncode == null || toEncode == "") return "";
		else return encodeURIComponent(toEncode).replace(/\!/g, "%21").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
	};
	exports.OAuth.prototype._decodeData = function(toDecode) {
		if (toDecode != null) toDecode = toDecode.replace(/\+/g, " ");
		return decodeURIComponent(toDecode);
	};
	exports.OAuth.prototype._getSignature = function(method, url, parameters, tokenSecret) {
		var signatureBase = this._createSignatureBase(method, url, parameters);
		return this._createSignature(signatureBase, tokenSecret);
	};
	exports.OAuth.prototype._normalizeUrl = function(url) {
		var parsedUrl = URL$2.parse(url, true);
		var port = "";
		if (parsedUrl.port) {
			if (parsedUrl.protocol == "http:" && parsedUrl.port != "80" || parsedUrl.protocol == "https:" && parsedUrl.port != "443") port = ":" + parsedUrl.port;
		}
		if (!parsedUrl.pathname || parsedUrl.pathname == "") parsedUrl.pathname = "/";
		return parsedUrl.protocol + "//" + parsedUrl.hostname + port + parsedUrl.pathname;
	};
	exports.OAuth.prototype._isParameterNameAnOAuthParameter = function(parameter) {
		var m = parameter.match("^oauth_");
		if (m && m[0] === "oauth_") return true;
		else return false;
	};
	exports.OAuth.prototype._buildAuthorizationHeaders = function(orderedParameters) {
		var authHeader = "OAuth ";
		if (this._isEcho) authHeader += "realm=\"" + this._realm + "\",";
		for (var i = 0; i < orderedParameters.length; i++) if (this._isParameterNameAnOAuthParameter(orderedParameters[i][0])) authHeader += "" + this._encodeData(orderedParameters[i][0]) + "=\"" + this._encodeData(orderedParameters[i][1]) + "\"" + this._oauthParameterSeperator;
		authHeader = authHeader.substring(0, authHeader.length - this._oauthParameterSeperator.length);
		return authHeader;
	};
	exports.OAuth.prototype._makeArrayOfArgumentsHash = function(argumentsHash) {
		var argument_pairs = [];
		for (var key in argumentsHash) if (argumentsHash.hasOwnProperty(key)) {
			var value = argumentsHash[key];
			if (Array.isArray(value)) for (var i = 0; i < value.length; i++) argument_pairs[argument_pairs.length] = [key, value[i]];
			else argument_pairs[argument_pairs.length] = [key, value];
		}
		return argument_pairs;
	};
	exports.OAuth.prototype._sortRequestParams = function(argument_pairs) {
		argument_pairs.sort(function(a, b) {
			if (a[0] == b[0]) return a[1] < b[1] ? -1 : 1;
			else return a[0] < b[0] ? -1 : 1;
		});
		return argument_pairs;
	};
	exports.OAuth.prototype._normaliseRequestParams = function(args) {
		var argument_pairs = this._makeArrayOfArgumentsHash(args);
		for (var i = 0; i < argument_pairs.length; i++) {
			argument_pairs[i][0] = this._encodeData(argument_pairs[i][0]);
			argument_pairs[i][1] = this._encodeData(argument_pairs[i][1]);
		}
		argument_pairs = this._sortRequestParams(argument_pairs);
		var args = "";
		for (var i = 0; i < argument_pairs.length; i++) {
			args += argument_pairs[i][0];
			args += "=";
			args += argument_pairs[i][1];
			if (i < argument_pairs.length - 1) args += "&";
		}
		return args;
	};
	exports.OAuth.prototype._createSignatureBase = function(method, url, parameters) {
		url = this._encodeData(this._normalizeUrl(url));
		parameters = this._encodeData(parameters);
		return method.toUpperCase() + "&" + url + "&" + parameters;
	};
	exports.OAuth.prototype._createSignature = function(signatureBase, tokenSecret) {
		if (tokenSecret === void 0) var tokenSecret = "";
		else tokenSecret = this._encodeData(tokenSecret);
		var key = this._consumerSecret + "&" + tokenSecret;
		var hash = "";
		if (this._signatureMethod == "PLAINTEXT") hash = key;
		else if (this._signatureMethod == "RSA-SHA1") {
			key = this._privateKey || "";
			hash = crypto.createSign("RSA-SHA1").update(signatureBase).sign(key, "base64");
		} else if (crypto.Hmac) hash = crypto.createHmac("sha1", key).update(signatureBase).digest("base64");
		else hash = sha1.HMACSHA1(key, signatureBase);
		return hash;
	};
	exports.OAuth.prototype.NONCE_CHARS = [
		"a",
		"b",
		"c",
		"d",
		"e",
		"f",
		"g",
		"h",
		"i",
		"j",
		"k",
		"l",
		"m",
		"n",
		"o",
		"p",
		"q",
		"r",
		"s",
		"t",
		"u",
		"v",
		"w",
		"x",
		"y",
		"z",
		"A",
		"B",
		"C",
		"D",
		"E",
		"F",
		"G",
		"H",
		"I",
		"J",
		"K",
		"L",
		"M",
		"N",
		"O",
		"P",
		"Q",
		"R",
		"S",
		"T",
		"U",
		"V",
		"W",
		"X",
		"Y",
		"Z",
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9"
	];
	exports.OAuth.prototype._getNonce = function(nonceSize) {
		var result = [];
		var chars = this.NONCE_CHARS;
		var char_pos;
		var nonce_chars_length = chars.length;
		for (var i = 0; i < nonceSize; i++) {
			char_pos = Math.floor(Math.random() * nonce_chars_length);
			result[i] = chars[char_pos];
		}
		return result.join("");
	};
	exports.OAuth.prototype._createClient = function(port, hostname, method, path, headers, sslEnabled) {
		var options = {
			host: hostname,
			port,
			path,
			method,
			headers
		};
		var httpModel;
		if (sslEnabled) httpModel = https$1;
		else httpModel = http$1;
		return httpModel.request(options);
	};
	exports.OAuth.prototype._prepareParameters = function(oauth_token, oauth_token_secret, method, url, extra_params) {
		var oauthParameters = {
			"oauth_timestamp": this._getTimestamp(),
			"oauth_nonce": this._getNonce(this._nonceSize),
			"oauth_version": this._version,
			"oauth_signature_method": this._signatureMethod,
			"oauth_consumer_key": this._consumerKey
		};
		if (oauth_token) oauthParameters["oauth_token"] = oauth_token;
		var sig;
		if (this._isEcho) sig = this._getSignature("GET", this._verifyCredentials, this._normaliseRequestParams(oauthParameters), oauth_token_secret);
		else {
			if (extra_params) {
				for (var key in extra_params) if (extra_params.hasOwnProperty(key)) oauthParameters[key] = extra_params[key];
			}
			var parsedUrl = URL$2.parse(url, false);
			if (parsedUrl.query) {
				var key2;
				var extraParameters = querystring$1.parse(parsedUrl.query);
				for (var key in extraParameters) {
					var value = extraParameters[key];
					if (typeof value == "object") for (key2 in value) oauthParameters[key + "[" + key2 + "]"] = value[key2];
					else oauthParameters[key] = value;
				}
			}
			sig = this._getSignature(method, url, this._normaliseRequestParams(oauthParameters), oauth_token_secret);
		}
		var orderedParameters = this._sortRequestParams(this._makeArrayOfArgumentsHash(oauthParameters));
		orderedParameters[orderedParameters.length] = ["oauth_signature", sig];
		return orderedParameters;
	};
	exports.OAuth.prototype._performSecureRequest = function(oauth_token, oauth_token_secret, method, url, extra_params, post_body, post_content_type, callback) {
		var orderedParameters = this._prepareParameters(oauth_token, oauth_token_secret, method, url, extra_params);
		if (!post_content_type) post_content_type = "application/x-www-form-urlencoded";
		var parsedUrl = URL$2.parse(url, false);
		if (parsedUrl.protocol == "http:" && !parsedUrl.port) parsedUrl.port = 80;
		if (parsedUrl.protocol == "https:" && !parsedUrl.port) parsedUrl.port = 443;
		var headers = {};
		var authorization = this._buildAuthorizationHeaders(orderedParameters);
		if (this._isEcho) headers["X-Verify-Credentials-Authorization"] = authorization;
		else headers["Authorization"] = authorization;
		headers["Host"] = parsedUrl.host;
		for (var key in this._headers) if (this._headers.hasOwnProperty(key)) headers[key] = this._headers[key];
		for (var key in extra_params) if (this._isParameterNameAnOAuthParameter(key)) delete extra_params[key];
		if ((method == "POST" || method == "PUT") && post_body == null && extra_params != null) post_body = querystring$1.stringify(extra_params).replace(/\!/g, "%21").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
		if (post_body) if (Buffer.isBuffer(post_body)) headers["Content-length"] = post_body.length;
		else headers["Content-length"] = Buffer.byteLength(post_body);
		else headers["Content-length"] = 0;
		headers["Content-Type"] = post_content_type;
		var path;
		if (!parsedUrl.pathname || parsedUrl.pathname == "") parsedUrl.pathname = "/";
		if (parsedUrl.query) path = parsedUrl.pathname + "?" + parsedUrl.query;
		else path = parsedUrl.pathname;
		var request;
		if (parsedUrl.protocol == "https:") request = this._createClient(parsedUrl.port, parsedUrl.hostname, method, path, headers, true);
		else request = this._createClient(parsedUrl.port, parsedUrl.hostname, method, path, headers);
		var clientOptions = this._clientOptions;
		if (callback) {
			var data = "";
			var self = this;
			var allowEarlyClose = OAuthUtils$1.isAnEarlyCloseHost(parsedUrl.hostname);
			var callbackCalled = false;
			var passBackControl = function(response) {
				if (!callbackCalled) {
					callbackCalled = true;
					if (response.statusCode >= 200 && response.statusCode <= 299) callback(null, data, response);
					else if ((response.statusCode == 301 || response.statusCode == 302) && clientOptions.followRedirects && response.headers && response.headers.location) self._performSecureRequest(oauth_token, oauth_token_secret, method, response.headers.location, extra_params, post_body, post_content_type, callback);
					else callback({
						statusCode: response.statusCode,
						data
					}, data, response);
				}
			};
			request.on("response", function(response) {
				response.setEncoding("utf8");
				response.on("data", function(chunk) {
					data += chunk;
				});
				response.on("end", function() {
					passBackControl(response);
				});
				response.on("close", function() {
					if (allowEarlyClose) passBackControl(response);
				});
			});
			request.on("error", function(err) {
				if (!callbackCalled) {
					callbackCalled = true;
					callback(err);
				}
			});
			if ((method == "POST" || method == "PUT") && post_body != null && post_body != "") request.write(post_body);
			request.end();
		} else {
			if ((method == "POST" || method == "PUT") && post_body != null && post_body != "") request.write(post_body);
			return request;
		}
	};
	exports.OAuth.prototype.setClientOptions = function(options) {
		var key, mergedOptions = {}, hasOwnProperty = Object.prototype.hasOwnProperty;
		for (key in this._defaultClientOptions) if (!hasOwnProperty.call(options, key)) mergedOptions[key] = this._defaultClientOptions[key];
		else mergedOptions[key] = options[key];
		this._clientOptions = mergedOptions;
	};
	exports.OAuth.prototype.getOAuthAccessToken = function(oauth_token, oauth_token_secret, oauth_verifier, callback) {
		var extraParams = {};
		if (typeof oauth_verifier == "function") callback = oauth_verifier;
		else extraParams.oauth_verifier = oauth_verifier;
		this._performSecureRequest(oauth_token, oauth_token_secret, this._clientOptions.accessTokenHttpMethod, this._accessUrl, extraParams, null, null, function(error, data, response) {
			if (error) callback(error);
			else {
				var results = querystring$1.parse(data);
				var oauth_access_token = results["oauth_token"];
				delete results["oauth_token"];
				var oauth_access_token_secret = results["oauth_token_secret"];
				delete results["oauth_token_secret"];
				callback(null, oauth_access_token, oauth_access_token_secret, results);
			}
		});
	};
	exports.OAuth.prototype.getProtectedResource = function(url, method, oauth_token, oauth_token_secret, callback) {
		this._performSecureRequest(oauth_token, oauth_token_secret, method, url, null, "", null, callback);
	};
	exports.OAuth.prototype.delete = function(url, oauth_token, oauth_token_secret, callback) {
		return this._performSecureRequest(oauth_token, oauth_token_secret, "DELETE", url, null, "", null, callback);
	};
	exports.OAuth.prototype.get = function(url, oauth_token, oauth_token_secret, callback) {
		return this._performSecureRequest(oauth_token, oauth_token_secret, "GET", url, null, "", null, callback);
	};
	exports.OAuth.prototype._putOrPost = function(method, url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
		var extra_params = null;
		if (typeof post_content_type == "function") {
			callback = post_content_type;
			post_content_type = null;
		}
		if (typeof post_body != "string" && !Buffer.isBuffer(post_body)) {
			post_content_type = "application/x-www-form-urlencoded";
			extra_params = post_body;
			post_body = null;
		}
		return this._performSecureRequest(oauth_token, oauth_token_secret, method, url, extra_params, post_body, post_content_type, callback);
	};
	exports.OAuth.prototype.put = function(url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
		return this._putOrPost("PUT", url, oauth_token, oauth_token_secret, post_body, post_content_type, callback);
	};
	exports.OAuth.prototype.post = function(url, oauth_token, oauth_token_secret, post_body, post_content_type, callback) {
		return this._putOrPost("POST", url, oauth_token, oauth_token_secret, post_body, post_content_type, callback);
	};
	/**
	* Gets a request token from the OAuth provider and passes that information back
	* to the calling code.
	*
	* The callback should expect a function of the following form:
	*
	* function(err, token, token_secret, parsedQueryString) {}
	*
	* This method has optional parameters so can be called in the following 2 ways:
	*
	* 1) Primary use case: Does a basic request with no extra parameters
	*  getOAuthRequestToken( callbackFunction )
	*
	* 2) As above but allows for provision of extra parameters to be sent as part of the query to the server.
	*  getOAuthRequestToken( extraParams, callbackFunction )
	*
	* N.B. This method will HTTP POST verbs by default, if you wish to override this behaviour you will
	* need to provide a requestTokenHttpMethod option when creating the client.
	*
	**/
	exports.OAuth.prototype.getOAuthRequestToken = function(extraParams, callback) {
		if (typeof extraParams == "function") {
			callback = extraParams;
			extraParams = {};
		}
		if (this._authorize_callback) extraParams["oauth_callback"] = this._authorize_callback;
		this._performSecureRequest(null, null, this._clientOptions.requestTokenHttpMethod, this._requestUrl, extraParams, null, null, function(error, data, response) {
			if (error) callback(error);
			else {
				var results = querystring$1.parse(data);
				var oauth_token = results["oauth_token"];
				var oauth_token_secret = results["oauth_token_secret"];
				delete results["oauth_token"];
				delete results["oauth_token_secret"];
				callback(null, oauth_token, oauth_token_secret, results);
			}
		});
	};
	exports.OAuth.prototype.signUrl = function(url, oauth_token, oauth_token_secret, method) {
		if (method === void 0) var method = "GET";
		var orderedParameters = this._prepareParameters(oauth_token, oauth_token_secret, method, url, {});
		var parsedUrl = URL$2.parse(url, false);
		var query = "";
		for (var i = 0; i < orderedParameters.length; i++) query += orderedParameters[i][0] + "=" + this._encodeData(orderedParameters[i][1]) + "&";
		query = query.substring(0, query.length - 1);
		return parsedUrl.protocol + "//" + parsedUrl.host + parsedUrl.pathname + "?" + query;
	};
	exports.OAuth.prototype.authHeader = function(url, oauth_token, oauth_token_secret, method) {
		if (method === void 0) var method = "GET";
		var orderedParameters = this._prepareParameters(oauth_token, oauth_token_secret, method, url, {});
		return this._buildAuthorizationHeaders(orderedParameters);
	};
}));
//#endregion
//#region node_modules/oauth/lib/oauth2.js
var require_oauth2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var querystring = __require("querystring");
	__require("crypto");
	var https = __require("https"), http = __require("http"), URL$1 = __require("url"), OAuthUtils = require__utils();
	exports.OAuth2 = function(clientId, clientSecret, baseSite, authorizePath, accessTokenPath, customHeaders) {
		this._clientId = clientId;
		this._clientSecret = clientSecret;
		this._baseSite = baseSite;
		this._authorizeUrl = authorizePath || "/oauth/authorize";
		this._accessTokenUrl = accessTokenPath || "/oauth/access_token";
		this._accessTokenName = "access_token";
		this._authMethod = "Bearer";
		this._customHeaders = customHeaders || {};
		this._useAuthorizationHeaderForGET = false;
		this._agent = void 0;
	};
	exports.OAuth2.prototype.setAgent = function(agent) {
		this._agent = agent;
	};
	exports.OAuth2.prototype.setAccessTokenName = function(name) {
		this._accessTokenName = name;
	};
	exports.OAuth2.prototype.setAuthMethod = function(authMethod) {
		this._authMethod = authMethod;
	};
	exports.OAuth2.prototype.useAuthorizationHeaderforGET = function(useIt) {
		this._useAuthorizationHeaderForGET = useIt;
	};
	exports.OAuth2.prototype._getAccessTokenUrl = function() {
		return this._baseSite + this._accessTokenUrl;
	};
	exports.OAuth2.prototype.buildAuthHeader = function(token) {
		return this._authMethod + " " + token;
	};
	exports.OAuth2.prototype._chooseHttpLibrary = function(parsedUrl) {
		var http_library = https;
		if (parsedUrl.protocol != "https:") http_library = http;
		return http_library;
	};
	exports.OAuth2.prototype._request = function(method, url, headers, post_body, access_token, callback) {
		var parsedUrl = URL$1.parse(url, true);
		if (parsedUrl.protocol == "https:" && !parsedUrl.port) parsedUrl.port = 443;
		var http_library = this._chooseHttpLibrary(parsedUrl);
		var realHeaders = {};
		for (var key in this._customHeaders) realHeaders[key] = this._customHeaders[key];
		if (headers) for (var key in headers) realHeaders[key] = headers[key];
		realHeaders["Host"] = parsedUrl.host;
		if (!realHeaders["User-Agent"]) realHeaders["User-Agent"] = "Node-oauth";
		if (post_body) if (Buffer.isBuffer(post_body)) realHeaders["Content-Length"] = post_body.length;
		else realHeaders["Content-Length"] = Buffer.byteLength(post_body);
		else realHeaders["Content-length"] = 0;
		if (access_token && !("Authorization" in realHeaders)) {
			if (!parsedUrl.query) parsedUrl.query = {};
			parsedUrl.query[this._accessTokenName] = access_token;
		}
		var queryStr = querystring.stringify(parsedUrl.query);
		if (queryStr) queryStr = "?" + queryStr;
		var options = {
			host: parsedUrl.hostname,
			port: parsedUrl.port,
			path: parsedUrl.pathname + queryStr,
			method,
			headers: realHeaders
		};
		this._executeRequest(http_library, options, post_body, callback);
	};
	exports.OAuth2.prototype._executeRequest = function(http_library, options, post_body, callback) {
		var allowEarlyClose = OAuthUtils.isAnEarlyCloseHost(options.host);
		var callbackCalled = false;
		function passBackControl(response, result) {
			if (!callbackCalled) {
				callbackCalled = true;
				if (!(response.statusCode >= 200 && response.statusCode <= 299) && response.statusCode != 301 && response.statusCode != 302) callback({
					statusCode: response.statusCode,
					data: result
				});
				else callback(null, result, response);
			}
		}
		var result = "";
		if (this._agent) options.agent = this._agent;
		var request = http_library.request(options);
		request.on("response", function(response) {
			response.on("data", function(chunk) {
				result += chunk;
			});
			response.on("close", function(err) {
				if (allowEarlyClose) passBackControl(response, result);
			});
			response.addListener("end", function() {
				passBackControl(response, result);
			});
		});
		request.on("error", function(e) {
			callbackCalled = true;
			callback(e);
		});
		if ((options.method == "POST" || options.method == "PUT") && post_body) request.write(post_body);
		request.end();
	};
	exports.OAuth2.prototype.getAuthorizeUrl = function(params) {
		var params = params || {};
		params["client_id"] = this._clientId;
		return this._baseSite + this._authorizeUrl + "?" + querystring.stringify(params);
	};
	exports.OAuth2.prototype.getOAuthAccessToken = function(code, params, callback) {
		var params = params || {};
		params["client_id"] = this._clientId;
		params["client_secret"] = this._clientSecret;
		var codeParam = params.grant_type === "refresh_token" ? "refresh_token" : "code";
		params[codeParam] = code;
		var post_data = querystring.stringify(params);
		this._request("POST", this._getAccessTokenUrl(), { "Content-Type": "application/x-www-form-urlencoded" }, post_data, null, function(error, data, response) {
			if (error) callback(error);
			else {
				var results;
				try {
					results = JSON.parse(data);
				} catch (e) {
					results = querystring.parse(data);
				}
				var access_token = results["access_token"];
				var refresh_token = results["refresh_token"];
				delete results["refresh_token"];
				callback(null, access_token, refresh_token, results);
			}
		});
	};
	exports.OAuth2.prototype.getProtectedResource = function(url, access_token, callback) {
		this._request("GET", url, {}, "", access_token, callback);
	};
	exports.OAuth2.prototype.get = function(url, access_token, callback) {
		if (this._useAuthorizationHeaderForGET) {
			var headers = { "Authorization": this.buildAuthHeader(access_token) };
			access_token = null;
		} else headers = {};
		this._request("GET", url, headers, "", access_token, callback);
	};
}));
//#endregion
//#region node_modules/oauth/index.js
var require_oauth = /* @__PURE__ */ __commonJSMin(((exports) => {
	exports.OAuth = require_oauth$1().OAuth;
	exports.OAuthEcho = require_oauth$1().OAuthEcho;
	exports.OAuth2 = require_oauth2().OAuth2;
}));
//#endregion
//#region node_modules/next-auth/core/lib/oauth/client-legacy.js
var require_client_legacy = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.oAuth1Client = oAuth1Client;
	exports.oAuth1TokenStore = void 0;
	var _oauth = require_oauth();
	function oAuth1Client(options) {
		var _provider$version, _provider$encoding;
		const provider = options.provider;
		const oauth1Client = new _oauth.OAuth(provider.requestTokenUrl, provider.accessTokenUrl, provider.clientId, provider.clientSecret, (_provider$version = provider.version) !== null && _provider$version !== void 0 ? _provider$version : "1.0", provider.callbackUrl, (_provider$encoding = provider.encoding) !== null && _provider$encoding !== void 0 ? _provider$encoding : "HMAC-SHA1");
		const originalGet = oauth1Client.get.bind(oauth1Client);
		oauth1Client.get = async (...args) => {
			return await new Promise((resolve, reject) => {
				originalGet(...args, (error, result) => {
					if (error) return reject(error);
					resolve(result);
				});
			});
		};
		const originalGetOAuth1AccessToken = oauth1Client.getOAuthAccessToken.bind(oauth1Client);
		oauth1Client.getOAuthAccessToken = async (...args) => {
			return await new Promise((resolve, reject) => {
				originalGetOAuth1AccessToken(...args, (error, oauth_token, oauth_token_secret) => {
					if (error) return reject(error);
					resolve({
						oauth_token,
						oauth_token_secret
					});
				});
			});
		};
		const originalGetOAuthRequestToken = oauth1Client.getOAuthRequestToken.bind(oauth1Client);
		oauth1Client.getOAuthRequestToken = async (params = {}) => {
			return await new Promise((resolve, reject) => {
				originalGetOAuthRequestToken(params, (error, oauth_token, oauth_token_secret, params) => {
					if (error) return reject(error);
					resolve({
						oauth_token,
						oauth_token_secret,
						params
					});
				});
			});
		};
		return oauth1Client;
	}
	exports.oAuth1TokenStore = /* @__PURE__ */ new Map();
}));
//#endregion
//#region node_modules/next-auth/core/lib/oauth/checks.js
var require_checks = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.pkce = exports.nonce = exports.PKCE_CODE_CHALLENGE_METHOD = void 0;
	exports.signCookie = signCookie;
	exports.state = void 0;
	var _openidClient = require_lib();
	var jwt = _interopRequireWildcard(require_jwt());
	function _getRequireWildcardCache(e) {
		if ("function" != typeof WeakMap) return null;
		var r = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
		return (_getRequireWildcardCache = function(e) {
			return e ? t : r;
		})(e);
	}
	function _interopRequireWildcard(e, r) {
		if (!r && e && e.__esModule) return e;
		if (null === e || "object" != typeof e && "function" != typeof e) return { default: e };
		var t = _getRequireWildcardCache(r);
		if (t && t.has(e)) return t.get(e);
		var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
		for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
			var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
			i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
		}
		return n.default = e, t && t.set(e, n), n;
	}
	async function signCookie(type, value, maxAge, options) {
		const { cookies, logger } = options;
		logger.debug(`CREATE_${type.toUpperCase()}`, {
			value,
			maxAge
		});
		const { name } = cookies[type];
		const expires = /* @__PURE__ */ new Date();
		expires.setTime(expires.getTime() + maxAge * 1e3);
		return {
			name,
			value: await jwt.encode({
				...options.jwt,
				maxAge,
				token: { value },
				salt: name
			}),
			options: {
				...cookies[type].options,
				expires
			}
		};
	}
	var PKCE_MAX_AGE = 900;
	var PKCE_CODE_CHALLENGE_METHOD = exports.PKCE_CODE_CHALLENGE_METHOD = "S256";
	exports.pkce = {
		async create(options, cookies, resParams) {
			var _options$provider, _options$cookies$pkce;
			if (!((_options$provider = options.provider) !== null && _options$provider !== void 0 && (_options$provider = _options$provider.checks) !== null && _options$provider !== void 0 && _options$provider.includes("pkce"))) return;
			const code_verifier = _openidClient.generators.codeVerifier();
			resParams.code_challenge = _openidClient.generators.codeChallenge(code_verifier);
			resParams.code_challenge_method = PKCE_CODE_CHALLENGE_METHOD;
			const maxAge = (_options$cookies$pkce = options.cookies.pkceCodeVerifier.options.maxAge) !== null && _options$cookies$pkce !== void 0 ? _options$cookies$pkce : PKCE_MAX_AGE;
			cookies.push(await signCookie("pkceCodeVerifier", code_verifier, maxAge, options));
		},
		async use(cookies, resCookies, options, checks) {
			var _options$provider2;
			if (!((_options$provider2 = options.provider) !== null && _options$provider2 !== void 0 && (_options$provider2 = _options$provider2.checks) !== null && _options$provider2 !== void 0 && _options$provider2.includes("pkce"))) return;
			const codeVerifier = cookies === null || cookies === void 0 ? void 0 : cookies[options.cookies.pkceCodeVerifier.name];
			if (!codeVerifier) throw new TypeError("PKCE code_verifier cookie was missing.");
			const { name } = options.cookies.pkceCodeVerifier;
			const value = await jwt.decode({
				...options.jwt,
				token: codeVerifier,
				salt: name
			});
			if (!(value !== null && value !== void 0 && value.value)) throw new TypeError("PKCE code_verifier value could not be parsed.");
			resCookies.push({
				name,
				value: "",
				options: {
					...options.cookies.pkceCodeVerifier.options,
					maxAge: 0
				}
			});
			checks.code_verifier = value.value;
		}
	};
	var STATE_MAX_AGE = 900;
	exports.state = {
		async create(options, cookies, resParams) {
			var _options$provider$che, _options$cookies$stat;
			if (!((_options$provider$che = options.provider.checks) !== null && _options$provider$che !== void 0 && _options$provider$che.includes("state"))) return;
			const value = _openidClient.generators.state();
			resParams.state = value;
			const maxAge = (_options$cookies$stat = options.cookies.state.options.maxAge) !== null && _options$cookies$stat !== void 0 ? _options$cookies$stat : STATE_MAX_AGE;
			cookies.push(await signCookie("state", value, maxAge, options));
		},
		async use(cookies, resCookies, options, checks) {
			var _options$provider$che2;
			if (!((_options$provider$che2 = options.provider.checks) !== null && _options$provider$che2 !== void 0 && _options$provider$che2.includes("state"))) return;
			const state = cookies === null || cookies === void 0 ? void 0 : cookies[options.cookies.state.name];
			if (!state) throw new TypeError("State cookie was missing.");
			const { name } = options.cookies.state;
			const value = await jwt.decode({
				...options.jwt,
				token: state,
				salt: name
			});
			if (!(value !== null && value !== void 0 && value.value)) throw new TypeError("State value could not be parsed.");
			resCookies.push({
				name,
				value: "",
				options: {
					...options.cookies.state.options,
					maxAge: 0
				}
			});
			checks.state = value.value;
		}
	};
	var NONCE_MAX_AGE = 900;
	exports.nonce = {
		async create(options, cookies, resParams) {
			var _options$provider$che3, _options$cookies$nonc;
			if (!((_options$provider$che3 = options.provider.checks) !== null && _options$provider$che3 !== void 0 && _options$provider$che3.includes("nonce"))) return;
			const value = _openidClient.generators.nonce();
			resParams.nonce = value;
			const maxAge = (_options$cookies$nonc = options.cookies.nonce.options.maxAge) !== null && _options$cookies$nonc !== void 0 ? _options$cookies$nonc : NONCE_MAX_AGE;
			cookies.push(await signCookie("nonce", value, maxAge, options));
		},
		async use(cookies, resCookies, options, checks) {
			var _options$provider3;
			if (!((_options$provider3 = options.provider) !== null && _options$provider3 !== void 0 && (_options$provider3 = _options$provider3.checks) !== null && _options$provider3 !== void 0 && _options$provider3.includes("nonce"))) return;
			const nonce = cookies === null || cookies === void 0 ? void 0 : cookies[options.cookies.nonce.name];
			if (!nonce) throw new TypeError("Nonce cookie was missing.");
			const { name } = options.cookies.nonce;
			const value = await jwt.decode({
				...options.jwt,
				token: nonce,
				salt: name
			});
			if (!(value !== null && value !== void 0 && value.value)) throw new TypeError("Nonce value could not be parsed.");
			resCookies.push({
				name,
				value: "",
				options: {
					...options.cookies.nonce.options,
					maxAge: 0
				}
			});
			checks.nonce = value.value;
		}
	};
}));
//#endregion
//#region node_modules/next-auth/core/lib/oauth/callback.js
var require_callback$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = oAuthCallback;
	var _openidClient = require_lib();
	var _client = require_client();
	var _clientLegacy = require_client_legacy();
	var _checks = _interopRequireWildcard(require_checks());
	var _errors = require_errors$1();
	function _getRequireWildcardCache(e) {
		if ("function" != typeof WeakMap) return null;
		var r = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
		return (_getRequireWildcardCache = function(e) {
			return e ? t : r;
		})(e);
	}
	function _interopRequireWildcard(e, r) {
		if (!r && e && e.__esModule) return e;
		if (null === e || "object" != typeof e && "function" != typeof e) return { default: e };
		var t = _getRequireWildcardCache(r);
		if (t && t.has(e)) return t.get(e);
		var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
		for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
			var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
			i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
		}
		return n.default = e, t && t.set(e, n), n;
	}
	async function oAuthCallback(params) {
		var _body$error, _provider$version;
		const { options, query, body, method, cookies } = params;
		const { logger, provider } = options;
		const errorMessage = (_body$error = body === null || body === void 0 ? void 0 : body.error) !== null && _body$error !== void 0 ? _body$error : query === null || query === void 0 ? void 0 : query.error;
		if (errorMessage) {
			const error = new Error(errorMessage);
			logger.error("OAUTH_CALLBACK_HANDLER_ERROR", {
				error,
				error_description: query === null || query === void 0 ? void 0 : query.error_description,
				providerId: provider.id
			});
			logger.debug("OAUTH_CALLBACK_HANDLER_ERROR", { body });
			throw error;
		}
		if ((_provider$version = provider.version) !== null && _provider$version !== void 0 && _provider$version.startsWith("1.")) try {
			const client = await (0, _clientLegacy.oAuth1Client)(options);
			const { oauth_token, oauth_verifier } = query !== null && query !== void 0 ? query : {};
			const tokens = await client.getOAuthAccessToken(oauth_token, _clientLegacy.oAuth1TokenStore.get(oauth_token), oauth_verifier);
			let profile = await client.get(provider.profileUrl, tokens.oauth_token, tokens.oauth_token_secret);
			if (typeof profile === "string") profile = JSON.parse(profile);
			return {
				...await getProfile({
					profile,
					tokens,
					provider,
					logger
				}),
				cookies: []
			};
		} catch (error) {
			logger.error("OAUTH_V1_GET_ACCESS_TOKEN_ERROR", error);
			throw error;
		}
		if (query !== null && query !== void 0 && query.oauth_token) _clientLegacy.oAuth1TokenStore.delete(query.oauth_token);
		try {
			var _provider$token, _provider$token2, _provider$userinfo;
			const client = await (0, _client.openidClient)(options);
			let tokens;
			const checks = {};
			const resCookies = [];
			await _checks.state.use(cookies, resCookies, options, checks);
			await _checks.pkce.use(cookies, resCookies, options, checks);
			await _checks.nonce.use(cookies, resCookies, options, checks);
			const params = {
				...client.callbackParams({
					url: `http://n?${new URLSearchParams(query)}`,
					body,
					method
				}),
				...(_provider$token = provider.token) === null || _provider$token === void 0 ? void 0 : _provider$token.params
			};
			if ((_provider$token2 = provider.token) !== null && _provider$token2 !== void 0 && _provider$token2.request) {
				const response = await provider.token.request({
					provider,
					params,
					checks,
					client
				});
				tokens = new _openidClient.TokenSet(response.tokens);
			} else if (provider.idToken) tokens = await client.callback(provider.callbackUrl, params, checks);
			else tokens = await client.oauthCallback(provider.callbackUrl, params, checks);
			if (Array.isArray(tokens.scope)) tokens.scope = tokens.scope.join(" ");
			let profile;
			if ((_provider$userinfo = provider.userinfo) !== null && _provider$userinfo !== void 0 && _provider$userinfo.request) profile = await provider.userinfo.request({
				provider,
				tokens,
				client
			});
			else if (provider.idToken) profile = tokens.claims();
			else {
				var _provider$userinfo2;
				profile = await client.userinfo(tokens, { params: (_provider$userinfo2 = provider.userinfo) === null || _provider$userinfo2 === void 0 ? void 0 : _provider$userinfo2.params });
			}
			return {
				...await getProfile({
					profile,
					provider,
					tokens,
					logger
				}),
				cookies: resCookies
			};
		} catch (error) {
			throw new _errors.OAuthCallbackError(error);
		}
	}
	async function getProfile({ profile: OAuthProfile, tokens, provider, logger }) {
		try {
			var _profile$email;
			logger.debug("PROFILE_DATA", { OAuthProfile });
			const profile = await provider.profile(OAuthProfile, tokens);
			profile.email = (_profile$email = profile.email) === null || _profile$email === void 0 ? void 0 : _profile$email.toLowerCase();
			if (!profile.id) throw new TypeError(`Profile id is missing in ${provider.name} OAuth profile response`);
			return {
				profile,
				account: {
					provider: provider.id,
					type: provider.type,
					providerAccountId: profile.id.toString(),
					...tokens
				},
				OAuthProfile
			};
		} catch (error) {
			logger.error("OAUTH_PARSE_PROFILE_ERROR", {
				error,
				OAuthProfile
			});
		}
	}
}));
//#endregion
//#region node_modules/next-auth/core/lib/utils.js
var require_utils$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createSecret = createSecret;
	exports.fromDate = fromDate;
	exports.hashToken = hashToken;
	var _crypto$3 = __require("crypto");
	function fromDate(time, date = Date.now()) {
		return new Date(date + time * 1e3);
	}
	function hashToken(token, options) {
		var _provider$secret;
		const { provider, secret } = options;
		return (0, _crypto$3.createHash)("sha256").update(`${token}${(_provider$secret = provider.secret) !== null && _provider$secret !== void 0 ? _provider$secret : secret}`).digest("hex");
	}
	function createSecret(params) {
		var _authOptions$secret;
		const { authOptions, url } = params;
		return (_authOptions$secret = authOptions.secret) !== null && _authOptions$secret !== void 0 ? _authOptions$secret : (0, _crypto$3.createHash)("sha256").update(JSON.stringify({
			...url,
			...authOptions
		})).digest("hex");
	}
}));
//#endregion
//#region node_modules/next-auth/core/lib/callback-handler.js
var require_callback_handler = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = callbackHandler;
	var _errors = require_errors$1();
	var _utils = require_utils$1();
	async function callbackHandler(params) {
		const { sessionToken, profile: _profile, account, options } = params;
		if (!(account !== null && account !== void 0 && account.providerAccountId) || !account.type) throw new Error("Missing or invalid provider account");
		if (!["email", "oauth"].includes(account.type)) throw new Error("Provider not supported");
		const { adapter, jwt, events, session: { strategy: sessionStrategy, generateSessionToken } } = options;
		if (!adapter) return {
			user: _profile,
			account
		};
		const profile = _profile;
		const { createUser, updateUser, getUser, getUserByAccount, getUserByEmail, linkAccount, createSession, getSessionAndUser, deleteSession } = adapter;
		let session = null;
		let user = null;
		let isNewUser = false;
		const useJwtSession = sessionStrategy === "jwt";
		if (sessionToken) if (useJwtSession) try {
			session = await jwt.decode({
				...jwt,
				token: sessionToken
			});
			if (session && "sub" in session && session.sub) user = await getUser(session.sub);
		} catch (_unused) {}
		else {
			const userAndSession = await getSessionAndUser(sessionToken);
			if (userAndSession) {
				session = userAndSession.session;
				user = userAndSession.user;
			}
		}
		if (account.type === "email") {
			const userByEmail = await getUserByEmail(profile.email);
			if (userByEmail) {
				var _user, _events$updateUser;
				if (((_user = user) === null || _user === void 0 ? void 0 : _user.id) !== userByEmail.id && !useJwtSession && sessionToken) await deleteSession(sessionToken);
				user = await updateUser({
					id: userByEmail.id,
					emailVerified: /* @__PURE__ */ new Date()
				});
				await ((_events$updateUser = events.updateUser) === null || _events$updateUser === void 0 ? void 0 : _events$updateUser.call(events, { user }));
			} else {
				var _events$createUser;
				const { id: _, ...newUser } = {
					...profile,
					emailVerified: /* @__PURE__ */ new Date()
				};
				user = await createUser(newUser);
				await ((_events$createUser = events.createUser) === null || _events$createUser === void 0 ? void 0 : _events$createUser.call(events, { user }));
				isNewUser = true;
			}
			session = useJwtSession ? {} : await createSession({
				sessionToken: await generateSessionToken(),
				userId: user.id,
				expires: (0, _utils.fromDate)(options.session.maxAge)
			});
			return {
				session,
				user,
				isNewUser
			};
		} else if (account.type === "oauth") {
			const userByAccount = await getUserByAccount({
				providerAccountId: account.providerAccountId,
				provider: account.provider
			});
			if (userByAccount) {
				if (user) {
					if (userByAccount.id === user.id) return {
						session,
						user,
						isNewUser
					};
					throw new _errors.AccountNotLinkedError("The account is already associated with another user");
				}
				session = useJwtSession ? {} : await createSession({
					sessionToken: await generateSessionToken(),
					userId: userByAccount.id,
					expires: (0, _utils.fromDate)(options.session.maxAge)
				});
				return {
					session,
					user: userByAccount,
					isNewUser
				};
			} else {
				var _events$createUser2, _events$linkAccount2;
				if (user) {
					var _events$linkAccount;
					await linkAccount({
						...account,
						userId: user.id
					});
					await ((_events$linkAccount = events.linkAccount) === null || _events$linkAccount === void 0 ? void 0 : _events$linkAccount.call(events, {
						user,
						account,
						profile
					}));
					return {
						session,
						user,
						isNewUser
					};
				}
				const userByEmail = profile.email ? await getUserByEmail(profile.email) : null;
				if (userByEmail) {
					const provider = options.provider;
					if (provider !== null && provider !== void 0 && provider.allowDangerousEmailAccountLinking) user = userByEmail;
					else throw new _errors.AccountNotLinkedError("Another account already exists with the same e-mail address");
				} else {
					const { id: _, ...newUser } = {
						...profile,
						emailVerified: null
					};
					user = await createUser(newUser);
				}
				await ((_events$createUser2 = events.createUser) === null || _events$createUser2 === void 0 ? void 0 : _events$createUser2.call(events, { user }));
				await linkAccount({
					...account,
					userId: user.id
				});
				await ((_events$linkAccount2 = events.linkAccount) === null || _events$linkAccount2 === void 0 ? void 0 : _events$linkAccount2.call(events, {
					user,
					account,
					profile
				}));
				session = useJwtSession ? {} : await createSession({
					sessionToken: await generateSessionToken(),
					userId: user.id,
					expires: (0, _utils.fromDate)(options.session.maxAge)
				});
				return {
					session,
					user,
					isNewUser: true
				};
			}
		}
		throw new Error("Unsupported account type");
	}
}));
//#endregion
//#region node_modules/next-auth/core/lib/email/getUserFromEmail.js
var require_getUserFromEmail = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = getAdapterUserFromEmail;
	async function getAdapterUserFromEmail({ email, adapter }) {
		const { getUserByEmail } = adapter;
		const adapterUser = email ? await getUserByEmail(email) : null;
		if (adapterUser) return adapterUser;
		return {
			id: email,
			email,
			emailVerified: null
		};
	}
}));
//#endregion
//#region node_modules/next-auth/core/routes/callback.js
var require_callback = /* @__PURE__ */ __commonJSMin(((exports) => {
	var _interopRequireDefault = require_interopRequireDefault();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = callback;
	var _callback = _interopRequireDefault(require_callback$1());
	var _callbackHandler = _interopRequireDefault(require_callback_handler());
	var _utils = require_utils$1();
	var _getUserFromEmail = _interopRequireDefault(require_getUserFromEmail());
	async function callback(params) {
		const { options, query, body, method, headers, sessionStore } = params;
		const { provider, adapter, url, callbackUrl, pages, jwt, events, callbacks, session: { strategy: sessionStrategy, maxAge: sessionMaxAge }, logger } = options;
		const cookies = [];
		const useJwtSession = sessionStrategy === "jwt";
		if (provider.type === "oauth") try {
			const { profile, account, OAuthProfile, cookies: oauthCookies } = await (0, _callback.default)({
				query,
				body,
				method,
				options,
				cookies: params.cookies
			});
			if (oauthCookies.length) cookies.push(...oauthCookies);
			try {
				var _events$signIn;
				logger.debug("OAUTH_CALLBACK_RESPONSE", {
					profile,
					account,
					OAuthProfile
				});
				if (!profile || !account || !OAuthProfile) return {
					redirect: `${url}/signin`,
					cookies
				};
				let userOrProfile = profile;
				if (adapter) {
					const { getUserByAccount } = adapter;
					const userByAccount = await getUserByAccount({
						providerAccountId: account.providerAccountId,
						provider: provider.id
					});
					if (userByAccount) userOrProfile = userByAccount;
				}
				try {
					const isAllowed = await callbacks.signIn({
						user: userOrProfile,
						account,
						profile: OAuthProfile
					});
					if (!isAllowed) return {
						redirect: `${url}/error?error=AccessDenied`,
						cookies
					};
					else if (typeof isAllowed === "string") return {
						redirect: isAllowed,
						cookies
					};
				} catch (error) {
					return {
						redirect: `${url}/error?error=${encodeURIComponent(error.message)}`,
						cookies
					};
				}
				const { user, session, isNewUser } = await (0, _callbackHandler.default)({
					sessionToken: sessionStore.value,
					profile,
					account,
					options
				});
				if (useJwtSession) {
					var _user$id;
					const defaultToken = {
						name: user.name,
						email: user.email,
						picture: user.image,
						sub: (_user$id = user.id) === null || _user$id === void 0 ? void 0 : _user$id.toString()
					};
					const token = await callbacks.jwt({
						token: defaultToken,
						user,
						account,
						profile: OAuthProfile,
						isNewUser,
						trigger: isNewUser ? "signUp" : "signIn"
					});
					const newToken = await jwt.encode({
						...jwt,
						token
					});
					const cookieExpires = /* @__PURE__ */ new Date();
					cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1e3);
					const sessionCookies = sessionStore.chunk(newToken, { expires: cookieExpires });
					cookies.push(...sessionCookies);
				} else cookies.push({
					name: options.cookies.sessionToken.name,
					value: session.sessionToken,
					options: {
						...options.cookies.sessionToken.options,
						expires: session.expires
					}
				});
				await ((_events$signIn = events.signIn) === null || _events$signIn === void 0 ? void 0 : _events$signIn.call(events, {
					user,
					account,
					profile,
					isNewUser
				}));
				if (isNewUser && pages.newUser) return {
					redirect: `${pages.newUser}${pages.newUser.includes("?") ? "&" : "?"}callbackUrl=${encodeURIComponent(callbackUrl)}`,
					cookies
				};
				return {
					redirect: callbackUrl,
					cookies
				};
			} catch (error) {
				if (error.name === "AccountNotLinkedError") return {
					redirect: `${url}/error?error=OAuthAccountNotLinked`,
					cookies
				};
				else if (error.name === "CreateUserError") return {
					redirect: `${url}/error?error=OAuthCreateAccount`,
					cookies
				};
				logger.error("OAUTH_CALLBACK_HANDLER_ERROR", error);
				return {
					redirect: `${url}/error?error=Callback`,
					cookies
				};
			}
		} catch (error) {
			if (error.name === "OAuthCallbackError") {
				logger.error("OAUTH_CALLBACK_ERROR", {
					error,
					providerId: provider.id
				});
				return {
					redirect: `${url}/error?error=OAuthCallback`,
					cookies
				};
			}
			logger.error("OAUTH_CALLBACK_ERROR", error);
			return {
				redirect: `${url}/error?error=Callback`,
				cookies
			};
		}
		else if (provider.type === "email") try {
			var _events$signIn2;
			const paramToken = query === null || query === void 0 ? void 0 : query.token;
			const paramIdentifier = query === null || query === void 0 ? void 0 : query.email;
			if (!paramToken) return {
				redirect: `${url}/error?error=configuration`,
				cookies
			};
			const invite = await adapter.useVerificationToken({
				identifier: paramIdentifier,
				token: (0, _utils.hashToken)(paramToken, options)
			});
			if (!invite || invite.expires.valueOf() < Date.now() || paramIdentifier && invite.identifier !== paramIdentifier) return {
				redirect: `${url}/error?error=Verification`,
				cookies
			};
			const profile = await (0, _getUserFromEmail.default)({
				email: invite.identifier,
				adapter
			});
			const account = {
				providerAccountId: profile.email,
				type: "email",
				provider: provider.id
			};
			try {
				const signInCallbackResponse = await callbacks.signIn({
					user: profile,
					account
				});
				if (!signInCallbackResponse) return {
					redirect: `${url}/error?error=AccessDenied`,
					cookies
				};
				else if (typeof signInCallbackResponse === "string") return {
					redirect: signInCallbackResponse,
					cookies
				};
			} catch (error) {
				return {
					redirect: `${url}/error?error=${encodeURIComponent(error.message)}`,
					cookies
				};
			}
			const { user, session, isNewUser } = await (0, _callbackHandler.default)({
				sessionToken: sessionStore.value,
				profile,
				account,
				options
			});
			if (useJwtSession) {
				var _user$id2;
				const defaultToken = {
					name: user.name,
					email: user.email,
					picture: user.image,
					sub: (_user$id2 = user.id) === null || _user$id2 === void 0 ? void 0 : _user$id2.toString()
				};
				const token = await callbacks.jwt({
					token: defaultToken,
					user,
					account,
					isNewUser,
					trigger: isNewUser ? "signUp" : "signIn"
				});
				const newToken = await jwt.encode({
					...jwt,
					token
				});
				const cookieExpires = /* @__PURE__ */ new Date();
				cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1e3);
				const sessionCookies = sessionStore.chunk(newToken, { expires: cookieExpires });
				cookies.push(...sessionCookies);
			} else cookies.push({
				name: options.cookies.sessionToken.name,
				value: session.sessionToken,
				options: {
					...options.cookies.sessionToken.options,
					expires: session.expires
				}
			});
			await ((_events$signIn2 = events.signIn) === null || _events$signIn2 === void 0 ? void 0 : _events$signIn2.call(events, {
				user,
				account,
				isNewUser
			}));
			if (isNewUser && pages.newUser) return {
				redirect: `${pages.newUser}${pages.newUser.includes("?") ? "&" : "?"}callbackUrl=${encodeURIComponent(callbackUrl)}`,
				cookies
			};
			return {
				redirect: callbackUrl,
				cookies
			};
		} catch (error) {
			if (error.name === "CreateUserError") return {
				redirect: `${url}/error?error=EmailCreateAccount`,
				cookies
			};
			logger.error("CALLBACK_EMAIL_ERROR", error);
			return {
				redirect: `${url}/error?error=Callback`,
				cookies
			};
		}
		else if (provider.type === "credentials" && method === "POST") {
			var _user$id3, _events$signIn3;
			const credentials = body;
			let user;
			try {
				user = await provider.authorize(credentials, {
					query,
					body,
					headers,
					method
				});
				if (!user) return {
					status: 401,
					redirect: `${url}/error?${new URLSearchParams({
						error: "CredentialsSignin",
						provider: provider.id
					})}`,
					cookies
				};
			} catch (error) {
				return {
					status: 401,
					redirect: `${url}/error?error=${encodeURIComponent(error.message)}`,
					cookies
				};
			}
			const account = {
				providerAccountId: user.id,
				type: "credentials",
				provider: provider.id
			};
			try {
				const isAllowed = await callbacks.signIn({
					user,
					account,
					credentials
				});
				if (!isAllowed) return {
					status: 403,
					redirect: `${url}/error?error=AccessDenied`,
					cookies
				};
				else if (typeof isAllowed === "string") return {
					redirect: isAllowed,
					cookies
				};
			} catch (error) {
				return {
					redirect: `${url}/error?error=${encodeURIComponent(error.message)}`,
					cookies
				};
			}
			const defaultToken = {
				name: user.name,
				email: user.email,
				picture: user.image,
				sub: (_user$id3 = user.id) === null || _user$id3 === void 0 ? void 0 : _user$id3.toString()
			};
			const token = await callbacks.jwt({
				token: defaultToken,
				user,
				account,
				isNewUser: false,
				trigger: "signIn"
			});
			const newToken = await jwt.encode({
				...jwt,
				token
			});
			const cookieExpires = /* @__PURE__ */ new Date();
			cookieExpires.setTime(cookieExpires.getTime() + sessionMaxAge * 1e3);
			const sessionCookies = sessionStore.chunk(newToken, { expires: cookieExpires });
			cookies.push(...sessionCookies);
			await ((_events$signIn3 = events.signIn) === null || _events$signIn3 === void 0 ? void 0 : _events$signIn3.call(events, {
				user,
				account
			}));
			return {
				redirect: callbackUrl,
				cookies
			};
		}
		return {
			status: 500,
			body: `Error: Callback for provider type ${provider.type} not supported`,
			cookies
		};
	}
}));
//#endregion
//#region node_modules/next-auth/core/lib/oauth/authorization-url.js
var require_authorization_url = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = getAuthorizationUrl;
	var _client = require_client();
	var _clientLegacy = require_client_legacy();
	var checks = _interopRequireWildcard(require_checks());
	function _getRequireWildcardCache(e) {
		if ("function" != typeof WeakMap) return null;
		var r = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
		return (_getRequireWildcardCache = function(e) {
			return e ? t : r;
		})(e);
	}
	function _interopRequireWildcard(e, r) {
		if (!r && e && e.__esModule) return e;
		if (null === e || "object" != typeof e && "function" != typeof e) return { default: e };
		var t = _getRequireWildcardCache(r);
		if (t && t.has(e)) return t.get(e);
		var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
		for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
			var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
			i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
		}
		return n.default = e, t && t.set(e, n), n;
	}
	async function getAuthorizationUrl({ options, query }) {
		var _provider$version;
		const { logger, provider } = options;
		let params = {};
		if (typeof provider.authorization === "string") {
			const parsedUrl = new URL(provider.authorization);
			const parsedParams = Object.fromEntries(parsedUrl.searchParams);
			params = {
				...params,
				...parsedParams
			};
		} else {
			var _provider$authorizati;
			params = {
				...params,
				...(_provider$authorizati = provider.authorization) === null || _provider$authorizati === void 0 ? void 0 : _provider$authorizati.params
			};
		}
		params = {
			...params,
			...query
		};
		if ((_provider$version = provider.version) !== null && _provider$version !== void 0 && _provider$version.startsWith("1.")) {
			var _provider$authorizati2;
			const tokens = await (0, _clientLegacy.oAuth1Client)(options).getOAuthRequestToken(params);
			const url = `${(_provider$authorizati2 = provider.authorization) === null || _provider$authorizati2 === void 0 ? void 0 : _provider$authorizati2.url}?${new URLSearchParams({
				oauth_token: tokens.oauth_token,
				oauth_token_secret: tokens.oauth_token_secret,
				...tokens.params
			})}`;
			_clientLegacy.oAuth1TokenStore.set(tokens.oauth_token, tokens.oauth_token_secret);
			logger.debug("GET_AUTHORIZATION_URL", {
				url,
				provider
			});
			return { redirect: url };
		}
		const client = await (0, _client.openidClient)(options);
		const authorizationParams = params;
		const cookies = [];
		await checks.state.create(options, cookies, authorizationParams);
		await checks.pkce.create(options, cookies, authorizationParams);
		await checks.nonce.create(options, cookies, authorizationParams);
		const url = client.authorizationUrl(authorizationParams);
		logger.debug("GET_AUTHORIZATION_URL", {
			url,
			cookies,
			provider
		});
		return {
			redirect: url,
			cookies
		};
	}
}));
//#endregion
//#region node_modules/next-auth/core/lib/email/signin.js
var require_signin$2 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = email;
	var _crypto$2 = __require("crypto");
	var _utils = require_utils$1();
	async function email(identifier, options) {
		var _await$provider$gener, _provider$generateVer, _provider$maxAge, _adapter$createVerifi;
		const { url, adapter, provider, callbackUrl, theme } = options;
		const token = (_await$provider$gener = await ((_provider$generateVer = provider.generateVerificationToken) === null || _provider$generateVer === void 0 ? void 0 : _provider$generateVer.call(provider))) !== null && _await$provider$gener !== void 0 ? _await$provider$gener : (0, _crypto$2.randomBytes)(32).toString("hex");
		const expires = new Date(Date.now() + ((_provider$maxAge = provider.maxAge) !== null && _provider$maxAge !== void 0 ? _provider$maxAge : 86400) * 1e3);
		const params = new URLSearchParams({
			callbackUrl,
			token,
			email: identifier
		});
		const _url = `${url}/callback/${provider.id}?${params}`;
		await Promise.all([provider.sendVerificationRequest({
			identifier,
			token,
			expires,
			url: _url,
			provider,
			theme
		}), (_adapter$createVerifi = adapter.createVerificationToken) === null || _adapter$createVerifi === void 0 ? void 0 : _adapter$createVerifi.call(adapter, {
			identifier,
			token: (0, _utils.hashToken)(token, options),
			expires
		})]);
		return `${url}/verify-request?${new URLSearchParams({
			provider: provider.id,
			type: provider.type
		})}`;
	}
}));
//#endregion
//#region node_modules/next-auth/core/routes/signin.js
var require_signin$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	var _interopRequireDefault = require_interopRequireDefault();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = signin;
	var _authorizationUrl = _interopRequireDefault(require_authorization_url());
	var _signin = _interopRequireDefault(require_signin$2());
	var _getUserFromEmail = _interopRequireDefault(require_getUserFromEmail());
	async function signin(params) {
		const { options, query, body } = params;
		const { url, callbacks, logger, provider } = options;
		if (!provider.type) return {
			status: 500,
			text: `Error: Type not specified for ${provider.name}`
		};
		if (provider.type === "oauth") try {
			return await (0, _authorizationUrl.default)({
				options,
				query
			});
		} catch (error) {
			logger.error("SIGNIN_OAUTH_ERROR", {
				error,
				providerId: provider.id
			});
			return { redirect: `${url}/error?error=OAuthSignin` };
		}
		else if (provider.type === "email") {
			var _provider$normalizeId;
			let email = body === null || body === void 0 ? void 0 : body.email;
			if (!email) return { redirect: `${url}/error?error=EmailSignin` };
			const normalizer = (_provider$normalizeId = provider.normalizeIdentifier) !== null && _provider$normalizeId !== void 0 ? _provider$normalizeId : (identifier) => {
				var _trimmedEmail$match;
				const trimmedEmail = identifier.trim();
				if (((_trimmedEmail$match = trimmedEmail.match(/@/g)) !== null && _trimmedEmail$match !== void 0 ? _trimmedEmail$match : []).length !== 1) throw new Error("Invalid email address format.");
				if (trimmedEmail.includes("\"")) throw new Error("Invalid email address format.");
				let [local, domain] = trimmedEmail.toLowerCase().split("@");
				if (!local || !domain) throw new Error("Invalid email address format.");
				domain = domain.split(",")[0];
				if (!domain.includes(".")) throw new Error("Invalid email address format.");
				return `${local}@${domain}`;
			};
			try {
				email = normalizer(body === null || body === void 0 ? void 0 : body.email);
			} catch (error) {
				logger.error("SIGNIN_EMAIL_ERROR", {
					error,
					providerId: provider.id
				});
				return { redirect: `${url}/error?error=EmailSignin` };
			}
			const user = await (0, _getUserFromEmail.default)({
				email,
				adapter: options.adapter
			});
			const account = {
				providerAccountId: email,
				userId: email,
				type: "email",
				provider: provider.id
			};
			try {
				const signInCallbackResponse = await callbacks.signIn({
					user,
					account,
					email: { verificationRequest: true }
				});
				if (!signInCallbackResponse) return { redirect: `${url}/error?error=AccessDenied` };
				else if (typeof signInCallbackResponse === "string") return { redirect: signInCallbackResponse };
			} catch (error) {
				return { redirect: `${url}/error?${new URLSearchParams({ error })}` };
			}
			try {
				return { redirect: await (0, _signin.default)(email, options) };
			} catch (error) {
				logger.error("SIGNIN_EMAIL_ERROR", {
					error,
					providerId: provider.id
				});
				return { redirect: `${url}/error?error=EmailSignin` };
			}
		}
		return { redirect: `${url}/signin` };
	}
}));
//#endregion
//#region node_modules/next-auth/core/routes/signout.js
var require_signout$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = signout;
	async function signout(params) {
		const { options, sessionStore } = params;
		const { adapter, events, jwt, callbackUrl, logger, session } = options;
		const sessionToken = sessionStore === null || sessionStore === void 0 ? void 0 : sessionStore.value;
		if (!sessionToken) return { redirect: callbackUrl };
		if (session.strategy === "jwt") try {
			var _events$signOut;
			const decodedJwt = await jwt.decode({
				...jwt,
				token: sessionToken
			});
			await ((_events$signOut = events.signOut) === null || _events$signOut === void 0 ? void 0 : _events$signOut.call(events, { token: decodedJwt }));
		} catch (error) {
			logger.error("SIGNOUT_ERROR", error);
		}
		else try {
			var _events$signOut2;
			const session = await adapter.deleteSession(sessionToken);
			await ((_events$signOut2 = events.signOut) === null || _events$signOut2 === void 0 ? void 0 : _events$signOut2.call(events, { session }));
		} catch (error) {
			logger.error("SIGNOUT_ERROR", error);
		}
		return {
			redirect: callbackUrl,
			cookies: sessionStore.clean()
		};
	}
}));
//#endregion
//#region node_modules/next-auth/core/routes/session.js
var require_session = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = session;
	var _utils = require_utils$1();
	async function session(params) {
		const { options, sessionStore, newSession, isUpdate } = params;
		const { adapter, jwt, events, callbacks, logger, session: { strategy: sessionStrategy, maxAge: sessionMaxAge } } = options;
		const response = {
			body: {},
			headers: [{
				key: "Content-Type",
				value: "application/json"
			}, ...isUpdate ? [] : [
				{
					key: "Cache-Control",
					value: "private, no-cache, no-store"
				},
				{
					key: "Pragma",
					value: "no-cache"
				},
				{
					key: "Expires",
					value: "0"
				}
			]].filter(Boolean),
			cookies: []
		};
		const sessionToken = sessionStore.value;
		if (!sessionToken) return response;
		if (sessionStrategy === "jwt") try {
			var _response$cookies, _events$session;
			const decodedToken = await jwt.decode({
				...jwt,
				token: sessionToken
			});
			if (!decodedToken) throw new Error("JWT invalid");
			const token = await callbacks.jwt({
				token: decodedToken,
				...isUpdate && { trigger: "update" },
				session: newSession
			});
			const newExpires = (0, _utils.fromDate)(sessionMaxAge);
			const updatedSession = await callbacks.session({
				session: {
					user: {
						name: decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.name,
						email: decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.email,
						image: decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.picture
					},
					expires: newExpires.toISOString()
				},
				token
			});
			response.body = updatedSession;
			const newToken = await jwt.encode({
				...jwt,
				token,
				maxAge: options.session.maxAge
			});
			const sessionCookies = sessionStore.chunk(newToken, { expires: newExpires });
			(_response$cookies = response.cookies) === null || _response$cookies === void 0 || _response$cookies.push(...sessionCookies);
			await ((_events$session = events.session) === null || _events$session === void 0 ? void 0 : _events$session.call(events, {
				session: updatedSession,
				token
			}));
		} catch (error) {
			var _response$cookies2;
			logger.error("JWT_SESSION_ERROR", error);
			(_response$cookies2 = response.cookies) === null || _response$cookies2 === void 0 || _response$cookies2.push(...sessionStore.clean());
		}
		else try {
			const { getSessionAndUser, deleteSession, updateSession } = adapter;
			let userAndSession = await getSessionAndUser(sessionToken);
			if (userAndSession && userAndSession.session.expires.valueOf() < Date.now()) {
				await deleteSession(sessionToken);
				userAndSession = null;
			}
			if (userAndSession) {
				var _response$cookies3, _events$session2;
				const { user, session } = userAndSession;
				const sessionUpdateAge = options.session.updateAge;
				const sessionIsDueToBeUpdatedDate = session.expires.valueOf() - sessionMaxAge * 1e3 + sessionUpdateAge * 1e3;
				const newExpires = (0, _utils.fromDate)(sessionMaxAge);
				if (sessionIsDueToBeUpdatedDate <= Date.now()) await updateSession({
					sessionToken,
					expires: newExpires
				});
				const sessionPayload = await callbacks.session({
					session: {
						user: {
							name: user.name,
							email: user.email,
							image: user.image
						},
						expires: session.expires.toISOString()
					},
					user,
					newSession,
					...isUpdate ? { trigger: "update" } : {}
				});
				response.body = sessionPayload;
				(_response$cookies3 = response.cookies) === null || _response$cookies3 === void 0 || _response$cookies3.push({
					name: options.cookies.sessionToken.name,
					value: sessionToken,
					options: {
						...options.cookies.sessionToken.options,
						expires: newExpires
					}
				});
				await ((_events$session2 = events.session) === null || _events$session2 === void 0 ? void 0 : _events$session2.call(events, { session: sessionPayload }));
			} else if (sessionToken) {
				var _response$cookies4;
				(_response$cookies4 = response.cookies) === null || _response$cookies4 === void 0 || _response$cookies4.push(...sessionStore.clean());
			}
		} catch (error) {
			logger.error("SESSION_ERROR", error);
		}
		return response;
	}
}));
//#endregion
//#region node_modules/next-auth/core/routes/providers.js
var require_providers$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = providers;
	function providers(providers) {
		return {
			headers: [{
				key: "Content-Type",
				value: "application/json"
			}],
			body: providers.reduce((acc, { id, name, type, signinUrl, callbackUrl }) => {
				acc[id] = {
					id,
					name,
					type,
					signinUrl,
					callbackUrl
				};
				return acc;
			}, {})
		};
	}
}));
//#endregion
//#region node_modules/next-auth/core/routes/index.js
var require_routes = /* @__PURE__ */ __commonJSMin(((exports) => {
	var _interopRequireDefault = require_interopRequireDefault();
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "callback", {
		enumerable: true,
		get: function() {
			return _callback.default;
		}
	});
	Object.defineProperty(exports, "providers", {
		enumerable: true,
		get: function() {
			return _providers.default;
		}
	});
	Object.defineProperty(exports, "session", {
		enumerable: true,
		get: function() {
			return _session.default;
		}
	});
	Object.defineProperty(exports, "signin", {
		enumerable: true,
		get: function() {
			return _signin.default;
		}
	});
	Object.defineProperty(exports, "signout", {
		enumerable: true,
		get: function() {
			return _signout.default;
		}
	});
	var _callback = _interopRequireDefault(require_callback());
	var _signin = _interopRequireDefault(require_signin$1());
	var _signout = _interopRequireDefault(require_signout$1());
	var _session = _interopRequireDefault(require_session());
	var _providers = _interopRequireDefault(require_providers$1());
}));
//#endregion
//#region node_modules/preact/dist/preact.js
var require_preact = /* @__PURE__ */ __commonJSMin(((exports) => {
	var n, l, t, u, r, i, o, e, f, c, s, a, h, p = {}, v = [], y = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, d = Array.isArray;
	function w(n, l) {
		for (var t in l) n[t] = l[t];
		return n;
	}
	function g(n) {
		n && n.parentNode && n.parentNode.removeChild(n);
	}
	function _(l, t, u) {
		var r, i, o, e = {};
		for (o in t) "key" == o ? r = t[o] : "ref" == o ? i = t[o] : e[o] = t[o];
		if (arguments.length > 2 && (e.children = arguments.length > 3 ? n.call(arguments, 2) : u), "function" == typeof l && null != l.defaultProps) for (o in l.defaultProps) void 0 === e[o] && (e[o] = l.defaultProps[o]);
		return x(l, e, r, i, null);
	}
	function x(n, u, r, i, o) {
		var e = {
			type: n,
			props: u,
			key: r,
			ref: i,
			__k: null,
			__: null,
			__b: 0,
			__e: null,
			__c: null,
			constructor: void 0,
			__v: null == o ? ++t : o,
			__i: -1,
			__u: 0
		};
		return null == o && null != l.vnode && l.vnode(e), e;
	}
	function m(n) {
		return n.children;
	}
	function b(n, l) {
		this.props = n, this.context = l;
	}
	function k(n, l) {
		if (null == l) return n.__ ? k(n.__, n.__i + 1) : null;
		for (var t; l < n.__k.length; l++) if (null != (t = n.__k[l]) && null != t.__e) return t.__e;
		return "function" == typeof n.type ? k(n) : null;
	}
	function S(n) {
		if (n.__P && n.__d) {
			var t = n.__v, u = t.__e, r = [], i = [], o = w({}, t);
			o.__v = t.__v + 1, l.vnode && l.vnode(o), F(n.__P, o, t, n.__n, n.__P.namespaceURI, 32 & t.__u ? [u] : null, r, null == u ? k(t) : u, !!(32 & t.__u), i), o.__v = t.__v, o.__.__k[o.__i] = o, z(r, o, i), t.__e = t.__ = null, o.__e != u && M(o);
		}
	}
	function M(n) {
		if (null != (n = n.__) && null != n.__c) return n.__e = n.__c.base = null, n.__k.some(function(l) {
			if (null != l && null != l.__e) return n.__e = n.__c.base = l.__e;
		}), M(n);
	}
	function $(n) {
		(!n.__d && (n.__d = !0) && r.push(n) && !C.__r++ || i != l.debounceRendering) && ((i = l.debounceRendering) || o)(C);
	}
	function C() {
		try {
			for (var n, l = 1; r.length;) r.length > l && r.sort(e), n = r.shift(), l = r.length, S(n);
		} finally {
			r.length = C.__r = 0;
		}
	}
	function I(n, l, t, u, r, i, o, e, f, c, s) {
		var a, h, y, d, w, g, _, x = u && u.__k || v, m = l.length;
		for (f = P(t, l, x, f, m), a = 0; a < m; a++) null != (y = t.__k[a]) && (h = -1 != y.__i && x[y.__i] || p, y.__i = a, g = F(n, y, h, r, i, o, e, f, c, s), d = y.__e, y.ref && h.ref != y.ref && (h.ref && q(h.ref, null, y), s.push(y.ref, y.__c || d, y)), null == w && null != d && (w = d), (_ = !!(4 & y.__u)) || h.__k === y.__k ? f = A(y, f, n, _) : "function" == typeof y.type && void 0 !== g ? f = g : d && (f = d.nextSibling), y.__u &= -7);
		return t.__e = w, f;
	}
	function P(n, l, t, u, r) {
		var i, o, e, f, c, s = t.length, a = s, h = 0;
		for (n.__k = new Array(r), i = 0; i < r; i++) null != (o = l[i]) && "boolean" != typeof o && "function" != typeof o ? ("string" == typeof o || "number" == typeof o || "bigint" == typeof o || o.constructor == String ? o = n.__k[i] = x(null, o, null, null, null) : d(o) ? o = n.__k[i] = x(m, { children: o }, null, null, null) : void 0 === o.constructor && o.__b > 0 ? o = n.__k[i] = x(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v) : n.__k[i] = o, f = i + h, o.__ = n, o.__b = n.__b + 1, e = null, -1 != (c = o.__i = H(o, t, f, a)) && (a--, (e = t[c]) && (e.__u |= 2)), null == e || null == e.__v ? (-1 == c && (r > s ? h-- : r < s && h++), "function" != typeof o.type && (o.__u |= 4)) : c != f && (c == f - 1 ? h-- : c == f + 1 ? h++ : (c > f ? h-- : h++, o.__u |= 4))) : n.__k[i] = null;
		if (a) for (i = 0; i < s; i++) null != (e = t[i]) && 0 == (2 & e.__u) && (e.__e == u && (u = k(e)), B(e, e));
		return u;
	}
	function A(n, l, t, u) {
		var r, i;
		if ("function" == typeof n.type) {
			for (r = n.__k, i = 0; r && i < r.length; i++) r[i] && (r[i].__ = n, l = A(r[i], l, t, u));
			return l;
		}
		n.__e != l && (u && (l && n.type && !l.parentNode && (l = k(n)), t.insertBefore(n.__e, l || null)), l = n.__e);
		do
			l = l && l.nextSibling;
		while (null != l && 8 == l.nodeType);
		return l;
	}
	function H(n, l, t, u) {
		var r, i, o, e = n.key, f = n.type, c = l[t], s = null != c && 0 == (2 & c.__u);
		if (null === c && null == e || s && e == c.key && f == c.type) return t;
		if (u > (s ? 1 : 0)) {
			for (r = t - 1, i = t + 1; r >= 0 || i < l.length;) if (null != (c = l[o = r >= 0 ? r-- : i++]) && 0 == (2 & c.__u) && e == c.key && f == c.type) return o;
		}
		return -1;
	}
	function L(n, l, t) {
		"-" == l[0] ? n.setProperty(l, null == t ? "" : t) : n[l] = null == t ? "" : "number" != typeof t || y.test(l) ? t : t + "px";
	}
	function T(n, l, t, u, r) {
		var i, o;
		n: if ("style" == l) if ("string" == typeof t) n.style.cssText = t;
		else {
			if ("string" == typeof u && (n.style.cssText = u = ""), u) for (l in u) t && l in t || L(n.style, l, "");
			if (t) for (l in t) u && t[l] == u[l] || L(n.style, l, t[l]);
		}
		else if ("o" == l[0] && "n" == l[1]) i = l != (l = l.replace(f, "$1")), o = l.toLowerCase(), l = o in n || "onFocusOut" == l || "onFocusIn" == l ? o.slice(2) : l.slice(2), n.l || (n.l = {}), n.l[l + i] = t, t ? u ? t.t = u.t : (t.t = c, n.addEventListener(l, i ? a : s, i)) : n.removeEventListener(l, i ? a : s, i);
		else {
			if ("http://www.w3.org/2000/svg" == r) l = l.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
			else if ("width" != l && "height" != l && "href" != l && "list" != l && "form" != l && "tabIndex" != l && "download" != l && "rowSpan" != l && "colSpan" != l && "role" != l && "popover" != l && l in n) try {
				n[l] = null == t ? "" : t;
				break n;
			} catch (n) {}
			"function" == typeof t || (null == t || !1 === t && "-" != l[4] ? n.removeAttribute(l) : n.setAttribute(l, "popover" == l && 1 == t ? "" : t));
		}
	}
	function j(n) {
		return function(t) {
			if (this.l) {
				var u = this.l[t.type + n];
				if (null == t.u) t.u = c++;
				else if (t.u < u.t) return;
				return u(l.event ? l.event(t) : t);
			}
		};
	}
	function F(n, t, u, r, i, o, e, f, c, s) {
		var a, h, p, y, _, x, k, S, M, $, C, P, A, H, L, T = t.type;
		if (void 0 !== t.constructor) return null;
		128 & u.__u && (c = !!(32 & u.__u), o = [f = t.__e = u.__e]), (a = l.__b) && a(t);
		n: if ("function" == typeof T) try {
			if (S = t.props, M = T.prototype && T.prototype.render, $ = (a = T.contextType) && r[a.__c], C = a ? $ ? $.props.value : a.__ : r, u.__c ? k = (h = t.__c = u.__c).__ = h.__E : (M ? t.__c = h = new T(S, C) : (t.__c = h = new b(S, C), h.constructor = T, h.render = D), $ && $.sub(h), h.state || (h.state = {}), h.__n = r, p = h.__d = !0, h.__h = [], h._sb = []), M && null == h.__s && (h.__s = h.state), M && null != T.getDerivedStateFromProps && (h.__s == h.state && (h.__s = w({}, h.__s)), w(h.__s, T.getDerivedStateFromProps(S, h.__s))), y = h.props, _ = h.state, h.__v = t, p) M && null == T.getDerivedStateFromProps && null != h.componentWillMount && h.componentWillMount(), M && null != h.componentDidMount && h.__h.push(h.componentDidMount);
			else {
				if (M && null == T.getDerivedStateFromProps && S !== y && null != h.componentWillReceiveProps && h.componentWillReceiveProps(S, C), t.__v == u.__v || !h.__e && null != h.shouldComponentUpdate && !1 === h.shouldComponentUpdate(S, h.__s, C)) {
					t.__v != u.__v && (h.props = S, h.state = h.__s, h.__d = !1), t.__e = u.__e, t.__k = u.__k, t.__k.some(function(n) {
						n && (n.__ = t);
					}), v.push.apply(h.__h, h._sb), h._sb = [], h.__h.length && e.push(h);
					break n;
				}
				null != h.componentWillUpdate && h.componentWillUpdate(S, h.__s, C), M && null != h.componentDidUpdate && h.__h.push(function() {
					h.componentDidUpdate(y, _, x);
				});
			}
			if (h.context = C, h.props = S, h.__P = n, h.__e = !1, P = l.__r, A = 0, M) h.state = h.__s, h.__d = !1, P && P(t), a = h.render(h.props, h.state, h.context), v.push.apply(h.__h, h._sb), h._sb = [];
			else do
				h.__d = !1, P && P(t), a = h.render(h.props, h.state, h.context), h.state = h.__s;
			while (h.__d && ++A < 25);
			h.state = h.__s, null != h.getChildContext && (r = w(w({}, r), h.getChildContext())), M && !p && null != h.getSnapshotBeforeUpdate && (x = h.getSnapshotBeforeUpdate(y, _)), H = null != a && a.type === m && null == a.key ? N(a.props.children) : a, f = I(n, d(H) ? H : [H], t, u, r, i, o, e, f, c, s), h.base = t.__e, t.__u &= -161, h.__h.length && e.push(h), k && (h.__E = h.__ = null);
		} catch (n) {
			if (t.__v = null, c || null != o) if (n.then) {
				for (t.__u |= c ? 160 : 128; f && 8 == f.nodeType && f.nextSibling;) f = f.nextSibling;
				o[o.indexOf(f)] = null, t.__e = f;
			} else {
				for (L = o.length; L--;) g(o[L]);
				O(t);
			}
			else t.__e = u.__e, t.__k = u.__k, n.then || O(t);
			l.__e(n, t, u);
		}
		else null == o && t.__v == u.__v ? (t.__k = u.__k, t.__e = u.__e) : f = t.__e = V(u.__e, t, u, r, i, o, e, c, s);
		return (a = l.diffed) && a(t), 128 & t.__u ? void 0 : f;
	}
	function O(n) {
		n && (n.__c && (n.__c.__e = !0), n.__k && n.__k.some(O));
	}
	function z(n, t, u) {
		for (var r = 0; r < u.length; r++) q(u[r], u[++r], u[++r]);
		l.__c && l.__c(t, n), n.some(function(t) {
			try {
				n = t.__h, t.__h = [], n.some(function(n) {
					n.call(t);
				});
			} catch (n) {
				l.__e(n, t.__v);
			}
		});
	}
	function N(n) {
		return "object" != typeof n || null == n || n.__b > 0 ? n : d(n) ? n.map(N) : w({}, n);
	}
	function V(t, u, r, i, o, e, f, c, s) {
		var a, h, v, y, w, _, x, m = r.props || p, b = u.props, S = u.type;
		if ("svg" == S ? o = "http://www.w3.org/2000/svg" : "math" == S ? o = "http://www.w3.org/1998/Math/MathML" : o || (o = "http://www.w3.org/1999/xhtml"), null != e) {
			for (a = 0; a < e.length; a++) if ((w = e[a]) && "setAttribute" in w == !!S && (S ? w.localName == S : 3 == w.nodeType)) {
				t = w, e[a] = null;
				break;
			}
		}
		if (null == t) {
			if (null == S) return document.createTextNode(b);
			t = document.createElementNS(o, S, b.is && b), c && (l.__m && l.__m(u, e), c = !1), e = null;
		}
		if (null == S) m === b || c && t.data == b || (t.data = b);
		else {
			if (e = e && n.call(t.childNodes), !c && null != e) for (m = {}, a = 0; a < t.attributes.length; a++) m[(w = t.attributes[a]).name] = w.value;
			for (a in m) w = m[a], "dangerouslySetInnerHTML" == a ? v = w : "children" == a || a in b || "value" == a && "defaultValue" in b || "checked" == a && "defaultChecked" in b || T(t, a, null, w, o);
			for (a in b) w = b[a], "children" == a ? y = w : "dangerouslySetInnerHTML" == a ? h = w : "value" == a ? _ = w : "checked" == a ? x = w : c && "function" != typeof w || m[a] === w || T(t, a, w, m[a], o);
			if (h) c || v && (h.__html == v.__html || h.__html == t.innerHTML) || (t.innerHTML = h.__html), u.__k = [];
			else if (v && (t.innerHTML = ""), I("template" == u.type ? t.content : t, d(y) ? y : [y], u, r, i, "foreignObject" == S ? "http://www.w3.org/1999/xhtml" : o, e, f, e ? e[0] : r.__k && k(r, 0), c, s), null != e) for (a = e.length; a--;) g(e[a]);
			c || (a = "value", "progress" == S && null == _ ? t.removeAttribute("value") : null != _ && (_ !== t[a] || "progress" == S && !_ || "option" == S && _ != m[a]) && T(t, a, _, m[a], o), a = "checked", null != x && x != t[a] && T(t, a, x, m[a], o));
		}
		return t;
	}
	function q(n, t, u) {
		try {
			if ("function" == typeof n) {
				var r = "function" == typeof n.__u;
				r && n.__u(), r && null == t || (n.__u = n(t));
			} else n.current = t;
		} catch (n) {
			l.__e(n, u);
		}
	}
	function B(n, t, u) {
		var r, i;
		if (l.unmount && l.unmount(n), (r = n.ref) && (r.current && r.current != n.__e || q(r, null, t)), null != (r = n.__c)) {
			if (r.componentWillUnmount) try {
				r.componentWillUnmount();
			} catch (n) {
				l.__e(n, t);
			}
			r.base = r.__P = null;
		}
		if (r = n.__k) for (i = 0; i < r.length; i++) r[i] && B(r[i], t, u || "function" != typeof n.type);
		u || g(n.__e), n.__c = n.__ = n.__e = void 0;
	}
	function D(n, l, t) {
		return this.constructor(n, t);
	}
	function E(t, u, r) {
		var i, o, e, f;
		u == document && (u = document.documentElement), l.__ && l.__(t, u), o = (i = "function" == typeof r) ? null : r && r.__k || u.__k, e = [], f = [], F(u, t = (!i && r || u).__k = _(m, null, [t]), o || p, p, u.namespaceURI, !i && r ? [r] : o ? null : u.firstChild ? n.call(u.childNodes) : null, e, !i && r ? r : o ? o.__e : u.firstChild, i, f), z(e, t, f);
	}
	n = v.slice, l = { __e: function(n, l, t, u) {
		for (var r, i, o; l = l.__;) if ((r = l.__c) && !r.__) try {
			if ((i = r.constructor) && null != i.getDerivedStateFromError && (r.setState(i.getDerivedStateFromError(n)), o = r.__d), null != r.componentDidCatch && (r.componentDidCatch(n, u || {}), o = r.__d), o) return r.__E = r;
		} catch (l) {
			n = l;
		}
		throw n;
	} }, t = 0, u = function(n) {
		return null != n && void 0 === n.constructor;
	}, b.prototype.setState = function(n, l) {
		var t = null != this.__s && this.__s != this.state ? this.__s : this.__s = w({}, this.state);
		"function" == typeof n && (n = n(w({}, t), this.props)), n && w(t, n), null != n && this.__v && (l && this._sb.push(l), $(this));
	}, b.prototype.forceUpdate = function(n) {
		this.__v && (this.__e = !0, n && this.__h.push(n), $(this));
	}, b.prototype.render = m, r = [], o = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e = function(n, l) {
		return n.__v.__b - l.__v.__b;
	}, C.__r = 0, f = /(PointerCapture)$|Capture$/i, c = 0, s = j(!1), a = j(!0), h = 0, exports.Component = b, exports.Fragment = m, exports.cloneElement = function(l, t, u) {
		var r, i, o, e, f = w({}, l.props);
		for (o in l.type && l.type.defaultProps && (e = l.type.defaultProps), t) "key" == o ? r = t[o] : "ref" == o ? i = t[o] : f[o] = void 0 === t[o] && null != e ? e[o] : t[o];
		return arguments.length > 2 && (f.children = arguments.length > 3 ? n.call(arguments, 2) : u), x(l.type, f, r || l.key, i || l.ref, null);
	}, exports.createContext = function(n) {
		function l(n) {
			var t, u;
			return this.getChildContext || (t = /* @__PURE__ */ new Set(), (u = {})[l.__c] = this, this.getChildContext = function() {
				return u;
			}, this.componentWillUnmount = function() {
				t = null;
			}, this.shouldComponentUpdate = function(n) {
				this.props.value != n.value && t.forEach(function(n) {
					n.__e = !0, $(n);
				});
			}, this.sub = function(n) {
				t.add(n);
				var l = n.componentWillUnmount;
				n.componentWillUnmount = function() {
					t && t.delete(n), l && l.call(n);
				};
			}), n.children;
		}
		return l.__c = "__cC" + h++, l.__ = n, l.Provider = l.__l = (l.Consumer = function(n, l) {
			return n.children(l);
		}).contextType = l, l;
	}, exports.createElement = _, exports.createRef = function() {
		return { current: null };
	}, exports.h = _, exports.hydrate = function n(l, t) {
		E(l, t, n);
	}, exports.isValidElement = u, exports.options = l, exports.render = E, exports.toChildArray = function n(l, t) {
		return t = t || [], null == l || "boolean" == typeof l || (d(l) ? l.some(function(l) {
			n(l, t);
		}) : t.push(l)), t;
	};
}));
//#endregion
//#region node_modules/preact-render-to-string/dist/commonjs.js
var require_commonjs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(function(e, t) {
		"object" == typeof exports && "undefined" != typeof module ? t(exports, require_preact()) : "function" == typeof define && define.amd ? define(["exports", "preact"], t) : t((e || self).preactRenderToString = {}, e.preact);
	})(exports, function(e, t) {
		var n = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|^--/i, r = /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/, o = /[\s\n\\/='"\0<>]/, i = /^xlink:?./, s = /["&<]/;
		function a(e) {
			if (!1 === s.test(e += "")) return e;
			for (var t = 0, n = 0, r = "", o = ""; n < e.length; n++) {
				switch (e.charCodeAt(n)) {
					case 34:
						o = "&quot;";
						break;
					case 38:
						o = "&amp;";
						break;
					case 60:
						o = "&lt;";
						break;
					default: continue;
				}
				n !== t && (r += e.slice(t, n)), r += o, t = n + 1;
			}
			return n !== t && (r += e.slice(t, n)), r;
		}
		var l = function(e, t) {
			return String(e).replace(/(\n+)/g, "$1" + (t || "	"));
		}, f = function(e, t, n) {
			return String(e).length > (t || 40) || !n && -1 !== String(e).indexOf("\n") || -1 !== String(e).indexOf("<");
		}, u = {}, p = /([A-Z])/g;
		function c(e) {
			var t = "";
			for (var r in e) {
				var o = e[r];
				null != o && "" !== o && (t && (t += " "), t += "-" == r[0] ? r : u[r] || (u[r] = r.replace(p, "-$1").toLowerCase()), t = "number" == typeof o && !1 === n.test(r) ? t + ": " + o + "px;" : t + ": " + o + ";");
			}
			return t || void 0;
		}
		function _(e, t) {
			return Array.isArray(t) ? t.reduce(_, e) : null != t && !1 !== t && e.push(t), e;
		}
		function d() {
			this.__d = !0;
		}
		function v(e, t) {
			return {
				__v: e,
				context: t,
				props: e.props,
				setState: d,
				forceUpdate: d,
				__d: !0,
				__h: []
			};
		}
		function g(e, t) {
			var n = e.contextType, r = n && t[n.__c];
			return null != n ? r ? r.props.value : n.__ : t;
		}
		var h = [];
		function y(e, n, s, u, p, d) {
			if (null == e || "boolean" == typeof e) return "";
			if ("object" != typeof e) return "function" == typeof e ? "" : a(e);
			var m = s.pretty, b = m && "string" == typeof m ? m : "	";
			if (Array.isArray(e)) {
				for (var x = "", k = 0; k < e.length; k++) m && k > 0 && (x += "\n"), x += y(e[k], n, s, u, p, d);
				return x;
			}
			if (void 0 !== e.constructor) return "";
			var S, w = e.type, C = e.props, O = !1;
			if ("function" == typeof w) {
				if (O = !0, !s.shallow || !u && !1 !== s.renderRootComponent) {
					if (w === t.Fragment) {
						var j = [];
						return _(j, e.props.children), y(j, n, s, !1 !== s.shallowHighOrder, p, d);
					}
					var F, A = e.__c = v(e, n);
					t.options.__b && t.options.__b(e);
					var T = t.options.__r;
					if (w.prototype && "function" == typeof w.prototype.render) {
						var H = g(w, n);
						(A = e.__c = new w(C, H)).__v = e, A._dirty = A.__d = !0, A.props = C, A.state ?? (A.state = {}), null == A._nextState && null == A.__s && (A._nextState = A.__s = A.state), A.context = H, w.getDerivedStateFromProps ? A.state = Object.assign({}, A.state, w.getDerivedStateFromProps(A.props, A.state)) : A.componentWillMount && (A.componentWillMount(), A.state = A._nextState !== A.state ? A._nextState : A.__s !== A.state ? A.__s : A.state), T && T(e), F = A.render(A.props, A.state, A.context);
					} else for (var M = g(w, n), L = 0; A.__d && L++ < 25;) A.__d = !1, T && T(e), F = w.call(e.__c, C, M);
					return A.getChildContext && (n = Object.assign({}, n, A.getChildContext())), t.options.diffed && t.options.diffed(e), y(F, n, s, !1 !== s.shallowHighOrder, p, d);
				}
				w = (S = w).displayName || S !== Function && S.name || function(e) {
					var t = (Function.prototype.toString.call(e).match(/^\s*function\s+([^( ]+)/) || "")[1];
					if (!t) {
						for (var n = -1, r = h.length; r--;) if (h[r] === e) {
							n = r;
							break;
						}
						n < 0 && (n = h.push(e) - 1), t = "UnnamedComponent" + n;
					}
					return t;
				}(S);
			}
			var E, $, D = "<" + w;
			if (C) {
				var N = Object.keys(C);
				s && !0 === s.sortAttributes && N.sort();
				for (var P = 0; P < N.length; P++) {
					var R = N[P], W = C[R];
					if ("children" !== R) {
						if (!o.test(R) && (s && s.allAttributes || "key" !== R && "ref" !== R && "__self" !== R && "__source" !== R)) {
							if ("defaultValue" === R) R = "value";
							else if ("defaultChecked" === R) R = "checked";
							else if ("defaultSelected" === R) R = "selected";
							else if ("className" === R) {
								if (void 0 !== C.class) continue;
								R = "class";
							} else p && i.test(R) && (R = R.toLowerCase().replace(/^xlink:?/, "xlink:"));
							if ("htmlFor" === R) {
								if (C.for) continue;
								R = "for";
							}
							"style" === R && W && "object" == typeof W && (W = c(W)), "a" === R[0] && "r" === R[1] && "boolean" == typeof W && (W = String(W));
							var q = s.attributeHook && s.attributeHook(R, W, n, s, O);
							if (q || "" === q) D += q;
							else if ("dangerouslySetInnerHTML" === R) $ = W && W.__html;
							else if ("textarea" === w && "value" === R) E = W;
							else if ((W || 0 === W || "" === W) && "function" != typeof W) {
								if (!(!0 !== W && "" !== W || (W = R, s && s.xml))) {
									D = D + " " + R;
									continue;
								}
								if ("value" === R) {
									if ("select" === w) {
										d = W;
										continue;
									}
									"option" === w && d == W && void 0 === C.selected && (D += " selected");
								}
								D = D + " " + R + "=\"" + a(W) + "\"";
							}
						}
					} else E = W;
				}
			}
			if (m) {
				var I = D.replace(/\n\s*/, " ");
				I === D || ~I.indexOf("\n") ? m && ~D.indexOf("\n") && (D += "\n") : D = I;
			}
			if (D += ">", o.test(w)) throw new Error(w + " is not a valid HTML tag name in " + D);
			var U, V = r.test(w) || s.voidElements && s.voidElements.test(w), z = [];
			if ($) m && f($) && ($ = "\n" + b + l($, b)), D += $;
			else if (null != E && _(U = [], E).length) {
				for (var Z = m && ~D.indexOf("\n"), B = !1, G = 0; G < U.length; G++) {
					var J = U[G];
					if (null != J && !1 !== J) {
						var K = y(J, n, s, !0, "svg" === w || "foreignObject" !== w && p, d);
						if (m && !Z && f(K) && (Z = !0), K) if (m) {
							var Q = K.length > 0 && "<" != K[0];
							B && Q ? z[z.length - 1] += K : z.push(K), B = Q;
						} else z.push(K);
					}
				}
				if (m && Z) for (var X = z.length; X--;) z[X] = "\n" + b + l(z[X], b);
			}
			if (z.length || $) D += z.join("");
			else if (s && s.xml) return D.substring(0, D.length - 1) + " />";
			return !V || U || $ ? (m && ~D.indexOf("\n") && (D += "\n"), D = D + "</" + w + ">") : D = D.replace(/>$/, " />"), D;
		}
		var m = { shallow: !0 };
		k.render = k;
		var b = function(e, t) {
			return k(e, t, m);
		}, x = [];
		function k(e, n, r) {
			n = n || {};
			var o = t.options.__s;
			t.options.__s = !0;
			var i, s = t.h(t.Fragment, null);
			return s.__k = [e], i = r && (r.pretty || r.voidElements || r.sortAttributes || r.shallow || r.allAttributes || r.xml || r.attributeHook) ? y(e, n, r) : F(e, n, !1, void 0, s), t.options.__c && t.options.__c(e, x), t.options.__s = o, x.length = 0, i;
		}
		function S(e) {
			return null == e || "boolean" == typeof e ? null : "string" == typeof e || "number" == typeof e || "bigint" == typeof e ? t.h(null, null, e) : e;
		}
		function w(e, t) {
			return "className" === e ? "class" : "htmlFor" === e ? "for" : "defaultValue" === e ? "value" : "defaultChecked" === e ? "checked" : "defaultSelected" === e ? "selected" : t && i.test(e) ? e.toLowerCase().replace(/^xlink:?/, "xlink:") : e;
		}
		function C(e, t) {
			return "style" === e && null != t && "object" == typeof t ? c(t) : "a" === e[0] && "r" === e[1] && "boolean" == typeof t ? String(t) : t;
		}
		var O = Array.isArray, j = Object.assign;
		function F(e, n, i, s, l) {
			if (null == e || !0 === e || !1 === e || "" === e) return "";
			if ("object" != typeof e) return "function" == typeof e ? "" : a(e);
			if (O(e)) {
				var f = "";
				l.__k = e;
				for (var u = 0; u < e.length; u++) f += F(e[u], n, i, s, l), e[u] = S(e[u]);
				return f;
			}
			if (void 0 !== e.constructor) return "";
			e.__ = l, t.options.__b && t.options.__b(e);
			var p = e.type, c = e.props;
			if ("function" == typeof p) {
				var _;
				if (p === t.Fragment) _ = c.children;
				else {
					_ = p.prototype && "function" == typeof p.prototype.render ? function(e, n) {
						var r = e.type, o = g(r, n), i = new r(e.props, o);
						e.__c = i, i.__v = e, i.__d = !0, i.props = e.props, i.state ??= {}, i.__s ??= i.state, i.context = o, r.getDerivedStateFromProps ? i.state = j({}, i.state, r.getDerivedStateFromProps(i.props, i.state)) : i.componentWillMount && (i.componentWillMount(), i.state = i.__s !== i.state ? i.__s : i.state);
						var s = t.options.__r;
						return s && s(e), i.render(i.props, i.state, i.context);
					}(e, n) : function(e, n) {
						var r, o = v(e, n), i = g(e.type, n);
						e.__c = o;
						for (var s = t.options.__r, a = 0; o.__d && a++ < 25;) o.__d = !1, s && s(e), r = e.type.call(o, e.props, i);
						return r;
					}(e, n);
					var d = e.__c;
					d.getChildContext && (n = j({}, n, d.getChildContext()));
				}
				var h = F(_ = null != _ && _.type === t.Fragment && null == _.key ? _.props.children : _, n, i, s, e);
				return t.options.diffed && t.options.diffed(e), e.__ = void 0, t.options.unmount && t.options.unmount(e), h;
			}
			var y, m, b = "<";
			if (b += p, c) for (var x in y = c.children, c) {
				var k = c[x];
				if (!("key" === x || "ref" === x || "__self" === x || "__source" === x || "children" === x || "className" === x && "class" in c || "htmlFor" === x && "for" in c || o.test(x))) {
					if (k = C(x = w(x, i), k), "dangerouslySetInnerHTML" === x) m = k && k.__html;
					else if ("textarea" === p && "value" === x) y = k;
					else if ((k || 0 === k || "" === k) && "function" != typeof k) {
						if (!0 === k || "" === k) {
							k = x, b = b + " " + x;
							continue;
						}
						if ("value" === x) {
							if ("select" === p) {
								s = k;
								continue;
							}
							"option" !== p || s != k || "selected" in c || (b += " selected");
						}
						b = b + " " + x + "=\"" + a(k) + "\"";
					}
				}
			}
			var A = b;
			if (b += ">", o.test(p)) throw new Error(p + " is not a valid HTML tag name in " + b);
			var T = "", H = !1;
			if (m) T += m, H = !0;
			else if ("string" == typeof y) T += a(y), H = !0;
			else if (O(y)) {
				e.__k = y;
				for (var M = 0; M < y.length; M++) {
					var L = y[M];
					if (y[M] = S(L), null != L && !1 !== L) {
						var E = F(L, n, "svg" === p || "foreignObject" !== p && i, s, e);
						E && (T += E, H = !0);
					}
				}
			} else if (null != y && !1 !== y && !0 !== y) {
				e.__k = [S(y)];
				var $ = F(y, n, "svg" === p || "foreignObject" !== p && i, s, e);
				$ && (T += $, H = !0);
			}
			if (t.options.diffed && t.options.diffed(e), e.__ = void 0, t.options.unmount && t.options.unmount(e), H) b += T;
			else if (r.test(p)) return A + " />";
			return b + "</" + p + ">";
		}
		k.shallowRender = b, e.default = k, e.render = k, e.renderToStaticMarkup = k, e.renderToString = k, e.shallowRender = b;
	});
}));
//#endregion
//#region node_modules/preact-render-to-string/dist/index.js
var require_dist$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_commonjs().default;
}));
//#endregion
//#region node_modules/@babel/runtime/helpers/extends.js
var require_extends = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function _extends() {
		return module.exports = _extends = Object.assign ? Object.assign.bind() : function(n) {
			for (var e = 1; e < arguments.length; e++) {
				var t = arguments[e];
				for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
			}
			return n;
		}, module.exports.__esModule = true, module.exports["default"] = module.exports, _extends.apply(null, arguments);
	}
	module.exports = _extends, module.exports.__esModule = true, module.exports["default"] = module.exports;
}));
//#endregion
//#region node_modules/next-auth/core/pages/signin.js
var require_signin = /* @__PURE__ */ __commonJSMin(((exports) => {
	var _interopRequireDefault = require_interopRequireDefault();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SigninPage;
	var _preact = require_preact();
	var _extends2 = _interopRequireDefault(require_extends());
	function hexToRgba(hex, alpha = 1) {
		if (!hex) return;
		hex = hex.replace(/^#/, "");
		if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		const bigint = parseInt(hex, 16);
		const r = bigint >> 16 & 255;
		const g = bigint >> 8 & 255;
		const b = bigint & 255;
		alpha = Math.min(Math.max(alpha, 0), 1);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}
	function SigninPage(props) {
		var _errors$errorType;
		const { csrfToken, providers, callbackUrl, theme, email, error: errorType } = props;
		const providersToRender = providers.filter((provider) => {
			if (provider.type === "oauth" || provider.type === "email") return true;
			else if (provider.type === "credentials" && provider.credentials) return true;
			return false;
		});
		if (typeof document !== "undefined" && theme.buttonText) document.documentElement.style.setProperty("--button-text-color", theme.buttonText);
		if (typeof document !== "undefined" && theme.brandColor) document.documentElement.style.setProperty("--brand-color", theme.brandColor);
		const errors = {
			Signin: "Try signing in with a different account.",
			OAuthSignin: "Try signing in with a different account.",
			OAuthCallback: "Try signing in with a different account.",
			OAuthCreateAccount: "Try signing in with a different account.",
			EmailCreateAccount: "Try signing in with a different account.",
			Callback: "Try signing in with a different account.",
			OAuthAccountNotLinked: "To confirm your identity, sign in with the same account you used originally.",
			EmailSignin: "The e-mail could not be sent.",
			CredentialsSignin: "Sign in failed. Check the details you provided are correct.",
			SessionRequired: "Please sign in to access this page.",
			default: "Unable to sign in."
		};
		const error = errorType && ((_errors$errorType = errors[errorType]) !== null && _errors$errorType !== void 0 ? _errors$errorType : errors.default);
		const providerLogoPath = "https://authjs.dev/img/providers";
		return (0, _preact.h)("div", { className: "signin" }, theme.brandColor && (0, _preact.h)("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${theme.brandColor}
        }
      ` } }), theme.buttonText && (0, _preact.h)("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --button-text-color: ${theme.buttonText}
        }
      ` } }), (0, _preact.h)("div", { className: "card" }, theme.logo && (0, _preact.h)("img", {
			src: theme.logo,
			alt: "Logo",
			className: "logo"
		}), error && (0, _preact.h)("div", { className: "error" }, (0, _preact.h)("p", null, error)), providersToRender.map((provider, i) => {
			let bg, text, logo, logoDark, bgDark, textDark;
			if (provider.type === "oauth") {
				var _provider$style;
				({bg = "", text = "", logo = "", bgDark = bg, textDark = text, logoDark = ""} = (_provider$style = provider.style) !== null && _provider$style !== void 0 ? _provider$style : {});
				logo = logo.startsWith("/") ? `${providerLogoPath}${logo}` : logo;
				logoDark = logoDark.startsWith("/") ? `${providerLogoPath}${logoDark}` : logoDark || logo;
				logoDark || (logoDark = logo);
			}
			return (0, _preact.h)("div", {
				key: provider.id,
				className: "provider"
			}, provider.type === "oauth" && (0, _preact.h)("form", {
				action: provider.signinUrl,
				method: "POST"
			}, (0, _preact.h)("input", {
				type: "hidden",
				name: "csrfToken",
				value: csrfToken
			}), callbackUrl && (0, _preact.h)("input", {
				type: "hidden",
				name: "callbackUrl",
				value: callbackUrl
			}), (0, _preact.h)("button", {
				type: "submit",
				className: "button",
				style: {
					"--provider-bg": bg,
					"--provider-dark-bg": bgDark,
					"--provider-color": text,
					"--provider-dark-color": textDark,
					"--provider-bg-hover": hexToRgba(bg, .8),
					"--provider-dark-bg-hover": hexToRgba(bgDark, .8)
				}
			}, logo && (0, _preact.h)("img", {
				loading: "lazy",
				height: 24,
				width: 24,
				id: "provider-logo",
				src: `${logo.startsWith("/") ? providerLogoPath : ""}${logo}`
			}), logoDark && (0, _preact.h)("img", {
				loading: "lazy",
				height: 24,
				width: 24,
				id: "provider-logo-dark",
				src: `${logo.startsWith("/") ? providerLogoPath : ""}${logoDark}`
			}), (0, _preact.h)("span", null, "Sign in with ", provider.name))), (provider.type === "email" || provider.type === "credentials") && i > 0 && providersToRender[i - 1].type !== "email" && providersToRender[i - 1].type !== "credentials" && (0, _preact.h)("hr", null), provider.type === "email" && (0, _preact.h)("form", {
				action: provider.signinUrl,
				method: "POST"
			}, (0, _preact.h)("input", {
				type: "hidden",
				name: "csrfToken",
				value: csrfToken
			}), (0, _preact.h)("label", {
				className: "section-header",
				htmlFor: `input-email-for-${provider.id}-provider`
			}, "Email"), (0, _preact.h)("input", {
				id: `input-email-for-${provider.id}-provider`,
				autoFocus: true,
				type: "email",
				name: "email",
				value: email,
				placeholder: "email@example.com",
				required: true
			}), (0, _preact.h)("button", {
				id: "submitButton",
				type: "submit"
			}, "Sign in with ", provider.name)), provider.type === "credentials" && (0, _preact.h)("form", {
				action: provider.callbackUrl,
				method: "POST"
			}, (0, _preact.h)("input", {
				type: "hidden",
				name: "csrfToken",
				value: csrfToken
			}), Object.keys(provider.credentials).map((credential) => {
				var _provider$credentials, _provider$credentials2, _provider$credentials3;
				return (0, _preact.h)("div", { key: `input-group-${provider.id}` }, (0, _preact.h)("label", {
					className: "section-header",
					htmlFor: `input-${credential}-for-${provider.id}-provider`
				}, (_provider$credentials = provider.credentials[credential].label) !== null && _provider$credentials !== void 0 ? _provider$credentials : credential), (0, _preact.h)("input", (0, _extends2.default)({
					name: credential,
					id: `input-${credential}-for-${provider.id}-provider`,
					type: (_provider$credentials2 = provider.credentials[credential].type) !== null && _provider$credentials2 !== void 0 ? _provider$credentials2 : "text",
					placeholder: (_provider$credentials3 = provider.credentials[credential].placeholder) !== null && _provider$credentials3 !== void 0 ? _provider$credentials3 : ""
				}, provider.credentials[credential])));
			}), (0, _preact.h)("button", { type: "submit" }, "Sign in with ", provider.name)), (provider.type === "email" || provider.type === "credentials") && i + 1 < providersToRender.length && (0, _preact.h)("hr", null));
		})));
	}
}));
//#endregion
//#region node_modules/next-auth/core/pages/signout.js
var require_signout = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = SignoutPage;
	var _preact = require_preact();
	function SignoutPage(props) {
		const { url, csrfToken, theme } = props;
		return (0, _preact.h)("div", { className: "signout" }, theme.brandColor && (0, _preact.h)("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${theme.brandColor}
        }
      ` } }), theme.buttonText && (0, _preact.h)("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --button-text-color: ${theme.buttonText}
        }
      ` } }), (0, _preact.h)("div", { className: "card" }, theme.logo && (0, _preact.h)("img", {
			src: theme.logo,
			alt: "Logo",
			className: "logo"
		}), (0, _preact.h)("h1", null, "Signout"), (0, _preact.h)("p", null, "Are you sure you want to sign out?"), (0, _preact.h)("form", {
			action: `${url}/signout`,
			method: "POST"
		}, (0, _preact.h)("input", {
			type: "hidden",
			name: "csrfToken",
			value: csrfToken
		}), (0, _preact.h)("button", {
			id: "submitButton",
			type: "submit"
		}, "Sign out"))));
	}
}));
//#endregion
//#region node_modules/next-auth/core/pages/verify-request.js
var require_verify_request = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = VerifyRequestPage;
	var _preact = require_preact();
	function VerifyRequestPage(props) {
		const { url, theme } = props;
		return (0, _preact.h)("div", { className: "verify-request" }, theme.brandColor && (0, _preact.h)("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${theme.brandColor}
        }
      ` } }), (0, _preact.h)("div", { className: "card" }, theme.logo && (0, _preact.h)("img", {
			src: theme.logo,
			alt: "Logo",
			className: "logo"
		}), (0, _preact.h)("h1", null, "Check your email"), (0, _preact.h)("p", null, "A sign in link has been sent to your email address."), (0, _preact.h)("p", null, (0, _preact.h)("a", {
			className: "site",
			href: url.origin
		}, url.host))));
	}
}));
//#endregion
//#region node_modules/next-auth/core/pages/error.js
var require_error = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = ErrorPage;
	var _preact = require_preact();
	function ErrorPage(props) {
		var _errors$error$toLower;
		const { url, error = "default", theme } = props;
		const signinPageUrl = `${url}/signin`;
		const errors = {
			default: {
				status: 200,
				heading: "Error",
				message: (0, _preact.h)("p", null, (0, _preact.h)("a", {
					className: "site",
					href: url === null || url === void 0 ? void 0 : url.origin
				}, url === null || url === void 0 ? void 0 : url.host))
			},
			configuration: {
				status: 500,
				heading: "Server error",
				message: (0, _preact.h)("div", null, (0, _preact.h)("p", null, "There is a problem with the server configuration."), (0, _preact.h)("p", null, "Check the server logs for more information."))
			},
			accessdenied: {
				status: 403,
				heading: "Access Denied",
				message: (0, _preact.h)("div", null, (0, _preact.h)("p", null, "You do not have permission to sign in."), (0, _preact.h)("p", null, (0, _preact.h)("a", {
					className: "button",
					href: signinPageUrl
				}, "Sign in")))
			},
			verification: {
				status: 403,
				heading: "Unable to sign in",
				message: (0, _preact.h)("div", null, (0, _preact.h)("p", null, "The sign in link is no longer valid."), (0, _preact.h)("p", null, "It may have been used already or it may have expired.")),
				signin: (0, _preact.h)("a", {
					className: "button",
					href: signinPageUrl
				}, "Sign in")
			}
		};
		const { status, heading, message, signin } = (_errors$error$toLower = errors[error.toLowerCase()]) !== null && _errors$error$toLower !== void 0 ? _errors$error$toLower : errors.default;
		return {
			status,
			html: (0, _preact.h)("div", { className: "error" }, (theme === null || theme === void 0 ? void 0 : theme.brandColor) && (0, _preact.h)("style", { dangerouslySetInnerHTML: { __html: `
        :root {
          --brand-color: ${theme === null || theme === void 0 ? void 0 : theme.brandColor}
        }
      ` } }), (0, _preact.h)("div", { className: "card" }, (theme === null || theme === void 0 ? void 0 : theme.logo) && (0, _preact.h)("img", {
				src: theme.logo,
				alt: "Logo",
				className: "logo"
			}), (0, _preact.h)("h1", null, heading), (0, _preact.h)("div", { className: "message" }, message), signin))
		};
	}
}));
//#endregion
//#region node_modules/next-auth/css/index.js
var require_css = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = function() {
		return ":root{--border-width:1px;--border-radius:0.5rem;--color-error:#c94b4b;--color-info:#157efb;--color-info-hover:#0f6ddb;--color-info-text:#fff}.__next-auth-theme-auto,.__next-auth-theme-light{--color-background:#ececec;--color-background-hover:hsla(0,0%,93%,.8);--color-background-card:#fff;--color-text:#000;--color-primary:#444;--color-control-border:#bbb;--color-button-active-background:#f9f9f9;--color-button-active-border:#aaa;--color-separator:#ccc}.__next-auth-theme-dark{--color-background:#161b22;--color-background-hover:rgba(22,27,34,.8);--color-background-card:#0d1117;--color-text:#fff;--color-primary:#ccc;--color-control-border:#555;--color-button-active-background:#060606;--color-button-active-border:#666;--color-separator:#444}@media (prefers-color-scheme:dark){.__next-auth-theme-auto{--color-background:#161b22;--color-background-hover:rgba(22,27,34,.8);--color-background-card:#0d1117;--color-text:#fff;--color-primary:#ccc;--color-control-border:#555;--color-button-active-background:#060606;--color-button-active-border:#666;--color-separator:#444}a.button,button{background-color:var(--provider-dark-bg,var(--color-background));color:var(--provider-dark-color,var(--color-primary))}a.button:hover,button:hover{background-color:var(--provider-dark-bg-hover,var(--color-background-hover))!important}#provider-logo{display:none!important}#provider-logo-dark{display:block!important;width:25px}}html{box-sizing:border-box}*,:after,:before{box-sizing:inherit;margin:0;padding:0}body{background-color:var(--color-background);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;margin:0;padding:0}h1{font-weight:400}h1,p{color:var(--color-text);margin-bottom:1.5rem;padding:0 1rem}form{margin:0;padding:0}label{font-weight:500;margin-bottom:.25rem;text-align:left}input[type],label{color:var(--color-text);display:block}input[type]{background:var(--color-background-card);border:var(--border-width) solid var(--color-control-border);border-radius:var(--border-radius);box-sizing:border-box;font-size:1rem;padding:.5rem 1rem;width:100%}input[type]:focus{box-shadow:none}p{font-size:1.1rem;line-height:2rem}a.button{line-height:1rem;text-decoration:none}a.button:link,a.button:visited{background-color:var(--color-background);color:var(--color-primary)}button span{flex-grow:1}a.button,button{align-items:center;background-color:var(--provider-bg);border-color:rgba(0,0,0,.1);border-radius:var(--border-radius);color:var(--provider-color,var(--color-primary));display:flex;font-size:1.1rem;font-weight:500;justify-content:center;min-height:62px;padding:.75rem 1rem;position:relative;transition:all .1s ease-in-out}a.button:hover,button:hover{background-color:var(--provider-bg-hover,var(--color-background-hover));cursor:pointer}a.button:active,button:active{cursor:pointer}a.button #provider-logo,button #provider-logo{display:block;width:25px}a.button #provider-logo-dark,button #provider-logo-dark{display:none}#submitButton{background-color:var(--brand-color,var(--color-info));color:var(--button-text-color,var(--color-info-text));width:100%}#submitButton:hover{background-color:var(--button-hover-bg,var(--color-info-hover))!important}a.site{color:var(--color-primary);font-size:1rem;line-height:2rem;text-decoration:none}a.site:hover{text-decoration:underline}.page{box-sizing:border-box;display:grid;height:100%;margin:0;padding:0;place-items:center;position:absolute;width:100%}.page>div{text-align:center}.error a.button{margin-top:.5rem;padding-left:2rem;padding-right:2rem}.error .message{margin-bottom:1.5rem}.signin input[type=text]{display:block;margin-left:auto;margin-right:auto}.signin hr{border:0;border-top:1px solid var(--color-separator);display:block;margin:2rem auto 1rem;overflow:visible}.signin hr:before{background:var(--color-background-card);color:#888;content:\"or\";padding:0 .4rem;position:relative;top:-.7rem}.signin .error{background:#f5f5f5;background:var(--color-error);border-radius:.3rem;font-weight:500}.signin .error p{color:var(--color-info-text);font-size:.9rem;line-height:1.2rem;padding:.5rem 1rem;text-align:left}.signin form,.signin>div{display:block}.signin form input[type],.signin>div input[type]{margin-bottom:.5rem}.signin form button,.signin>div button{width:100%}.signin .provider+.provider{margin-top:1rem}.logo{display:inline-block;margin:1.25rem 0;max-height:70px;max-width:150px}.card{background-color:var(--color-background-card);border-radius:2rem;padding:1.25rem 2rem}.card .header{color:var(--color-primary)}.section-header{color:var(--color-text)}@media screen and (min-width:450px){.card{margin:2rem 0;width:368px}}@media screen and (max-width:450px){.card{margin:1rem 0;width:343px}}";
	};
}));
//#endregion
//#region node_modules/next-auth/core/pages/index.js
var require_pages = /* @__PURE__ */ __commonJSMin(((exports) => {
	var _interopRequireDefault = require_interopRequireDefault();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = renderPage;
	var _preactRenderToString = _interopRequireDefault(require_dist$1());
	var _signin = _interopRequireDefault(require_signin());
	var _signout = _interopRequireDefault(require_signout());
	var _verifyRequest = _interopRequireDefault(require_verify_request());
	var _error = _interopRequireDefault(require_error());
	var _css = _interopRequireDefault(require_css());
	function renderPage(params) {
		const { url, theme, query, cookies } = params;
		function send({ html, title, status }) {
			var _theme$colorScheme;
			return {
				cookies,
				status,
				headers: [{
					key: "Content-Type",
					value: "text/html"
				}],
				body: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta http-equiv="X-UA-Compatible" content="IE=edge"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${(0, _css.default)()}</style><title>${title}</title></head><body class="__next-auth-theme-${(_theme$colorScheme = theme === null || theme === void 0 ? void 0 : theme.colorScheme) !== null && _theme$colorScheme !== void 0 ? _theme$colorScheme : "auto"}"><div class="page">${(0, _preactRenderToString.default)(html)}</div></body></html>`
			};
		}
		return {
			signin(props) {
				return send({
					html: (0, _signin.default)({
						csrfToken: params.csrfToken,
						providers: params.providers,
						callbackUrl: params.callbackUrl,
						theme,
						...query,
						...props
					}),
					title: "Sign In"
				});
			},
			signout(props) {
				return send({
					html: (0, _signout.default)({
						csrfToken: params.csrfToken,
						url,
						theme,
						...props
					}),
					title: "Sign Out"
				});
			},
			verifyRequest(props) {
				return send({
					html: (0, _verifyRequest.default)({
						url,
						theme,
						...props
					}),
					title: "Verify Request"
				});
			},
			error(props) {
				return send({
					...(0, _error.default)({
						url,
						theme,
						...props
					}),
					title: "Error"
				});
			}
		};
	}
}));
//#endregion
//#region node_modules/next-auth/utils/merge.js
var require_merge = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.merge = merge;
	function isObject(item) {
		return item && typeof item === "object" && !Array.isArray(item);
	}
	function merge(target, ...sources) {
		if (!sources.length) return target;
		const source = sources.shift();
		if (isObject(target) && isObject(source)) for (const key in source) if (isObject(source[key])) {
			if (!target[key]) Object.assign(target, { [key]: {} });
			merge(target[key], source[key]);
		} else Object.assign(target, { [key]: source[key] });
		return merge(target, ...sources);
	}
}));
//#endregion
//#region node_modules/next-auth/core/lib/providers.js
var require_providers = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = parseProviders;
	var _merge = require_merge();
	function parseProviders(params) {
		const { url, providerId } = params;
		const providers = params.providers.map(({ options: userOptions, ...rest }) => {
			var _ref;
			if (rest.type === "oauth") {
				var _normalizedUserOption;
				const normalizedOptions = normalizeOAuthOptions(rest);
				const normalizedUserOptions = normalizeOAuthOptions(userOptions, true);
				const id = (_normalizedUserOption = normalizedUserOptions === null || normalizedUserOptions === void 0 ? void 0 : normalizedUserOptions.id) !== null && _normalizedUserOption !== void 0 ? _normalizedUserOption : rest.id;
				return (0, _merge.merge)(normalizedOptions, {
					...normalizedUserOptions,
					signinUrl: `${url}/signin/${id}`,
					callbackUrl: `${url}/callback/${id}`
				});
			}
			const id = (_ref = userOptions === null || userOptions === void 0 ? void 0 : userOptions.id) !== null && _ref !== void 0 ? _ref : rest.id;
			return (0, _merge.merge)(rest, {
				...userOptions,
				signinUrl: `${url}/signin/${id}`,
				callbackUrl: `${url}/callback/${id}`
			});
		});
		return {
			providers,
			provider: providers.find(({ id }) => id === providerId)
		};
	}
	function normalizeOAuthOptions(oauthOptions, isUserOptions = false) {
		var _normalized$version;
		if (!oauthOptions) return;
		const normalized = Object.entries(oauthOptions).reduce((acc, [key, value]) => {
			if ([
				"authorization",
				"token",
				"userinfo"
			].includes(key) && typeof value === "string") {
				var _url$searchParams;
				const url = new URL(value);
				acc[key] = {
					url: `${url.origin}${url.pathname}`,
					params: Object.fromEntries((_url$searchParams = url.searchParams) !== null && _url$searchParams !== void 0 ? _url$searchParams : [])
				};
			} else acc[key] = value;
			return acc;
		}, {});
		if (!isUserOptions && !((_normalized$version = normalized.version) !== null && _normalized$version !== void 0 && _normalized$version.startsWith("1."))) {
			var _ref2, _normalized$idToken, _normalized$wellKnown, _normalized$authoriza;
			normalized.idToken = Boolean((_ref2 = (_normalized$idToken = normalized.idToken) !== null && _normalized$idToken !== void 0 ? _normalized$idToken : (_normalized$wellKnown = normalized.wellKnown) === null || _normalized$wellKnown === void 0 ? void 0 : _normalized$wellKnown.includes("openid-configuration")) !== null && _ref2 !== void 0 ? _ref2 : (_normalized$authoriza = normalized.authorization) === null || _normalized$authoriza === void 0 || (_normalized$authoriza = _normalized$authoriza.params) === null || _normalized$authoriza === void 0 || (_normalized$authoriza = _normalized$authoriza.scope) === null || _normalized$authoriza === void 0 ? void 0 : _normalized$authoriza.includes("openid"));
			if (!normalized.checks) normalized.checks = ["state"];
		}
		return normalized;
	}
}));
//#endregion
//#region node_modules/next-auth/core/lib/default-callbacks.js
var require_default_callbacks = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.defaultCallbacks = void 0;
	exports.defaultCallbacks = {
		signIn() {
			return true;
		},
		redirect({ url, baseUrl }) {
			if (url.startsWith("/")) return `${baseUrl}${url}`;
			else if (new URL(url).origin === baseUrl) return url;
			return baseUrl;
		},
		session({ session }) {
			return session;
		},
		jwt({ token }) {
			return token;
		}
	};
}));
//#endregion
//#region node_modules/next-auth/core/lib/csrf-token.js
var require_csrf_token = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createCSRFToken = createCSRFToken;
	var _crypto$1 = __require("crypto");
	function createCSRFToken({ options, cookieValue, isPost, bodyValue }) {
		if (cookieValue) {
			const [csrfToken, csrfTokenHash] = cookieValue.split("|");
			if (csrfTokenHash === (0, _crypto$1.createHash)("sha256").update(`${csrfToken}${options.secret}`).digest("hex")) return {
				csrfTokenVerified: isPost && csrfToken === bodyValue,
				csrfToken
			};
		}
		const csrfToken = (0, _crypto$1.randomBytes)(32).toString("hex");
		return {
			cookie: `${csrfToken}|${(0, _crypto$1.createHash)("sha256").update(`${csrfToken}${options.secret}`).digest("hex")}`,
			csrfToken
		};
	}
}));
//#endregion
//#region node_modules/next-auth/core/lib/callback-url.js
var require_callback_url = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.createCallbackUrl = createCallbackUrl;
	async function createCallbackUrl({ options, paramValue, cookieValue }) {
		const { url, callbacks } = options;
		let callbackUrl = url.origin;
		if (paramValue) callbackUrl = await callbacks.redirect({
			url: paramValue,
			baseUrl: url.origin
		});
		else if (cookieValue) callbackUrl = await callbacks.redirect({
			url: cookieValue,
			baseUrl: url.origin
		});
		return {
			callbackUrl,
			callbackUrlCookie: callbackUrl !== cookieValue ? callbackUrl : void 0
		};
	}
}));
//#endregion
//#region node_modules/next-auth/utils/parse-url.js
var require_parse_url = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = parseUrl;
	function parseUrl(url) {
		var _url2;
		const defaultUrl = new URL("http://localhost:3000/api/auth");
		if (url && !url.startsWith("http")) url = `https://${url}`;
		const _url = new URL((_url2 = url) !== null && _url2 !== void 0 ? _url2 : defaultUrl);
		const path = (_url.pathname === "/" ? defaultUrl.pathname : _url.pathname).replace(/\/$/, "");
		const base = `${_url.origin}${path}`;
		return {
			origin: _url.origin,
			host: _url.host,
			path,
			base,
			toString: () => base
		};
	}
}));
//#endregion
//#region node_modules/next-auth/core/init.js
var require_init = /* @__PURE__ */ __commonJSMin(((exports) => {
	var _interopRequireDefault = require_interopRequireDefault();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.init = init;
	var _crypto = __require("crypto");
	var _logger = _interopRequireDefault(require_logger());
	var _errors = require_errors$1();
	var _providers = _interopRequireDefault(require_providers());
	var _utils = require_utils$1();
	var cookie = _interopRequireWildcard(require_cookie$1());
	var jwt = _interopRequireWildcard(require_jwt());
	var _defaultCallbacks = require_default_callbacks();
	var _csrfToken = require_csrf_token();
	var _callbackUrl = require_callback_url();
	var _parseUrl = _interopRequireDefault(require_parse_url());
	function _getRequireWildcardCache(e) {
		if ("function" != typeof WeakMap) return null;
		var r = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
		return (_getRequireWildcardCache = function(e) {
			return e ? t : r;
		})(e);
	}
	function _interopRequireWildcard(e, r) {
		if (!r && e && e.__esModule) return e;
		if (null === e || "object" != typeof e && "function" != typeof e) return { default: e };
		var t = _getRequireWildcardCache(r);
		if (t && t.has(e)) return t.get(e);
		var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
		for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
			var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
			i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
		}
		return n.default = e, t && t.set(e, n), n;
	}
	async function init({ authOptions, providerId, action, origin, cookies: reqCookies, callbackUrl: reqCallbackUrl, csrfToken: reqCsrfToken, isPost }) {
		var _authOptions$useSecur, _authOptions$events;
		const url = (0, _parseUrl.default)(origin);
		const secret = (0, _utils.createSecret)({
			authOptions,
			url
		});
		const { providers, provider } = (0, _providers.default)({
			providers: authOptions.providers,
			url,
			providerId
		});
		const maxAge = 720 * 60 * 60;
		const options = {
			debug: false,
			pages: {},
			theme: {
				colorScheme: "auto",
				logo: "",
				brandColor: "",
				buttonText: ""
			},
			...authOptions,
			url,
			action,
			provider,
			cookies: {
				...cookie.defaultCookies((_authOptions$useSecur = authOptions.useSecureCookies) !== null && _authOptions$useSecur !== void 0 ? _authOptions$useSecur : url.base.startsWith("https://")),
				...authOptions.cookies
			},
			secret,
			providers,
			session: {
				strategy: authOptions.adapter ? "database" : "jwt",
				maxAge,
				updateAge: 1440 * 60,
				generateSessionToken: () => {
					var _randomUUID;
					return (_randomUUID = _crypto.randomUUID === null || _crypto.randomUUID === void 0 ? void 0 : (0, _crypto.randomUUID)()) !== null && _randomUUID !== void 0 ? _randomUUID : (0, _crypto.randomBytes)(32).toString("hex");
				},
				...authOptions.session
			},
			jwt: {
				secret,
				maxAge,
				encode: jwt.encode,
				decode: jwt.decode,
				...authOptions.jwt
			},
			events: (0, _errors.eventsErrorHandler)((_authOptions$events = authOptions.events) !== null && _authOptions$events !== void 0 ? _authOptions$events : {}, _logger.default),
			adapter: (0, _errors.adapterErrorHandler)(authOptions.adapter, _logger.default),
			callbacks: {
				..._defaultCallbacks.defaultCallbacks,
				...authOptions.callbacks
			},
			logger: _logger.default,
			callbackUrl: url.origin
		};
		const cookies = [];
		const { csrfToken, cookie: csrfCookie, csrfTokenVerified } = (0, _csrfToken.createCSRFToken)({
			options,
			cookieValue: reqCookies === null || reqCookies === void 0 ? void 0 : reqCookies[options.cookies.csrfToken.name],
			isPost,
			bodyValue: reqCsrfToken
		});
		options.csrfToken = csrfToken;
		options.csrfTokenVerified = csrfTokenVerified;
		if (csrfCookie) cookies.push({
			name: options.cookies.csrfToken.name,
			value: csrfCookie,
			options: options.cookies.csrfToken.options
		});
		const { callbackUrl, callbackUrlCookie } = await (0, _callbackUrl.createCallbackUrl)({
			options,
			cookieValue: reqCookies === null || reqCookies === void 0 ? void 0 : reqCookies[options.cookies.callbackUrl.name],
			paramValue: reqCallbackUrl
		});
		options.callbackUrl = callbackUrl;
		if (callbackUrlCookie) cookies.push({
			name: options.cookies.callbackUrl.name,
			value: callbackUrlCookie,
			options: options.cookies.callbackUrl.options
		});
		return {
			options,
			cookies
		};
	}
}));
//#endregion
//#region node_modules/next-auth/core/lib/assert.js
var require_assert = /* @__PURE__ */ __commonJSMin(((exports) => {
	var _interopRequireDefault = require_interopRequireDefault();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.assertConfig = assertConfig;
	var _errors = require_errors$1();
	var _parseUrl = _interopRequireDefault(require_parse_url());
	var _cookie = require_cookie$1();
	var warned = false;
	function isValidHttpUrl(url, baseUrl) {
		try {
			return /^https?:/.test(new URL(url, url.startsWith("/") ? baseUrl : void 0).protocol);
		} catch (_unused) {
			return false;
		}
	}
	function assertConfig(params) {
		var _req$query, _req$query2, _options$useSecureCoo, _req$cookies, _options$cookies$call, _options$cookies;
		const { options, req } = params;
		const warnings = [];
		if (!warned) {
			if (!req.origin) warnings.push("NEXTAUTH_URL");
			if (!options.secret && false);
			if (options.debug) warnings.push("DEBUG_ENABLED");
		}
		if (!options.secret && true) return new _errors.MissingSecret("Please define a `secret` in production.");
		if (!((_req$query = req.query) !== null && _req$query !== void 0 && _req$query.nextauth) && !req.action) return new _errors.MissingAPIRoute("Cannot find [...nextauth].{js,ts} in `/pages/api/auth`. Make sure the filename is written correctly.");
		const callbackUrlParam = (_req$query2 = req.query) === null || _req$query2 === void 0 ? void 0 : _req$query2.callbackUrl;
		const url = (0, _parseUrl.default)(req.origin);
		if (callbackUrlParam && !isValidHttpUrl(callbackUrlParam, url.base)) return new _errors.InvalidCallbackUrl(`Invalid callback URL. Received: ${callbackUrlParam}`);
		const { callbackUrl: defaultCallbackUrl } = (0, _cookie.defaultCookies)((_options$useSecureCoo = options.useSecureCookies) !== null && _options$useSecureCoo !== void 0 ? _options$useSecureCoo : url.base.startsWith("https://"));
		const callbackUrlCookie = (_req$cookies = req.cookies) === null || _req$cookies === void 0 ? void 0 : _req$cookies[(_options$cookies$call = (_options$cookies = options.cookies) === null || _options$cookies === void 0 || (_options$cookies = _options$cookies.callbackUrl) === null || _options$cookies === void 0 ? void 0 : _options$cookies.name) !== null && _options$cookies$call !== void 0 ? _options$cookies$call : defaultCallbackUrl.name];
		if (callbackUrlCookie && !isValidHttpUrl(callbackUrlCookie, url.base)) return new _errors.InvalidCallbackUrl(`Invalid callback URL. Received: ${callbackUrlCookie}`);
		let hasCredentials, hasEmail;
		let hasTwitterOAuth2;
		for (const provider of options.providers) if (provider.type === "credentials") hasCredentials = true;
		else if (provider.type === "email") hasEmail = true;
		else if (provider.id === "twitter" && provider.version === "2.0") hasTwitterOAuth2 = true;
		if (hasCredentials) {
			var _options$session;
			const dbStrategy = ((_options$session = options.session) === null || _options$session === void 0 ? void 0 : _options$session.strategy) === "database";
			const onlyCredentials = !options.providers.some((p) => p.type !== "credentials");
			if (dbStrategy && onlyCredentials) return new _errors.UnsupportedStrategy("Signin in with credentials only supported if JWT strategy is enabled");
			if (options.providers.some((p) => p.type === "credentials" && !p.authorize)) return new _errors.MissingAuthorize("Must define an authorize() handler to use credentials authentication provider");
		}
		if (hasEmail) {
			const { adapter } = options;
			if (!adapter) return new _errors.MissingAdapter("E-mail login requires an adapter.");
			const missingMethods = [
				"createVerificationToken",
				"useVerificationToken",
				"getUserByEmail"
			].filter((method) => !adapter[method]);
			if (missingMethods.length) return new _errors.MissingAdapterMethods(`Required adapter methods were missing: ${missingMethods.join(", ")}`);
		}
		if (!warned) {
			if (hasTwitterOAuth2) warnings.push("TWITTER_OAUTH_2_BETA");
			warned = true;
		}
		return warnings;
	}
}));
//#endregion
//#region node_modules/cookie/index.js
/*!
* cookie
* Copyright(c) 2012-2014 Roman Shtylman
* Copyright(c) 2015 Douglas Christopher Wilson
* MIT Licensed
*/
var require_cookie = /* @__PURE__ */ __commonJSMin(((exports) => {
	/**
	* Module exports.
	* @public
	*/
	exports.parse = parse;
	exports.serialize = serialize;
	/**
	* Module variables.
	* @private
	*/
	var __toString = Object.prototype.toString;
	var __hasOwnProperty = Object.prototype.hasOwnProperty;
	/**
	* RegExp to match cookie-name in RFC 6265 sec 4.1.1
	* This refers out to the obsoleted definition of token in RFC 2616 sec 2.2
	* which has been replaced by the token definition in RFC 7230 appendix B.
	*
	* cookie-name       = token
	* token             = 1*tchar
	* tchar             = "!" / "#" / "$" / "%" / "&" / "'" /
	*                     "*" / "+" / "-" / "." / "^" / "_" /
	*                     "`" / "|" / "~" / DIGIT / ALPHA
	*/
	var cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
	/**
	* RegExp to match cookie-value in RFC 6265 sec 4.1.1
	*
	* cookie-value      = *cookie-octet / ( DQUOTE *cookie-octet DQUOTE )
	* cookie-octet      = %x21 / %x23-2B / %x2D-3A / %x3C-5B / %x5D-7E
	*                     ; US-ASCII characters excluding CTLs,
	*                     ; whitespace DQUOTE, comma, semicolon,
	*                     ; and backslash
	*/
	var cookieValueRegExp = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/;
	/**
	* RegExp to match domain-value in RFC 6265 sec 4.1.1
	*
	* domain-value      = <subdomain>
	*                     ; defined in [RFC1034], Section 3.5, as
	*                     ; enhanced by [RFC1123], Section 2.1
	* <subdomain>       = <label> | <subdomain> "." <label>
	* <label>           = <let-dig> [ [ <ldh-str> ] <let-dig> ]
	*                     Labels must be 63 characters or less.
	*                     'let-dig' not 'letter' in the first char, per RFC1123
	* <ldh-str>         = <let-dig-hyp> | <let-dig-hyp> <ldh-str>
	* <let-dig-hyp>     = <let-dig> | "-"
	* <let-dig>         = <letter> | <digit>
	* <letter>          = any one of the 52 alphabetic characters A through Z in
	*                     upper case and a through z in lower case
	* <digit>           = any one of the ten digits 0 through 9
	*
	* Keep support for leading dot: https://github.com/jshttp/cookie/issues/173
	*
	* > (Note that a leading %x2E ("."), if present, is ignored even though that
	* character is not permitted, but a trailing %x2E ("."), if present, will
	* cause the user agent to ignore the attribute.)
	*/
	var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
	/**
	* RegExp to match path-value in RFC 6265 sec 4.1.1
	*
	* path-value        = <any CHAR except CTLs or ";">
	* CHAR              = %x01-7F
	*                     ; defined in RFC 5234 appendix B.1
	*/
	var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
	/**
	* Parse a cookie header.
	*
	* Parse the given cookie header string into an object
	* The object has the various cookies as keys(names) => values
	*
	* @param {string} str
	* @param {object} [opt]
	* @return {object}
	* @public
	*/
	function parse(str, opt) {
		if (typeof str !== "string") throw new TypeError("argument str must be a string");
		var obj = {};
		var len = str.length;
		if (len < 2) return obj;
		var dec = opt && opt.decode || decode;
		var index = 0;
		var eqIdx = 0;
		var endIdx = 0;
		do {
			eqIdx = str.indexOf("=", index);
			if (eqIdx === -1) break;
			endIdx = str.indexOf(";", index);
			if (endIdx === -1) endIdx = len;
			else if (eqIdx > endIdx) {
				index = str.lastIndexOf(";", eqIdx - 1) + 1;
				continue;
			}
			var keyStartIdx = startIndex(str, index, eqIdx);
			var keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
			var key = str.slice(keyStartIdx, keyEndIdx);
			if (!__hasOwnProperty.call(obj, key)) {
				var valStartIdx = startIndex(str, eqIdx + 1, endIdx);
				var valEndIdx = endIndex(str, endIdx, valStartIdx);
				if (str.charCodeAt(valStartIdx) === 34 && str.charCodeAt(valEndIdx - 1) === 34) {
					valStartIdx++;
					valEndIdx--;
				}
				obj[key] = tryDecode(str.slice(valStartIdx, valEndIdx), dec);
			}
			index = endIdx + 1;
		} while (index < len);
		return obj;
	}
	function startIndex(str, index, max) {
		do {
			var code = str.charCodeAt(index);
			if (code !== 32 && code !== 9) return index;
		} while (++index < max);
		return max;
	}
	function endIndex(str, index, min) {
		while (index > min) {
			var code = str.charCodeAt(--index);
			if (code !== 32 && code !== 9) return index + 1;
		}
		return min;
	}
	/**
	* Serialize data into a cookie header.
	*
	* Serialize a name value pair into a cookie string suitable for
	* http headers. An optional options object specifies cookie parameters.
	*
	* serialize('foo', 'bar', { httpOnly: true })
	*   => "foo=bar; httpOnly"
	*
	* @param {string} name
	* @param {string} val
	* @param {object} [opt]
	* @return {string}
	* @public
	*/
	function serialize(name, val, opt) {
		var enc = opt && opt.encode || encodeURIComponent;
		if (typeof enc !== "function") throw new TypeError("option encode is invalid");
		if (!cookieNameRegExp.test(name)) throw new TypeError("argument name is invalid");
		var value = enc(val);
		if (!cookieValueRegExp.test(value)) throw new TypeError("argument val is invalid");
		var str = name + "=" + value;
		if (!opt) return str;
		if (null != opt.maxAge) {
			var maxAge = Math.floor(opt.maxAge);
			if (!isFinite(maxAge)) throw new TypeError("option maxAge is invalid");
			str += "; Max-Age=" + maxAge;
		}
		if (opt.domain) {
			if (!domainValueRegExp.test(opt.domain)) throw new TypeError("option domain is invalid");
			str += "; Domain=" + opt.domain;
		}
		if (opt.path) {
			if (!pathValueRegExp.test(opt.path)) throw new TypeError("option path is invalid");
			str += "; Path=" + opt.path;
		}
		if (opt.expires) {
			var expires = opt.expires;
			if (!isDate(expires) || isNaN(expires.valueOf())) throw new TypeError("option expires is invalid");
			str += "; Expires=" + expires.toUTCString();
		}
		if (opt.httpOnly) str += "; HttpOnly";
		if (opt.secure) str += "; Secure";
		if (opt.partitioned) str += "; Partitioned";
		if (opt.priority) switch (typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority) {
			case "low":
				str += "; Priority=Low";
				break;
			case "medium":
				str += "; Priority=Medium";
				break;
			case "high":
				str += "; Priority=High";
				break;
			default: throw new TypeError("option priority is invalid");
		}
		if (opt.sameSite) switch (typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite) {
			case true:
				str += "; SameSite=Strict";
				break;
			case "lax":
				str += "; SameSite=Lax";
				break;
			case "strict":
				str += "; SameSite=Strict";
				break;
			case "none":
				str += "; SameSite=None";
				break;
			default: throw new TypeError("option sameSite is invalid");
		}
		return str;
	}
	/**
	* URL-decode string value. Optimized to skip native call when no %.
	*
	* @param {string} str
	* @returns {string}
	*/
	function decode(str) {
		return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
	}
	/**
	* Determine if value is a Date.
	*
	* @param {*} val
	* @private
	*/
	function isDate(val) {
		return __toString.call(val) === "[object Date]";
	}
	/**
	* Try decoding a string using a decoding function.
	*
	* @param {string} str
	* @param {function} decode
	* @private
	*/
	function tryDecode(str, decode) {
		try {
			return decode(str);
		} catch (e) {
			return str;
		}
	}
}));
//#endregion
//#region node_modules/next-auth/core/index.js
var require_core = /* @__PURE__ */ __commonJSMin(((exports) => {
	var _interopRequireDefault = require_interopRequireDefault();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.AuthHandler = AuthHandler;
	var _logger = _interopRequireWildcard(require_logger());
	var _detectOrigin = require_detect_origin();
	var routes = _interopRequireWildcard(require_routes());
	var _pages = _interopRequireDefault(require_pages());
	var _init = require_init();
	var _assert = require_assert();
	var _cookie = require_cookie$1();
	var _cookie2 = require_cookie();
	function _getRequireWildcardCache(e) {
		if ("function" != typeof WeakMap) return null;
		var r = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
		return (_getRequireWildcardCache = function(e) {
			return e ? t : r;
		})(e);
	}
	function _interopRequireWildcard(e, r) {
		if (!r && e && e.__esModule) return e;
		if (null === e || "object" != typeof e && "function" != typeof e) return { default: e };
		var t = _getRequireWildcardCache(r);
		if (t && t.has(e)) return t.get(e);
		var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
		for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
			var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
			i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
		}
		return n.default = e, t && t.set(e, n), n;
	}
	async function getBody(req) {
		try {
			return await req.json();
		} catch (_unused) {}
	}
	async function toInternalRequest(req) {
		var _headers$xForwarded2;
		if (req instanceof Request) {
			var _req$headers$get, _url$searchParams$get, _headers$xForwarded;
			const url = new URL(req.url);
			const nextauth = url.pathname.split("/").slice(3);
			const headers = Object.fromEntries(req.headers);
			const query = Object.fromEntries(url.searchParams);
			query.nextauth = nextauth;
			return {
				action: nextauth[0],
				method: req.method,
				headers,
				body: await getBody(req),
				cookies: (0, _cookie2.parse)((_req$headers$get = req.headers.get("cookie")) !== null && _req$headers$get !== void 0 ? _req$headers$get : ""),
				providerId: nextauth[1],
				error: (_url$searchParams$get = url.searchParams.get("error")) !== null && _url$searchParams$get !== void 0 ? _url$searchParams$get : nextauth[1],
				origin: (0, _detectOrigin.detectOrigin)((_headers$xForwarded = headers["x-forwarded-host"]) !== null && _headers$xForwarded !== void 0 ? _headers$xForwarded : headers.host, headers["x-forwarded-proto"]),
				query
			};
		}
		const { headers } = req;
		const host = (_headers$xForwarded2 = headers === null || headers === void 0 ? void 0 : headers["x-forwarded-host"]) !== null && _headers$xForwarded2 !== void 0 ? _headers$xForwarded2 : headers === null || headers === void 0 ? void 0 : headers.host;
		req.origin = (0, _detectOrigin.detectOrigin)(host, headers === null || headers === void 0 ? void 0 : headers["x-forwarded-proto"]);
		return req;
	}
	async function AuthHandler(params) {
		var _req$body$callbackUrl, _req$body, _req$query2, _req$body2;
		const { options: authOptions, req: incomingRequest } = params;
		const req = await toInternalRequest(incomingRequest);
		(0, _logger.setLogger)(authOptions.logger, authOptions.debug);
		const assertionResult = (0, _assert.assertConfig)({
			options: authOptions,
			req
		});
		if (Array.isArray(assertionResult)) assertionResult.forEach(_logger.default.warn);
		else if (assertionResult instanceof Error) {
			var _req$query;
			_logger.default.error(assertionResult.code, assertionResult);
			if (![
				"signin",
				"signout",
				"error",
				"verify-request"
			].includes(req.action) || req.method !== "GET") return {
				status: 500,
				headers: [{
					key: "Content-Type",
					value: "application/json"
				}],
				body: { message: `There is a problem with the server configuration. Check the server logs for more information.` }
			};
			const { pages, theme } = authOptions;
			const authOnErrorPage = (pages === null || pages === void 0 ? void 0 : pages.error) && ((_req$query = req.query) === null || _req$query === void 0 || (_req$query = _req$query.callbackUrl) === null || _req$query === void 0 ? void 0 : _req$query.startsWith(pages.error));
			if (!(pages !== null && pages !== void 0 && pages.error) || authOnErrorPage) {
				if (authOnErrorPage) _logger.default.error("AUTH_ON_ERROR_PAGE_ERROR", /* @__PURE__ */ new Error(`The error page ${pages === null || pages === void 0 ? void 0 : pages.error} should not require authentication`));
				return (0, _pages.default)({ theme }).error({ error: "configuration" });
			}
			return { redirect: `${pages.error}?error=Configuration` };
		}
		const { action, providerId, error, method = "GET" } = req;
		const { options, cookies } = await (0, _init.init)({
			authOptions,
			action,
			providerId,
			origin: req.origin,
			callbackUrl: (_req$body$callbackUrl = (_req$body = req.body) === null || _req$body === void 0 ? void 0 : _req$body.callbackUrl) !== null && _req$body$callbackUrl !== void 0 ? _req$body$callbackUrl : (_req$query2 = req.query) === null || _req$query2 === void 0 ? void 0 : _req$query2.callbackUrl,
			csrfToken: (_req$body2 = req.body) === null || _req$body2 === void 0 ? void 0 : _req$body2.csrfToken,
			cookies: req.cookies,
			isPost: method === "POST"
		});
		const sessionStore = new _cookie.SessionStore(options.cookies.sessionToken, req, options.logger);
		if (method === "GET") {
			const render = (0, _pages.default)({
				...options,
				query: req.query,
				cookies
			});
			const { pages } = options;
			switch (action) {
				case "providers": return await routes.providers(options.providers);
				case "session": {
					const session = await routes.session({
						options,
						sessionStore
					});
					if (session.cookies) cookies.push(...session.cookies);
					return {
						...session,
						cookies
					};
				}
				case "csrf": return {
					headers: [
						{
							key: "Content-Type",
							value: "application/json"
						},
						{
							key: "Cache-Control",
							value: "private, no-cache, no-store"
						},
						{
							key: "Pragma",
							value: "no-cache"
						},
						{
							key: "Expires",
							value: "0"
						}
					],
					body: { csrfToken: options.csrfToken },
					cookies
				};
				case "signin":
					if (pages.signIn) {
						let signinUrl = `${pages.signIn}${pages.signIn.includes("?") ? "&" : "?"}callbackUrl=${encodeURIComponent(options.callbackUrl)}`;
						if (error) signinUrl = `${signinUrl}&error=${encodeURIComponent(error)}`;
						return {
							redirect: signinUrl,
							cookies
						};
					}
					return render.signin();
				case "signout":
					if (pages.signOut) return {
						redirect: pages.signOut,
						cookies
					};
					return render.signout();
				case "callback":
					if (options.provider) {
						const callback = await routes.callback({
							body: req.body,
							query: req.query,
							headers: req.headers,
							cookies: req.cookies,
							method,
							options,
							sessionStore
						});
						if (callback.cookies) cookies.push(...callback.cookies);
						return {
							...callback,
							cookies
						};
					}
					break;
				case "verify-request":
					if (pages.verifyRequest) return {
						redirect: pages.verifyRequest,
						cookies
					};
					return render.verifyRequest();
				case "error":
					if ([
						"Signin",
						"OAuthSignin",
						"OAuthCallback",
						"OAuthCreateAccount",
						"EmailCreateAccount",
						"Callback",
						"OAuthAccountNotLinked",
						"EmailSignin",
						"CredentialsSignin",
						"SessionRequired"
					].includes(error)) return {
						redirect: `${options.url}/signin?error=${error}`,
						cookies
					};
					if (pages.error) return {
						redirect: `${pages.error}${pages.error.includes("?") ? "&" : "?"}error=${error}`,
						cookies
					};
					return render.error({ error });
				default:
			}
		} else if (method === "POST") switch (action) {
			case "signin":
				if (options.csrfTokenVerified && options.provider) {
					const signin = await routes.signin({
						query: req.query,
						body: req.body,
						options
					});
					if (signin.cookies) cookies.push(...signin.cookies);
					return {
						...signin,
						cookies
					};
				}
				return {
					redirect: `${options.url}/signin?csrf=true`,
					cookies
				};
			case "signout":
				if (options.csrfTokenVerified) {
					const signout = await routes.signout({
						options,
						sessionStore
					});
					if (signout.cookies) cookies.push(...signout.cookies);
					return {
						...signout,
						cookies
					};
				}
				return {
					redirect: `${options.url}/signout?csrf=true`,
					cookies
				};
			case "callback":
				if (options.provider) {
					if (options.provider.type === "credentials" && !options.csrfTokenVerified) return {
						redirect: `${options.url}/signin?csrf=true`,
						cookies
					};
					const callback = await routes.callback({
						body: req.body,
						query: req.query,
						headers: req.headers,
						cookies: req.cookies,
						method,
						options,
						sessionStore
					});
					if (callback.cookies) cookies.push(...callback.cookies);
					return {
						...callback,
						cookies
					};
				}
				break;
			case "_log":
				if (authOptions.logger) try {
					var _req$body3;
					const { code, level, ...metadata } = (_req$body3 = req.body) !== null && _req$body3 !== void 0 ? _req$body3 : {};
					_logger.default[level](code, metadata);
				} catch (error) {
					_logger.default.error("LOGGER_ERROR", error);
				}
				return {};
			case "session":
				if (options.csrfTokenVerified) {
					var _req$body4;
					const session = await routes.session({
						options,
						sessionStore,
						newSession: (_req$body4 = req.body) === null || _req$body4 === void 0 ? void 0 : _req$body4.data,
						isUpdate: true
					});
					if (session.cookies) cookies.push(...session.cookies);
					return {
						...session,
						cookies
					};
				}
				return {
					status: 400,
					body: {},
					cookies
				};
			default:
		}
		return {
			status: 400,
			body: `Error: This action with HTTP ${method} is not supported by NextAuth.js`
		};
	}
}));
//#endregion
//#region node_modules/next-auth/next/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.getBody = getBody;
	exports.setCookie = setCookie;
	exports.toResponse = toResponse;
	var _cookie = require_cookie();
	function setCookie(res, cookie) {
		var _res$getHeader;
		let setCookieHeader = (_res$getHeader = res.getHeader("Set-Cookie")) !== null && _res$getHeader !== void 0 ? _res$getHeader : [];
		if (!Array.isArray(setCookieHeader)) setCookieHeader = [setCookieHeader];
		const { name, value, options } = cookie;
		const cookieHeader = (0, _cookie.serialize)(name, value, options);
		setCookieHeader.push(cookieHeader);
		res.setHeader("Set-Cookie", setCookieHeader);
	}
	async function getBody(req) {
		if (!("body" in req) || !req.body || req.method !== "POST") return;
		const contentType = req.headers.get("content-type");
		if (contentType !== null && contentType !== void 0 && contentType.includes("application/json")) return await req.json();
		else if (contentType !== null && contentType !== void 0 && contentType.includes("application/x-www-form-urlencoded")) {
			const params = new URLSearchParams(await req.text());
			return Object.fromEntries(params);
		}
	}
	function toResponse(res) {
		var _res$headers, _res$cookies, _res$status;
		const headers = new Headers((_res$headers = res.headers) === null || _res$headers === void 0 ? void 0 : _res$headers.reduce((acc, { key, value }) => {
			acc[key] = value;
			return acc;
		}, {}));
		(_res$cookies = res.cookies) === null || _res$cookies === void 0 || _res$cookies.forEach((cookie) => {
			const { name, value, options } = cookie;
			const cookieHeader = (0, _cookie.serialize)(name, value, options);
			if (headers.has("Set-Cookie")) headers.append("Set-Cookie", cookieHeader);
			else headers.set("Set-Cookie", cookieHeader);
		});
		let body = res.body;
		if (headers.get("content-type") === "application/json") body = JSON.stringify(res.body);
		else if (headers.get("content-type") === "application/x-www-form-urlencoded") body = new URLSearchParams(res.body).toString();
		const status = res.redirect ? 302 : (_res$status = res.status) !== null && _res$status !== void 0 ? _res$status : 200;
		const response = new Response(body, {
			headers,
			status
		});
		if (res.redirect) response.headers.set("Location", res.redirect);
		return response;
	}
}));
//#endregion
//#region node_modules/next-auth/next/index.js
var require_next = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = void 0;
	exports.getServerSession = getServerSession;
	exports.unstable_getServerSession = unstable_getServerSession;
	var _core = require_core();
	var _utils = require_utils();
	async function NextAuthApiHandler(req, res, options) {
		var _options$secret, _ref, _options$jwt$secret, _options$jwt, _ref2, _handler$status, _handler$cookies, _handler$headers;
		const { nextauth, ...query } = req.query;
		(_options$secret = options.secret) !== null && _options$secret !== void 0 || (options.secret = (_ref = (_options$jwt$secret = (_options$jwt = options.jwt) === null || _options$jwt === void 0 ? void 0 : _options$jwt.secret) !== null && _options$jwt$secret !== void 0 ? _options$jwt$secret : process.env.NEXTAUTH_SECRET) !== null && _ref !== void 0 ? _ref : process.env.AUTH_SECRET);
		const handler = await (0, _core.AuthHandler)({
			req: {
				body: req.body,
				query,
				cookies: req.cookies,
				headers: req.headers,
				method: req.method,
				action: nextauth === null || nextauth === void 0 ? void 0 : nextauth[0],
				providerId: nextauth === null || nextauth === void 0 ? void 0 : nextauth[1],
				error: (_ref2 = req.query.error) !== null && _ref2 !== void 0 ? _ref2 : nextauth === null || nextauth === void 0 ? void 0 : nextauth[1]
			},
			options
		});
		res.status((_handler$status = handler.status) !== null && _handler$status !== void 0 ? _handler$status : 200);
		(_handler$cookies = handler.cookies) === null || _handler$cookies === void 0 || _handler$cookies.forEach((cookie) => (0, _utils.setCookie)(res, cookie));
		(_handler$headers = handler.headers) === null || _handler$headers === void 0 || _handler$headers.forEach((h) => res.setHeader(h.key, h.value));
		if (handler.redirect) {
			var _req$body;
			if (((_req$body = req.body) === null || _req$body === void 0 ? void 0 : _req$body.json) !== "true") {
				res.status(302).setHeader("Location", handler.redirect);
				res.end();
				return;
			}
			return res.json({ url: handler.redirect });
		}
		return res.send(handler.body);
	}
	async function NextAuthRouteHandler(req, context, options) {
		var _options$secret2, _process$env$NEXTAUTH, _await$context$params, _query$error;
		(_options$secret2 = options.secret) !== null && _options$secret2 !== void 0 || (options.secret = (_process$env$NEXTAUTH = process.env.NEXTAUTH_SECRET) !== null && _process$env$NEXTAUTH !== void 0 ? _process$env$NEXTAUTH : process.env.AUTH_SECRET);
		const { headers, cookies } = (init_headers(), __toCommonJS(headers_exports));
		const nextauth = (_await$context$params = await context.params) === null || _await$context$params === void 0 ? void 0 : _await$context$params.nextauth;
		const query = Object.fromEntries(req.nextUrl.searchParams);
		const body = await (0, _utils.getBody)(req);
		const internalResponse = await (0, _core.AuthHandler)({
			req: {
				body,
				query,
				cookies: Object.fromEntries((await cookies()).getAll().map((c) => [c.name, c.value])),
				headers: Object.fromEntries(await headers()),
				method: req.method,
				action: nextauth === null || nextauth === void 0 ? void 0 : nextauth[0],
				providerId: nextauth === null || nextauth === void 0 ? void 0 : nextauth[1],
				error: (_query$error = query.error) !== null && _query$error !== void 0 ? _query$error : nextauth === null || nextauth === void 0 ? void 0 : nextauth[1]
			},
			options
		});
		const response = (0, _utils.toResponse)(internalResponse);
		const redirect = response.headers.get("Location");
		if ((body === null || body === void 0 ? void 0 : body.json) === "true" && redirect) {
			response.headers.delete("Location");
			response.headers.set("Content-Type", "application/json");
			return new Response(JSON.stringify({ url: redirect }), {
				status: internalResponse.status,
				headers: response.headers
			});
		}
		return response;
	}
	function NextAuth(...args) {
		var _args$;
		if (args.length === 1) return async (req, res) => {
			if (res !== null && res !== void 0 && res.params) return await NextAuthRouteHandler(req, res, args[0]);
			return await NextAuthApiHandler(req, res, args[0]);
		};
		if ((_args$ = args[1]) !== null && _args$ !== void 0 && _args$.params) return NextAuthRouteHandler(...args);
		return NextAuthApiHandler(...args);
	}
	exports.default = NextAuth;
	async function getServerSession(...args) {
		var _options, _options$secret3, _process$env$NEXTAUTH2;
		const isRSC = args.length === 0 || args.length === 1;
		let req, res, options;
		if (isRSC) {
			options = Object.assign({}, args[0], { providers: [] });
			const { headers, cookies } = (init_headers(), __toCommonJS(headers_exports));
			req = {
				headers: Object.fromEntries(await headers()),
				cookies: Object.fromEntries((await cookies()).getAll().map((c) => [c.name, c.value]))
			};
			res = {
				getHeader() {},
				setCookie() {},
				setHeader() {}
			};
		} else {
			req = args[0];
			res = args[1];
			options = Object.assign({}, args[2], { providers: [] });
		}
		(_options$secret3 = (_options = options).secret) !== null && _options$secret3 !== void 0 || (_options.secret = (_process$env$NEXTAUTH2 = process.env.NEXTAUTH_SECRET) !== null && _process$env$NEXTAUTH2 !== void 0 ? _process$env$NEXTAUTH2 : process.env.AUTH_SECRET);
		const { body, cookies, status = 200 } = await (0, _core.AuthHandler)({
			options,
			req: {
				action: "session",
				method: "GET",
				cookies: req.cookies,
				headers: req.headers
			}
		});
		cookies === null || cookies === void 0 || cookies.forEach((cookie) => (0, _utils.setCookie)(res, cookie));
		if (body && typeof body !== "string" && Object.keys(body).length) {
			if (status === 200) {
				if (isRSC) delete body.expires;
				return body;
			}
			throw new Error(body.message);
		}
		return null;
	}
	async function unstable_getServerSession(...args) {
		return await getServerSession(...args);
	}
}));
//#endregion
//#region node_modules/next-auth/index.js
var require_next_auth = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var _exportNames = {};
	Object.defineProperty(exports, "default", {
		enumerable: true,
		get: function() {
			return _next.default;
		}
	});
	var _types = require_types();
	Object.keys(_types).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
		if (key in exports && exports[key] === _types[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function() {
				return _types[key];
			}
		});
	});
	var _next = _interopRequireWildcard(require_next());
	Object.keys(_next).forEach(function(key) {
		if (key === "default" || key === "__esModule") return;
		if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
		if (key in exports && exports[key] === _next[key]) return;
		Object.defineProperty(exports, key, {
			enumerable: true,
			get: function() {
				return _next[key];
			}
		});
	});
	function _getRequireWildcardCache(e) {
		if ("function" != typeof WeakMap) return null;
		var r = /* @__PURE__ */ new WeakMap(), t = /* @__PURE__ */ new WeakMap();
		return (_getRequireWildcardCache = function(e) {
			return e ? t : r;
		})(e);
	}
	function _interopRequireWildcard(e, r) {
		if (!r && e && e.__esModule) return e;
		if (null === e || "object" != typeof e && "function" != typeof e) return { default: e };
		var t = _getRequireWildcardCache(r);
		if (t && t.has(e)) return t.get(e);
		var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor;
		for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) {
			var i = a ? Object.getOwnPropertyDescriptor(e, u) : null;
			i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u];
		}
		return n.default = e, t && t.set(e, n), n;
	}
}));
//#endregion
//#region node_modules/next-auth/providers/github.js
var require_github = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Github;
	function Github(options) {
		return {
			id: "github",
			name: "GitHub",
			type: "oauth",
			authorization: {
				url: "https://github.com/login/oauth/authorize",
				params: { scope: "read:user user:email" }
			},
			token: "https://github.com/login/oauth/access_token",
			userinfo: {
				url: "https://api.github.com/user",
				async request({ client, tokens }) {
					const profile = await client.userinfo(tokens.access_token);
					if (!profile.email) {
						const res = await fetch("https://api.github.com/user/emails", { headers: { Authorization: `token ${tokens.access_token}` } });
						if (res.ok) {
							var _emails$find;
							const emails = await res.json();
							profile.email = ((_emails$find = emails.find((e) => e.primary)) !== null && _emails$find !== void 0 ? _emails$find : emails[0]).email;
						}
					}
					return profile;
				}
			},
			profile(profile) {
				var _profile$name;
				return {
					id: profile.id.toString(),
					name: (_profile$name = profile.name) !== null && _profile$name !== void 0 ? _profile$name : profile.login,
					email: profile.email,
					image: profile.avatar_url
				};
			},
			style: {
				logo: "/github.svg",
				bg: "#24292f",
				text: "#fff"
			},
			options
		};
	}
}));
//#endregion
//#region node_modules/next-auth/providers/google.js
var require_google = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Google;
	function Google(options) {
		return {
			id: "google",
			name: "Google",
			type: "oauth",
			wellKnown: "https://accounts.google.com/.well-known/openid-configuration",
			authorization: { params: { scope: "openid email profile" } },
			idToken: true,
			checks: ["pkce", "state"],
			profile(profile) {
				return {
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture
				};
			},
			style: {
				logo: "/google.svg",
				bg: "#fff",
				text: "#000"
			},
			options
		};
	}
}));
//#endregion
//#region node_modules/next-auth/providers/discord.js
var require_discord = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Discord;
	function Discord(options) {
		return {
			id: "discord",
			name: "Discord",
			type: "oauth",
			authorization: "https://discord.com/api/oauth2/authorize?scope=identify+email",
			token: "https://discord.com/api/oauth2/token",
			userinfo: "https://discord.com/api/users/@me",
			profile(profile) {
				if (profile.avatar === null) profile.image_url = `https://cdn.discordapp.com/embed/avatars/${parseInt(profile.discriminator) % 5}.png`;
				else {
					const format = profile.avatar.startsWith("a_") ? "gif" : "png";
					profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
				}
				return {
					id: profile.id,
					name: profile.username,
					email: profile.email,
					image: profile.image_url
				};
			},
			style: {
				logo: "/discord.svg",
				bg: "#5865F2",
				text: "#fff"
			},
			options
		};
	}
}));
//#endregion
//#region node_modules/next-auth/providers/credentials.js
var require_credentials = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Credentials;
	function Credentials(options) {
		return {
			id: "credentials",
			name: "Credentials",
			type: "credentials",
			credentials: {},
			authorize: () => null,
			options
		};
	}
}));
//#endregion
//#region node_modules/@next-auth/prisma-adapter/dist/index.js
var require_dist = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.PrismaAdapter = void 0;
	/**
	* ## Setup
	*
	* Add this adapter to your `pages/api/[...nextauth].js` next-auth configuration object:
	*
	* ```js title="pages/api/auth/[...nextauth].js"
	* import NextAuth from "next-auth"
	* import GoogleProvider from "next-auth/providers/google"
	* import { PrismaAdapter } from "@next-auth/prisma-adapter"
	* import { PrismaClient } from "@prisma/client"
	*
	* const prisma = new PrismaClient()
	*
	* export default NextAuth({
	*   adapter: PrismaAdapter(prisma),
	*   providers: [
	*     GoogleProvider({
	*       clientId: process.env.GOOGLE_CLIENT_ID,
	*       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
	*     }),
	*   ],
	* })
	* ```
	*
	* ### Create the Prisma schema from scratch
	*
	* You need to use at least Prisma 2.26.0. Create a schema file in `prisma/schema.prisma` similar to this one:
	*
	* > This schema is adapted for use in Prisma and based upon our main [schema](https://authjs.dev/reference/adapters#models)
	*
	* ```json title="schema.prisma"
	* datasource db {
	*   provider = "postgresql"
	*   url      = env("DATABASE_URL")
	*   shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // Only needed when using a cloud provider that doesn't support the creation of new databases, like Heroku. Learn more: https://pris.ly/d/migrate-shadow
	* }
	*
	* generator client {
	*   provider        = "prisma-client-js"
	*   previewFeatures = ["referentialActions"] // You won't need this in Prisma 3.X or higher.
	* }
	*
	* model Account {
	*   id                 String  @id @default(cuid())
	*   userId             String
	*   type               String
	*   provider           String
	*   providerAccountId  String
	*   refresh_token      String?  @db.Text
	*   access_token       String?  @db.Text
	*   expires_at         Int?
	*   token_type         String?
	*   scope              String?
	*   id_token           String?  @db.Text
	*   session_state      String?
	*
	*   user User @relation(fields: [userId], references: [id], onDelete: Cascade)
	*
	*   @@unique([provider, providerAccountId])
	* }
	*
	* model Session {
	*   id           String   @id @default(cuid())
	*   sessionToken String   @unique
	*   userId       String
	*   expires      DateTime
	*   user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
	* }
	*
	* model User {
	*   id            String    @id @default(cuid())
	*   name          String?
	*   email         String?   @unique
	*   emailVerified DateTime?
	*   image         String?
	*   accounts      Account[]
	*   sessions      Session[]
	* }
	*
	* model VerificationToken {
	*   identifier String
	*   token      String   @unique
	*   expires    DateTime
	*
	*   @@unique([identifier, token])
	* }
	* ```
	*
	* :::note
	* When using the MySQL connector for Prisma, the [Prisma `String` type](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#string) gets mapped to `varchar(191)` which may not be long enough to store fields such as `id_token` in the `Account` model. This can be avoided by explicitly using the `Text` type with `@db.Text`.
	* :::
	*
	*
	* ### Create the Prisma schema with `prisma migrate`
	*
	* This will create an SQL migration file and execute it:
	*
	* ```
	* npx prisma migrate dev
	* ```
	*
	* Note that you will need to specify your database connection string in the environment variable `DATABASE_URL`. You can do this by setting it in a `.env` file at the root of your project.
	*
	* To learn more about [Prisma Migrate](https://www.prisma.io/migrate), check out the [Migrate docs](https://www.prisma.io/docs/concepts/components/prisma-migrate).
	*
	* ### Generating the Prisma Client
	*
	* Once you have saved your schema, use the Prisma CLI to generate the Prisma Client:
	*
	* ```
	* npx prisma generate
	* ```
	*
	* To configure your database to use the new schema (i.e. create tables and columns) use the `prisma migrate` command:
	*
	* ```
	* npx prisma migrate dev
	* ```
	*
	* ### MongoDB support
	*
	* Prisma supports MongoDB, and so does Auth.js. Following the instructions of the [Prisma documentation](https://www.prisma.io/docs/concepts/database-connectors/mongodb) on the MongoDB connector, things you have to change are:
	*
	* 1. Make sure that the id fields are mapped correctly
	*
	* ```prisma
	* id  String  @id @default(auto()) @map("_id") @db.ObjectId
	* ```
	*
	* 2. The Native database type attribute to `@db.String` from `@db.Text` and userId to `@db.ObjectId`.
	*
	* ```prisma
	* user_id            String   @db.ObjectId
	* refresh_token      String?  @db.String
	* access_token       String?  @db.String
	* id_token           String?  @db.String
	* ```
	*
	* Everything else should be the same.
	*
	* ### Naming Conventions
	*
	* If mixed snake_case and camelCase column names is an issue for you and/or your underlying database system, we recommend using Prisma's `@map()`([see the documentation here](https://www.prisma.io/docs/concepts/components/prisma-schema/names-in-underlying-database)) feature to change the field names. This won't affect Auth.js, but will allow you to customize the column names to whichever naming convention you wish.
	*
	* For example, moving to `snake_case` and plural table names.
	*
	* ```json title="schema.prisma"
	* model Account {
	*   id                 String  @id @default(cuid())
	*   userId             String  @map("user_id")
	*   type               String
	*   provider           String
	*   providerAccountId  String  @map("provider_account_id")
	*   refresh_token      String? @db.Text
	*   access_token       String? @db.Text
	*   expires_at         Int?
	*   token_type         String?
	*   scope              String?
	*   id_token           String? @db.Text
	*   session_state      String?
	*
	*   user User @relation(fields: [userId], references: [id], onDelete: Cascade)
	*
	*   @@unique([provider, providerAccountId])
	*   @@map("accounts")
	* }
	*
	* model Session {
	*   id           String   @id @default(cuid())
	*   sessionToken String   @unique @map("session_token")
	*   userId       String   @map("user_id")
	*   expires      DateTime
	*   user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
	*
	*   @@map("sessions")
	* }
	*
	* model User {
	*   id            String    @id @default(cuid())
	*   name          String?
	*   email         String?   @unique
	*   emailVerified DateTime? @map("email_verified")
	*   image         String?
	*   accounts      Account[]
	*   sessions      Session[]
	*
	*   @@map("users")
	* }
	*
	* model VerificationToken {
	*   identifier String
	*   token      String   @unique
	*   expires    DateTime
	*
	*   @@unique([identifier, token])
	*   @@map("verificationtokens")
	* }
	* ```
	*
	**/
	function PrismaAdapter(p) {
		return {
			createUser: (data) => p.user.create({ data }),
			getUser: (id) => p.user.findUnique({ where: { id } }),
			getUserByEmail: (email) => p.user.findUnique({ where: { email } }),
			async getUserByAccount(provider_providerAccountId) {
				var _a;
				const account = await p.account.findUnique({
					where: { provider_providerAccountId },
					select: { user: true }
				});
				return (_a = account === null || account === void 0 ? void 0 : account.user) !== null && _a !== void 0 ? _a : null;
			},
			updateUser: ({ id, ...data }) => p.user.update({
				where: { id },
				data
			}),
			deleteUser: (id) => p.user.delete({ where: { id } }),
			linkAccount: (data) => p.account.create({ data }),
			unlinkAccount: (provider_providerAccountId) => p.account.delete({ where: { provider_providerAccountId } }),
			async getSessionAndUser(sessionToken) {
				const userAndSession = await p.session.findUnique({
					where: { sessionToken },
					include: { user: true }
				});
				if (!userAndSession) return null;
				const { user, ...session } = userAndSession;
				return {
					user,
					session
				};
			},
			createSession: (data) => p.session.create({ data }),
			updateSession: (data) => p.session.update({
				where: { sessionToken: data.sessionToken },
				data
			}),
			deleteSession: (sessionToken) => p.session.delete({ where: { sessionToken } }),
			async createVerificationToken(data) {
				const verificationToken = await p.verificationToken.create({ data });
				if (verificationToken.id) delete verificationToken.id;
				return verificationToken;
			},
			async useVerificationToken(identifier_token) {
				try {
					const verificationToken = await p.verificationToken.delete({ where: { identifier_token } });
					if (verificationToken.id) delete verificationToken.id;
					return verificationToken;
				} catch (error) {
					if (error.code === "P2025") return null;
					throw error;
				}
			}
		};
	}
	exports.PrismaAdapter = PrismaAdapter;
}));
//#endregion
//#region src/lib/auth.ts
var import_github = /* @__PURE__ */ __toESM(require_github());
var import_google = /* @__PURE__ */ __toESM(require_google());
var import_discord = /* @__PURE__ */ __toESM(require_discord());
var import_credentials = /* @__PURE__ */ __toESM(require_credentials());
var import_dist = require_dist();
require_next_auth();
var isProd = true;
var authOptions = {
	adapter: (0, import_dist.PrismaAdapter)(db),
	providers: [
		(0, import_github.default)({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET
		}),
		(0, import_google.default)({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			authorization: { params: {
				prompt: "consent",
				access_type: "offline",
				response_type: "code"
			} },
			httpOptions: { timeout: 3e4 }
		}),
		(0, import_discord.default)({
			clientId: process.env.DISCORD_CLIENT_ID,
			clientSecret: process.env.DISCORD_CLIENT_SECRET
		}),
		(0, import_credentials.default)({
			name: "credentials",
			credentials: {
				email: {
					label: "Email",
					type: "email"
				},
				password: {
					label: "Password",
					type: "password"
				}
			},
			async authorize(credentials) {
				const startTime = Date.now();
				logger.auth.info("🔐 Credentials authorize attempt", {
					email: credentials?.email,
					hasPassword: !!credentials?.password,
					environment: "production",
					timestamp: (/* @__PURE__ */ new Date()).toISOString(),
					userAgent: "production-auth-debug"
				});
				if (!credentials?.email || !credentials?.password) {
					logger.auth.warn("❌ Missing credentials", {
						hasEmail: !!credentials?.email,
						hasPassword: !!credentials?.password
					});
					return null;
				}
				try {
					logger.auth.debug("🔍 Searching user in database", {
						email: credentials.email,
						dbUrl: process.env.DATABASE_URL?.substring(0, 20) + "..."
					});
					const user = await db.user.findFirst({ where: {
						email: credentials.email,
						deletedAt: null
					} });
					const dbTime = Date.now() - startTime;
					logger.auth.debug("📊 Database query completed", {
						email: credentials.email,
						userFound: !!user,
						userActive: user?.isActive,
						hasPassword: !!user?.password,
						dbQueryTime: `${dbTime}ms`,
						userId: user?.id
					});
					if (!user || !user.password) {
						logger.auth.warn("❌ User not found or no password", {
							email: credentials.email,
							userExists: !!user,
							hasPassword: !!user?.password
						});
						return null;
					}
					if (!user.isActive) {
						logger.auth.warn("⚠️ User account not active", {
							email: credentials.email,
							userId: user.id,
							emailVerified: !!user.emailVerified
						});
						throw new Error("EmailNotVerified");
					}
					const passwordStartTime = Date.now();
					const isPasswordValid = await bcryptjs_default.compare(credentials.password, user.password);
					const passwordTime = Date.now() - passwordStartTime;
					logger.auth.debug("🔑 Password validation completed", {
						email: credentials.email,
						userId: user.id,
						isValid: isPasswordValid,
						validationTime: `${passwordTime}ms`
					});
					if (!isPasswordValid) {
						logger.auth.warn("❌ Invalid password", {
							email: credentials.email,
							userId: user.id
						});
						return null;
					}
					const authUser = {
						id: user.id,
						email: user.email,
						nickname: user.nickname,
						image: user.image || null,
						role: user.role,
						name: user.nickname || user.email?.split("@")[0] || ""
					};
					const totalTime = Date.now() - startTime;
					logger.auth.info("✅ Successful credentials authentication", {
						userId: user.id,
						email: user.email,
						role: user.role,
						totalTime: `${totalTime}ms`,
						environment: "production"
					});
					return authUser;
				} catch (error) {
					const totalTime = Date.now() - startTime;
					logger.auth.error("💥 Error in credentials authorize", {
						email: credentials.email,
						error: error instanceof Error ? error.message : "Unknown error",
						stack: error instanceof Error ? error.stack : void 0,
						totalTime: `${totalTime}ms`,
						environment: "production"
					});
					if (error instanceof Error && error.message === "EmailNotVerified") throw error;
					return null;
				}
			}
		})
	],
	session: {
		strategy: "jwt",
		maxAge: 720 * 60 * 60,
		updateAge: 0
	},
	jwt: { maxAge: 720 * 60 * 60 },
	events: {
		async signIn({ user, account, profile: _profile }) {
			logger.auth.info("🚀 SignIn event triggered", {
				provider: account?.provider,
				email: user.email,
				userId: user.id,
				environment: "production",
				baseUrl: process.env.NEXTAUTH_URL,
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			});
		},
		async createUser({ user }) {
			logger.auth.info("User created by PrismaAdapter", {
				email: user.email,
				id: user.id,
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			});
			try {
				await db.user.update({
					where: { id: user.id },
					data: {
						role: UserRole.CLIENT,
						isActive: true,
						emailVerified: /* @__PURE__ */ new Date(),
						nickname: user.name || user.email?.split("@")[0]
					}
				});
				logger.auth.info("✅ OAuth user configured successfully", {
					userId: user.id,
					timestamp: (/* @__PURE__ */ new Date()).toISOString()
				});
			} catch (error) {
				logger.auth.error("❌ Error configuring OAuth user", {
					userId: user.id,
					error,
					timestamp: (/* @__PURE__ */ new Date()).toISOString()
				});
			}
		},
		async session({ session, token }) {
			logger.auth.info("📋 Session event", {
				userId: session?.user?.id,
				email: session?.user?.email,
				hasToken: !!token,
				environment: "production",
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			});
		}
	},
	cookies: {
		sessionToken: {
			name: `__Secure-next-auth.session-token`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: isProd
			}
		},
		callbackUrl: {
			name: `__Secure-next-auth.callback-url`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: isProd
			}
		},
		csrfToken: {
			name: `__Secure-next-auth.csrf-token`,
			options: {
				httpOnly: true,
				sameSite: "lax",
				path: "/",
				secure: isProd
			}
		}
	},
	callbacks: {
		async jwt({ token, user, account }) {
			logger.auth.debug("🎫 JWT callback", {
				hasUser: !!user,
				hasToken: !!token,
				hasAccount: !!account,
				provider: account?.provider,
				userId: user?.id || token?.id,
				environment: "production",
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			});
			if (user) {
				token.role = user.role;
				token.id = user.id;
				token.nickname = user.nickname || user.name || user.email?.split("@")[0];
				token.name = user.name;
				token.email = user.email;
				token.phone = user.phone || null;
				token.image = user.image;
				logger.auth.info("✅ JWT token updated with user data", {
					userId: user.id,
					role: user.role,
					provider: account?.provider,
					timestamp: (/* @__PURE__ */ new Date()).toISOString()
				});
			}
			return token;
		},
		async session({ session, token, trigger, newSession }) {
			logger.auth.debug("🔄 Session callback", {
				hasSession: !!session,
				hasToken: !!token,
				tokenId: token?.id,
				sessionEmail: session?.user?.email,
				trigger,
				environment: "production",
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			});
			if (token) {
				if (token.id) try {
					const freshUser = await db.user.findFirst({
						where: {
							id: token.id,
							deletedAt: null
						},
						select: {
							id: true,
							name: true,
							nickname: true,
							email: true,
							phone: true,
							image: true,
							role: true
						}
					});
					if (!freshUser) {
						logger.auth.warn("⚠️ User not found or deleted during session refresh", { userId: token.id });
						return session;
					}
					token.name = freshUser.name;
					token.nickname = freshUser.nickname;
					token.email = freshUser.email;
					token.phone = freshUser.phone;
					token.image = freshUser.image;
					token.role = freshUser.role;
					logger.auth.info("🔄 Session data refreshed from database", {
						userId: freshUser.id,
						hasNewImage: !!freshUser.image,
						trigger,
						timestamp: (/* @__PURE__ */ new Date()).toISOString()
					});
				} catch (error) {
					logger.auth.error("❌ Error refreshing user data", {
						userId: token.id,
						error: error instanceof Error ? error.message : "Unknown error"
					});
				}
				session.user.id = token.id;
				session.user.role = token.role;
				session.user.nickname = token.nickname;
				session.user.name = token.name;
				session.user.email = token.email;
				session.user.phone = token.phone;
				session.user.image = token.image;
				logger.auth.info("✅ Session updated with token data", {
					userId: token.id,
					role: token.role,
					hasImage: !!token.image,
					timestamp: (/* @__PURE__ */ new Date()).toISOString()
				});
			}
			return session;
		},
		async redirect({ url, baseUrl }) {
			logger.auth.info("🔀 NextAuth redirect callback", {
				url,
				baseUrl,
				environment: "production",
				timestamp: (/* @__PURE__ */ new Date()).toISOString()
			});
			try {
				if (url.startsWith("/")) {
					const redirectUrl = `${baseUrl}${url}`;
					logger.auth.info("🔗 Relative URL redirect", { redirectUrl });
					return redirectUrl;
				}
				if (url.startsWith(baseUrl)) {
					logger.auth.info("✅ Same domain URL allowed", { url });
					return url;
				}
				const callbackUrl = new URL(url).searchParams.get("callbackUrl");
				if (callbackUrl) {
					const finalUrl = callbackUrl.startsWith("/") ? `${baseUrl}${callbackUrl}` : callbackUrl;
					if (finalUrl.startsWith(baseUrl)) {
						logger.auth.info("🎯 CallbackUrl redirect", { finalUrl });
						return finalUrl;
					}
				}
				const fallbackUrl = `${baseUrl}/dashboard`;
				logger.auth.info("🏠 Fallback redirect to dashboard", {
					fallbackUrl,
					originalUrl: url
				});
				return fallbackUrl;
			} catch (error) {
				logger.auth.error("💥 Error in redirect callback", {
					url,
					baseUrl,
					error: error instanceof Error ? error.message : "Unknown error"
				});
				return `${baseUrl}/dashboard`;
			}
		}
	},
	pages: {
		signIn: "/auth/signin",
		error: "/auth/error",
		signOut: "/"
	},
	secret: process.env.NEXTAUTH_SECRET,
	debug: false
};
//#endregion
export { init_middleware_request_headers as S, isInsideUnifiedScope as _, consumeDynamicUsage as a, parseCookieHeader as b, getHeadersContext as c, markDynamicUsage as d, setHeadersAccessPhase as f, init_unified_request_context as g, getRequestContext as h, applyMiddlewareRequestHeaders as i, headersContextFromRequest as l, createRequestContext as m, require_next_auth as n, getAndClearPendingCookies as o, setHeadersContext as p, require_jwt as r, getDraftModeCookieHeader as s, authOptions as t, init_headers as u, runWithRequestContext as v, encodeMiddlewareRequestHeaders as x, init_parse_cookie_header as y };
