1.地形切图工具dem2terrain---<https://github.com/dingaiqiGlobal/dem2terrain>
    ① 配置 GDAL_DATA-环境变量-看文档（要是安装了postgresql基本就不用配置了）
    ② cnpm i dem2terrain -g
    ③ 帮助dem2terrain --help
    ④ 可选参数说明：
        -i: 输入 tif 格式的 DEM 文件路径，支持相对路径；
        -o: 输出目录，支持相对路径；
        -g: 指定地形Tile适用坐标系，默认是适用3857坐标系；
        -r: 构建影像金字塔或重投影时设置重采样策略，默认3 CUBIC 采样；
        -z: 由于地形栅格数据通常是 90m、30m 的空间分辨率，等级太大意义不大，等级太低时起伏辨识也不高，所以默认生成中间的 5-14 级；
        -c: 指定是否预先清理输出瓦片的存储目录，默认0，不清理；
        -e: 指定切片编码规则，默认 mapbox，用户可指定 terrarium 规则输出。
        -f: 以上参数可以都放到一个配置json文件里，使用-f执行切片任务，简化操作；
    ⑤ 用法：
        方式1：dem2terrain -z 4-15 -e terrarium -i ./ZONE.tiff -o ./output -c 1 -g 3857  
        方式2：dem2terrain -f C:\Users\ZHJY\Desktop\terrain_build\dem2terrain-master\test\config.json
                （json内容为{"zoom":"5-14","epsg":3857,"size":256,"encoding":"mapbox","input":"./data/hd/HD_DEM.tif","output":"./data/terrain","clean":true}）
2.影像切片
    自己下载的，对应顺序一定要与dem切片后相同，或者大于dem

3.colorin  API
    ①安装
    cnpm i colorin --save
    import {ColorIn} from 'colorin';
    ②使用
    构造
    constructor(colors, [options])
        const ci = new ColorIn(colors);
    方法
    getColor(stop)-get color by stop
        const [r, g, b, a] = ci.getColor(11);
    getImageData()-get canvas image data
        const imgData = ci.getImageData();

4.tilebelt
    ①安装
    cnpm install @mapbox/tilebelt --save
    ②使用
    var tilebelt = require('@mapbox/tilebelt');
        var tile = [10,15,8] // x,y,z
        console.log(tilebelt.tileToGeoJSON(tile));
        console.log(tilebelt.getParent(tile));
    方法：
        tileToGeoJSON(tile)--------获取tile的geojson表示
        tileToBBOX(tile)------------获取tile的bbox
        bboxToTile(bbox)----------用最小的tile覆盖一个bbox
        getChildren(tile)-----------将tile放大一级
        getParent(tile)-------------将tile降低一级
        getSiblings(tile)------------获取一个图块的3个兄弟图块
        hasSiblings(tiles,tile)-------检查图块数组是否包含图块兄弟
        hasTile(tiles,tile)-----------检查瓷砖阵列是否包含特定的瓷砖
        tilesEqual(tile1,tile2)-------检查两个图块是否相同
        tileToQuadkey(tile)--------获取图块的四键
        quadkeyToTile(quadkey)---获取四键的图块
        pointToTile(lon,lat,zoom)--以指定的缩放级别获取点的图块
        pointToTileFraction(lon,lat,zoom)-----在缩放级别获取点的精确分数图块位置
