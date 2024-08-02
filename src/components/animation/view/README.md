视图、视角动画
animateTo
flyTo
fitExtent
setZoom


注意:当连续调用这些动画方法时，之前的动画会被停止，所以当你需要不断的调用这些方法时，要么关闭动画，要么在 动画结束时再开启下一个动画

//关闭动画
map.fitExtent(polygon.getExtent(), 0, { animation: false });
map.setZoom(15);

//动画结束后再调用另一个动画
map.fitExtent(polygon.getExtent(), 0, { animation: true }, (frame) => {
    if (frame.state.playState === "finished") {
        map.setZoom(15);
    }
});
