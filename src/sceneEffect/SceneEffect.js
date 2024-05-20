import * as maptalks from "maptalks";

import * as THREE from "three";
import { ThreeLayer } from "maptalks.three";
import rippleWall from "@/sceneEffect/maptalks.three.objects/rippleWall";
import { getRippleWall, getMeteorMaterial } from "@/sceneEffect/shader/shader";

import { MeshLineMaterial } from "@/sceneEffect/lib/THREE.MeshLine";
//可以采用npm方式
//cnpm i three.meshline@1.2.0 --save
//cnpm install three@0.116.1 --save  //three版本固定
//import { MeshLineMaterial,} from 'three.meshline';
import arcLine from "@/sceneEffect/maptalks.three.objects/arcLine";

import VirtuallyGroup from '@/sceneEffect/VirtuallyGroup';
class SceneEffect {
    constructor(map) {
        this.map = map;
    }
    //写死图层后期改
    addLayer() {
        let layer = this.map.getLayer("effectBuilding");
        if (!layer) {
            this.loadBuildingData();
        }
    }
    removeLayer() {
        let layer = this.map.getLayer("effectBuilding");
        this.map.removeLayer(layer)
    }
    loadBuildingData() {
        fetch("data/json/data_building_effect.json")
            .then((response) => {
                return response.json();
            })
            .then((geojson) => {
                let result = [];
                let features = geojson.features;
                for (let i = 0; i < features.length; i++) {
                    result.push(features[i].geometry.coordinates);
                }
                this.initLayer(result);
            });
    }

    loadArcLineData(threeLayer) {
        fetch("data/json/data_arcline_effect.json")
            .then((response) => {
                return response.json();
            })
            .then((geojson) => {
                let result = [];
                let features = geojson.features;
                for (let i = 0; i < features.length; i++) {
                    result.push(features[i].geometry.coordinates);
                }
                // result = result.map((subarray) => {
                //   return [...subarray, 50];
                // });
                this.addArcLine(threeLayer, result);
            });
    }
    initLayer(data) {
        let threeLayer = new ThreeLayer("effectBuilding", {
            forceRenderOnMoving: true,
            forceRenderOnRotating: true,
            forceRenderOnZooming: true,
            animation: true,
        });
        let meshs = [];
        //准备绘图
        threeLayer.prepareToDraw = (gl, scene, camera) => {
            //平行光
            // let light = new THREE.DirectionalLight(0xffffff, 2);
            // light.position.set(0, -10, 10);
            // scene.add(light);

            //墙体mesh实例化
            for (let i = 0; i < data.length; i++) {
                if (i % 2 === 0) {
                    threeLayer.addMesh(
                        meshs.concat(this.getRippleWallMesh(threeLayer, data[i][0]))
                    );
                } else {
                    threeLayer.addMesh(meshs.concat(this.getMeteorMesh(threeLayer, data[i][0])));
                }
            }
            //添加飞线
            this.loadArcLineData(threeLayer);

            // let RippleWallMesh = this.getRippleWallMesh(threeLayer, data[0][0]);
            // let MeteorMesh = this.getMeteorMesh(threeLayer, data[1][0]);
            // threeLayer.addMesh(meshs.concat(RippleWallMesh,MeteorMesh));
            threeLayer.config("animation", true);
        };
        threeLayer.addTo(this.map);
    }
    //黄色包裹
    getMeteorMesh(threeLayer, coord) {
        let material = getMeteorMaterial(); //shader
        let mesh = new rippleWall(coord, { height: 250 }, material, threeLayer);
        mesh.getObject3d().renderOrder = 11;
        return [mesh];
    }
    //蓝色包裹
    getRippleWallMesh(threeLayer, coord) {
        let material = getRippleWall(); //shader
        let mesh = new rippleWall(coord, { height: 250 }, material, threeLayer); //maptalks.three
        mesh.getObject3d().renderOrder = 11;
        return [mesh];
    }
    //弧线
    addArcLine(threeLayer, data) {
        const path = [];
        for (let i = 0; i < data.length - 1; i++) {
            const result = [data[i], data[i + 1]];
            path.push(result); // 将新数组添加到结果数组中
        }
        path.forEach((item) => {
            let linestring = new maptalks.LineString(item);
            //texture-贴图信息
            const texture = new THREE.TextureLoader().load(
                require("@/assets/texture/lineTexture.png")
            );
            texture.anisotropy = 16;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            const camera = threeLayer.getCamera();
            //THREE.MeshLine
            const material = new MeshLineMaterial({
                map: texture,
                useMap: true,
                lineWidth: 13,
                sizeAttenuation: false,
                transparent: true,
                near: camera.near,
                far: camera.far,
            });
            //maptalks.three.object
            let arcline = new arcLine(
                linestring,
                { altitude: 0, height: 400, speed: 1 / 5 },
                material,
                threeLayer
            );
            threeLayer.addMesh(arcline);
        });
    }
}
export default SceneEffect