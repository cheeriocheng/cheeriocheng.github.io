/*
 * run this script when the page is loaded 
*/

var scene;      //scene is the stage we put things in 
var camera;     //camera defines how we look at the scene 
var renderer;   //render the scence for the camera
var controls;   //help rotate the scene with mouse 
var airShell;   //airshell instance

init();
animate();

/*
 * setup the basic scene 
 * to see this visualized, go to https://threejs.org/examples/?q=camera#webgl_camera 
 */

function init() {
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0)
  document.body.appendChild(renderer.domElement);
  
  //field of view, aspect ratio,  near and far clipping plane.
  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000); 
  camera.position.set(-10, 10, -30); //0, 0, 25
  
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.autoRotate = false;
  controls.enablePan = false;

  window.addEventListener('resize', onWindowResize, false);
   
  airShell = new AirShell();

  buildScene();
}

function buildScene() {
  scene = new THREE.Scene();
 
  //add light to the scene
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(-1, 1.5, -0.5);
  scene.add(directionalLight);
  
  var ambientLight = new THREE.AmbientLight( 0x333333 ); // soft white light  
  scene.add( ambientLight );

  // get the parameters from control panel 
  p = getControlParams();
  // update the shell acoordingly
  airShell.updateParams(p);

  //DRAW THE SPINE
  airShell.renderSpiral(scene, false); 
  //DRAW IN TUBE 
  airShell.buildTube(scene, true); 
}

function getControlParams() {
  return {
    // "A": parseFloat(document.getElementById("A").value),
    // "turns": parseFloat(document.getElementById("turns").value),
    // "deltaTheta": parseFloat(document.getElementById("deltaTheta").value),
    // "D": parseFloat(document.getElementById("D").value),
    // "steps": parseFloat(document.getElementById("steps").value),
    // "cSteps": parseFloat(document.getElementById("cSteps").value),
    alpha: parseFloat(document.getElementById("alpha").value),
    beta: parseFloat(document.getElementById("beta").value),
    // "phi": parseFloat(document.getElementById("phi").value),
    // "mu": parseFloat(document.getElementById("mu").value),
    // "omega": parseFloat(document.getElementById("omega").value)
    ellipse_a: parseFloat(document.getElementById("ellipse_a").value),
  };
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  controls.update();
  renderer.render(scene, camera);
}