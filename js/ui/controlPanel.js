
//add control panel 
var controlDiv = document.createElement("div"); 
controlDiv.setAttribute("id",'controlPanel')
// var newContent = document.createTextNode("Hi there and greetings!"); 
//   newDiv.appendChild(newContent); //add the text node to the newly created div.
document.body.appendChild(controlDiv); 

var cFormDiv = document.createElement("div");
controlDiv.appendChild(cFormDiv);
var exportDiv = document.createElement("div");
controlDiv.appendChild(exportDiv);

// create form & add it to control div
var cForm = document.createElement('form');
cFormDiv.appendChild(cForm);

//add sliders
addFormParam(cForm, "A", 0.25, 0.1, 1.0, 0.05);
addFormParam(cForm, "turns", 6.4, 0.4, 10.0, 0.2);
addFormParam(cForm, "deltaTheta", 18.0, 0.0, 30.0, 1.0); //18
addFormParam(cForm, "D", 1.0, 0.0, 10.0, 1.0);
addFormParam(cForm, "steps", 30.0, 10.0, 200.0, 10.0); //100
addFormParam(cForm, "cSteps", 30.0, 1.0, 20.0, 1.0);
addFormParam(cForm, "alpha", 83.0, 0.0, 90.0, 1.0);
addFormParam(cForm, "beta", 80.0, 0.0, 90.0, 1.0);
addFormParam(cForm, "phi", 70.0, 0.0, 90.0, 1.0);
addFormParam(cForm, "mu", 30.0, 0.0, 90.0, 1.0);
addFormParam(cForm, "omega", 30.0, 0.0, 90.0, 1.0);

var rebuildButton = document.createElement("button");
rebuildButton.type = "submit";
rebuildButton.innerHTML = "rebuild";
cForm.appendChild(rebuildButton);

// to takeover its submit event.
cForm.addEventListener("submit", function (event) {
  event.preventDefault();

  buildScene(); // in seashell.js
});

//add export button 
// 1. Create the button
var button = document.createElement("button");
button.innerHTML = "export obj";
// 2. Append somewhere
exportDiv.appendChild(button);

// 3. Add event handler
button.addEventListener ("click", function() {
  exportToObj();
});

function addFormParam(frm, d, vl, mn, mx, stp) {
  //<input type="range" min="0" max="50" value="25" />
  var slider = document.createElement("input");
  slider.setAttribute( "id", d );
  slider.setAttribute( "type",'range' );
  slider.setAttribute( "min", mn );
  slider.setAttribute( "max", mx );
  slider.setAttribute( "value", vl );
  slider.setAttribute( "step", stp );

  var label = document.createElement("label");
  label.setAttribute("for", d);
  label.innerHTML = d;
  frm.appendChild(label);

  frm.appendChild( slider );

  frm.appendChild( document.createElement("br") );

  slider.addEventListener("change", function(){
    console.log(document.getElementById(d).value);
  });
}



function exportToObj() {

    var exporter = new THREE.OBJExporter();
    var result = exporter.parse( scene );
    // floatingDiv.style.display = 'block';
    // floatingDiv.innerHTML = result.split( '\n' ).join ( '<br />' );
    exportToFile("seashell.obj",result );

}


//reza
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
