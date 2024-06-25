class ControlCustomSave {
    constructor(map) {
        this.map = map;
        this.controlList = [];
        this._getObj();
    }
    _getObj() {
        let obj = { controlList: [] };
        this.map.setOptions(obj);
        const mapJSON = this.map.toJSON();
        if (mapJSON?.options?.controlList) {
            this.controlList = mapJSON.options.controlList;
        }
    }
    add(control) {
        if (!this._has(control.type)) {
            this.controlList.push(control);
        }
    }
    remove(type) {
        this.controlList = this.controlList.filter(ctrl => ctrl.type !== type);
        this._updateMapSettings();
    }
    update(type, options) {
        const index = this.controlList.findIndex(ctrl => ctrl.type === type);
        if (index !== -1) {
            this.controlList[index] = { ...this.controlList[index], ...options };
            this._updateMapSettings();
        }
    }
    _has(type) {
        return this.controlList.some(ctrl => ctrl.type === type);
    }
    _updateMapSettings() {
        this.map.setOptions({ controlList: this.controlList });
    }
}

export default ControlCustomSave;