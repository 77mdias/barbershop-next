import { d as init_headers, h as isInsideUnifiedScope, l as getRequestContext, m as init_unified_request_context } from "./auth-D37wSDgg.mjs";
import { AsyncLocalStorage } from "node:async_hooks";
//#region node_modules/.nitro/vite/services/rsc/assets/cache-Ne6hcaFU.js
init_unified_request_context();
/**
* Request ExecutionContext — AsyncLocalStorage-backed accessor.
*
* Makes the Cloudflare Workers `ExecutionContext` (which provides
* `waitUntil`) available to any code on the call stack during a request
* without requiring it to be threaded through every function signature.
*
* Usage:
*
*   // In the worker entry, wrap the handler:
*   import { runWithExecutionContext } from "vinext/shims/request-context";
*   export default {
*     fetch(request, env, ctx) {
*       return runWithExecutionContext(ctx, () => handler.fetch(request, env, ctx));
*     }
*   };
*
*   // Anywhere downstream:
*   import { getRequestExecutionContext } from "vinext/shims/request-context";
*   const ctx = getRequestExecutionContext(); // null on Node.js dev
*   ctx?.waitUntil(somePromise);
*/
var _ALS_KEY$1 = Symbol.for("vinext.requestContext.als");
var _g$1 = globalThis;
var _als = _g$1[_ALS_KEY$1] ??= new AsyncLocalStorage();
/**
* Get the `ExecutionContext` for the current request, or `null` when called
* outside a `runWithExecutionContext()` scope (e.g. on Node.js dev server).
*
* Use `ctx?.waitUntil(promise)` to schedule background work that must
* complete before the Worker isolate is torn down.
*/
function getRequestExecutionContext() {
	if (isInsideUnifiedScope()) return getRequestContext().executionContext;
	return _als.getStore() ?? null;
}
init_unified_request_context();
init_headers();
var MemoryCacheHandler = class {
	store = /* @__PURE__ */ new Map();
	tagRevalidatedAt = /* @__PURE__ */ new Map();
	async get(key, _ctx) {
		const entry = this.store.get(key);
		if (!entry) return null;
		for (const tag of entry.tags) {
			const revalidatedAt = this.tagRevalidatedAt.get(tag);
			if (revalidatedAt && revalidatedAt >= entry.lastModified) {
				this.store.delete(key);
				return null;
			}
		}
		if (entry.revalidateAt !== null && Date.now() > entry.revalidateAt) return {
			lastModified: entry.lastModified,
			value: entry.value,
			cacheState: "stale"
		};
		return {
			lastModified: entry.lastModified,
			value: entry.value
		};
	}
	async set(key, data, ctx) {
		const typedCtx = ctx;
		const tagSet = /* @__PURE__ */ new Set();
		if (data && "tags" in data && Array.isArray(data.tags)) for (const t of data.tags) tagSet.add(t);
		if (typedCtx && Array.isArray(typedCtx.tags)) for (const t of typedCtx.tags) tagSet.add(t);
		const tags = [...tagSet];
		let effectiveRevalidate;
		if (typedCtx) {
			const revalidate = typedCtx.cacheControl?.revalidate ?? typedCtx.revalidate;
			if (typeof revalidate === "number") effectiveRevalidate = revalidate;
		}
		if (data && "revalidate" in data && typeof data.revalidate === "number") effectiveRevalidate = data.revalidate;
		if (effectiveRevalidate === 0) return;
		const revalidateAt = typeof effectiveRevalidate === "number" && effectiveRevalidate > 0 ? Date.now() + effectiveRevalidate * 1e3 : null;
		this.store.set(key, {
			value: data,
			tags,
			lastModified: Date.now(),
			revalidateAt
		});
	}
	async revalidateTag(tags, _durations) {
		const tagList = Array.isArray(tags) ? tags : [tags];
		const now = Date.now();
		for (const tag of tagList) this.tagRevalidatedAt.set(tag, now);
	}
	resetRequestCache() {}
};
var _HANDLER_KEY = Symbol.for("vinext.cacheHandler");
var _gHandler = globalThis;
function _getActiveHandler() {
	return _gHandler[_HANDLER_KEY] ?? (_gHandler[_HANDLER_KEY] = new MemoryCacheHandler());
}
/**
* Get the active CacheHandler (for internal use or testing).
*/
function getCacheHandler() {
	return _getActiveHandler();
}
/**
* Revalidate cached data associated with a specific path.
*
* Invalidation works through implicit tags generated at render time by
* `__pageCacheTags` (in app-rsc-entry.ts), matching Next.js's getDerivedTags:
*
* - `type: "layout"` → invalidates `_N_T_<path>/layout`, cascading to all
*   descendant pages (they carry ancestor layout tags from render time).
* - `type: "page"` → invalidates `_N_T_<path>/page`, targeting only the
*   exact route's page component.
* - No type → invalidates `_N_T_<path>` (broader, exact path).
*
* The `type` parameter is App Router only — Pages Router does not generate
* layout/page hierarchy tags, so only no-type invalidation applies there.
*/
async function revalidatePath(path, type) {
	const stem = path.endsWith("/") ? path.slice(0, -1) : path;
	const tag = type ? `_N_T_${stem}/${type}` : `_N_T_${stem || "/"}`;
	await _getActiveHandler().revalidateTag(tag);
}
var _ALS_KEY = Symbol.for("vinext.cache.als");
var _FALLBACK_KEY = Symbol.for("vinext.cache.fallback");
var _g = globalThis;
var _cacheAls = _g[_ALS_KEY] ??= new AsyncLocalStorage();
var _cacheFallbackState = _g[_FALLBACK_KEY] ??= { requestScopedCacheLife: null };
function _getCacheState() {
	if (isInsideUnifiedScope()) return getRequestContext();
	return _cacheAls.getStore() ?? _cacheFallbackState;
}
/**
* Consume and reset the request-scoped cache life. Returns null if none was set.
* @internal
*/
function _consumeRequestScopedCacheLife() {
	const state = _getCacheState();
	const config = state.requestScopedCacheLife;
	state.requestScopedCacheLife = null;
	return config;
}
/**
* AsyncLocalStorage to track whether we're inside an unstable_cache() callback.
* Stored on globalThis via Symbol so headers.ts can detect the scope without
* a direct import (avoiding circular dependencies).
*/
var _UNSTABLE_CACHE_ALS_KEY = Symbol.for("vinext.unstableCache.als");
_g[_UNSTABLE_CACHE_ALS_KEY] ??= new AsyncLocalStorage();
//#endregion
export { revalidatePath as i, getCacheHandler as n, getRequestExecutionContext as r, _consumeRequestScopedCacheLife as t };
