import * as maptalks from 'maptalks';
class Plot {
    constructor(map) {
        this.map = map;
        this.plotLayer = null;
        this._init();
    }
    _init() {
        this.plotLayer = new maptalks.VectorLayer("plotLayer").addTo(this.map);
        this.drawTool = new maptalks.DrawTool({
            mode: "Point",
            once: true,//一次结束
        }).addTo(this.map)
        this._disable();//初始化清空
        this.drawTool.on("drawend", (param) => {
            this.plotLayer.addGeometry(param.geometry);
            this.map.resetCursor();//清除鼠标样式
        });
    }
    _enable() {
        this.drawTool.enable()
    }
    _disable() {
        this.drawTool.disable()
    }
    plotEnable(type) {
        if (type == "Point") {
            this.drawTool.setMode(type);
            this.map.setCursor("pointer");
            this.drawTool.setSymbol({
                markerFile: "images/icon/icon_Red.png",
                markerOpacity: 1,
                markerWidth: 21,
                markerHeight: 30,
            });
            this._enable()
        } else if (type == "LineString") {
            this.drawTool.setMode(type);
            this.map.setCursor("pointer");
            this.drawTool.setSymbol({
                lineColor: "#327bfb",
                lineWidth: 2,
                lineOpacity: 1,
            });
            this._enable();
        } else if (type == "Polygon") {
            this.drawTool.setMode(type);
            this.map.setCursor("pointer");
            this.drawTool.setSymbol({
                lineColor: "#327bfb",
                lineWidth: 2,
                lineOpacity: 1,
                polygonFill: "#09cff9",
                polygonOpacity: 0.3
            });
            this._enable();
        }
    }
    clear() {
        this._disable();
        this.plotLayer.clear();
    }
}
export default Plot