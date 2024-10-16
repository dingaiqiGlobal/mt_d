import * as maptalks from "maptalks";
import * as THREE from "three";
import { ThreeLayer } from "maptalks.three";
import { ColorIn } from "colorin";
class UniqueValue3D {
    constructor(map, layerId) {
        this.map = map;
        this.groupLayer = map.getLayer("group");
        this.layerId = layerId;
        this.threeLayer = null;
        this.colors = [];
        this.initLayer();
    }
    initLayer() {
        this.threeLayer = new ThreeLayer(layerId, {
            identifyCountOnEvent: 1,
            animation: true,
        });
        this.threeLayer.prepareToDraw = (gl, scene, camera) => {
            let light = new THREE.DirectionalLight(0xffffff);
            light.position.set(0, -10, 10).normalize();
            scene.add(light);
            scene.add(new THREE.AmbientLight("#fff", 0.3));
        };
        this.groupLayer.addLayer(this.threeLayer);
    }
    addPolygons(geojson, height) {
        const ci = new ColorIn(this.colors);
        const polygons = maptalks.GeoJSON.toGeometry(geojson);
        const extrudePolygons = polygons.map((p) => {
            const { value } = p.getProperties();
            const [r, g, b] = ci.getColor(value);
            const color = `rgb(${r},${g},${b})`;
            const extrudePolygon = this.threeLayer.toExtrudePolygon(
                p,
                { height, altitude: -height, topColor: "#fff" },
                new THREE.MeshPhongMaterial({
                    color,
                    transparent: true, // 启用透明效果
                    opacity: 0.8, // 不透明度为0.5
                })
            )
            return extrudePolygon;
        })
        this.threeLayer.addMesh(extrudePolygons);
    }
    updateCP(colors = [], property, color) { 
        const item = [property, color]; 
        return colors.concat(item);
    }  
    removeLayer() {
        let layer = this.map.getLayer(this.layerId);
        if (layer) {
            this.map.removeLayer(layer)
        }
    }
}
export default UniqueValue3D