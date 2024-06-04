import * as THREE from "three";
import * as maptalks from 'maptalks';
import { ThreeLayer } from 'maptalks.three';
// import { ModelControl } from 'maptalks.ModelControl';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {GroupGLLayer} from '@maptalks/gl-layers';
import {TrafficScene} from '@maptalks/traffic';
import {RoutePlayer,formatRouteData} from 'maptalks.routeplayer';
import {GLTFLayer,GLTFMarker,TransformControl,Geo3DTilesLayer,GeoJSONVectorTileLayer} from '@maptalks/gl-layers';
import "@maptalks/transcoders.draco";
import "@maptalks/transcoders.crn";
import "@maptalks/transcoders.ktx2";
import {PolygonLayer,PointLayer,LineStringLayer} from '@maptalks/gl-layers';
import { randomUUID } from '@/utils/util'
import flvjs from 'flv.js'
import Vue from "vue";

import  HeatMapLayer from './HeatMapLayer';
import ClusterMapLayer from './ClusterMapLayer';

class Viewer{
    constructor(id, options) {
        this.id = id;
        this.option = options;
        this.host = options.host;
        this.editGltfMarker = null;
        this.viewpoint = null;
    }
    //初始化
    init(mapJson, isEdit) {
        //获取HeatLayer和ClusterLayer的数据
        let vectorLayer = mapJson.layers.filter(
            (layer) => layer.type === "HeatLayer" || layer.type === "ClusterLayer"
        );
        //回显其他图层
        mapJson.layers = mapJson.layers.filter(
            (layer) => layer.type !== "HeatLayer" && layer.type !== "ClusterLayer"
        );
        
        let map = new maptalks.Map.fromJSON(this.id, mapJson);
        this.map = map;
        
        //添加过滤后的图层
        vectorLayer.forEach((layer) => {
            if (layer.type === "HeatLayer") {
                const id = layer.id;
                const options = layer.options;
                const style = {
                    radius: layer.options.radius,
                    blur: layer.options.blur,
                    gradient: layer.options.gradient,
                };
                HeatMapLayer.loadLayer(id, options, style,this.map);
            } else if (layer.type === "ClusterLayer") {
                const id = layer.id;
                const options = layer.options;
                const markerSymbol = layer.options.markerSymbol;
                const clusterStyle = {
                    maxClusterRadius: layer.options.maxClusterRadius,
                    maxClusterZoom: layer.options.maxClusterZoom,
                    symbol: {
                        markerFile: layer.options.symbol.markerFile,
                        markerOpacity: layer.options.symbol.markerOpacity,
                        markerWidth: layer.options.symbol.markerWidth,
                        markerHeight: layer.options.symbol.markerHeight,
                        markerHorizontalAlignment: layer.options.symbol.markerHorizontalAlignment,
                        markerVerticalAlignment: layer.options.symbol.markerVerticalAlignment,
                    },
                    textSymbol: {
                        textSize: layer.options.textSymbol.textSize,
                        textFill: layer.options.textSymbol.textFill,
                        textOpacity: layer.options.textSymbol.textOpacity,
                        textFaceName: layer.options.textSymbol.textFaceName,
                        textWeight: layer.options.textSymbol.textWeight,
                    },
                };
                ClusterMapLayer.loadLayer(id, options, markerSymbol, clusterStyle,this.map)
            }
        });


        /*
        const map = new maptalks.Map(this.id, {
            center: [116.40355,39.921852],
            zoom: 15,
            pitch: 80,
            lights: {
                ambient: {
                    resource: {
                        url: {
                            front: `/skybox/dusk/posz.jpg`,
                            back: `/skybox/dusk/negz.jpg`,
                            left: `/skybox/dusk/posx.jpg`,
                            right: `/skybox/dusk/negx.jpg`,
                            top: `/skybox/dusk/posy.jpg`,
                            bottom: `/skybox/dusk/negy.jpg`,
                        },
                        prefilterCubeSize: 32
                    },
                    exposure: 0.8,
                    hsv: [0, 1, -0.042],
                    orientation: 0,
                },
                directional: {
                    direction: [1, 1, 1],
                    color: [1, 1, 1],
                },
            },
            //灯光配置
            // lights: {
            //   //方相光
            //   directional: {
            //     direction: [1, 0, -1],
            //     color: [1, 1, 1],
            //   },
            //   //环境光
            //   ambient: {
            //     //配置天空盒的资源
            //     resource: {
            //       url: {
            //         front: `/skybox/night/posz.jpg`,
            //         back: `/skybox/night/negz.jpg`,
            //         left: `/skybox/night/posx.jpg`,
            //         right: `/skybox/night/negx.jpg`,
            //         top: `/skybox/night/posy.jpg`,
            //         bottom: `/skybox/night/negy.jpg`,
            //       },
            //       prefilterCubeSize: 256,
            //     },
            //     exposure: 0.8,
            //     hsv: [0, 0.34, 0],
            //     orientation: 1,
            //   },
            // }
            // baseLayer: new maptalks.TileLayer('baseLayer', {
            //   // maxAvailableZoom: 22,
            //   urlTemplate: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
            // })
            // lights: {
            //   ambient: {
            //     resource: {
            //       url: {
            //         front: "/resources/hdr/gradient/front.png",
            //         back: "/resources/hdr/gradient/back.png",
            //         left: "/resources/hdr/gradient/left.png",
            //         right: "/resources/hdr/gradient/right.png",
            //         top: "/resources/hdr/gradient/top.png",
            //         bottom: "/resources/hdr/gradient/bottom.png",
            //       },
            //       prefilterCubeSize: 32
            //     },
            //     exposure: 1,
            //     hsv: [0, 1, -0.042],
            //     orientation: 0,
            //   },
            //   directional: {
            //     direction: [-0.1, 1, -1],
            //     color: [1, 1, 1],
            //   },
            // }
        });

        let baseLayer = new maptalks.TileLayer('baseLayer', {
            // maxAvailableZoom: 22,
            // urlTemplate: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
            urlTemplate:'http://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=6',
        })
        this.baseLayer = baseLayer;

        const gltfLayer = new GLTFLayer("gltfLayer");
        this.gltfLayer = gltfLayer;
        const groupLayer = new GroupGLLayer("group", [baseLayer,gltfLayer], {//layer3dtiles
            // terrain,
            sceneConfig: {
                environment: {
                    enable: true,
                    mode: 1,
                    level: 0,
                    brightness: 1,
                },
                postProcess: {
                    enable: true,                                   // 是否开启后处理
                    antialias: {
                        enable: true,                                 // 是否开启FXAA后处理
                        taa: true                                     // 是否开启taa后处理
                    },
                    bloom: {
                        enable: true,                                 // 是否开启泛光
                        factor: 5,                                    // 强度因子 0.1 - 5
                        threshold: 1,                                 // 最小阈值（亮度低于阈值的区域不发光） 0 - 1
                        radius: 4                                     // 泛光半径 0.1 - 4
                    }
                },
                // ground: {
                //   enable: true,
                //   renderPlugin: {
                //     type: "lit",
                //   },
                //   // symbol: {
                //   //   polygonFill: [0.54, 0.54, 0.54, 1],
                //   //   ssr: true,
                //   //   // material: {
                //   //   //   baseColorTexture: "/resources/textures/rubber_roughness.png",
                //   //   //   baseColorFactor: [0.3450981, 0.3372549, 0.2117647, 1],
                //   //   //   hsv: [-0.468, 0, -0.128],
                //   //   //   baseColorIntensity: 1.372,
                //   //   //   contrast: 1.372,
                //   //   //   roughnessFactor: 1,
                //   //   //   metallicFactor: 0,
                //   //   //   normalTexture: "/resources/textures/rubber_roughness.png",
                //   //   //   uvScale: [0.09, 0.09],
                //   //   //   normalMapFactor: 0.68,
                //   //   //   emitColorFactor: 1.11,
                //   //   //   noiseTexture: "/resources/textures/noise.png",
                //   //   // },
                //   // },
                // },
            }
        }).addTo(map);
        this.groupLayer = groupLayer;
        */
        let groupLayer = map.getLayer("group");
        if(groupLayer==null){
            groupLayer = new GroupGLLayer("group");
            map.addLayer(groupLayer);
        }
        this.groupLayer = groupLayer;
        // this.groupLayer.setZIndex(999);

        let gltfLayer = groupLayer.getLayer("gltfLayer");
        if(gltfLayer==null){
            gltfLayer = new GLTFLayer("gltfLayer");
            groupLayer.addLayer(gltfLayer);
        }
        this.gltfLayer = gltfLayer;

        let _this = this;
        let geoArr=[];
        this.groupLayer.getLayers().forEach(function (layer){
            if(layer instanceof maptalks.TileLayer && !(layer instanceof GeoJSONVectorTileLayer)){
                geoArr.push(layer);
            }
        })
        geoArr.forEach(function (layer){
            _this.bindBaseLayerFilterEvent(layer);
            layer.forceReload();
        })

        /*
        let baseLayer = groupLayer.getLayer("baseLayer");
        window.cssfilter=""  //brightness(40%)亮度 contrast(%)对比度 hue-rotate(deg)色调  saturate(%)饱和度
        if(baseLayer==null){
            baseLayer = new maptalks.TileLayer("baseLayer",{
                urlTemplate: 'http://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=6',
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
                ctx.filter = window.cssfilter;
                ctx.drawImage(img, 0, 0);

                var dataURL = canvas.toDataURL("image/jpg", 0.7);
                return dataURL;
            }
            groupLayer.addLayer(baseLayer);
        }else {
            groupLayer.removeLayer(baseLayer);
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

                // var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                // gradient.addColorStop(0, 'white');
                // gradient.addColorStop(1, 'red');
                // ctx.fillStyle = gradient;

                // ctx.globalCompositeOperation = 'multiply';
                ctx.save();
                // ctx.filter = window.cssfilter;
                ctx.drawImage(img, 0, 0);
                // ctx.fillStyle = 'rgba(255, 0, 0, 1)';
                // ctx.fillRect(0,0,canvas.width,canvas.height);
                // 获取图像的像素数据
                // const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                // const data = imageData.data;
                // const gamma = 1;
                // // 对每个像素值进行 gamma 变换
                // for (let i = 0; i < data.length; i += 4) {
                //     data[i] = Math.pow(data[i] / 255, gamma) * 255; // 红色通道
                //     data[i + 1] = Math.pow(data[i + 1] / 255, gamma) * 255; // 绿色通道
                //     data[i + 2] = Math.pow(data[i + 2] / 255, gamma) * 255; // 蓝色通道
                // }
                // // 将处理后的像素数据放回 canvas
                // ctx.putImageData(imageData, 0, 0);
                var dataURL = canvas.toDataURL("image/jpg", 0.7);
                return dataURL;
            }
            groupLayer.addLayer(baseLayer);
        }
        this.baseLayer = baseLayer;
        window.baseLayer = baseLayer;
        */

        let gltfMarkerTextLayer = map.getLayer("gltfMarkerTextLayer");//VectorLayer
        if(gltfMarkerTextLayer==null){
            gltfMarkerTextLayer = new maptalks.VectorLayer("gltfMarkerTextLayer");
            map.addLayer(gltfMarkerTextLayer);
        }
        this.gltfMarkerTextLayer = gltfMarkerTextLayer;

        if(isEdit) {//开启编辑单体模型
            const transformControl = new TransformControl();
            this.transformControl = transformControl;
            transformControl.addTo(map);
            transformControl.on("transformend", (e) => {
                // document.getElementById("info").innerHTML = "操控模型完成事件";
                // console.log(gltfMarker.getCoordinates())
                // console.log(gltfMarker.getRotation())
                // console.log(gltfMarker.getScale())
                // gltfLayer.forEach(function (geom){
                //     // console.log(geom)
                //     console.log(geom.getScale())
                //     let properties = geom.getProperties();
                //     console.log(properties)
                //     // gltfLayer.removeGeometry(gltfMarker);
                // })
                let result = this.getAllGltfInfo();
                console.log(result)

                let json = this.map.toJSON();
                console.log(JSON.stringify(json))

                if (_this.host.$refs.modelAttributes)
                    _this.host.$refs.modelAttributes.resetForm();

                this.updateGltfMarkerText(this.editGltfMarker)
            });
            //模型编辑事件
            map.on("click", (e) => {
                const identifyData = e.coordinate ?
                    groupLayer.identify(e.coordinate, {
                        layers: [gltfLayer],
                        orderByCamera: true,
                    })[0] :
                    groupLayer.identifyAtPoint(e.containerPoint, {
                        layers: [gltfLayer],
                        orderByCamera: true,
                    })[0];
                const target = identifyData && identifyData.data;

                if (target && target instanceof GLTFMarker) {
                    target.openInfoWindow();

                    if(target.properties.modelName=="监控电子眼"){
                        setTimeout(function (){
                            if(_this.flvPlayer){
                                _this.flvPlayer.pause()
                                _this.flvPlayer.unload()
                                _this.flvPlayer.detachMediaElement()
                                _this.flvPlayer.destroy()
                                _this.flvPlayer = null
                            }
                            if (flvjs.isSupported()) {
                                let vurl = target.properties.vurl;
                                if(vurl==null || vurl=="")
                                    vurl="http://192.168.201.82:80/rtp/34020020211108155018_34020020211108155018.live.flv";
                                var videoElement = document.getElementById('my-video');
                                _this.flvPlayer = flvjs.createPlayer({
                                    type: 'flv',
                                    url: vurl
                                });
                                _this.flvPlayer.attachMediaElement(videoElement);
                                _this.flvPlayer.load();
                                _this.flvPlayer.play();
                            }
                        },1000);
                    }

                    console.log(target.getZIndex())
                    transformControl.disable();
                    if (_this.host && _this.host.isModelEditing !== undefined) {
                        _this.host.isModelEditing = true;
                        _this.host.rightPageType = '1';
                        _this.editGltfMarker = target;
                        if (_this.host.$refs.modelAttributes)
                            _this.host.$refs.modelAttributes.resetForm();
                    }
                    let locked = target.getProperties().locked;
                    if (!locked) {
                        transformControl.enable();
                        transformControl.transform(target);
                        this.host.isModelLocked = false;
                    } else {
                        this.host.isModelLocked = true;
                    }
                } else {
                    transformControl.disable();
                    if (_this.host && _this.host.isModelEditing !== undefined) {
                        _this.host.isModelEditing = false;
                        _this.host.rightPageType = '0';
                        _this.editGltfMarker = null;
                    }
                }
            });
            //模型拖拽到场景事件
            map.on("drop", (e) => {
                const {coordinate, dataTransfer} = e;
                if (coordinate.z == null) coordinate.z = 0;
                const data = dataTransfer.getData("data");
                let item = JSON.parse(data)

                let type = item.styleType;
                let name = item.styleName;
                let geoId = item.geoId;
                if (type == "4") {//gltf glb
                    let url = item.content.uri;
                    let thumbnail = item.thumbnail;
                    if (!url) {
                        return;
                    }
                    let key = randomUUID();
                    const model = new GLTFMarker(coordinate, {
                        id: key,
                        symbol: {
                            url,
                            animation: true,
                            loop: true,
                            // visible:{
                            //     stops: [
                            //         [1, false],
                            //         [15, true],
                            //         [Infinity, true],
                            //     ],
                            //     type: "interval",
                            // }
                            // modelHeight: 34,
                            // rotationZ: 180,
                        },
                    });
                    model.setProperties({
                        name: name,
                        key: key,
                        modelId: geoId,
                        modelName: name,
                        thumbnail: thumbnail,
                    });

                    if(name=="监控电子眼") {
                        model.setInfoWindow({
                            title: "视频监控",
                            content: '<div class="info-content"><video width="100%" height="auto" id="my-video" controls muted src=""></video></div>'
                        });
                    }else {
                        model.setInfoWindow({
                            title: "信息",
                            content: '<div>'+name+'</div>'
                        });
                    }

                    // const options = {
                    //     items: [{
                    //         item: "X",
                    //         click: () => {
                    //             if(_this.editGltfMarker&&_this.editGltfMarker.getId()==key){
                    //                 let id = _this.editGltfMarker.getId();
                    //                 _this.removeGltfById(id);
                    //                 _this.host.isModelEditing = false;
                    //                 _this.editGltfMarker = null;
                    //             }else {
                    //                 _this.gltfLayer.removeGeometry(model);
                    //             }
                    //             _this.loadGltfNodes();
                    //         },
                    //     }]
                    // };
                    // model.on("load", () => {
                    //     model.setMenu(options)//.openMenu();
                    // });

                    model.addTo(_this.gltfLayer);
                    _this.loadGltfNodes();
                    _this.addGltfMarkerText(model);
                }

                // const isModel = url.includes(".gltf") || url.includes(".glb");
                // if (isModel) {
                //     const model = new maptalks.GLTFMarker(coordinate, {
                //         symbol: {
                //             url,
                //             modelHeight: 34,
                //             rotationZ: 180,
                //         },
                //     });
                //     model.addTo(gltfLayer);
                // } else {
                //     const marker = new maptalks.Marker(coordinate, {
                //         symbol: {
                //             markerFile: url,
                //             markerVerticalAlignment: "middle",
                //         },
                //     }).addTo(layer);
                // }
            });
        }else {
            map.on("click", (e) => {
                const identifyData = e.coordinate ?
                    groupLayer.identify(e.coordinate, {
                        layers: [gltfLayer],
                        orderByCamera: true,
                    })[0] :
                    groupLayer.identifyAtPoint(e.containerPoint, {
                        layers: [gltfLayer],
                        orderByCamera: true,
                    })[0];
                const target = identifyData && identifyData.data;
                if (target && target instanceof GLTFMarker) {
                    target.openInfoWindow();
                    if(target.properties && target.properties.modelName=="监控电子眼"){
                        setTimeout(function (){
                            if(_this.flvPlayer){
                                _this.flvPlayer.pause()
                                _this.flvPlayer.unload()
                                _this.flvPlayer.detachMediaElement()
                                _this.flvPlayer.destroy()
                                _this.flvPlayer = null
                            }
                            if (flvjs.isSupported()) {
                                let vurl = target.properties.vurl;
                                if(vurl==null || vurl=="")
                                    vurl="http://192.168.201.82:80/rtp/34020020211108155018_34020020211108155018.live.flv";
                                var videoElement = document.getElementById('my-video');
                                _this.flvPlayer = flvjs.createPlayer({
                                    type: 'flv',
                                    url: vurl
                                });
                                _this.flvPlayer.attachMediaElement(videoElement);
                                _this.flvPlayer.load();
                                _this.flvPlayer.play();
                            }
                        },1000);
                    }
                }
            });
        }
        // this.setGltfMenu();
    }

