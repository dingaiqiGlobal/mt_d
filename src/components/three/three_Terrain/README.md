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


2.colorin  API
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
