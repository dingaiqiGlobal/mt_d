class VirtuallyGroup {
    constructor(layer) {
        this.layer = layer;
        this.meshes = [];
    }

    addMesh(meshes) {
        // 如果meshes不是数组，则转换为数组 
        if (!Array.isArray(meshes)) {
            meshes = [meshes];
        } 
        this.meshes = this.meshes.concat(meshes);
        this.layer.addMesh(meshes);
        return this;
    }

    removeMesh(meshes) {
        if (!Array.isArray(meshes)) {
            meshes = [meshes];
        }
        // 使用filter方法从this.meshes中移除给定的meshes  
        this.meshes = this.meshes.filter(mesh => !meshes.includes(mesh));
        // 同时从layer中移除这些meshes  
        meshes.forEach(mesh => this.layer.removeMesh(mesh));
        return this; 
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