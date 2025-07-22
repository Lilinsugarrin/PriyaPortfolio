import * as THREE from 'three';
import './style.scss'
import { OrbitControls } from "./utils/OrbitControls.js";
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import gsap from 'gsap';
import { buffer } from 'three/tsl';

import { Howl } from 'howler';

window.addEventListener('load', () => {
  document.body.style.visibility = 'visible';
});



// WASD keys state
const keyboardState = {
  w: false,
  s: false,
  a: false,
  d: false,
};

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (key in keyboardState) {
    keyboardState[key] = true;
  }
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (key in keyboardState) {
    keyboardState[key] = false;
  }
});


const canvas = document.querySelector("#experience-canvas");
const sizes ={
  width: window.innerWidth,
  height: window.innerHeight

};

let anton;
let earL;
let earR;
let body;
let wacom;
let fourth;
let song;

let justOpenedModal = false;




document.querySelectorAll('.modal-overlay').forEach(overlay => {

    overlay.addEventListener('pointerup', (e) => {
    if (e.target === overlay) {
      const modal = overlay.querySelector('.modal');
      hideModal(modal);
    }
  });
});



// Modal elements
const modals = {
  about: document.querySelector(".modal.about"),
  project: document.querySelector(".modal.project"),
  work: document.querySelector(".modal.work"),
  contact: document.querySelector(".modal.contact"),
};

// Handle touch flag for avoiding double triggers on touch devices
let touchHappened = false;

document.querySelectorAll(".modal-exit-button").forEach((button) => {
  button.addEventListener("pointerup", (e) => {
  const modal = e.target.closest(".modal");
  hideModal(modal);
});

  button.addEventListener("touchstart", (e) => {
    touchHappened = true;
    const modal = e.target.closest(".modal");
    hideModal(modal);
  });

  button.addEventListener("click", (e) => {
    if (touchHappened) {
      touchHappened = false;
      return;
    }
    const modal = e.target.closest(".modal");
    hideModal(modal);
  });
});


document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      const modal = overlay.querySelector('.modal');
      hideModal(modal);
    }
  });
});

const showModal = (modal) => {
  if (!modal) return;
  justOpenedModal = true; // prevent closing on same click
  const overlay = modal.closest('.modal-overlay');
  if (!overlay) return;

  overlay.style.display = "flex";
  modal.style.display = "block";

  gsap.set(modal, { opacity: 0 });
  gsap.to(modal, {
    opacity: 1,
    duration: 0.5,
  });

  // reset the flag shortly after to allow closing
  setTimeout(() => {
    justOpenedModal = false;
  }, 100); // 100ms delay is usually enough
};


const hideModal = (modal) => {
  if (!modal) return;
  const overlay = modal.closest('.modal-overlay');
  if (!overlay) return;

  gsap.to(modal, {
    opacity: 0,
    duration: 0.5,
    onComplete: () => {
      modal.style.display = "none";
      overlay.style.display = "none";
    },
  });
};

document.addEventListener('click', (e) => {
  if (justOpenedModal) return; // skip if modal was just opened

  document.querySelectorAll('.modal').forEach(modal => {
    const isClickInside = modal.contains(e.target);
    const isVisible = getComputedStyle(modal).display !== 'none';

    if (!isClickInside && isVisible) {
      hideModal(modal);
    }
  });
});



const zAxis = [];
const yAxis = [];

const socialLinks ={Project: "https://priya3dprojects.my.canva.site/",
  Work: "https://priya3dprojects.my.canva.site/#page-PBpFJrmvRSmlLWsY",
}

//socialwithTouch
const handleInteraction = (e) => {
  if (currentIntersects.length > 0) {
    const object = currentIntersects[0].object;

    // Open external link
    Object.entries(socialLinks).forEach(([key, url]) => {
      if (object.name.includes(key)) {
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
        if (newWindow) newWindow.opener = null;
      }
    });

    // Show modal
    if (object.name.includes("AboutMe")) {
      showModal(modals.about);
    } else if (object.name.includes("Project")) {
      showModal(modals.project);
    } else if (object.name.includes("Work")) {
      showModal(modals.work);
    } else if (object.name.includes("Contact")) {
      showModal(modals.contact);
    }
  }
};

