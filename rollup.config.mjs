import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/navkit.esm.js", // Match your package.json
        format: "esm",
      },
      {
        file: "dist/navkit.cjs.js", // Match your package.json
        format: "cjs",
      },
    ],
    external: ["vue"],
    plugins: [
      resolve(),
      typescript({
        tsconfig: "./tsconfig.json",
        declarationDir: "./dist", // Explicitly set declaration output
        rootDir: "./src",
      }),
    ],
  },
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.d.ts",
        format: "es",
      },
    ],
    plugins: [
      dts({
        compilerOptions: {
          preserveSymlinks: false,
        },
      }),
    ],
  },
  {
    input: "src/hooks/index.ts",
    output: [
      {
        file: "dist/hooks/index.d.ts",
        format: "es",
      },
    ],
    plugins: [dts()],
  },
];
