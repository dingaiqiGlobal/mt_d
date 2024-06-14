import * as maptalks from 'maptalks';
class CoordPosition {
    constructor(map) {
        this.map = map;
        this.coordPositionLayer = null;
        this.callback = null;
        this._init();
    }
    _init() {
        this.coordPositionLayer = new maptalks.VectorLayer("coordPositionLayer").addTo(this.map);
        this.drawTool = new maptalks.DrawTool({
            mode: "Point",
            once: true,//一次结束
        }).addTo(this.map)
        this._disable();//初始化清空
        this.drawTool.on("drawend", (param) => {
            this.coordPositionLayer.addGeometry(param.geometry);
            this.callback(param.coordinate);//坐标回调
        });
    }
    pick(callback) {
        this.callback = callback;
        if (this.coordPositionLayer) {
            this.clear()
        }
        this._enable()
        this.drawTool.setSymbol({
            markerFile: "images/icon/icon_Red.png",
            markerOpacity: 1,
            markerWidth: 21,
            markerHeight: 30,
        });
    }
    flyTo(coord) {
        this._createMarker(coord)
        this.map.flyTo({
            zoom: 15,
            center: [coord.longitude, coord.latitude],
        }, {
            duration: 1500,
            easing: 'out'
        });
    }
    _createMarker(coord) {
        this.clear();
        const point = new maptalks.Marker([coord.longitude, coord.latitude], {
            symbol: {
                markerFile: "images/icon/icon_Red.png",
                markerOpacity: 1,
                markerWidth: 21,
                markerHeight: 30,
            },
        });
        this.coordPositionLayer.addGeometry(point)
    }
    _enable() {
        this.drawTool.enable()
    }
    _disable() {
        this.drawTool.disable()
    }
    clear() {
        this._disable();
        this.coordPositionLayer.clear();
    }
    //经纬度由小数形式转换为度分秒形式
    DDDToDMS(data) {
        let value = parseFloat(data);
        let _d = Math.floor(value);//度
        let _m = Math.floor((value - _d) * 60);//分
        let _s = Math.round((value - _d) * 3600 % 60);//秒 保留整数
        // let _s =  parseFloat((value - _d) * 3600 % 60).toFixed(2);//精确小数点后面两位
        return [_d, _m, _s];
    }
    //经纬度由度分秒形式转换为小数形式
    DMSToDDD(data) {
        let du = data[0];
        let fen = data[1];
        let miao = data[2];
        let res = Math.abs(du) + (Math.abs(fen) / 60 + Math.abs(miao) / 3600);
        res = parseFloat(res).toFixed(6);
        return res;
    }
}
export default CoordPosition