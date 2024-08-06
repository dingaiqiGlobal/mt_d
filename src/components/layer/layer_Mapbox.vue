<template>
  <div>
    <div id="map" class="container"></div>
    <div class="control"></div>
  </div>
</template>

<script>
import "maptalks/dist/maptalks.css";
import * as maptalks from "maptalks";
import { GroupGLLayer, VectorTileLayer } from "@maptalks/gl-layers";

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
    this.map = new maptalks.Map("map", {
      center: [116.41439, 39.91671],
      zoom: 10,
      pitch: 60,
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
    /**
     * groupLayer
     */
    const sceneConfig = {
      // postProcess: {
      //   enable: true,
      //   antialias: { enable: true },
      // },
    };
    this.groupLayer = new GroupGLLayer("group", [], {
      sceneConfig,
    });
    this.groupLayer.addTo(this.map);
    this.addMapBoxLayer();
    //this.addGeoServerLayer()
    //this.addAPILayer();
  },

  methods: {
    /**
     * ①矢量切片服务-tileserver
     * ②样式-MapTalks Designer制作（与mapbox不是一套）
     * ③MapTalks Designer设计的时候要添加style地址，因为里面包含pbf地址了-http://192.168.201.166:8080/style/dongcheng/default_blue/style.json
     */
    
    // addMapBoxLayer() {
    //   const vt = new VectorTileLayer("mapbox_vt", {
    //     urlTemplate: `http://192.168.201.166:8081/data/dongcheng/{z}/{x}/{y}.pbf`,
    //     style: "data/json/mapbox-light/style_mapbox_dongcheng.json",
    //   });
    //   this.groupLayer.addLayer(vt);
    //   //蒙皮-裁剪
    //   fetch("data/json/bj/beijing_gugong.json")
    //     .then((res) => res.json())
    //     .then((geojson) => {
    //       const polygons = maptalks.GeoJSON.toGeometry(geojson);
    //       this.groupLayer.setMask(polygons[0]);
    //     });
    // },
    addMapBoxLayer() {
      const vt = new VectorTileLayer("mapbox_vt", {
        urlTemplate: `http://192.168.201.166:8081/data/dongcheng/{z}/{x}/{y}.pbf`,
        style: "data/json/mapbox-light/style_mapbox_dongcheng.json",
      }).addTo(this.map);
      //蒙皮-裁剪
      fetch("data/json/bj/beijing_gugong.json")
        .then((res) => res.json())
        .then((geojson) => {
          const polygons = maptalks.GeoJSON.toGeometry(geojson);
          vt.setMask(polygons[0]);
        });
    },
    /**
     *  ①矢量切片服务-geoserver
     *  ②options上设置tms: true
     *  ③MapTalks Designer设计的时候要添加-http://192.168.201.162:8088/geoserver/gwc/service/tms/1.0.0/zhjy%3Adongchenggroup@EPSG%3A900913@pbf
     * //样式文件不好配-不建议使用geoserver矢量切片服务
     */
    addGeoServerLayer() {
      const vt = new VectorTileLayer("geoserver_vt", {
        urlTemplate: `http://192.168.201.162:8088/geoserver/gwc/service/tms/1.0.0/zhjy%3Adongchenggroup@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf`,
        tms: true, //这个参数必须设置
        style: "data/json/mapbox-light/style_mapbox_dongcheng.json",
      });
      this.groupLayer.addLayer(vt);
    },
    /**
     * ③矢量切片服务-postgis
     * https://blog.csdn.net/sig321/article/details/139233747
     * 
     * 
     *  ST_AsMVTGeom 将数据库存储的空间坐标转换为矢量切片坐标；
        ST_AsMVT 将矢量空间坐标聚合为符合矢量切片格式规范的二进制数据；
        ST_TileEnvelope 在 Web墨卡托坐标系 (SRID:3857) 下使用 xyz 切片架构 计算切片切片坐标范围；
        ST_Transform 坐标转换函数

     * 
     * 存储过程-使用上面的三个函数编写实现代码
     * CREATE OR REPLACE FUNCTION public.vector_tile_test(z integer, x integer, y integer, tn text, OUT tile bytea)
        RETURNS bytea
        LANGUAGE plpgsql
        STRICT
        AS $function$
        DECLARE
          bound geometry;
          extent box2d;
            sql text;
        BEGIN  
          --ST_TileEnvelope函数得到的是epsg:3857坐标系，表是4326，需要坐标系转换。
          bound:=ST_Transform(ST_TileEnvelope(z,x,y),4326);
            extent:=Box2D(bound);
            sql:='WITH mvtgeom AS(
            SELECT ST_AsMVTGeom(the_geom, $1) AS geom,name FROM ' || tn || ' WHERE ST_Intersects(the_geom, $2)
            ) SELECT ST_AsMVT(mvtgeom.*,$3) FROM mvtgeom';
          execute format(sql) using extent,bound,tn into tile;
          RETURN;
        END;
        $function$
        ;


        函数参数：切片的xy坐标，级别z，图层名tn
        函数返回：mvt切片的二进制数组
     * 
     */
    addAPILayer() {
      const vt = new VectorTileLayer("geoserver_vt", {
        urlTemplate: `http://192.168.52.69:8086/zkdn-os/map/vectortile/beijing/{z}/{x}/{y}.pbf`,
        //style: "data/json/mapbox-light/style_mapbox_dongcheng.json",
      });
      this.groupLayer.addLayer(vt);
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
