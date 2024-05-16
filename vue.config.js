// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: true
// })

module.exports = {
  configureWebpack: {
    module: {
      rules: [
        {
          test: /\.(frag|vert|glsl)$/i,
          use: 'raw-loader',
        },
      ],
    },
  },
}
