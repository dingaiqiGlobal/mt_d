/**
 * Marker
 */
//基础属性
markerFile: "images/icon/icon_Red.png", //图标的地址
markerOpacity: 1, //取值范围0-1，图标透明度
markerWidth: 28, //取值范围0-254，图标高度
markerHeight: 40, //取值范围0-254，图标高度
markerDx: 0, //取值范围0-127，图标在屏幕范围x轴上的偏移量
markerDy: 0, //取值范围0-127，图标在屏幕范围y轴上的偏移量
markerRotation: 0, //取值范围0-360，图标的旋转角度，单位度
//对齐
markerHorizontalAlignment: "middle", //图标相对坐标点的水平对齐方式，取值范围： left, middle, right
markerVerticalAlignment: "middle", //图标相对坐标点的垂直对齐方式，取值范围： top, middle, bottom
markerRotationAlignment: "null", //如果设为map，则图标自动随地图旋转而旋转
markerPitchAlignment: "null", //如果设为map，则图标自动随地图倾斜而倾斜
//分布
markerPlacement: "point", //(可选)看文档-沿线分布还是正常点分布
markerSpacing: 250, //(可选)看文档-markerPlacement必须是line。即图标沿线分布时，相互的间隔，单位像素
mergeOnProperty: null, //(可选)看文档-markerPlacement必须是line。是否按照给定property属性合并该属性的值相同的line，能让沿线分布的图标绘制得更加准确
//碰撞检测
markerAllowOverlap: false, //必须开启碰撞检测。当此图标与其他图标碰撞时，是否仍然允许该图标显示
markerIgnorePlacement: false, //必须开启碰撞检测。当此图标与其他图标碰撞时，是否仍然允许其他图标显示
//三维透视
markerPerspectiveRatio: true, //是否开启三维透视，图标的近大远小效果
//文字自适应
markerTextFit: "none", //必须设置textName。图标是否根据文字来自动设置自身的高度和宽度，可选值： both（高宽都自适应）, width（仅宽度自适应）, height（仅高度自适应）
markerTextFitPadding: [0, 0, 0, 0], //必须设置文字且markerTextFit必须为true。四位数组，单位像素，图标上下左右四边距离文字的padding，四位数字的含义是[上边，右边，下边，左边]
//矢量图标
//以下必须有合法的markerType
markerType: null, //矢量图标类别，可选的值： ellipse, cross, x, diamond, bar, square, triangle, pin, pie, rectangle
markerFill: "#00f", //矢量图标的填充色
markerFillPatternFile: null, //矢量图标的模式填充图片地址
markerFillOpacity: 1, //矢量图标填充透明度，取值范围0-1
markerLineColor: "#000", //矢量图标边框颜色
markerLineWidth: 1, //矢量图标边框线宽
markerLineOpacity: 1, //矢量图标边框透明度，取值范围0-1
markerLineDasharray: 1, //矢量图标边框虚线样式
markerLinePatternFile: null, //矢量图标边框的模充图片地址




/**
 * LingString
 */
lineColor:"#000",//线的颜色
lineWidth:2,//线宽，取值范围 0 - 127
lineOpacity:1,//线的透明度，取值范围 0 - 1
lineJoin:"miter",//线的连接样式，可选的值：miter，round，bevel
lineCap:"butt",//线头的样式，可选的值：butt，round，square
lineDx:0,//线在屏幕坐标x轴上的偏移量，单位像素，取值范围：-128 - 127
lineDy:0,//线在屏幕坐标y轴上的偏移量，单位像素，取值范围：-128 - 127
lineStrokeWidth:0,//线的描边宽度，取值范围 0 - 127
lineStrokeColor:"#000",//线的描边的颜色
linePatternFile:null,//线的填充图片，支持url或者base64字符串
lineJoinPatternMode:0,//lineJoin处的模型填充方式，为0时，则lineJoin为连续绘制纹理，为1时，则设为图片第一个像素处的颜色
linePatternGap:0,//填充图片之间的间隔宽度，单位为填充图片宽度的倍数，例如设为1时，相邻两张填充图片之间的间隔为填充图片的宽度
linePatternAnimSpeed:0,//动画速度，取值范围-5到5，为负数时，动画方向会变为反向的
lineDasharray:[0,0,0,0],//线的虚线样式，四位数组，单位像素
lineDashColor: "#ccc",//线虚线的颜色




/**
 * Text
 */
textName: "天安门", //{name}显示的文字内容，如果要显示某个属性得值，用大括号括起来即可
textSize: 14, //文字大小
textFill: "#ccc", //文字颜色
textOpacity: 1, //文字透明度，取值范围0-1
textFaceName: "monospace", //文字字体，与css的font-family定义相同
textWeight: "400", //文字字重,与css的font-weight定义相同
textStyle: "normal", //文字风格，支持斜体等，与cssfont-style定义相同
textRotation: 360, //文字旋转角度，0-360，单位度
textDx: 0, //文字在屏幕x轴上的偏移度，单位像素
textDy: 24, //文字在屏幕y轴上的偏移度，单位像素
textWrapWidth: 240, //文字换行长度，即文字长度超过该值时就会自动换行
//文字描边
textHaloFill: "#fff", //文字描边颜色
textHaloRadius: 0, //文字描边半径
textHaloOpacity: 1, //文字描边透明度，取值范围0-1
textHaloBlur: 0, //文字描边的清晰度
//对齐
textHorizontalAlignment: "middle", //文字相对坐标点的水平对齐方式，取值范围： left, middle, right
textVerticalAlignment: "middle", //文字相对坐标点的垂直对齐方式，取值范围： top, middle, bottom
textRotationAlignment: null, //如果设为map，则文字自动随地图旋转而旋转
textPitchAlignment: null, //如果设为map，则文字自动随地图倾斜而倾斜
//分布
textPlacement: "point", //(可选)看文档-沿线分布还是正常点分布
textSpacing: 250, //(可选)看文档-textPlacement必须是line。即图标沿线分布时，相互的间隔，单位像素
mergeOnProperty: null, //(可选)看文档-textPlacement必须是line。是否按照给定property属性合并该属性的值相同的line
//碰撞检测
textAllowOverlap: false, //必须开启碰撞检测。当此文字与其他文字碰撞时，是否仍然允许该文字显示
textIgnorePlacement: false, //必须开启碰撞检测。当此文字与其他文字碰撞时，是否仍然允许其他文字显示
//三维透视
textPerspectiveRatio: true, //是否开启三维透视，文字的近大远小效果
      
