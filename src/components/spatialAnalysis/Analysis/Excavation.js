import * as maptalks from 'maptalks-gl';
import { PolygonLayer, Geo3DTilesLayer, ClipInsideMask } from 'maptalks-gl';
//挖方
class Excavation {
  constructor(viewer) {
    this.map = viewer.map;
    this.groupLayer = null;
    this.polygonLayer = null; 
    this.vLayer = null;
    this.geo3DTilesLayerArr = [];
    this.drawTool = null;
    this.options = null;
    this.coordinates = [];
    this.first = true;
    this._init();
  }
  _init() {
    this.groupLayer = this.map.getLayer("group");
    this.groupLayer.getLayers().forEach((layer) => {
      if(layer instanceof Geo3DTilesLayer){
        this.geo3DTilesLayerArr.push(layer);
      }
    })
    this.polygonLayer = new PolygonLayer('pgnlayer').addTo(this.groupLayer);
    this.vLayer = new maptalks.VectorLayer("vector", {
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
    });
    
    this.drawTool.on("drawstart", (e) => {
      const coordinate = this._getPickedCoordinate(e.coordinate);
      if (!coordinate) {
        return;
      }
      this.coordinates.push(coordinate);
      e.geometry.setCoordinates(this.coordinates);
      this.first = true;
    });

    this.drawTool.on("drawend", (e) => {
      this.coordinates.push(this.coordinates[0]);
      this._disable();
      new maptalks.LineString(this.coordinates, {
        symbol: {
          lineColor: "#aa0",
          lineWidth: 1
        }
      }).addTo(this.vLayer);
      console.log(this.coordinates);
      this._draw();
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
    this.polygonLayer.clear();
    const height = this.options.height;
    const coordinates = this.coordinates;
    let bottomCoords = [];
    for (let i = 0; i < coordinates.length - 1; i++) {
      const coord1 = coordinates[i];
      const coord2 = coordinates[i + 1];
      const coord3 = [coord2[0], coord2[1], height];
      const coord4 = [coord1[0], coord1[1], height];
      const extrudeCoordinates = [coord1, coord2, coord3, coord4, coord1];
      bottomCoords[i] = [coordinates[i][0], coordinates[i][1], height];
      new maptalks.Polygon(extrudeCoordinates, {
        symbol: {
          polygonFill: '#770'
        }
      }).addTo(this.polygonLayer);
    }
    const idx = coordinates.length - 1;
    bottomCoords[coordinates.length - 1] = [coordinates[idx][0], coordinates[idx][1], height];
    new maptalks.Polygon(bottomCoords, {
      symbol: {
        polygonFill: '#aa0'
      }
    }).addTo(this.polygonLayer);
    const mask = new ClipInsideMask(coordinates);
    let geo3DTilesLayer = this.groupLayer.getLayer(this.options.modelId);
    if(geo3DTilesLayer)
      geo3DTilesLayer.setMask([mask]);
  }
  _update(optionsObj) {
    if(!this.coordinates.length) return;
    this.options = optionsObj;
    this._draw();
  }
  _clear() {
    if(!this.coordinates.length) return;
    this._disable();
    this.polygonLayer.clear(); 
    this.vLayer.clear();
    this.coordinates = [];
    this.first = true;
    this.groupLayer.getLayers().forEach((layer) => {
      if(layer instanceof Geo3DTilesLayer){
        layer.removeMask();
      }
    })
  }
  _destroy() {
    this._clear();
    if(this.polygonLayer){
      this.groupLayer.removeLayer(this.polygonLayer);
      this.polygonLayer = null;
    }
    if(this.vLayer){
      this.map.removeLayer(this.vLayer);
      this.vLayer = null;
    }
  }
  _getPickedCoordinate(coordinate) {
    const identifyData = this.groupLayer.identify(coordinate, { orderByCamera: true })[0];
    coordinate.z = coordinate.z || 0;
    return (identifyData && identifyData.coordinate) || coordinate.toArray();
  }
}
export default Excavation