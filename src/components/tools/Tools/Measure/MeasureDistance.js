import * as maptalks from 'maptalks';
class MeasureDistance {
    constructor(map) {
        this.map = map;
        this.init()
    }
    init() {
        this.distanceTool = new maptalks.DistanceTool({
            symbol: {
                lineColor: "#34495e",
                lineWidth: 2,
            },
            vertexSymbol: {
                markerType: "ellipse",
                markerFill: "#1bbc9b",
                markerLineColor: "#000",
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
                    markerLineColor: "#b4b3b3",
                    markerFill: "#000",
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
                markerDx: 20,
            }, {
                markerType: "x",
                markerWidth: 10,
                markerHeight: 10,
                markerLineColor: "#fff",
                markerDx: 20,
            },],
            language: "en-US",
            metric: true,
        }).addTo(this.map);
        this.disable()
    }
    disable() {
        this.distanceTool.disable()
    }
    enable() {
        this.distanceTool.enable()
        this.distanceTool.on('drawend', () => {
            this.disable()
        })
    }
    clear() {
        this.disable()
        this.distanceTool.clear()
    }
}
export default MeasureDistance;