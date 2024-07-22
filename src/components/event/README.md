绑定事件的三个角度
1---map---
map.on("click", (e) => {
    let filterLayer = map
    .getLayers()
    .filter((layer) => layer instanceof maptalks.VectorLayer);
    if (filterLayer) {
    filterLayer.forEach((layer) => {
        const data = layer.identify(e.coordinate);
        if (!data || !data.length) {
        return;
        }
        let properties = data[0].getProperties();
    });
    }
});

map.on("click", (e) => {
    const identifyData = e.coordinate ?
        groupLayer.identify(e.coordinate, {
            layers: [gltfLayer],
            orderByCamera: true,
        })[0] :
        groupLayer.identifyAtPoint(e.containerPoint, {
            layers: [gltfLayer],
            orderByCamera: true,
        })[0];
    const target = identifyData && identifyData.data;
})

2---layer---
<http://examples.maptalks.com/examples/cn/vector/interactive/event-proxy>

3----feature---
<http://examples.maptalks.com/examples/cn/vector/pointlayer/marker-events>
add(url,clickEvent) {
    fetch(url)
        .then((response) => response.json())
        .then((json) => {
            maptalks.GeoJSON.toGeometryAsync(json).then((geos) => {
                geos.map((item) => {
                    item.setSymbol({
                        markerFile: require("@/assets/texture/people.png"),
                        markerOpacity: 1,
                        markerWidth: 30,
                        markerHeight: 42,
                        markerDx: 0,
                        markerDy: 0,
                        textFill: "#ccc",
                        textFaceName: "sans-serif",
                        textName: "{name}",
                        textSize: 11,
                        textDx: 0,
                        textDy: 10,
                    });
                    item.on('click', clickEvent);//单击事件
                });
                const iconLayer = new maptalks.VectorLayer(this.layerId, geos, {
                    enableAltitude: true,
                    altitudeProperty: "altitude", 
                });
                this.map.addLayer(iconLayer);

            });
        });
}
