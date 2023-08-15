export default {
  extensions: {
    ts: "module"
  },
  nodeArguments: [
    "--loader=ts-node/esm",
    "--experimental-specifier-resolution=node",
    "--trace-warnings"
  ],
  files: [
    "**/__test__/*.spec.ts"
  ],
  timeout: "10m",
  verbose: true,
  // The default is number of course, which in CI I guess is 1
  concurrency: 5
}
