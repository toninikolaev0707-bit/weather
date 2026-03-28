uniform float time;
uniform vec2 size;
uniform vec2 direction;
uniform float speed;
uniform float density;

#include util/hash.frag;

float hash12(vec2 p) {
  return hash(p).x;
}

vec2 rot(vec2 p, float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c) * p;
}

float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}




half4 main(float2 coord) {

// ===== SCREEN SHAKE =====
  float shakeStrength = 5.0;

  vec2 shake = vec2(
    sin(time * 40.0),
    cos(time * 37.0)
  );

  // нормализация под экран
  shake *= shakeStrength / size;

  // применяем
  coord += shake * size;


  vec2 p = coord / size;
  p.x *= size.x / size.y;

  float densT = clamp((density - 1.0) / 3.0, 0.0, 1.0);
  float speedT = clamp((speed - 1.0) / 3.0, 0.0, 1.0);

  float refCellPx = mix(600.0, 85.0, densT); 
  float grid = min(size.x, size.y) / refCellPx;

  // ❗ УБРАЛ ДВИЖЕНИЕ (фикс облаков)
  vec2 gp = p * grid;

  vec2 cell = floor(gp);
  vec2 f = fract(gp) - 0.5;

  float bestA = 0.0;
  vec3 bestC = vec3(0.0);

  float px = 1.0 / min(size.x, size.y);
  float bodyWidth = mix(0.010, 0.01, densT);
  float outlineWidth = bodyWidth + mix(0.014, 0.026, densT);

  float spawnRate = mix(2.0, 8.0, speedT);

  float activeChance = mix(0.01, 1.22, densT);

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {

      vec2 n = vec2(float(i), float(j));
      vec2 c = cell + n;

	  float tGlobal = time * spawnRate;

	  // стабильный "индекс поколения"
	  float tCell = floor(tGlobal);
      // фиксируем seed на момент спавна
	  float spawnId = floor(tGlobal + hash12(c));
	  float seed = hash12(c + spawnId);

	  // маленький offset (ВАЖНО: не ломает tCell)
	  float offset = hash12(c) * 0.999;

	  // локальное время с рассинхроном
	  float localT = fract(tGlobal + offset);

      // ===== РАНДОМ С УЧЁТОМ ВРЕМЕНИ =====

      if (seed < 1.0 - activeChance) {
        continue;
      }

      // ===== ЖИЗНЬ (0.5 - 1 сек) =====
      float lifeDuration = mix(0.3, 0.3, hash12(c + tCell + 10.0));
	  

      if (localT > lifeDuration) {
        continue;
      }

      float life = 1.0;

      // ===== ПОЗИЦИЯ =====
      vec2 center = vec2(
        hash12(c + tCell + vec2(11.7, 3.1)),
        hash12(c + tCell + vec2(5.9, 19.2))
      ) - 0.5;

      center *= 1.2;

      vec2 q = f - n - center;

      // ===== УГОЛ 360° =====
      float angle = hash12(c + tCell + vec2(12.3, 45.6)) * 6.2831853;
      q = rot(q, angle);

      // ===== ДЛИНА =====
      float halfLen = mix(0.22, 1.58, hash12(c + tCell + vec2(7.7, 8.4)));

      // ===== РАССТОЯНИЕ =====
      float d = sdSegment(q, vec2(-halfLen, 0.0), vec2(halfLen, 0.0));

      // ===== СУЖЕНИЕ (жёсткое, прямое) =====
      // расстояние от центра (0 = центр, 1 = край)
	  float t = abs(q.x) / halfLen;
	  t = clamp(t, 0.0, 1.0);

	  // инверсия → центр широкий, края узкие
	  float taper = 1.0 - t;

	  // жёсткость формы (подгони если надо)
	  taper = step(0.1, taper) * taper;

      float localBody = bodyWidth * taper;
      float localOutline = outlineWidth * taper;

      float aa = px * grid * 0.8;

      float body = 1.0 - smoothstep(localBody, localBody + aa, d);
      float outline = 1.0 - smoothstep(localOutline, localOutline + aa, d);

      // ===== ФИКС ПРОЗРАЧНОСТИ =====
      float combined = max(body, outline);

      // ===== ВЫБОР ТИПА РАЗРЕЗА =====
	  float typeRnd = hash12(c + spawnId + vec2(99.1, 12.7));

	  vec3 baseColor;

	  // 50% — белый
	  if (typeRnd < 0.5) {
	    baseColor = vec3(1.0);
	  }
	  // 25% — чёрный
	  else if (typeRnd < 0.75) {
	    baseColor = vec3(0.0);
	  }
	  // 25% — красный
	  else {
	    baseColor = vec3(0.780, 0.102, 0.102);
	  }


	  // ===== ОБВОДКА ВСЕГДА ЧЁРНАЯ =====
	  vec3 outlineColor = vec3(0.0);

	  // смешивание тела и обводки
	  vec3 ccol = mix(outlineColor, baseColor, body);

	  // применяем life
	  ccol *= life;
      float a = combined;

      if (a > bestA) {
        bestA = a;
        bestC = ccol;
      }
    }
  }

  return vec4(bestC, bestA);
}
