// Cheap single-scatter Rayleigh/Mie approximation, not a CSS gradient with a
// canvas on top: sky color comes from integrating scattering phase functions
// along the view ray against the sun's elevation, which is what makes the
// dark-hour-then-fast-violent-shift dawn curve fall out on its own instead
// of being hand-keyframed.

const VERTEX_SHADER = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uElevation;
uniform float uAzimuth;
uniform float uHorizonY;
uniform float uStarOpacity;
uniform float uVelocity; // 0..1, damped scroll speed — drives the atmospheric smear

#define PI 3.14159265

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  uv.y = 1.0 - uv.y;

  // Subtle anamorphic pull at the frame edges, strongest when scrolling fast
  // — release settles it back to zero over the velocity's own damping.
  float edgeDist = abs(uv.x - 0.5) * 2.0;
  uv.x += (uv.x - 0.5) * edgeDist * edgeDist * uVelocity * 0.05;

  float rayAngle;
  if (uv.y <= uHorizonY) {
    rayAngle = mix(78.0, 0.0, uv.y / uHorizonY);
  } else {
    rayAngle = mix(0.0, -26.0, (uv.y - uHorizonY) / (1.0 - uHorizonY));
  }

  float cosTheta = cos(radians(rayAngle - uElevation));
  float phaseR = (3.0 / (16.0 * PI)) * (1.0 + cosTheta * cosTheta);

  float g = 0.78;
  float phaseM = (1.0 - g * g) / (4.0 * PI * pow(max(1.0 + g * g - 2.0 * g * cosTheta, 0.0001), 1.5));

  float altitude = max(rayAngle, 0.0);
  float density = exp(-altitude / 9.0);

  vec3 betaR = vec3(5.8e-3, 13.5e-3, 33.1e-3);
  float betaM = 4.0e-3;

  float dawnT = smoothstep(-10.0, 8.0, uElevation);
  vec3 scattered = (betaR * phaseR + vec3(betaM * phaseM)) * density * 40.0;
  vec3 dawnColor = 1.0 - exp(-scattered * mix(0.4, 2.3, dawnT));

  float nightMix = 1.0 - smoothstep(-18.0, -4.0, uElevation);
  vec3 nightColor = vec3(0.018, 0.026, 0.05);
  vec3 sky = mix(dawnColor, nightColor, nightMix * (1.0 - density * 0.3));

  // Horizontal glow bulge that tracks azimuth as it drifts across the scroll.
  float azimuthU = (uAzimuth - 95.0) / (128.0 - 95.0);
  float glowDist = uv.x - azimuthU;
  // Cloud advection: the glow bulge bleeds further along the scroll axis
  // (vertical) as velocity rises, rather than staying a fixed-radius pool.
  float glow = exp(-glowDist * glowDist * 18.0) * dawnT;
  glow *= 1.0 - clamp(abs(uv.y - uHorizonY) * (2.2 / (1.0 + uVelocity * 1.6)), 0.0, 1.0);
  sky += glow * vec3(1.0, 0.55, 0.22) * 0.4;

  float starField = 0.0;
  if (uv.y < uHorizonY) {
    // Star trails: stretching the sample cell's vertical resolution turns
    // each point into a short vertical streak instead of a dot once the
    // page is moving, and collapses back to a point at rest.
    vec2 cellRes = vec2(uResolution.x, uResolution.y / (1.0 + uVelocity * 5.0));
    vec2 starUv = floor(uv * cellRes / 3.2);
    float starHash = hash(starUv);
    if (starHash > 0.9935) {
      float twinkle = hash(starUv + 7.0);
      starField = (0.5 + 0.5 * sin(twinkle * 40.0)) * uStarOpacity;
    }
  }
  sky += vec3(starField);

  gl_FragColor = vec4(sky, 1.0);
}
`;

let gl = null;
let canvas = null;
let uniforms = null;
let ready = false;

function compile(context, type, source) {
  const shader = context.createShader(type);
  context.shaderSource(shader, source);
  context.compileShader(shader);
  if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
    console.warn('[sky] shader compile failed', context.getShaderInfoLog(shader));
    context.deleteShader(shader);
    return null;
  }
  return shader;
}

function resize() {
  if (!canvas || !gl) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const width = Math.round(window.innerWidth * dpr);
  const height = Math.round(window.innerHeight * dpr);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  }
}

export function initSky(canvasEl) {
  canvas = canvasEl;
  gl =
    canvas.getContext('webgl', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    }) || canvas.getContext('experimental-webgl');

  if (!gl) return false;

  const vertexShader = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) return false;

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('[sky] program link failed', gl.getProgramInfoLog(program));
    return false;
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // One oversized triangle covering the viewport — cheaper than a quad,
  // no seam, standard fullscreen-pass trick.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const positionLoc = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  uniforms = {
    uResolution: gl.getUniformLocation(program, 'uResolution'),
    uElevation: gl.getUniformLocation(program, 'uElevation'),
    uAzimuth: gl.getUniformLocation(program, 'uAzimuth'),
    uHorizonY: gl.getUniformLocation(program, 'uHorizonY'),
    uStarOpacity: gl.getUniformLocation(program, 'uStarOpacity'),
    uVelocity: gl.getUniformLocation(program, 'uVelocity'),
  };

  resize();
  window.addEventListener('resize', resize, { passive: true });
  ready = true;
  return true;
}

export function paintSky(sunState, starOpacity, normalizedVelocity = 0) {
  if (!ready) return;
  resize();
  gl.uniform2f(uniforms.uResolution, canvas.width, canvas.height);
  gl.uniform1f(uniforms.uElevation, sunState.elevation);
  gl.uniform1f(uniforms.uAzimuth, sunState.azimuth);
  gl.uniform1f(uniforms.uHorizonY, sunState.horizonY);
  gl.uniform1f(uniforms.uStarOpacity, starOpacity);
  gl.uniform1f(uniforms.uVelocity, normalizedVelocity);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

export function isSkyReady() {
  return ready;
}