    getAllGltfInfo(){
        let array =[];
        this.gltfLayer.forEach(function (gltf){
            let json = gltf.toJSON();
            array.push(json);
        })
        return array;
    }

    setGltfMenu(){
        let _this=this;
        this.gltfLayer.forEach(function (gltf){
            const options = {
                items: [{
                    item: "X",
                    click: () => {
                        _this.removeGltfById(gltf.getId());
                    },
                }]
            };
            gltf.setMenu(options)
            // gltf.on("load", () => {
            //     gltf.setMenu(options)//.openMenu();
            // });
        })
    }

    loadGltfNodes(){
        let children=[];
        this.gltfLayer.forEach(function (gltf){
            let json = gltf.toJSON();
            json.isShow = "1";
            if(json.options.symbol.visible==false)
                json.isShow = "0";

            json.key = json.options.properties.key;
            json.layerType = "4";
            json.scopedSlots = {title: "custom"};
            json.title = json.options.properties.name;
            json.type = "1";
            json.value = json.options.properties.key;
            json.weight = 0;

            children.push(json);

            if(json.options.properties.modelName=="监控电子眼"){
                gltf.setInfoWindow({
                    title: "视频监控",
                    content: '<div class="info-content"><video width="100%" height="auto" id="my-video" controls muted src=""></video></div>'
                });
            }else if(json.options.properties.modelName=="中鼎大厦"){
                let properties = json.options.properties;
                if(!properties) return;
                console.log(properties,'中鼎大厦');
                let infoWindowObj = Viewer.prototype.createBuildingInfoWindow(properties);
                gltf.setInfoWindow({
                    title: infoWindowObj.title || "信息",
                    content: infoWindowObj.content || '<div>'+json.options.properties.name+'</div>'
                });
            }else {
                gltf.setInfoWindow({
                    title: "信息",
                    content: '<div>'+json.options.properties.name+'</div>'
                });
            }
        })
        let expandedKeys = this.host.expandedKeys.slice();
        this.host.expandedKeys=[];
        this.host.treeData.forEach(function (node){
            if(node.title=="单体模型") {
                children.forEach(function (json){
                    json.parentId = node.key;
                })
                node.children = children;
                // expandedKeys.push(node.key);
            }
        })
        this.host.expandedKeys=expandedKeys;
    }

