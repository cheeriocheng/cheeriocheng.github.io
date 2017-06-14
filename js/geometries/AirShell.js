/*
This is the basic structure of an AirShell
*/
"use strict";

//degrees to radians  
function degToRad (deg) {
  return deg*Math.PI/180.0; 
}

class AirShell {

  constructor(){
    //default values are mostly a boat ear moon shell 
    this.A = 2.5; 
    
    this.deltaTheta = degToRad(18) ; //degrees per new session 
    
    this.D = 1 ;      //direction : 1 for CW, -1 for CCW
    this.steps = 45;  // how many ellipses C to draw along the spiral 
    this.cSteps = 48; // how many line segments makes an ellipse C
    this.alpha = degToRad(83);  // the angle between the tangent and radial line at any point on the spiral
    this.beta = degToRad(25);   // how open the cone of helico-spiral is 
    this.phi = degToRad(70);    // C curve roll
    this.mu = degToRad(10);     // C curve pitch 
    this.omega = degToRad(30);  // C curve yaw
    
    //these define the shape of the C ellipse
    this.a = 1.3; 
    this.b = 1.76;
    
    //store the data for the spiral and the shell 
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

  //calculate radius on a equiangular spiral, in the polar coordinate
  getRadiusAtTheta(theta){
    return this.A * Math.exp( theta * Math.cos(this.alpha) / Math.sin(this.alpha) );
  }

  //calculate the coordinate of a point on the helico-spiral, in the cartesian coordinate 
  getVertexAtTheta(theta){
    var rad = this.getRadiusAtTheta(theta);
    var x =  rad * Math.sin(this.beta) * Math.cos(theta) * this.D;
    var y =  rad * Math.sin(this.beta) * Math.sin(theta);
    var z = -rad * Math.cos(this.beta);    

    return new THREE.Vector3(x,y,z);
  }

  //calculate the spiral and the ellipses along the spiral 
  calcShell(){
    var spiralPointArray = [];
    var cEllipseArray = [];
    
    for ( var i = 0; i < this.steps; i ++ ) {
      var theta = this.deltaTheta * i;
      var rad = Math.exp( theta * Math.cos(this.alpha) / Math.sin(this.alpha) );     
      var newVertex = this.getVertexAtTheta(theta);
      spiralPointArray.push(newVertex);
     
      // Generate ellipse around each point of spiral
      cEllipseArray[i] = [];
     
      for (var j = 0; j < this.cSteps ; j++) {
        var s= j * Math.PI * 2.0 / this.cSteps;  //angular step around the ellipse 
        var r2 = Math.pow( Math.pow(Math.cos(s)/this.a,2) + Math.pow(Math.sin(s)/this.b,2), -0.5 ); //radius at this given angle s 

        // add ripples to the ellipse 
        // r2 += this.a/10 * Math.cos(s*12);

        var ellipseX = newVertex.x + Math.cos(s + this.phi) * Math.cos(theta + this.omega) * r2 * rad * this.D;   
        var ellipseY = newVertex.y + Math.cos(s + this.phi) * Math.sin(theta + this.omega) * r2 * rad;
        var ellipseZ = newVertex.z + Math.sin(s + this.phi) * r2 * rad;

        // adjust orientation of the ellipse 
        ellipseX -= Math.sin(this.mu) * Math.sin(s + this.phi) * Math.sin(theta + this.omega) * r2 * rad;
        ellipseY += Math.sin(this.mu) * Math.sin(s + this.phi) * Math.cos(theta + this.omega) * r2 * rad;
  
        cEllipseArray[i].push(new THREE.Vector3(ellipseX,ellipseY,ellipseZ));
      }
    }

    //all points on the spiral 
    this._spiral = spiralPointArray;
    
    //all C ellipses along the spiral
    this._shell = cEllipseArray; 
  }

  //render the spiral  
  renderSpiral(scene, ifRenderSpiral) {
    if (ifRenderSpiral) { 
      var geometry = new THREE.Geometry();
      for (var i = 0 ; i<this._spiral.length; i++) {
        geometry.vertices.push(this._spiral[i]);  
      }
      var lineMaterial = new THREE.LineBasicMaterial({ color: 0xFA6900 });
      var spiralLine = new THREE.Line(geometry, lineMaterial);
      scene.add(spiralLine);
    }
  }

  //render c ellipses along the spiral 
  renderC(scene, ifRenderC){
    if (ifRenderC) {
      var lineMaterial = new THREE.LineBasicMaterial({ color: 0xA7DBD8 });
      for (var i = 0; i < this._spiral.length; i++) {
        var geometry = new THREE.Geometry();
        for (var j = 0; j < this.cSteps; j++){
            geometry.vertices.push (this._shell[i][j]);
        }
        var spiralLine = new THREE.Line(geometry, lineMaterial);
        scene.add(spiralLine);
      }
    }
  }

  buildCrossSection() {
    //ellipse 
    var a = 0.5;
    var b = 0.5;
    var pointsOnCurve = [];
    var steps = 20;

    for ( var i = 0; i <= steps; i ++ ) {
      t = 2 * i / steps * Math.PI;
      var tempX = Math.cos( t ) * b; 
      var tempY = Math.sin( t ) * a; 
      pointsOnCurve.push( new THREE.Vector2(tempX, tempY));
    }

    return new THREE.Shape(pointsOnCurve);
  }


  buildTube(scene, ifRenderTube) {

    var crossSection = this.buildCrossSection();

    var extrudeMaterial = new THREE.MeshPhongMaterial({                
      color: 0xeeeeee,
      specular: 0x6698AA,
      reflectivity: 0.5,
      shading: THREE.SmoothShading
    });

    // add tube mesh for each point on the spiral 
    for (var i = 0; i<  this._spiral.length; i++){
      var oneEllipse = new THREE.Geometry(); 

      for (var j = 0 ; j < this._shell[i].length; j++){
        oneEllipse.vertices.push(this._shell[i][j]);  
      }

      var extrusionSpline =  new THREE.CatmullRomCurve3( oneEllipse.vertices );
      extrusionSpline.closed = true;

      var extrudeSettings = {
        steps           : this.cSteps, //int. number of points used for subdividing segements of extrude spline 
        bevelEnabled    : false,
        extrudePath     : extrusionSpline
      };

      var extrudeGeometry = new THREE.ExtrudeGeometry( crossSection, extrudeSettings );

      if(ifRenderTube){
        this._tubeMesh = new THREE.Mesh( extrudeGeometry, extrudeMaterial );
        scene.add( this._tubeMesh );  
      } 
    }
  }
}