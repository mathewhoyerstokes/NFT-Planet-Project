import * as THREE from 'three'
import { useRef, useEffect } from 'react'

const Universe = function ({ id, metadata }) {
  let includes = `
    #define NUM_OCTAVES 5

    float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
    vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}

    float noise(vec3 p){
        vec3 a = floor(p);
        vec3 d = p - a;
        d = d * d * (3.0 - 2.0 * d);

        vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
        vec4 k1 = perm(b.xyxy);
        vec4 k2 = perm(k1.xyxy + b.zzww);

        vec4 c = k2 + a.zzzz;
        vec4 k3 = perm(c);
        vec4 k4 = perm(c + 1.0);

        vec4 o1 = fract(k3 * (1.0 / 41.0));
        vec4 o2 = fract(k4 * (1.0 / 41.0));

        vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
        vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);

        return o4.y * d.y + o4.x * (1.0 - d.y);
    }


    float fbm(vec3 x) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100);
      for (int i = 0; i < NUM_OCTAVES; ++i) {
        v += a * noise(x);
        x = x * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    mat3 rotation3dX(float angle) {
      float s = sin(angle);
      float c = cos(angle);
    
      return mat3(
        1.0, 0.0, 0.0,
        0.0, c, s,
        0.0, -s, c
      );
    }
    

    mat3 rotation3dY(float angle) {
      float s = sin(angle);
      float c = cos(angle);
    
      return mat3(
        c, 0.0, -s,
        0.0, 1.0, 0.0,
        s, 0.0, c
      );
    }

    mat3 rotation3dZ(float angle) {
      float s = sin(angle);
      float c = cos(angle);
    
      return mat3(
        c, s, 0.0,
        -s, c, 0.0,
        0.0, 0.0, 1.0
      );
    }
    
    varying vec3 v_position;
    varying vec3 v_normal;
    varying vec2 v_uv;
    varying mat3 v_rotation;

    uniform float time;
    uniform vec3 mainColor;
    uniform vec3 secondaryColor;
    uniform vec3 backgroundColor;
    uniform float jagged;
    uniform float jaggedDepth;
    uniform vec3 rotation;
    uniform vec2 surfaceSpeed;
    uniform vec2 surfaceNoise;
    uniform vec3 size;
  `

  let vert = `
    ${includes}

    void main() {
      mat3 calcRotation = rotation3dX(time * rotation.x);
      calcRotation *= rotation3dY(time * rotation.y);
      calcRotation *= rotation3dZ(time * rotation.z);

      vec3 newPosition = position * size;
      newPosition *= mix(1.0 - jaggedDepth, 1.0 + jaggedDepth, fbm(position * jagged));
      newPosition *= calcRotation;

      gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
      v_position = position * size;
      v_normal = normal;
      v_uv = uv;
      v_rotation = calcRotation;
    }
  `

  let frag = `
    ${includes}

    void main() {
      vec3 lightColor = vec3(0.75, 0.75, 0.75);
      vec3 lightPos = vec3(-1.0, 1.0, 5.0);

      float f = fbm(v_position * jagged);

      float m = surfaceNoise.x * cos(time * surfaceSpeed.x + 0.03);
      float n = surfaceNoise.y * sin(time * surfaceSpeed.y + 0.04);

      vec3 landColor = mix(
        mix(secondaryColor, mainColor, step(0.5 - m, f)),
        backgroundColor,
        step(0.5 + n, fbm(v_position))
      );

      float ambientStrength = 0.75;
      vec3 ambientColor = vec3(0.5, 0.5, 0.5);
      vec3 ambient = ambientStrength * ambientColor;

      vec3 norm = normalize(v_normal);
      vec3 lightDir = normalize(lightPos);

      float diff = max(dot(norm, lightDir), 0.0);
      vec3 diffuse = diff * lightColor;

      vec3 result = (ambient + diffuse) * landColor;

      gl_FragColor = vec4(result, 1.0);
    }
  `

  const universe = useRef()
  
  useEffect(() => { 
    let div = universe.current
    let anim

    if (div !== null && metadata.properties.hasOwnProperty("mainColor")) {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, div.clientWidth / div.clientHeight, 0.1, 100)

      renderer.setSize( div.clientWidth, div.clientHeight)
      renderer.setClearColor(0x000000, 0);

      div.innerHTML = ""
      div.append(renderer.domElement)

      const { properties } = metadata

      const clock = new THREE.Clock()
      const uniforms = {
        time: { value: clock.getElapsedTime() },
        mainColor: { value: new THREE.Color(properties.mainColor) },
        secondaryColor: { value: new THREE.Color(properties.secondaryColor) },
        backgroundColor: { value: new THREE.Color(properties.backgroundColor) },
        jagged: { value: properties.jagged },
        jaggedDepth: { value: properties.jaggedDepth },
        size: { value: properties.size },
        rotation: { value: properties.rotation },
        surfaceSpeed: { value: properties.surfaceSpeed },
        surfaceNoise: { value: properties.surfaceNoise }
      }

      const geometry = new THREE.SphereGeometry(2.5, 256, 128)
      const material = new THREE.ShaderMaterial({ 
        uniforms,
        vertexShader: vert,
        fragmentShader: frag
      })
      const planet = new THREE.Mesh( geometry, material )
      scene.add( planet )

      camera.position.z = 7

      const animate = () => {
        anim = requestAnimationFrame(animate)

        uniforms.time.value = clock.getElapsedTime()

        renderer.render(scene, camera)
      }

      window.addEventListener("resize", function () {
        camera.aspect = div.clientWidth / div.clientHeight
        camera.updateProjectionMatrix()
        renderer.setSize( div.clientWidth, div.clientHeight)
      })

      animate()
    }     
    
    return () => cancelAnimationFrame(anim)
  }, [metadata, frag, vert])
    
  return (
    <>
      <div className="universe" ref={universe}></div>
    </>
  )
}

export default Universe;