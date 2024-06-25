<template>
  <div>
    <div id="map" class="container"></div>
    <div id="scale" class="scale"></div>
    <div class="legend">图例</div>
    <div class="locationSearch">
      <div class="inputBox">
        <a-input
          placeholder="请输入地点名称"
          :value="inputValue"
          @change="handlechangeInputvalue"
        />
        <span
          style="width: 19px; height: 17px"
          class="eliminateinput"
          v-show="inputValue != ''"
          @click="handleClearinput"
          >X</span
        >
        <a-button class="searchBtn" type="primary" @click="handleSeach"
          ><img src="images/icon/fdj.png" style="width: 20px; height: 20px"
        /></a-button>
      </div>
      <div class="conbox" v-show="contentshow">
        <ul>
          <li v-for="item in contentList" :key="item.id" @click="handleloadDetail(item)">
            <a-tooltip
              style="
                width: 150px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              <template slot="title">
                <p>{{ item.name }}</p>
              </template>
              {{ item.name }}
            </a-tooltip>
            <a-tooltip
              style="
                width: 150px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            >
              <template slot="title">
                <p>{{ item.address }}</p>
              </template>
              {{ item.address }}
            </a-tooltip>
          </li>
        </ul>
        <div class="zwsj" v-show="contentList.length == 0">
          <p><img src="images/icon/zwsj.png" /></p>
          <span>暂无数据</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, PointLayer } from "@maptalks/gl-layers";
import axios from "axios";

import ControlCustomScale from "./js/ControlCustomScale";
export default {
  components: {},

  data() {
    return {
      map: null,
      //搜索
      inputValue: "",
      contentshow: false,
      contentList: [],
    };
  },

  computed: {},

  mounted() {
    //Control如果是定义在map的options里是可以toJSON存储的，但如果是自己创建的是不行
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 12,
      pitch: 60,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("基础底图1", {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", //dark_all
        subdomains: ["a", "b", "c", "d"],
        attribution:
          '&copy; <a href="http://osm.org">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/">CARTO</a>',
      }),
      layers: [],
      attribution: true,
    });

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

    const pointLayer = new PointLayer("点");
    const marker = new maptalks.Marker([116.39225, 39.90605], {
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
    this.add_Scale();
  },

  methods: {
    /**
     * 比例尺控件
     */
    add_Scale() {
      const scaleControl = new ControlCustomScale({},"scale");
      this.map.addControl(scaleControl)
    },

    /**
     * 图例控件
     */
    add_legend(){

    },
    /**
     * 搜索控件
     */
    //平台版本
    // async handleSeach() {
    //   this.contentList = [];
    //   if (this.inputValue === "") {
    //     this.$message.error("请输入关键字！");
    //     return;
    //   }
    //   //使用后台配置天地图服务接口查询poi
    //   var response = await searchUrlList();
    //   if (response.success) {
    //     if (response.result) {
    //       var poiUrl = response.result.poiUrl;
    //       var supplier = poiUrl.supplier;
    //       var url = poiUrl.url;

    //       if (supplier === "tdt") {
    //         try {
    //           url = url.replace("keyValue", this.inputValue);
    //           const response = await fetch(url);
    //           const result = await response.json();
    //           if (
    //             result.status &&
    //             result.status.infocode &&
    //             result.status.infocode == 1000
    //           ) {
    //             for (var i = 0; i < result.pois.length; i++) {
    //               var poi = result.pois[i];
    //               var lonlat = poi.lonlat;
    //               var lon = parseFloat(lonlat.split(",")[0]);
    //               var lat = parseFloat(lonlat.split(",")[1]);
    //               var geometry = { type: "Point", coordinates: [lon, lat] };
    //               var position = {
    //                 name: poi.name,
    //                 address: poi.address,
    //                 geometry: geometry,
    //               };
    //               this.contentList.push(position);
    //             }
    //           } else {
    //             // this.$message.error("天地图在线查询失败！");
    //           }
    //         } catch (e) {
    //           console.log(e);
    //           this.$message.error("天地图在线查询失败！");
    //         }
    //       }
    //     }
    //   } else {
    //     this.$message.error("获取服务地址失败！");
    //     return;
    //   }
    //   this.contentshow = true;
    // },

    //天地图版本
    handleSeach() {
      this.contentList = [];
      if (this.inputValue === "") {
        this.$message.error("请输入关键字！");
        return;
      }
      //天地图视野内搜索服务
      const url = "http://api.tianditu.gov.cn/v2/search";
      const extent = this.map.getExtent();
      const mapBound = `${extent.xmin},${extent.ymin},${extent.xmax},${extent.ymax}`;
      const params = {
        postStr: JSON.stringify({
          keyWord: this.inputValue,
          level: parseInt(this.map.getZoom()),
          mapBound: mapBound,
          queryType: 2,
          start: 0,
          count: 10,
        }),
        type: "query",
        tk: "21c1e34286caecc25fd94be94bfbe119",
      };
      axios({
        method: "GET",
        url: url,
        params: params,
      })
        .then((res) => {
          if (res?.status == 200) {
            for (var i = 0; i < res.data.pois.length; i++) {
              var poi = res.data.pois[i];
              var lonlat = poi.lonlat;
              var lon = parseFloat(lonlat.split(",")[0]);
              var lat = parseFloat(lonlat.split(",")[1]);
              var geometry = { type: "Point", coordinates: [lon, lat] };
              var position = {
                name: poi.name,
                address: poi.address,
                geometry: geometry,
              };
              this.contentList.push(position);
            }
          }
        })
        .catch((error) => {
          this.$message.error("天地图在线查询失败！");
        });
      this.contentshow = true;
    },
    handlechangeInputvalue(e) {
      this.inputValue = e.target.value;
    },
    handleClearinput() {
      this.inputValue = "";
      this.contentshow = false;
      this.map.removeLayer("seachPoint");
    },
    handleloadDetail(item) {
      if (!item.geometry.coordinates) return;
      let seachPointLayer = this.map.getLayer("seachPoint");
      if (seachPointLayer) {
        this.map.removeLayer(seachPointLayer);
      }
      const pointLayer = new PointLayer("seachPoint");
      const marker = new maptalks.Marker(item.geometry.coordinates, {
        cursor: "pointer",
        symbol: {
          markerFile: "images/icon/icon_Red.png",
          markerOpacity: 1,
          markerWidth: 28,
          markerHeight: 40,
        },
      }).addTo(pointLayer);
      this.map.addLayer(pointLayer);
      this.map.flyTo(
        {
          zoom: 18,
          center: item.geometry.coordinates,
          pitch: this.map.getPitch(),
          bearing: this.map.getBearing(),
        },
        {
          duration: 3000,
          easing: "out",
        }
      );
    },
  },
};
</script>
<style lang="less" scope>
.scale {
  position: absolute;
  top: 80px;
  right: 20px;
  z-index: 9;
  width: 120px;
  height: 50px;
  display: flex;
  background: rgba(9, 28, 55, 0.7);
  box-shadow: inset 0px 1px 12px 0px #4389ff;
  border-radius: 4px;
  .maptalks-control-scale {
    width: 100%;
    height: 100%;
  }
}
.legend {
  position: absolute;
  color: #ffffff;
  top: 140px;
  right: 20px;
  z-index: 9;
  width: 150px;
  height: 300px;
  display: flex;
  background: rgba(9, 28, 55, 0.7);
  box-shadow: inset 0px 1px 12px 0px #4389ff;
  border-radius: 4px;
}
.locationSearch {
  position: absolute;
  top: 20px;
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
</style>
