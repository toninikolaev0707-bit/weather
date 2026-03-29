#include hash.frag

float leaf(vec2 p, float size) {
  p.y *= 1.4;
  p.x *= 0.7;

  p.x += 0.15 * sin(p.y * 3.0);

  float d = length(p);
  d += abs(p.y) * 0.6;

  return d - size;
}

float leafWide(vec2 p, float size) {
  p /= size;

  // симметрия
  p.x = abs(p.x);

  // делаем форму шире в центре
  float width = 0.5 + 0.4 * (1.0 - abs(p.y));

  // базовый эллипс
  float d = length(vec2(p.x / width, p.y));

  // заострение сверху (ключ)
  d += max(0.0, p.y) * 0.6;

  return d * size - size;
}

vec2 rotate(vec2 p, float angle) {
  return mat2(cos(angle), sin(angle), -sin(angle), cos(angle)) * p;
}

void animatedPetal(
  vec2 p,
  float jitter,
  float size,
  float shapeJitter,
  float speed,
  vec2 direction,
  inout float minDist,
  inout vec2 minPoint,
  inout vec2 minStaticPoint
) {
  vec2 tileInt = floor(p);
  vec2 tileFrac = fract(p);

  for(int j = -1; j <= 1; j++) {
    for(int i = -1; i <= 1; i++) {

      vec2 neighbor = vec2(float(i), float(j));

      // 🔑 ВАЖНО: используем vec2 hash (как в оригинале)
      vec2 h = hash(tileInt + neighbor);

      float s = (h.x * 2.0 - 1.0) * 0.02;

      // анимация
      vec2 point = 0.5 + 0.5 * sin(time * speed * h * jitter);
      vec2 diff = neighbor + point - tileFrac;

      // базовое вращение по направлению
      vec2 rotated = rotate(diff, atan(direction.y, direction.x));

      // единый рандом
      float rnd = fract(h.x + h.y);

      // вариация формы
      float stretch = mix(0.8, 1.3, rnd);
      rotated.y *= stretch;

      // случайный поворот
      rotated = rotate(rotated, rnd * 6.2831);

      // выбор формы
      // фиксируем форму ЖЁСТКО для этого тайла
	  float type = step(0.5, h.x); // стабильный выбор

	  float d1 = leaf(rotated, (0.12 + s) * size);
	  float d2 = leafWide(rotated, (0.08 + s) * size);

// выбираем форму ДО сравнения
	  float dist = mix(d1, d2, type);

      if(dist < minDist) {
        minDist = dist;
        minPoint = point;
        minStaticPoint = h; // ← ВАЖНО: vec2, не float
      }
    }
  }
}
