import axios from 'axios';
import { randomUUID } from './util';
import * as maptalks from "maptalks";
import { GeoJSONVectorTileLayer } from "@maptalks/gl-layers";
class Stops3D {
    constructor(map) {
        this.map = map;
        this.groupLayer = this.map.getLayer("group");
    }
    getStyle(id) { 
        let _target = this.groupLayer.getLayer(id);
        let json = _target.toJSON();
        let style = {};
        if (json.type === "GeoJSONVectorTileLayer") {
            let styleArr = _target.getStyle().style;
            style = {
                ...styleArr[0].renderPlugin.dataConfig,
                ...styleArr[0].symbol,
            };
        }
        return style
    }
    readField(url) {
        return new Promise((res, rej) => {
            const field = {};
            axios.get(url).then((result) => {
                const { data } = result;
                const features = maptalks.GeoJSON.toGeometry(data);
                const Properties = features.map((item) => {
                    return item.getProperties();
                })
                const keys = [...new Set(Properties.flatMap(item => Object.keys(item)))];
                keys.forEach(key => {
                    field[key] = Properties.map(item => item[key]);
                });
                res(field)
            })
        })

    }
    addLayer(url, style = {}) {
        //let key = randomUUID();
        let key = "test";//先写死
        let layer = new GeoJSONVectorTileLayer(key, {
            data: url,
            minZoom: 1,
            maxZoom: 22
        })
        layer.setOptions({
            layerId: key,
        })
        this.groupLayer.addLayer(layer)
        this.setStyle(key, style);
    }
    setStyle(id, options) {
        let defaultAltitude = options.defaultAltitude || 4000;
        let polygonOpacity = options.polygonOpacity || 0.8;
        let polygonFill = options.polygonFill || "#ffffff";
        const style = {
            style: [
                {
                    name: `${id}_3DExtrusion_polygon`,
                    renderPlugin: {
                        type: "lit",
                        dataConfig: {
                            type: "3d-extrusion",
                            altitudeProperty: null,
                            minHeightProperty: null,
                            altitudeScale: 1,
                            defaultAltitude,
                            topThickness: 0,
                            top: true,
                            side: true,
                        },
                    },
                    filter: true,
                    symbol: {
                        visible: true,
                        bloom: false,
                        ssr: false,
                        polygonOpacity,
                        polygonFill,
                    },
                }
            ],
        };
        let _target = this.groupLayer.getLayer(id);
        _target.setStyle(style);
    }
    updateSymbol(id, idx, symbol) {
        let _target = this.groupLayer.getLayer(id);
        _target.updateSymbol(idx, symbol);
    }
    updateDataConfig(id, idx, dataConfig) {
        let _target = this.groupLayer.getLayer(id);
        _target.updateDataConfig(idx, dataConfig)
    }
}
export default Stops3D;