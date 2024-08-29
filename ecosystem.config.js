module.exports = {
  apps: [
    {
      name: "nextjs-app",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000", // Port number can be changed as needed
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
