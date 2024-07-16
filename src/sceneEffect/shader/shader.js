const Qg = require("@/sceneEffect/shader/glsl/Qg.glsl").default;
const Gg = require("@/sceneEffect/shader/glsl/Gg.glsl").default;
const Ky = require("@/sceneEffect/shader/glsl/Ky.glsl").default;
import * as THREE from "three";
//雷达扫描-getRadarMetarial-转圈材质&FlabellumScanMaterial-扫描材质
export function getRadarMetarial(opts = {}) {
        const RadarShield = {
                uniforms: {
                        time: {
                                type: "f",
                                value: 0,
                        },
                        type: {
                                type: "f",
                                value: opts.type || 1, // 0 大扇形 1小扇形 2 环绕
                        },
                        color: {
                                type: "c",
                                value: new THREE.Color(opts.color || 0x00ffff),
                        },
                },
                vertexShaderSource: require("@/sceneEffect/shader/vert/Radar_vertex.vert").default,
                fragmentShaderSource: require("@/sceneEffect/shader/frag/Radar_fragment.frag").default,
        };
        const meshMaterial = new THREE.ShaderMaterial({
                uniforms: RadarShield.uniforms,
                defaultAttributeValues: {},
                vertexShader: RadarShield.vertexShaderSource,
                fragmentShader: RadarShield.fragmentShaderSource,
                // blending: THREE.NoBlending,
                blending: THREE.AdditiveBlending,
                depthWrite: !1,
                depthTest: !0,
                side: THREE.DoubleSide,
                transparent: !1,
                fog: !0,
        });
        return meshMaterial;
};
export function FlabellumScanMaterial(opts = {}) {
        //new THREE.PlaneBufferGeometry(this.radius,this.radius,2)
        var ScanShield = {
                //雷达
                uniforms: {
                        time: {
                                type: "f",
                                value: 0,
                        },
                        color: {
                                type: "c",
                                value: new THREE.Color(opts.color || "#ff0000"),
                        },
                        opacity: {
                                type: "f",
                                value: opts.color || 1,
                        },
                },
                vertexShaderSource: `
                    varying vec2 vUv;
                    void main(){
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                    }`,
                fragmentShaderSource: `
                    precision lowp float;
                    precision lowp int;
                    varying vec2 vUv;
                    uniform float time;
                    uniform vec3 color;
                    uniform float opacity;
          
                    #define pi 3.1415926535
                    #define PI2RAD 0.01745329252
                    #define TWO_PI (2. * PI)
                    
                    void main() {
                      vec2 pos = vUv - 0.5;
                      float r = length(pos);
                      if (r > 0.5) {
                        discard;
                      }
                      float t = atan(pos.y, pos.x) - time*2.5;
                      float a = (atan(sin(t), cos(t)) + pi)/(2.0*pi);
                      float ta = 0.5;
                      float v = smoothstep(ta-0.05,ta+0.05,a) * smoothstep(ta+0.05,ta-0.05,a);
                      vec3 col = vec3(0, v, 0);
                      float blink = pow(sin(time*1.5)*0.5+0.5, 0.8);
                      gl_FragColor = vec4(color, opacity * pow(a, 8.0*(.2+blink))*(sin(r*300.0)*.5+.5)*pow(r, 0.4));
                    }
                  `,
        };
        let material = new THREE.ShaderMaterial({
                uniforms: ScanShield.uniforms,
                vertexShader: ScanShield.vertexShaderSource,
                fragmentShader: ScanShield.fragmentShaderSource,
                blending: THREE.AdditiveBlending,
                transparent: !0,
                depthWrite: !1,
                depthTest: !0,
                side: THREE.DoubleSide,
        });
        animate();
        function animate() {
                ScanShield.uniforms.time.value += opts.speed || 0.015;
                requestAnimationFrame(animate);
        }
        return material;
};
//蓝色幕墙
export function getRippleWall(opts = {}) {
        let uniforms = {
                // time+=0.025
                time: {
                        type: "f",
                        value: 0,
                },
                color: {
                        type: "c",
                        value: new THREE.Color(opts.color || "#0099FF"),
                },
                opacity: {
                        type: "f",
                        value: opts.opacity || 1,
                },
                num: {
                        type: "f",
                        value: opts.num || 5,
                },
                hiz: {
                        type: "f",
                        value: 0.3,
                },
        };
        let meshMaterial = new THREE.ShaderMaterial({
                uniforms: uniforms,
                defaultAttributeValues: {},
                vertexShader: require("@/sceneEffect/shader/vert/RippleWall_vertex.vert").default,
                fragmentShader: require("@/sceneEffect/shader/frag/RippleWall_fragment.frag").default,
                blending: THREE.AdditiveBlending,
                transparent: !0,
                depthWrite: !1,
                depthTest: !0,
                side: THREE.DoubleSide,
                fog: !0,
        });
        return meshMaterial;
};
//黄色幕墙（流星）
export function getMeteorMaterial(opts = {}) {
        let uniforms = {
                time: {
                        //time+=0.0045
                        type: "f",
                        value: 0,
                },
                color: {
                        type: "c",
                        value: new THREE.Color(opts.color || "#EDD464"),
                },
                opacity: {
                        type: "f",
                        value: opts.opacity || 0.9,
                },
        };
        var vertexShaderSource = "\n  precision lowp float;\n  precision lowp int;\n  "
                .concat(
                        THREE.ShaderChunk.fog_pars_vertex,
                        "\n  varying vec2 vUv;\n  void main() {\n    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\n    vUv = uv;\n    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    "
                )
                .concat(THREE.ShaderChunk.fog_vertex, "\n  }\n");
        var fragmentShaderSource = "\n  precision lowp float;\n  precision lowp int;\n  uniform float time;\n  uniform vec3 color;\n  uniform float opacity;\n\n  varying vec2 vUv;\n\n  ".concat(
                Qg,
                "\n\n  float nutsack(vec2 uv){\n    uv.x *= sin(1.)*2.;\n    float t =  time*0.4;\n    uv.x = uv.x*180.0;\n    float dx = fract(uv.x);\n    uv.x = floor(uv.x);\n    uv.y *= 0.15;\n    float o=sin(uv.x*215.4);\n    float s=cos(uv.x*33.1)*.3 +.7;\n    float trail = mix(95.0,15.0,s);\n    float yv = 1.0/(fract(1. - uv.y + t*s + o) * trail);\n    yv = smoothstep(0.0,1.0,yv*yv);\n    yv = sin(yv*pi)*(s*5.0);\n    float d = sin(dx*pi);\n    return yv*(d*d);\n  }\n\n  void main() {\n    vec3 col = color * nutsack(vUv); // Get the jizz flowing\n    col += mix(color, vec3(0.,0.,0.), vUv.y);\n    gl_FragColor=vec4(col, opacity * (1. - vUv.y)); // output the spunk\n  }\n"
        );
        let material = new THREE.ShaderMaterial({
                uniforms: uniforms,
                defaultAttributeValues: {},
                vertexShader: vertexShaderSource,
                fragmentShader: fragmentShaderSource,
                blending: THREE.AdditiveBlending,
                transparent: !1,
                depthWrite: !1,
                depthTest: !0,
                side: THREE.DoubleSide,
                fog: !0,
        });

        // animate();
        // export function animate() {
        //   uniforms.time.value += options.dua || 0.045;
        //   requestAnimationFrame(animate);
        // }
        return material;
};

