import { COMMON } from './common';

// Each scene is a full-frame painting in SkSL. Times are slow on purpose:
// the art should drift, never flicker.

const tide = `
half4 main(float2 fc) {
  float2 uv = fc / iResolution;
  float aspect = iResolution.x / iResolution.y;
  float t = iTime;
  float horizon = 0.5;
  float2 moon = float2(0.68, 0.2);
  float3 skyTop = float3(0.02, 0.04, 0.10);
  float3 skyLow = float3(0.10, 0.16, 0.30);
  float3 col = mix(skyTop, skyLow, smoothstep(0.0, horizon, uv.y));
  float2 d = (uv - moon) * float2(aspect, 1.0);
  float r = length(d);
  col += float3(0.85, 0.88, 0.95) * smoothstep(0.045, 0.04, r);
  col += float3(0.35, 0.42, 0.6) * exp(-r * 9.0) * 0.8;
  // faint high cloud
  float c = fbm(float2(uv.x * 3.0 + t * 0.01, uv.y * 8.0));
  col += float3(0.08, 0.10, 0.16) * smoothstep(0.55, 0.85, c) * smoothstep(horizon, 0.1, uv.y);
  // stars
  float s = hash(floor(fc / 3.0));
  col += float3(0.7) * step(0.9975, s) * smoothstep(horizon, 0.0, uv.y) * (0.6 + 0.4 * sin(t * 1.3 + s * 40.0));
  if (uv.y > horizon) {
    float z = 1.0 / (uv.y - horizon + 0.02);
    float2 sp = float2((uv.x - 0.5) * z * 1.6, z * 2.2 - t * 0.35);
    float w = fbm(sp * float2(1.0, 1.4));
    float w2 = fbm(sp * 2.7 + float2(t * 0.05, 0.0));
    float3 sea = mix(float3(0.03, 0.08, 0.16), float3(0.01, 0.03, 0.07), smoothstep(horizon, 1.0, uv.y));
    sea += float3(0.10, 0.16, 0.28) * w * smoothstep(1.0, horizon, uv.y);
    float cx = (uv.x - moon.x) * 7.0 / (0.4 + (uv.y - horizon) * 3.0);
    float column = exp(-cx * cx);
    float glint = smoothstep(0.55, 0.8, w2 * 0.6 + w * 0.6);
    sea += float3(0.75, 0.8, 0.95) * column * glint * 1.2;
    sea += float3(0.2, 0.25, 0.35) * column * 0.25;
    col = sea;
  }
  col += float3(0.25, 0.32, 0.5) * exp(-abs(uv.y - horizon) * 60.0) * 0.4;
  return half4(half3(col), 1.0);
}`;

const rainfall = `
half4 main(float2 fc) {
  float2 uv = fc / iResolution;
  float aspect = iResolution.x / iResolution.y;
  float t = iTime;
  float3 col = mix(float3(0.05, 0.07, 0.11), float3(0.08, 0.10, 0.15), uv.y);
  // City bokeh behind wet glass
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float scale = 3.2 + fi * 2.2;
    float2 p = uv * float2(scale * aspect, scale) + float2(fi * 7.3, fi * 3.1);
    float2 cell = floor(p);
    float2 f = fract(p) - 0.5;
    float h = hash(cell + fi);
    float2 o = float2(hash(cell + 11.0), hash(cell + 23.0)) - 0.5;
    float r = length(f - o * 0.5);
    float size = 0.18 + 0.2 * hash(cell + 5.0);
    float on = step(0.5, h) * smoothstep(0.2, 0.8, uv.y + 0.15);
    float3 tint = mix(float3(1.0, 0.62, 0.28), float3(0.45, 0.62, 1.0), step(0.78, h));
    float pulse = 0.75 + 0.25 * sin(t * 0.3 + h * 20.0);
    col += tint * smoothstep(size, size * 0.35, r) * on * (0.45 - fi * 0.1) * pulse;
  }
  // Droplets beaded on the glass
  float2 dp = uv * float2(28.0 * aspect, 28.0);
  float2 dc = floor(dp);
  float2 df = fract(dp) - 0.5;
  float dh = hash(dc + 4.0);
  float dr = length(df - (float2(hash(dc), hash(dc + 9.0)) - 0.5) * 0.6);
  col += float3(0.5, 0.58, 0.7) * smoothstep(0.12, 0.05, dr) * step(0.72, dh) * 0.35;
  // Running rain
  col += float3(0.55, 0.62, 0.75) * rain(uv * float2(aspect, 1.0), t, 70.0, 0.05, 0.9) * 0.45;
  col += float3(0.45, 0.5, 0.62) * rain(uv * float2(aspect, 1.0) + 3.0, t, 120.0, 0.05, 0.6) * 0.25;
  col *= 1.0 - 0.35 * length(uv - 0.5);
  return half4(half3(col), 1.0);
}`;

