import * as maptalks from 'maptalks';
import { randomUUID } from '@/utils/util';
import { GLTFLayer, GLTFMarker } from "@maptalks/gl-layers";
import { RoutePlayer, formatRouteData } from 'maptalks.routeplayer';
import UIMarkerLayer from "./UIMarkerLayer";
import "./SceneDemo.less";
class SceneDemo {
  constructor(viewer, options) {
    this.viewer = viewer;
    this.host = options.host;
    this.gltfLayer = null;//本地的gltfLayer
    this.peopleAudio = null;
    this.startCoord = {
      "coordinate": [
        116.328224, 39.991451,
        0
      ],
      "rotationX": 0,
      "rotationZ": -180
    };
    //模型
    this.gltfPeople = null;
    this.gltfCar = null;
    this.gltfExpressCar = null;
    //路径
    this.playerPeople = null;
    this.playerCar = null;
    this.playerExpressCar = null;
  }
  /**
   * 人
   */
  loadData() {
    this.addPeopleModel();
    fetch("./gltf/path_old.json")
      .then((response) => {
        return response.json();
      })
      .then((res) => {
        let route = [];
        let features = res.features;
        for (let i = 0; i < features.length; i++) {
          route.push(features[i].geometry.coordinates);
        }
        setTimeout(() => {
          this.peopleRoutePlayer(route);
        }, 1000)

      });
  }
  peopleRoutePlayer(route) {
    const data = formatRouteData(route[0], {
      duration: 1000 * 60 * 10
    });

    this.playerPeople = new RoutePlayer(data, {
      unitTime: 1,//单位时间
      speed: 7,//速度
      debug: true,//调试
      autoPlay: true,//是否自动播放
      repeat: false,//是否重复播放
    })

    /**
     * 事件监听
     */
    this.playerPeople.on('playing', e => {
      //设置地图一直在中心auto set map center
      this.viewer.map.setCenter(e.coordinate);
      let position = [e.coordinate[0], e.coordinate[1], 9];
      let pitch = this.getPitch(e.rotationX);
      let bearing = -e.rotationZ;
      this.viewer.map.setCameraOrientation({
        position: position,
        pitch: pitch,
        bearing: bearing,
      });
      this.updatePeopleModelPosition(e);
    });
    this.playerPeople.play();
    //节点
    this.playerPeople.on('vertex', e => {
      if (this.playerPeople.isPlaying()) {
        this.showEventInfo(e)
      }
    });
    //行走结束>车行驶
    this.playerPeople.on('playend', e => {
      this.uiMarkerLayer.remove()
      setTimeout(() => {
        this.viewer.map.flyTo({
          zoom: 17.5,
          center: [116.328460, 39.989480],
          pitch: 15,
          bearing: 0
        })
        fetch("./gltf/path_ambulance.json")
          .then((response) => {
            return response.json();
          })
          .then((res) => {
            let route = [];
            let features = res.features;
            for (let i = 0; i < features.length; i++) {
              route.push(features[i].geometry.coordinates);
            }
            this.carRoutePlayer(route);
          });
      }, 11 * 1000)
    })
  }
  addPeopleModel() {
    this.gltfLayer = new GLTFLayer("old_gltf");
    this.viewer.groupLayer.addLayer(this.gltfLayer);

    const info = this.startCoord;
    this.gltfPeople = new GLTFMarker(info.coordinate, {
      id: randomUUID(),
      symbol: {
        shader: "pbr",
        animation: true,
        loop: true,
        animationName: "zou",
        url: "./gltf/LaoRen.glb",
        modelHeight: 3,
        translationZ: 5,
      },
    });
    this.gltfPeople.setProperties({ name: '独居老人', });
    this.gltfLayer.addGeometry(this.gltfPeople);
    this.updatePeopleModelPosition(info);
  }
  updatePeopleModelPosition(e) {
    const modelOffsetAngle = 180;
    const { coordinate, rotationZ, rotationX } = e;
    if (!this.gltfPeople) {
      return;
    }
    this.gltfPeople.setCoordinates(coordinate);
    this.gltfPeople.setRotation(rotationX, 0, rotationZ + modelOffsetAngle);
  }
  showEventInfo(e) {
    //let coordinate = e.data.coordinate;
    let index = e.index;
    if (index === 3) {
      this.playerPeople.pause();
      //播放语言
      this.peopleAudio = null;
      this.peopleAudio = new Audio(require('@/assets/smartStreet/老人进小区.wav'))
      this.peopleAudio.play()
      this.host.aiPersonPopup(9, true);//机器人
      
      this.uiMarker(this.getModelCoordinate('人脸识别'), "人脸识别")
      setTimeout(() => {
        this.playerPeople.play();
        this.uiMarkerLayer.remove();
        this.host.aiPersonPopup(9, false);//机器人
      }, 9 * 1000)
    }
    if (index === 4) {
      this.uiMarker(this.getModelCoordinate('通信井盖基本信息'), "通信井盖基本信息");
      this.host.aiPersonPopup(10, true);//机器人
      setTimeout(() => {
        this.uiMarkerLayer.remove();
        this.host.aiPersonPopup(10, false);//机器人
      }, 12 * 1000)
    }
    if (index === 5) {
      this.uiMarker(this.getModelCoordinate('智能垃圾桶'), "智能垃圾桶")
      this.host.aiPersonPopup(11, true);//机器人
      setTimeout(() => {
        this.uiMarkerLayer.remove();
        this.host.aiPersonPopup(11, false);//机器人
      }, 11 * 1000)
    }
    if (index === 6) {
      //添加快递车
      fetch("./gltf/path_expressCar.json")
        .then((response) => {
          return response.json();
        })
        .then((res) => {
          let route = [];
          let features = res.features;
          for (let i = 0; i < features.length; i++) {
            route.push(features[i].geometry.coordinates);
          }
          this.expressCarRoutePlayer(route);
        })
    }

    if (index === 8) {
      this.uiMarker(this.getModelCoordinate('智慧路灯基本信息'), "智慧路灯基本信息")
      setTimeout(() => {
        this.uiMarkerLayer.remove()
      }, 3 * 1000)
    }
    if (index === 9) {
      this.gltfPeople.setCurrentAnimation("dao");//gltf动画切换动作
      if (this.uiMarkerLayer) {
        this.uiMarkerLayer.remove();//移除uiMarker
      }
      //新版弹框播放图片
      //let coordinate = this.getLocalModelCoordinate("独居老人");//方式1
      let coordinate = this.playerPeople.getCurrentCoordinate();
      this.pictureUiMarker(coordinate, `/file/people/1.png`);//立即执行第一个弹框

      //播放语音
      this.peopleAudio = null;
      this.peopleAudio = new Audio(require('@/assets/smartStreet/老人跌倒.wav'))
      this.peopleAudio.play();
      this.host.aiPersonPopup(13, true);//机器人

      let i = 2;
      let intervalId = setInterval(() => {
        let imgPath = `/file/people/${i}.png`
        this.pictureUiMarker(coordinate, imgPath);
        i++;
        if (i == 6) {
          clearInterval(intervalId);
          setTimeout(() => {
            if (this.uiMarker2) {
              this.uiMarker2.remove();
            }
          }, 2000)
        }
      }, 2000);
    }
  }
  getModelCoordinate(modelProperties) {
    let coordinate
    this.viewer.gltfLayer.forEach(function (gltf) {
      let json = gltf.toJSON();
      if (json.options.properties && json.options.properties.name && json.options.properties.name == modelProperties) {
        coordinate = gltf.getCoordinates()
      }
    })
    return coordinate
  }
  getPitch(pitch) {
    if (pitch > 270 && pitch < 350) {
      return pitch - 270;
    } else if (pitch >= 350 || (pitch >= 0 && pitch <= 180)) {
      return this.viewer.map.options["maxPitch"];
    } else {
      return 0;
    }
  }
  /**
   * 车
   */
  carRoutePlayer(route) {
    const data = formatRouteData(route[0], {
      duration: 1000 * 60 * 10
    });

    this.playerCar = new RoutePlayer(data, {
      unitTime: 1,//单位时间
      speed: 40,//速度
      debug: true,//调试
      autoPlay: true,//是否自动播放
      repeat: false,//是否重复播放
    })

    this.addCarModel();

    this.playerCar.on('playing', e => {
      this.updateCarModelPosition(e);
    });
    this.playerCar.play();
    this.playerCar.on('vertex', e => {
      this.intersectEvent(e)
    });
    this.playerCar.on('playend', e => {
      this.playerCar = null;
      this.playerPeople = null;
    });
  }
  addCarModel() {
    const info = this.playerCar.getStartInfo();
    this.gltfCar = new GLTFMarker(info.coordinate, {
      id: randomUUID(),
      symbol: {
        shader: "pbr",
        animation: true,
        loop: true,
        animationName: "Walk",
        url: "./gltf/JiuHuChe.glb",
        modelHeight: 5,
        translationZ: 5,
        //rotationZ: 90,
      },
    });
    //infoWindow-救护车
    let infoWindowObj = this.peopleInfoWindow("救护车");
    this.gltfCar.setInfoWindow({
      title: '救护车',
      content: infoWindowObj,
    })
    this.gltfCar.openInfoWindow();

    this.gltfLayer.addGeometry(this.gltfCar);
    this.updateCarModelPosition(info);
  }
  updateCarModelPosition(e) {
    const modelOffsetAngle = 180;
    const { coordinate, rotationZ, rotationX } = e;
    if (!this.gltfCar) {
      return;
    }
    this.gltfCar.setCoordinates(coordinate);
    this.gltfCar.setRotation(rotationX, 0, rotationZ + modelOffsetAngle);
  }
  intersectEvent(e) {
    let index = e.index;
    /**
     * 相遇时
     */
    if (index === 12) {
      this.playerCar.pause();
      this.gltfLayer.removeGeometry(this.gltfPeople);//清除人模型
      setTimeout(() => {
        this.playerCar.play();
      }, 1000)

    }
    /**
     * 车路线结束时
     */
    if (index === 18) {
      this.viewer.map.flyTo({
        zoom: 17.5,
        center: [116.332000, 39.995370],
        pitch: 15,
        bearing: 0
      }, {
        duration: 2000,
        easing: 'out'
      })


      let coordinate = this.playerCar.getCurrentCoordinate();
      this.pictureUiMarker3(coordinate, `/file/car/1.png`);
      setTimeout(() => {
        if (this.uiMarker3) {
          this.uiMarker3.remove();
        }
      }, 3000);
      this.gltfLayer.removeGeometry(this.gltfCar);//清除车模型
      this.viewer.groupLayer.removeLayer(this.gltfLayer);//清除模型图层
      this.host.aiPersonPopup(13, false);//机器人
    }
  }

