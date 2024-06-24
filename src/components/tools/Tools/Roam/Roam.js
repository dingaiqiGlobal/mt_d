import { GLTFLayer, GLTFMarker } from "@maptalks/gl-layers";
class Roam {
    constructor(map) {
        this.map = map;
        this.gltfMarker = null;
        this.keyEventListener = null;
        this.zoom = this.map.getZoom();
        this.cameraPosition = {
            position: [this.map.getCenter().x, this.map.getCenter().y, 50],
            pitch: 70,
            bearing: 0
        };
        this.step = 20;//步长
        //升级版本setCameraOrientation(this.cameraPosition)
    }
    init() {
        if (this.map.getLayer("Roam_GLTF")) return;
        this.map.flyTo({
            zoom: 19.9,
            center: this.map.getCenter(),
            pitch: this.cameraPosition.pitch,
            bearing: this.cameraPosition.bearing
        }, {
            duration: 1500,
            easing: 'out'
        });
        const gltfLayer = new GLTFLayer("Roam_GLTF");
        this.gltfMarker = new GLTFMarker(this.map.getCenter(), {
            symbol: {
                url: "data/model/Cesium_Air.glb",
                modelHeight: 12,
                scaleX: 1,
                scaleY: 1,
                scaleZ: 1,
                rotationZ: 180
            },
        });
        gltfLayer.addGeometry(this.gltfMarker);
        this.map.addLayer(gltfLayer);

        //事件监听
        this.keyEventListener = (e) => {
            const key = e.key.toLowerCase();
            switch (key) {
                case 'w':
                    this._moveForward()
                    break;
                case 's':
                    this._moveBack();
                    break;
                case 'a':
                    this._moveLeft();
                    break;
                case 'd':
                    this._moveRight();
                    break;
                case 'q':
                    this._rotateLeft();
                    break;
                case 'e':
                    this._rotateRight();
                    break;
                case 'z':
                    this._lookUp();
                    break;
                case 'x':
                    this._lookDown();
                    break;
                default:
                    break;
            }
        };
        document.addEventListener('keydown', this.keyEventListener);
    }
    _moveForward() {
        const step = this.step;
        const coord = {
            x: this.cameraPosition.position[0],
            y: this.cameraPosition.position[1]
        };
        const point = this.map.coordToContainerPoint(coord);
        const newPoint = point.add(0, -step);
        const newCoord = this.map.containerPointToCoord(newPoint);
        this.cameraPosition.position[0] = newCoord.x;
        this.cameraPosition.position[1] = newCoord.y;
        this.map.setCameraOrientation(this.cameraPosition);
        this.gltfMarker.setCoordinates([newCoord.x, newCoord.y, 50]);//模型位置
    }
    _moveBack() {
        const step = this.step;
        const coord = {
            x: this.cameraPosition.position[0],
            y: this.cameraPosition.position[1]
        };
        const point = this.map.coordToContainerPoint(coord);
        const newPoint = point.add(0, step);
        const newCoord = this.map.containerPointToCoord(newPoint);
        this.cameraPosition.position[0] = newCoord.x;
        this.cameraPosition.position[1] = newCoord.y;
        this.map.setCameraOrientation(this.cameraPosition);
        this.gltfMarker.setCoordinates([newCoord.x, newCoord.y, 50]);
    }
    _moveLeft() {
        const step = this.step;
        const coord = {
            x: this.cameraPosition.position[0],
            y: this.cameraPosition.position[1]
        };
        const point = this.map.coordToContainerPoint(coord);
        const newPoint = point.add(-step, 0);
        const newCoord = this.map.containerPointToCoord(newPoint);
        this.cameraPosition.position[0] = newCoord.x;
        this.cameraPosition.position[1] = newCoord.y;
        this.map.setCameraOrientation(this.cameraPosition);
        this.gltfMarker.setCoordinates([newCoord.x, newCoord.y, 50]);
    }
    _moveRight() {
        const step = this.step;
        const coord = {
            x: this.cameraPosition.position[0],
            y: this.cameraPosition.position[1]
        };
        const point = this.map.coordToContainerPoint(coord);
        const newPoint = point.add(step, 0);
        const newCoord = this.map.containerPointToCoord(newPoint);
        this.cameraPosition.position[0] = newCoord.x;
        this.cameraPosition.position[1] = newCoord.y;
        this.map.setCameraOrientation(this.cameraPosition);
        this.gltfMarker.setCoordinates([newCoord.x, newCoord.y, 50]);
    }
    _rotateLeft() {
        this.gltfMarker.setCoordinates(this.cameraPosition.position);
        this.cameraPosition.bearing = this.cameraPosition.bearing - 5;
        this.map.setCameraOrientation(this.cameraPosition);
        const symbol = this.gltfMarker.getSymbol();
        this.gltfMarker.updateSymbol({
            rotationZ: symbol.rotationZ + 5
        });
    }
    _rotateRight() {
        this.gltfMarker.setCoordinates(this.cameraPosition.position);
        this.cameraPosition.bearing = this.cameraPosition.bearing + 5;
        this.map.setCameraOrientation(this.cameraPosition);
        const symbol = this.gltfMarker.getSymbol();
        this.gltfMarker.updateSymbol({
            rotationZ: symbol.rotationZ - 5
        });
    }
    _lookUp() {
        this.gltfMarker.setCoordinates(this.cameraPosition.position);
        this.cameraPosition.pitch = this.cameraPosition.pitch + 1;
        this.map.setCameraOrientation(this.cameraPosition);
    }
    _lookDown() {
        this.gltfMarker.setCoordinates(this.cameraPosition.position);
        this.cameraPosition.pitch = this.cameraPosition.pitch - 1;
        this.map.setCameraOrientation(this.cameraPosition);
    }
    clear() {
        //移除图层
        const targetLayer = this.map.getLayer("Roam_GLTF");
        if (targetLayer) {
            this.map.removeLayer(targetLayer);
        }
        //移除事件
        if (this.keyEventListener) {
            document.removeEventListener('keydown', this.keyEventListener);
            this.keyEventListener = null;
        }
        //还原视图
        this.map.flyTo({
            zoom: this.zoom,
            center: this.map.getCenter(),
            pitch: 0,
            bearing: 0
        }, {
            duration: 1500,
            easing: 'out'
        });
        //还原相机位置
        this.cameraPosition = {
            position: [this.map.getCenter().x, this.map.getCenter().y, 50],
            pitch: 70,
            bearing: 0
        };
    }

}
export default Roam