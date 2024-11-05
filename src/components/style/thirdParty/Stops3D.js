import axios from 'axios';
import { randomUUID } from './util';
import * as maptalks from "maptalks";
import { GeoJSONVectorTileLayer } from "@maptalks/gl-layers";
class Stops3D {
    constructor(map) {
        this.map = map;
        this.groupLayer = this.map.getLayer("group");
    }
    getStyle(id){
        let _target = this.groupLayer.getLayer(id);
        let json = _target.toJSON();
        if (json.type === "GeoJSONVectorTileLayer") {
            //dataUrl
            let dataUrl = json.options.data;
            //params
            let { polygonFill, polygonOpacity } = json.options.style.style[0].symbol;
            let defaultAltitude = json.options.style.style[0].renderPlugin.dataConfig.defaultAltitude;
            let renderTypeCode, fillColor, selectedFiled, fieldValues, fillColors;
            if (polygonFill instanceof Object) {
                renderTypeCode = "1";
                fillColor = null;
                let { property, stops } = polygonFill;
                selectedFiled = property
                fieldValues = stops.map(item => item[0]);
                fillColors = stops.map(item => item[1]);
            } else {
                renderTypeCode = "0";
                fillColor = polygonFill;
                selectedFiled = null;
                fieldValues = [];
                fillColors= [];
            }
            //return
            let params = {
                dataUrl,
                opacity: polygonOpacity, //透明度
                height: defaultAltitude, //高度
                renderTypeCode, //渲染类型 0:单一渲染 1：分色渲染
                fillColor, //填充颜色
                selectedFiled, //选中的分色字段
                fieldValues,//分色值
                fillColors, //填充颜色数组
            }
            return params
        }

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
    removeLayer(id) {
        let _target = this.groupLayer.getLayer(id);
        this.groupLayer.removeLayer(_target);
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