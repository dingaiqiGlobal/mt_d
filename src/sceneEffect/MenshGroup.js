class MenshGroup {
    constructor(layer) {
        this.layer = layer;
        this.meshes = [];
    }

    addMesh(meshes) {
        if (!Array.isArray(meshes)) {
            meshes = [meshes];
        }
        this.meshes = this.meshes.concat(meshes);
        meshes.forEach(mesh => this.layer.addMesh(mesh)); //数组添加
        return this;
    }

    removeMesh(meshes) {
        if (!Array.isArray(meshes)) {
            meshes = [meshes];
        }
        this.meshes = this.meshes.filter(mesh => !meshes.includes(mesh));
        meshes.forEach(mesh => this.layer.removeMesh(mesh));
        return this;
    }
    //检查 meshes 中的每个元素是否在 this.meshes 中 
    isMesh(meshes) {
        for (const meshOrArray of meshes) { 
            if (this.meshes.includes(meshOrArray)) {
                return true; 
            }
        }
        return false;
    }
    clear() {
        //清空数组
        while (this.meshes.length > 0) {
            const mesh = this.meshes.pop();
            this.layer.removeMesh(mesh);
        }
        return this;
    }
}
export default MenshGroup;