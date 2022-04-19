// // varying vUv;
// // varying uv;
// // varying #version 300 es

// attribute vec3 position;
// // #define PI = 3.14;

// void main() {
//     gl_position = vec4(position,1.0)
// }

precision highp float;
uniform vec2 resolution;
uniform float time;
uniform float xScale;
uniform float yScale;
uniform float distortion;

void main() {
    vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x , resolution.y);

    float d = length(p) * distortion;

    float rx = p.x * (1.0 + d);

    float gx = p.x;

    float bx = p.x * (1.0 - d);

    float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);

    float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);

    float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);

    gl_FragColor = vec4(r, g, b, 1.0);

}