window.addEventListener("click", handleInteraction);
window.addEventListener("pointerup", handleInteraction); // works for both mouse and touch


const raycasterObjects = [];
let currentIntersects = [];

let hoveredObject = null;

//let currentHoveredObject = null;


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

// Loaders
const textureLoader = new THREE.TextureLoader();

// Model Loaders
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( "/draco/");

const loader = new GLTFLoader();
loader.setDRACOLoader( dracoLoader );

const environmentMap = new THREE.CubeTextureLoader()
	.setPath( 'textures/skybox/' )
	.load( [
				'px.webp',
				'nx.webp',
				'py.webp',
				'ny.webp',
				'pz.webp',
				'nz.webp'
			] );


const textureMap = {
  First: {day:"/textures/room/First_Texture_Set.webp"},
  backdrop: {day:"/textures/room/Second_Texture_Set.webp"},
  Thrid: {day:"/textures/room/Thrid_Texture_Set.webp"},
  Fourth: {day:"/textures/room/Fourth_Texture_Set.webp"},
  Fifth: {day:"/textures/room/Fifth_Texture_Set.webp"},
  Sixth: {day:"/textures/room/Sixth_Texture_Set.webp"},
  TM: {day:"/textures/room/Target_Texture_Set.webp"}
};

const loadedTextures = {
  day:{

  }
};

Object.entries(textureMap).forEach(([key, paths])=>{
  const dayTexture = textureLoader.load(paths.day);
  dayTexture.flipY = false;
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  loadedTextures.day[key] = dayTexture;

});

const videoElement= document.createElement("video");
videoElement.src= "/textures/video/DrawingTen.mp4";
videoElement.loop =true;
videoElement.muted = true;
videoElement.playsInline=true;
videoElement.autoplay= true;
videoElement.play()

const videoTexture = new THREE.VideoTexture(videoElement)
videoTexture.colorSpace =THREE.SRGBColorSpace;
videoTexture.flipY = false;

const videoElement2= document.createElement("video");
videoElement2.src= "/textures/video/Donli.mp4";
videoElement2.loop =true;
videoElement2.muted = true;
videoElement2.playsInline=true;
videoElement2.autoplay= true;
videoElement2.play()

const videoTexture2 = new THREE.VideoTexture(videoElement2)
videoTexture2.colorSpace =THREE.SRGBColorSpace;
videoTexture2.flipY = false;
videoTexture2.center.set(0.5, 0.5);
videoTexture2.rotation = Math.PI / 2;

window.addEventListener("mousemove",(e)=>{
touchHappened = false;
pointer.x = ( e.clientX / window.innerWidth ) * 2 - 1;
pointer.y = - ( e.clientY / window.innerHeight ) * 2 + 1;


});

window.addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("pointerdown", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

window.addEventListener("pointerup", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  handleRaycasterInteraction();
});


window.addEventListener(
  "touchstart",
  (e) => {
    
    e.preventDefault();
    pointer.x = (e.touches[0].clientX / sizes.width) * 2 - 1;
    pointer.y = -(e.touches[0].clientY / sizes.height) * 2 + 1;
  },
  { passive: false }
);

window.addEventListener(
  "touchend",
  (e) => {
  
    e.preventDefault();
    handleRaycasterInteraction();
  },
  { passive: false }
);

function handleRaycasterInteraction(){
if(currentIntersects.length>0){
    const object = currentIntersects[0].object;

  if(object.name.includes("AboutMe")){
    showModal(modals.about)
  }else if(object.name.includes("Project")){
    showModal(modals.project)
  }else if(object.name.includes("Work")){
     showModal(modals.work)   
  }else if(object.name.includes("Contact")){
     showModal(modals.contact)   
  }
}

}