    removeGltfById(id){
        const gltfMarker = this.gltfLayer.getGeometryById(id);
        if(gltfMarker) {
            if(this.editGltfMarker&&this.editGltfMarker.getId()==gltfMarker.getId()){
                this.host.isModelEditing = false;
                this.editGltfMarker = null;
                this.gltfLayer.removeGeometry(gltfMarker);
            }else {
                this.gltfLayer.removeGeometry(gltfMarker);
            }
            this.loadGltfNodes();
            this.removeGltfMarkerText(gltfMarker);
        }
    }

    setVisibleGltfById(id,flag){
        const gltfMarker = this.gltfLayer.getGeometryById(id);
        if(gltfMarker) {
            if(flag){
                gltfMarker.show();
                this.setGltfMarkerTextVisible(gltfMarker,true)
            }else {
                gltfMarker.hide();
                this.setGltfMarkerTextVisible(gltfMarker,false)
            }
        }
    }

    locationGltf(id){
        const gltfMarker = this.gltfLayer.getGeometryById(id);
        if(gltfMarker) {
            let n=gltfMarker.getBoundingBox();
            gltfMarker.zoomTo();
        }
    }

    setVisibleGltfLayer(flag){
        if (flag) {
            this.gltfLayer.show();
            this.gltfMarkerTextLayer.show();
        } else {
            this.gltfLayer.hide();
            this.gltfMarkerTextLayer.hide();
        }
    }

