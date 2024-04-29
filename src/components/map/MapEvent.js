import * as maptalks from 'maptalks';
import { GeoJSONVectorTileLayer } from "@maptalks/gl-layers";
import UIMarkerLayer from "../layer/UIMarkerLayer";
/**
 * 鼠标事件gltf没放GroupGL组里面，高亮没成功
 */
class MapEvent {
    constructor(map) {
        this.map = map;
        this.highLightKey = 'test';
        this.mousemoveFunc();
        this.clickFunc();
    }
    mousemoveFunc() {
        this.map.on('mousemove', e => {
            let geojsonVTLayer = this.map.getLayers().filter(layer =>
                layer instanceof GeoJSONVectorTileLayer
            );
            if (geojsonVTLayer) {
                let hit = false;
                geojsonVTLayer.forEach(layer => {
                    this.cancel(layer);
                    if (hit) {
                        return;
                    }
                    const data = layer.identify(e.coordinate);
                    if (!data || !data.length) {
                        return;
                    }
                    const feature = data[data.length - 1].data.feature;
                    this.highLight(feature, layer);
                    hit = true;
                })
            }

        })
    }
    highLight(feature, layer) {
        layer.highlight && layer.highlight([{
            id: feature.id,
            name: this.highLightKey,
            color: '#00fbf2',
        }]);
    }
    cancel(layer) {
        layer.cancelHighlight && layer.cancelHighlight([this.highLightKey]);
    }
    clickFunc() {
        this.map.on('click', e => {
            let geojsonVTLayer = this.map.getLayers().filter(layer =>
                layer instanceof GeoJSONVectorTileLayer
            );
            if (geojsonVTLayer) {
                geojsonVTLayer.forEach(layer => {
                    const data = layer.identify(e.coordinate);
                    if (!data || !data.length) {
                        return;
                    }
                    const feature = data[data.length - 1].data.feature;
                    if (feature) {
                        let uiMarkerLayer = new UIMarkerLayer().addTo(this.map);
                        let uiMarker = new maptalks.ui.UIMarker(e.coordinate, {
                            containerClass: "UIMarkerLayer",//css类名
                            single: true,//false为全局单个标记
                            content: `<div><button>UI</button></div>`,//模板(接口下面)
                            verticalAlignment: 'top',
                            eventsPropagation: false,//是否停止所有事件的传播（事件冒泡）
                        });
                        uiMarkerLayer.addMarker(uiMarker);
                    }
                })
            }

        })
    }
}
export default MapEvent