window.addEventListener("click",(e)=>{
  if(currentIntersects.length>0){
    const object = currentIntersects[0].object;
  Object.entries(socialLinks).forEach(([key,url])=>{
    if (object.name.includes(key)){
      const newwindow = window.open();
      newwindow.opener=null;
      newwindow.location=url;
      newwindow.target="_blank";
      newwindow.rel="noopener noreferrer"
    }
  })
     if(object.name.includes("AboutMe")){
    showModal(modals.about)
  }else if(object.name.includes("Project")){
    showModal(modals.project)
  }else if(object.name.includes("Work")){
     showModal(modals.work)   
  }else if(object.name.includes("Contact")){
     showModal(modals.contact)   
  }


  }
});


loader.load("/models/Room_Portfolio.glb",(glb)=>{
  glb.scene.traverse((child)=>{
    if(child.isMesh){
       if (child.name.includes("Anton")) {
        anton= child;
        zAxis.push(child);
        child.position.x -= 0.2;
        child.position.z -= 0.07;
        child.userData.initialPosition = new THREE.Vector3().copy(
          child.position
        );
      }
      else if(child.name.includes("Raycaster")){
         raycasterObjects.push(child);
      }
      else if (child.name.includes("Wacom")) {
        wacom= child;
        child.position.x == 0;
        child.position.z == 0;
        child.userData.initialPosition = new THREE.Vector3().copy(
          child.position
        );
      }
       else if (child.name.includes("Fourth")){
        fourth= child;
        child.position.x += 0.0;
        child.position.z += 0.00;
        child.userData.initialPosition = new THREE.Vector3().copy(
          child.position
        );
      }
       else if (child.name.includes("Body")){
        body= child;
        child.position.x += 0.0;
        child.position.z += 0.00;
        child.userData.initialPosition = new THREE.Vector3().copy(
          child.position
        );
      }
      else if (child.name.includes("Earright")) {
        earR= child;
        child.position.x += 0.175;
        child.position.z +=0;
        child.userData.initialPosition = new THREE.Vector3().copy(
          child.position
        );
      }
      else if (child.name.includes("Earleft")) {
        earL= child;
        child.position.x -= 0.175;
        child.position.z +=0;
        child.userData.initialPosition = new THREE.Vector3().copy(
          child.position
        );
      }
       else if (child.name.includes("Song")){
        song=child;
          child.material = new THREE.MeshBasicMaterial({
            color: 0x558bc8,
            transparent: true,
            opacity:0.66,
            depthWrite: false,
          })
          child.userData.initialPosition = new THREE.Vector3().copy(
          child.position
        );

        }else if(child.name.includes("Glass")){
          child.material = new  THREE.MeshPhysicalMaterial({
            color: 0xffffff,
				transmission: 1,
				opacity: 1,
				metalness: 0,
				roughness: 0,
				ior: 1.5,
				thickness: 0.01,
				specularIntensity: 1,
        envMap: environmentMap,
				envMapIntensity: 1,
        depthWrite: false,
          })
        } else if(child.name.endsWith("Screen")){
          child.material = new THREE.MeshBasicMaterial({
            map: videoTexture,
          });
        }else if(child.name.endsWith("Screen2")){
          child.material = new THREE.MeshBasicMaterial({
            map: videoTexture2,
          });
        }
        
        else{

        }


      Object.keys(textureMap).forEach(key=>{
        if(child.name.includes(key))
        {
          const material = new THREE.MeshBasicMaterial({
            map: loadedTextures.day[key],
          });
          child.material = material;

          if(child.name.includes("RotateZ")){
            zAxis.push(child);
          }

          if(child.material.map){
            child.material.map.miinFilter = THREE.LinearFilter;
          }
        }

      });
    }
   

    scene.add(glb.scene);
  });

});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, sizes.width / sizes.height , 0.1, 1000 );

camera.position.set(
4.231804204982889,
3.269466634438861,
13.844784081227601
)

