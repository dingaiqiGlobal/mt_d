import * as maptalks from "maptalks";
import { gsap } from "gsap";
//安装npm install gsap --save
class AnimationBeat {
    constructor(map, layerId = "iconTween") {
        this.map = map;
        this.layerId = layerId;
    }
    add(url,clickEvent) {
        fetch(url)
            .then((response) => response.json())
            .then((json) => {
                maptalks.GeoJSON.toGeometryAsync(json).then((geos) => {
                    geos.map((item) => {
                        item.setSymbol({
                            markerFile: require("@/assets/texture/people.png"),
                            markerOpacity: 1,
                            markerWidth: 30,
                            markerHeight: 42,
                            markerDx: 0,
                            markerDy: 0,
                            textFill: "#ccc",
                            textFaceName: "sans-serif",
                            textName: "{name}",
                            textSize: 11,
                            textDx: 0,
                            textDy: 10,
                        });
                        item.on('click', clickEvent);//单击事件
                    });
                    const iconLayer = new maptalks.VectorLayer(this.layerId, geos, {
                        enableAltitude: true,//必填
                        altitudeProperty: "altitude", //属性名称
                    });
                    this.map.addLayer(iconLayer);
                    //跳动动画
                    this._addBeatAnimation(geos);
                });
            });
    }
    _addBeatAnimation(marker) {
        marker.map((item) => {
            let oldProperties = item.getProperties();
            //时间线-飞入&弹跳动画
            let tl = gsap.timeline();
            tl.from(item.properties, {
                altitude: -100,
                duration: 1,
                repeat: 0,
                onUpdate: () => {
                    item.setProperties(oldProperties);
                },
            });
            tl.to(item.properties, {
                altitude: 100,
                duration: 1,
                repeat: -1,
                yoyo: true,
                onUpdate: () => {
                    item.setProperties(oldProperties);
                },
            });
        });
    }
    remove() {
        let layer = this.map.getLayer(this.layerId);
        if (layer) {
            this.map.removeLayer(layer)
        }
    }
}

export default AnimationBeat;