import * as maptalks from "maptalks";
import * as THREE from "three";
import { BaseObject } from "maptalks.three";
const OPTIONS = {
  altitude: 600,
  baseWidth: 600,
  baseHeight: 800,
  height: 2000,
};

class Cone extends BaseObject {
  constructor(coordinate, options, material, layer) {
    options = maptalks.Util.extend({}, OPTIONS, options, { layer, coordinate });
    super();
    this._initOptions(options);
    const { altitude, baseWidth, baseHeight, height } = options;
    const length = layer.distanceToVector3(baseHeight, baseHeight).x;
    const width = layer.distanceToVector3(baseWidth, baseWidth).x;
    const h = layer.distanceToVector3(height, height).x;
    const baseVertices = [
      new THREE.Vector3(-width / 2, 0, -length / 2), // 左下角
      new THREE.Vector3(width / 2, 0, -length / 2), // 右下角
      new THREE.Vector3(width / 2, 0, length / 2), // 右上角
      new THREE.Vector3(-width / 2, 0, length / 2), // 左上角
      new THREE.Vector3(0, h, 0), // 顶点
    ];
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    baseVertices.forEach((vertex) => {
      vertices.push(vertex.x, vertex.y, vertex.z);
    });
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    const edges = [0, 1, 1, 2, 2, 3, 3, 0, 0, 4, 1, 4, 2, 4, 3, 4];
    const edgesGeometry = new THREE.BufferGeometry();
    edgesGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    edgesGeometry.setIndex(edges);
    //移动几何体原点
    const origin = layer.distanceToVector3(height, height).y;
    edgesGeometry.translate(0, -origin, 0);
    // 初始化object3d
    this._createLine(edgesGeometry, material);
    const z = layer.distanceToVector3(altitude, altitude).x;
    const position = layer.coordinateToVector3(coordinate, z);
    this.getObject3d().position.copy(position);
    //辅助坐标
    // const meshAxesHelper = new THREE.AxesHelper(50);
    // this.getObject3d().add(meshAxesHelper);
  }
  setPosition(coord) {
    const coordinate = coord.split(",");
    if (Array.isArray(coordinate)) {
      const position = this.getLayer().coordinateToVector3(coordinate);
      this.getObject3d().position = position;
      console.log(this.getObject3d());
    }
    return this;
  }
  setQuaternion(xyz) {
    const arr = xyz.split(",");
    const x = Number(arr[0]);
    const y = Number(arr[1]);
    const z = Number(arr[2]);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(x, y, z, "XYZ"));
    this.getObject3d().quaternion.copy(quaternion);
  }
  setSize(size) {
    const arr = size.split(",");
    const x = Number(arr[0]);
    const y = Number(arr[1]);
    const z = Number(arr[2]);
    const geometry = this.getObject3d().geometry.scale(x, y, z);
    this.getObject3d().geometry.clone(geometry);
  }
  // setRoll(angle) {
  //   const axis = new THREE.Vector3(0, 1, 0);
  //   const quaternion = new THREE.Quaternion();
  //   quaternion.setFromAxisAngle(axis, angle);
  //   this.getObject3d().quaternion = quaternion;
  //   return this;
  // }
  getGeometryCoord() {
    console.log(this.map);
  }
}
export default Cone;
