import { SkylineAnalysis } from 'maptalks-gl';
//天际线
class Skyline {
  constructor(viewer) {
    this.map = viewer.map;
    this.groupLayer = null;
    this.skyline = null;    
    this._init();
  }
  _init() {
    let groupLayer = this.map.getLayer("group");
    this.groupLayer = groupLayer;
  }
  _draw(options) {
    if(this.skyline){
      this.groupLayer.removeAnalysis(this.skyline);
      this.skyline = null;
    }
    this.skyline = new SkylineAnalysis({
      lineColor: options.lineColor || [234 / 255, 107 / 255, 72 / 255],
      lineWidth: options.lineWidth || 1.8
    });
    this.skyline.addTo(this.groupLayer);
  }
  _update(option,value) {
    if(!this.skyline) return;
    this.skyline.update(option, value);
  }
  _clear() {
    if(!this.skyline) return;
    this.groupLayer.removeAnalysis(this.skyline);
  }
}
export default Skyline