const hearth = `
half4 main(float2 fc) {
  float2 uv = fc / iResolution;
  float t = iTime;
  float x = (uv.x - 0.5) * (iResolution.x / iResolution.y);
  float y = 1.0 - uv.y;
  float n = fbm(float2(x * 4.0, y * 3.0 - t * 0.7));
  float n2 = fbm(float2(x * 9.0 + 3.0, y * 5.0 - t * 1.2));
  float tongues = 0.5 + 0.5 * sin(x * 22.0 + n2 * 4.0 - t * 0.8);
  float yy = y - 0.12;
  float shape = 1.0 - smoothstep(0.0, 0.3, abs(x + (n - 0.5) * 0.12) * (1.0 + yy * 2.4));
  float heat = shape * smoothstep(0.62, 0.0, yy + (n - 0.5) * 0.45 + (n2 - 0.5) * 0.18 + tongues * 0.08) * step(0.0, yy + 0.04);
  float3 col = float3(0.03, 0.012, 0.008);
  col += float3(0.30, 0.06, 0.02) * smoothstep(0.0, 0.25, heat);
  col += float3(0.70, 0.25, 0.05) * smoothstep(0.2, 0.55, heat);
  col += float3(0.50, 0.40, 0.15) * smoothstep(0.55, 0.9, heat);
  // Room glow
  col += float3(0.22, 0.07, 0.02) * exp(-length(float2(x, y - 0.1) * float2(1.2, 2.0)) * 2.2) * (0.85 + 0.15 * sin(t * 1.7) * sin(t * 2.3));
  // Ember bed
  float bed = smoothstep(0.08, 0.0, abs(y - 0.07)) * (1.0 - smoothstep(0.2, 0.42, abs(x)));
  float glow = fbm(float2(x * 14.0, t * 0.4));
  col += float3(0.9, 0.28, 0.05) * bed * (0.35 + 0.65 * glow);
  // Embers drifting upward
  float2 ep = float2(x * 9.0, y * 6.0 - t * 0.35);
  float2 ec = floor(ep);
  float2 ef = fract(ep) - 0.5;
  float eh = hash(ec);
  float2 eo = float2(sin(t * 0.8 + eh * 30.0) * 0.25, 0.0);
  float ember = smoothstep(0.06, 0.0, length(ef - eo)) * step(0.88, eh) * smoothstep(0.9, 0.2, y);
  col += float3(1.0, 0.55, 0.2) * ember * 0.9;
  return half4(half3(col), 1.0);
}`;

const highland = `
half4 main(float2 fc) {
  float2 uv = fc / iResolution;
  float aspect = iResolution.x / iResolution.y;
  float t = iTime;
  float3 top = float3(0.10, 0.08, 0.22);
  float3 mid = float3(0.42, 0.22, 0.38);
  float3 low = float3(0.92, 0.55, 0.38);
  float3 col = mix(top, mid, smoothstep(0.0, 0.45, uv.y));
  col = mix(col, low, smoothstep(0.38, 0.62, uv.y));
  // Drifting clouds
  float c = fbm(float2(uv.x * 2.2 * aspect + t * 0.025, uv.y * 5.0));
  float clouds = smoothstep(0.5, 0.78, c) * smoothstep(0.62, 0.1, uv.y);
  col = mix(col, float3(0.75, 0.45, 0.48), clouds * 0.55);
  // Low sun
  float2 sd = (uv - float2(0.3, 0.6)) * float2(aspect, 1.0);
  col += float3(1.0, 0.7, 0.45) * exp(-length(sd) * 7.0) * 0.6;
  // Hills: three ridges, nearer = darker
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float base = 0.58 + fi * 0.12;
    float ridge = base - 0.06 * fbm(float2(uv.x * (2.0 + fi) * aspect + fi * 4.0 + t * 0.004 * (fi + 1.0), fi)) - 0.03 * sin(uv.x * 3.0 + fi);
    float3 hill = mix(float3(0.24, 0.13, 0.26), float3(0.04, 0.03, 0.07), fi / 2.0);
    col = mix(col, hill, smoothstep(ridge, ridge + 0.004, uv.y));
  }
  // Wind in the grass: soft moving sheen on the nearest hill
  float sheen = fbm(float2(uv.x * 14.0 - t * 0.6, uv.y * 30.0));
  col += float3(0.10, 0.06, 0.08) * smoothstep(0.6, 0.85, sheen) * smoothstep(0.85, 1.0, uv.y);
  return half4(half3(col), 1.0);
}`;

