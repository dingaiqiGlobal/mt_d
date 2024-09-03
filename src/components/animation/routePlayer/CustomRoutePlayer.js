import * as maptalks from 'maptalks';
import { GLTFMarker } from "@maptalks/gl-layers";
import { RoutePlayer, formatRouteData } from 'maptalks.routeplayer';
import Vue from "vue/dist/vue.esm.js"; //特殊引用
import "./InfoWindow.css";

class CustomRoutePlayer {
    constructor(map) {
        this.map = map
        this.groupLayer = this.map.getLayer("group")
        this.gltfLayer = this.groupLayer.getLayer("gltf")

        this.oldPlayer = null
        this.expressCarPlayer = null
        this.ambulancePlayer = null

    }
    oldRoute() {
        //初始化快递车
        if (this.expressCarPlayer == null) {
            this.expressCarRoute();
        }
        //初始化救护车
        if (this.ambulancePlayer == null) {
            this.ambulanceRoute();
        }

        function loadRouteLines() {
            fetch("data/json/routePlayer/path_old.json")
                .then((response) => {
                    return response.json();
                })
                .then((geojson) => {
                    let features = geojson.features;
                    let route = features[0].geometry.coordinates;
                    task(route);
                });
        }
        loadRouteLines();
        //任务
        let _this = this;
        function task(routeNode) {
            //添加海拔
            for (let i = 0; i < routeNode.length; i++) {
                if (i > 5) {
                    routeNode[i] = [routeNode[i][0], routeNode[i][1], 1.5];
                } else {
                    routeNode[i] = [routeNode[i][0], routeNode[i][1], 1];
                }
            }
            //添加old模型
            let start = routeNode[0];
            let old = new GLTFMarker([start[0], start[1], 1], {
                symbol: {
                    url: "data/model/Fox/Fox.gltf",
                    modelHeight: 10,
                    shader: "pbr",
                    animation: true,
                    animationName: "Survey",//Survey//Walk//Run
                    loop: true,//是否开启动画循环
                },
            }).addTo(_this.gltfLayer)
            //轨迹
            const data = formatRouteData(routeNode, {
                duration: 1000 * 3 * 100,//持续时间
            });
            _this.oldPlayer = new RoutePlayer(data, {
                showTrail: true, //跟踪
                speed: 7, //速度
                autoPlay: false, //是否自动播放
                repeat: false, //是否重复播放
                unitTime: 1, //单位时间
                // debug: true, //调试
                // showRoute: true,
                // lineSymbol: {
                //     lineColor: "#FFFFFF",
                //     lineWidth: 100,
                // },
            });
            //开始监听
            _this.oldPlayer.on("playstart", (e) => {

            })
            //结束监听
            _this.oldPlayer.on('playend', (e) => {
                _this.oldPlayer.reset();
                _this.map.flyTo({//改变视图
                    zoom: 17.5,
                    center: [116.328460, 39.989480],
                    pitch: 15,
                    bearing: 0
                })
                _this.ambulancePlayer.play()//救护车

            })
            //运行中监听(类比节点监听vertex，这个更灵活)
            _this.oldPlayer.on("playing", (e) => {
                old.setCoordinates(e.coordinate);//实施更新位置
                //初始位置routeNode[0]
                if (e.coordinate[0] == start[0] && e.coordinate[1] == start[1]) {
                    _this.oldPlayer.pause();
                    setTimeout(() => {
                        old.setCurrentAnimation("Walk"); //gltf动画切换动作
                        _this.oldPlayer.play();
                    }, 2 * 1000)
                }

                //弹框
                let MJPosition = routeNode[1];//智慧门禁
                let JGPosition = routeNode[2];//智慧井盖
                let LJTPosition = routeNode[3];//智能垃圾桶
                let KDCPosition = routeNode[4];//快递车
                let LDPosition = routeNode[5];//智慧路灯
                let DaoPosition = routeNode[6];//老人摔倒
                if (e.coordinate[0] == MJPosition[0] && e.coordinate[1] == MJPosition[1]) {
                    old.setCurrentAnimation("Survey");//动画修改
                    _this.oldPlayer.pause()

                    setTimeout(() => {
                        old.setCurrentAnimation("Walk");//动画修改
                        _this.oldPlayer.play();
                    }, 2 * 1000)

                    _this.gltfLayer.forEach(function (gltf) {
                        let json = gltf.toJSON();
                        if (json.options && json.options.id && json.options.id == "门禁") {
                            gltf.setInfoWindow({
                                content: _this.createInfoWindow(gltf, "门禁", ["内容1", "内容2"]).content,
                            });
                            gltf.openInfoWindow();
                        }
                        //2s关闭弹框也可以用节点的方式去关闭
                        setTimeout(() => {
                            gltf.closeInfoWindow();
                        }, 2 * 1000)

                    })
                }
                if (e.coordinate[0] == JGPosition[0] && e.coordinate[1] == JGPosition[1]) {
                    _this.gltfLayer.forEach(function (gltf) {
                        let json = gltf.toJSON();
                        if (json.options && json.options.id && json.options.id == "井盖") {
                            gltf.setInfoWindow({
                                content: _this.createInfoWindow(gltf, "井盖", ["内容1", "内容2"]).content,
                            });
                            gltf.openInfoWindow();
                        }
                    })
                }
                if (e.coordinate[0] == LJTPosition[0] && e.coordinate[1] == LJTPosition[1]) {
                    _this.gltfLayer.forEach(function (gltf) {
                        let json = gltf.toJSON();
                        if (json.options && json.options.id && json.options.id == "垃圾桶") {
                            gltf.setInfoWindow({
                                content: _this.createInfoWindow(gltf, "垃圾桶", ["内容1", "内容2"]).content,
                            });
                            gltf.openInfoWindow();
                        }

                    })
                }
                if (e.coordinate[0] == KDCPosition[0] && e.coordinate[1] == KDCPosition[1]) {
                    _this.expressCarPlayer.play();//快递车开始
                }
                if (e.coordinate[0] == LDPosition[0] && e.coordinate[1] == LDPosition[1]) {
                    _this.gltfLayer.forEach(function (gltf) {
                        let json = gltf.toJSON();
                        if (json.options && json.options.id && json.options.id == "路灯") {
                            gltf.setInfoWindow({
                                content: _this.createInfoWindow(gltf, "路灯", ["内容1", "内容2"]).content,
                            });
                            gltf.openInfoWindow();
                        }
                    })
                }
                if (e.coordinate[0] == DaoPosition[0] && e.coordinate[1] == DaoPosition[1]) {
                    old.setCurrentAnimation("Run");//动画修改
                }
                //初始化视图并跟随***
                let position = [e.coordinate[0], e.coordinate[1], 14];
                _this.map.setCameraOrientation({
                    position: position,
                    pitch: 80,
                    bearing: 180,
                });
            })
            _this.oldPlayer.play();//开始
        }
    }
    expressCarRoute() {
        function loadRouteLines() {
            fetch("data/json/routePlayer/path_expressCar.json")
                .then((response) => {
                    return response.json();
                })
                .then((geojson) => {
                    let features = geojson.features;
                    let route = features[0].geometry.coordinates;
                    task(route);
                });
        }
        loadRouteLines();
        let _this = this;
        function task(routeNode) {
            for (let i = 0; i < routeNode.length; i++) {
                if (i > 5) {
                    routeNode[i] = [routeNode[i][0], routeNode[i][1], 1.5];
                } else {
                    routeNode[i] = [routeNode[i][0], routeNode[i][1], 1];
                }
            }
            let start = routeNode[0];
            let expressCar = new GLTFMarker([start[0], start[1], 1], {
                symbol: {
                    url: "data/model/CesiumMilkTruck.glb",
                    modelHeight: 3,
                    shader: "pbr",
                    animation: true,
                    loop: true,
                },
            }).addTo(_this.gltfLayer)

            const data = formatRouteData(routeNode, {
                duration: 1000 * 3 * 100,
            });
            _this.expressCarPlayer = new RoutePlayer(data, {
                showTrail: true,
                speed: 7,
                autoPlay: false,
                repeat: false,
                unitTime: 1,
            });

            _this.expressCarPlayer.on("playstart", (e) => {

            })

            _this.expressCarPlayer.on('playend', (e) => {
                _this.expressCarPlayer.reset();

            })

            _this.expressCarPlayer.on("playing", (e) => {
                expressCar.setCoordinates(e.coordinate);
            })
        }
    }
    ambulanceRoute() {
        function loadRouteLines() {
            fetch("data/json/routePlayer/path_ambulance.json")
                .then((response) => {
                    return response.json();
                })
                .then((geojson) => {
                    let features = geojson.features;
                    let route = features[0].geometry.coordinates;
                    task(route);
                });
        }
        loadRouteLines();
        let _this = this;
        function task(routeNode) {
            for (let i = 0; i < routeNode.length; i++) {
                if (i > 5) {
                    routeNode[i] = [routeNode[i][0], routeNode[i][1], 1.5];
                } else {
                    routeNode[i] = [routeNode[i][0], routeNode[i][1], 1];
                }
            }
            let start = routeNode[0];
            let ambulance = new GLTFMarker([start[0], start[1], 1], {
                symbol: {
                    url: "data/model/CesiumMilkTruck.glb",
                    modelHeight: 3,
                    shader: "pbr",
                    animation: true,
                    loop: true,
                },
            }).addTo(_this.gltfLayer)

            const data = formatRouteData(routeNode, {
                duration: 1000 * 3 * 100,
            });
            _this.ambulancePlayer = new RoutePlayer(data, {
                showTrail: true,
                speed: 7,
                autoPlay: false,
                repeat: false,
                unitTime: 1,
            });

            _this.ambulancePlayer.on("playstart", (e) => {

            })

            _this.ambulancePlayer.on('playend', (e) => {
                _this.ambulancePlayer.reset();

            })

            _this.ambulancePlayer.on("playing", (e) => {
                ambulance.setCoordinates(e.coordinate);
                ambulance.updateSymbol({
                    rotationZ: e.rotationZ+180,
                });
            })
        }
    }
    createInfoWindow(target, boxTitle, boxContent) {
        let Profile = Vue.extend({
            template: `<div class="infoWindow">
            <div class="title-box">{{title}}<span class="close-btn" @click="close">X</span></div>
            <div class="content-box">
              <div class="content-group">
                <div class="content-item" v-for="item in dataList" :key="item.id">
                  <span>{{item}}</span>
                </div>
              </div>
            </div>
            </div>`,
            data() {
                return {
                    title: boxTitle,
                    dataList: boxContent,
                };
            },
            methods: {
                close() {
                    if (!target) return;
                    target.closeInfoWindow();
                },
            },
        });
        const profile = new Profile().$mount();
        return {
            content: profile.$el,
        };

    }
}
export default CustomRoutePlayer