  /**
   * 快递车
   */
  expressCarRoutePlayer(route) {
    const data = formatRouteData(route[0], {
      duration: 1000 * 6 * 2
    });

    this.playerExpressCar = new RoutePlayer(data, {
      unitTime: 1,//单位时间
      speed: 0.5,//速度
      debug: true,//调试
      autoPlay: true,//是否自动播放
      repeat: false,//是否重复播放
    })

    this.addExpressCarModel();
    this.playerExpressCar.play();

    this.playerExpressCar.on('playing', e => {
      this.updateExpressCarModelPosition(e);
    })
    this.playerExpressCar.on('vertex', e => {
      this.expressCarIntersectEvent(e)
    });
    this.playerExpressCar.on('playend', e => {
      this.playerExpressCar = null;
      //清除弹框
      setTimeout(() => {
        if (this.gltfExpressCar.getInfoWindow() != null) {
          this.gltfExpressCar.removeInfoWindow()
          this.host.aiPersonPopup(12, false);//机器人
        }
      }, 2000)
    });
  }
  addExpressCarModel() {
    const info = this.playerExpressCar.getStartInfo();
    this.gltfExpressCar = new GLTFMarker(info.coordinate, {
      id: randomUUID(),
      symbol: {
        shader: "pbr",
        animation: true,
        loop: true,
        url: "./gltf/expressCar.glb",
        modelHeight: 2,
        translationZ: 5,
        //rotationZ: 90,
      },
    });

    this.gltfLayer.addGeometry(this.gltfExpressCar);
    this.updateExpressCarModelPosition(info);
  }
  updateExpressCarModelPosition(e) {
    const modelOffsetAngle = 270;
    const { coordinate, rotationZ, rotationX } = e;
    if (!this.gltfExpressCar) {
      return;
    }
    this.gltfExpressCar.setCoordinates(coordinate);
    this.gltfExpressCar.setRotation(rotationX, 0, rotationZ + modelOffsetAngle);
  }
  expressCarIntersectEvent(e) {
    let coordinate = e.data.coordinate;
    let index = e.index;
    if (index === 0) {
      // if (this.gltfExpressCar.getInfoWindow() != null) {
      //   this.gltfExpressCar.removeInfoWindow()
      // }
      this.host.aiPersonPopup(12, true);//机器人
      let infoWindowObj = this.vrhicleInfoWindow("无人快递配送");
      this.gltfExpressCar.setInfoWindow({
        title: '无人快递配送',
        content: infoWindowObj,
      })
      this.gltfExpressCar.openInfoWindow();
    }
    if (index === 3) {
      // if (this.gltfExpressCar.getInfoWindow() != null) {
      //   this.gltfExpressCar.removeInfoWindow()
      // }
      let infoWindowObj = this.vrhicleInfoWindow("收件人信息");
      this.gltfExpressCar.setInfoWindow({
        title: '收件人信息',
        content: infoWindowObj,
      })
      this.gltfExpressCar.openInfoWindow();
    }
    if (index === 4) {
      // if (this.gltfExpressCar.getInfoWindow() != null) {
      //   this.gltfExpressCar.removeInfoWindow()
      // }
      let infoWindowObj = this.vrhicleInfoWindow("包裹信息");
      this.gltfExpressCar.setInfoWindow({
        title: '包裹信息',
        content: infoWindowObj,
      })
      this.gltfExpressCar.openInfoWindow();
    }
  }



