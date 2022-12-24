import nodeResolve from "@rollup/plugin-node-resolve";

const gruntTaskRollupConfigFactory = () => {
    const gruntTaskRollupConfig = {
        input: `dist-esm/index.js`,
        output: {
            file: `tasks/ts-plugin.js`,
            format: "cjs",
            name: "module.exports",
            extend: true,
            freeze: false,
            sourcemap: true,
            exports: "default"
        },
        external: [ "fs", "path" ],
        plugins: [
            nodeResolve({
                module: true,
                browser: false,
                preferBuiltins: true
            })
        ]
    };

    return gruntTaskRollupConfig;
};

export default [
    gruntTaskRollupConfigFactory()
];