const renderer = new THREE.WebGLRenderer({canvas:canvas, antialias:true});
renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
//renderer.setAnimationLoop( animate );
//document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
//scene.add( cube );

const controls = new OrbitControls( camera, renderer.domElement );
controls.minDistance=-15;
controls.maxDistance=18;
controls.minPolarAngle =0;
controls.maxPolarAngle = Math.PI /2;
controls.minAzimuthAngle =-Math.PI/5;
controls.maxAzimuthAngle = Math.PI/3;

//mobileINteract
controls.enableZoom = true;
controls.zoomSpeed = 0.5;

controls.enableRotate = true;
controls.rotateSpeed = 0.5;

controls.enablePan = false; // Prevent accidental panning on touch

controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
				controls.dampingFactor = 0.05;
controls.update();
controls.target.set(
0.5033536627783523,
1.3236817327233221,
4.337810322387194
)
//Event Listner
window.addEventListener("resize",()=>{
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  //Update Camera
  camera.aspect = sizes.width/ sizes.height 
  camera.updateProjectionMatrix();

  //Update renderer
  renderer.setSize( sizes.width, sizes.height );
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
})

function animate() {
}





const render =(timestamp) =>{

  controls.update();
  //console.log(camera.position);
  //console.log("000000000")
  //console.log(controls.target);

  //wasd
  // WASD Camera Movement (optional: move controls.target too)
const zoomSpeed = 0.1;
const strafeSpeed = 0.1;

// Get forward direction (camera look direction)
const forward = new THREE.Vector3();
camera.getWorldDirection(forward);

// Get right vector using cross product
const right = new THREE.Vector3();
right.crossVectors(camera.up, forward).normalize();

if (keyboardState.w) {
  camera.position.addScaledVector(forward, zoomSpeed);
  controls.target.addScaledVector(forward, zoomSpeed);
}

if (keyboardState.s) {
  camera.position.addScaledVector(forward, -zoomSpeed);
  controls.target.addScaledVector(forward, -zoomSpeed);
}

if (keyboardState.a) {
  camera.position.addScaledVector(right, -strafeSpeed);
  controls.target.addScaledVector(right, -strafeSpeed);
}

if (keyboardState.d) {
  camera.position.addScaledVector(right, strafeSpeed);
  controls.target.addScaledVector(right, strafeSpeed);
}


 //animate ZRoate
 zAxis.forEach(rotatez=>{
  rotatez.rotation.y -= 0.01;
 });

 //animateZUPDown
 if (anton) {
    const time = timestamp * 0.0015;
    const amplitude = 0.63
    const position =
      amplitude * Math.sin(time) * (1 - Math.abs(Math.sin(time)) * 0.1);
    anton.position.y = anton.userData.initialPosition.y + position;
  }


//earmoveleft-right
  if(earL){
    const time = timestamp * 0.0015;
    const amplitude = 0.15
    const position =
    amplitude * Math.sin(time) * (1 - Math.abs(Math.sin(time)) * 0.1);
    earL.position.x = earL.userData.initialPosition.x + position;

  }

  if(earR){
    const time = timestamp * 0.0015;
    const amplitude = 0.15
    const position =
    amplitude * Math.sin(time) * (1 - Math.abs(Math.sin(time)) * 0.1);
    earR.position.x = earR.userData.initialPosition.x - position;

  }

  //Song
  if(song){
    const time = timestamp * 0.0015;
    const amplitude = 0.15
    const position =
    amplitude * Math.sin(time) * (1 - Math.abs(Math.sin(time)) * 0.1);
    song.position.x = song.userData.initialPosition.x - position;

  }

  //BodymoveUpDown
  if (body) {
    const time = timestamp * 0.0015;
    const amplitude = 0.045
    const position =
      amplitude * Math.sin(time) * (1 - Math.abs(Math.sin(time)) * 0.1);
    body.position.y = body.userData.initialPosition.y + position;
  }

  //WacommoveUpDown
  if (wacom) {
    const time = timestamp * 0.0015;
    const amplitude = 0.2
    const position =
      amplitude * Math.sin(time) * (1 - Math.abs(Math.sin(time)) * 0.1);
    wacom.position.y = wacom.userData.initialPosition.y + position;
  }

   //FourthFisfmoveUpDown
  if (fourth) {
    const time = timestamp * 0.0015;
    const amplitude = 0.1
    const position =
      amplitude * Math.sin(time) * (1 - Math.abs(Math.sin(time)) * 0.1);
    fourth.position.y = fourth.userData.initialPosition.y + position;
  }

  //Raycaster
  // update the picking ray with the camera and pointer position
  
	raycaster.setFromCamera( pointer, camera );

	// calculate objects intersecting the picking ray
	currentIntersects = raycaster.intersectObjects(raycasterObjects);

	// Hover animation logic
if (currentIntersects.length > 0) {
  const intersected = currentIntersects[0].object;

  // If it's a new object being hovered
  if (hoveredObject !== intersected) {
    // Reset the previous one
    if (hoveredObject) {
      gsap.to(hoveredObject.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.3,
        ease: "back.out(1.7)",
      });
    }

    // Animate the new one
    gsap.to(intersected.scale, {
      x: 1.25,
      y: 1.25,
      z: 1.25,
      duration: 0.3,
      ease: "back.out(1.7)",
    });

    hoveredObject = intersected;
  }

  document.body.style.cursor = "pointer";

} else {
  // If we're not hovering anything
  if (hoveredObject) {
    gsap.to(hoveredObject.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.3,
      ease: "back.out(1.7)",
    });
    hoveredObject = null;
  }

  document.body.style.cursor = "default";
}


  if(currentIntersects.length>0){
    const currentIntersectObject =currentIntersects[0].object;
    
 
  if (currentIntersectObject.name.includes("Pointer")) {
        document.body.style.cursor = "pointer";
      } else {
        document.body.style.cursor = "default";
      }
    } else {
        document.body.style.cursor = "default";
      }

  renderer.render( scene, camera );

  window.requestAnimationFrame(render);

}




