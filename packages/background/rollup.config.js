import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";

const production = !process.env.ROLLUP_WATCH;

console.log("> Is production :", production);

console.log("\n───\n");

export default {
  input: "./src/index.ts",
  output: {
    sourcemap: true,
    format: "umd",
    name: "background",
    file: "lib/index.js",
  },
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify(
        production ? "production" : "development"
      ),
    }),
    resolve({
      browser: true,
    }),
    commonjs(),
    typescript({
      sourceMap: !production,
      inlineSources: !production,
    }),
  ],
  watch: {
    clearScreen: false,
  },
};
