<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <div class="settingPanel_StereoSetting">
        <div class="collapseBox">
          <a-collapse>
            <template #expandIcon="props">
              <a-icon type="caret-right" :rotate="props.isActive ? 90 : 0" />
            </template>
            <a-collapse-panel header="描边效果" key="2">
              <div class="parameter">
                <span>描边颜色</span>
                <span class="colorSpan" style="width: 179px; margin-right: 0">
                  <color-picker
                    v-model="lineColor"
                    @change="changeLineStyle"
                  ></color-picker>
                </span>
              </div>
              <div class="parameter">
                <span>描边粗细</span>
                <a-input-number
                  style="width: 179px"
                  v-model.number="lineWidth"
                  :min="0"
                  :precision="1"
                  @change="changeLineStyle"
                />
              </div>
              <div class="parameter">
                <span>是否泛光</span>
                <a-checkbox v-model="isBloom"></a-checkbox>
              </div>
            </a-collapse-panel>
            <a-collapse-panel header="填充效果" key="3">
              <div class="parameter">
                <span>渲染类型</span>
                <a-select
                  style="width: 179px"
                  dropdown-class-name="selectClass"
                  v-model="renderTypeCode"
                  @change="changeRenderType"
                >
                  <a-select-option value="0">单一渲染</a-select-option>
                  <a-select-option value="1">分色渲染</a-select-option>
                  <!-- <a-select-option value="3"> 背景颜色  </a-select-option> -->
                </a-select>
              </div>
              <div class="parameter" v-if="renderTypeCode == 0">
                <span style="margin-right: 29px">填充色</span>
                <span class="colorSpan" style="width: 179px; margin-right: 0">
                  <color-picker
                    v-model="fillColor"
                    @change="changeFillColor"
                  ></color-picker>
                </span>
              </div>
              <div class="parameter" v-if="renderTypeCode == 1">
                <span>分色字段</span>
                <a-select
                  style="width: 179px"
                  dropdown-class-name="selectClass"
                  v-model="selectedFiled"
                  @change="changeField"
                >
                  <a-select-option
                    v-for="(item, index) in fieldNames"
                    :value="item.name"
                    :key="index"
                    >{{ item.name }}</a-select-option
                  >
                </a-select>
              </div>
              <div class="parameter colorsParameter">
                <div class="colorsPanel" v-if="renderTypeCode == 1 && selectedFiled">
                  <div class="colorPanelHeader">
                    <p style="width: 30%">分色值</p>
                    <p style="width: 70%">填充色</p>
                  </div>
                  <div class="colorPanelContent">
                    <div
                      class="colorItem"
                      v-for="(item, index) in fieldValues"
                      :key="index"
                    >
                      <p>{{ item }}</p>
                      <span class="colorSpan" style="width: 135px; margin-left: 22px">
                        <color-picker
                          v-model="fillColors[index]"
                          @change="changeFillColors"
                        ></color-picker>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="parameter">
                <span style="margin-right: 30px">透明度</span>
                <div class="sliderBox">
                  <a-slider
                    v-model="opacity"
                    :min="0"
                    :max="1"
                    :step="0.1"
                    style="width: 108px; margin: 0px"
                    @afterChange="changeOpacity"
                  />
                </div>
                <a-input-number
                  v-model="opacity"
                  :min="0"
                  :max="1"
                  style="width: 50px; margin-left: 20px"
                  @change="changeOpacity"
                />
              </div>
              <div class="parameter">
                <span style="margin-right: 30px">高度</span>
                <div class="sliderBox">
                  <a-slider
                    v-model="height"
                    :min="0"
                    :max="8000"
                    :step="100"
                    style="width: 108px; margin: 0px"
                    @afterChange="changeHeight"
                  />
                </div>
                <a-input-number
                  v-model="height"
                  :min="0"
                  :max="8000"
                  style="width: 50px; margin-left: 20px"
                  @change="changeHeight"
                />
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 *ExtrudePolygonLayer的作用是用来管理图形，方便的图形的批量显示，隐藏，添加等操作，所以其具有的特性是：、
 *看不见摸不着
 *没有click等这些事件的*****所以只能做展示用，业务上不推荐
 *继承了OverlayLayer的图层他们的用法都是一样的，仅仅是不同的图层管理的数据类别不同和渲染的形态不同罢了
 */
