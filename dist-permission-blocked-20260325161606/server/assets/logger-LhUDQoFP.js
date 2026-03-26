//#region src/lib/logger.ts
var Logger = class {
	constructor() {
		this.isDevelopment = false;
		this.isClient = typeof window !== "undefined";
		this.auth = {
			debug: (message, data) => this.debug(message, data, "Auth"),
			info: (message, data) => this.info(message, data, "Auth"),
			warn: (message, data) => this.warn(message, data, "Auth"),
			error: (message, data) => this.error(message, data, "Auth")
		};
		this.api = {
			debug: (message, data) => this.debug(message, data, "API"),
			info: (message, data) => this.info(message, data, "API"),
			warn: (message, data) => this.warn(message, data, "API"),
			error: (message, data) => this.error(message, data, "API")
		};
		this.component = {
			debug: (component, message, data) => this.debug(message, data, component),
			info: (component, message, data) => this.info(message, data, component),
			warn: (component, message, data) => this.warn(message, data, component),
			error: (component, message, data) => this.error(message, data, component)
		};
	}
	formatMessage(level, message, data, component) {
		return {
			level,
			message,
			data,
			timestamp: (/* @__PURE__ */ new Date()).toISOString(),
			component
		};
	}
	shouldLog(level) {
		if (!this.isDevelopment) return level === "warn" || level === "error";
		return true;
	}
	output(entry) {
		if (!this.shouldLog(entry.level)) return;
		const message = `${entry.component ? `[${entry.component}]` : ""} ${entry.message}`;
		switch (entry.level) {
			case "debug":
				if (this.isDevelopment) console.debug(message, entry.data || "");
				break;
			case "info":
				console.info(message, entry.data || "");
				break;
			case "warn":
				console.warn(message, entry.data || "");
				break;
			case "error":
				console.error(message, entry.data || "");
				break;
		}
	}
	debug(message, data, component) {
		const entry = this.formatMessage("debug", message, data, component);
		this.output(entry);
	}
	info(message, data, component) {
		const entry = this.formatMessage("info", message, data, component);
		this.output(entry);
	}
	warn(message, data, component) {
		const entry = this.formatMessage("warn", message, data, component);
		this.output(entry);
	}
	error(message, data, component) {
		const entry = this.formatMessage("error", message, data, component);
		this.output(entry);
	}
};
var logger = new Logger();
//#endregion
export { logger as t };
