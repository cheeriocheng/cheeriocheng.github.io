/*
Construct the AirShell
*/
"use strict";


function degToRad (deg) {
  return deg*Math.PI/180.0; 
}

class AirShell {

  constructor(){
    //default: boat ear moon shell 
    this.A = 2.5; 
    
    this.deltaTheta = degToRad(18) ; //degrees per new session 
    
    this.minStep = 2;   //allow gaps in first few rings
    this.D = 1 ;  //direction : 1 or -1 
    this.steps = 45; // how many ellipses C to draw along the spiral 
    this.cSteps = 12; // how many straight lines makes an ellipse C
    this.alpha = degToRad(83);  // the angle between the tangent and radial line at any point on the spiral
    this.beta = degToRad(25);  //how open the cone of helico-spiral is 
    this.phi = degToRad(70);  //  C curve roll
    this.mu = degToRad(10);  // C curve pitch 
    this.omega = degToRad(30);  // C curve yaw
    
    //C ellipse shape 
    this.a = 1.3; 
    this.b = 1.76;

    //extrusion tube shape 
    this.eA = .5; 
    this.eB = .5; 
    
    this.L = 0; 
    this.P = 4; 
    this.W1 = 5; 
    this.W2 = 3; 
    this.N = 18;

    this._spiral = null;
    this._shell = null; 

    this._tubeMesh = null;
  }
  

  updateParams(params) {
    //// get data from control panel
    // this.A = p["A"];
    // this.turns = p["turns"];
    // this.deltaTheta = degToRad(p["deltaTheta"]);
    // this.D = p["D"];
    // this.steps = p["steps"];
    // this.cSteps = p["cSteps"];
    // this.phi = degToRad(p["phi"]);
    // this.mu = degToRad(p["mu"]);
    // this.omega = degToRad(p["omega"]);
    this.alpha = degToRad(params.alpha);
    this.beta = degToRad(params.beta);
    this.a = params.ellipse_a;
          
    //with the new parameter, generate the spiral and the surface loops 
    this.calcShell();
  }

  getRadiusAtTheta(theta){
    return this.A * Math.exp( theta * Math.cos(this.alpha) / Math.sin(this.alpha) );
  }

  getVertexAtTheta(theta){
    var rad = this.getRadiusAtTheta(theta);
    var x =  rad * Math.sin(this.beta) * Math.cos(theta) * this.D;
    var y =  rad * Math.sin(this.beta) * Math.sin(theta);
    var z = -rad * Math.cos(this.beta);    

    return new THREE.Vector3(x,y,z);
  }

  calcShell(){
    var spiralPointArray = [];
    var shellEllipseArray = [];
  
    var theta = 0;  
    var lastVertex = this.getVertexAtTheta(theta ); 
    
    for ( var i = 0; i < this.steps; i ++ ) {
      theta = this.deltaTheta * i;
      var rad = Math.exp( theta * Math.cos(this.alpha) / Math.sin(this.alpha) );     
      var newVertex = this.getVertexAtTheta(theta);
      spiralPointArray.push(newVertex);
      lastVertex = newVertex; 

      // Generate ellipse around each point of spiral
      shellEllipseArray[i] = [];
     
      for (var j = 0; j < this.cSteps ; j++) {
        var s= j * Math.PI * 2.0 / this.cSteps;  //angular step around the ellipse 
        var r2 = Math.pow( Math.pow(Math.cos(s)/this.a,2) + Math.pow(Math.sin(s)/this.b,2), -0.5 ); //radius at this given angle s 
        var ellipseX = lastVertex.x + Math.cos(s + this.phi) * Math.cos(theta + this.omega) * r2 * rad * this.D;   
        var ellipseY = lastVertex.y + Math.cos(s + this.phi) * Math.sin(theta + this.omega) * r2 * rad;
        var ellipseZ = lastVertex.z + Math.sin(s + this.phi) * r2 * rad;

        // adjust orientation of the ellipse 
        ellipseX -= Math.sin(this.mu) * Math.sin(s + this.phi) * Math.sin(theta + this.omega) * r2 * rad;
        ellipseY += Math.sin(this.mu) * Math.sin(s + this.phi) * Math.cos(theta + this.omega) * r2 * rad;
  
        shellEllipseArray[i].push(new THREE.Vector3(ellipseX,ellipseY,ellipseZ));
      }
    }

    // all points on the spiral 
    this._spiral = spiralPointArray;
    //and ellipses C
    this._shell = shellEllipseArray; 
  }

// render spiral spine 
  renderSpiral(scene, ifRenderSpiral) {
    if (ifRenderSpiral) { 
      var geometry = new THREE.Geometry();
      for (var i = 0 ; i<this._spiral.length; i++) {
        geometry.vertices.push(this._spiral[i]);  
      }
      var lineMaterial = new THREE.LineBasicMaterial({ color: 0xee00ee });
      var spiralLine = new THREE.Line(geometry, lineMaterial);
      scene.add(spiralLine);
    }
  }

  buildSlice() {

  }
 

  buildTube(scene, ifRenderTube) {
    var extrudeShapePoints = [], count =60;
    //section 
    var a = this.eA;  //
    var b = this.eB;//1
    
    var extrudeMaterial = new THREE.MeshPhongMaterial({                
      color: 0xeeeeee,
      specular: 0x6698AA,
      reflectivity: 0.5,
      shading: THREE.SmoothShading
    });

    for ( var i = 0; i < count; i ++ ) {
      t = 2 * i / count * Math.PI;
      var tempX = Math.cos( t ) * b; 
      var tempY = Math.sin( t ) * a; 
      extrudeShapePoints.push( new THREE.Vector2(tempX, tempY));
    }

    var extrudeShape = new THREE.Shape(extrudeShapePoints);
  
    // add tube mesh for each point on the spiral 
    var l = this._spiral.length ;  
    for (var i = 3 ; i<l; i++){

      // geometrySpiral.vertices.push(this._spiral[i]);  
      var oneEllipse = new THREE.Geometry(); 
      for (var j = 0 ; j < this._shell[i].length; j++){
        oneEllipse.vertices.push(this._shell[i][j]);  
      }

      var extrusionSpline =  new THREE.CatmullRomCurve3( oneEllipse.vertices );
      extrusionSpline.closed = true;

      var extrudeSettings = {
        steps           : this.cSteps*2, //int. number of points used for subdividing segements of extrude spline 
        bevelEnabled    : false,
        extrudePath     : extrusionSpline
      };

      var extrudeGeometry = new THREE.ExtrudeGeometry( extrudeShape, extrudeSettings );

      if(ifRenderTube){
        this._tubeMesh = new THREE.Mesh( extrudeGeometry, extrudeMaterial );
        scene.add( this._tubeMesh );  
      } 
    }
  }
}