import { VueColorpicker } from "vue-pop-colorpicker";
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer } from "@maptalks/gl-layers";

import Stops3D from "./thirdParty/Stops3D";

export default {
  components: {
    "color-picker": VueColorpicker,
  },

  data() {
    return {
      map: null,
      groupLayer: null,
      stops3D: null,

      //UI
      lineColor: "#7db500", //描边颜色
      lineWidth: 10, //描边粗细
      isBloom: false,
      renderTypeCode: "0", //渲染类型 0:单一渲染 1：分色渲染
      fields: [], //分色字段
      selectedFiled: null, //选中的分色字段
      fieldNames: [], //分色值
      fieldValues: [],
      fillColors: [], //填充颜色数组
      fillColor: "#7db500", //填充颜色
      opacity: 1.0, //透明度
      height: 4000, //高度
      //style
      styleOptions: {},
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.99066, 36.66511],
      zoom: 9.5,
      pitch: 70,
      bearing: 0,
      spatialReference: {
        projection: "EPSG:3857",
      },
      baseLayer: new maptalks.TileLayer("tile", {
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      }),
      layers: [],
    });
    /**
     * groupLayer
     */
    const sceneConfig = {
      postProcess: {
        enable: true,
        antialias: { enable: true },
        bloom: {
          enable: true,
          factor: 0.1,
          threshold: 0,
          radius: 1.5,
        },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [], { sceneConfig });
    this.groupLayer.addTo(this.map);

    this.stops3D = new Stops3D(this.map);
    this.stops3D.addLayer("data/json/jn/jnqx2.json");
  },

  methods: {
    changeLineStyle(value) {
      
    },
    changeRenderType(value) {
      //0单一渲染 1分色渲染
      if (value == 0) {
        //单一渲染
        this.selectedFiled = null;
        this.fieldNames = [];
        this.fieldValues = [];

        this.styleOptions = {
          defaultAltitude: 4000,
          polygonOpacity: this.opacity,
          polygonFill: "#ffffff",
        };
        this.stops3D.setStyle("test", this.styleOptions);
      } else if (value == 1) {
        //分色渲染
        this.fileds = this.stops3D.readField("data/json/jn/jnqx2.json"); //字段
        this.fileds.then((obj) => {
          this.fieldNames = Object.keys(obj).map((key) => ({ name: key }));
        });
      }
    },
    changeField(value) {
      this.selectedFiled = value;
      this.fileds.then((obj) => {
        //字段数组
        this.fieldValues = this.transformObj(obj, this.selectedFiled);
        //颜色数组
        const colors = [
          "#FF5733",
          "#33FF57",
          "#3357FF",
          "#F44336",
          "#2196F3",
          "#FFEB3B",
          "#4CAF50",
          "#FFC107",
          "#FF9800",
          "#8BC34A",
          "#03A9F4",
          "#E91E63",
          "#673AB7",
          "#9C27B0",
        ];
        this.fieldValues.forEach(() => {
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          this.fillColors.push(randomColor);
        });
        //stops
        const stops = this.fieldValues.map((item, index) => {
          return [item, this.fillColors[index]];
        });
        this.styleOptions = {
          polygonFill: {
            type: "categorical",
            property: `${value}`,
            stops,
          },
        };
        this.stops3D.setStyle("test", this.styleOptions);
      });
    },
    transformObj(obj, key) {
      const array = obj[key];
      const resultArray = array.map((item) => {
        const value = typeof item === "number" ? item.toString() : item;
        return value;
      });
      return resultArray;
    },
    changeOpacity(value) {
      //透明度
      this.opacity = value;
      this.stops3D.updateSymbol("test", "test_3DExtrusion_polygon", {
        polygonOpacity: this.opacity,
      });
    },
    changeHeight(value) {
      this.height = value;
      this.stops3D.updateDataConfig("test", "test_3DExtrusion_polygon", {
        defaultAltitude: this.height,
      });
    },
    changeFillColor(value) {
      this.fillColor = value;
      this.stops3D.updateSymbol("test", "test_3DExtrusion_polygon", {
        polygonFill: this.fillColor,
      });
    },
    changeFillColors() {
      const stops = this.fieldValues.map((item, index) => {
        return [item, this.fillColors[index]];
      });
      this.styleOptions = {
        polygonFill: {
          type: "categorical",
          property: `${this.selectedFiled}`,
          stops,
        },
      };
      this.stops3D.setStyle("test", this.styleOptions);
    },
  },
};
</script>
<style lang="less">
.control {
  position: absolute;
  z-index: 999;
  left: 10px;
  top: 10px;
}
.stereoEffectTooltip {
  .ant-tooltip-content {
    position: relative !important;
    top: 5px !important;
  }
  .ant-tooltip-inner {
    background: #2f343c !important;
    box-shadow: 0px 1px 8px 0px rgba(0, 0, 0, 0.6) !important;
    opacity: 0.9 !important;
  }
  .ant-tooltip-arrow::before {
    background-color: #2f343c !important;
    opacity: 0.9 !important;
    transform: translateY(1.5px) rotate(45deg) !important;
  }
}
.settingPanel_StereoSetting {
  .interactive {
    cursor: pointer;
  }
  width: 100%;
  height: calc(100vh - 148px);
  overflow-y: auto;
  padding-bottom: 10px;
  padding-top: 3px;
  .collapseBox {
    .ant-collapse {
      color: #919399;
      background-color: transparent;
      border: unset;
      border-radius: 0;
      .ant-collapse-item {
        border-bottom: unset;
        margin-bottom: 3px;
        .ant-collapse-header {
          font-size: 15px;
          color: #919399;
          font-weight: 600;
          padding-left: 40px;
          background: #2f343c;
          height: 44px;
          border-radius: 0;
          .ant-collapse-arrow {
            left: 21px;
          }
        }
        .ant-collapse-content {
          overflow: hidden;
          color: #919399;
          border-top: unset;
          background-color: transparent;
          .ant-collapse-content-box {
            padding: 0 15px;
            .buttonBox {
              display: flex;
              justify-content: space-between;
              width: 115px;
              margin: 18px 0px 18px 0px;
              li {
                cursor: pointer;
                width: 30px;
                height: 30px;
                background: #2f343c;
                border-radius: 4px;
                line-height: 30px;
                text-align: center;
                .icon {
                  color: #999999ff;
                  svg {
                    // width: 16px;
                    // height: 16px;
                  }
                }
              }
              li:hover,
              .button_active {
                background: #4389ff4d;
                border-radius: 4px;
                .icon {
                  color: #ffffffff;
                  svg {
                    // width: 16px;
                    // height: 16px;
                  }
                }
              }
            }
            .ant-table {
              font-size: 12px;
            }
            .ant-table-wrapper {
              margin-bottom: 10px;
            }
            .ant-table-content {
              .ant-table-body {
                overflow-y: auto;
                overflow-x: hidden;
                max-height: 150px;
                table {
                  border: unset;
                  border-radius: 4px;
                }
                .ant-table-thead {
                  tr {
                    border: unset;
                    th {
                      padding: 8px 2px;
                      color: #919399;
                      border: unset;
                      background: #0f1014;
                    }
                  }
                }
                .ant-table-tbody {
                  background: #0f1014;
                  tr {
                    border: unset;
                    td {
                      padding: 8px 2px;
                      color: #919399;
                      border-left: unset;
                      border-right: unset;
                      border-top: unset;
                      border-bottom: unset;
                    }
                  }
                  tr:hover {
                    background-color: rgba(67, 137, 255, 0.3);
                  }
                  tr:hover:not(.ant-table-expanded-row):not(.ant-table-row-selected)
                    > td {
                    background: transparent;
                  }
                  .rowSelect {
                    background-color: rgba(67, 137, 255, 0.3);
                  }
                  .ordinaryRow {
                    .editable-cell {
                      position: relative;
                      // text-align: left;
                      text-align: center;
                      .editable-cell-input-wrapper {
                        .ant-input {
                          width: 70%;
                          height: 25px;
                          font-size: 12px;
                          padding: 2px;
                          background-color: transparent;
                          color: #4389ff;
                          border: 1px solid #4389ff;
                        }
                      }
                      .editable-cell-icon,
                      .editable-cell-icon-check {
                        position: absolute;
                        top: 50%;
                        right: -5px !important;
                        transform: translateY(-50%);
                        cursor: pointer;
                      }
                      .editable-cell-icon {
                        line-height: 18px;
                        display: none;
                      }
                      .editable-cell-icon-check {
                        line-height: 28px;
                      }
                      .editable-cell-icon:hover,
                      .editable-cell-icon-check:hover {
                        color: #108ee9;
                      }
                      .editable-add-btn {
                        margin-bottom: 8px;
                      }
                    }
                    .editable-cell:hover .editable-cell-icon {
                      display: inline-block;
                    }
                    .editable-cell:hover {
                      text-align: center !important;
                    }
                  }
                }
              }
              .ant-table-body::-webkit-scrollbar {
                /*滚动条整体样式*/
                width: 3px; /*高宽分别对应横竖滚动条的尺寸*/
                height: 3px;
                border-radius: 6px;
              }
              .ant-table-body::-webkit-scrollbar-thumb {
                /*滚动条里面小方块*/
                border-radius: 4px;
                box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
                background: #4389ff;
              }
              .ant-table-body::-webkit-scrollbar-track {
                /*滚动条里面轨道*/
                height: 90%;
                box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
                border-radius: 4px;
                background: #2f343c;
              }
              .ant-table-placeholder {
                border: unset;
                background: #0f1014;
                padding: 5px;
                .ant-empty-normal {
                  margin: 10px 0;
                  color: rgba(0, 0, 0, 0.25);
                  .ant-empty-description {
                    color: #919399;
                  }
                }
              }
            }
          }
        }
      }
      .parameter {
        display: flex;
        align-items: center;
        margin: 15px 10px;
        span {
          margin-right: 15px;
        }
        .colorsPanel {
          background: #31343c;
          height: 100%;
          width: 100%;
          margin: 10px;
        }
        .ant-input-number {
          background: #0f1014;
          border-radius: 2px;
          font-size: 14px;
          color: #919399;
          border-width: 0;
          border-color: #0f1014;
        }
        .ant-input-number-input {
          padding: 0 10px;
          // background: #0f1014;
          // border-radius: 2px;
          // color: #919399;
        }
        .ant-input-number-handler-wrap {
          display: none;
        }
        .colorSpan .vue-colorpicker .vue-colorpicker-btn {
          margin-right: 0;
          width: 100%;
        }
        .ant-checkbox-inner {
          background: #0f1014;
          border: 1px solid #0f1014;
        }
        .ant-checkbox-checked::after {
          width: 16px !important;
        }

        // .ant-select-dropdown {
        //   background: #191b24;
        //   box-shadow: 0px 1px 8px 0px #000000;
        // }

        .ant-select-selection {
          background: #0f1014;
          border-radius: 2px;
          color: #919399;
          border: none;
        }
        .ant-select-arrow {
          color: #919399;
        }
      }
      .colorsParameter {
        margin: 0px;
        .colorPanelHeader {
          margin: 5px;
          display: flex;
          p {
            text-align: center;
          }
        }
        .colorPanelContent {
          margin: 10px 0px;
          .colorItem {
            display: flex;
            margin: 5px;
            p {
              width: 30%;
              text-align: center;
            }
            .span {
              width: 168px;
            }
          }
        }
      }
    }
  }
}
.selectClass {
  background: #191b24;
  box-shadow: 0px 1px 8px 0px #000000;
  .ant-select-dropdown-menu-item {
    background-color: #191b24;
    color: #fff;
    height: 32px;
  }
  .ant-select-dropdown-menu-item-selected {
    background-color: rgba(67, 137, 255, 0.3);
  }
  .ant-select-dropdown-menu-item-active:not(.ant-select-dropdown-menu-item-disabled) {
    background-color: #191b24;
  }
  .ant-select-dropdown-menu-item:hover:not(.ant-select-dropdown-menu-item-disabled) {
    background-color: rgba(67, 137, 255, 0.3);
  }
}
</style>
