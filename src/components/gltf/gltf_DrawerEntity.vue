<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <div>
        <span>x轴</span>
        <el-slider v-model="x" :min="-50" :max="50" @change="changeX"></el-slider>
      </div>
      <hr />
      <el-button type="primary" plain @click="clear">重置</el-button>
    </div>
  </div>
</template>

<script>
/**
 * 注意事项：
 * 1.一个矢量图层3个面，属性1,2,3，对应一种户型
 * 2.户型3个gltf模型
 * 3.楼一个gltf模型
 * 4.ClipInsideMask的使用
 */
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, GLTFLayer, GLTFMarker, ClipInsideMask } from "@maptalks/gl-layers";

export default {
  components: {},

  data() {
    return {
      map: null,
      groupLayer: null,
      gltfLayer: null,

      selectedEntity: null, //选择的实体
      selectedMask: null, //遮罩

      //ui
      x: 0,
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [121.48214966, 31.24294323],
      zoom: 17.718045154729342,
      bearing: -122.5272525368001,
      pitch: 80,
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
      environment: {
        enable: true,
        mode: 1,
        level: 0,
        brightness: 1,
      },
      shadow: {
        type: "esm",
        enable: true,
        quality: "high",
        opacity: 0.5,
        color: [0, 0, 0],
        blurOffset: 1,
      },
      postProcess: {
        enable: true,
        antialias: {
          enable: true,
          taa: true,
          jitterRatio: 0.25,
        },
        ssr: {
          enable: true,
        },
        bloom: {
          enable: true,
          threshold: 0,
          factor: 1,
          radius: 1,
        },
        ssao: {
          enable: true,
          bias: 0.08,
          radius: 0.08,
          intensity: 1.5,
        },
        sharpen: {
          enable: true,
          factor: 0.5,
        },
        outline: {
          enable: true,
          outlineFactor: 0.3,
          highlightFactor: 0.2,
          outlineWidth: 1,
          outlineColor: [0.91764, 0.4196, 0.28235],
        },
      },
      weather: {
        enable: false,
        fog: {
          enable: false,
          start: 0.1,
          end: 45,
          color: [0.9, 0.9, 0.9],
        },
        rain: {
          enable: false,
          windDirectionX: 0,
          windDirectionY: 0,
          rippleRadius: 24,
          rainWidth: 1,
          rainHeight: 1,
          speed: 1,
          density: 2000,
          rainTexture:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAnxQTFRFAAAA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////o6/NjwAAANR0Uk5TAAmA2/jaCsP9f/v8gfrZ9vn39PXz8fLw7u/t6+zq6ejm5+Tl4+Lg4d/e3dzY1tfV1NPS0M7LzMrJyMfFxMLBwL67vLq5t7a0tbKxr7CsrauqqKelpqOioJ6dm5qZmJaVk5SRkI6LiYiGh4OEfnx7eXd2dHNxcm9ubGtpamZnZGFiXl9dXFpZWFdVVFNSUE9NTkpLSEZFRENBQj8+PTw6ODc1NjM0MTIvLiwtKisoKSYnJCUjIiEgHx4cHRobGBkXFRYTFBIREA8ODQsMCAcGBQQDAQI60ssxAAADo0lEQVR4nO3O+VeMcRTH8ZapMdWUUJIi25TSiqKEsTQq1EQkRYowDSrRohShBVGY7EmhvVQkKUsUFU31D7n3eeb5D5zzOc7p/b33/vp9mZnN9j9nbmEps7Iwh/1vLZ/Dya1RAIWNLT9bOxTA0kZpY6NUKu1RAIe5nHKuAwogkznKZHxQAEdHB0cHDgWYN98UDLCAo4sCODk7O/M6owALFzo5OfFBAVwWmUIBXF1cxVCAxW5ui934oADu7kvchVCApVIogMcyDw+PZXRQgOViK1agACtXrRRmFQqg8lR5eqpUKk8UwMvLa7UXhwJ4Uz4+3j7eKIAlZWVFBwWwt19D0UUBfP38fCk/PxTAP0B4/gEoQGCQUGAQCrBWCgVYJ4UCrA8WWh+MAoSEhGzYwIMCbAwNDeUNRQHCNoWJoQByebicNxwF2LzFFAqwVQoFUKu3UWq1GgXYvoPigwLs3BnBExGBAmg0ml2URoMCREZGRtFERaEA0dHRu2l2R6MAe/bupaFFAWJiYmJjY+mgANo4bVxcnFarRQH2cfvpoQDxB+IpOijAQSkUICHhED26KEBiYuLhRA4FSEpKTk7mRQGOHKWOUChAyrGUFNpjKShAampqWhovCnBcCgU4IYUCpKenn0znUIBTpk6jALoMnU6XkZGhQwHs7OwseCxQAIVer1co9Ao9CnDmLHWGLgpwTgoFyMzKzMqizUQBsrPPn8/mUICcnJwLORwKcDE396LwUIA8ofz8PBSgoKDgUgGHAhQWFRYV8UEBLkuhAMUlxSUlvCjAlStXxVCA0tJr13hKUYDr1I0btChAWXl5WVk5XRSgoqKisrKSFgW4eUvsJgpwu6rqtvBQgDvcXXooQHVNdQ1VXY0C3JNCAe4LPXhwHwUw1Bpqaw0GQy0K8FDs0UMU4PGTx2IowFPuGQ0K8FwKBaire1FXxwcFqH/5sp5fPQrQQDU2NDY2oACvXr8SQwHeCDW9aUIBmluaW1qaaVGA1tbWNp42FKC9vb2DtwMF6Ozq6uzqpFCAt93db4VQgJ5eqqe3pwcFePee4oMC9H0QXl8fCtDf/1F8KMDAwKdPPAMowODg4NAQzRAK8FkKBfhi6isK8O3b8PAwHxTg+w96PCjAiNCPkREUYPTnKM/oTxTglxQKMDZOjY2NjaMA1lIogLn5xMQELwrw2xQM8Iea5EUBJoWMk0YUYGrKaDTSTqEA0zNT9GZmplEAs2kx2P+zzfZP+gu1/Lk8hb5KLwAAAABJRU5ErkJggg==",
        },
        snow: {
          enable: false,
          snowGroundTexture:
            "data:image/png;base64,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",
        },
      },
    };
    this.groupLayer = new GroupGLLayer("group", [], { sceneConfig });
    this.groupLayer.addTo(this.map);

    this.addGLTFLayer();
  },

  methods: {
    addGLTFLayer() {
      this.loadEntityPolygon();
      this.gltfLayer = new GLTFLayer("gltf0");
      this.groupLayer.addLayer(this.gltfLayer);
      //GLTFMarker1
      let coordinates1 = [121.48458521413636, 31.24421593440192, 3];
      const gltfMarker1 = new GLTFMarker(coordinates1, {
        symbol: {
          visible: true,
          bloom: false,
          ssr: false,
          shadow: true,
          url:
            "data/gltf/drawerEntity/gltf-model/4b3/4b30bf75-a841-47fd-9d10-d9b945ee279e/scene.gltf",
          animation: true,
          animationName: null,
          loop: true,
          speed: 1,
          translation: [-1.8103004104632419, 0.30965966977964854, 0.002802961378429558],
          scale: [3.5838319233675295, 3.5838319233675295, 3.5838319233675295],
          rotation: [0, 0, 0],
          fixSizeOnZoom: -1,
          shader: "pbr",
          uniforms: {
            polygonFill: [1, 1, 1, 1],
            polygonOpacity: 1,
            baseColorIntensity: 1,
            outputSRGB: 1,
          },
          rotationX: 0,
          rotationY: 0,
          rotationZ: 21.510071425978985,
          scaleX: 0.011527818536033223,
          scaleY: 0.011527818536033223,
          scaleZ: 0.011527818536033223,
        },
      });
      this.gltfLayer.addGeometry(gltfMarker1);

      //选中entity(gltf模型)
      const symbol = this.getSymbol(1);
      const offset = this.getOffset(1);
      this.selectedEntity = new GLTFMarker([offset.x, offset.y, 0], { symbol });
      this.gltfLayer.addGeometry(this.selectedEntity);
      this.selectedEntity.hide();

      //单击事件
      this.map.on("click", (e) => {
        const identifyData = this.gltfLayer.identify(e.coordinate)[0];
        if (identifyData) {
          const coordinate = new maptalks.Coordinate(identifyData.coordinate);
          const height = coordinate.z;
          const room = this.queryRoom(coordinate); //房间room
          if (!room) return;
          const properties = room.getProperties();
          const { floorHeight, type } = properties; //矢量数据里type:1,2,3对应模型类型
          const z = Math.floor(height / floorHeight) * floorHeight;
          const symbol = this.getSymbol(type);
          const offset = this.getOffset(type);
          //实体
          this.selectedEntity.show();
          this.selectedEntity.setSymbol(symbol); //显示哪个模型
          this.selectedEntity.setCoordinates([offset.x, offset.y, z]);
          this.selectedEntity.outline();
          //蒙皮
          this.selectedMask = new ClipInsideMask(room.getCoordinates(), {
            heightRange: [z, z + floorHeight],
          });
          this.gltfLayer.setMask(this.selectedMask);
        }
      });
    },
    /**
     * 三个户型的矢量面
     */
    loadEntityPolygon() {
      fetch("data/gltf/drawerEntity/house.json")
        .then((data) => {
          return data.json();
        })
        .then((data) => {
          const geometries = maptalks.GeoJSON.toGeometry(data, (geo) => {
            geo.updateSymbol({
              polygonOpacity: 0, //完全透明
              lineOpacity: 0,
            });
          });
          new maptalks.VectorLayer("vLayer", geometries).addTo(this.map);
        });
    },
    /**
     * 户型分类
     */
    getSymbol(type) {
      return {
        1: {
          url: "data/gltf/drawerEntity/drawer-entity/room1.gltf",
          rotationZ: 20.54,
          modelHeight: 3.5,
        },
        2: {
          url: "data/gltf/drawerEntity/drawer-entity/room2.gltf",
          rotationZ: 20.54,
          modelHeight: 3.5,
        },
        3: {
          url: "data/gltf/drawerEntity/drawer-entity/room3.gltf",
          rotationZ: 20.54,
          modelHeight: 3.5,
        },
      }[type];
    },
    /**
     * 偏移分类
     */
    getOffset(type) {
      return {
        1: {
          x: 121.48425576988325,
          y: 31.244894797942635,
        },
        2: {
          x: 121.48533043050065,
          y: 31.24436843761393,
        },
        3: {
          x: 121.48386542031585,
          y: 31.243875250404784,
        },
      }[type];
    },
    /**
     * 在哪个矢量面上
     */
    queryRoom(coordinate) {
      const polygons = this.map.getLayer("vLayer").getGeometries();
      for (let i = 0; i < polygons.length; i++) {
        if (polygons[i].containsPoint(coordinate)) {
          //面包含点
          return polygons[i];
        }
      }
      return null;
    },

    /**
     * UI
     */
    changeX(value) {
      if (!this.selectedEntity) return;
      this.selectedEntity.updateSymbol({ translationX: value });
    },
    clear() {
      if (!this.selectedEntity) return;
      // const offset = this.getOffset(1);
      // this.selectedEntity.setCoordinates([offset.x, offset.y, 0]);
      // this.selectedEntity.cancelOutline();
      this.selectedEntity.hide();
      this.gltfLayer.removeMask();
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