const deepField = `
half4 main(float2 fc) {
  float2 uv = fc / iResolution;
  float aspect = iResolution.x / iResolution.y;
  float t = iTime * 0.02;
  float2 p = (uv - 0.5) * float2(aspect, 1.0) * 2.2;
  float2 q = float2(fbm(p + t), fbm(p + float2(5.2, 1.3) - t));
  float n = fbm(p + 2.5 * q);
  float3 col = float3(0.01, 0.01, 0.035);
  col += float3(0.42, 0.10, 0.48) * smoothstep(0.3, 0.8, n) * 1.3;
  col += float3(0.10, 0.28, 0.62) * smoothstep(0.4, 0.9, q.x) * 1.1;
  col += float3(1.0, 0.62, 0.72) * pow(smoothstep(0.55, 1.0, n), 3.0) * 1.1;
  for (int i = 0; i < 2; i++) {
    float sc = 90.0 + float(i) * 70.0;
    float2 sp = uv * float2(aspect, 1.0) * sc;
    float2 sc0 = floor(sp);
    float sh = hash(sc0 + float(i) * 13.0);
    float2 so = float2(hash(sc0 + 2.0), hash(sc0 + 7.0)) - 0.5;
    float sd = length(fract(sp) - 0.5 - so * 0.6);
    float tw = 0.55 + 0.45 * sin(iTime * (0.6 + sh) + sh * 60.0);
    col += float3(0.92, 0.94, 1.0) * smoothstep(0.12, 0.0, sd) * step(0.93, sh) * tw * (1.0 - float(i) * 0.4);
  }
  col *= 1.0 - 0.4 * length(uv - 0.5);
  return half4(half3(col), 1.0);
}`;

const storm = `
half4 main(float2 fc) {
  float2 uv = fc / iResolution;
  float aspect = iResolution.x / iResolution.y;
  float t = iTime;
  float c = fbm(float2(uv.x * 2.5 * aspect + t * 0.04, uv.y * 3.0 - t * 0.02));
  float c2 = fbm(float2(uv.x * 5.0 * aspect - t * 0.06, uv.y * 6.0));
  float3 col = mix(float3(0.05, 0.06, 0.10), float3(0.24, 0.27, 0.36), smoothstep(0.3, 0.85, c));
  col += float3(0.10, 0.11, 0.16) * smoothstep(0.5, 0.9, c2) * smoothstep(0.75, 0.0, uv.y);
  col = mix(col, float3(0.04, 0.045, 0.07), smoothstep(0.5, 1.0, uv.y));
  // distant city glow on the horizon
  col += float3(0.30, 0.18, 0.10) * exp(-(1.0 - uv.y) * 7.0) * 0.6;
  // Slow, soft glow inside the clouds (no flashing)
  float flash = pow(0.5 + 0.5 * sin(t * 0.21), 12.0);
  col += float3(0.35, 0.38, 0.55) * flash * smoothstep(0.45, 0.8, c2) * smoothstep(0.7, 0.1, uv.y) * 0.5;
  col += float3(0.6, 0.65, 0.78) * rain(uv * float2(aspect, 1.0), t, 90.0, 0.32, 1.6) * 0.38;
  col += float3(0.5, 0.55, 0.68) * rain(uv * float2(aspect, 1.0) + 7.0, t, 150.0, 0.32, 1.1) * 0.22;
  col *= 1.0 - 0.3 * length(uv - 0.5);
  return half4(half3(col), 1.0);
}`;

export const SCENE_SHADERS = {
  waves: COMMON + tide,
  rain: COMMON + rainfall,
  fire: COMMON + hearth,
  wind: COMMON + highland,
  orbit: COMMON + deepField,
  storm: COMMON + storm,
} as const;
