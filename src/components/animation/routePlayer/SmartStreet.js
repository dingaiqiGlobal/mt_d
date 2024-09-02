import * as maptalks from 'maptalks';
import {RoutePlayer,formatRouteData} from 'maptalks.routeplayer';
import {GLTFMarker} from '@maptalks/gl-layers';
import "@maptalks/transcoders.draco";
import "@maptalks/transcoders.crn";
import "@maptalks/transcoders.ktx2";
import { ThreeLayer } from 'maptalks.three';
import * as THREE from "three";
import Circle from "./Circle"
import flvjs from "flv.js";
import PropertyList from '@/views/TwinSceneConstruction/PropertyList.vue';
import LayeredDisplay from '@/views/TwinSceneConstruction/LayeredDisplay.vue';
import UIMarkerLayer from "./UIMarkerLayer";
import SVGA from "svgaplayerweb";
/**
 * 智慧街区
 */
class SmartStreet{
    constructor(viewer, options) {
        this.viewer = viewer;
        this.host = options.host;
        this.carPlayer = null;
        this.trafficAudio = null;
        this.init();
        this.circles =null;
        this.addCircle();
        this.addRedGreenLight();
        // let _this=this;
        // setTimeout(function (){
        //     _this.drive();
        // },8000)
    }

    addCircle(){
        let _this= this;
        this.threeLayer = new ThreeLayer('t', {
            forceRenderOnMoving: true,
            forceRenderOnRotating: true,
            // animation: true
        });

        this.threeLayer.prepareToDraw = function (gl, scene, camera) {
            var light = new THREE.AmbientLight(0xffffff,3);
            // var light = new THREE.DirectionalLight(0xffffff);
            // light.position.set(0, -10, 10).normalize();
            scene.add(light);
            addCircles();
            _this.threeLayer.config('animation', true);
        };

        this.viewer.groupLayer.addLayer(this.threeLayer);

        var SIZE = 512;
        var canvas = document.createElement('canvas');
        canvas.width = canvas.height = SIZE;
        var ctx = canvas.getContext('2d');
        var color = "#FF0000";
        var material;
        function getMaterial(fontSize, text, fillColor) {
            ctx.clearRect(0, 0, SIZE, SIZE);
            ctx.save();

            ctx.beginPath();
            ctx.fillStyle = fillColor
            ctx.arc(SIZE / 2, SIZE / 2, 60, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = fillColor
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.arc(SIZE / 2, SIZE / 2, 120, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();

            ctx.shadowColor = '#fff';
            ctx.shadowBlur = 1;
            ctx.beginPath();
            ctx.arc(SIZE / 2, SIZE / 2, 200, 0, Math.PI * 2);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();

            if (!material) {
                var texture = new THREE.Texture(canvas);
                texture.needsUpdate = true; //使用贴图时进行更新
                material = new THREE.MeshPhongMaterial({
                    map: texture,
                    // side: THREE.DoubleSide,
                    transparent: true
                });
            } else {
                material.map.needsUpdate = true;
            }
            return material;
        }


        function addCircles() {
            var lnglats = [
                [116.31004363399687, 39.99088747105715]
            ];
            var text = Math.round(Math.random() * 10000);
            var material = getMaterial(70, text, color);
            _this.circles = lnglats.map(function (lnglat) {
                var circle = new Circle(lnglat, {
                    radius: 4
                }, material, _this.threeLayer);

                return circle;
            });
            _this.threeLayer.addMesh(_this.circles);
            _this.threeLayer.hide();
        }

    }

    init(){
        let _this = this;
        this.viewer.map.on("click", (e) => {
            const identifyData = e.coordinate ?
                _this.viewer.groupLayer.identify(e.coordinate, {
                    layers: [_this.viewer.gltfLayer],
                    orderByCamera: true,
                })[0] :
                _this.viewer.groupLayer.identifyAtPoint(e.containerPoint, {
                    layers: [_this.viewer.gltfLayer],
                    orderByCamera: true,
                })[0];
            const target = identifyData && identifyData.data;
            if (target && target instanceof GLTFMarker) {
                if(target.properties && target.properties.smartStreet=="ludeng"){
                    target.removeInfoWindow();
                    if(_this.uiMarker)
                        _this.uiMarker.remove();
                    
                    var BtnProfile = Vue.extend({
                      template: `<div class="btn-profile" style="">
                        <ul class="btn-group">
                          <li class="btn-item" @click="streetExplain">街区讲解</li>
                          <li class="btn-item" @click="videoTraceBack">视频追溯</li>
                          <li class="btn-item" @click="orderGuide">秩序导览</li>
                          <li class="btn-item" @click="modelEnquiry">AI模型问询</li>
                        </ul>
                      </div>`,
                      data: function () {
                        return {}
                      },
                      methods:{
                        streetExplain(){
                            this.createUiMarker2('1');
                        },
                        videoTraceBack(){
                            this.createUiMarker2('2');
                        },
                        orderGuide(){
                            this.createUiMarker2('3');
                        },
                        modelEnquiry(){
                            this.createUiMarker2('4');
                        },
                        createUiMarker2(flag){
                          if(_this.uiMarker2)
                            _this.uiMarker2.remove();
                          var uiMarker2Obj = null;
                          switch(flag){
                            case '1':
                              uiMarker2Obj = _this.createUiMarkerWindow('街区讲解');  
                              break;
                            case '2':
                              uiMarker2Obj = _this.createUiMarkerWindow('视频追溯');
                                setTimeout(function (){
                                    if(_this.flvPlayer){
                                        _this.flvPlayer.pause()
                                        _this.flvPlayer.unload()
                                        _this.flvPlayer.detachMediaElement()
                                        _this.flvPlayer.destroy()
                                        _this.flvPlayer = null
                                    }
                                    if (flvjs.isSupported()) {
                                        let vurl = "http://192.168.201.82:80/rtp/34020020211108155018_34020020211108155018.live.flv";
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
                              break;
                            case '3':
                              uiMarker2Obj = _this.createUiMarkerWindow('秩序导览');  
                              break;
                            case '4':
                              uiMarker2Obj = _this.createUiMarkerWindow('AI模型问询(智谱华章模型算法)');  
                              break;
                          }
                          _this.uiMarker2 = new maptalks.ui.UIMarker(target.getCoordinates(), {
                            containerClass: "ContentUIMarker",//css类名
                              horizontalAlignment:'right',
                              verticalAlignment: 'top',
                              // draggable : true,
                              dx:140,
                              dy:-100,
                              content: uiMarker2Obj,
                              eventsPropagation: false,
                          });
                          _this.uiMarker2.addTo(_this.viewer.map);
                        }
                      }
                  })
                  const btn_profile = new BtnProfile().$mount();
                  _this.uiMarker = new maptalks.ui.UIMarker(target.getCoordinates(), {
                      containerClass: "ButtonGroupUIMarker",//css类名
                      horizontalAlignment:'right',
                      verticalAlignment: 'top',
                      // draggable : true,
                      dy:-100,
                      content: btn_profile.$el,
                      eventsPropagation: false,
                  });
                  _this.uiMarker.addTo(_this.viewer.map);
                }else{
                    if(_this.uiMarker)
                        _this.uiMarker.remove();
                    if(_this.uiMarker2)
                        _this.uiMarker2.remove();
                }
            }else{
                if(_this.uiMarker)
                    _this.uiMarker.remove();
                if(_this.uiMarker2)
                    _this.uiMarker2.remove();
            }
        });

        this.bindGltfInfoWindow();
        this.setGlobeEffect();
        this.bindEnergyInfoMarker();
    }

    bindGltfInfoWindow(){
        let _this = this;
        this.viewer.gltfLayer.forEach(function (gltf){
            let json = gltf.toJSON();

            if(json.options.properties && json.options.properties.name && json.options.properties.name=="噪音监测屏"){
                let infoWindowObj = _this.createInfoWindow('噪音监测屏',"click");
                gltf.setInfoWindow({
                    autoPan:false,
                    title: infoWindowObj.title,
                    content: infoWindowObj.content 
                });
                // gltf.setInfoWindow({
                //     autoPan: false,
                //     title: "信息",
                //     content: "<div><div>信息</div><div>噪音监测屏信息</div></div>"
                // });
            }
            if(json.options.properties && json.options.properties.name && json.options.properties.name=="公安井盖"){
                let infoWindowObj = _this.createInfoWindow('公安井盖',"click");
                gltf.setInfoWindow({
                    autoPan:false,
                    title: infoWindowObj.title,
                    content: infoWindowObj.content 
                });
                // gltf.setInfoWindow({
                //     autoPan: false,
                //     title: "信息",
                //     content: "<div><div>信息</div><div>公安井盖信息</div></div>"
                // });
            }
            if(json.options.properties && json.options.properties.name && json.options.properties.name=="交通路灯"){
                let infoWindowObj = _this.createInfoWindow('交通路灯',"click");
                gltf.setInfoWindow({
                    autoPan:false,
                    title: infoWindowObj.title,
                    content: infoWindowObj.content 
                });
                // gltf.setInfoWindow({
                //     autoPan: false,
                //     title: "信息",
                //     content: "<div><div>信息</div><div>交通路灯信息</div></div>"
                // });
            }

            if(json.options.properties && json.options.properties.name && json.options.properties.name=="市政井盖"){
                let infoWindowObj = _this.createInfoWindow('市政井盖',"click");
                gltf.setInfoWindow({
                    autoPan:false,
                    title: infoWindowObj.title,
                    content: infoWindowObj.content 
                });
                // gltf.setInfoWindow({
                //     autoPan: false,
                //     title: "信息",
                //     content: "<div><div>信息</div><div>市政井盖信息</div></div>"
                // });
            }
            if(json.options.properties && json.options.properties.modelName=="中鼎大厦"){

                let properties = json.options.properties;
                if(!properties) return;
                let infoWindowObj = _this.createBuildingInfoWindow(properties);
                gltf.setInfoWindow({
                    title: infoWindowObj.title || "信息",
                    content: infoWindowObj.content || '<div>'+json.options.properties.name+'</div>'
                });

                // let energyInfoMarker = 
            }
            // if(json.options.properties.smartStreet==""){
            //     let properties = json.options.properties;
            //     if(!properties) return;
            //     let infoWindowObj = _this.viewer.createBuildingInfoWindow(properties);
            //     gltf.setInfoWindow({
            //         title: infoWindowObj.title || "信息",
            //         content: infoWindowObj.content || '<div>'+json.options.properties.name+'</div>'
            //     });
            // }else {
            //     gltf.setInfoWindow({
            //         title: "信息",
            //         content: '<div>'+json.options.properties.name+'</div>'
            //     });
            // }

            /**
            if(json.options.properties.modelName=="监控电子眼"){
                gltf.setInfoWindow({
                    title: "视频监控",
                    content: '<div class="info-content"><video width="100%" height="auto" id="my-video" controls muted src=""></video></div>'
                });
            }else if(json.options.properties.modelName=="中鼎大厦"){

                let properties = json.options.properties;
                if(!properties) return;
                let infoWindowObj = _this.viewer.createBuildingInfoWindow(properties);
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
             **/
        })
    }
    bindEnergyInfoMarker(){
      this.outputUiMarkerLayer = new UIMarkerLayer().addTo(this.viewer.map);
      this.waterUiMarkerLayer = new UIMarkerLayer().addTo(this.viewer.map);
      this.powerUiMarkerLayer = new UIMarkerLayer().addTo(this.viewer.map);
      fetch("./file/energy.geojson")
      .then((response) => {
        return response.json();
      })
      .then((geojson) => {
        let features = geojson.features;
        if(!features.length) return;
        let _this = this;
        features.forEach(function (point){
          let properties = point.properties;
          let coordinates = point.geometry.coordinates;
          let coordinate = coordinates && coordinates.length == 3 ? {
            x: coordinates[0],
            y: coordinates[1],
            z: coordinates[2],
          } : null;
          if(properties){
            let energyInfoObj1 = _this.createEnergyInfoMarker(properties,1);
            if(energyInfoObj1.content){
              let uiMarker1 = new maptalks.ui.UIMarker(coordinate, {
                containerClass: "OutputUIMarker",//css类名
                single: false,//false为全局单个标记
                content: energyInfoObj1.content,
                horizontalAlignment:'center',
                verticalAlignment: 'top',
                dx:25,
                dy:-90,
                eventsPropagation: false,//是否停止所有事件的传播（事件冒泡）
              });
              _this.outputUiMarkerLayer.addMarker(uiMarker1);
            }
            let energyInfoObj2 = _this.createEnergyInfoMarker(properties,2);
            if(energyInfoObj2.content){
              let uiMarker2 = new maptalks.ui.UIMarker(coordinate, {
                containerClass: "WaterUIMarker",//css类名
                single: false,//false为全局单个标记
                content: energyInfoObj2.content,
                horizontalAlignment:'left',
                verticalAlignment: 'top',
                dx:0,
                dy:-20,
                eventsPropagation: false,//是否停止所有事件的传播（事件冒泡）
              });
              _this.waterUiMarkerLayer.addMarker(uiMarker2);
            }
            let energyInfoObj3 = _this.createEnergyInfoMarker(properties,3);
            if(energyInfoObj3.content){
              let uiMarker3 = new maptalks.ui.UIMarker(coordinate, {
                containerClass: "PowerUIMarker",//css类名
                single: false,//false为全局单个标记
                content: energyInfoObj3.content,
                horizontalAlignment:'right',
                verticalAlignment: 'top',
                dx:10,
                dy:0,
                eventsPropagation: false,//是否停止所有事件的传播（事件冒泡）
              });
              _this.powerUiMarkerLayer.addMarker(uiMarker3);
            }
          }
        })
        //设置最小可视缩放等级为18级，默认只展示产值
        this.outputUiMarkerLayer.setMinZoom(17);
        this.waterUiMarkerLayer.setMinZoom(17).hide();
        this.powerUiMarkerLayer.setMinZoom(17).hide();
      });
    }
    /**
     * 设置街区场景效果
     */
    setGlobeEffect(){
        const sceneConfig = {
            environment: {
                enable: true,                                   // 是否开启环境天空盒绘制
                mode: 1,                                        // 天空盒模式： 0: 氛围模式， 1: 实景模式
                level: 0,                                       // 实景模式下的模糊级别，0-3
                brightness: 1                                  // 天空盒的明亮度，-1 - 1， 默认为0
            },
            shadow: {
                type: 'esm',                                    // 阴影模式，固定为esm
                enable: true,                                   // 是否开启
                quality: 'medium',                                // 阴影质量，可选的值：high, medium, low
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
                    factor: 0.3                                   // 强度因子，0 - 1
                },
                bloom: {
                    enable: true,                                 // 是否开启泛光
                    factor: 0.8,                                    // 强度因子 0.1 - 5
                    threshold: 0.7,                                 // 最小阈值（亮度低于阈值的区域不发光） 0 - 1
                    radius: 0.4                                    // 泛光半径 0.1 - 4
                },
                outline: {
                    enable: true                                  // 是否开启高亮后处理
                }
            }
        };
        this.viewer.groupLayer.setSceneConfig(sceneConfig)
        this.viewer.map.options.lights.directional = {
            "color": [1, 1, 1],
        }
        //
        // this.viewer.map.options.lights = {
        //     "ambient":  {
        //     "color": [0.1, 0, 0],
        //         "resource":  {
        //         "url":  {
        //             "front":  "/skybox/daytime/posz.jpg",
        //                 "back":  "/skybox/daytime/negz.jpg",
        //                 "left":  "/skybox/daytime/negx.jpg",
        //                 "right":  "/skybox/daytime/posx.jpg",
        //                 "top":  "/skybox/daytime/posy.jpg",
        //                 "bottom":  "/skybox/daytime/negy.jpg"
        //         },
        //         "prefilterCubeSize":  1024
        //     },
        //     "exposure":  0.8,
        //         "hsv": [0, 0, 0],
        //         "orientation":  1
        //     },
        //     "directional":  {
        //     //"direction": [1, 0, -1],
        //     "color": [1, 1, 1],
        //     }
        // }
    }

    /**
     * 交通违规
     */
    trafficViolation(){
        this.host.isShowKeyBuildings = false;
        this.host.handleIsShowKeyBuildingsChange();

        //初始化超速
        if(this.overSpeedPlayer==null){
            this.carOverSpeed();
        }
        //初始化违规调头
        if(this.turnAroundPlayer==null){
            this.carTurnAround();
        }
        //初始化女人行走
        if(this.womenPlayer==null){
            this.womenWalk();
        }else {
            this.womenPlayer.reset();
        }

        function loadRoads() {
            fetch("./file/road.geojson")
                .then((response) => {
                    return response.json();
                })
                .then((geojson) => {
                    let features = geojson.features;
                    let road = features[0].geometry.coordinates;
                    task(road[0]);
                });
        }
        loadRoads();

        let symbolArr=[
            {
                url: "/gltf/car/JTGJ_xiaokeche_bai.glb",
                shadow: true,
                rotationZ: 90,
                // animationName:""
                loop:true,
                animation:true,
                bloom:true,
            }
        ];
        let _this = this;
        function task(route){
            for(let i=0;i<route.length;i++){
                if(i>18){
                    route[i] = [route[i][0],route[i][1],3.6];
                }else
                    route[i] = [route[i][0],route[i][1],2.8];
            }
            let start = route[0];
            let car = new GLTFMarker(
                [start[0],start[1], 1],
                {
                    symbol: symbolArr[0],
                }
            ).addTo(_this.viewer.gltfLayer);

            let randomNumber = 100;
            // let randomNumber = 25;
            let data = formatRouteData(route, {
                duration: 1000 * randomNumber
            });
            _this.carPlayer = new RoutePlayer(data, {
                // repeat:true,
                showTrail: true,
            });

            _this.carPlayer.on("playstart", (param) => {
                car.removeInfoWindow();
                _this.threeLayer.hide();
                //重置位置
                _this.carTurnAroundGltfMarker.setCoordinates([ 116.330201189178595, 39.99145275744754, 2.8 ]);
                _this.carOverSpeedGltfMarker.setCoordinates([ 116.321441823752366, 39.991231618096698, 2.8 ]);
                _this.womenMarker.setCoordinates([ 116.33219641883062, 39.990168638252896, 3.6 ]);
                _this.womenMarker.hide();
                _this.redLight1.show();
                _this.redLight2.show();
            })
            _this.carPlayer.on('playend', e => {
                _this.overSpeedPlayer.reset();
                _this.turnAroundPlayer.reset();

                car.closeInfoWindow();
            });
            _this.carPlayer.on("playing", (param) => {
                car.setCoordinates(param.coordinate);
                car.updateSymbol({
                    rotationZ: param.rotationZ+90,
                });

                //暂停 5s
                if(param.coordinate[0]==start[0] && param.coordinate[1]==start[1]){
                    _this.carPlayer.pause();
                    setTimeout(function () {
                        _this.carPlayer.play();

                        //播放语音
                        _this.trafficAudio = null;
                        _this.trafficAudio = new Audio(require('@/assets/smartStreet/开始车辆行驶.wav'));
                        _this.trafficAudio.play();
                        //语音播放，车主您好，城市交通大脑提醒您，您已进入街区智能交通智导模式，请按交通引导行驶
                        _this.host.aiPersonPopup(2,true);
                    },5*1000)
                }

                let signLightStart = route[1];//路口信号灯
                let signLight = route[2];//路口信号灯前 变灯

                let csStart = route[5];//故障车辆
                let csMid = route[6];//故障车辆
                let csEnd = route[8];

                let comfortDrive = route[10];//语音提示:您已进入舒适驾驶区域，可开启辅助驾驶模式弹窗视频双手离开方向盘。
                let comfortDriveEnd = route[12];
                let dtStart = route[14];//违规调头

                let parkTip = route[17];//停车提示信息
                let parkPlace = route[22];//停车共享车位
                let parkAuto = route[24];//自动停车

                if(param.coordinate[0]==signLightStart[0] && param.coordinate[1]==signLightStart[1]){
                    //播放语音
                    _this.trafficAudio = null;
                    _this.trafficAudio = new Audio(require('@/assets/smartStreet/信号灯前的语音.wav'));
                    _this.trafficAudio.play();
                    _this.host.aiPersonPopup(3,true);
                    setTimeout(function () {
                      _this.host.aiPersonPopup(3,false);
                    },10*1000)
                }

                if(param.coordinate[0]==signLight[0] && param.coordinate[1]==signLight[1]){

                    _this.redLight1.hide();
                    _this.redLight2.hide();
                }

                if(param.coordinate[0]==comfortDrive[0] && param.coordinate[1]==comfortDrive[1]){
                    //播放语音
                    _this.trafficAudio = null;
                    _this.trafficAudio = new Audio(require('@/assets/smartStreet/舒适驾驶模式.wav'));
                    _this.trafficAudio.play();
                    _this.host.aiPersonPopup(5,true);
                    
                    let infoWindowObj = _this.createVideoWindow('舒适驾驶模式');
                    car.setInfoWindow({
                      autoPan:false,
                      title: infoWindowObj.title,
                      content: infoWindowObj.content 
                    });
                    car.openInfoWindow();
                }
                if(param.coordinate[0]==comfortDriveEnd[0] && param.coordinate[1]==comfortDriveEnd[1]){
                    car.closeInfoWindow();
                    _this.host.aiPersonPopup(5,false);
                }

                if(param.coordinate[0]==dtStart[0] && param.coordinate[1]==dtStart[1]){
                    _this.turnAroundPlayer.play();
                }

                if(param.coordinate[0]==csStart[0] && param.coordinate[1]==csStart[1]){
                    _this.overSpeedPlayer.play();
                    // car.setInfoWindow({
                    //     autoPan: false,
                    //     title: "故障预警",
                    //     content: "<div><div>sos闪烁</div><div>sos闪烁</div></div>"
                    // });
                    // car.openInfoWindow();

                    _this.host.svgaFlage = true;
                    _this.host.handleBlue()
                    setTimeout(function (){
                        _this.host.handleSvgaSso()
                    },500)
                    setTimeout(function (){
                        _this.host.handleYellow()
                    },1000)
                }

                if(param.coordinate[0]==csEnd[0] && param.coordinate[1]==csEnd[1]){
                    car.closeInfoWindow();
                    _this.threeLayer.hide();
                    _this.host.svgaFlage = false;
                    _this.host.aiPersonPopup(4,false);

                }
                if(param.coordinate[0]==csMid[0] && param.coordinate[1]==csMid[1]){
                    let infoWindowObj = _this.createInfoWindow('交管紧急提示');
                    car.setInfoWindow({
                      autoPan:false,
                      title: infoWindowObj.title,
                      content: infoWindowObj.content
                    });
                    car.openInfoWindow();
                    _this.host.aiPersonPopup(4,true);
                }

                if(param.coordinate[0]==parkTip[0] && param.coordinate[1]==parkTip[1]){
                    let infoWindowObj = _this.createInfoWindow('实时播报');
                    car.setInfoWindow({
                        autoPan:false,
                        title: infoWindowObj.title,
                        content: infoWindowObj.content
                    });
                    car.openInfoWindow();
                    _this.host.aiPersonPopup(7,true);
                    setTimeout(function () {
                      _this.host.aiPersonPopup(7,false);
                    },10*1000)
                }
                if(param.coordinate[0]==parkPlace[0] && param.coordinate[1]==parkPlace[1]){
                    let infoWindowObj = _this.createInfoWindow('共享车位');
                    car.setInfoWindow({
                        autoPan:false,
                        title: infoWindowObj.title,
                        content: infoWindowObj.content
                    });
                    car.openInfoWindow();
                }
                if(param.coordinate[0]==parkAuto[0] && param.coordinate[1]==parkAuto[1]){
                    let infoWindowObj = _this.createInfoWindow('自动泊车');
                    car.setInfoWindow({
                        autoPan:false,
                        title: infoWindowObj.title,
                        content: infoWindowObj.content
                    });
                    car.openInfoWindow();
                    _this.carPlayer.pause();
                    _this.womenMarker.show();
                    _this.womenPlayer.reset();
                    _this.womenPlayer.play();
                    setTimeout(function () {
                        _this.carPlayer.play();
                    },3*1000)
                }

                let position = [param.coordinate[0],param.coordinate[1],14];

                _this.viewer.map.setCameraOrientation({
                    position: position,
                    pitch: 80,
                    bearing: 90,
                });
            });
            _this.carPlayer.setUnitTime(1);
            _this.carPlayer.play();
        }
    }
    trafficViolationBak(){
        //初始化占道违规
        if(this.wrongRoadPlayer==null){
            this.carWrongRoad();
        }
        //初始化闯红灯
        if(this.redLightPlayer==null){
            this.carRedLight();
        }

        //初始化超速
        if(this.overSpeedPlayer==null){
            this.carOverSpeed();
        }

        //初始化违规调头
        if(this.turnAroundPlayer==null){
            this.carTurnAround();
        }

        function loadRoads() {
            fetch("./file/road.geojson")
                .then((response) => {
                    return response.json();
                })
                .then((geojson) => {
                    let features = geojson.features;
                    let road = features[0].geometry.coordinates;
                    task(road[0]);
                });
        }
        loadRoads();

        let symbolArr=[
            {
                url: "/gltf/car/JTGJ_xiaokeche_bai.glb",
                shadow: true,
                rotationZ: 90,
                // animationName:""
                loop:true,
                animation:true,
                bloom:true,
            }
        ];
        let _this = this;
        function task(route){
            for(let i=0;i<route.length;i++){
                if(i>20){
                    route[i] = [route[i][0],route[i][1],3.4];
                }else
                    route[i] = [route[i][0],route[i][1],2.8];
            }
            let start = route[0];
            let car = new GLTFMarker(
                [start[0],start[1], 1],
                {
                    symbol: symbolArr[0],
                }
            ).addTo(_this.viewer.gltfLayer);

            let randomNumber = 100;
            // let randomNumber = 25;
            let data = formatRouteData(route, {
                duration: 1000 * randomNumber
            });
            _this.carPlayer = new RoutePlayer(data, {
                // repeat:true,
                showTrail: true,
                // showRoute: true,
                // markerSymbol: {
                //     markerOpacity: 0,
                // },
                // lineSymbol: {
                //     lineColor: "#FFFFFF",
                //     lineWidth: 100,
                // },
            });
            let womenSymbol=
                {
                    url: "/gltf/people/RW_nvren.glb",
                    shadow: true,
                    rotationZ: 0,
                    animation:true,
                    loop:true,
                    // animationName:""
                    bloom:true,
                };
            let womenPosition = route[26];//自动停车
            let women = new GLTFMarker(
                [womenPosition[0]-0.00003,womenPosition[1], 3.4],
                {
                    symbol: womenSymbol,
                }
            ).addTo(_this.viewer.gltfLayer);


            _this.carPlayer.on("playstart", (param) => {
                car.removeInfoWindow();
                _this.threeLayer.hide();
                //重置位置
                _this.carWrongRoadGltfMarker.setCoordinates([ 116.328848665269624, 39.99137052379172, 2.8 ]);
                _this.carRedLightGltfMarker.setCoordinates([ 116.326400903602703, 39.991315185641053, 2.8 ]);
                _this.carOverSpeedGltfMarker.setCoordinates([ 116.321441823752366, 39.991231618096698, 2.8 ]);
                _this.carTurnAroundGltfMarker.setCoordinates([ 116.330201189178595, 39.99145275744754, 2.8 ]);
                women.hide();
            })
            _this.carPlayer.on('playend', e => {
                _this.wrongRoadPlayer.reset();
                _this.redLightPlayer.reset();
                _this.overSpeedPlayer.reset();
                _this.turnAroundPlayer.reset();
                car.closeInfoWindow();
            });
            _this.carPlayer.on("playing", (param) => {
                car.setCoordinates(param.coordinate);
                car.updateSymbol({
                    // rotationZ:param.bearing
                    // rotationX: -param.pitch,
                    rotationZ: param.rotationZ+90,
                });
                // _this.circles[0].setPosition(param.coordinate);

                if(param.coordinate[0]==start[0] && param.coordinate[1]==start[1]){
                    _this.carPlayer.pause();
                    setTimeout(function () {
                        _this.carPlayer.play();
                    },5*1000)
                }

                let womenWalkPosition = route[1];//女人行走

                let gajgGlbPosition = route[3];//公安井盖
                let dgGlbPosition = route[4];//交通路灯
                let tkStart = route[5];//停靠
                let tkEnd = route[6];
                let szjgGlbPosition = route[7];//市政井盖
                let csStart = route[8];//超速
                let csEnd = route[9];

                let jcpGlbPosition = route[10];//噪音监测屏
                let chdStart = route[11];//闯红灯
                let chdEnd = route[13];
                let zdwgStart = route[14];//占道违规
                let zdwgEnd = route[15];

                let dtStart = route[16];//违规调头
                let lpEnd = route[17];//绿波
                let gjzEnd = route[19];//公交站


                let parkTip = route[20];//停车提示信息
                let parkPlace = route[24];//停车共享车位
                let parkAuto = route[26];//自动停车

                if(param.coordinate[0]==womenWalkPosition[0] && param.coordinate[1]==womenWalkPosition[1]){

                    _this.threeLayer.show();
                    _this.carPlayer.pause();
                    _this.womenWalk();
                    setTimeout(function () {
                        _this.carPlayer.play();
                    },10*1000)
                }


                if(param.coordinate[0]==zdwgStart[0] && param.coordinate[1]==zdwgStart[1]){
                    _this.wrongRoadPlayer.play();
                }

                if(param.coordinate[0]==zdwgEnd[0] && param.coordinate[1]==zdwgEnd[1]){
                    // car.closeInfoWindow();
                    // _this.threeLayer.hide();
                }

                if(param.coordinate[0]==tkStart[0] && param.coordinate[1]==tkStart[1]){

                    _this.viewer.gltfLayer.forEach(function (gltf){
                        let json = gltf.toJSON();
                        if(json.options.properties && json.options.properties.name && json.options.properties.name=="违规停放货车"){
                            let infoWindowObj = _this.createInfoWindow('违规停放');
                            gltf.setInfoWindow({
                                autoPan:false,
                                title: infoWindowObj.title,
                                content: infoWindowObj.content
                            });
                            gltf.openInfoWindow();
                            _this.circles[0].setPosition(gltf.getCoordinates());
                            _this.threeLayer.show();
                        }
                    })
                }

                if(param.coordinate[0]==tkEnd[0] && param.coordinate[1]==tkEnd[1]){
                    // car.closeInfoWindow();
                    _this.threeLayer.hide();
                }

                if(param.coordinate[0]==chdStart[0] && param.coordinate[1]==chdStart[1]){
                    _this.redLightPlayer.play();
                }

                if(param.coordinate[0]==chdEnd[0] && param.coordinate[1]==chdEnd[1]){
                    // car.closeInfoWindow();
                    _this.threeLayer.hide();
                }

                if(param.coordinate[0]==csStart[0] && param.coordinate[1]==csStart[1]){
                    _this.overSpeedPlayer.play();
                }

                if(param.coordinate[0]==csEnd[0] && param.coordinate[1]==csEnd[1]){
                    // car.closeInfoWindow();
                    // _this.threeLayer.hide();
                }

                if(param.coordinate[0]==dtStart[0] && param.coordinate[1]==dtStart[1]){
                    _this.turnAroundPlayer.play();
                }

                if(param.coordinate[0]==jcpGlbPosition[0] && param.coordinate[1]==jcpGlbPosition[1]){
                    _this.viewer.gltfLayer.forEach(function (gltf){
                        let json = gltf.toJSON();
                        if(json.options.properties && json.options.properties.name && json.options.properties.name=="噪音监测屏"){

                            let infoWindowObj = _this.createInfoWindow('噪音监测屏');
                            gltf.setInfoWindow({
                                autoPan:false,
                                dy:100,
                                title: infoWindowObj.title,
                                content: infoWindowObj.content
                            });
                            gltf.openInfoWindow();
                        }
                    })
                }
                if(param.coordinate[0]==gajgGlbPosition[0] && param.coordinate[1]==gajgGlbPosition[1]){
                    _this.viewer.gltfLayer.forEach(function (gltf){
                        let json = gltf.toJSON();
                        if(json.options.properties && json.options.properties.name && json.options.properties.name=="公安井盖"){

                            let infoWindowObj = _this.createInfoWindow('公安井盖');
                            gltf.setInfoWindow({
                                autoPan:false,
                                title: infoWindowObj.title,
                                content: infoWindowObj.content
                            });
                            gltf.openInfoWindow();
                        }
                    })
                }
                if(param.coordinate[0]==dgGlbPosition[0] && param.coordinate[1]==dgGlbPosition[1]){
                    _this.viewer.gltfLayer.forEach(function (gltf){
                        let json = gltf.toJSON();
                        if(json.options.properties && json.options.properties.name && json.options.properties.name=="交通路灯"){

                            let infoWindowObj = _this.createInfoWindow('交通路灯');
                            gltf.setInfoWindow({
                                autoPan:false,
                                dy:100,
                                title: infoWindowObj.title,
                                content: infoWindowObj.content
                            });
                            let coordinate = gltf.getCoordinates();
                            gltf.openInfoWindow(coordinate);
                        }
                    })
                }
                if(param.coordinate[0]==szjgGlbPosition[0] && param.coordinate[1]==szjgGlbPosition[1]){
                    _this.viewer.gltfLayer.forEach(function (gltf){
                        let json = gltf.toJSON();
                        if(json.options.properties && json.options.properties.name && json.options.properties.name=="市政井盖"){

                            let infoWindowObj = _this.createInfoWindow('市政井盖');
                            gltf.setInfoWindow({
                                autoPan:false,
                                title: infoWindowObj.title,
                                content: infoWindowObj.content
                            });
                            gltf.openInfoWindow();
                        }
                    })
                }

                if(param.coordinate[0]==parkTip[0] && param.coordinate[1]==parkTip[1]){
                    let infoWindowObj = _this.createInfoWindow('实时播报');
                    car.setInfoWindow({
                        autoPan:false,
                        title: infoWindowObj.title,
                        content: infoWindowObj.content
                    });
                    car.openInfoWindow();
                }
                if(param.coordinate[0]==parkPlace[0] && param.coordinate[1]==parkPlace[1]){
                    let infoWindowObj = _this.createInfoWindow('共享车位');
                    car.setInfoWindow({
                        autoPan:false,
                        title: infoWindowObj.title,
                        content: infoWindowObj.content
                    });
                    car.openInfoWindow();
                }
                if(param.coordinate[0]==parkAuto[0] && param.coordinate[1]==parkAuto[1]){
                    let infoWindowObj = _this.createInfoWindow('自动泊车');
                    car.setInfoWindow({
                        autoPan:false,
                        title: infoWindowObj.title,
                        content: infoWindowObj.content
                    });
                    car.openInfoWindow();
                    _this.carPlayer.pause();
                    women.show();
                    setTimeout(function () {
                        _this.carPlayer.play();
                    },3*1000)
                }
                if(param.coordinate[0]==lpEnd[0] && param.coordinate[1]==lpEnd[1]){
                    let infoWindowObj = _this.createInfoWindow('绿波路段');
                    car.setInfoWindow({
                        autoPan:false,
                        title: infoWindowObj.title,
                        content: infoWindowObj.content
                    });
                    car.openInfoWindow();
                }
                //公交站
                if(param.coordinate[0]==gjzEnd[0] && param.coordinate[1]==gjzEnd[1]){
                    _this.viewer.gltfLayer.forEach(function (gltf){
                        let json = gltf.toJSON();
                        if(json.options.properties && json.options.properties.name && json.options.properties.name=="五道口公交车站"){
                            let infoWindowObj = _this.createInfoWindow('五道口公交车站');
                            gltf.setInfoWindow({
                                autoPan:false,
                                title: infoWindowObj.title,
                                content: infoWindowObj.content
                            });
                            gltf.openInfoWindow();
                        }
                    })
                }

                let position = [param.coordinate[0],param.coordinate[1],14];
                // let pitch = getPitch(param.rotationX);
                // console.log(pitch)
                // let bearing = -param.rotationZ;
                _this.viewer.map.setCameraOrientation({
                    position: position,
                    pitch: 80,
                    bearing: 90,
                });

                // _this.viewer.map.setCameraPosition(
                //     new maptalks.Coordinate([param.coordinate[0],param.coordinate[1]]),
                // );
                // _this.viewer.map.setPitch(0);
                // _this.viewer.map.setBearing(0);
                function getPitch(pitch) {
                    if (pitch > 270 && pitch < 350) {
                        return pitch - 270;
                    } else if (pitch >= 350 || (pitch >= 0 && pitch <= 180)) {
                        return _this.viewer.map.options["maxPitch"];
                    } else {
                        return 0;
                    }
                }
            });
            _this.carPlayer.setUnitTime(1);
            _this.carPlayer.play();
        }
    }

    /**
     * 信息弹窗
     */
    createInfoWindow(title,type){
      const infoData1 = {
        content:[
          {key: '1',title: '车辆号码',value: '京B 67436'},
          {key: '2',title: '联系方式',value: '137****7836'},
          {key: '3',title: '车主姓名',value: '周少华'},
          {key: '4',title: '车辆车型',value: '私人轿车'},
          {key: '5',title: '驾驶证档案编号',value: '372003******'},
          {key: '6',title: '违法时间',value: '2024年5月9日18:07:15'},
          {key: '7',title: '机动车驾驶证号',value: '420029******'},
          {key: '8',title: '违法行为',value: '占用公交车道行驶'},
          {key: '9',title: '准驾车型',value: 'C1'},
          {key: '10',title: '违法地点',value: '海淀区成府路173号'},
        ],
        imgUrl: require('@/assets/smartStreet/illegal_image_1.png'),
        audioUrl: require('@/assets/smartStreet/zygjcd.mp3'),
      };
      const infoData2 = {
        content:[
          {key: '1',title: '车辆号码',value: '京F H6731'},
          {key: '2',title: '联系方式',value: '137****7836'},
          {key: '3',title: '车主姓名',value: '王德胜'},
          {key: '4',title: '车辆车型',value: '私人轿车'},
          {key: '5',title: '驾驶证档案编号',value: '372003764274'},
          {key: '6',title: '违法时间',value: '2024年5月9日18:07:15'},
          {key: '7',title: '机动车驾驶证号',value: '420029367235'},
          {key: '8',title: '违法行为',value: '违规停放'},
          {key: '9',title: '准驾车型',value: 'C1'},
          {key: '10',title: '违法地点',value: '海淀区成府路173号'},
        ],
        imgUrl: require('@/assets/smartStreet/illegal_image_2.png'),
        audioUrl: require('@/assets/smartStreet/违规停放.wav'),
      };
      const infoData3 = {
        content:[
          {key: '1',title: '车辆号码',value: '京B 67436'},
          {key: '2',title: '联系方式',value: '137****7836'},
          {key: '3',title: '车主姓名',value: '周少华'},
          {key: '4',title: '车辆车型',value: '私人轿车'},
          {key: '5',title: '驾驶证档案编号',value: '372003******'},
          {key: '6',title: '违法时间',value: '2024年5月9日18:07:15'},
          {key: '7',title: '机动车驾驶证号',value: '420029******'},
          {key: '8',title: '违法行为',value: '闯红灯'},
          {key: '9',title: '准驾车型',value: 'C1'},
          {key: '10',title: '违法地点',value: '海淀区成府路173号'},
        ],
        imgUrl: require('@/assets/smartStreet/illegal_image_3.png'),
        audioUrl: require('@/assets/smartStreet/闯红灯.wav'),
      };
      const infoData4 = {
        content:[
          {key: '1',title: '车辆号码',value: '京F H6731'},
          {key: '2',title: '',value: ''},
          {key: '3',title: '车辆车型',value: '私人轿车'},
          {key: '4',title: '',value: ''},
          {key: '5',title: '违法时间',value: '2024年5月9日18:07:15'},
          {key: '6',title: '',value: ''},
          {key: '7',title: '违法行为',value: '超速行驶'},
          {key: '8',title: '',value: ''},
          {key: '9',title: '违法地点',value: '海淀区成府路173号'},
          {key: '10',title: '',value: ''},
        ],
        imgUrl: require('@/assets/smartStreet/illegal_image_4.png')
      };
      const infoData5 = {
        content:[
          {key: '1-1',title: '标识码',value: '110108112005674'},
          {key: '1-2',title: '所属街道',value: '东升镇'},
          {key: '1-3',title: '所属社区',value: '博展股份社'},
          {key: '1-4',title: '当前状态',value: '正常'},
          {key: '1-5',title: '识别内容',value: '闯红灯抓拍、占用公交车道行驶、违章停靠、暴露垃圾、行人闯红灯、行人乱扔垃圾、非机动车逆行、车牌识别、车辆类型识别等。'},
          {key: '1-6',title: '通知单位',value: '交通执法、市政'}
        ],
        statistics:[
          {key: '2-1',title: '实时人流量',number: 17689,img: require('@/assets/smartStreet/statistic1.png')},
          {key: '2-2',title: '实时车流量',number: 15987,img: require('@/assets/smartStreet/statistic2.png')},
          {key: '2-3',title: '抓拍事件数',number: 151,img: require('@/assets/smartStreet/statistic3.png')}
        ],
        imgUrl:require('@/assets/smartStreet/traffic_light.png')
      };
      const infoData6 = {
        content:[
          {key: '1',title: '标识码',value: '110108112005674'},
          {key: '2',title: '所属街道',value: '东升镇'},
          {key: '3',title: '所属社区',value: '博展股份社'},
          {key: '4',title: '当前状态',value: '正常'},
          {key: '5',title: '噪声',value: '69.8db'},
          {key: '6',title: '风速',value: '0.0 m/s'},
          {key: '7',title: '风向',value: '东北'},
          {key: '8',title: '温度',value: '28°C'},
          {key: '9',title: '湿度',value: '51.1%RH'},
          {key: '10',title: '通知单位',value: '生态环境局'}
        ],
        audioUrl: require('@/assets/smartStreet/噪音监测屏.wav'),
      };
      const infoData7 = {
        content:[
          {key: '1',title: '标识码',value: '110108112005674'},
          {key: '2',title: '所属街道',value: '东升镇'},
          {key: '3',title: '所属社区',value: '博展股份社'},
          {key: '4',title: '当前状态',value: '异常'},
          {key: '5',title: '识别内容',value: '是否位移、是否损坏、井下水超过预警值'},
          {key: '6',title: '通知单位',value: '物业公司、公安'}
        ],
        audioUrl: require('@/assets/smartStreet/公安井盖.wav'),
      };      
      const infoData8 = {
        content:[
          {key: '1',title: '标识码',value: '110108112005674'},
          {key: '2',title: '所属街道',value: '东升镇'},
          {key: '3',title: '所属社区',value: '博展股份社'},
          {key: '4',title: '当前状态',value: '异常'},
          {key: '5',title: '识别内容',value: '是否位移、是否损坏、井下水超过预警值'},
          {key: '6',title: '通知单位',value: '物业公司、公安'}
        ],
        audioUrl: require('@/assets/smartStreet/市政井盖.wav'),
      };
      const infoData9 = {
        content:[
          {key: '1',title: '站点名称',value: '五道口公交站'},
          {key: '2',title: '本站停靠',value: '508路、307路、331路、375路、429路、549路、562路、630路、86路、运通126路'},
          {key: '3',title: '运营时间',value: '05:10-23:00'},
          {key: '4',title: '当前等待',value: '5人'},
        ],
        audioUrl: require('@/assets/smartStreet/公交站.wav'),
      };
      const infoData10 = {
        content:[
          {key: '1',title: '绿波建议时速',value: '60Km/h'},
          {key: '2',title: '今日累计车流量',value: '3468辆'},
          {key: '3',title: '道路地址',value: '成府路202号'},
        ],
        audioUrl: require('@/assets/smartStreet/绿波路段.wav'),
      };
      const infoData11 = {
        content:[
          {key: '1',title: '车牌号码',value: '京F H6731'},
          {key: '2',title: '车主姓名',value: '赵珊珊'},
          {key: '3',title: '联系方式',value: '138****0183'},
          {key: '4',title: '车辆类型',value: '私家车辆'},
          {key: '5',title: '停车地点',value: '北京市海淀区成府路28号 E0321'},
          {key: '6',title: '停靠照片',value: ''},
        ],
        imgUrl: require('@/assets/smartStreet/park.png'),
      };
      const infoData12 = {
        content:[
          {key: '1',title: '停车位地点',value: '北京市海淀区成府路28号'},
          {key: '2',title: '抵达时间',value: ''},
          {key: '3',title: '行驶路线',value: ''},
        ],
        imgUrl: require('@/assets/smartStreet/path.png'),
      };
      const infoData13 = {
        imgUrl: require('@/assets/smartStreet/broadcast.png'),
        audioUrl: require('@/assets/smartStreet/停车.wav'),
      };
      const infoData14 = {
        content:[
          {key: '1',title: '车牌号码',value: '京F H6731'},
          {key: '2',title: '车辆类型',value: '私人轿车'},
          {key: '3',title: '违法时间',value: ''},
          {key: '4',title: '违法行为',value: '违规调头'},
          {key: '5',title: '违法地点',value: '海淀区成府路173号'},
        ],
        textContent:'北京爱笔科技有限公司，提供违规调头识别算法支撑',
        imgUrl: require('@/assets/smartStreet/illegal_u_turn.png'),
      }
      const infoData15 = {
        textTitle:'交管紧急提示:',
        textContent:'请注意，右侧车道发生紧急车辆故障，请您减速并靠左侧车道通行。',
        audioUrl: require('@/assets/smartStreet/交管紧急提示.wav'),
      }
      const template1 = `<div class="info-content-type1">
        <div class="text-content">
          <div class="content-item" v-for="item in dataList" :key="item.key">
            <div class="item-title">{{item.title}}<span v-if="item.title != ''"> : </span></div>
            <div class="item-text">{{item.value}}</div>
          </div>
        </div>
        <div class="image-content">
          <img :src="imgUrl"/>
          <audio v-if="audioUrl!=''" id="audioPlayer" :src="audioUrl" autoplay controls>
          </audio>
        </div>
      </div>`;     
      const template2 = `<div class="info-content-type2">
        <div class="text-content">
          <div class="content-item" v-for="item in dataList" :key="item.key">
            <div class="item-title">{{item.title}}：</div>
            <div class="item-text">{{item.value}}</div>
          </div>
        </div>
        <div class="analysis-content">
          <div class="analysis-item" v-for="item in analysisData" :key="item.key">
            <div class="analysis-img"><img :src="item.img"/></div>
            <div class="analysis-number">{{item.number}}</div>
            <div class="analysis-title">{{item.title}}</div>
          </div>
        </div>
        <div class="image-content">
          <img class="picture" :src="imgUrl"/>
          <img class="btn-img" :src="playImg"/>
        </div>
      </div>`
      const template3 = `<div class="info-content-type3">
        <div class="text-content">
          <div class="content-item" v-for="item in dataList" :key="item.key">
            <div class="item-title">{{item.title}}：</div>
            <div class="item-text">{{item.value}}</div>
          </div>
          <div class="media-content">
            <audio v-if="audioUrl!='' && !playType" id="audioPlayer" :src="audioUrl" autoplay controls></audio>
          </div>
        </div>
      </div>`;
      const template4 = `<div class="info-content-type4">
        <div class="text-content">
          <div class="content-item" v-for="item in dataList" :key="item.key">
            <div class="item-title">{{item.title}}：</div>
            <div v-if="item.title=='抵达时间'" class="item-text">{{currentDate}} {{dataTime}}</div>
            <div v-else class="item-text">{{item.value}}</div>
          </div>
        </div>
        <div class="image-content">
          <img class="picture" :src="imgUrl"/>
        </div>
      </div>`;
      const template5 = `<div class="info-content-type5">
        <div class="image-content">
          <img :src="imgUrl"/>
          <audio v-if="audioUrl!=''" id="audioPlayer" :src="audioUrl" autoplay controls></audio>
        </div>
      </div>`;
      const template6 = `<div class="info-content-type6">
        <div class="image-content">
          <img :src="imgUrl"/>
        </div>
        <div class="text-content">
          <div class="content-item" v-for="item in dataList" :key="item.key">
            <div class="item-title">{{item.title}}：</div>
            <div v-if="item.title=='违法时间'" class="item-text">{{currentDate}} {{dataTime}}</div>
            <div v-else class="item-text">{{item.value}}</div>
          </div>
          <div class="explain">{{textContent}}</div>
        </div>
        </div>
      </div>`;
      const template7 = `<div class="info-content-type7">
        <div class="content">
          <p class="text-title">{{textTitle}}</p>
          <p class="text-content">{{textContent}}</p>
        </div>
        <div class="audio-box">
          <audio v-if="audioUrl!=''" id="audioPlayer" :src="audioUrl" autoplay controls></audio>
        </div>
      </div>`;
      //弹窗标题
      let windowTitle = title || '';
      //弹窗内容
      let data = null;
      //模板
      let template = '';

      switch(title){
        case '占用公交车道行驶':
          data = infoData1;
          template = template1;
          windowTitle += " (爱笔算法识别)";
          break;
        case '违规停放':
          data = infoData2;
          template = template1;
          windowTitle += " (百度算法识别)";
          break;
        case '闯红灯':
          data = infoData3;
          template = template1;
          windowTitle += " (百度算法识别)";
          break;
        case '超速':
          data = infoData4;
          template = template1;
          windowTitle += " (爱笔算法识别)";
          break;
        case '交通路灯':
          data = infoData5;
          template = template2;
          windowTitle += " (智谱华章大模型)";
          break;
        case '噪音监测屏':
          data = infoData6;
          template = template3;
          break;
        case '公安井盖':
          data = infoData7;
          template = template3;
          windowTitle += " (百度算法识别)";
          break;
        case '市政井盖':
          data = infoData8;
          template = template3;
          windowTitle += " (百度算法识别)";
          break;
        case '五道口公交车站':
          data = infoData9;
          template = template3;
          break;
        case '绿波路段':
          data = infoData10;
          template = template3;
          windowTitle += " (智谱华章大模型)";
          break;
        case '自动泊车':
          data = infoData11;
          template = template4;
          windowTitle += " (中科闻歌大模型)";
          break;
        case '共享车位':
          data = infoData12;
          template = template4;
          windowTitle += " (中科闻歌大模型)";
          break;
        case '实时播报':
          data = infoData13;
          template = template5;
          windowTitle += " (智谱华章大模型)";
          break;
        case '违规调头':
          data = infoData14;
          template = template6;
          windowTitle += " (爱笔算法识别)";
          break;
        case '交管紧急提示':
          data = infoData15;
          template = template7;
          break;
      }   
      
      //文字列表
      let dataList = data && data.content ? data.content : [];
      //文本标题
      let textTitle = data && data.textTitle ? data.textTitle : '';
      //文本内容
      let textContent = data && data.textContent ? data.textContent : '';
      //统计值
      let analysisData = data && data.statistics ? data.statistics : [];
      //图片
      let imgUrl = data && data.imgUrl ? data.imgUrl : '';
      //音频
      let audioUrl = data && data.audioUrl ? data.audioUrl : '';
      //视频
      let videoUrl = data && data.videoUrl ? data.videoUrl : '';

      let Profile = Vue.extend({
        template: template,
        data: function () {
          return {
            dataList: dataList,
            textTitle: textTitle,
            textContent: textContent,
            analysisData: analysisData,
            imgUrl: imgUrl,
            audioUrl: audioUrl,
            playType: type,
            videoUrl: videoUrl,
            playImg: require('@/assets/smartStreet/play.png'),
            currentDate:new Date().toLocaleDateString(),
            dataTime:new Date().toLocaleTimeString(),
          }
        }
      });
      const profile = new Profile().$mount();
      return{
        title: windowTitle,
        content: profile.$el
      }
    }

    createUiMarkerWindow(title) {
      let that = this;
      //弹窗标题
      let windowTitle = title || '';
      //弹窗内容
      let data = null;
      //模板
      let template = '';

      switch(title){
        case '街区讲解':
          data = {
            textContent:'成府路，以海淀区中部的成亲王府而得名。成府，东起清华南路，西至北京大学东墙，北临清华西路，南至成府路。为乾隆十一子成亲王爱新觉罗·永瑆民国时期的府邸。',
            imgUrl: require('@/assets/smartStreet/street.png')
          };
          template = `<div class="profile">
            <div class="title-box">{{title}}<span class="close-btn" @click="closeUiMarker">X</span></div>
            <div class="profile-type1">
              <div class="text-box">{{textContent}}</div>
              <div class="image-box">
                <img :src="imgUrl"/>
              </div>
            </div>
          </div>`;
          break;

        case '视频追溯':
          data = {
            content: [
              {key: '1',title: '唯一标识',value: ''},
              {key: '2',title: '标识码',value: '1101080118077209'},
              {key: '3',title: '部件名称',value: '路灯'},
              {key: '4',title: '所在单元网格',value: '11010801100408'},
              {key: '5',title: '所属街道',value: '中关村街道'},
              {key: '6',title: '所在社区',value: '004'},
              {key: '7',title: '所属社区',value: '科汇社区'},
              {key: '8',title: '所在街道',value: '011'},
            ],
            imgUrl:require('@/assets/smartStreet/traffic_light.png')
          };
          template = `<div class="profile">
            <div class="title-box">{{title}}<span class="close-btn" @click="closeUiMarker">X</span></div>
            <div class="profile-type2">
              <div class="text-box">
                <div class="content-item" v-for="item in dataList" :key="item.key">
                  <div class="item-title">{{item.title}}：</div>
                  <div class="item-text">{{item.value}}</div>
                </div>
              </div> 
              <div class="image-box">
<!--                <img class="picture" :src="imgUrl"/>-->
<!--                <img class="btn-img" :src="playImg"/>-->
                <video width="100%" height="auto" id="my-video" controls muted src=""></video>
              </div>
            </div>
          </div>`;
          break;
        
        case '秩序导览':
          data = {
            statistics:[
              {key: '1-1',title: '实时人流量',number: 17689,img: require('@/assets/smartStreet/statistic1.png')},
              {key: '1-2',title: '实时车流量',number: 15987,img: require('@/assets/smartStreet/statistic2.png')},
              {key: '1-3',title: '抓拍事件数',number: 151,img: require('@/assets/smartStreet/statistic3.png')}
            ],
            chartData: {
              chartTitle: '抓拍事件类型',
              chartContent: [
                {key: '2-1',title: '行人闯红灯',number: 234,img: require('@/assets/smartStreet/pt1.png')},
                {key: '2-2',title: '非机动车逆行',number: 452,img: require('@/assets/smartStreet/pt2.png')},
                {key: '2-3',title: '非机动车闯红灯',number: 76,img: require('@/assets/smartStreet/pt3.png')},
                {key: '2-3',title: '暴露垃圾',number: 656,img: require('@/assets/smartStreet/pt4.png')},
              ],
              chartTotal: 2532
            }
          };
          template = `<div class="profile">
            <div class="title-box">{{title}}<span class="close-btn" @click="closeUiMarker">X</span></div>
            <div class="profile-type3">
              <div class="analysis-box">
                <div class="analysis-item" v-for="item in analysisData" :key="item.key">
                  <div class="analysis-img"><img :src="item.img"/></div>
                  <div class="analysis-number">{{item.number}}</div>
                  <div class="analysis-title">{{item.title}}</div>
                </div>
              </div>
              <p class="chart-title">抓拍事件类型</p>
              <div class="chart-box">
                <div class="circle-box">
                  <div class="circle-outside">
                    <div class="circle-inside">
                      <p class="text">{{chartTotal}}</p>
                      <p class="title">事件总数</p>
                    </div>
                  </div>
                </div>
                <div class="statistic-box">
                  <div class="statistic-item" v-for="item in chartContent" :key="item.key">
                    <img class="item-pt" :src="item.img"/>
                    <span class="item-title">{{item.title}}</span>
                    <span class="item-text">{{item.number}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
          break;
        case "AI模型问询(智谱华章模型算法)":
          template = `<div class="profile">
            <div class="title-box">{{title}}<span class="close-btn" @click="closeUiMarker">X</span></div>
            <div class="profile-type4">
              <iframe
                src="http://172.16.77.144:10176/chat/share?shareId=j5uyqu9eww07x9a61c4yiiks&showHistory=0"
                style="width: 100%; height: 100%;"
                frameborder="0" 
                allow="microphone;camera;midi;encrypted-media;"
              />
            </div>
          </div>`;
          break;
      }

      //文字列表
      let dataList = data && data.content ? data.content : [];
      //文本内容
      let textContent = data && data.textContent ? data.textContent : '';
      //统计值
      let analysisData = data && data.statistics ? data.statistics : [];
      //统计图表
      let chartData = data && data.chartData ? data.chartData : null;
      let chartTitle = chartData && chartData.title ? chartData.title : '';
      let chartContent = chartData && chartData.chartContent ? chartData.chartContent : [];
      let chartTotal = chartData && chartData.chartTotal ? chartData.chartTotal : 0;
      //图片
      let imgUrl = data && data.imgUrl ? data.imgUrl : '';

      let Profile = Vue.extend({
        template: template,
        data: function () {
            return {
              title: windowTitle,
              dataList: dataList,
              textContent: textContent,
              analysisData: analysisData,
              chartTitle: chartTitle,
              chartContent: chartContent,
              chartTotal: chartTotal,
              imgUrl: imgUrl,
              playImg: require('@/assets/smartStreet/play.png')
            }
        },
        methods: {
            closeUiMarker() {
                that.uiMarker2.remove()
            }
        }
      })
      const profile = new Profile().$mount();
      return profile.$el;
    }
    createVideoWindow(title){
      const windowTitle = title || '';
      const videoUrl = require('@/assets/smartStreet/双手离开方向盘.mp4')  
      const template = `<div class="info-content-video">
        <div class="content">
          <video width="100%" height="auto" id="my-video" autoplay muted :src="videoUrl"></video>
        </div>
      </div>`;
      let Profile = Vue.extend({
        template: template,
        data: function () {
          return {
            videoUrl: videoUrl
          }
        }
      });
      const profile = new Profile().$mount();
      return{
        title: windowTitle,
        content: profile.$el
      }
    }
    drive(){
        function loadRoads() {
            fetch("./file/flowCar.geojson")
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
                task(route[0],i,i);
            }
        }
        function task(route,count,m){
            for(let i=0;i<route.length;i++){
                route[i] = [route[i][0],route[i][1],2.5];
            }
            let start = route[0];
            let car = new GLTFMarker(
                [start[0],start[1], 2.5],
                {
                    symbol: symbolArr[count],
                }
            ).addTo(_this.viewer.gltfLayer);

            let randomNumber = 60+m*10;
            let data = formatRouteData(route, {
                duration: 1000 * randomNumber
            });
            let carPlayer = new RoutePlayer(data, {
                repeat:true,
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

    /**
     * 女人行走
     */
    womenWalk(){
        let _this = this;
        function loadRoads() {
            fetch("./file/womenwalk.geojson")
                .then((response) => {
                    return response.json();
                })
                .then((geojson) => {
                    let features = geojson.features;
                    let road = features[0].geometry.coordinates;
                    task(road[0]);
                });
        }
        loadRoads();
        let womenSymbol=
            {
                url: "/gltf/people/RW_nvren.glb",
                shadow: true,
                rotationZ: 90,
                animation:true,
                loop:true,
                // animationName:""
                bloom:true,
            };

        function task(route){
            route[0] = [route[0][0],route[0][1],3.6];
            route[1] = [route[1][0],route[1][1],3.6];
            let start = route[0];
            _this.womenMarker = new GLTFMarker(
                [start[0],start[1], 3.6],
                {
                    symbol: womenSymbol,
                }
            ).addTo(_this.viewer.gltfLayer);
            _this.womenMarker.hide();
            let randomNumber = 30;
            let data = formatRouteData(route, {
                duration: 1000 * randomNumber
            });
            _this.womenPlayer = new RoutePlayer(data, {
                repeat:false,
            });
            _this.womenPlayer.on("playing", (param) => {
                _this.womenMarker.setCoordinates(param.coordinate);
                _this.womenMarker.updateSymbol({
                    rotationZ: param.rotationZ+180,
                });
            });
            _this.womenPlayer.on('playend', e => {
                // _this.viewer.gltfLayer.removeGeometry(_this.womenMarker);
                _this.womenMarker.hide();
            });
            _this.womenPlayer.setUnitTime(1);
        }
    }

    /**
     * 车辆占道
     */
    carWrongRoad(){
        let _this = this;
        function loadRoads() {
            fetch("./file/zhandao.geojson")
                .then((response) => {
                    return response.json();
                })
                .then((geojson) => {
                    let features = geojson.features;
                    let road = features[0].geometry.coordinates;
                    task(road[0]);
                });
        }
        loadRoads();
        let carSymbol=
            {
                url: "/gltf/car/JTGJ_xiaokeche_hei.glb",
                shadow: true,
                rotationZ: 0,
                // animation:true,
                // loop:true,
                // animationName:""
                bloom:true,
            };

        function task(route){
            route[0] = [route[0][0],route[0][1],2.8];
            route[1] = [route[1][0],route[1][1],2.8];
            let start = route[0];
            _this.carWrongRoadGltfMarker = new GLTFMarker(
                start,
                {
                    symbol: carSymbol,
                }
            ).addTo(_this.viewer.gltfLayer);

            let randomNumber = 10;
            let data = formatRouteData(route, {
                duration: 1000 * randomNumber
            });
            _this.wrongRoadPlayer = new RoutePlayer(data, {
                repeat:false,
            });

            _this.wrongRoadPlayer.on("playstart", (param) => {
                let infoWindowObj = _this.createInfoWindow('占用公交车道行驶');
                _this.carWrongRoadGltfMarker.setInfoWindow({
                    autoPan:false,
                    title: infoWindowObj.title,
                    content: infoWindowObj.content
                });
                _this.carWrongRoadGltfMarker.openInfoWindow();
                _this.threeLayer.show();
            })

            _this.wrongRoadPlayer.on("playing", (param) => {
                _this.carWrongRoadGltfMarker.setCoordinates(param.coordinate);
                _this.carWrongRoadGltfMarker.updateSymbol({
                    rotationZ: param.rotationZ+90,
                });
                _this.circles[0].setPosition(param.coordinate);
            });
            _this.wrongRoadPlayer.on('playend', e => {
                _this.threeLayer.hide();
                _this.carWrongRoadGltfMarker.closeInfoWindow();
            });
            _this.wrongRoadPlayer.setUnitTime(1);
        }
    }
    /**
     * 车辆闯红灯
     */
    carRedLight(){
        let _this = this;
        function loadRoads() {
            fetch("./file/chuanghongdeng.geojson")
                .then((response) => {
                    return response.json();
                })
                .then((geojson) => {
                    let features = geojson.features;
                    let road = features[0].geometry.coordinates;
                    task(road[0]);
                });
        }
        loadRoads();
        let carSymbol=
            {
                url: "/gltf/car/JTGJ_xiaokeche_hei.glb",
                shadow: true,
                rotationZ: 0,
                // animation:true,
                // loop:true,
                // animationName:""
                bloom:true,
            };

        function task(route){
            route[0] = [route[0][0],route[0][1],2.8];
            route[1] = [route[1][0],route[1][1],2.8];
            let start = route[0];
            _this.carRedLightGltfMarker = new GLTFMarker(
                start,
                {
                    symbol: carSymbol,
                }
            ).addTo(_this.viewer.gltfLayer);

            let randomNumber = 5;
            let data = formatRouteData(route, {
                duration: 1000 * randomNumber
            });
            _this.redLightPlayer = new RoutePlayer(data, {
                repeat:false,
            });

            _this.redLightPlayer.on("playstart", (param) => {

                let infoWindowObj = _this.createInfoWindow('闯红灯');
                _this.carRedLightGltfMarker.setInfoWindow({
                    autoPan:false,
                    title: infoWindowObj.title,
                    content: infoWindowObj.content
                });
                _this.carRedLightGltfMarker.openInfoWindow();
                _this.threeLayer.show();
            })

            _this.redLightPlayer.on("playing", (param) => {
                _this.carRedLightGltfMarker.setCoordinates(param.coordinate);
                _this.carRedLightGltfMarker.updateSymbol({
                    rotationZ: param.rotationZ+90,
                });
                _this.circles[0].setPosition(param.coordinate);
            });
            _this.redLightPlayer.on('playend', e => {
                _this.threeLayer.hide();
                _this.carRedLightGltfMarker.closeInfoWindow();
            });
            _this.redLightPlayer.setUnitTime(1);
        }
    }
    /**
     * 车辆超速
     */
    carOverSpeed(){
        let _this = this;
        function loadRoads() {
            fetch("./file/chaosu.geojson")
                .then((response) => {
                    return response.json();
                })
                .then((geojson) => {
                    let features = geojson.features;
                    let road = features[0].geometry.coordinates;
                    task(road[0]);
                });
        }
        loadRoads();
        let carSymbol=
            {
                url: "/gltf/car/JTGJ_xiaokeche_hei.glb",
                shadow: true,
                rotationZ: 0,
                // animation:true,
                // loop:true,
                // animationName:""
                bloom:true,
            };

        function task(route){
            route[0] = [route[0][0],route[0][1],2.8];
            route[1] = [route[1][0],route[1][1],2.8];
            let start = route[0];
            _this.carOverSpeedGltfMarker = new GLTFMarker(
                start,
                {
                    symbol: carSymbol,
                }
            ).addTo(_this.viewer.gltfLayer);

            let randomNumber = 15;
            let data = formatRouteData(route, {
                duration: 1000 * randomNumber
            });
            _this.overSpeedPlayer = new RoutePlayer(data, {
                repeat:false,
            });

            _this.overSpeedPlayer.on("playstart", (param) => {

                // let infoWindowObj = _this.createInfoWindow('超速');
                // _this.carOverSpeedGltfMarker.setInfoWindow({
                //     autoPan:false,
                //     title: infoWindowObj.title,
                //     content: infoWindowObj.content
                // });
                // _this.carOverSpeedGltfMarker.openInfoWindow();
                _this.threeLayer.show();
                if(_this.sosUiMarker==null){
                    let ssoCanvas  =  document.createElement("div");
                    ssoCanvas.id = "ssoCanvas";
                    ssoCanvas.style = "width: 100px;height:100px;";
                    document.body.appendChild(ssoCanvas)
                    let player = new SVGA.Player("#ssoCanvas");
                    let parser = new SVGA.Parser("#ssoCanvas");
                    // this.imageUrl 定义一个参数接收url
                    parser.load('http://192.168.201.162:9000/digital/so_1724830202845.svga', function (videoItem) {
                        player.setVideoItem(videoItem);
                        player.startAnimation();
                        _this.sosUiMarker = new maptalks.ui.UIMarker(param.coordinate, {
                            content: ssoCanvas,
                        });
                        _this.sosUiMarker.addTo(_this.viewer.map);
                    });
                }else {
                    _this.sosUiMarker.show();
                }
            })

            _this.overSpeedPlayer.on("playing", (param) => {
                _this.carOverSpeedGltfMarker.setCoordinates(param.coordinate);
                _this.carOverSpeedGltfMarker.updateSymbol({
                    rotationZ: param.rotationZ+90,
                });
                _this.circles[0].setPosition(param.coordinate);

                if(_this.sosUiMarker){
                    _this.sosUiMarker.setCoordinates(new maptalks.Coordinate(param.coordinate[0],param.coordinate[1],param.coordinate[2]));
                }
            });

            _this.overSpeedPlayer.on('playend', e => {
                if(_this.sosUiMarker)
                    _this.sosUiMarker.hide();
                _this.threeLayer.hide();
                _this.carOverSpeedGltfMarker.closeInfoWindow();
            });
            _this.overSpeedPlayer.setUnitTime(1);
        }
    }
    /**
     * 车辆违规调头
     */
    carTurnAround(){
        let _this = this;
        function loadRoads() {
            fetch("./file/diaotou.geojson")
                .then((response) => {
                    return response.json();
                })
                .then((geojson) => {
                    let features = geojson.features;
                    let road = features[0].geometry.coordinates;
                    task(road[0]);
                });
        }
        loadRoads();
        let carSymbol=
            {
                url: "/gltf/car/JTGJ_xiaokeche_hei.glb",
                shadow: true,
                rotationZ: 0,
                // animation:true,
                // loop:true,
                // animationName:""
                bloom:true,
            };

        function task(route){
            for(let i=0;i<route.length;i++){
                route[i] = [route[i][0],route[i][1],2.8];
            }
            let start = route[0];
            _this.carTurnAroundGltfMarker = new GLTFMarker(
                start,
                {
                    symbol: carSymbol,
                }
            ).addTo(_this.viewer.gltfLayer);

            let randomNumber = 3;
            let data = formatRouteData(route, {
                duration: 1000 * randomNumber
            });
            _this.turnAroundPlayer = new RoutePlayer(data, {
                repeat:false,
            });

            _this.turnAroundPlayer.on("playstart", (param) => {
                //播放语音
                _this.trafficAudio = null;
                _this.trafficAudio = new Audio(require('@/assets/smartStreet/违规调头.wav'));
                _this.trafficAudio.play();
                _this.host.aiPersonPopup(6,true);
                let infoWindowObj = _this.createInfoWindow('违规调头');
                _this.carTurnAroundGltfMarker.setInfoWindow({
                    autoPan:false,
                    title: infoWindowObj.title,
                    content: infoWindowObj.content
                });
                _this.carTurnAroundGltfMarker.openInfoWindow();
                _this.threeLayer.show();
            })

            _this.turnAroundPlayer.on("playing", (param) => {
                _this.carTurnAroundGltfMarker.setCoordinates(param.coordinate);
                _this.carTurnAroundGltfMarker.updateSymbol({
                    rotationZ: param.rotationZ+90,
                });
                _this.circles[0].setPosition(param.coordinate);
            });
            _this.turnAroundPlayer.on('playend', e => {
                _this.threeLayer.hide();
                _this.carTurnAroundGltfMarker.closeInfoWindow();
            });
            _this.turnAroundPlayer.setUnitTime(1);
        }
    }
    /**
     * 大厦弹窗
     **/
    createBuildingInfoWindow(properties){
      var that = this;
      console.log('大厦弹窗this',this)
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
              <div class="major-content-text" @click="openPropertyList(item.title)">{{item.value}}<span class="suffix" v-if="item.value !=''">{{item.suffix}}</span></div>
            </li>
          </ul>
          <ul class="minor-content">
            <li class="minor-content-li" v-for="item in minorList" :key="item.key">
              <div class="minor-content-text" @click="openLayeredDisplay(item.title,buildingProperties,parent)">{{item.value}}<span class="suffix" v-if="item.value !=''">{{item.suffix}}</span></div>
              <div class="minor-content-title"><img :src="item.icon"/><span>{{item.title}}</span></div>
            </li>
          </ul>
        </div>`,
        data: function () {
          return {
            majorList : infoObj1,
            minorList: infoObj2,
            buildingProperties: properties,
            parent:that
          }
        },
        mounted(){
          that.createPropertyList();
          that.createLayeredDisplay();
        },
        methods:{
          openPropertyList(title){
            if(title == '入住企业数'){
              console.log(that)
              let domElement = document.getElementById('propertyList');
              if(domElement) domElement.style.display='block';
            }
          },
          openLayeredDisplay(title,buildingProperties,parent){
            if(buildingProperties&&buildingProperties.name == '东升大厦'){
              let domElement = document.getElementById('buildingContainer');
              if(domElement) domElement.style.display='block';
              //ai弹窗 楼宇
              parent.host.stopAiPersonPlayer();
              parent.host.aiPersonPopup(14,true);
              this.audioPlayer = new Audio(require('@/assets/smartStreet/louyu.wav'));
              parent.host.aiPersonPlayer = this.audioPlayer;
              this.audioPlayer.play();
              this.audioPlayer.addEventListener("ended", event => {
                this.audioPlayer&&this.audioPlayer.pause();
                parent.host.stopAiPersonPlayer();
                parent.host.aiPersonPopup('',false);
              });
              // setTimeout(() => {
              //   this.audioPlayer&&this.audioPlayer.pause();
              //   parent.host.aiPersonPopup('',false);
              // },21000);
            }else if(title == '总楼层'){
              console.log(that)
              let domElement = document.getElementById('layeredDisplay');
              if(domElement) domElement.style.display='block';
            }
          }
        },
        beforeDestroy(){
          let dom1 = document.getElementById('propertyList');
          let dom2 = document.getElementById('layeredDisplay');
          if(dom1) dom1.style.display='none';
          if(dom2) dom2.style.display='none';
        }
      });
      const profile = new Profile().$mount();
      return{
        title: windowTitle,
        content: profile.$el
      }
    }
    createPropertyList(){
      let dom = document.getElementById("propertyListBox");
      if(!dom) return;
      let PopTemp = Vue.extend(PropertyList);
      new PopTemp({
          data() {},
          methods: {
            handleClose() {
              let domElement = document.getElementById('propertyList');
              if(domElement) domElement.style.display='none';
            }
          }
      }).$mount('#propertyListBox')
    }
    createLayeredDisplay(){
      var that = this;
      let dom = document.getElementById("layeredDisplayBox");
      if(!dom) return;
      let PopTemp = Vue.extend(LayeredDisplay);
      new PopTemp({
          data() {
            return{
              parent:that
            }
          },
          methods: {
            handleClose() {
              let domElement = document.getElementById('layeredDisplay');
              if(domElement) domElement.style.display='none';
              // ai弹窗及语音关闭 楼层
              that.host.stopAiPersonPlayer();
              that.host.aiPersonPopup('',false);
            }
          }
      }).$mount('#layeredDisplayBox')
    }

    // 调用方法：
    // let imgUrl = require('@/assets/smartStreet/smart_well_lid.png');
    // this.createPictureUiMarker(target.getCoordinates(),imgUrl); //参数： 点位坐标，图片地址(图片是弹窗的全图切图)
    createPictureUiMarker(coordinate,pictureUrl){
        let that = this;
        //清除上一个弹窗
        if(that.uiMarker3) {
          that.uiMarker3.remove()
        }
        //弹窗内容
        let imgUrl = pictureUrl || '';
        //模板
        let template = `<div class="profile">                 
          <div class="profile-picture">
            <div class="close-div" @click="closeUiMarker"></div>
            <img class="picture" :src="imgUrl"/>
          </div>
        </div>`;
        let Profile = Vue.extend({
          template: template,
          data: function () {
            return {
              imgUrl: imgUrl,
            }
          },
          methods: {
            closeUiMarker() {
              that.uiMarker3.remove()
            }
          }
        })
    
        const profile = new Profile().$mount();
        that.uiMarker3 = new maptalks.ui.UIMarker(coordinate, {
          containerClass: "UIMarker3",//css类名
            horizontalAlignment:'right',
            verticalAlignment: 'top',
            // draggable : true,
            dx:140,
            dy:-100,
            content: profile.$el,
            eventsPropagation: false,
        });
        that.uiMarker3.addTo(that.viewer.map);
      }
    
    createEnergyInfoMarker(properties, flag){
      let content = null;
      let energyTitle = flag == 1 ? '产值' : (flag == 2 ? '今日耗水' : '今日耗电');
      let energyValue = flag == 1 ? properties['产值'] : (flag == 2 ? properties['今日耗水'] : properties['今日耗电']);
      let energyUnit = flag == 1 ? '亿元' : (flag == 2 ? '吨' : 'kW·h');
      
      let Profile = Vue.extend({
        template: `<div class="energy-info-content">
        <div class="info-box">
          <P class="info-title">{{energyTitle}}</P>
          <P class="info-text">
            <span class="text">{{energyValue}}</span>
            <span class="unit">{{energyUnit}}</span>
          </P>
        </div>
        </div>`,
        data: function () {
          return {
            energyTitle: energyTitle,
            energyValue: energyValue,
            energyUnit: energyUnit
          }
        }
      });
      const profile = new Profile().$mount();
      content = profile.$el;
      
      return{
        content: content
      }
    }

    addRedGreenLight(){
        let red={
            url: "./gltf/HongDeng.glb",
            scale:1.098,
            rotationZ: 87.221,
        }
        this.redLight1 = new GLTFMarker(
            [116.315952,39.991106,9.037951],
            {
                symbol: red,
            }
        ).addTo(this.viewer.gltfLayer);

        this.redLight2 = new GLTFMarker(
            [116.315952,39.991081,9.035585],
            {
                symbol: red,
            }
        ).addTo(this.viewer.gltfLayer);

        let green={
            url: "./gltf/LuDeng.glb",
            scale:1.098,
            rotationZ: 87.221,
        }
        this.greenLight1 = new GLTFMarker(
            [116.315953,39.991106,9.037951],
            {
                symbol: green,
            }
        ).addTo(this.viewer.gltfLayer);

        this.greenLight2 = new GLTFMarker(
            [116.315953,39.991081,9.035585],
            {
                symbol: green,
            }
        ).addTo(this.viewer.gltfLayer);

        new GLTFMarker(
            [116.327224,39.991388,9.825189],
            {
                symbol: green,
            }
        ).addTo(this.viewer.gltfLayer);
        new GLTFMarker(
            [116.327222,39.991352,9.821929],
            {
                symbol: green,
            }
        ).addTo(this.viewer.gltfLayer);

        new GLTFMarker(
            [116.331073,39.991482,8.961536],
            {
                symbol: green,
            }
        ).addTo(this.viewer.gltfLayer);
        new GLTFMarker(
            [116.331073,39.991471,8.959283],
            {
                symbol: green,
            }
        ).addTo(this.viewer.gltfLayer);

    }
}
export default SmartStreet