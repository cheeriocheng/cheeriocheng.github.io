/*
run this script when the page is loaded 
*/

var user = false;

var camera, scene, renderer;
var effect;
var mobile = false;
var globe;
var group;

var airShell ;//airshell instance

init();
animate();


function init() {
  // setup
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0)
  document.body.appendChild(renderer.domElement);
  
  //field of view, aspect ratio,  near and far clipping plane.
  camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000); 
  camera.position.set(-10, 10, -30); //0, 0, 25
  
  buildScene();
}

function buildScene() {
  scene = new THREE.Scene();

  

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.autoRotate = false;
  controls.enablePan = false;
  
  // light
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(-1, 1.5, -0.5);
  scene.add(directionalLight);
  
  var ambientLight = new THREE.AmbientLight( 0x333333 ); // soft white light  
  scene.add( ambientLight );

  // events
  window.addEventListener('resize', onWindowResize, false);

  airShell = new AirShell();

  p = getControlParams();
  // console.log(p);

  airShell.updateParams( p );

  //DRAW THE SPINE
  airShell.renderSpiral(scene, false); 
  //DRAW IN TUBE -------
  airShell.buildTube( scene, true); 
  
 
  // coordinate sys
  // X axis is red. The Y axis is green. The Z axis is blue.
  // object = new THREE.AxisHelper( 1 );             
  // scene.add( object );
}

function getControlParams() {
  return {
    // "A": parseFloat(document.getElementById("A").value),
    // "turns": parseFloat(document.getElementById("turns").value),
    // "deltaTheta": parseFloat(document.getElementById("deltaTheta").value),
    // "D": parseFloat(document.getElementById("D").value),
    // "steps": parseFloat(document.getElementById("steps").value),
    // "cSteps": parseFloat(document.getElementById("cSteps").value),
    "alpha": parseFloat(document.getElementById("alpha").value),
    "beta": parseFloat(document.getElementById("beta").value),
    // "phi": parseFloat(document.getElementById("phi").value),
    // "mu": parseFloat(document.getElementById("mu").value),
    // "omega": parseFloat(document.getElementById("omega").value)
    "ellipse_a": parseFloat(document.getElementById("ellipse_a").value)

  }
}

function animate() {

  requestAnimationFrame(animate);
  render();
}

function render() {

  controls.update();
  renderer.render(scene, camera);

}