import '/src/style.css';
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import gsap from 'gsap';

//scean
const scene = new THREE.Scene();

//perspective camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000); //
camera.position.z = 3.5;

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
  alpha: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;          //to get the realistic look and adjust the brightness
renderer.toneMappingExposure = 1;                  //to adjust the brightness
renderer.outputEncoding = THREE.sRGBEncoding;  

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0010;
composer.addPass(rgbShiftPass);

const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

let model;

new RGBELoader()
    .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function (texture) {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        // scene.background = envMap;     //disabling this will remove the background
        scene.environment = envMap;
        texture.dispose();
        pmremGenerator.dispose();

        const loader = new GLTFLoader();
        loader.load('./DamagedHelmet.gltf', (gltf) => {
            model = gltf.scene;
            scene.add(model);
        }, undefined, (error) => {
            console.error('An error occured while loading the Model',error);
        });
    });

window.addEventListener( "mousemove", (e) => {
  if(model) {
    const rotationX = (e.clientX / window.innerWidth - 0.5) * (Math.PI * .10);
    const rotationY = (e.clientY / window.innerHeight - 0.5) * (Math.PI * .10);
    gsap.to (model.rotation,{
      x: rotationY,
      y: rotationX,
      duration: 0.9,
      ease: "power2.out"
    })
  }
  // console.log(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
})

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;


function animate() {
  window.requestAnimationFrame(animate);
  // controls.update();
  renderer.render(scene, camera);
  composer.render();
}
animate();



//  https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/shanghai_bund_2k.hdr