  /**
   * ui
   */
  uiMarker(coordinate, title) {
    let that = this;
    //弹窗标题
    let windowTitle = title || '';
    //弹窗内容
    let data = null;
    //模板
    let template = '';

    switch (title) {
      case '人脸识别':
        data = {
          titleText: "业主人脸识别系统",
          content: [
            { key: '1', title: '姓名', value: '张女士' },
            { key: '2', title: '最近进出时间', value: '8月29日 7:30' },
            { key: '3', title: '地址', value: '12#楼3单元503' },
            { key: '4', title: '', value: '' },
          ],
          imgGroup: [
            { key: '1', img: require('@/assets/smartStreet/exit.png') },
            { key: '2', img: require('@/assets/smartStreet/face1.png') },
            { key: '3', img: require('@/assets/smartStreet/face2.png') },
          ]
        };
        template = `<div class="profile">
            <div class="title-box">{{title}}<span class="close-btn" @click="closeUiMarker">X</span></div>
            <div class="profile-type1">
              <div class="imageBox">
                <img class="image1" :src="imgGroup[0].img"/>
                <img class="image2" :src="imgGroup[1].img"/>
                <img class="image2" :src="imgGroup[2].img"/>
              </div>
              <div class="headline">{{titleText}}</div>
              <div class="content-box">
                <div class="content-item" v-for="item in dataList" :key="item.key">
                  <div class="item-title">{{item.title}}</div>
                  <div class="item-text">{{item.value}}</div>
                </div>
              </div>
            </div>
        </div>`;
        break;
      case '通信井盖基本信息':
        data = {
          content: [
            { key: '1', title: '部件名称', value: '通信井盖' },
            { key: '2', title: '标识ID', value: '110108011807777' },
            { key: '3', title: '位置', value: '华清嘉园社区' },
            { key: '4', title: '所属街道', value: '中关村街道' },
            { key: '5', title: '运行状态', value: '正常', img: require('@/assets/smartStreet/status.png') }
          ],
          imgGroup: [
            { key: '1', img: require('@/assets/smartStreet/smart_well_lid.png') },
          ],
          audioUrl: require('@/assets/smartStreet/井盖位移.wav'),
        };
        template = `<div class="profile">
          <div class="title-box">{{title}}<span class="close-btn" @click="closeUiMarker">X</span></div>
          <div class="profile-type5">
            <div class="part1">
              <div class="text-box">
                <div class="content-item" v-for="item in dataList" :key="item.key">
                  <div class="item-title">{{item.title}}</div>
                  <div class="item-text">{{item.value}}<img v-if="item.img" :src="item.img"/></div>
                </div>
              </div>
              <div class="image-box">
                <img :src="imgGroup[0].img"/>
              </div>
            </div>
            <div class="part2">
              <audio v-if="audioUrl!=''" id="audioPlayer" :src="audioUrl" autoplay controls></audio>
            </div>
          </div>
        </div>`;
        break;
      case '智慧路灯基本信息':
        data = {
          content: [
            { key: '1', title: '部件名称', value: '智慧路灯杆' },
            { key: '2', title: '标识ID', value: '110108011807209' },
            { key: '3', title: '位置', value: '华清嘉园社区' },
            { key: '4', title: '所属街道', value: '中关村街道' },
            { key: '5', title: '运行状态', value: '正常', img: require('@/assets/smartStreet/status.png') }
          ],
          imgGroup: [
            { key: '1', img: require('@/assets/smartStreet/smart_lamp.png') },
          ]
        };
        template = `<div class="profile">
            <div class="title-box">{{title}}<span class="close-btn" @click="closeUiMarker">X</span></div>
            <div class="profile-type6">
              <div class="part1">
                <div class="text-box">
                  <div class="content-item" v-for="item in dataList" :key="item.key">
                    <div class="item-title">{{item.title}}</div>
                    <div class="item-text">{{item.value}}<img v-if="item.img" :src="item.img"/></div>
                  </div>
                </div>
                <div class="image-box">
                  <img :src="imgGroup[0].img"/>
                </div>
              </div>
            </div>
          </div>`;
        break;
      case '智能垃圾桶':
        data = {
          content: [
            { key: '1', title: '状态', value: '洁净' },
            { key: '2', title: '数值', value: '5%' }
          ],
          imgGroup: [
            { key: '1', img: require('@/assets/smartStreet/trash_can1.png') },
            { key: '1', img: require('@/assets/smartStreet/trash_can2.png') },
          ],
          audioUrl: require('@/assets/smartStreet/社区垃圾语音.wav'),
        };
        template = `<div class="profile">
            <div class="title-box">{{title}}<span class="close-btn" @click="closeUiMarker">X</span></div>
            <div class="profile-type7">
              <div class="part1">
                <div class="content-box">
                  <div class="content-item" v-for="item in dataList" :key="item.key">
                    <div class="item-title">{{item.title}}:</div>
                    <div class="item-text">{{item.value}}</div>
                  </div>
                </div>
                <div class="image-box">
                  <img :src="imgGroup[0].img"/>
                  <img :src="imgGroup[1].img"/>
                </div>
              </div>
              <div class="audio-box">
                <audio v-if="audioUrl!=''" id="audioPlayer" :src="audioUrl" autoplay controls></audio>
              </div>
            </div>
          </div>`;
        break;
    }
    //文字列表
    let dataList = data && data.content ? data.content : [];
    //文本标题
    let titleText = data && data.titleText ? data.titleText : '';
    //文字内容
    let textContent = data && data.textContent ? data.textContent : {};
    //识别内容
    let partObj = data && data.partObj ? data.partObj : {};
    let partTitle = partObj && partObj.title ? partObj.title : '';
    let partContent = partObj && partObj.content ? partObj.content : [];
    //图片组
    let imgGroup = data && data.imgGroup && data.imgGroup.length ? data.imgGroup : [];
    //音频
    let audioUrl = data && data.audioUrl ? data.audioUrl : '';

    let Profile = Vue.extend({
      template: template,
      data: function () {
        return {
          title: windowTitle,
          titleText: titleText,
          dataList: dataList,
          textContent: textContent,
          partTitle: partTitle,
          partContent: partContent,
          imgGroup: imgGroup,
          locationImg: require('@/assets/smartStreet/location.png'),
          audioUrl: audioUrl
        }
      },
      methods: {
        closeUiMarker() {
          this.$destroy();
          // 可选：从DOM中移除组件的挂载点
          const element = this.$el;
          element.parentNode.removeChild(element);
        }
      }
    })

    const profile = new Profile().$mount();
    that.uiMarkerLayer = new UIMarkerLayer().addTo(that.viewer.map);
    let uiMarker = new maptalks.ui.UIMarker(coordinate, {
      containerClass: "PeopleUIMarker",//css类名
      single: true,//false为全局单个标记
      content: profile.$el,
      verticalAlignment: 'top',
      eventsPropagation: false,//是否停止所有事件的传播（事件冒泡）
    });
    that.uiMarkerLayer.addMarker(uiMarker);
  }

