varying vec2 vUv;

uniform sampler2D uTexture;
uniform sampler2D uNoiseMap;
uniform float uProgress;
uniform float uEdge;
uniform vec3 uEdgeColor;
uniform float uNoiseScale;

void main() {
  vec4 texColor = texture2D(uTexture, vUv);
  
  if (uProgress < 0.01) {
    gl_FragColor = texColor;
    return;
  }
  
  float noise = texture2D(uNoiseMap, vUv * uNoiseScale).r;
  
  if (noise < uProgress) discard;

  float edgeMask = smoothstep(uProgress, uProgress + uEdge, noise);
  vec3 edgeGlow = mix(uEdgeColor, texColor.rgb, edgeMask);
  
  gl_FragColor = vec4(edgeGlow, texColor.a);
}