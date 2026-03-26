import { o as __toESM, t as require_react } from "./react-BoLPyrlK.mjs";
import { t as require_jsx_runtime } from "./jsx-runtime-CA5G0i8u.mjs";
import { c as MathUtils } from "../_libs/three.mjs";
import { i as useFrame, n as Float, r as getSceneTierBudget, t as Canvas } from "./performanceBudget-CyTdGb1M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/GallerySceneCanvas-CgYzbMfD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function MovingFillLight({ color }) {
	const fillRef = (0, import_react.useRef)(null);
	useFrame(({ clock }) => {
		if (!fillRef.current) return;
		const t = clock.getElapsedTime();
		fillRef.current.position.x = Math.sin(t * .25) * 3.8;
		fillRef.current.position.y = Math.cos(t * .22) * 1.6;
		fillRef.current.position.z = 5 + Math.cos(t * .31) * 1.2;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
		ref: fillRef,
		intensity: 1.1,
		position: [
			0,
			.8,
			5
		],
		color
	});
}
function CameraRig({ tier, pointerMode }) {
	const smoothFactor = tier === "high" ? 3.4 : tier === "medium" ? 2.9 : 2.2;
	const targetMultiplier = pointerMode === "disabled" ? 0 : pointerMode === "limited" ? tier === "high" ? .14 : .1 : tier === "high" ? .24 : .18;
	useFrame(({ camera, pointer }, delta) => {
		camera.position.x = MathUtils.lerp(camera.position.x, pointer.x * targetMultiplier, delta * smoothFactor);
		camera.position.y = MathUtils.lerp(camera.position.y, pointer.y * targetMultiplier, delta * smoothFactor);
		camera.lookAt(0, 0, 0);
	});
	return null;
}
function BarberPole({ position, rotation, scale, speed, rotationIntensity, floatIntensity, cylinderSegments, capSegments, palette }) {
	const stripeAngles = (0, import_react.useMemo)(() => [
		0,
		.85,
		1.7,
		2.55
	], []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Float, {
		speed,
		rotationIntensity,
		floatIntensity,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			position,
			rotation,
			scale,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
					.2,
					.2,
					2.2,
					cylinderSegments
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
					color: palette.poleBody,
					metalness: .1,
					roughness: .3
				})] }),
				stripeAngles.map((angle) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					rotation: [
						0,
						angle,
						Math.PI / 4
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						.09,
						2.15,
						.3
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: palette.poleStripe,
						metalness: .14,
						roughness: .32
					})]
				}, `stripe-${angle}`)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						-1.18,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
						.28,
						.28,
						.16,
						capSegments
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: palette.metal,
						metalness: .24,
						roughness: .25
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						0,
						1.18,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("cylinderGeometry", { args: [
						.28,
						.28,
						.16,
						capSegments
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: palette.metal,
						metalness: .24,
						roughness: .25
					})]
				})
			]
		})
	});
}
function ShearMark({ position, rotation, scale, speed, rotationIntensity, floatIntensity, torusRadialSegments, torusTubularSegments, palette }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Float, {
		speed,
		rotationIntensity,
		floatIntensity,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("group", {
			position,
			rotation,
			scale,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					rotation: [
						0,
						0,
						Math.PI / 5
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						1.9,
						.08,
						.08
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: palette.metal,
						metalness: .52,
						roughness: .25
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					rotation: [
						0,
						0,
						-Math.PI / 5
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("boxGeometry", { args: [
						1.9,
						.08,
						.08
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: palette.metal,
						metalness: .52,
						roughness: .25
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						-.42,
						-.32,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
						.22,
						.05,
						torusRadialSegments,
						torusTubularSegments
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: palette.poleStripe,
						metalness: .26,
						roughness: .35
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
					position: [
						.42,
						-.32,
						0
					],
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("torusGeometry", { args: [
						.22,
						.05,
						torusRadialSegments,
						torusTubularSegments
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshStandardMaterial", {
						color: palette.poleStripe,
						metalness: .26,
						roughness: .35
					})]
				})
			]
		})
	});
}
function SceneObjects({ tier, palette }) {
	const budget = getSceneTierBudget("gallery", tier);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: (tier === "high" ? [
		{
			kind: "pole",
			position: [
				-3.1,
				1.5,
				-1.8
			],
			rotation: [
				.06,
				.34,
				-.08
			],
			scale: .96,
			speed: 1.1
		},
		{
			kind: "shear",
			position: [
				2.5,
				1.9,
				-2.4
			],
			rotation: [
				.24,
				-.46,
				.16
			],
			scale: .74,
			speed: .88
		},
		{
			kind: "pole",
			position: [
				2.9,
				-1.2,
				-2
			],
			rotation: [
				-.08,
				-.26,
				.1
			],
			scale: .84,
			speed: .95
		},
		{
			kind: "shear",
			position: [
				-1.8,
				-2.2,
				-3.4
			],
			rotation: [
				-.18,
				.32,
				-.14
			],
			scale: .62,
			speed: .82
		}
	] : tier === "medium" ? [
		{
			kind: "pole",
			position: [
				-2.6,
				1.3,
				-1.5
			],
			rotation: [
				.06,
				.28,
				-.06
			],
			scale: .9,
			speed: 1.02
		},
		{
			kind: "shear",
			position: [
				2.2,
				1.7,
				-2.2
			],
			rotation: [
				.2,
				-.42,
				.12
			],
			scale: .66,
			speed: .82
		},
		{
			kind: "pole",
			position: [
				2.4,
				-1.1,
				-1.8
			],
			rotation: [
				-.06,
				-.24,
				.08
			],
			scale: .76,
			speed: .9
		}
	] : [{
		kind: "pole",
		position: [
			-2.1,
			1.2,
			-1.3
		],
		rotation: [
			.05,
			.25,
			-.04
		],
		scale: .8,
		speed: .84
	}, {
		kind: "shear",
		position: [
			1.9,
			-1.2,
			-1.8
		],
		rotation: [
			.16,
			-.32,
			.08
		],
		scale: .58,
		speed: .72
	}]).slice(0, budget.maxAnimatedObjects).map((item, index) => {
		if (item.kind === "pole") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BarberPole, {
			position: item.position,
			rotation: item.rotation,
			scale: item.scale,
			speed: item.speed * budget.speedMultiplier,
			rotationIntensity: budget.rotationIntensity,
			floatIntensity: budget.floatIntensity,
			cylinderSegments: budget.cylinderSegments,
			capSegments: budget.capSegments,
			palette
		}, `pole-${index}`);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShearMark, {
			position: item.position,
			rotation: item.rotation,
			scale: item.scale,
			speed: item.speed * budget.speedMultiplier,
			rotationIntensity: budget.rotationIntensity,
			floatIntensity: budget.floatIntensity,
			torusRadialSegments: budget.torusRadialSegments,
			torusTubularSegments: budget.torusTubularSegments,
			palette
		}, `shear-${index}`);
	}) });
}
function GallerySceneCanvas({ tier, theme, pointerMode }) {
	const budget = getSceneTierBudget("gallery", tier);
	const palette = theme === "dark" ? {
		fog: "#070b12",
		keyLight: "#bdc9ff",
		fillLight: "#de9f57",
		poleBody: "#f4f4f4",
		poleStripe: "#ba3042",
		metal: "#8ca6d7"
	} : {
		fog: "#d6e3f5",
		keyLight: "#6372a7",
		fillLight: "#bc7b2b",
		poleBody: "#ffffff",
		poleStripe: "#c44e5e",
		metal: "#506fa6"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Canvas, {
		dpr: [1, budget.maxDpr],
		camera: {
			position: [
				0,
				0,
				7.2
			],
			fov: 40
		},
		gl: {
			antialias: budget.antialias,
			alpha: true,
			powerPreference: "high-performance"
		},
		onCreated: ({ gl }) => {
			gl.setClearColor(0, 0);
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
				attach: "fog",
				args: [
					palette.fog,
					theme === "dark" ? 5.8 : 7.2,
					theme === "dark" ? 13 : 16
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", { intensity: theme === "dark" ? .48 : .44 }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("directionalLight", {
				intensity: .8,
				position: [
					2.2,
					2.5,
					2.8
				],
				color: palette.keyLight
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MovingFillLight, { color: palette.fillLight }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraRig, {
				tier,
				pointerMode
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SceneObjects, {
				tier,
				palette
			})
		]
	});
}
//#endregion
export { GallerySceneCanvas };