  peopleInfoWindow(title) {
    //弹窗标题
    let windowTitle = title || '';
    //弹窗内容
    let data = null;
    //模板
    let template = '';

    switch (title) {
      case '老人行走':
        data = {
          titleText: "张女士",
          content: [
            { key: '1', title: '年龄', value: '75岁' },
            { key: '2', title: '既往病史', value: '心脏病、高血压' },
            { key: '3', title: '体温', value: '36.6°C' },
            { key: '4', title: '心率', value: '正常 65次/秒' },
            { key: '5', title: '血压', value: '正常 140/90mmHg' },
            { key: '6', title: '血糖', value: '正常 5.8mmol/L' },
          ],
          imgGroup: [
            { key: '1', img: require('@/assets/smartStreet/people1.png') },
          ],
        };
        template = `
        <div class="info-window1">
          <div class="image-box">
            <img :src="imgGroup[0].img"/>
          </div>
          <div class="content-box">
            <div class="headline">{{titleText}}</div>
            <div class="text-box">
              <div class="content-item" v-for="item in dataList" :key="item.key">
                <div class="item-title">{{item.title}}</div>
                <div class="item-text">{{item.value}}</div>
              </div>
            </div>
          </div>
        </div>`;
        break;
      case '老人摔倒':
        data = {
          titleText: "张女士",
          content: [
            { key: '1', title: '年龄', value: '75岁' },
            { key: '2', title: '既往病史', value: '心脏病、高血压' },
            { key: '3', title: '体温', value: '36.6°C' },
            { key: '4', title: '心率', value: '异常 112次/秒', img: require('@/assets/smartStreet/warning.png') },
            { key: '5', title: '血压', value: '异常 180/90mmHg', img: require('@/assets/smartStreet/warning.png') },
            { key: '6', title: '血糖', value: '正常 5.8mmol/L' },
          ],
          imgGroup: [
            { key: '1', img: require('@/assets/smartStreet/people2.png') },
          ]
        };
        template = `
        <div class="info-window2">
          <div class="image-box">
            <img class="picture" :src="imgGroup[0].img"/>
            <img class="btn-img" :src="locationImg"/>
          </div>
          <div class="content-box">
            <div class="headline">{{titleText}}</div>
            <div class="text-box">
              <div class="content-item" v-for="item in dataList" :key="item.key">
                <div class="item-title">{{item.title}}</div>
                <div class="item-text" :style="{'color': item.img ? '#FFE500':'#ffffff'}">{{item.value}}<img v-if="item.img" :src="item.img"/></div>
              </div>
            </div>
          </div>
        </div>`;
        break;
      case '救护车':
        data = {
          textContent: {
            title: "120车辆接警",
            text: "接收到120报警立即行动"
          },
          imgGroup: [
            { key: '1', img: require('@/assets/smartStreet/ambulance.png') },
          ],
        };
        template = `
        <div class="info-window3">
          <div class="image-box">
            <img class="picture" :src="imgGroup[0].img"/>
          </div>
          <div class="content-box">
            <div class="title">{{textContent.title}}</div>
            <div class="text">{{textContent.text}}</div>
          </div>
        </div>`;
        break;
    }
    //文字列表
    let dataList = data && data.content ? data.content : [];
    //文本标题
    let titleText = data && data.titleText ? data.titleText : '';
    //文字内容
    let textContent = data && data.textContent ? data.textContent : {};
    //识别内容
    let partObj = data && data.partObj ? data.partObj : {};
    let partTitle = partObj && partObj.title ? partObj.title : '';
    let partContent = partObj && partObj.content ? partObj.content : [];
    //图片组
    let imgGroup = data && data.imgGroup && data.imgGroup.length ? data.imgGroup : [];

    let Profile = Vue.extend({
      template: template,
      data: function () {
        return {
          title: windowTitle,
          titleText: titleText,
          dataList: dataList,
          textContent: textContent,
          partTitle: partTitle,
          partContent: partContent,
          imgGroup: imgGroup,
          locationImg: require('@/assets/smartStreet/location.png')
        }
      }
    })
    const profile = new Profile().$mount();
    return profile.$el
  }

