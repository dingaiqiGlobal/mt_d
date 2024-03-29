<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import * as dat from "dat.gui";
import { Map, TileLayer } from "maptalks";
import { GroupGLLayer, GeoJSONVectorTileLayer } from "@maptalks/gl-layers";
export default {
  components: {},

  data() {
    return {
      map: null,
      GeoJSONLayer: null,
      groupLayer: null,
      // extrusionSymbol: {},
    };
  },

  computed: {},

  mounted() {
    this.initGui();
    this.map = new Map("map", {
      center: [116.39109, 39.9164],
      zoom: 16,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      lights: {
        directional: {
          direction: [1, 0, -1],
          color: [1, 1, 1],
        },
        ambient: {
          resource: {
            prefilterCubeSize: 1024,
          },
          hsv: [0, 0.34, 0],
          orientation: 0,
        },
      },
      baseLayer: new TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
    });

    /**
     * 3d-extrusion仅适用线面数据
     * 在dataConfig中type设置类型
     * 3d-extrusion: 提升二维面为三维面
     * line-extrusion: 提升二维线为三维线
     */
    const style = {
      style: [
        {
          renderPlugin: {
            // [必填] 固定为lit
            type: "lit",
            // [必填] 数据生成设置
            dataConfig: {
              // [必填]，数据类型
              // 数据类型，可以是
              // 3d-extrusion: 提升二维面为三维面
              // line-extrusion: 提升二维线为三维线
              type: "3d-extrusion",
              // [可选] 默认为 null
              // 顶部高度的属性值，如果没有设置，则用默认高度
              altitudeProperty: "height",
              // [可选] 默认为 null
              // 底部高度的属性值，如果底部高度不为0，则三维体会悬空。如果没有设置，则底部高度默认为0。
              minHeightProperty: null,
              // [可选] 默认为1，单位米
              // 高度缩放比例，例如altitudeProperty中如果存储的是楼层数，可以把altitudeScale设为层高，例如4米
              altitudeScale: 1,
              // [可选] 默认为10，单位米
              // 默认的高度。
              defaultAltitude: 10,
              // [可选] 默认为0，单位米
              // 顶部的厚度，如果不为0，顶部会变成有厚度的形式。
              topThickness: 0,
              // [可选] 默认为true
              // 是否构造顶部数据。
              top: true,
              // [可选] 默认为true
              // 是否构造侧面数据。
              side: true,
            },
            // [可选] 场景渲染设置
            sceneConfig: {
              // [可选] 默认为 "src alpha"
              // WebGL的blendEquation的src参数，可选的值有：
              // 0, 1, "src color", "one minus src color", "src alpha", "one minus dst color", "dst alpha",
              // "one minus dst alpha", "constant color", "one minus constant color", "constant alpha",
              // "one minus constant alpha", "src alpha saturate"
              ////blendSrc: "src alpha",
              // [可选] 默认为 "one minus src alpha"
              // WebGL的blendEquation的dst参数，可选的值有：
              // 0, 1, "src color", "one minus src color", "src alpha", "one minus dst color", "dst alpha",
              // "one minus dst alpha", "constant color", "one minus constant color", "constant alpha",
              // "one minus constant alpha", "src alpha saturate"
              ////blendDst: "one minus src alpha",
              // [可选] 默认为[0, 1]
              // WebGL深度值范围
              ////depthRange: [0, 1],
              // 【可选]，默认为null
              // feature-filter类型，符合条件的数据将不被渲染
              ////excludes: [],
              // [可选] 默认为<=
              // WebGL深度测试函数，可选的值有 always, never, <, <=, !=, >, >=
              ////depthFunc: "<=",
              // [可选] String类型，默认为null
              // 三维面的进场动画，animation制定了动画的easing
              // 具体支持的easing种类可以参考： https://github.com/fuzhenn/animation-easings
              ////animation: null,
              // [可选] 默认为 800，单位ms
              // 动画持续时间
              ///animationDuration: 800,
            },
          },
          filter: true,
          symbol: {
            visible: true,
            bloom: false,
            ssr: false, //是否支持ssr屏幕空间反射后处理
            polygonOpacity: 1,
            material: {
              baseColorTexture: "images/icon/PolylineVolumeTrialMaterial.png", //基础色纹理的路径，支持url或者base64
              baseColorFactor: [1, 2, 1, 1], //必须是这种形式（四位归一化数组）
              //hsv: [0, 0, 0], //色相，饱和度和明度
              //baseColorIntesity:1,//颜色强度，颜色 = baseColorFactor * baseColorIntesity
              //contrast:1,//颜色对比度，取值范围 0 - 5, 当值为1时则不影响原有颜色	1
              //outputSRGB:1,//是否输出SRGB色	1
              //metallicRoughnessTexture:null,//金属度粗糙度的路径，纹理的g通道是金属度，b通道是粗糙度，支持url或者base64
              //roughnessFactor:0.4,//粗糙度，取值范围 0 - 1，0为最光滑，1为最粗糙
              //metallicFactor:0,//金属度，取值范围 0 - 1，0为非金属，1为金属
              //normalTexture:null,//发现纹理的路径，支持url或者base64
              // normalMapFactor:1,//法线纹理的强度因子。
              // bumpTexture:null,//高度纹理的路径，支持url或者base64
              // bumpScale:1,//高度纹理强度因子
              // occlusionTexture:null,//环境光遮蔽纹理的路径，支持url或者base64
              // emissiveTexture: null, //自发光纹理的路径，支持url或者base64
              // emissiveFactor: [0, 0, 0], //自发光颜色值
              // emitColorFactor: 5, //自发光颜色强度因子
              // emitMultiplicative: 0, //自发光与原颜色是否是相乘，0表示相加，1表示相乘。
              // clearCoatThickness:5,//清漆厚度
              // clearCoatFactor:0,//清漆强度因子
              // clearCoatIor:1.4,//清漆的反射率(IOR)
              // clearCoatRoughnessFactor:0.04,//清漆的粗糙度，0 - 1
              // noiseTexture:null,//随机分布纹理的随机值纹理的路径，支持url或者base64
              uvScale: [2, 2], //uv坐标缩放比例
              uvOffset: [0, 0], //uv偏移量，0表示不偏移，1表示刚好偏移一个纹理尺寸
              uvRotation: 25, //纹理旋转角度，单位度，0 - 360
              uvOffsetAnim: [0, 0], //uv方向上的偏移动画，不为1时开启动画，绝对值越大动画越快，负值时则反方向动画
              //materialShiness: 24,//材料光泽
            },
          },
        },
      ],
    };
    this.GeoJSONLayer = new GeoJSONVectorTileLayer("geojson1", {
      data: "data/json/data_GuGong.json",
      style,
    });

    this.groupLayer = new GroupGLLayer("group", [this.GeoJSONLayer], {
      sceneConfig: {
        environment: {
          enable: true,
          mode: 1,
          level: 0,
          brightness: 0,
        },
        postProcess: {
          enable: true,
          bloom: {
            enable: true,
            threshold: 0,
            factor: 0.6,
            radius: 1,
          },
        },
      },
    });
    this.groupLayer.addTo(this.map);
    this.GeoJSONLayer.on("dataload", (e) => {
      this.map.fitExtent(e.extent);
    });
  },

  methods: {
    initGui() {
      /**
       * GUI
       */
      this.gui = new dat.GUI();
      this.gui.domElement.style = "position:absolute;top:10px;left:10px";
      // const PolygonAllSymbol = this.gui.addFolder("面要素样式");
      // const PolygonGeoSymbol = PolygonAllSymbol.addFolder("图形样式");
      // const PolygonTextSymbol = PolygonAllSymbol.addFolder("标注样式");

      /**
       * 开启
       */
      // PolygonAllSymbol.open();
      // PolygonGeoSymbol.close();
      // PolygonTextSymbol.close();
    },
  },
};
</script>
<style>
.control {
  position: absolute;
  z-index: 999;
  left: 10px;
  top: 10px;
}
</style>
