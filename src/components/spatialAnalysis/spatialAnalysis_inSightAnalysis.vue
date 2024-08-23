<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <el-button type="primary" plain @click="startDraw">绘制通视线</el-button>
      <el-button type="primary" plain @click="clear">清除全部</el-button>
    </div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import {
  GroupGLLayer,
  GeoJSONVectorTileLayer,
  InSightAnalysis,
} from "@maptalks/gl-layers";
export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      GeoJSONLayer: null,
      drawTool: null,
      insightAnalysis: null, //通视分析
      eyePos: [116.39088, 39.91127, 20], //眼睛位置
      lookPoint: [116.39049, 39.922, 30], //目标点
      coordinates: [],
      first: true, //是否是第一个绘制点
    };
  },

  computed: {},

  mounted() {
    /**
     * 通视分析-重要方法，更新
     * this.insightAnalysis.update("lines", [
          {
            from: this.eyePos,
            to: this.lookPoint,
          },
        ]);
        也可更新眼睛位置和目标点的位置
        Change(function (value) {
            lookPoint[2] = value;//更新目标点高度
            insightAnalysis.update("lines", [
            {
                from: eyePos,
                to: lookPoint
            }
            ]);
        ]);
     * 
     */
    this.map = new maptalks.Map("map", {
      center: [116.39109, 39.9164],
      zoom: 16,
      pitch: 90,
      bearing: -25,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      }),
      layers: [],
    });

    const style = {
      style: [
        {
          name: "id_3d-extrusion",
          renderPlugin: {
            type: "lit",
            dataConfig: {
              type: "3d-extrusion",
              altitudeProperty: "height",
              altitudeScale: 2,
              defaultAltitude: 10,
            },
            sceneConfig: {},
          },
          filter: true,
          symbol: {
            visible: true,
            polygonFill: "rgba(0, 88, 216, 1)",
            polygonOpacity: 0.8,
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
        postProcess: {
          enable: true, //重要
        },
      },
    });
    this.groupLayer.addTo(this.map);
    this.GeoJSONLayer.on("dataload", (e) => {
      this.map.fitExtent(e.extent);
    });

    /**
     * 初始化通视分析
     * （必须开启后期处理）
     */
    this.insightAnalysis = new InSightAnalysis({
      lines: [
        //通视线数组
        {
          from: this.eyePos,
          to: this.lookPoint,
        },
      ],
      visibleColor: [0, 1, 0, 1], //可视部分的颜色
      invisibleColor: [1, 0, 0, 1], //不可视部分的颜色
    });
    this.insightAnalysis.addTo(this.groupLayer);

    this._addLabel();
    this.setDrawTool();
  },

  methods: {
    setDrawTool() {
      //添加绘图工具
      this.drawTool = new maptalks.DrawTool({
        mode: "LineString",
        enableAltitude: true,
        symbol: {
          lineColor: "#f00",
        },
      })
        .addTo(this.map)
        .disable();
      //绘制开始事件
      this.drawTool.on("drawstart", (e) => {
        const coordinate = this._getPickedCoordinate(e.coordinate);
        if (!coordinate) return;
        this.eyePos = [...coordinate]; //眼睛位置
        this._updateLabel();
        this.first = true;
      });

      //绘制鼠标移动事件---这个事件===实施更新
      this.drawTool.on("mousemove", (e) => {
        const coordinate = this._getPickedCoordinate(e.coordinate);
        if (!coordinate) return;
        if (this.first) {
          this.coordinates.push(coordinate);
        } else {
          this.coordinates[this.coordinates.length - 1] = coordinate;
        }
        e.geometry.setCoordinates(this.coordinates);
        this.lookPoint = [...coordinate]; //目标点
        //更新通视分析
        this.insightAnalysis.update("lines", [
          {
            from: this.eyePos,
            to: this.lookPoint,
          },
        ]);
        this._updateLabel();
        this.first = false;
      });
      //顶点事件
      this.drawTool.on("drawvertex", (e) => {
        const coordinate = this._getPickedCoordinate(e.coordinate);
        if (!coordinate) return;
        if (this.first) {
          this.coordinates.push(coordinate);
          this.first = false;
        } else {
          this.coordinates[this.coordinates.length - 1] = coordinate;
          this.first = true;
        }
        e.geometry.setCoordinates(this.coordinates);
        this.insightAnalysis.enable(); //结束
        this.lookPoint = [...coordinate];
        this._updateLabel();
        //更新通视分析
        this.insightAnalysis.update("lines", [
          {
            from: this.eyePos,
            to: this.lookPoint,
          },
        ]);
        //清空
        this.drawTool.disable();
        this.coordinates = [];
      });
    },

    _getPickedCoordinate(coordinate) {
      const identifyData = this.groupLayer.identify(coordinate)[0];
      if (identifyData && identifyData.coordinate) {
        return identifyData.coordinate;
      } else {
        return [coordinate.x, coordinate.y];
      }
    },

    _addLabel() {
      let vLayer = this.map.getLayer("vLayer");
      if (!vLayer) {
        vLayer = new maptalks.VectorLayer("vLayer", {
          enableAltitude: true,
        }).addTo(this.map);
      }
      //圆样式
      const circleSymbol = {
        markerFile: require("@/assets/effect/ring.png"),
        markerOpacity: 1,
        markerWidth: 30,
        markerHeight: 42,
      };
      //TextBox样式（标注）
      //new TextBox(content, coordinates, width, height, optionsopt)
      //观察点、目标点2个一起加
      //this.eyePos[2]高度
      //this.lookPoint[2]高度
      const labelSymbol1 = this._getLabelSymbol(60, this.eyePos[2]);
      new maptalks.Marker(this.eyePos, {
        symbol: circleSymbol,
        properties: {
          altitude: this.eyePos[2],
        },
      }).addTo(vLayer);
      new maptalks.TextBox("观察点", this.eyePos, 80, 35, labelSymbol1).addTo(vLayer);

      const labelSymbol2 = this._getLabelSymbol(-60, this.lookPoint[2]);
      new maptalks.Marker(this.lookPoint, {
        symbol: circleSymbol,
        properties: {
          altitude: this.lookPoint[2],
        },
      }).addTo(vLayer);
      new maptalks.TextBox("目标点", this.lookPoint, 80, 35, labelSymbol2).addTo(vLayer);
    },

    _getLabelSymbol(Dx, height) {
      //Dx-x轴上偏移
      const labelSymbol = {
        draggable: false,
        textStyle: {
          wrap: true,
          padding: [12, 8],
          verticalAlignment: "center",
          horizontalAlignment: "center",
          symbol: {
            textFaceName: "monospace",
            textFill: "#fff",
            textSize: 14,
          },
        },
        boxSymbol: {
          markerType: "square",
          markerFill: "rgb(20, 20, 20)",
          markerFillOpacity: 0.7,
          markerLineWidth: 0,
          markerDy: -10,
          markerDx: Dx,
        },
        properties: {
          altitude: height,
        },
      };
      return labelSymbol;
    },

    _updateLabel() {
      //添加删除图层
      const vLayer = this.map.getLayer("vLayer");
      if (vLayer) {
        vLayer.clear();
      }
      this._addLabel();
    },
    /**
     * UI
     */
    startDraw() {
      this.drawTool.enable();
    },
    clear() {
      const vLayer = this.map.getLayer("vLayer");
      vLayer.clear();
      this.insightAnalysis.disable();
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
