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
import { ModelControl } from "maptalks.modelcontrol";
export default {
  components: {},

  data() {
    return {
      map: null,
      pointLayer: null,
      gltfLayer: null,
      marker: null,
      currentSelect: null,
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
     * ③支持Geometry Marker---只支持移动***
     */
    //方式1
    // const transformControl = new TransformControl();
    // transformControl.addTo(this.map);

    // this.map.on("click", (e) => {
    //   const identifyData = e.coordinate
    //     ? groupLayer.identify(e.coordinate, {
    //         layers: [this.gltfLayer],
    //         orderByCamera: true,
    //       })[0]
    //     : groupLayer.identifyAtPoint(e.containerPoint, {
    //         layers: [this.gltfLayer],
    //         orderByCamera: true,
    //       })[0];
    //   const target = identifyData && identifyData.data;
    //   if (target) {
    //     transformControl.enable();
    //     transformControl.transform(target);
    //   } else {
    //     transformControl.disable();
    //   }
    // });

    //方式2
    /**
     * api
     * 1.methods
     * ①enable(coordinates)//如果要自定义模型的坐标点，否则默认情况下将使用模型的中心点
     * ②disable()
     * ③isEnabled()//Booler
     * ④setModel(model)//设置当前模型
     * ⑤setTarget(model)//设置当前模型，等效于setModel
     * ⑥setOriginalScale(scale)//设置原始比例
     * （
     * //for GLTFMarker
     * modelcontrol.setOriginalScale(gltfMarker.getScale()[0]);
     * //for maptalks.three
     * modelcontrol.setOriginalScale(baseObjectModel.getObject3d().scale.x);
     * ）
     *
     * 2.events
     * ①translate//模型转换时
     * ②translate_in//当鼠标进入转换dom组件时
     * ③translate_out//当鼠标离开转换dom组件时
     * ④scale//当模型缩放时
     * ⑤scale_in//当鼠标进入缩放dom组件时
     * ⑥scale_out//当鼠标离开缩放dom组件时
     * ⑦rotation//当模型旋转时
     * ⑧rotation_in//当鼠标进入旋转dom组件时
     * ⑨rotation_out//当鼠标离开旋转dom组件时
     * ⑩heihgt//当模型高度变化时
     * ①height_in//当鼠标进入高度dom组件时
     * ②height_out//当鼠标离开高度dom组件时
     */
    const modelcontrol = new ModelControl(this.map, {
      lineSymbol: {
        lineColor: "#fff",
      },
      scaleColor: "red",
      rotateColor: "blue",
      translateColor: "green",
      heightColor: "white",
      highLightColor: "yellow",
      opacity: 0.4,
      panelSize: 300,
      allowNegativeAltitude: true, //允许负高度值
      //scaleCursor:'url(images/icon/scale-cursor.svg) 13 13, auto',
      rotationCursor: "url(images/icon/rotation-cursor.svg) 13 13, auto",
      translateCursor: "url(images/icon/translate-cursor.svg) 13 13, auto",
      heightCursor: "url(images/icon/height-cursor.svg) 13 13, auto",
    });
    modelcontrol.on("translate_in scale_in rotation_in height_in", this.showTip);
    modelcontrol.on("translate_out scale_out rotation_out height_out", () => {
      this.marker.remove();
    });
    //监听事件
    modelcontrol.on("translate scale rotation height", (e) => {
      const { type } = e;
      this.marker.remove();
      let currentModel = modelcontrol.getModel(); //获取当前模型
      //   const modelType = modelcontrol.getModelType();
      if (type === "translate") {
        currentModel.setCoordinates(e.coordinate);
      }
      if (type === "scale") {
        const scale = e.scale;
        currentModel.setScale(scale, scale, scale);
      }
      if (type === "rotation") {
        const rotation = e.rotation;
        currentModel.setRotation(0, 0, rotation + 180);
      }
      if (type === "height") {
        const coordinate = currentModel.getCoordinates();
        coordinate.z = e.height;
        currentModel.setCoordinates(coordinate);
      }
    });

    this.map.on("click", (e) => {
      const identifyData = e.coordinate
        ? groupLayer.identify(e.coordinate, {
            orderByCamera: true,
          })[0]
        : groupLayer.identifyAtPoint(e.containerPoint, {
            orderByCamera: true,
          })[0];
      const target = identifyData?.data;
      //兼容point，但是没有旋转和缩放，会报错（point用symbol）
      //const target = identifyData?.data || identifyData?.geometry;
      if (target) {
        modelcontrol.setModel(target);
        modelcontrol.enable();
      } else {
        modelcontrol.disable();
      }
    });

    /**
     *选中指示
     */
    this.marker = new maptalks.ui.UIMarker([0, 0], {
      content: "开始",
      dy: -40,
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

  methods: {
    showTip(e) {
      const { coordinate, type } = e;
      if (!coordinate) {
        this.marker.remove();
        return;
      }
      let message = "";
      if (type === "translate_in") {
        message = "平移";
      } else if (type === "scale_in") {
        message = "缩放";
      } else if (type === "rotation_in") {
        message = "旋转";
      } else if (type === "height_in") {
        message = "调整高度";
      }
      const content = `可以对模型进行${message}`;
      this.marker.setContent(`<div class="control-message">${content}</div>`);
      if (!this.marker.getMap()) {
        this.marker.addTo(this.map);
      }
      this.marker.setCoordinates(coordinate);
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
.dragimage {
  width: 40px;
  height: 40px;
  cursor: grab;
  border: 1px solid gray;
}
.control-message {
  background-color: black;
  color: white;
  padding: 4px;
  display: block;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.5);
}
</style>