  // 调用方法：
  // let imgUrl = require('@/assets/smartStreet/smart_well_lid.png');
  // this.pictureUiMarker(coordinate,imgUrl); //点位坐标，图片地址

  pictureUiMarker(coordinate, pictureUrl) {
    let that = this;
    //清除上一个弹窗
    if (that.uiMarker2) {
      that.uiMarker2.remove()
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
          this.$destroy();
          // 可选：从DOM中移除组件的挂载点
          const element = this.$el;
          element.parentNode.removeChild(element);
        }
      }
    })

    const profile = new Profile().$mount();
    that.uiMarker2 = new maptalks.ui.UIMarker(coordinate, {
      containerClass: "PictureUIMarker",//css类名
      single: true,//false为全局单个标记
      horizontalAlignment: 'right',
      verticalAlignment: 'top',
      // draggable : true,
      dx: 0,
      dy: -150,
      content: profile.$el,
      eventsPropagation: false,
    });
    that.uiMarker2.addTo(that.viewer.map);
  }

  pictureUiMarker2(coordinate, pictureUrl) {
    let that = this;
    //清除上一个弹窗
    if (that.uiMarker2) {
      that.uiMarker2.remove()
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
          this.$destroy();
          // 可选：从DOM中移除组件的挂载点
          const element = this.$el;
          element.parentNode.removeChild(element);
        }
      }
    })

    const profile = new Profile().$mount();
    that.uiMarker2 = new maptalks.ui.UIMarker(coordinate, {
      containerClass: "PictureUIMarker2",//css类名
      single: true,//false为全局单个标记
      horizontalAlignment: 'middle',
      verticalAlignment: 'middle',
      // draggable : true,
      dx: 0,
      dy: 0,
      content: profile.$el,
      eventsPropagation: false,
    });
    that.uiMarker2.addTo(that.viewer.map);
  }

  pictureUiMarker3(coordinate, pictureUrl) {
    let that = this;
    //清除上一个弹窗
    if (that.uiMarker3) {
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
          this.$destroy();
          // 可选：从DOM中移除组件的挂载点
          const element = this.$el;
          element.parentNode.removeChild(element);
        }
      }
    })

    const profile = new Profile().$mount();
    that.uiMarker3 = new maptalks.ui.UIMarker(coordinate, {
      containerClass: "PictureUIMarker3",//css类名
      single: true,//false为全局单个标记
      horizontalAlignment: 'right',
      verticalAlignment: 'top',
      // draggable : true,
      dx: 0,
      dy: -150,
      content: profile.$el,
      eventsPropagation: false,
    });
    that.uiMarker3.addTo(that.viewer.map);
  }
  vrhicleInfoWindow(title) {
    //弹窗标题
    let windowTitle = title || '';
    //弹窗内容
    let data = null;
    //模板
    let template = `<div class="single-window">
      <div class="content-box">
        <div class="content-item" v-for="item in dataList" :key="item.key">
          <div class="item-title">{{item.title}}:</div>
          <div class="item-text">{{item.value}}</div>
        </div>
      </div>
    </div>`;

    switch (title) {
      case '无人快递配送':
        data = {
          content: [
            { key: '1', title: '配送地址', value: '社区内部道路23号楼' },
            { key: '2', title: '预约配送时间', value: '7:00-13:00' },
            { key: '3', title: '计划派件', value: '135件' },
            { key: '4', title: '已完成派件', value: '58件' },
          ],
          imageUrl: require('@/assets/smartStreet/vrhicle.png'),
          audioUrl: require('@/assets/smartStreet/快递车.wav'),
        }
        template = `<div class="single-window2">
            <div class="part1">
              <div class="content-box">
                <div class="content-item" v-for="item in dataList" :key="item.key">
                  <div class="item-title">{{item.title}}:</div>
                  <div class="item-text">{{item.value}}</div>
                </div>
              </div>
              <div class="image-box">
                <img :src="imageUrl"/>
              </div>
            </div>
            <div class="part2">
              <audio v-if="audioUrl!=''" id="audioPlayer" :src="audioUrl" autoplay controls></audio>
            </div>
          </div>
        </div>`;
        break;
      case '收件人信息':
        data = {
          content: [
            { key: '1', title: '姓名', value: '张松' },
            { key: '2', title: '电话', value: '135****3674' },
            { key: '3', title: '状态', value: '信息发送中' },
            { key: '4', title: '收件地址', value: '海淀区' },
            { key: '5', title: '配送公司', value: '京东快递' },
            { key: '6', title: '车辆编号', value: 'JD34739084454' },
          ]
        }
        break;
      case '包裹信息':
        data = {
          content: [
            { key: '1', title: '快递单号', value: 'JD123456789' },
            { key: '2', title: '快递公司', value: '京东物流' },
            { key: '3', title: '商品名称', value: '女士手提包' },
            { key: '4', title: '重量', value: '1.2kg' },
            { key: '5', title: '价格', value: '￥599' },
            { key: '6', title: '签收状态', value: '已签收' },
            { key: '7', title: '签收人', value: '李女士' },
            { key: '8', title: '签收时间', value: '2024-08-29 8:05' },
          ]
        }
        break;
    }
    //文字列表
    let dataList = data && data.content ? data.content : [];
    //图片
    let imageUrl = data && data.imageUrl ? data.imageUrl : '';
    //音频
    let audioUrl = data && data.audioUrl ? data.audioUrl : '';

    let Profile = Vue.extend({
      template: template,
      data: function () {
        return {
          title: windowTitle,
          dataList: dataList,
          imageUrl: imageUrl,
          audioUrl: audioUrl
        }
      }
    })

    const profile = new Profile().$mount();
    return profile.$el;
  }
}
export default SceneDemo