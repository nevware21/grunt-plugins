import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

const gruntTaskRollupConfigFactory = () => {
    const gruntTaskRollupConfig = {
        input: `dist-esm/index.js`,
        output: {
            file: `tasks/eslint-ts-plugin.js`,
            format: "cjs",
            name: "module.exports",
            extend: true,
            freeze: false,
            sourcemap: true,
            exports: "default"
        },
        external: [ "fs", "path" ],
        plugins: [
            json(),
            commonjs(),
            nodeResolve({
                module: true,
                browser: false,
                preferBuiltins: false,
            })
        ]
    };

    return gruntTaskRollupConfig;
};

export default [
    gruntTaskRollupConfigFactory()
];
