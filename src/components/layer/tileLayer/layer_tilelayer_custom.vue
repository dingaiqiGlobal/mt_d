<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button @click="addArcgisOnlineLayer">全局切图</button>
      <button @click="addSuZhouLayer">局部切图-不推荐</button>
      <button @click="addSuZhouLayerBuWei">补位法-推荐</button>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
    };
  },

  computed: {},

  mounted() {
    /**
     * 加载自定义切图参数的瓦片
     * 当自己发布切片服务时要尽可能的使用常用的全球切图参数，不要随便的去自定义切图参数，
     * 因为使用常见的全球切图参数是我们使用地图最佳的方式，方便和矢量切片，3dtile等图层结合
     *
     * 图层应该尽可能的想地图的切图参数靠拢,而不是地图随着图层走
     */
  },

  methods: {
    /**
     * 切图的第一个层级和全球的切图参数接近---也就是说切图方案安着标准的切图方案进行的
     * 只需要自定义TileLayer的 spatialReference参数
     * 瓦片和地图都有自己的 spatialReference参数，只需要按照瓦片的切图参数来构造 TileLayer的 spatialReference即可
     * 结论：完全可以省略不加空间参考
     */
    addArcgisOnlineLayer() {
      const RES = 156543.03392800014; //切图第一个参数分辨率
      //const ORIGIN = [-2.0037508342787, 2.0037508342787]; //原点
      const resolutions = []; //切图的分辨率集合
      let i = 0;
      while (i <= 14) {
        resolutions.push(RES / Math.pow(2, i));
        i++;
      }
      const spatialReference = {
        projection: "EPSG:3857",
        resolutions: resolutions,
      };

      var map = new maptalks.Map("map", {
        center: [120.84600742, 31.14241977],
        zoom: 3,
        spatialReference: {
          projection: "EPSG:3857", //or 4326
        },
      });

      const tileLayer = new maptalks.TileLayer("tilelayer,", {
        urlTemplate:
          "https://server.arcgisonline.com/arcgis/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
        //tileSystem: [1, -1].concat(ORIGIN),
        spatialReference,
      });
      map.setBaseLayer(tileLayer);
    },

    /**
     * 切图的第一个层级和全球的切图参数差距比较大---也就是说按图层范围切图
     * 比如服务是一个县市这种,服务的第一个切图参数和标准的全球切图层数差的不是一点半点
     *
     * 总结：这里我们使地图的spatialReference和TileLayer的spatialReference相等了 (setSpatialReference方法设置了,明显违背了上边说的宗旨),
     * 这样会有一些问题,比如在地图添加矢量切片图层等
     * 这些图层将不能被正常加载,因为像矢量切片图层他们的切图参数是固定的,
     * 但是我们改变了地图的spatialReference从而导致矢量切片 等图层不能被正常加载
     *
     */
    addSuZhouLayer() {
      const RES = 0.002749664687500373; //切图第一个参数分辨率
      const ORIGIN = [-400, 400]; //原点
      const resolutions = []; //切图的分辨率集合
      //一共10个层级
      let i = 0;
      while (i <= 9) {
        resolutions.push(RES / Math.pow(2, i));
        i++;
      }
      const spatialReference = {
        projection: "EPSG:4326",
        resolutions: resolutions,
      };

      var map = new maptalks.Map("map", {
        center: [120.84600742, 31.14241977],
        zoom: 0,
        zoomControl: true,
      });

      function switchSp() {
        //设置地图的投影为自定义的
        map.setSpatialReference(spatialReference);
        const tileLayer = new maptalks.TileLayer("tilelayer,", {
          urlTemplate:
            "http://180.108.205.111:6080/arcgis/rest/services/CYLMap_PCZH/MapServer/tile/{z}/{y}/{x}",
          tileSystem: [1, -1].concat(ORIGIN),
          spatialReference,
        });
        map.setBaseLayer(tileLayer);
      }
      switchSp();
    },

    /**
     * 切图补位法---这样就可以加矢量切片了
     * 
     * 瓦片的请求函数需要重写，因为构造了补位，
     * 导致瓦片的请求层级需要减去补位的层级数，
     * 上面的例子是补位了9个层级，那么就减去9,其他情况以此类推
     */
    addSuZhouLayerBuWei() {
      const RES = 0.002749664687500373; //切图参数
      const ORIGIN = [-400, 400]; //原点
      let resolutions = [];
      let i = 0;
      //一共10个层级
      while (i <= 9) {
        resolutions.push(RES / Math.pow(2, i));
        i++;
      }
      const offsetRes = [];
      //前面缺失的层级,一共有9级,补起来,让其切图参数尽可能的和地图一样
      const zoomOffset = 10;
      i = 1;
      while (i < zoomOffset) {
        const res = RES * Math.pow(2, zoomOffset - i);
        offsetRes.push(res);
        i++;
      }
      resolutions = offsetRes.concat(resolutions);
      console.log(resolutions);
      //构造的spatialReference,使其尽可能的和全球的切图参数一样的
      const spatialReference = {
        projection: "EPSG:4326",
        resolutions: resolutions,
      };

      var map = new maptalks.Map("map", {
        center: [120.84600742, 31.14241977],
        zoom: 10,
        zoomControl: true,
        //地图还是用标准的切图参数
        spatialReference: {
          projection: "EPSG:4326",
        },
      });

      function switchSp() {
        console.log(map.getSpatialReference()._resolutions);
        const tileLayer = new maptalks.TileLayer("tilelayer,", {
          urlTemplate:
            "http://180.108.205.111:6080/arcgis/rest/services/CYLMap_PCZH/MapServer/tile/{z}/{y}/{x}",
          tileSystem: [1, -1].concat(ORIGIN),
          spatialReference,
          //debug: true,
        });
        //重写瓦片的请求函数
        tileLayer.getTileUrl = function (x, y, z) {
          z -= 9;
          if (z < 0) {
            //z<0时返回自定义的图片
            return "images/icon/default-image1.png";
          }
          return maptalks.TileLayer.prototype.getTileUrl.call(this, x, y, z);
        };
        map.setBaseLayer(tileLayer);
      }
      switchSp();
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
