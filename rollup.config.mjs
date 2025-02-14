import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/navkit.esm.js",
        format: "esm",
      },
      {
        file: "dist/navkit.cjs.js",
        format: "cjs",
      },
    ],
    external: ["vue"],
    treeshake: true,
    plugins: [
      resolve(),
      typescript({
        tsconfig: "./tsconfig.json",
        declarationDir: "./dist",
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
