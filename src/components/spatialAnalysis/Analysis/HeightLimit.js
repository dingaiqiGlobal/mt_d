import { HeightLimitAnalysis } from 'maptalks-gl';
//限高
class HeightLimit {
  constructor(viewer) {
    this.map = viewer.map;
    this.groupLayer = null;
    this.heightLimit = null;    
    this._init();
  }
  _init() {
    let groupLayer = this.map.getLayer("group");
    this.groupLayer = groupLayer;
  }
  _draw(options) {
    if(this.heightLimit){
      this.groupLayer.removeAnalysis(this.heightLimit);
      this.heightLimit = null;
    }
    this.heightLimit = new HeightLimitAnalysis({
      limitHeight: options.limitHeight,
      limitColor: options.limitColor
    });
    this.heightLimit.addTo(this.groupLayer);
  }
  _update(option,value) {
    if(!this.heightLimit) return;
    this.heightLimit.update(option, value);
  }
  _clear() {
    if(!this.heightLimit) return;
    this.groupLayer.removeAnalysis(this.heightLimit);
  }
}
export default HeightLimit