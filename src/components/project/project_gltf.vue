<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <img
        class="dragimage"
        src="images/icon/star.png"
        draggable="true"
        data-url="images/icon/star.png"
      />
      <img
        class="dragimage"
        src="images/icon/alien.png"
        draggable="true"
        data-url="data/model/alien.gltf"
      />
    </div>
  </div>
</template>

<script>
import * as maptalks from "maptalks";
import {
  GroupGLLayer,
  GLTFLayer,
  GLTFMarker,
  PointLayer,
  TransformControl,
} from "@maptalks/gl-layers";
export default {
  components: {},

  data() {
    return {
      map: null,
      pointLayer: null,
      gltfLayer: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 15,
      pitch: 60,
      centerCross: false,
      doubleClickZoom: false,
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
    });
    this.pointLayer = new PointLayer("point", {});
    this.gltfLayer = new GLTFLayer("gltf", {});
    const groupLayer = new GroupGLLayer("group", [this.pointLayer, this.gltfLayer], {});
    groupLayer.addTo(this.map);

    /**
     * 模型手动调整
     */

    /**
     * identify(coordinates, options)
     * 在所有子图层上查询给定坐标处的数据。 需要注意的是，只有绘制出来的数据才能被查询到。
     * 属性名        | 类型       | 描述                              | 默认值
     * tolerance      Number       查询时的像素冗余值                   3
     * count          Number       返回的数据条数                       1
     * filter         Function     结果过滤函数                         null
     * orderByCamera  Boolean      是否按照相机距离排序，更近的在前面    false
     * childLayers    Layer[]     指定的子图层                          []
     */

    /**
     * identifyAtPoint(containerPoint, options)
     * 在所有子图层上查询给定屏幕坐标处的数据
     * 属性名        | 类型       | 描述                              | 默认值
     * tolerance      Number       查询时的像素冗余值                   3
     * count          Number       返回的数据条数                       1
     * filter         Function     结果过滤函数                         null
     * orderByCamera  Boolean      是否按照相机距离排序，更近的在前面    false
     * childLayers    Layer[]     指定的子图层                          []
     */
    
     /**
      * 拖动map上模型
      * 方式1：可以使用@maptalks/gl-layers里自带的TransformControl控件
      * 方式2：使用第三方的模型控制插件 maptalks.modelcontrol
      * ①支持GLTFMarker
      * ②支持ThreeLayer的toModel()
      * ③支持Geometry Marker
      */
    const transformControl = new TransformControl();
    transformControl.addTo(this.map);

    this.map.on("click", (e) => {
      const identifyData = e.coordinate
        ? groupLayer.identify(e.coordinate, {
            layers: [this.gltfLayer],
            orderByCamera: true,
          })[0]
        : groupLayer.identifyAtPoint(e.containerPoint, {
            layers: [this.gltfLayer],
            orderByCamera: true,
          })[0];
      const target = identifyData && identifyData.data;
      if (target) {
        transformControl.enable();
        transformControl.transform(target);
      } else {
        transformControl.disable();
      }
    });

    /**
     * ui拖拽事件
     */
    this.map.on("drop", (e) => {
      const { coordinate, dataTransfer } = e;
      const url = dataTransfer.getData("data");
      if (!url) {
        return;
      }
      const isModel = url.includes(".gltf") || url.includes(".glb");
      if (isModel) {
        const model = new GLTFMarker(coordinate, {
          symbol: {
            url,
            modelHeight: 34,
            rotationZ: 180,
          },
        });
        model.addTo(this.gltfLayer);
      } else {
        const marker = new maptalks.Marker(coordinate, {
          cursor: "pointer",
          draggable: true, //是否拖动几何体
          symbol: {
            markerFile: url,
            markerVerticalAlignment: "middle",
          },
        }).addTo(this.pointLayer);
      }
    });
    const imgs = document.querySelectorAll(".dragimage");
    imgs.forEach((img) => {
      img.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("data", e.target.dataset.url);
      });
    });
  },

  methods: {},
};
</script>
<style>
.control {
  position: absolute;
  z-index: 999;
  left: 10px;
  top: 10px;
}
.dragimage {
  width: 40px;
  height: 40px;
  cursor: grab;
  border: 1px solid gray;
}
</style>
