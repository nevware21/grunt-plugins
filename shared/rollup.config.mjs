import nodeResolve from "@rollup/plugin-node-resolve";

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
        plugins: [
            nodeResolve({
                module: true,
                browser: true,
                preferBuiltins: false
            })
        ]
    };

    return gruntTaskRollupConfig;
};

export default [
    gruntTaskRollupConfigFactory()
];
