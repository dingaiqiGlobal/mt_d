{
  "style": [
    {
      "renderPlugin": {
        "type": "line",
        "dataConfig": {
          "type": "line",
          "only2D": true
        },
        "sceneConfig": {
          "maxZoom": 24
        }
      },
      "filter": {
        "condition": true,
        "layer": "n110101_ditie_wl"
      },
      "symbol": {
        "visible": true,
        "lineColor": {
          "property": "NAME",
          "type": "categorical",
          "default": "yellow",
          "stops": [
            [
              "1号线",
              "#e55151"
            ],
            [
              "2号线",
              "#538cb7"
            ],
            [
              "5号线",
              "#e1a7d0"
            ],
            [
              "6号线",
              "#bb8835"
            ],
            [
              "7号线",
              "#e5610e"
            ],
            [
              "8号线",
              "#53b055"
            ],
            [
              "13号线",
              "#f9b816"
            ],
            [
              "机场快轨",
              "#8a6791"
            ]
          ]
        },
        "lineWidth": {
          "type": "exponential",
          "default": 2,
          "stops": [
            [
              13,
              2
            ],
            [
              16,
              5
            ]
          ]
        },
        "lineOpacity": 1
      },
      "name": "R-地铁"
    }
  ]
}