render()



const loadingScreen = document.querySelector('.loading-screen');

function hideLoadingScreen() {
  loadingScreen.classList.add('slide-up');
  document.removeEventListener('click', hideLoadingScreen);
  document.removeEventListener('touchstart', hideLoadingScreen);
}

document.addEventListener('click', hideLoadingScreen);
document.addEventListener('touchstart', hideLoadingScreen);

const backgroundMusic = new Howl({
  src: [

    '/audio/ES_Pillow (Instrumental Version) - SCENE.mp3'
  ],
  loop: true,
  volume: 0,
});


function fadeInMusicAndHideLoading() {
  backgroundMusic.play();
  backgroundMusic.fade(0, 1, 4000); // fade from 0 to 1 over 4000 ms (4 sec)

  // After fade completes (4 sec), hide loading screen
  setTimeout(() => {
    document.querySelector('.loading-screen').classList.add('slide-up');
  }, 4000);
}

document.querySelector('.loading-screen-button').addEventListener('click', () => {
  fadeInMusicAndHideLoading();
});

// Attach both touch and click


//ios
onplayerror: (id) => {
  bg.once('unlock', () => bg.play());
}

const loadingBtn = document.querySelector('.loading-screen-button');
loadingBtn.addEventListener('click', () => {
  const bg = new Howl({
    src: ['/audio/ES_Pillow.mp3'],  // make sure the path is correct
    html5: true,                     // force HTML5 for iOS fallback
    loop: true,
    volume: 1,
    onloaderror: (id, err) => console.error('Load error', err),
    onplayerror: (id, err) => {
      console.error('Play error', err);
      bg.once('unlock', () => bg.play());
    }
  });
  bg.play();
  document.querySelector('.loading-screen').classList.add('slide-up');
});

loadingBtn.addEventListener('click', fadeInMusicAndHideLoading);
loadingBtn.addEventListener('touchstart', fadeInMusicAndHideLoading, { passive: true });