import * as maptalks from 'maptalks';

class ControlCustomScale extends maptalks.control.Scale {
    constructor(options, containerId) {
        super(options);
        this.containerId = containerId;
    }
    onAdd() { 
        const dom = this.getContainer();//获取控件容器 
        // dom.style.display = 'flex';
        const container = document.getElementById(this.containerId);
        if (container) {
            container.appendChild(dom);
        }
    }
}
export default ControlCustomScale;
