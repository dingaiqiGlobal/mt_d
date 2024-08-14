const sceneConfig = {
  //环境
  environment: {
    enable: true, // 是否开启环境天空盒绘制
    mode: 1, // 天空盒模式： 0: 氛围模式， 1: 实景模式
    level: 0, // 实景模式下的模糊级别，0-3
    brightness: 1, // 天空盒的明亮度，-1 - 1， 默认为0
  },

  //天气-雾选项
  weather: {
    enable: true,
    fog: {
      enable: true, //开启/ 关闭雾天效果
      start: 0.1,//最近可视距离
      end: 26,//最远可视距离
      color: [0.9, 0.9, 0.9],//雾的颜色
    },
  },

  //阴影
  shadow: {
    type: "esm", // 阴影模式，固定为esm
    enable: true, // 是否开启
    quality: "high", // 阴影质量，可选的值：high, medium, low
    opacity: 1, // 阴影的透明度，0 - 1
    color: [0, 0, 0], // 阴影的颜色，归一化三位rgb颜色值
    blurOffset: 1, // 阴影模糊偏移量，值越高阴影越模糊
  },

  //地面（可以不加底图，设置统一颜色）
  ground: {
    enable: true, 
    renderPlugin: {
      type: "fill",
    },
    symbol: {
      polygonFill: [1, 1, 1, 1], 
      polygonOpacity: 1,
    },
  },
  // ground: {
  //   enable: true,                                   // 是否开启地面绘制
  //   renderPlugin: {                                 // 地面的绘制插件，取值范围 lit 或者 fill
  //     type: 'lit'
  //   },
  //   symbol: {
  //     ssr: true,                                    // 是否开启ssr，屏幕空间反射
  //     material: litMaterial,                        // 如果绘制插件为lit，设置pbr材质
  //     polygonFill: [1, 1, 1, 1],                    // 四位归一化颜色值
  //     polygonOpacity: 1                             // 透明度 0-1
  //   }
  // },

  //后期处理
  postProcess: {
    enable: true,                                   // 是否开启后处理
    antialias: {
      enable: true,                                 // 是否开启FXAA后处理
      taa: true                                     // 是否开启taa后处理
    },
    ssr: {
      enable: true                                  // 是否开启屏幕空间反射
    },
    ssao: {
      enable: true,                                 // 是否开启屏幕空间环境光遮蔽
      bias: 0.03,                                   // 阴影偏移值，越大，阴影就越清晰，0.05 - 1
      radius: 0.08,                                 // 遮蔽半径，越大，阴影就越清晰， 0.05 - 1
      intensity: 1.5                                // 强度因子， 0.1 - 5
    },
    sharpen: {
      enable: false,                                // 是否开启锐化
      factor: 0.2                                   // 强度因子，0 - 1
    },
    bloom: {
      enable: true,                                 // 是否开启泛光
      factor: 1,                                    // 强度因子 0.1 - 5
      threshold: 0,                                 // 最小阈值（亮度低于阈值的区域不发光） 0 - 1
      radius: 1                                     // 泛光半径 0.1 - 4
    },
    outline: {
      enable: true                                  // 是否开启高亮后处理
    }
  }
};
