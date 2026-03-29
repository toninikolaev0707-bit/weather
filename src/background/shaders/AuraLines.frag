uniform float time;
uniform vec2 size;
uniform vec2 direction;
uniform float speed;
uniform float density;

#include util/fbm.frag;
#include util/line.frag;

float rain(vec2 p, float jitter, vec2 direction, float speed, float size, float lineLength) {
  // Move the input space in the given direction
  p += time * direction * speed * vec2(0, 2);
  // Animate the fall of the rain
  float minDist = 10.;
  vec2 minPoint;
  animatedLine(p, 0.01, lineLength * speed, speed, vec2(0.05, 1), minDist, minPoint);
  float line = step(size, minDist);
  return 1.0 - line;
}


half4 main(float2 coord) {

// ===== SCREEN SHAKE =====
  float shakeStrength = 2.0;

  vec2 shake = vec2(
    sin(time * 40.0),
    cos(time * 37.0)
  );

  // нормализация под экран
  shake *= shakeStrength / size;

  // применяем
  coord += shake * size;


  vec2 p = coord / size;
  // Remove aspect ratio
  p.x *= size.x / size.y;
  float alpha = 0.0;

  // Exponential speed from the input
  float baseSpeed = pow(speed - 0.5, 2.0);
  // Tile per 20 grid cells
  float tiling = max(size.x, size.y) / 70.0 / 20.0;

  // Overlap rain with based on density
  if(density > 3) {
    alpha += rain(p * 40.0 * tiling, 0.2, direction, baseSpeed + 10, 0.014, 0.6);
    alpha += rain(p * 70.0 * tiling, 0.2, direction, baseSpeed + 15, 0.03, 1.6);
  } else if(density > 2) {
    alpha += rain(p * 30.0 * tiling, 0.2, direction, baseSpeed + 5, 0.014, 0.6);
    alpha += rain(p * 50.0 * tiling, 0.4, direction, baseSpeed + 10, 0.02, 0.8);
  } else if(density > 1) {
    alpha += rain(p * 20.0 * tiling, 0.2, direction, baseSpeed + 5, 0.014, 0.6);
    alpha += rain(p * 30.0 * tiling, 0.2, direction, baseSpeed + 5, 0.014, 0.6);
  } else {
    alpha += rain(p * 12.0 * tiling, 0.1, direction, baseSpeed + 2, 0.0044, 0.4);
    alpha += rain(p * 20.0 * tiling, 0.15, direction, baseSpeed + 3, 0.008, 0.4);
  }

  if(density > 2) {
    float intensity = density > 3 ? 0.0 : 0.0;
  }

  return vec4(0.0, 0.0, 0.0, 1.0) * alpha * 0.7;
}
