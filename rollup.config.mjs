import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import dts from "rollup-plugin-dts";

export default [
  // Main NavKit bundle
  {
    input: "src/index.ts",
    output: [
      { file: "dist/navkit.esm.js", format: "esm" },
      { file: "dist/navkit.cjs.js", format: "cjs" },
    ],
    external: ["vue"],
    plugins: [
      resolve(),
      typescript({
        tsconfig: "./tsconfig.json",
        declarationDir: "./dist",
        rootDir: "./src",
      }),
    ],
  },
  // Type Definitions for main bundle
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
  // Separate build for hooks
  {
    input: "src/hooks/index.ts",
    output: [
      { file: "dist/hooks/index.esm.js", format: "esm" },
      { file: "dist/hooks/index.cjs.js", format: "cjs" },
    ],
    external: ["vue"],
    plugins: [
      resolve(),
      typescript({
        tsconfig: "./tsconfig.json",
        declarationDir: "./dist/hooks",
        rootDir: "./src/hooks",
      }),
    ],
  },
  // Type Definitions for hooks
  {
    input: "src/hooks/index.ts",
    output: [{ file: "dist/hooks/index.d.ts", format: "es" }],
    plugins: [dts()],
  },
];
