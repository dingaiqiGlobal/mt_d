<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control">
      <button @click="addFliter_Canvas">Canvas过滤</button>
      <button @click="addFliter_Canvas_Worker">Worker过滤</button>
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
    };
  },

  computed: {},

  mounted() {
    this.map = new maptalks.Map("map", {
      center: [116.39259, 39.90473],
      zoom: 4,
      spatialReference: {
        projection: "EPSG:3857",
      },
    });
  },

  methods: {
    /**
     * filter效果依赖canvas的filter特性，
     * 当TileLayer放到GroupGLLayer里TileLayer变成了webgl渲染，
     * 所以这个效果会失效.
     */
    addFliter_Canvas() {
      let baseLayer = new maptalks.TileLayer("tile1", {
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      });
      baseLayer.on("renderercreate", function (e) {
        //load tile image
        //   img(Image): an Image object
        //   url(String): the url of the tile
        e.renderer.loadTileImage = function (img, url) {
          //mocking getting image's base64
          //replace it by your own, e.g. load from sqlite database
          var remoteImage = new Image();
          remoteImage.crossOrigin = "anonymous";
          remoteImage.onload = function () {
            var base64 = getBase64Image(remoteImage);
            img.src = base64;
          };
          remoteImage.src = url;
        };
      });

      var canvas;

      function getCanvas() {
        if (canvas) {
          return canvas;
        }
        canvas = document.createElement("canvas");
        return canvas;
      }

      function getBase64Image(img) {
        var canvas = getCanvas();
        canvas.width = img.width;
        canvas.height = img.height;

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.filter = "sepia(90%) invert(90%)";
        ctx.drawImage(img, 0, 0);

        var dataURL = canvas.toDataURL("image/jpg", 0.7);
        return dataURL;
      }
      this.map.addLayer(baseLayer);
    },
    
    /**
     *上个方法因为处理逻辑在主线程里，
     可能会导致主线程卡顿,你也可以在worker里处理
     */
    addFliter_Canvas_Worker() {
      const fun1 = function (exports) {
        exports.initialize = function () {
          console.log("tileimagebitmap init");
        };
        const canvas = new OffscreenCanvas(1, 1);
        const TILESIZE = 256;
        exports.onmessage = function (msg, postResponse) {
          const url = msg.data.url;
          canvas.width = TILESIZE;
          canvas.height = TILESIZE;
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          //fetch image
          fetch(url)
            .then((res) => res.arrayBuffer())
            .then((arrayBuffer) => {
              const blob = new Blob([arrayBuffer]);
              createImageBitmap(blob).then((bitmap) => {
                ctx.filter = "sepia(60%) invert(90%)";
                ctx.drawImage(bitmap, 0, 0);
                const image = canvas.transferToImageBitmap();
                postResponse(null, { image }, [image]);
              });
            })
            .catch((error) => {
              const image = canvas.transferToImageBitmap();
              postResponse(null, { image }, [image]);
            });
        };
      };
      const workerKey = "tileimagebitmap";
      maptalks.registerWorkerAdapter(workerKey, fun1);
      const actor = new maptalks.worker.Actor(workerKey);

      let baseLayer = new maptalks.TileLayer("tile2", {
        urlTemplate:
          "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      });
      baseLayer.on("renderercreate", function (e) {
        //load tile image
        //   img(Image): an Image object
        //   url(String): the url of the tile
        e.renderer.loadTileBitmap = function (url, tile, callback) {
          // console.log(tile);
          actor.send({ url }, null, (error, message) => {
            //    console.log(message);
            callback(message.image);
          });
        };
      });
      this.map.addLayer(baseLayer);
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
