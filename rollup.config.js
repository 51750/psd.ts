import ts from "@wessberg/rollup-plugin-ts";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

export default [{
	input: "src/index.ts",
	output: {
		name: "index",
		file: "index.js",
		format: "umd"
	},
	plugins: [
		ts(),
		terser(),
	],
	external: Object.keys(pkg.dependencies),
}]