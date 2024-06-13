import MeasureDistance from "./MeasureDistance";
import MeasureArea from "./MeasureArea";

class Measure {
    constructor(map) {
        this.map = map;
        this._initMeasureTool()
    }
    _initMeasureTool() {
        this.md = new MeasureDistance(this.map);
        this.ma = new MeasureArea(this.map);
    }
    measureEnable(type) {
        if (type == "spatialDistance") {
            this.md.enable();
        } else if (type == "spatialArea") {
            this.ma.enable();
        }
    }
    measureClear() {
        this.md.clear();
        this.ma.clear();
    }
}
export default Measure;