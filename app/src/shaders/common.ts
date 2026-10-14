export const COMMON = `
uniform float2 iResolution;
uniform float iTime;

float hash(float2 p) {
  p = fract(p * float2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(float2 p) {
  float2 i = floor(p);
  float2 f = fract(p);
  float a = hash(i);
  float b = hash(i + float2(1.0, 0.0));
  float c = hash(i + float2(0.0, 1.0));
  float d = hash(i + float2(1.0, 1.0));
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(float2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + float2(17.1, 9.2);
    a *= 0.5;
  }
  return v;
}
// Rain streaks: thin falling lines in a hashed grid. slant > 0 leans right.
float rain(float2 uv, float t, float density, float slant, float speed) {
  uv.x += uv.y * slant;
  float2 g = float2(density, density * 0.12);
  float2 p = uv * g;
  float col = floor(p.x);
  float off = hash(float2(col, 3.1));
  p.y += t * speed * (0.8 + off) + off * 10.0;
  float2 f = fract(p);
  float drop = smoothstep(0.0, 0.06, 0.06 - abs(f.x - 0.5) * 0.9) * smoothstep(0.0, 0.5, f.y) * smoothstep(1.0, 0.7, f.y);
  float on = step(0.55, hash(float2(col, floor(p.y))));
  return drop * on;
}
`;
