import { a as MathUtils, i as useFrame, n as Float, r as Canvas, t as getSceneTierBudget } from "./performanceBudget-CXhB2gBd.js";
import { useMemo, useRef } from "react";
import { Fragment as Fragment$1, jsx, jsxs } from "react/jsx-runtime";
//#region src/components/home-3d/HomeSceneCanvas.tsx
function MovingLight({ color }) {
	const lightRef = useRef(null);
	useFrame(({ clock }) => {
		if (!lightRef.current) return;
		const t = clock.getElapsedTime();
		lightRef.current.position.x = Math.sin(t * .3) * 4;
		lightRef.current.position.z = 5 + Math.cos(t * .25) * 1.2;
	});
	return /* @__PURE__ */ jsx("pointLight", {
		ref: lightRef,
		intensity: 1.2,
		position: [
			0,
			2.5,
			5
		],
		color
	});
}
function BarberPole({ position, rotation, scale, speed, rotationIntensity, floatIntensity, cylinderSegments, capSegments, palette }) {
	const stripeAngles = useMemo(() => [
		0,
		.85,
		1.7,
		2.55
	], []);
	return /* @__PURE__ */ jsx(Float, {
		speed,
		rotationIntensity,
		floatIntensity,
		children: /* @__PURE__ */ jsxs("group", {
			position,
			rotation,
			scale,
			children: [
				/* @__PURE__ */ jsxs("mesh", {
					castShadow: true,
					children: [/* @__PURE__ */ jsx("cylinderGeometry", { args: [
						.24,
						.24,
						2.5,
						cylinderSegments
					] }), /* @__PURE__ */ jsx("meshStandardMaterial", {
						color: palette.poleBody,
						metalness: .12,
						roughness: .32
					})]
				}),
				stripeAngles.map((angle) => /* @__PURE__ */ jsxs("mesh", {
					rotation: [
						0,
						angle,
						Math.PI / 4
					],
					children: [/* @__PURE__ */ jsx("boxGeometry", { args: [
						.11,
						2.45,
						.32
					] }), /* @__PURE__ */ jsx("meshStandardMaterial", {
						color: palette.poleStripe,
						metalness: .16,
						roughness: .36
					})]
				}, angle)),
				/* @__PURE__ */ jsxs("mesh", {
					position: [
						0,
						-1.35,
						0
					],
					children: [/* @__PURE__ */ jsx("cylinderGeometry", { args: [
						.31,
						.31,
						.18,
						capSegments
					] }), /* @__PURE__ */ jsx("meshStandardMaterial", {
						color: palette.poleCap,
						metalness: .24,
						roughness: .28
					})]
				}),
				/* @__PURE__ */ jsxs("mesh", {
					position: [
						0,
						1.35,
						0
					],
					children: [/* @__PURE__ */ jsx("cylinderGeometry", { args: [
						.31,
						.31,
						.18,
						capSegments
					] }), /* @__PURE__ */ jsx("meshStandardMaterial", {
						color: palette.poleCap,
						metalness: .24,
						roughness: .28
					})]
				})
			]
		})
	});
}
function CameraRig({ tier, pointerMode }) {
	const smoothFactor = tier === "high" ? 3.2 : tier === "medium" ? 2.8 : 2.2;
	const targetMultiplier = pointerMode === "disabled" ? 0 : pointerMode === "limited" ? tier === "high" ? .12 : .08 : tier === "high" ? .2 : .14;
	useFrame(({ camera, pointer }, delta) => {
		camera.position.x = MathUtils.lerp(camera.position.x, pointer.x * targetMultiplier, delta * smoothFactor);
		camera.position.y = MathUtils.lerp(camera.position.y, pointer.y * targetMultiplier, delta * smoothFactor);
		camera.lookAt(0, 0, 0);
	});
	return null;
}
function SceneObjects({ tier, palette }) {
	const budget = getSceneTierBudget("home", tier);
	return /* @__PURE__ */ jsx(Fragment$1, { children: (tier === "high" ? [
		{
			position: [
				-2.8,
				1.2,
				-1.4
			],
			rotation: [
				.08,
				.3,
				-.1
			],
			scale: 1,
			speed: 1.2
		},
		{
			position: [
				2.6,
				-1,
				-1.7
			],
			rotation: [
				-.05,
				-.25,
				.12
			],
			scale: .95,
			speed: 1.05
		},
		{
			position: [
				.5,
				2.4,
				-3
			],
			rotation: [
				.04,
				.2,
				0
			],
			scale: .6,
			speed: .9
		},
		{
			position: [
				-4,
				-2,
				-3.8
			],
			rotation: [
				.1,
				.4,
				.15
			],
			scale: .55,
			speed: .85
		}
	] : tier === "medium" ? [
		{
			position: [
				-2.3,
				1.1,
				-1.2
			],
			rotation: [
				.08,
				.28,
				-.08
			],
			scale: .96,
			speed: 1.1
		},
		{
			position: [
				2.1,
				-.9,
				-1.5
			],
			rotation: [
				-.05,
				-.24,
				.1
			],
			scale: .9,
			speed: 1
		},
		{
			position: [
				.4,
				2.2,
				-2.8
			],
			rotation: [
				.03,
				.18,
				0
			],
			scale: .55,
			speed: .82
		}
	] : [{
		position: [
			-1.9,
			1,
			-1.1
		],
		rotation: [
			.05,
			.25,
			-.06
		],
		scale: .84,
		speed: .86
	}, {
		position: [
			1.8,
			-.8,
			-1.2
		],
		rotation: [
			-.04,
			-.2,
			.08
		],
		scale: .78,
		speed: .82
	}]).slice(0, budget.maxAnimatedObjects).map((item, index) => /* @__PURE__ */ jsx(BarberPole, {
		position: item.position,
		rotation: item.rotation,
		scale: item.scale,
		speed: item.speed * budget.speedMultiplier,
		rotationIntensity: budget.rotationIntensity,
		floatIntensity: budget.floatIntensity,
		cylinderSegments: budget.cylinderSegments,
		capSegments: budget.capSegments,
		palette
	}, `pole-${index}`)) });
}
function HomeSceneCanvas({ tier, theme, pointerMode }) {
	const budget = getSceneTierBudget("home", tier);
	const palette = theme === "dark" ? {
		fog: "#06080d",
		keyLight: "#b8c7ff",
		pointLight: "#f4c069",
		poleBody: "#f5f5f5",
		poleStripe: "#be2f3f",
		poleCap: "#1f2e58"
	} : {
		fog: "#dce6f5",
		keyLight: "#5e6ea2",
		pointLight: "#c7842d",
		poleBody: "#ffffff",
		poleStripe: "#c34e5e",
		poleCap: "#2f4b80"
	};
	return /* @__PURE__ */ jsxs(Canvas, {
		dpr: [1, budget.maxDpr],
		camera: {
			position: [
				0,
				0,
				7
			],
			fov: 42
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
			/* @__PURE__ */ jsx("fog", {
				attach: "fog",
				args: [
					palette.fog,
					theme === "dark" ? 6 : 8,
					theme === "dark" ? 14 : 18
				]
			}),
			/* @__PURE__ */ jsx("ambientLight", { intensity: theme === "dark" ? .5 : .42 }),
			/* @__PURE__ */ jsx("directionalLight", {
				position: [
					2,
					3,
					2
				],
				intensity: .75,
				color: palette.keyLight
			}),
			/* @__PURE__ */ jsx(MovingLight, { color: palette.pointLight }),
			/* @__PURE__ */ jsx(CameraRig, {
				tier,
				pointerMode
			}),
			/* @__PURE__ */ jsx(SceneObjects, {
				tier,
				palette
			})
		]
	});
}
//#endregion
export { HomeSceneCanvas };
