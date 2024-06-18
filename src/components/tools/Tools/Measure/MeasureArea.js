import * as maptalks from 'maptalks';
class MeasureArea {
    constructor(map) {
        this.map = map;
        this._init();
    }
    _init() {
        this.areaTool = new maptalks.AreaTool({
            symbol: {
                lineColor: "#1bbc9b",
                lineWidth: 2,
                polygonFill: "#09cff9",
                polygonOpacity: 0.3,
            },
            vertexSymbol: {
                markerType: "ellipse",
                markerFill: "#34495e",
                markerLineColor: "#1bbc9b",
                markerLineWidth: 3,
                markerWidth: 10,
                markerHeight: 10,
            },
            labelOptions: {
                textSymbol: {
                    textFaceName: "monospace",
                    textFill: "#fff",
                    textLineSpacing: 1,
                    textHorizontalAlignment: "right",
                    textDx: 15,
                },
                boxStyle: {
                    padding: [6, 2],
                    symbol: {
                        markerType: "square",
                        markerFill: "#000",
                        markerFillOpacity: 0.9,
                        markerLineColor: "#b4b3b3",
                    },
                },
            },
            clearButtonSymbol: [{
                markerType: "square",
                markerFill: "#000",
                markerLineColor: "#b4b3b3",
                markerLineWidth: 2,
                markerWidth: 15,
                markerHeight: 15,
                markerDx: 22,
            },
            {
                markerType: "x",
                markerWidth: 10,
                markerHeight: 10,
                markerLineColor: "#fff",
                markerDx: 22,
            },
            ],
            language: "en-US",
            metric: true,
            once:true,
        }).addTo(this.map);
        this.disable()
    }
    disable() {
        this.areaTool.disable()
    }
    enable() {
        this.areaTool.enable()
        //等价于once:true,
        // this.areaTool.on('drawend', () => {
        //     this.disable()
        // })
    }
    clear() {
        this.disable()
        this.areaTool.clear()
    }
}
export default MeasureArea;