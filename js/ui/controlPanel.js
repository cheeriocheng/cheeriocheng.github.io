
//add control panel 
var controlDiv = document.createElement("div"); 
controlDiv.setAttribute("id",'controlPanel')
document.body.appendChild(controlDiv); 

var h = document.createElement("H1")                // Create a <h1> element
var t = document.createTextNode("Move the slider to change the air shell");     // Create a text node
h.appendChild(t); 
controlDiv.appendChild(h);


var cFormDiv = document.createElement("div");
controlDiv.appendChild(cFormDiv);
var exportDiv = document.createElement("div");
controlDiv.appendChild(exportDiv);

// create form & add it to control div
var cForm = document.createElement('form');
cFormDiv.appendChild(cForm);

//add sliders

// addFormParam(cForm, "A", 0.25, 0.1, 1.0, 0.05);
// addFormParam(cForm, "turns", 6.4, 0.4, 10.0, 0.2);

// addFormParam(cForm, "D", 1.0, 0.0, 10.0, 1.0);
// addFormParam(cForm, "steps", 30.0, 10.0, 200.0, 10.0); //100
// addFormParam(cForm, "cSteps", 30.0, 1.0, 20.0, 1.0);

addFormParam(cForm, "beta", 25.0,1.0, 89.0, 2.5, "b1", "b2");
// addFormParam(cForm, "phi", 70.0, 0.0, 90.0, 1.0);
// addFormParam(cForm, "mu", 30.0, 0.0, 90.0, 1.0);
// addFormParam(cForm, "omega", 30.0, 0.0, 90.0, 1.0);

addFormParam(cForm, "alpha", 83.0, 82.0, 87.0, 0.25,"a1","a2");

addFormParam(cForm, "ellipse_a", 1.3, 1.0, 1.9, 0.1,"e1","e2");
// addFormParam(cForm, "deltaTheta", 18.0, 12.0, 23.0, 1.0); //18


// to takeover its submit event.
cForm.addEventListener("submit", function (event) {
  event.preventDefault();
  buildScene(); // in shell.js
});

//add export button 
var button = document.createElement("button");
button.innerHTML = "export obj";
exportDiv.appendChild(button);
button.addEventListener ("click", function() {
  exportToObj();
});

function addFormParam(frm, d, vl, mn, mx, stp, imgLeft, imgRight ) {
  var imgL = document.createElement("img");
  imgL.src = "assets/icon_"+imgLeft+".png";
  imgL.setAttribute("class", "sliderIcon");
  frm.appendChild(imgL);


  var slider = document.createElement("input");
  slider.setAttribute( "id", d );
  slider.setAttribute("class","slider")
  slider.setAttribute( "type",'range' );
  slider.setAttribute( "min", mn );
  slider.setAttribute( "max", mx );
  slider.setAttribute( "value", vl );
  slider.setAttribute( "step", stp );

  // var label = document.createElement("label");
  // label.setAttribute("for", d);
  // label.innerHTML = d;
  // frm.appendChild(label);

  frm.appendChild( slider );

  var imgR = document.createElement("img");
  imgR.src = "assets/icon_"+imgRight+".png";
  imgR.setAttribute("class", "sliderIcon");
  frm.appendChild(imgR);

  frm.appendChild( document.createElement("br") );

  slider.addEventListener("change", function(){
    console.log("Parameter", d,"changed to", document.getElementById(d).value);
    buildScene();
   
  });
}



function exportToObj() {

    var exporter = new THREE.OBJExporter();
    var result = exporter.parse( scene );
    exportToFile("seashell.obj",result );

}


//from reza ali 
function exportToFile( filename, data ) {
  var pom = document.createElement( 'a' );
  pom.href = URL.createObjectURL( new Blob( [ data ], { type : 'text/plain'} ) );
  pom.download = filename;
  document.body.appendChild( pom );

  if( document.createEvent ) {
    var event = document.createEvent( 'MouseEvents' );
    event.initEvent( 'click', true, true );
    pom.dispatchEvent( event );
  }
  else {
    pom.click();
  }
};
