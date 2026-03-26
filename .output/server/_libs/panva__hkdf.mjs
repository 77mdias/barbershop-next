import { i as __require, t as __commonJSMin } from "../_runtime.mjs";
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
	var crypto = __require("crypto");
	var fallback_js_1 = require_fallback();
	var hkdf;
	if (typeof crypto.hkdf === "function" && !process.versions.electron) hkdf = async (...args) => new Promise((resolve, reject) => {
		crypto.hkdf(...args, (err, arrayBuffer) => {
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
export { require_cjs as t };
