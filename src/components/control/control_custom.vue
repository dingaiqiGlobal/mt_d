<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
    <div id="json"></div>
    <div class="locationSearch">
      <div class="inputBox">
        <a-input placeholder="请输入地点名称" :value="inputValue" />
        <span
          style="width: 19px; height: 17px"
          class="eliminateinput"
          v-show="inputValue != ''"
          >X</span
        >
        <a-button class="searchBtn" type="primary">
          <img src="images/icon/fdj.png" style="width: 20px; height: 20px" />
        </a-button>
      </div>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import { Map, TileLayer, Marker, control } from "maptalks";
import { GroupGLLayer, PointLayer } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      //搜索
      inputValue: "",
    };
  },

  computed: {},

  mounted() {
    //Control如果是定义在map的options里是可以toJSON存储的，但如果是自己创建的是不行
    this.map = new Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new TileLayer("基础底图1", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", //dark_all
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
      attribution: true,
      zoomControl: {
        position: { bottom: "230", right: "10" },
        slider: true,
        zoomLevel: false,
      }, // add zoom control
      //scaleControl: true, // add scale control
      //overviewControl: true, // add overview control
    });

    /**
     * 可以这么存储样式信息
     */
    // let options2 = {
    //   panel: {
    //     position: { bottom: "230", right: "10" },
    //     draggable: true, //拖拽
    //     custom: false, //定制
    //     closeButton: true,
    //   },
    // };
    // this.map.setOptions(options2);
    /**
     * 图层控制
     */
    // let layerSwitcher = new control.LayerSwitcher({
    //   position: "top-right",
    //   baseTitle: "底图图层集合",
    //   overlayTitle: "其他图层集合",
    //   excludeLayers: [], //排除图层
    //   containerClass: "maptalks-layer-switcher", //css样式
    // });
    // this.map.addControl(layerSwitcher);

    /**
     * 添加图层
     */
    this.groupLayer = new GroupGLLayer("GL组", [], {
      sceneConfig: {
        environment: {
          enable: true,
          mode: 1,
          level: 0,
          brightness: 0,
        },
      },
    }).addTo(this.map);
    this.add_GroupGL_PointLayer();

    /**
     * 动态添加组件
     */
    this.add_Scale();

    /**
     * toJSON
     */
    setTimeout(() => {
      this.toJson();
    }, 3000);
  },

  methods: {
    add_GroupGL_PointLayer() {
      const pointLayer = new PointLayer("点");
      const marker = new Marker([116.39225, 39.90605], {
        cursor: "pointer",
        symbol: {
          markerFile: "images/icon/icon_Red.png",
          markerOpacity: 1,
          markerWidth: 28,
          markerHeight: 40,
          textName: "GroupGL矢量点",
        },
      }).addTo(pointLayer);
      this.groupLayer.addLayer(pointLayer);
    },
    toJson() {
      const mapJSON = this.map.toJSON();
      document.getElementById("json").innerHTML = JSON.stringify(mapJSON);
    },

    //添加比例尺控件
    add_Scale() {
      let scale = new control.Scale({
        position: "top-right",
        containerClass: "scaleCss",
      });
      this.map.addControl(scale);
    },

    //搜索控件
    add_Search() {},
    //图例控件
    add_legend() {},
  },
};
</script>
<style>
.locationSearch {
  position: absolute;
  top: 90px;
  right: 20px;
  z-index: 9;
  display: flex;
  .inputBox {
    width: 316px;
    height: 40px;
    display: flex;
    background: rgba(9, 28, 55, 0.7);
    box-shadow: inset 0px 1px 12px 0px #4389ff;
    border-radius: 4px;
    input {
      width: 269px;
      height: 40px;
      border: none;
    }
    .ant-input {
      background-color: transparent;
      color: #ffffff;
    }
    .eliminateinput {
      position: absolute;
      top: 10px;
      right: 40px;
      cursor: pointer;
      color: #ffffff;
    }
    .searchBtn {
      height: 40px;
      width: 40px;
      position: absolute;
      right: 0;
      padding: 0;
      border-radius: 0 4px 4px 0;
      background-color: transparent;
    }
  }
  .conbox {
    width: 316px;
    max-height: 374px;
    background: rgba(9, 28, 55, 0.7);
    box-shadow: inset 0px 1px 12px 0px #4389ff;
    position: absolute;
    right: 0;
    top: 40px;
    overflow-y: auto;
    .zwsj {
      margin-top: 50px;
      text-align: center;
      padding-bottom: 50px;
      span {
        display: block;
        margin-top: 15px;
        color: #ffffff;
      }
    }
    ul {
      padding-left: 0px;
      li {
        display: flex;
        padding: 5px 10px;
        cursor: pointer;
        p {
          font-size: 14px;
          font-weight: 400;
          color: #ffffff;
          width: 210px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        span {
          margin-left: 10px;
          font-size: 12px;
          font-weight: 400;
          color: #ffffff;
          text-align: left;
        }
      }
    }
  }
  .conbox::-webkit-scrollbar {
    /*滚动条整体样式*/
    width: 4px; /*高宽分别对应横竖滚动条的尺寸*/
    height: 4px;
    border-radius: 6px;
  }
  .conbox::-webkit-scrollbar-thumb {
    /*滚动条里面小方块*/
    border-radius: 4px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: rgba(23, 133, 255, 1);
  }
  .conbox::-webkit-scrollbar-track {
    /*滚动条里面轨道*/
    height: 90%;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    background: rgba(235, 235, 235, 1);
  }
}
.scaleCss {
  border: 2px solid #000000;
  border-top: none;
  line-height: 1.1;
  padding: 0px;
  color: #000000;
  font-size: 11px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
  background-image: url("../../../public/images/icon/icon_Red.png"); /* 设置图片路径 */
  background-size: cover; /* 背景图片覆盖整个元素 */
  background-repeat: no-repeat; /* 背景图片不重复 */
  background-position: center; /* 背景图片居中 */
}
.control {
  position: absolute;
  z-index: 999;
  left: 10px;
  top: 10px;
}
#json {
  position: fixed;
  background-color: rgba(13, 13, 13, 0.5);
  padding: 10px 10px 10px 10px;
  font: 13px bold sans-serif;
  color: #fff;
  left: 0px;
  top: 0px;
  width: 900px;
  height: 185px;
  overflow: auto;
}
</style>
