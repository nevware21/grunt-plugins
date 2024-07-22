import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const gruntTaskRollupConfigFactory = () => {
    const gruntTaskRollupConfig = {
        input: `dist-esm/shared-utils.js`,
        output: {
            file: `dist/shared-utils.js`,
            format: "cjs",
            name: "module.exports",
            extend: true,
            freeze: false,
            sourcemap: true
        },
        external: [ "fs", "path" ],
        plugins: [
            commonjs(),
            nodeResolve({
                module: true,
                browser: false,
                preferBuiltins: false
            })
        ]
    };

    return gruntTaskRollupConfig;
};

export default [
    gruntTaskRollupConfigFactory()
];
