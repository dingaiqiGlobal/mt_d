import * as maptalks from "maptalks";
import { PointLayer } from "@maptalks/gl-layers";
import * as THREE from "three";
import arcLine from "@/sceneEffect/maptalks.three.objects/arcLine";
import { MeshLineMaterial } from "@/sceneEffect/lib/THREE.MeshLine";
import axios from "axios";

class AnimationLinkLine {
    constructor(options) {
        this.map = options.map;
        this.menshGroup = options.menshGroup;
        this.otherId = "otherId";
        this.centerId = "centerId";
        this.mesh = null;

    }
    async _getJsonData(url) {
        const result = await axios.get(url);
        let features = result.data.features;
        let coordinates = [];
        for (let i = 0; i < features.length; i++) {
            coordinates.push(features[i].geometry.coordinates);
        }
        return coordinates;
    }
    async _buildArcLineMesh(url, threeLayer, originUrl) {
        let data = await this._getJsonData(url);
        let origin = await this._getJsonData(originUrl);
        //添加meshes
        let meshes = [];
        for (let i = 0; i < data.length; i++) {
            let linestring = new maptalks.LineString([origin[0], data[i]]);
            //texture-贴图信息
            const texture = new THREE.TextureLoader().load(
                require("@/assets/texture/lineTexture_white.png")
            );
            texture.anisotropy = 16;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            const camera = threeLayer.getCamera();
            //THREE.MeshLine
            const material = new MeshLineMaterial({
                map: texture,
                useMap: true,
                lineWidth: 8,
                sizeAttenuation: false,
                transparent: true,
                near: camera.near,
                far: camera.far,
                color: "#20bd7c", // 线的颜色
            });
            //maptalks.three.object
            meshes.push(
                new arcLine(
                    linestring,
                    { altitude: 0, height: 200, speed: 2 / 5 },
                    material,
                    threeLayer
                )
            );
        }
        return meshes;
    }
    async addMesh(url, threeLayer, originUrl) {
        this.mesh = await this._buildArcLineMesh(
            url,
            threeLayer,
            originUrl
        );
        this.menshGroup.addMesh(this.mesh);
    }
    addOtherIcon(url,clickEvent) {
        axios.get(url)
            .then((response) => {
                maptalks.GeoJSON.toGeometryAsync(response.data).then((geos) => {
                    geos.map((item) => {
                        item.setSymbol({
                            markerFile: require("@/assets/texture/building.png"),
                            markerOpacity: 1,
                            markerWidth: 30,
                            markerHeight: 42,
                            markerDx: 0,
                            markerDy: 30,
                            textFill: "#ccc",
                            textFaceName: "sans-serif",
                            textName: "{name}",
                            textSize: 11,
                            textDx: 0,
                            textDy: 40,
                        });
                        item.on('click', clickEvent);
                    });
                    const layer = new PointLayer(this.otherId, geos, {});
                    this.map.addLayer(layer);
                });
            });
    }
    addCenterIcon(url) {
        axios.get(url)
            .then((response) => {
                maptalks.GeoJSON.toGeometryAsync(response.data).then((geos) => {
                    geos.map((item) => {
                        item.setSymbol({
                            markerFile: require("@/assets/texture/cloud.png"),
                            markerOpacity: 1,
                            markerWidth: 100,
                            markerHeight: 100,
                            markerDy: 50,
                        });
                    });
                    const layer = new PointLayer(this.centerId, geos, {});
                    this.map.addLayer(layer);
                });
            });
    }
    remove() {
        this._removeLayerById(this.otherId);
        this._removeLayerById(this.centerId);
        this.menshGroup.removeMesh(this.mesh);
    }
    _removeLayerById(id) {
        let layer = this.map.getLayer(id);
        if (layer) {
            this.map.removeLayer(layer)
        }
    }

}
export default AnimationLinkLine