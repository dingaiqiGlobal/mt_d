

问题1：样式不一
maptalks有自己的样式系统,和mapbox的样式系统不是一会事情，如果想把mapbox的样式应用到maptalks 里需要一个转换工具

问题2：maxAvailableZoom
VectorTileLayer是基于TileLayer的,和TileLayer一样,有个参数叫maxAvailableZoom，用来设置图层的可见最大层级，当设置了改参数后，地图的层级超过这个值时会复用你设置的这个参数层级的数据,比如你设置了18，当地图放大道19时仍然会复用18层级的数据

问题3：同一个数据出现多个标注数据
这个是有矢量切片性质决定的,当一个大的图形数据在高层及下会被切割成多个瓦片，导致每个瓦片都出现了图形 的一部分数据，从而导致每个瓦片内都出现了图形的标注了、
解决方法:
做一个独立的标注的数据集(Point数据集合),在vt样式里配置这个独立的数据集合的样式
这个是矢量切片里针对标注的推荐做法
因为点在任何缩放层级下都只能落在一个瓦片内,所以可以避免这个问题
用独立的标注图层,也可以做到自定义标注的位置更加美观和友好，上图这种标注都是根据每个切片的数据利用 数学方法自动生成的，具有随机性,可能不符合实际情况，比如江苏省这样的一个行政区，我们标注一般都是标注在 省会南京，这样的需求就只能自己专门做一个标注图层数据集了

问题4：矢量瓦片图层和普通图层的区别和定位
①矢量瓦片(VectorTileLayer)图层的特点：
仅仅加载当前视野的数据(本质就是分页)，不同的层级下加载不同精细度的数据（LOD）
适用加载大规模的数据(城市底图，城市建筑物道路等)
    不适合细粒度细的场景
    编辑
    拖拽
    动画
    部分数据更新等
    数据频繁的更新
    无法拿到图层内的所有数据，只能拿到当前视野内加载的数据
②图形管理类的图层(PointLayer,LineStringLayer,PolygonLayer等)的特点：
适用加载普通规模的数据
    适合细粒度细的场景
    编辑
    拖拽
    动画
    部分数据更新等
    数据频繁的更新
可以拿到图层内的所有数据，可以对数据做精细化的管理，可以管理到图层内的每条数据