    copyEditGltf(){
        let copyOne = this.editGltfMarker.copy();
        let key = randomUUID();
        copyOne.setId(key);
        let property = copyOne.getProperties();
        property.key = key;

        // let _this = this;
        // const options = {
        //     items: [{
        //         item: "X",
        //         click: () => {
        //             if(_this.editGltfMarker&&_this.editGltfMarker.getId()==key){
        //                 let id = _this.editGltfMarker.getId();
        //                 _this.removeGltfById(id);
        //                 _this.host.isModelEditing = false;
        //                 _this.editGltfMarker = null;
        //             }else {
        //                 _this.gltfLayer.removeGeometry(copyOne);
        //             }
        //             _this.loadGltfNodes();
        //         },
        //     }]
        // };
        // copyOne.on("load", () => {
        //     copyOne.setMenu(options);
        // });

        this.gltfLayer.addGeometry(copyOne);
        const position = copyOne.getCoordinates();
        let addX = (Math.random() - 0.5) * 0.001;
        let addY = (Math.random() - 0.5) * 0.001;
        const newCoordinate = new maptalks.Coordinate(position.x+addX, position.y+addY, position.z);
        copyOne.setCoordinates(newCoordinate);
        this.loadGltfNodes();
        const gltfMarkerText = this.getGltfMarkerTextById(this.editGltfMarker.getId());
        this.addGltfMarkerText(copyOne,gltfMarkerText);
    }

    copyGltfById(nodeId){
        const gltfMarker = this.gltfLayer.getGeometryById(nodeId);
        const gltfMarkerText = this.getGltfMarkerTextById(nodeId);
        let copyOne = gltfMarker.copy();

        let key = randomUUID();
        copyOne.setId(key);
        let property = copyOne.getProperties();
        property.key = key;

        // let _this = this;
        // const options = {
        //     items: [{
        //         item: "X",
        //         click: () => {
        //             if(_this.editGltfMarker&&_this.editGltfMarker.getId()==key){
        //                 let id = _this.editGltfMarker.getId();
        //                 _this.removeGltfById(id);
        //                 _this.host.isModelEditing = false;
        //                 _this.editGltfMarker = null;
        //             }else {
        //                 _this.gltfLayer.removeGeometry(copyOne);
        //             }
        //             _this.loadGltfNodes();
        //         },
        //     }]
        // };
        // copyOne.on("load", () => {
        //     copyOne.setMenu(options);
        // });

        this.gltfLayer.addGeometry(copyOne);
        const position = copyOne.getCoordinates();
        let addX = (Math.random() - 0.5) * 0.001;
        let addY = (Math.random() - 0.5) * 0.001;
        const newCoordinate = new maptalks.Coordinate(position.x+addX, position.y+addY, position.z);
        copyOne.setCoordinates(newCoordinate);
        this.loadGltfNodes();
        this.addGltfMarkerText(copyOne,gltfMarkerText);
    }

    editGltf(id){
        const gltfMarker = this.gltfLayer.getGeometryById(id);
        if(gltfMarker) {
            gltfMarker.zoomTo();
            this.transformControl.enable();
            this.transformControl.transform(gltfMarker);
            if(this.host && this.host.isModelEditing !== undefined){
                this.host.isModelEditing = true;
                this.editGltfMarker = gltfMarker;
                if(this.host.$refs.modelAttributes)
                    this.host.$refs.modelAttributes.resetForm();
            }
        }
    }
    sortGltf(node,direction){
        // let geoArr = this.gltfLayer.getGeometries();
        let geoArr = this.getAllGltfInfo();
        let index=geoArr.findIndex((item)=>{
            return item.options.id == node.key;
        });
        if(index == -1) return;

        if(direction=="up"){
            this.moveUp(geoArr,index);
        }else {
            this.moveDown(geoArr,index);
        }

        this.gltfLayer.clear();
        let _this = this;
        geoArr.forEach(function (json){
            let gltfMarker = new GLTFMarker(json.coordinates,json.options);
            _this.gltfLayer.addGeometry(gltfMarker);
        })

        this.loadGltfNodes();
        setTimeout(function (){
            if(_this.host.selectedKeys.length>0)
                _this.outlineGltf(_this.host.selectedKeys[0]);
        },800)

    }

    moveUp(array, index) {
        if (index > 0) {
            // 交换当前元素与上一个元素
            [array[index - 1], array[index]] = [array[index], array[index - 1]];
        }
        return array;
    }

    moveDown(array, index) {
        if (index < array.length - 1) {
            // 交换当前元素与下一个元素
            [array[index], array[index + 1]] = [array[index + 1], array[index]];
        }
        return array;
    }
    clearOutlineGltf(){
        if(this.outlineGltfMarker){
            this.outlineGltfMarker.cancelOutline();
            this.outlineGltfMarker = null;
        }
    }

    outlineGltf(id){
        if(this.outlineGltfMarker){
            this.outlineGltfMarker.cancelOutline();
            this.outlineGltfMarker = null;
        }
        let gltfMarker = this.gltfLayer.getGeometryById(id);
        if(gltfMarker) {
            gltfMarker.outline();
            this.outlineGltfMarker = gltfMarker;
            gltfMarker.zoomTo();
        }
    }

