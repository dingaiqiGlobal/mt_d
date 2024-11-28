import * as maptalks from 'maptalks-gl';
import { InSightAnalysis } from 'maptalks-gl';
//通视
class InSight {
  constructor(viewer) {
    this.map = viewer.map;
    this.groupLayer = null;
    this.vLayer = null;
    this.inSightAnalysis = null;    
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
    this.vLayer = new maptalks.VectorLayer("vLayer", {
      enableAltitude: true
    }).addTo(this.map);

    this.drawTool = new maptalks.DrawTool({
      mode: "LineString",
      enableAltitude: true,
      symbol: {
        lineColor: "#f00"
      }
    })
    .addTo(this.map);
    
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
      this.inSightAnalysis.update("lines", [
        {
          from: this.eyePos,
          to: this.lookPoint
        }
      ]);
      this._updateLabel();
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
      this.inSightAnalysis.enable();
      this.lookPoint = [...coordinate];

      this.inSightAnalysis.update("lines", [
        {
          from: this.eyePos,
          to: this.lookPoint
        }
      ]);
      this._updateLabel();
      this.drawTool.disable();
      this.coordinates = [];
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
    this.inSightAnalysis = new InSightAnalysis({
      lines: [
        {
          from: this.eyePos,
          to: this.lookPoint
        }
      ],
      //可视部分的颜色
      visibleColor: [0, 1, 0, 1],
      //不可视部分的颜色
      invisibleColor: [1, 0, 0, 1]
    });
    this.inSightAnalysis.addTo(this.groupLayer);
    this._addLabel();
  }
  _update(option,optionsObj) {
    if(!this.inSightAnalysis) return;
    this.options = optionsObj;
    if(option == "startHeight"){
      this.eyePos[2] = this.options.startHeight;
      this.inSightAnalysis.update("lines", [
        {
          from: this.eyePos,
          to: this.lookPoint
        }
      ])
      this._updateLabel();
    }else if(option == "endHeight"){
      this.lookPoint[2] = this.options.endHeight;
      this.inSightAnalysis.update("lines", [
        {
          from: this.eyePos,
          to: this.lookPoint
        }
      ])
      this._updateLabel();
    }
    if(option == "direction"){
      this._updateDirection();
    }else if(option == "distance"){
      this._updateDistance();
    }
  }
  _addLabel() {
    const circleSymbol = {
      markerType: "ellipse",
      markerLineColor: "#fff",
      markerFill: "#f00",
      markerWidth: 10,
      markerHeight: 10
    };

    const labelSymbol1 = this._getLabelSymbol(60, this.eyePos[2]);
    new maptalks.Marker(this.eyePos, {
      symbol: circleSymbol,
      properties: {
        altitude: this.eyePos[2]
      }
    }).addTo(this.vLayer);
    new maptalks.TextBox("观察点", this.eyePos, 80, 35, labelSymbol1).addTo(this.vLayer);

    const labelSymbol2 = this._getLabelSymbol(-60, this.lookPoint[2]);
    new maptalks.Marker(this.lookPoint, {
      symbol: circleSymbol,
      properties: {
        altitude: this.lookPoint[2]
      }
    }).addTo(this.vLayer);
    new maptalks.TextBox("目标点", this.lookPoint, 80, 35, labelSymbol2).addTo(this.vLayer);
  }
  _updateLabel() {
    if(!this.vLayer) return;
    this.vLayer.clear();
    this._addLabel();
  }
  _getLabelSymbol(Dx, height) {
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
          textSize: 14
        }
      },
      boxSymbol: {
        markerType: "square",
        markerFill: "rgb(20, 20, 20)",
        markerFillOpacity: 0.7,
        markerLineWidth: 0,
        markerDy: -10,
        markerDx: Dx
      },
      properties: {
        altitude: height
      }
    };
    return labelSymbol;
  }
  _clear() {
    if(!this.inSightAnalysis) return;
    this.groupLayer.removeAnalysis(this.inSightAnalysis);
    this.inSightAnalysis = null;
    this.vLayer.clear();
    this._disable();
    this.eyePos = null;
    this.lookPoint = null;
    this.options = null;
    this.coordinates = [];
    this.first = true;
  }
  _destroy() {
    this._clear();
    if(this.vLayer){
      this.map.removeLayer(this.vLayer);
      this.vLayer = null;
    }
  }
  _computeLookPoint(){
    if(this.eyePos[2] == undefined){
      this.eyePos[2] = this.options.startHeight;
    }
    let distance = this.options.distance;
    let endHeight = this.options.endHeight;
    let angle = this.options.direction;  //角度
    const x = this.eyePos[0] + (distance / 10000) * Math.cos((angle / 180) * Math.PI);
    const y = this.eyePos[1] + (distance / 10000) * Math.sin((angle / 180) * Math.PI);
    this.lookPoint = [x, y, endHeight];
    this._draw();
  }
  _updateDirection(){
    let endHeight = this.options.endHeight;
    if(this.lookPoint && this.lookPoint[2] != undefined){
      endHeight = this.lookPoint[2];
    }
    let distance = Math.sqrt(
      Math.pow(this.eyePos[0]-this.lookPoint[0], 2) + Math.pow(this.eyePos[1]-this.lookPoint[1], 2)
    );
    let angle = this.options.direction; //角度
    const x = this.eyePos[0] + distance * Math.cos((angle / 180) * Math.PI);
    const y = this.eyePos[1] + distance * Math.sin((angle / 180) * Math.PI);
    this.lookPoint = [x, y, endHeight];
    this.inSightAnalysis.update("lines", [
      {
        from: this.eyePos,
        to: this.lookPoint
      }
    ]);
    this._updateLabel();
  }
  _updateDistance(){
    let distance = this.options.distance;
    let endHeight = this.options.endHeight;
    if(this.lookPoint && this.lookPoint[2] != undefined){
      endHeight = this.lookPoint[2];
    }
    const radian = Math.atan2(this.lookPoint[1] - this.eyePos[1], this.lookPoint[0] - this.eyePos[0]);  //弧度
    const x = this.eyePos[0] + (distance / 10000) * Math.cos(radian);
    const y = this.eyePos[1] + (distance / 10000) * Math.sin(radian);
    this.lookPoint = [x, y, endHeight];
    this.inSightAnalysis.update("lines", [
      {
        from: this.eyePos,
        to: this.lookPoint
      }
    ]);
    this._updateLabel();
  }
  _getPickedCoordinate(coordinate) {
    const identifyData = this.groupLayer.identify(coordinate)[0];
    return (identifyData && identifyData.coordinate) || [coordinate.x, coordinate.y, coordinate.z || 0];
  }
}
export default InSight