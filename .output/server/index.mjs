globalThis.__nitro_main__ = import.meta.url;
import { a as toEventHandler, c as serve, i as defineLazyEventHandler, n as HTTPError, r as defineHandler, s as NodeResponse, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import "./_libs/hookable.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = {
	["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")),
	["rsc"]: lazyService(() => import("./_ssr/rsc.mjs"))
};
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/file.svg": {
		"type": "image/svg+xml",
		"etag": "\"187-+zgO7/6H1QtZc4NmTAKYKWTQ0ow\"",
		"mtime": "2026-03-26T01:11:34.869Z",
		"size": 391,
		"path": "../public/file.svg"
	},
	"/globe.svg": {
		"type": "image/svg+xml",
		"etag": "\"40b-LrojsBpGczu4Qj5tOOv19+lavsU\"",
		"mtime": "2026-03-26T01:11:34.869Z",
		"size": 1035,
		"path": "../public/globe.svg"
	},
	"/next.svg": {
		"type": "image/svg+xml",
		"etag": "\"55f-Pz6VYiYSuYnFvWoDKZowjG88fms\"",
		"mtime": "2026-03-26T01:11:34.869Z",
		"size": 1375,
		"path": "../public/next.svg"
	},
	"/vercel.svg": {
		"type": "image/svg+xml",
		"etag": "\"80-zruIUtWMiIa+PpBRomlX9Cu4Lxo\"",
		"mtime": "2026-03-26T01:11:34.869Z",
		"size": 128,
		"path": "../public/vercel.svg"
	},
	"/window.svg": {
		"type": "image/svg+xml",
		"etag": "\"181-VMSODapsqjF/4bTEGQB/2T6Ujbk\"",
		"mtime": "2026-03-26T01:11:34.869Z",
		"size": 385,
		"path": "../public/window.svg"
	},
	"/assets/GallerySceneCanvas-CKW0p-7X.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1448-xOlUP5zFUo/tAv9GScRS5jJfXVM\"",
		"mtime": "2026-03-26T01:11:33.579Z",
		"size": 5192,
		"path": "../public/assets/GallerySceneCanvas-CKW0p-7X.js"
	},
	"/assets/HomeSceneCanvas-BSvi9ZmM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e6e-fxC/kwbkxPqbDcQLqgfAVoVeehE\"",
		"mtime": "2026-03-26T01:11:33.579Z",
		"size": 3694,
		"path": "../public/assets/HomeSceneCanvas-BSvi9ZmM.js"
	},
	"/assets/framework--MHrfMZ6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2e56f-m/WJYw9kl1FSsT783qWwwsnEUcE\"",
		"mtime": "2026-03-26T01:11:33.580Z",
		"size": 189807,
		"path": "../public/assets/framework--MHrfMZ6.js"
	},
	"/assets/index-B9OqVBFx.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"1ca50-RgJo0Qjpyqbl/cDeWyT2sOJtGfY\"",
		"mtime": "2026-03-26T01:11:33.581Z",
		"size": 117328,
		"path": "../public/assets/index-B9OqVBFx.css"
	},
	"/assets/index-Df5iHRSZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9fbc-6SsLNSM/6zXWhye5OfM1M64q0PA\"",
		"mtime": "2026-03-26T01:11:33.578Z",
		"size": 40892,
		"path": "../public/assets/index-Df5iHRSZ.js"
	},
	"/assets/preload-helper-3k_mjWfE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8c6-m9ahqxE0piQsYRSes4OQx5M8oiA\"",
		"mtime": "2026-03-26T01:11:33.581Z",
		"size": 2246,
		"path": "../public/assets/preload-helper-3k_mjWfE.js"
	},
	"/assets/query-BbOc3VB2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"61c-p7L/4X+NUVucLmRLkWmMCsa1mVM\"",
		"mtime": "2026-03-26T01:11:33.581Z",
		"size": 1564,
		"path": "../public/assets/query-BbOc3VB2.js"
	},
	"/assets/rolldown-runtime-COnpUsM8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"331-hvTNPhOL1rYbwl8LYv1lABIgRZw\"",
		"mtime": "2026-03-26T01:11:33.581Z",
		"size": 817,
		"path": "../public/assets/rolldown-runtime-COnpUsM8.js"
	},
	"/assets/router-BlVuw2ez.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2063-yWQgPc7igPQfZ0CbCyJfsu8oGrU\"",
		"mtime": "2026-03-26T01:11:33.581Z",
		"size": 8291,
		"path": "../public/assets/router-BlVuw2ez.js"
	},
	"/images/salon1.svg": {
		"type": "image/svg+xml",
		"etag": "\"605-NgnO1pXv7mpVWcPRqKeK5+IxzU0\"",
		"mtime": "2026-03-26T01:11:34.865Z",
		"size": 1541,
		"path": "../public/images/salon1.svg"
	},
	"/images/salon2.svg": {
		"type": "image/svg+xml",
		"etag": "\"69d-WbMLEJxaVi8Qyp8zS1eK3ntOSg0\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 1693,
		"path": "../public/images/salon2.svg"
	},
	"/machine/ezgif-frame-001.jpg": {
		"type": "image/jpeg",
		"etag": "\"8f73-eeK5VI7Pgf+bxae5iDBBe8a03UM\"",
		"mtime": "2026-03-26T01:11:34.865Z",
		"size": 36723,
		"path": "../public/machine/ezgif-frame-001.jpg"
	},
	"/machine/ezgif-frame-005.jpg": {
		"type": "image/jpeg",
		"etag": "\"d3fb-yi4Tq/eR2QSrsOO55hM6RnQ7ZhU\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 54267,
		"path": "../public/machine/ezgif-frame-005.jpg"
	},
	"/machine/ezgif-frame-003.jpg": {
		"type": "image/jpeg",
		"etag": "\"12195-UUxVu6bFRSJhZIqDNR33nLiVnqA\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 74133,
		"path": "../public/machine/ezgif-frame-003.jpg"
	},
	"/Valorant-Academy.png": {
		"type": "image/png",
		"etag": "\"7bc3a-xNZYJQMgQAAapToOVpt+kfShmhA\"",
		"mtime": "2026-03-26T01:11:34.869Z",
		"size": 506938,
		"path": "../public/Valorant-Academy.png"
	},
	"/machine/ezgif-frame-002.jpg": {
		"type": "image/jpeg",
		"etag": "\"b027-ESfu56l7N8k6eSAl4MwpxSAxq4U\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 45095,
		"path": "../public/machine/ezgif-frame-002.jpg"
	},
	"/machine/ezgif-frame-006.jpg": {
		"type": "image/jpeg",
		"etag": "\"99eb-ZMm895jyXZZP3YxlcIul9MSBtdo\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 39403,
		"path": "../public/machine/ezgif-frame-006.jpg"
	},
	"/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e1197-ysrr3rNj4FtLvZ/yMPaysM9pqoU\"",
		"mtime": "2026-03-26T01:11:33.579Z",
		"size": 922007,
		"path": "../public/assets/facade__virtual_vinext-rsc-entry-CFkAqK9g.js"
	},
	"/assets/performanceBudget-CNEbowSu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d543b-f4OibXwqr5bQQNbJw30yNTGe9zw\"",
		"mtime": "2026-03-26T01:11:33.580Z",
		"size": 873531,
		"path": "../public/assets/performanceBudget-CNEbowSu.js"
	},
	"/machine/ezgif-frame-004.jpg": {
		"type": "image/jpeg",
		"etag": "\"111c0-uqnrtqebrcFbMkrIAAIpvXGwOsY\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 70080,
		"path": "../public/machine/ezgif-frame-004.jpg"
	},
	"/machine/ezgif-frame-007.jpg": {
		"type": "image/jpeg",
		"etag": "\"8d81-Jx52cDSt2QaxCCixUXMxVT0v7Qo\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 36225,
		"path": "../public/machine/ezgif-frame-007.jpg"
	},
	"/machine/ezgif-frame-010.jpg": {
		"type": "image/jpeg",
		"etag": "\"6a44-WJl3rL8FqxLXvHGdRfvOeRtJyx0\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 27204,
		"path": "../public/machine/ezgif-frame-010.jpg"
	},
	"/machine/ezgif-frame-008.jpg": {
		"type": "image/jpeg",
		"etag": "\"80d1-9wZWJ4rHChRYln45m1b3TaLFk1U\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 32977,
		"path": "../public/machine/ezgif-frame-008.jpg"
	},
	"/machine/ezgif-frame-009.jpg": {
		"type": "image/jpeg",
		"etag": "\"7259-kb6k2207yS/RGp7JfUQbAJfmXy8\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 29273,
		"path": "../public/machine/ezgif-frame-009.jpg"
	},
	"/machine/ezgif-frame-011.jpg": {
		"type": "image/jpeg",
		"etag": "\"6329-DNyFpXfJHNA00shCWNyTrjTgd38\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 25385,
		"path": "../public/machine/ezgif-frame-011.jpg"
	},
	"/machine/ezgif-frame-013.jpg": {
		"type": "image/jpeg",
		"etag": "\"5c13-JL2UpdUWsefwUIHRzwq8t+YE/SE\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 23571,
		"path": "../public/machine/ezgif-frame-013.jpg"
	},
	"/machine/ezgif-frame-012.jpg": {
		"type": "image/jpeg",
		"etag": "\"5ed4-H8s01zD6bz6s6nPx9btShL2lZTo\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 24276,
		"path": "../public/machine/ezgif-frame-012.jpg"
	},
	"/machine/ezgif-frame-014.jpg": {
		"type": "image/jpeg",
		"etag": "\"5abd-vvW159j9M72hDGIZpyQYalr8u7o\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 23229,
		"path": "../public/machine/ezgif-frame-014.jpg"
	},
	"/machine/ezgif-frame-015.jpg": {
		"type": "image/jpeg",
		"etag": "\"5c64-aWP6NQfCVZyo7B1BYlLk7n91xHk\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 23652,
		"path": "../public/machine/ezgif-frame-015.jpg"
	},
	"/machine/ezgif-frame-016.jpg": {
		"type": "image/jpeg",
		"etag": "\"6226-lxrkeaiFaUiuaoohx40quzELfVQ\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 25126,
		"path": "../public/machine/ezgif-frame-016.jpg"
	},
	"/machine/ezgif-frame-018.jpg": {
		"type": "image/jpeg",
		"etag": "\"793b-VRopxGWtNLwYk2WpCpa/WSNym8I\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 31035,
		"path": "../public/machine/ezgif-frame-018.jpg"
	},
	"/machine/ezgif-frame-017.jpg": {
		"type": "image/jpeg",
		"etag": "\"72b2-H1oe3A+U3pgp1j79toNvDK+xErw\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 29362,
		"path": "../public/machine/ezgif-frame-017.jpg"
	},
	"/machine/ezgif-frame-020.jpg": {
		"type": "image/jpeg",
		"etag": "\"7f5c-IuxHBjHXQ9CM7lDWtq3QRNzHYa8\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 32604,
		"path": "../public/machine/ezgif-frame-020.jpg"
	},
	"/machine/ezgif-frame-019.jpg": {
		"type": "image/jpeg",
		"etag": "\"7bea-6cD8ry68SJ9ONXCp+oMwlvETcK4\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 31722,
		"path": "../public/machine/ezgif-frame-019.jpg"
	},
	"/machine/ezgif-frame-021.jpg": {
		"type": "image/jpeg",
		"etag": "\"7ae7-2W1R56Hipg3c+szDU3t50BiTsIw\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 31463,
		"path": "../public/machine/ezgif-frame-021.jpg"
	},
	"/machine/ezgif-frame-023.jpg": {
		"type": "image/jpeg",
		"etag": "\"7e6e-vZSAYAmbR1q8N/k72y3Pv+M1b3Q\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 32366,
		"path": "../public/machine/ezgif-frame-023.jpg"
	},
	"/machine/ezgif-frame-022.jpg": {
		"type": "image/jpeg",
		"etag": "\"756b-fqwcC1mtN87DhROqYsjcXnjE/Lc\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 30059,
		"path": "../public/machine/ezgif-frame-022.jpg"
	},
	"/machine/ezgif-frame-024.jpg": {
		"type": "image/jpeg",
		"etag": "\"86f2-BJCViapkEc9/rmgHu1U4qqvp+hM\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 34546,
		"path": "../public/machine/ezgif-frame-024.jpg"
	},
	"/machine/ezgif-frame-025.jpg": {
		"type": "image/jpeg",
		"etag": "\"92ee-cU7wSvO0q7XNQLvRsuhW6TFHbmg\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 37614,
		"path": "../public/machine/ezgif-frame-025.jpg"
	},
	"/machine/ezgif-frame-027.jpg": {
		"type": "image/jpeg",
		"etag": "\"9e1b-Chx9WLtpGhKrt0/sQeGEc1xG6b0\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 40475,
		"path": "../public/machine/ezgif-frame-027.jpg"
	},
	"/machine/ezgif-frame-028.jpg": {
		"type": "image/jpeg",
		"etag": "\"a228-/jdkprZNffbPjoAAhegZRkKXFnA\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 41512,
		"path": "../public/machine/ezgif-frame-028.jpg"
	},
	"/machine/ezgif-frame-026.jpg": {
		"type": "image/jpeg",
		"etag": "\"9c4d-xX5tJsyBtDytw+sJxW+epWxM6Mo\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 40013,
		"path": "../public/machine/ezgif-frame-026.jpg"
	},
	"/machine/ezgif-frame-029.jpg": {
		"type": "image/jpeg",
		"etag": "\"a3f3-2bA1y11yOLEH9x9Z5/n5cN5J+78\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 41971,
		"path": "../public/machine/ezgif-frame-029.jpg"
	},
	"/machine/ezgif-frame-030.jpg": {
		"type": "image/jpeg",
		"etag": "\"a3ea-NR/hWTx7d8XG4OHc6nEm0EB7TVs\"",
		"mtime": "2026-03-26T01:11:34.867Z",
		"size": 41962,
		"path": "../public/machine/ezgif-frame-030.jpg"
	},
	"/machine/ezgif-frame-031.jpg": {
		"type": "image/jpeg",
		"etag": "\"a12c-16ogOjQP621QsrN7w8JZAjOD4UI\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 41260,
		"path": "../public/machine/ezgif-frame-031.jpg"
	},
	"/machine/ezgif-frame-032.jpg": {
		"type": "image/jpeg",
		"etag": "\"a01c-leGTZotE2cJ7JAnlzn1pWFUDJwU\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 40988,
		"path": "../public/machine/ezgif-frame-032.jpg"
	},
	"/machine/ezgif-frame-035.jpg": {
		"type": "image/jpeg",
		"etag": "\"a3a1-bfXeq54Ao6i2k/lMEkOrWUqWGFg\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 41889,
		"path": "../public/machine/ezgif-frame-035.jpg"
	},
	"/machine/ezgif-frame-034.jpg": {
		"type": "image/jpeg",
		"etag": "\"a1b6-tCyYeELKpAqIoP8W8w2LYp7FcRw\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 41398,
		"path": "../public/machine/ezgif-frame-034.jpg"
	},
	"/machine/ezgif-frame-033.jpg": {
		"type": "image/jpeg",
		"etag": "\"a1e0-dSwDFPS7sxV9jd2El+IA2H3fRIg\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 41440,
		"path": "../public/machine/ezgif-frame-033.jpg"
	},
	"/machine/ezgif-frame-036.jpg": {
		"type": "image/jpeg",
		"etag": "\"a3d9-wj0/dMeHnYms80v6kq8zKCdVats\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 41945,
		"path": "../public/machine/ezgif-frame-036.jpg"
	},
	"/machine/ezgif-frame-038.jpg": {
		"type": "image/jpeg",
		"etag": "\"a185-28LeDFWwus5WNMADrQjTX2BtGgI\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 41349,
		"path": "../public/machine/ezgif-frame-038.jpg"
	},
	"/machine/ezgif-frame-037.jpg": {
		"type": "image/jpeg",
		"etag": "\"a1f9-2cEtqBWqxC320uX6SrX71hiKMNc\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 41465,
		"path": "../public/machine/ezgif-frame-037.jpg"
	},
	"/machine/ezgif-frame-039.jpg": {
		"type": "image/jpeg",
		"etag": "\"9f4f-kuUc6o1qZi85HAiyFUsSZ+buS10\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 40783,
		"path": "../public/machine/ezgif-frame-039.jpg"
	},
	"/images/cortes/3.webp": {
		"type": "image/webp",
		"etag": "\"1d350-HBTt6F8FTPq7UDrI9av2rG4Vbuk\"",
		"mtime": "2026-03-26T01:11:34.866Z",
		"size": 119632,
		"path": "../public/images/cortes/3.webp"
	},
	"/machine/ezgif-frame-040.jpg": {
		"type": "image/jpeg",
		"etag": "\"9eb2-AQ0NiqR1o8mGjT8Xf1+uRgRtemE\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 40626,
		"path": "../public/machine/ezgif-frame-040.jpg"
	},
	"/images/cortes/corte neutro.jpg": {
		"type": "image/jpeg",
		"etag": "\"1f0a-M0jiYhqaLUqXyHT3RMnlgb6WqUk\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 7946,
		"path": "../public/images/cortes/corte neutro.jpg"
	},
	"/images/cortes/corte-americano3.jpg": {
		"type": "image/jpeg",
		"etag": "\"177d-JHjeEG5jENFt9tmRmput0q+Yri4\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 6013,
		"path": "../public/images/cortes/corte-americano3.jpg"
	},
	"/images/cortes/corteluz.jpg": {
		"type": "image/jpeg",
		"etag": "\"15cd-p12/19WAjviOz5UNcK/YSBmcr1I\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 5581,
		"path": "../public/images/cortes/corteluz.jpg"
	},
	"/images/cortes/corte moner.jpeg": {
		"type": "image/jpeg",
		"etag": "\"3e5e8-tn8abgtiJZPIU0hNEc5gICsRZ2o\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 255464,
		"path": "../public/images/cortes/corte moner.jpeg"
	},
	"/images/cortes/corte-americano2.jpg": {
		"type": "image/jpeg",
		"etag": "\"19ee-X3IQIB+2O9kWpRJmJM0TRb6/BiM\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 6638,
		"path": "../public/images/cortes/corte-americano2.jpg"
	},
	"/images/cortes/corte.jpg": {
		"type": "image/jpeg",
		"etag": "\"174a-AkP4sQbjpv/o9I0MO2i2i5wx6Nw\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 5962,
		"path": "../public/images/cortes/corte.jpg"
	},
	"/images/cortes/cortes-americano.jpg": {
		"type": "image/jpeg",
		"etag": "\"215b-Nx5t7VW5o48HFStvx8GY2J2shT0\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 8539,
		"path": "../public/images/cortes/cortes-americano.jpg"
	},
	"/images/cortes/images.jpg": {
		"type": "image/jpeg",
		"etag": "\"2195-p0SQRnt0s8W2KdqegT48meu6lQI\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 8597,
		"path": "../public/images/cortes/images.jpg"
	},
	"/images/cortes/dqeasd.jpg": {
		"type": "image/jpeg",
		"etag": "\"198b-DAqIgLbgPlWS+EnGJzlcqday7fY\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 6539,
		"path": "../public/images/cortes/dqeasd.jpg"
	},
	"/images/cortes/ook.jpg": {
		"type": "image/jpeg",
		"etag": "\"1a41-rT0LipI15YZxhjmpdDPWGwZuLX4\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 6721,
		"path": "../public/images/cortes/ook.jpg"
	},
	"/images/cortes/cdn.manualdohomem.com.webp": {
		"type": "image/webp",
		"etag": "\"f67bc-g/hoyC2MK6d1MkICOmg2+7UKa9E\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 1009596,
		"path": "../public/images/cortes/cdn.manualdohomem.com.webp"
	},
	"/images/cortes/men-hairstyle-2022-cortes-de-cabelo-masculino-2022-liso-cacheado-crespo-curto-longo-01.webp": {
		"type": "image/webp",
		"etag": "\"1c7a0-azgUMKLqlUcmvS1BNYKmqXl5dj8\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 116640,
		"path": "../public/images/cortes/men-hairstyle-2022-cortes-de-cabelo-masculino-2022-liso-cacheado-crespo-curto-longo-01.webp"
	},
	"/images/cortes/imagescorte.jpg": {
		"type": "image/jpeg",
		"etag": "\"1a7a-g8pDda00iTXD75kkbm4zOU7E2Zo\"",
		"mtime": "2026-03-26T01:11:34.868Z",
		"size": 6778,
		"path": "../public/images/cortes/imagescorte.jpg"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_UlHuIG = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_UlHuIG
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function createNitroApp() {
	const hooks = void 0;
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		{
			const routeRules = getRouteRules(method, pathname);
			event.context.routeRules = routeRules?.routeRules;
			if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		}
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	for (const rule of Object.values(routeRules)) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
