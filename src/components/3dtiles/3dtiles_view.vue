<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-checkbox v-model="isShow" @change="changeShow(isShow)">显示标注</el-checkbox>
      <br />
      <el-checkbox v-model="isPlay" @change="autoPlay(isPlay)">自动播放</el-checkbox>
      <br />
      <el-checkbox v-model="isRotate" @change="changeRotate(isRotate)">旋转</el-checkbox>
      <br />
      <el-select v-model="selectedValue" @change="changeView">
        <el-option v-for="item in viewPoints" :value="item.name" :key="item.name">
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script>
import { Map, TileLayer, Marker } from "maptalks";
import { GroupGLLayer, Geo3DTilesLayer, PointLayer } from "@maptalks/gl-layers";
import "@maptalks/transcoders.draco";
// import "@maptalks/transcoders.crn";
// import "@maptalks/transcoders.ktx2";
export default {
  components: {},

  data() {
    return {
      //ui
      isShow: true,
      isPlay: false,
      isRotate: false,
      selectedValue: 0,
      //map
      map: null,
      point: null,
      viewPoints: [
        { name: 0, coordinate: [116.4011, 39.89888, 50] },
        { name: 1, coordinate: [116.40257, 39.89879, 36.82354] },
        { name: 2, coordinate: [116.40106, 39.89864, 27.62234] },
        { name: 3, coordinate: [116.40145, 39.89864, 40.97386] },
      ],
      viewMap: [
        {
          center: [116.4011, 39.89888],
          zoom: 18.4446,
          pitch: 74.2,
          bearing: 39.6,
        },
        {
          center: [116.40257, 39.89879],
          zoom: 19.6565,
          pitch: 63.4,
          bearing: 39.978,
        },
        {
          center: [116.40106, 39.89864],
          zoom: 19.6565,
          pitch: 37.4,
          bearing: 121.578,
        },
        {
          center: [116.40145, 39.89864],
          zoom: 18.7391,
          pitch: 62.6,
          bearing: -138.222,
        },
      ],
      //interval
      viewIndex: 0,
      interval: null,

      //animation
      animationRotate: null,
    };
  },

  computed: {},

  mounted() {
    this.map = new Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      layers: [],
      lights: {
        directional: {
          direction: [1, 0, -1],
          color: [1, 1, 1],
        },
        ambient: {
          resource: {
            url: {
              front: "images/skybox/gradient/front.png",
              back: "images/skybox/gradient/back.png",
              left: "images/skybox/gradient/left.png",
              right: "images/skybox/gradient/right.png",
              top: "images/skybox/gradient/top.png",
              bottom: "images/skybox/gradient/bottom.png",
            },
            prefilterCubeSize: 256,
          },
          exposure: 0.8,
          hsv: [0, 0.34, 0],
          orientation: 1,
        },
      },
    });
    //底图
    const baseLayer = new TileLayer("base", {
      urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      subdomains: ["a", "b", "c", "d"],
      attribution:
        '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      spatialReference: {
        projection: "EPSG:3857",
      },
    });
    const geo3DTilesLayer = new Geo3DTilesLayer("Geo3DTilesLayer", {
      services: [
        {
          url: "data/3dtiles/bim/tileset.json",
          maximumScreenSpaceError: 16, //该值越小，渲染精度越高，项目允许的情况下，该值越大性能越好
          ambientLight: [0.2, 0.2, 0.2],
          heightOffset: 8,
          scale: [1, 1, 1], //3dtile整体的缩放参数
          rotation: [0, 0, 0], //3dtile整体的旋转参数
          coordOffset: [0, 0], //3dtile整体偏移量参数
        },
      ],
    });

    geo3DTilesLayer.once("loadtileset", (e) => {
      const extent = geo3DTilesLayer.getExtent(e.index);
      this.map.fitExtent(extent, 0, {
        animation: false,
      });
      //加载图标
      this.addMarkers();
    });
    //groupLayer
    const groupLayer = new GroupGLLayer("group", [baseLayer, geo3DTilesLayer], {
      sceneConfig: {
        environment: {
          enable: true,
          mode: 1,
          level: 0,
          brightness: 0,
        },
        postProcess: {
          enable: true, // 是否开启后处理
          antialias: {
            //开启抗锯齿后处理
            enable: true,
          },
        },
      },
    });
    groupLayer.addTo(this.map);
    //初始化点图层
    this.point = new PointLayer("point").addTo(groupLayer);

    /**
     * 旋转地图
     * map.animateTo返回的是一个animation，可以使用其方法
     */
    const duration = 20000; //持续时间（相当于速度）
    this.animationRotate = this.map
      .animateTo(
        {
          bearing: this.map.getBearing() + 360,
        },
        {
          easing: "linear",
          duration,
          repeat: true,
        }
      )
      .pause();
  },

  methods: {
    addMarkers() {
      for (let i = 0; i < this.viewPoints.length; i++) {
        const marker = new Marker(this.viewPoints[i].coordinate, {
          properties: { name: this.viewPoints[i].name, index: i },
          symbol: [
            {
              textName: `${i + 1}`,
              textSize: 16,
              textFill: "#ddd",
              textDy: -11,
              textDx: 1,
              textFaceName: '"microsoft yahei"',
            },
            {
              markerPerspectiveRatio: 0,
              markerType: "ellipse",
              markerFill: "#000",
              markerFillOpacity: 0.6,
              markerLineColor: "#ddd",
              markerLineWidth: 2,
              markerWidth: 25,
              markerHeight: 25,
            },
          ],
        }).addTo(this.point);
        //鼠标移入移除事件
        marker.on("mouseenter mouseout", (e) => {
          const lineColor = e.type === "mouseenter" ? "#80caff" : "#ddd";
          e.target.updateSymbol([
            {
              textFill: lineColor,
            },
            {
              markerLineColor: lineColor,
            },
          ]);
        });
        //鼠标点击事件
        marker.on("click", (e) => {
          const index = e.target.getProperties().index;
          this.map.flyTo(this.viewMap[index], {
            duration: 1000,
            easing: "out",
          });
        });
      }
    },
    changeShow(isShow) {
      if (isShow) {
        this.point.show();
      } else {
        this.point.hide();
      }
    },
    changeView(value) {
      const view = this.viewMap[value];
      if (view) {
        this.map.flyTo(view, { duration: 1000 });
      }
    },
    autoPlay(isPlay) {
      if (isPlay) {
        this.map.flyTo(this.viewMap[this.viewIndex], { duration: 1000 });
        this.interval = setInterval(() => {
          if (this.viewIndex >= this.viewMap.length) {
            this.viewIndex = 0;
          }
          this.map.flyTo(this.viewMap[this.viewIndex], { duration: 1000 });
          this.viewIndex += 1;
        }, 1000);
      } else {
        clearInterval(this.interval);
      }
    },
    changeRotate(isRotate) {
      if (isRotate) {
        this.animationRotate.play();
      } else {
        this.animationRotate.pause();
      }
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
  background-color: white;
  text-align: left;
}
</style>