    lockEditGltf(){
        if(this.editGltfMarker){
            if(this.host.isModelLocked) {
                this.editGltfMarker.getProperties().locked = true;
                this.transformControl.disable();
            }else {
                this.editGltfMarker.getProperties().locked = false;
            }
        }
    }

    getGltfMarkerById(id) {
        let gltfMarker = this.gltfLayer.getGeometryById(id);
        return gltfMarker;
    }
    addGltfMarkerText(gltfMarker,gltfMarkerText){
        let text = new maptalks.Marker(gltfMarker.getCoordinates(), {
            visible:true,
            id:gltfMarker.getId(),
            properties: gltfMarker.getProperties(),
            symbol: {
                textFaceName: "sans-serif",
                textName: "{name}", // value from name in geometry's properties
                textWeight: "normal", // 'bold', 'bolder'
                textStyle: "normal", // 'italic', 'oblique'
                textSize: 15,
                textFont: null,
                textFill: "#000000",
                textOpacity: 1,
                textHaloFill: "#FFFFFF",
                textHaloRadius: 2,
                textWrapWidth: null,
                textWrapCharacter: "\n",
                textLineSpacing: 0,
                textDx: 0,
                textDy: 0,
                textHorizontalAlignment: "middle", //left | middle | right | auto
                textVerticalAlignment: "middle", // top | middle | bottom | auto
                textAlign: "center", // left | right | center | auto
            },
        }).addTo(this.gltfMarkerTextLayer);

        if(gltfMarkerText){
            text.setSymbol(gltfMarkerText.getSymbol());
        }
    }
    removeGltfMarkerText(gltfMarker){
        let gltfMarkerText = this.gltfMarkerTextLayer.getGeometryById(gltfMarker.getId());
        if(gltfMarkerText)
            this.gltfMarkerTextLayer.removeGeometry(gltfMarkerText);
    }
    updateGltfMarkerText(gltfMarker){
        let gltfMarkerText = this.gltfMarkerTextLayer.getGeometryById(gltfMarker.getId());
        if(gltfMarkerText){
            gltfMarkerText.setCoordinates(gltfMarker.getCoordinates());
            gltfMarkerText.updateSymbol(gltfMarkerText.getSymbol());
            gltfMarkerText.setProperties(gltfMarker.getProperties());
        }
    }
    setGltfMarkerTextVisible(gltfMarker,flag){
        let gltfMarkerText = this.gltfMarkerTextLayer.getGeometryById(gltfMarker.getId());
        if(gltfMarkerText){
            if(flag)
                gltfMarkerText.show();
            else
                gltfMarkerText.hide();
        }
    }
    getGltfMarkerTextById(id) {
        let gltfMarkerText = this.gltfMarkerTextLayer.getGeometryById(id);
        return gltfMarkerText;
    }

    loadBaseLayerNodes(){
        let children=[];
        this.groupLayer.getLayers().forEach(function (layer){
            if(layer instanceof maptalks.TileLayer && !(layer instanceof GeoJSONVectorTileLayer)){
                let json = layer.toJSON();
                json.isShow = "1";
                if(json.options.visible==false)
                    json.isShow = "0";

                json.key = json.id;
                json.layerType = "6";
                json.scopedSlots = {title: "custom"};
                json.title = json.id;
                if(json.options.name)
                    json.title = json.options.name;
                json.type = "1";
                json.value = json.id;
                json.weight = 0;

                children.push(json);
            }
        })
        children = children.reverse();
        let expandedKeys = this.host.expandedKeys.slice();
        this.host.expandedKeys=[];
        this.host.treeData.forEach(function (node){
            if(node.title=="地球底图") {
                children.forEach(function (json){
                    json.parentId = node.key;
                })
                node.children = children;
                // expandedKeys.push(node.key);
            }
        })
        this.host.expandedKeys=expandedKeys;
        // console.log(this.map.toJSON());
    }

    addBaseLayer(item){
        console.log(item)
        let key = randomUUID();
        let baseLayer;
        if(item.serverType=="1") {//wmts
            let urlTemplate = item.serverUrl;
            // "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=6eeb1c01782471ad6dcdd0551ff99894"
            urlTemplate=urlTemplate.replace("{TileMatrix}","{z}")
            urlTemplate=urlTemplate.replace("{TileRow}","{y}")
            urlTemplate=urlTemplate.replace("{TileCol}","{x}")
            baseLayer = new maptalks.TileLayer(key, {
                urlTemplate : urlTemplate,
                // urlTemplate:'https://t{s}.tianditu.gov.cn/cia_c/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cia&STYLE=default&TILEMATRIXSET=c&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=8018806e15db96c4a9f4f02c9df359e4',
                crs : 'EPSG:3857',
                styles : 'default',
                format: 'image/png',
                transparent : true,
                crossOrigin: "Anonymous",
                layerId:item.id,
                name: item.mapName,
                lonLat: item.lonLat,
                serverType: item.serverType,
                thumbnail: item.thumbnail,
                // param:param,
            });
        }else if(item.serverType=="2") {//tms

        }else if(item.serverType=="3") {//xyz
            baseLayer = new maptalks.TileLayer(key, {
                urlTemplate: item.serverUrl,
                layerId:item.id,
                name: item.mapName,
                lonLat: item.lonLat,
                serverType: item.serverType,
                thumbnail: item.thumbnail,
            })
        }
        if(baseLayer){
            this.bindBaseLayerFilterEvent(baseLayer);
            this.groupLayer.addLayer(baseLayer);
            this.loadBaseLayerNodes();
        }
    }

    removeBaseLayer(id){
        let baseLayer = this.groupLayer.getLayer(id);
        if(baseLayer){
            this.groupLayer.removeLayer(baseLayer);
            this.loadBaseLayerNodes();
        }
    }

    setBaseLayerVisible(id,flag){
        let baseLayer = this.groupLayer.getLayer(id);
        if(baseLayer){
            if(flag) {
                baseLayer.show();
            }else
                baseLayer.hide();
            this.loadBaseLayerNodes();
            console.log(baseLayer)
            console.log(baseLayer.getZIndex())
            console.log(this.groupLayer)
        }
    }
    locationBaseLayer(id){
        let baseLayer = this.groupLayer.getLayer(id);
        if(baseLayer){
            console.log(baseLayer)
            let options = baseLayer.options;
            if(options.lonLat){
                let lonLat = options.lonLat;
                let array = lonLat.split(",");

                this.map.setCameraOrientation({
                    position:array,
                    pitch:0,
                    bearing:0,
                });
            }
        }
    }
    reNameBaseLayer(id,newName) {
        let baseLayer = this.groupLayer.getLayer(id);
        if (baseLayer) {
            let options = baseLayer.options;
            options.name = newName;
        }
    }

