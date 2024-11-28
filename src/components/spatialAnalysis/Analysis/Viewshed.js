import * as maptalks from 'maptalks-gl';
import { ViewshedAnalysis } from 'maptalks-gl';
//可视域
class Viewshed {
  constructor(viewer) {
    this.map = viewer.map;
    this.groupLayer = null;
    this.viewshedAnalysis = null;    
    this.drawTool = null;
    this.options = null;
    this.eyePos = null; //观察者位置
    this.lookPoint = null; //观察目标位置
    this.coordinates = [];
    this.first = true;
    this._init();
  }
  _init() {
    let groupLayer = this.map.getLayer("group");
    this.groupLayer = groupLayer;

    this.drawTool = new maptalks.DrawTool({
      mode: "LineString",
      symbol: {
        lineOpacity: 0
      }
    }).addTo(this.map);
    
    this._disable();//初始化清空
    this._registerEvents();//注册事件
  }
  _registerEvents(){
    this.drawTool.on("mousemove", (e) => {
      const coordinate = this._getPickedCoordinate(e.coordinate);
      if (!coordinate) {
        return;
      }
      if (this.first) {
        this.coordinates.push(coordinate);
      } else {
        this.coordinates[this.coordinates.length - 1] = coordinate;
      }
      e.geometry.setCoordinates(this.coordinates);
      this.lookPoint = [...coordinate];
      this.viewshedAnalysis.update("lookPoint", this.lookPoint);
      this.first = false;
    });
    
    this.drawTool.on("drawvertex", (e) => {
      const coordinate = this._getPickedCoordinate(e.coordinate);
      if (!coordinate) {
        return;
      }
      if (this.first) {
        this.coordinates.push(coordinate);
        this.first = false;
      } else {
        this.coordinates[this.coordinates.length - 1] = coordinate;
        this.first = true;
      }
      e.geometry.setCoordinates(this.coordinates);
      this.lookPoint = [...coordinate];
      this.viewshedAnalysis.update("lookPoint", this.lookPoint);
      this.drawTool.disable();
    });
    
    this.drawTool.on("drawstart", (e) => {
      const coordinate = this._getPickedCoordinate(e.coordinate);
      if (!coordinate) {
        return;
      }
      this.coordinates.push(coordinate);
      e.geometry.setCoordinates(this.coordinates);
      this.eyePos = [...coordinate];
      this._computeLookPoint();
      this.first = true;
    });
  }
  _enable(optionsObj) {
    this._clear();
    this.options = optionsObj;
    this.drawTool.enable();
  }
  _disable() {
    this.drawTool.disable();
  }
  _draw() {
    this.viewshedAnalysis = new ViewshedAnalysis({
      eyePos: this.eyePos,
      lookPoint: this.lookPoint,
      verticalAngle: this.options.verticalAngle,
      horizontalAngle: this.options.horizontalAngle
    });
    this.viewshedAnalysis.addTo(this.groupLayer);
  }
  _update(option,optionsObj) {
    if(!this.viewshedAnalysis) return;
    this.options = optionsObj;
    if(option == "horizontalAngle" || option == "verticalAngle"){
      this.viewshedAnalysis.update(option, this.options[option]);
    }else if(option == "direction"){
      this._updateDirection();
    }else if(option == "distance"){
      this._updateDistance();
    }
  }
  _clear() {
    if(!this.viewshedAnalysis) return;
    this.groupLayer.removeAnalysis(this.viewshedAnalysis);
    this.viewshedAnalysis = null;
    this._disable();
    this.eyePos = null;
    this.lookPoint = null;
    this.options = null;
    this.coordinates = [];
    this.first = true;
  }
  _computeLookPoint(){
    let distance = this.options.distance;
    let angle = this.options.direction; //角度
    const x = this.eyePos[0] + (distance / 10000) * Math.cos((angle / 180) * Math.PI);
    const y = this.eyePos[1] + (distance / 10000) * Math.sin((angle / 180) * Math.PI);
    this.lookPoint = [x, y, 0];
    this._draw();
  }
  _updateDirection(){
    let distance = Math.sqrt(
      Math.pow(this.eyePos[0]-this.lookPoint[0], 2) + Math.pow(this.eyePos[1]-this.lookPoint[1], 2)
    );
    let angle = this.options.direction; //角度
    const x = this.eyePos[0] + distance * Math.cos((angle / 180) * Math.PI);
    const y = this.eyePos[1] + distance * Math.sin((angle / 180) * Math.PI);
    this.lookPoint = [x, y, 0];
    this.viewshedAnalysis.update('lookPoint',this.lookPoint);
  }
  _updateDistance(){
    let distance = this.options.distance;
    const radian = Math.atan2(this.lookPoint[1] - this.eyePos[1], this.lookPoint[0] - this.eyePos[0]);  //弧度
    const x = this.eyePos[0] + (distance / 10000) * Math.cos(radian);
    const y = this.eyePos[1] + (distance / 10000) * Math.sin(radian);
    this.lookPoint = [x, y, 0];
    this.viewshedAnalysis.update('lookPoint',this.lookPoint);
  }
  _getPickedCoordinate(coordinate) {
    const identifyData = this.groupLayer.identify(coordinate)[0];
    return (identifyData && identifyData.coordinate) || [coordinate.x, coordinate.y, coordinate.z || 0];
  }
}
export default Viewshed