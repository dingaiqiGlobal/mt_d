class VirtuallyGroup {
    constructor(layer) {
        this.layer = layer;
        this.meshes = [];
    }

    addMesh(meshes) {
        this.meshes = this.meshes.concat(meshes);
        this.layer.addMesh(meshes);
        return this;
    }

    removeMesh(meshes) {
        //do some things
    }

    clear() {
        //do some things
    }

    remove() {
        //do some things
    }
}