uniform float time;
uniform vec2 size;
uniform vec2 direction;
uniform float speed;
uniform float density;

#include util/petal.frag

// From https://www.shadertoy.com/view/4djSRW
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * .1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 bloomColor(float x, float edge) {
  // Create a gradient that goes through the pinks of a cherry blossom
  vec3 pct = vec3(x);
  pct.g = pow(x, 0.5);
  pct.b = sin(x * 3.14159 * 0.9);
  vec3 primary = mix(
    vec3(1.00,1.00,0.00),  // тёмный зелёный (тень)
    vec3(1.00,0.70,0.00),  // грязно-зелёный
    pct
  );

  return mix(vec3(0.0, 0.0, 0.0), primary, edge);
}

vec4 bloom(vec2 p, float jitter, float shapeJitter, vec2 direction, float speed, float size) {
  // Move the input space in the given direction
  p += time * direction * speed * vec2(-1, 1);
  // Animate the swaying of the blossoms
  float minDist = 10.;
  vec2 minPoint;
  vec2 minStaticPoint;
  animatedPetal(p, jitter, size, shapeJitter, speed, direction, minDist, minPoint, minStaticPoint);
  float alpha = 1.0 - smoothstep(-0.012, 0.002, minDist);
  float smoothAlpha = alpha;
  // Assign a random color based off this grid cell
  float colorRnd = hash12(minStaticPoint);

  float shade = hash12(minStaticPoint + 2.3);

  vec3 col = bloomColor(colorRnd, smoothAlpha);

  // создаём мягкую тень по краям
  float edge = smoothstep(0.0, 0.08, minDist);
  col *= mix(1, 1.0, edge);

 
  return vec4(alpha * col, alpha);
}

half4 main(float2 coord) {



  vec2 p = coord / size;
  // Remove aspect ratio
  p.x *= size.x / size.y;

  // Exponential speed from the input
  float baseSpeed = pow(speed - 0.5, 1.5);
  // Tile per 20 grid cells
  float tiling = max(size.x, size.y) / 50.0 / 20.0;

  vec4 color = vec4(0.0);

  if(density > 3) {
    color += bloom(p * 16.0 * tiling, 5.0 / speed, 0.05, direction, baseSpeed * 0.2 + 0.1, 0.8);
  } else if(density > 2) {
    color += bloom(p * 13.0 * tiling, 5.0 / speed, 0.08, direction, baseSpeed * 0.2 + 0.1, 0.6);
  } else if(density > 1) {
    color += bloom(p * 6.0 * tiling, 5.0, 0.1, direction, baseSpeed * 0.05 + 0.06, 0.35);
  } else {
    color += bloom(p * 3.0 * tiling, 5.0, 0.1, direction, baseSpeed * 0.05 + 0.05, 0.15);
  }

  return color;
}