    sortBaseLayer(node,direction){
        let geoArr=[];
        this.groupLayer.getLayers().forEach(function (layer){
            if(layer instanceof maptalks.TileLayer && !(layer instanceof GeoJSONVectorTileLayer)){
                geoArr.push(layer);
            }
        })

        let index=geoArr.findIndex((item)=>{
            return item.getId() == node.key;
        });
        if(index == -1) return;

        if(direction=="up"){
            this.moveDown(geoArr,index);
        }else {
            this.moveUp(geoArr,index);
        }
        let _this = this;
        geoArr.forEach(function (layer){
            _this.groupLayer.removeLayer(layer);
        })

        geoArr.forEach(function (layer){
            _this.groupLayer.addLayer(layer);
        })

        this.loadBaseLayerNodes();
    }

    getBaseLayerById(id){
        let baseLayer = this.groupLayer.getLayer(id);
        return baseLayer;
    }

    bindBaseLayerFilterEvent(baseLayer){
        baseLayer.on("renderercreate", function (e) {
            e.renderer.loadTileImage = function (img, url) {
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

            // var gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            // gradient.addColorStop(0, 'white');
            // gradient.addColorStop(1, 'red');
            // ctx.fillStyle = gradient;

            ctx.save();
            if(baseLayer.options.cssFilter==null){
                baseLayer.options.cssFilter="brightness(100%) contrast(100%) saturate(100%) hue-rotate(0deg)";
            }
            ctx.filter = baseLayer.options.cssFilter;
            ctx.drawImage(img, 0, 0);

            if(baseLayer.options.singleColor&&baseLayer.options.singleColor.length>0){
                ctx.globalCompositeOperation = 'multiply';
                ctx.fillStyle = baseLayer.options.singleColor;
                ctx.fillRect(0,0,canvas.width,canvas.height);
            }else {
                ctx.globalCompositeOperation = 'source-over';
            }

            if(baseLayer.options.gamma==null){
                baseLayer.options.gamma=1;
            }
            const imageData = ctx.getImageData(0.0, 0.0, canvas.width, canvas.height);
            const data = imageData.data;

            var gammaVal = baseLayer.options.gamma;
            let gammaCorrection = 1 / gammaVal;
            for (var i = 0; i < data.length; i += 4) {
                data[i] = 255 * Math.pow((data[i] / 255), gammaCorrection);
                data[i+1] = 255 * Math.pow((data[i+1] / 255), gammaCorrection);
                data[i+2] = 255 * Math.pow((data[i+2] / 255), gammaCorrection);
            }
            ctx.putImageData(imageData, 0, 0);
            var dataURL = canvas.toDataURL("image/jpg", 1);
            return dataURL;
        }

    }

    loadGeo3DTilesLayerNodes(){
        let children=[];
        this.groupLayer.getLayers().forEach(function (layer){
            if(layer instanceof Geo3DTilesLayer){
                let json = layer.toJSON();
                json.isShow = "1";
                if(json.options.visible==false)
                    json.isShow = "0";

                json.key = json.id;
                json.layerType = "5";
                json.scopedSlots = {title: "custom"};
                json.title = json.id;
                if(json.options.services[0] && json.options.services[0].resourceName)
                    json.title = json.options.services[0].resourceName;
                json.type = "1";
                json.value = json.id;
                json.weight = 0;

                children.push(json);
            }
        })
        let expandedKeys = this.host.expandedKeys.slice();
        this.host.expandedKeys=[];
        this.host.treeData.forEach(function (node){
            if(node.title=="城市模型") {
                children.forEach(function (json){
                    json.parentId = node.key;
                })
                node.children = children;
                // expandedKeys.push(node.key);
            }
        })
        this.host.expandedKeys=expandedKeys;
        // console.log(this.map.toJSON());
    }

    addGeo3DTilesLayer(item){
        let key = randomUUID();
        let geo3DTilesLayer = new Geo3DTilesLayer(key, {
            services: [{
                url: item.serverUrl,
                id: item.id,
                layerCategoryId: item.layerCategoryId,
                orgName: item.orgName,
                resourceDescribe: item.resourceDescribe,
                resourceId: item.resourceId,
                resourceName: item.resourceName,
                resourceRegDate: item.resourceRegDate,
                resourceType: item.resourceType,
                serverUrl: item.serverUrl,
                tableName: item.tableName,
                thumbnail: item.thumbnail,
            }]
        });
        this.groupLayer.addLayer(geo3DTilesLayer);
        this.loadGeo3DTilesLayerNodes();
        console.log(geo3DTilesLayer)
        console.log(geo3DTilesLayer.toJSON());
    }

    removeGeo3DTilesLayer(id){
        let geo3DTilesLayer = this.groupLayer.getLayer(id);
        if(geo3DTilesLayer){
            this.groupLayer.removeLayer(geo3DTilesLayer);
            this.loadGeo3DTilesLayerNodes();
        }
    }

    setGeo3DTilesLayerVisible(id,flag){
        let geo3DTilesLayer = this.groupLayer.getLayer(id);
        if(geo3DTilesLayer){
            if(flag) {
                geo3DTilesLayer.show();
            }else
                geo3DTilesLayer.hide();
        }
    }
    locationGeo3DTilesLayer(id){
        let geo3DTilesLayer = this.groupLayer.getLayer(id);
        if(geo3DTilesLayer){
            const extent = geo3DTilesLayer.getExtent(0);
            this.map.fitExtent(extent);
        }
    }
    reNameGeo3DTilesLayer(id,newName) {
        let geo3DTilesLayer = this.groupLayer.getLayer(id);
        if (geo3DTilesLayer) {
            let options = geo3DTilesLayer.options;
            options.services[0].resourceName = newName;
        }
    }
    sortGeo3DTilesLayer(node,direction){
        let geoArr=[];
        this.groupLayer.getLayers().forEach(function (layer){
            if(layer instanceof Geo3DTilesLayer){
                geoArr.push(layer);
            }
        })

        let index=geoArr.findIndex((item)=>{
            return item.getId() == node.key;
        });
        if(index == -1) return;

        if(direction=="up"){
            this.moveUp(geoArr,index);
        }else {
            this.moveDown(geoArr,index);
        }
        let _this = this;
        geoArr.forEach(function (layer){
            _this.groupLayer.removeLayer(layer);
        })

        geoArr.forEach(function (layer){
            _this.groupLayer.addLayer(layer);
        })

        this.loadGeo3DTilesLayerNodes();
    }
    getGeo3DTilesLayerById(id){
        let geo3DTilesLayer = this.groupLayer.getLayer(id);
        return geo3DTilesLayer;
    }

    drive(){
        function loadRoads() {
            fetch("./file/road.geojson")
                .then((response) => {
                    return response.json();
                })
                .then((geojson) => {
                    let roads = [];
                    let features = geojson.features;
                    for (let i = 0; i < features.length; i++) {
                        roads.push(features[i].geometry.coordinates);
                    }
                    run(roads);
                });
        }
        loadRoads();

        let symbolArr=[
            {
                url: "/gltf/car/JTGJ_dakeche.glb",
                shadow: true,
                rotationZ: 90,
            },
            {
                url: "/gltf/car/JTGJ_gongjiao.glb",
                shadow: true,
                rotationZ: 90,
            },
            {
                url: "/gltf/car/JTGJ_huoche.glb",
                shadow: true,
                rotationZ: 90,
            },
            {
                url: "/gltf/car/JTGJ_xiaokeche_bai.glb",
                shadow: true,
                rotationZ: 90,
            },
            {
                url: "/gltf/car/JTGJ_xiaokeche_hei.glb",
                shadow: true,
                rotationZ: 90,
            }
        ];

        let _this = this;
        function run(roads){
            for(let i = 0;i<roads.length;i++){
                let route = roads[i];

                function generateUniqueRandomNumbers() {
                    let numbers = [];
                    while(numbers.length < 5) {
                        let randomNumber = Math.floor(Math.random() * 5); // 生成0到4之间的随机整数
                        if (!numbers.includes(randomNumber)) {
                            numbers.push(randomNumber);
                        }
                    }
                    return numbers;
                }
                let nums = generateUniqueRandomNumbers();

                for(let m=0;m<5;m++){
                    task(route,nums[m],m);
                }
            }
        }
        function task(route,count,m){
            let start = route[0];
            let car = new GLTFMarker(
                [start[0],start[1], 1],
                {
                    symbol: symbolArr[count],
                }
            ).addTo(_this.gltfLayer);

            let randomNumber = 60+(m+1)*10;
            let data = formatRouteData(route, {
                duration: 1000 * randomNumber
            });
            let carPlayer = new RoutePlayer(data, {
                repeat:true,
                // showTrail: true,
                // showRoute: true,
                // markerSymbol: {
                //     markerOpacity: 0,
                // },
                // lineSymbol: {
                //     lineColor: "#FFFFFF",
                //     lineWidth: 100,
                // },
            });
            carPlayer.on("playing", (param) => {
                car.setCoordinates(param.coordinate);
                car.updateSymbol({
                    // rotationZ:param.bearing
                    // rotationX: -param.pitch,
                    rotationZ: param.rotationZ+90,
                });
            });
            carPlayer.setUnitTime(1);
            carPlayer.play();
        }
    }

    walk(){
        function loadRoads() {
            fetch("./file/walk.geojson")
                .then((response) => {
                    return response.json();
                })
                .then((geojson) => {
                    let roads = [];
                    let features = geojson.features;
                    for (let i = 0; i < features.length; i++) {
                        roads.push(features[i].geometry.coordinates);
                    }
                    run(roads);
                });
        }
        loadRoads();

        let symbolArr=[
            {
                url: "/gltf/people/RW_nanren_.glb",
                shadow: true,
                rotationZ: 90,
                animation:true,
                loop:true,
            },
            {
                url: "/gltf/people/RW_nvren.glb",
                shadow: true,
                rotationZ: 90,
                animation:true,
                loop:true,
            }
        ];

        let _this = this;

        function run(roads){
            for(let i = 0;i<roads.length;i++){
                let route = roads[i];
                for(let m=0;m<4;m++){
                    task(route,m%2,m);
                }
            }
        }
        function task(route,count,m){

            let start = route[0];
            let car = new GLTFMarker(
                [start[0],start[1], 1],
                {
                    symbol: symbolArr[count],
                }
            ).addTo(_this.gltfLayer);

            // let randomNumber = Math.floor(Math.random() * 41) + 60;
            let randomNumber = 150+(m+1)*10;
            let data = formatRouteData(route, {
                duration: 1000 * randomNumber
            });
            let carPlayer = new RoutePlayer(data, {
                repeat:true,
                // showTrail: true,
                // showRoute: true,
                // markerSymbol: {
                //     markerOpacity: 0,
                // },
                // lineSymbol: {
                //     lineColor: "#FFFFFF",
                //     lineWidth: 100,
                // },
            });
            carPlayer.on("playing", (param) => {
                car.setCoordinates(param.coordinate);
                car.updateSymbol({
                    // rotationZ:param.bearing
                    // rotationX: -param.pitch,
                    rotationZ: param.rotationZ+180,
                });
            });
            carPlayer.setUnitTime(1);
            carPlayer.play();
        }
    }

    AddTrafficScene(roads) {
        const symbols = [
            {
                url: "/gltf/tractor.gltf",
                modelHeight: 500,
                rotationZ: 90,
                shadow: true,
            }
        ];
        let scene = new TrafficScene();
        scene.setSymbols(symbols);
        scene.carsNumber = 500;
        scene.gridSize = 64;
        scene.addTo(this.groupLayer);
        scene.generateTraffic(roads);
        scene.run();
    }

    runTrafficScene(){
        const roads = [];
        let _this = this;
        function loadRoads() {
            fetch("./file/road.geojson")
                .then((response) => {
                    return response.json();
                })
                .then((geojson) => {
                    let features = geojson.features;
                    for (let i = 0; i < features.length; i++) {
                        roads.push(features[i].geometry.coordinates);
                    }
                    _this.AddTrafficScene(roads);
                });
        }
        loadRoads();
    }

    videoLogin(){
        // let ip = "http://10.111.13.103:8081";
        let ip = "http://192.168.201.166";
        let loginUrl = ip+"/backend/auth/login";
        let params = {username:"znjq",password:"96d0856123a2f5211314ded5e790b079",grant_type:"password",code: "1"}
        let _this = this;
        fetch(loginUrl,{
            method:"post",
            mode:'cors',
            body:JSON.stringify(params),
            headers:{
                'Content-Type':'application/json',
                'Authorization':'Basic aW9jLXBjOmlvYy1zZWNyZXQtcGM=',
                'Access-Control-Allow-Origin':"*"
            }
        }).then((res)=>res.json)
        .then(data=>{
            console.log(data);
            let body = data.body;
            _this.access_token = body.access_token
        })
    }

    async getVideoUrl(token,deviceId){
        // let ip = "http://10.111.13.103:8081";
        let ip = "http://192.168.201.166";
        let getVideoUrl = ip+"/backend/video/operating/start?deviceId="+deviceId;
        let options= {
            method:"get",
            headers:{
                'Content-Type':'application/json',
                'Authorization':token
            }
        }
        let responseFetch  = await fetch(getVideoUrl,options);
        if(responseFetch.ok===true) {
            let data = await responseFetch.json();
            console.log(data);
        }
    }
    
    createBuildingInfoWindow(properties){
      let windowTitle = properties.name || properties.modelName;
      let infoObj1 = [{
        key: '1',
        title: '入住企业数',
        value: properties['企业数'] ? properties['企业数'].replace('家', '') : '', 
        suffix: '家',
        icon: require('@/assets/SceneConstruction/rzqys.png')
      },
      {
        key: '2',
        title: '建筑类型',
        value: properties['建筑类型'] ? properties['建筑类型'] : '',
        suffix: '',
        icon: require('@/assets/SceneConstruction/jzlx.png')
      },
      {
        key: '3',
        title: '建成时间',
        value: properties['建成时间'] ? properties['建成时间'].replace('年', '') : '', 
        suffix: '年',
        icon: require('@/assets/SceneConstruction/jcsj.png')
      }]

      let infoObj2 = [{
        key: '1',
        title: '总高度',
        value: properties['总高度'] ? properties['总高度'].replace('米', '') : '', 
        suffix:'m',
        icon:require('@/assets/SceneConstruction/zgd.png')
      },
      { 
        key: '2',
        title: '总楼层',
        value: properties['总层数'] ? properties['总层数'].replace('层', '') : '', 
        suffix: '层',
        icon: require('@/assets/SceneConstruction/zlc.png')
      },
      {
        key: '3',
        title: '建筑面积',
        value: properties['总面积'] ? properties['总面积'].replace('平方米', '') : '', 
        suffix: 'm²',
        icon: require('@/assets/SceneConstruction/jzmj.png')
      }]
      let Profile = Vue.extend({
        template: `<div class="build-info-content">
          <ul class="major-content">
            <li class="major-content-li" v-for="item in majorList" :key="item.key">
              <div class="major-content-title"><img :src="item.icon"/><span>{{item.title}}</span></div>
              <div class="major-content-text">{{item.value}}<span class="suffix" v-if="item.value !=''">{{item.suffix}}</span></div>
            </li>
          </ul>
          <ul class="minor-content">
            <li class="minor-content-li" v-for="item in minorList" :key="item.key">
              <div class="minor-content-text">{{item.value}}<span class="suffix" v-if="item.value !=''">{{item.suffix}}</span></div>
              <div class="minor-content-title"><img :src="item.icon"/><span>{{item.title}}</span></div>
            </li>
          </ul>
        </div>`,
        data: function () {
          return {
            majorList : infoObj1,
            minorList: infoObj2
          }
        }
      });
      const profile = new Profile().$mount();
      return{
        title: windowTitle,
        content: profile.$el
      }
    }

    setGlobeEffect(options){
        // let config = this.groupLayer.getSceneConfig();
        // console.log(config)
        // var result = Object.assign({},config)
        // result.postProcess.enable = true;
        // result.postProcess.bloom.enable = true;
        // result.postProcess.ssr={
        //                         enable:true
        //                     }
        // result.postProcess.antialias={
        //                         enable:true
        //                     }
        // result.postProcess.sharpen={
        //                         enable:true
        //                     }
        // result.environment.enable = true;
        // result.environment.brightness = 1;
        // result.shadow.enable = true;
        // result.ground.enable = false;
        const sceneConfig = {
            environment: {
                enable: true,                                   // 是否开启环境天空盒绘制
                mode: 1,                                        // 天空盒模式： 0: 氛围模式， 1: 实景模式
                level: 0,                                       // 实景模式下的模糊级别，0-3
                brightness: 1                                   // 天空盒的明亮度，-1 - 1， 默认为0
            },
            shadow: {
                type: 'esm',                                    // 阴影模式，固定为esm
                enable: true,                                   // 是否开启
                quality: 'high',                                // 阴影质量，可选的值：high, medium, low
                opacity: 1,                                     // 阴影的透明度，0 - 1
                color: [0, 0, 0],                               // 阴影的颜色，归一化三位rgb颜色值
                blurOffset: 1                                   // 阴影模糊偏移量，值越高阴影越模糊
            },
            ground: {
                enable: false,                                   // 是否开启地面绘制
                // renderPlugin: {                                 // 地面的绘制插件，取值范围 lit 或者 fill
                //     type: 'lit'
                // },
                // symbol: {
                //     ssr: true,                                    // 是否开启ssr，屏幕空间反射
                //     material: litMaterial,                        // 如果绘制插件为lit，设置pbr材质
                //     polygonFill: [1, 1, 1, 1],                    // 四位归一化颜色值
                //     polygonOpacity: 1                             // 透明度 0-1
                // }
            },
            postProcess: {
                enable: true,                                   // 是否开启后处理
                antialias: {
                    enable: true,                                 // 是否开启FXAA后处理
                    taa: true                                     // 是否开启taa后处理
                },
                ssr: {
                    enable: true                                  // 是否开启屏幕空间反射
                },
                ssao: {
                    enable: true,                                 // 是否开启屏幕空间环境光遮蔽
                    bias: 0.03,                                   // 阴影偏移值，越大，阴影就越清晰，0.05 - 1
                    radius: 0.08,                                 // 遮蔽半径，越大，阴影就越清晰， 0.05 - 1
                    intensity: 1.5                                // 强度因子， 0.1 - 5
                },
                sharpen: {
                    enable: true,                                // 是否开启锐化
                    factor: 0.2                                   // 强度因子，0 - 1
                },
                bloom: {
                    enable: true,                                 // 是否开启泛光
                    factor: 1,                                    // 强度因子 0.1 - 5
                    threshold: 0,                                 // 最小阈值（亮度低于阈值的区域不发光） 0 - 1
                    radius: 1                                     // 泛光半径 0.1 - 4
                },
                outline: {
                    enable: true                                  // 是否开启高亮后处理
                }
            }
        };
        this.groupLayer.setSceneConfig(sceneConfig)

        this.map.options.lights.directional = {
            "color": [1, 1, 1],
        }

        // this.map.setOptions(options)
        // result.postProcess.bloom.enable = !result.postProcess.bloom.enable;
        // if(result.postProcess.bloom.enable){
            // result.postProcess.bloom.factor=3;
            // result.postProcess.bloom.threshold=0.7;
            // result.postProcess.bloom.radius=1;
        // }else {
            // result.postProcess.bloom.factor=1;
            // result.postProcess.bloom.threshold=0;
            // result.postProcess.bloom.radius=1;
        // }

        // config.environment.enable = !config.environment.enable ;
        // result.environment.enable = true

        // if(result.postProcess.ssr) {//是否开启屏幕空间反射
        //     result.postProcess.ssr.enable = !result.postProcess.ssr.enable;
        // }else {
        //     result.postProcess.ssr={
        //         enable:true
        //     }
        // }

        // if(result.postProcess.antialias) {//抗锯齿
        //     result.postProcess.antialias.enable = !result.postProcess.antialias.enable;
        // }else {
        //     result.postProcess.antialias={
        //         enable:true
        //     }
        // }
        // if(result.postProcess.sharpen) {//否开启锐化
        //     result.postProcess.sharpen.enable = !result.postProcess.sharpen.enable;
        // }else {
        //     result.postProcess.sharpen={
        //         enable:true
        //     }
        // }
        // if(result.postProcess.ssao) {//是否开启屏幕空间环境光遮蔽
        //     result.postProcess.ssao.enable = !result.postProcess.ssao.enable;
        // }else {
        //     result.postProcess.ssao={
        //         enable:true
        //     }
        // }


        // if(config.environment.mode ==1)
        //     config.environment.mode = 0;
        // else
        //     config.environment.mode = 1;
        // config.environment.brightness = 0.5;

        // config.shadow.enable = !config.shadow.enable ;
        // config.ground.enable = true ;
        // config.shadow.color = [0,0,1]
        // this.groupLayer.setSceneConfig(result)
    }

}
export default Viewer