/* GLOBAL CONSTANTS AND VARIABLES */

/* assignment specific globals */
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog3/triangles2.json"; // triangles file loc
var defaultEye = vec3.fromValues(0.5,0.5,-0.5); // default eye position in world space
var defaultCenter = vec3.fromValues(0.5,0.5,0.5); // default view direction in world space
var defaultUp = vec3.fromValues(0,1,0); // default view up vector
var lightAmbient = vec3.fromValues(1,1,1); // default light ambient emission
var lightDiffuse = vec3.fromValues(1,1,1); // default light diffuse emission
var lightSpecular = vec3.fromValues(1,1,1); // default light specular emission
var lightPosition = vec3.fromValues(0.5,0.7,-1.0); // default light position
var rotateTheta = Math.PI/50; // how much to rotate models by with each key press
var Blinn_Phong = true;
/* webgl and geometry data */
var gl = null; // the all powerful gl object. It's all here folks!
var inputTriangles = []; // the triangle data as loaded from input files
var numTriangleSets = 0; // how many triangle sets in input scene
var vertexBuffers = []; // this contains vertex coordinate lists by set, in triples
var normalBuffers = []; // this contains normal component lists by set, in triples
var triSetSizes = []; // this contains the size of each triangle set
var triangleBuffers = []; // lists of indices into vertexBuffers by set, in triples
var boundingBoxes = [];

/* shader parameter locations */
var vPosAttribLoc; // where to put position for vertex shader
var mMatrixULoc; // where to put model matrix for vertex shader
var pvmMatrixULoc; // where to put project model view matrix for vertex shader
var ambientULoc; // where to put ambient reflecivity for fragment shader
var diffuseULoc; // where to put diffuse reflecivity for fragment shader
var specularULoc; // where to put specular reflecivity for fragment shader
var shininessULoc; // where to put specular exponent for fragment shader
/* interaction variables */
var Eye = vec3.clone(defaultEye); // eye position in world space
var Center = vec3.clone(defaultCenter); // view direction in world space
var Up = vec3.clone(defaultUp); // view up vector in world space
var isPerspectiveProjection = true;
// ASSIGNMENT HELPER FUNCTIONS

var charShotDirection = 0;
var directionEn1 = 0;
var directionEn2 = 0;

class BoundingBox {
	constructor(x1, x2, y1, y2, r) {
		this.xr = x1;
		this.xl = x2;
		this.yt = y1;
		this.yb = y2;
		this.rendered = r;
	}
}

class Missile extends BoundingBox {
	constructor(x1, x2, y1, y2, r, dir) {
		super(x1, x2, y1, y2, r);
		this.direction = dir;
	}
}

boundingBoxes[0] = new BoundingBox(.45, .5, .5, .45, true);
boundingBoxes[1] = new BoundingBox(.85, .9, .9, .85, true);
boundingBoxes[2] = new BoundingBox(.55, .6, .6, .55, true);
boundingBoxes[3] = new BoundingBox(.2,.3,.8,.2, true);
boundingBoxes[4] = new BoundingBox(.7,.8,.8,.2, true);
boundingBoxes[5] = new Missile(0.5,0.55,0.1,0.125, false);
boundingBoxes[6] = new Missile(0.5,0.55,0.1,0.125, false);

function boxCollision(box1, box2) {

	if (!box2.rendered)
		return false;

	if ((box1.xl >= box2.xr && box1.xl <= box2.xl) &&
	((box1.yt >= box2.yb && box1.yt <= box2.yt) ||
	(box1.yb >= box2.yb && box1.yb <= box2.yt))) {
		return true;
	} else if ((box1.xr >= box2.xr && box1.xr <= box2.xl) &&
	((box1.yt >= box2.yb && box1.yt <= box2.yt) ||
	(box1.yb >= box2.yb && box1.yb <= box2.yt))) { 
		return true;
	} else {
		return false;
	}
	
}

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        return JSON.parse(' [ {\
    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.0,0.0,0.6], "specular": [0.3,0.3,0.3], "n":40, "alpha": 0.7}, \
    "vertices": [[0.0, 0.0, 0.0],[0.0, 0.0, 0.05],[1.0,0.0,0.0],[1.0,0.0,0.05]],\
    "normals": [[0, 1, 0],[0, 1, 0],[0, 1, 0],[0, 1, 0]],\
    "triangles": [[0,1,2],[1,2,3]]\
  },\
  {\
    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.0,0.0,0.6], "specular": [0.3,0.3,0.3], "n":40, "alpha": 0.7}, \
    "vertices": [[0.0, 1.0, 0.0],[0.0, 1.0, 0.05],[1.0,1.0,0.0],[1.0,1.0,0.05]],\
    "normals": [[0, -1, 0],[0, -1, 0],[0, -1, 0],[0, -1, 0]],\
    "triangles": [[0,1,2],[1,2,3]]\
  },\
  {\
    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.0,0.0,0.6], "specular": [0.3,0.3,0.3], "n":40, "alpha": 0.7}, \
    "vertices": [[0.0, 1.0, 0.0],[0.0, 1.0, 0.05],[0.0,0.0,0.0],[0.0,0.0,0.05]],\
    "normals": [[1, 0, 0],[1, 0, 0],[1, 0, 0],[1, 0, 0]],\
    "triangles": [[0,1,2],[1,2,3]]\
  },\
  {\
    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.0,0.0,0.6], "specular": [0.3,0.3,0.3], "n":40, "alpha": 0.7}, \
    "vertices": [[1.0, 1.0, 0.0],[1.0, 1.0, 0.05],[1.0,0.0,0.0],[1.0,0.0,0.05]],\
    "normals": [[-1, 0, 0],[-1, 0, 0],[-1, 0, 0],[-1, 0, 0]],\
    "triangles": [[0,1,2],[1,2,3]]\
  },\
  {\
    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.0,0.6,0.0], "specular": [0.3,0.3,0.3], "n":40, "alpha": 0.7}, \
    "vertices": [[0.5, 0.5, 0.0],[0.5, 0.45, 0.0],[0.45,0.5,0.0],[0.45,0.45,0.0],[0.5, 0.5, 0.0],[0.5, 0.45, 0.0],[0.5, 0.5, 0.05],[0.5, 0.45, 0.05],[0.5, 0.5, 0.0],[0.45,0.5,0.0],[0.5, 0.5, 0.05],[0.45,0.5,0.05],\
	[0.5,0.45,0.0], [0.45,0.45,0.0],[0.5,0.45,0.05], [0.45,0.45,0.05],[0.45,0.45,0.0],[0.45,0.5,0.0],[0.45,0.45,0.05],[0.45,0.5,0.05],[0.5, 0.5, 0.05],[0.5, 0.45, 0.05],[0.45,0.45,0.05],[0.45,0.5,0.05]],\
    "normals": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1],[1, 0, 0],[1, 0, 0],[1, 0, 0],[1, 0, 0],[0, 1, 0],[0, 1, 0],[0, 1, 0],[0, 1, 0],\
	[0,-1,0], [0,-1,0], [0,-1,0],[0,-1,0],[-1,0,0],[-1,0,0],[-1,0,0],[-1,0,0],[0,0,-1],[0,0,-1],[0,0,-1],[0,0,-1]],\
    "triangles": [[0,1,2],[1,2,3],[4,5,6],[5,6,7],[8,9,10],[9,10,11],[12,13,14],[13,14,15],[16,17,18],[17,18,19],[20,21,22],[20,22,23]]\
  },\
  {\
    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.0,0.6,0.6], "specular": [0.3,0.3,0.3], "n":40, "alpha": 0.7}, \
    "vertices": [[0.9, 0.9, 0.0],[0.9, 0.85, 0.0],[0.85,0.9,0.0],[0.85,0.85,0.0],[0.9, 0.9, 0.0],[0.9, 0.85, 0.0],[0.9, 0.9, 0.05],[0.9, 0.85, 0.05],[0.9, 0.9, 0.0],[0.85,0.9,0.0],[0.9, 0.9, 0.05],[0.85,0.9,0.05],\
	[0.9,0.85,0.0], [0.85,0.85,0.0],[0.9,0.85,0.05], [0.85,0.85,0.05],[0.85,0.85,0.0],[0.85,0.9,0.0],[0.85,0.85,0.05],[0.85,0.9,0.05],[0.9, 0.9, 0.05],[0.9, 0.85, 0.05],[0.85,0.85,0.05],[0.85,0.9,0.05]],\
    "normals": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1],[1, 0, 0],[1, 0, 0],[1, 0, 0],[1, 0, 0],[0, 1, 0],[0, 1, 0],[0, 1, 0],[0, 1, 0],\
	[0,-1,0], [0,-1,0], [0,-1,0],[0,-1,0],[-1,0,0],[-1,0,0],[-1,0,0],[-1,0,0],[0,0,-1],[0,0,-1],[0,0,-1],[0,0,-1]],\
    "triangles": [[0,1,2],[1,2,3],[4,5,6],[5,6,7],[8,9,10],[9,10,11],[12,13,14],[13,14,15],[16,17,18],[17,18,19],[20,21,22],[20,22,23]]\
  },\
  {\
    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.0,0.6,0.6], "specular": [0.3,0.3,0.3], "n":40, "alpha": 0.7}, \
    "vertices": [[0.6, 0.6, 0.0],[0.6, 0.55, 0.0],[0.55,0.6,0.0],[0.55,0.55,0.0],[0.6, 0.6, 0.0],[0.6, 0.55, 0.0],[0.6, 0.6, 0.05],[0.6, 0.55, 0.05],[0.6, 0.6, 0.0],[0.55,0.6,0.0],[0.6, 0.6, 0.05],[0.55,0.6,0.05],\
	[0.6,0.55,0.0], [0.55,0.55,0.0],[0.6,0.55,0.05], [0.55,0.55,0.05],[0.55,0.55,0.0],[0.55,0.6,0.0],[0.55,0.55,0.05],[0.55,0.6,0.05],[0.6, 0.6, 0.05],[0.6, 0.55, 0.05],[0.55,0.55,0.05],[0.55,0.6,0.05]],\
    "normals": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1],[1, 0, 0],[1, 0, 0],[1, 0, 0],[1, 0, 0],[0, 1, 0],[0, 1, 0],[0, 1, 0],[0, 1, 0],\
	[0,-1,0], [0,-1,0], [0,-1,0],[0,-1,0],[-1,0,0],[-1,0,0],[-1,0,0],[-1,0,0],[0,0,-1],[0,0,-1],[0,0,-1],[0,0,-1]],\
    "triangles": [[0,1,2],[1,2,3],[4,5,6],[5,6,7],[8,9,10],[9,10,11],[12,13,14],[13,14,15],[16,17,18],[17,18,19],[20,21,22],[20,22,23]]\
  },\
  {\
    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.0,0.0,0.6], "specular": [0.3,0.3,0.3], "n":40, "alpha": 0.7}, \
    "vertices": [[0.2, 0.2, 0.0],[0.3, 0.2, 0.0],[0.2,0.8,0.0],[0.3,0.8,0.0], [0.3, 0.2, 0.05],[0.3, 0.8, 0.05],[0.3, 0.2, 0.0],[0.3,0.8,0.0]],\
    "normals": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1], [1,0,0], [1,0,0],[1,0,0], [1,0,0]],\
    "triangles": [[0,1,2],[1,2,3],[6,7,4],[4,5,7]]\
  },\
  {\
    "material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.0,0.0,0.6], "specular": [0.3,0.3,0.3], "n":40, "alpha": 0.7}, \
    "vertices": [[0.8, 0.2, 0.0],[0.7, 0.2, 0.0],[0.8,0.8,0.0],[0.7,0.8,0.0],[0.7,0.2,0.05],[0.7,0.8,0.05],[0.7, 0.2, 0.0],[0.7,0.8,0.0]],\
    "normals": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1],[-1,0,0],[-1,0,0],[-1,0,0],[-1,0,0]],\
    "triangles": [[0,1,2],[1,2,3],[6,7,4],[4,5,7]]\
  },\
  {\
	"material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.6,0.0,0.0], "specular": [0.3,0.3,0.3], "n":40, "alpha": 0.7}, \
    "vertices": [[-0.025, 0.0125, 0.0],[-0.025, -0.0125, 0.0],[0.025,0.0125,0.0],[0.025,-0.0125,0.0]],\
    "normals": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1]],\
    "triangles": [[0,1,2],[1,2,3]]\
  },\
  {\
	"material": {"ambient": [0.1,0.1,0.1], "diffuse": [0.3,0.6,0.0], "specular": [0.3,0.3,0.3], "n":40, "alpha": 0.7}, \
    "vertices": [[-0.025, 0.0125, 0.0],[-0.025, -0.0125, 0.0],[0.025,0.0125,0.0],[0.025,-0.0125,0.0]],\
    "normals": [[0, 0, -1],[0, 0, -1],[0, 0, -1],[0, 0, -1]],\
    "triangles": [[0,1,2],[1,2,3]]\
  }\
  ]'); 
    } // end try    
    
    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input json file

function resetGame() {
	//Respawn boundingBox[0]
	vec3.set(inputTriangles[4].translation,0,0,0);
	boundingBoxes[0].xl = .5;
	boundingBoxes[0].xr = .45;
	boundingBoxes[0].yt = .5;
	boundingBoxes[0].yb = .45;
	boundingBoxes[0].rendered = true;
	
	//Reset enemies
	vec3.set(inputTriangles[5].translation,0,0,0);
	boundingBoxes[1].xl = .9;
	boundingBoxes[1].xr = .85;
	boundingBoxes[1].yt = .9;
	boundingBoxes[1].yb = .85;
	boundingBoxes[1].rendered = true;
	
	vec3.set(inputTriangles[6].translation,0,0,0);
	boundingBoxes[2].xl = .6;
	boundingBoxes[2].xr = .55;
	boundingBoxes[2].yt = .6;
	boundingBoxes[2].yb = .55;
	boundingBoxes[2].rendered = true;
	
	vec3.set(inputTriangles[9].translation,0,0,0);
	boundingBoxes[5].xl = .6;
	boundingBoxes[5].xr = .55;
	boundingBoxes[5].yt = .6;
	boundingBoxes[5].yb = .55;
	boundingBoxes[5].rendered = false;
	
	vec3.set(inputTriangles[10].translation,0,0,0);
	boundingBoxes[6].xl = .6;
	boundingBoxes[6].xr = .55;
	boundingBoxes[6].yt = .6;
	boundingBoxes[6].yb = .55;
	boundingBoxes[6].rendered = false;
	
}

function checkBounds(i) {
	if (boundingBoxes[i].xl > 1 || boundingBoxes[i].xr < 0) {
		return true;
	} else if (boundingBoxes[i].yt > 1 || boundingBoxes[i].yb < 0) {
		return true;
	}
	
	return false;
}

function fire(x, y, direction) {
	if (direction == 0) {
		inputTriangles[y + 4].glVertices = [boundingBoxes[x].xl + .01, boundingBoxes[x].yt - .0125,0, 
		boundingBoxes[x].xl + .01, boundingBoxes[x].yb + .0125,0, 
		boundingBoxes[x].xl + .05, boundingBoxes[x].yt - .0125,0, 
		boundingBoxes[x].xl + .05, boundingBoxes[x].yb + .0125,0 ];
		
		boundingBoxes[y].xl = boundingBoxes[x].xl + .05;
		boundingBoxes[y].xr = boundingBoxes[x].xl + .01;
		boundingBoxes[y].yt = boundingBoxes[x].yt - .0125;
		boundingBoxes[y].yb = boundingBoxes[x].yb + .0125;
	
		vertexBuffers[y + 4] = gl.createBuffer(); // init empty webgl set vertex coord buffer
		gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[y + 4]); // activate that buffer
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[y + 4].glVertices),gl.STATIC_DRAW);
	} else if(direction == 1) {	
		inputTriangles[y + 4].glVertices = [boundingBoxes[x].xr - .05, boundingBoxes[x].yt - .0125,0, 
		boundingBoxes[x].xr - .05, boundingBoxes[x].yb + .0125,0, 
		boundingBoxes[x].xr - .01, boundingBoxes[x].yt - .0125,0, 
		boundingBoxes[x].xr - .01, boundingBoxes[x].yb + .0125,0 ];
		
		boundingBoxes[y].xl = boundingBoxes[x].xr - .01;
		boundingBoxes[y].xr = boundingBoxes[x].xr - .05;
		boundingBoxes[y].yt = boundingBoxes[x].yt - .0125;
		boundingBoxes[y].yb = boundingBoxes[x].yb + .0125;
	
		vertexBuffers[y+4] = gl.createBuffer(); // init empty webgl set vertex coord buffer
		gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[y+4]); // activate that buffer
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[y+4].glVertices),gl.STATIC_DRAW);
	} else if (direction == 2) {
		inputTriangles[y+4].glVertices = [boundingBoxes[x].xr + .0125, boundingBoxes[x].yt + .05,0, 
		boundingBoxes[x].xr + .0125, boundingBoxes[x].yt + .01,0, 
		boundingBoxes[x].xl - .0125, boundingBoxes[x].yt + .05,0, 
		boundingBoxes[x].xl - .0125, boundingBoxes[x].yt + .01,0 ];
		
		boundingBoxes[y].xl = boundingBoxes[x].xl - .0125;
		boundingBoxes[y].xr = boundingBoxes[x].xr + .0125;
		boundingBoxes[y].yt = boundingBoxes[x].yt + .05;
		boundingBoxes[y].yb = boundingBoxes[x].yt + .01;
	
		vertexBuffers[y+4] = gl.createBuffer(); // init empty webgl set vertex coord buffer
		gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[y+4]); // activate that buffer
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[y+4].glVertices),gl.STATIC_DRAW);
	} else {
		inputTriangles[y+4].glVertices = [boundingBoxes[x].xr + .0125, boundingBoxes[x].yb - .01,0, 
		boundingBoxes[x].xr + .0125, boundingBoxes[x].yb - .05,0, 
		boundingBoxes[x].xl - .0125, boundingBoxes[x].yb - .01,0, 
		boundingBoxes[x].xl - .0125, boundingBoxes[x].yb - .05,0 ];
		
		boundingBoxes[y].xl = boundingBoxes[x].xl - .0125;
		boundingBoxes[y].xr = boundingBoxes[x].xr + .0125;
		boundingBoxes[y].yt = boundingBoxes[x].yb - .01;
		boundingBoxes[y].yb = boundingBoxes[x].yb - .05;
	
		vertexBuffers[y+4] = gl.createBuffer(); // init empty webgl set vertex coord buffer
		gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[y+4]); // activate that buffer
		gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[y+4].glVertices),gl.STATIC_DRAW);
	}
}

function checkPlayerBounds() {
	
	if (checkBounds(0)) {
		resetGame();
	}
	
	for (var i = 1; i < boundingBoxes.length; i++) {
		if (boxCollision(boundingBoxes[0], boundingBoxes[i])) {
			console.log(i);
			resetGame();
		}	
	}
}

// does stuff when keys are pressed
function handleKeyDown(event) {
	
	handleKeyDown.whichOn = inputTriangles[4];
	handleKeyDown.modelOn = inputTriangles[4];
	handleKeyDown.modelOn.on = true;	
    
    function translateModel(offset) {
        if (handleKeyDown.modelOn != null)
            vec3.add(handleKeyDown.modelOn.translation,handleKeyDown.modelOn.translation,offset);
    } // end translate model
    
    // set up needed view params
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
    
    switch (event.code) {
        // view change
        case "KeyA": // Move character left
            translateModel(vec3.scale(temp,viewRight,-.01));
			charShotDirection = 0;
			boundingBoxes[0].xl += .01;
			boundingBoxes[0].xr += .01;
			checkPlayerBounds();
			break;
        case "KeyD": // Move character right
            translateModel(vec3.scale(temp,viewRight,.01));
			charShotDirection = 1;
			boundingBoxes[0].xl -= .01;
			boundingBoxes[0].xr -= .01;
			checkPlayerBounds();
            break;
        case "KeyS": // Move character down
            translateModel(vec3.scale(temp,Up,-.01));
			charShotDirection = 3;
			boundingBoxes[0].yt -= .01;
			boundingBoxes[0].yb -= .01;
			checkPlayerBounds();
            break;
        case "KeyW": // Move character up
            translateModel(vec3.scale(temp,Up,.01));
			charShotDirection = 2;
			boundingBoxes[0].yt += .01;
			boundingBoxes[0].yb += .01;
			checkPlayerBounds();
            break;
		case "Space":
			if (!boundingBoxes[5].rendered) {
				vec3.set(inputTriangles[9].translation,0,0,0);
			
				boundingBoxes[5].rendered = true;
				boundingBoxes[5].direction = charShotDirection;
				fire(0,5,charShotDirection);
			}

			break;
    } // end switch
} // end handleKeyDown

// set up the webGL environment
function setupWebGL() {
     // Set up keys
     document.onkeydown = handleKeyDown; // call this when key pressed
     // Get the image canvas, render an image in it
    
     // create a webgl canvas and set it up
     var webGLCanvas = document.getElementById("myWebGLCanvas"); // create a webgl canvas
     gl = webGLCanvas.getContext("webgl"); // get a webgl object from it
     try {
       if (gl == null) {
         throw "unable to create gl context -- is your browser gl ready?";
       } else {
         gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
         gl.clearDepth(1.0); // use max when we clear the depth buffer
         gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
       }
     } // end try
     
    
    catch(e) {
      console.log(e);
    } // end catch
 
} // end setupWebGL

// read models in, load them into webgl buffers
function loadModels() {
    
    inputTriangles =  getJSONFile(INPUT_TRIANGLES_URL,"triangles"); // read in the triangle data

    try {
        if (inputTriangles == String.null)
            throw "Unable to load triangles file!";
        else {
            var whichSetVert; // index of vertex in current triangle set
            var whichSetTri; // index of triangle in current triangle set
            var vtxToAdd; // vtx coords to add to the coord array
            var normToAdd; // vtx normal to add to the coord array
            var triToAdd; // tri indices to add to the index array
            var maxCorner = vec3.fromValues(Number.MIN_VALUE,Number.MIN_VALUE,Number.MIN_VALUE); // bbox corner
            var minCorner = vec3.fromValues(Number.MAX_VALUE,Number.MAX_VALUE,Number.MAX_VALUE); // other corner
        
            // process each triangle set to load webgl vertex and triangle buffers
            numTriangleSets = inputTriangles.length; // remember how many tri sets
            for (var whichSet=0; whichSet<numTriangleSets; whichSet++) { // for each tri set
                
                // set up hilighting, modeling translation and rotation
                inputTriangles[whichSet].center = vec3.fromValues(0,0,0);  // center point of tri set
                inputTriangles[whichSet].on = false; // not highlighted
                inputTriangles[whichSet].translation = vec3.fromValues(0,0,0); // no translation
                inputTriangles[whichSet].xAxis = vec3.fromValues(1,0,0); // model X axis
                inputTriangles[whichSet].yAxis = vec3.fromValues(0,1,0); // model Y axis 

                // set up the vertex and normal arrays, define model center and axes
                inputTriangles[whichSet].glVertices = []; // flat coord list for webgl
                inputTriangles[whichSet].glNormals = []; // flat normal list for webgl
                var numVerts = inputTriangles[whichSet].vertices.length; // num vertices in tri set
                for (whichSetVert=0; whichSetVert<numVerts; whichSetVert++) { // verts in set
                    vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert]; // get vertex to add
                    normToAdd = inputTriangles[whichSet].normals[whichSetVert]; // get normal to add
                    inputTriangles[whichSet].glVertices.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]); // put coords in set coord list
                    inputTriangles[whichSet].glNormals.push(normToAdd[0],normToAdd[1],normToAdd[2]); // put normal in set coord list
                    vec3.max(maxCorner,maxCorner,vtxToAdd); // update world bounding box corner maxima
                    vec3.min(minCorner,minCorner,vtxToAdd); // update world bounding box corner minima
                    vec3.add(inputTriangles[whichSet].center,inputTriangles[whichSet].center,vtxToAdd); // add to ctr sum
                } // end for vertices in set
                vec3.scale(inputTriangles[whichSet].center,inputTriangles[whichSet].center,1/numVerts); // avg ctr sum

                // send the vertex coords and normals to webGL
                vertexBuffers[whichSet] = gl.createBuffer(); // init empty webgl set vertex coord buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glVertices),gl.STATIC_DRAW); // data in
                normalBuffers[whichSet] = gl.createBuffer(); // init empty webgl set normal component buffer
                gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(inputTriangles[whichSet].glNormals),gl.STATIC_DRAW); // data in
            
                // set up the triangle index array, adjusting indices across sets
                inputTriangles[whichSet].glTriangles = []; // flat index list for webgl
                triSetSizes[whichSet] = inputTriangles[whichSet].triangles.length; // number of tris in this set
                for (whichSetTri=0; whichSetTri<triSetSizes[whichSet]; whichSetTri++) {
                    triToAdd = inputTriangles[whichSet].triangles[whichSetTri]; // get tri to add
                    inputTriangles[whichSet].glTriangles.push(triToAdd[0],triToAdd[1],triToAdd[2]); // put indices in set list
                } // end for triangles in set

                // send the triangle indices to webGL
                triangleBuffers.push(gl.createBuffer()); // init empty triangle index buffer
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(inputTriangles[whichSet].glTriangles),gl.STATIC_DRAW); // data in

            } // end for each triangle set  // set global
        } // end if triangle file loaded
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end load models

// setup the webGL shaders
function setupShaders() {
    
    // define vertex shader in essl using es6 template strings
    var vShaderCode = `
        attribute vec3 aVertexPosition; // vertex position
        attribute vec3 aVertexNormal; // vertex normal
        
        uniform mat4 umMatrix; // the model matrix
        uniform mat4 upvmMatrix; // the project view model matrix
        
        varying vec3 vWorldPos; // interpolated world position of vertex
        varying vec3 vVertexNormal; // interpolated normal for frag shader
        void main(void) {
            
            // vertex position
            vec4 vWorldPos4 = umMatrix * vec4(aVertexPosition, 1.0);
            vWorldPos = vec3(vWorldPos4.x,vWorldPos4.y,vWorldPos4.z);
            gl_Position = upvmMatrix * vec4(aVertexPosition, 1.0);
            // vertex normal (assume no non-uniform scale)
            vec4 vWorldNormal4 = umMatrix * vec4(aVertexNormal, 0.0);
            vVertexNormal = normalize(vec3(vWorldNormal4.x,vWorldNormal4.y,vWorldNormal4.z)); 
        }
    `;
    
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
        precision mediump float; // set float to medium precision
        // eye location
        uniform vec3 uEyePosition; // the eye's position in world
        
        // light properties
        uniform vec3 uLightAmbient; // the light's ambient color
        uniform vec3 uLightDiffuse; // the light's diffuse color
        uniform vec3 uLightSpecular; // the light's specular color
        uniform vec3 uLightPosition; // the light's position
        
        // material properties
        uniform vec3 uAmbient; // the ambient reflectivity
        uniform vec3 uDiffuse; // the diffuse reflectivity
        uniform vec3 uSpecular; // the specular reflectivity
        uniform float uShininess; // the specular exponent
        // geometry properties
        varying vec3 vWorldPos; // world xyz of fragment
        varying vec3 vVertexNormal; // normal of fragment
            
        void main(void) {
        
            // ambient term
            vec3 ambient = uAmbient*uLightAmbient; 
            
            // diffuse term
            vec3 normal = normalize(vVertexNormal); 
            vec3 light = normalize(uLightPosition - vWorldPos);
            float lambert = max(0.0,dot(normal,light));
            vec3 diffuse = uDiffuse*uLightDiffuse*lambert; // diffuse term
            
            // specular term
            vec3 eye = normalize(uEyePosition - vWorldPos);
            vec3 halfVec = normalize(light+eye);
            float ndotLight = 2.0*dot(normal, light);
            vec3 reflectVec = normalize(ndotLight*normal - light);
            float highlight = 0.0;
           	 	highlight = pow(max(0.0,dot(normal,halfVec)),uShininess);
            vec3 specular = uSpecular*uLightSpecular*highlight; // specular term
            
            // combine to output color
            vec3 colorOut = ambient + diffuse + specular; // no specular yet
            gl_FragColor = vec4(colorOut, 1.0); 
        }
    `;
    
    try {
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader,fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution

        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader,vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
            
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                
                // locate and enable vertex attributes
                vPosAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexPosition"); // ptr to vertex pos attrib
                gl.enableVertexAttribArray(vPosAttribLoc); // connect attrib to array
                vNormAttribLoc = gl.getAttribLocation(shaderProgram, "aVertexNormal"); // ptr to vertex normal attrib
                gl.enableVertexAttribArray(vNormAttribLoc); // connect attrib to array
                
                // locate vertex uniforms
                mMatrixULoc = gl.getUniformLocation(shaderProgram, "umMatrix"); // ptr to mmat
                pvmMatrixULoc = gl.getUniformLocation(shaderProgram, "upvmMatrix"); // ptr to pvmmat
                
                // locate fragment uniforms
                var eyePositionULoc = gl.getUniformLocation(shaderProgram, "uEyePosition"); // ptr to eye position
                var lightAmbientULoc = gl.getUniformLocation(shaderProgram, "uLightAmbient"); // ptr to light ambient
                var lightDiffuseULoc = gl.getUniformLocation(shaderProgram, "uLightDiffuse"); // ptr to light diffuse
                var lightSpecularULoc = gl.getUniformLocation(shaderProgram, "uLightSpecular"); // ptr to light specular
                var lightPositionULoc = gl.getUniformLocation(shaderProgram, "uLightPosition"); // ptr to light position
                ambientULoc = gl.getUniformLocation(shaderProgram, "uAmbient"); // ptr to ambient
                diffuseULoc = gl.getUniformLocation(shaderProgram, "uDiffuse"); // ptr to diffuse
                specularULoc = gl.getUniformLocation(shaderProgram, "uSpecular"); // ptr to specular
                shininessULoc = gl.getUniformLocation(shaderProgram, "uShininess"); // ptr to shininess
                
                // pass global constants into fragment uniforms
                gl.uniform3fv(eyePositionULoc,Eye); // pass in the eye's position
                gl.uniform3fv(lightAmbientULoc,lightAmbient); // pass in the light's ambient emission
                gl.uniform3fv(lightDiffuseULoc,lightDiffuse); // pass in the light's diffuse emission
                gl.uniform3fv(lightSpecularULoc,lightSpecular); // pass in the light's specular emission
                gl.uniform3fv(lightPositionULoc,lightPosition); // pass in the light's position
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    
    catch(e) {
        console.log(e);
    } // end catch
} // end setup shaders


function projectileCollisions(x) {
	
	if (checkBounds(x)) {
		boundingBoxes[x].rendered = false;
	} else {
		for(var i = 1; i < boundingBoxes.length; i++) {
			if ((i != x) && boxCollision(boundingBoxes[x], boundingBoxes[i])) {
				boundingBoxes[x].rendered = false;
				if (i == 1 || i == 2) {
					boundingBoxes[i].rendered = false;
				}
			}
		}
	}
	
	if (boxCollision(boundingBoxes[x], boundingBoxes[0])) {
		resetGame();	
	}
}

function moving(x) {
	if (boxCollision(boundingBoxes[x], boundingBoxes[0])) {
		resetGame();	
	}
	
	if (checkBounds(x)) {
		return false;
	} else {
		for(var i = 1; i < boundingBoxes.length; i++) {
			if ((i != x) && boxCollision(boundingBoxes[x], boundingBoxes[i])) {
				return false;
			}
		}
	}
	
	return true;
}

function updateGame() {	
    
    function translateModel(offset) {
        if (handleKeyDown.modelOn != null)
            vec3.add(handleKeyDown.modelOn.translation,handleKeyDown.modelOn.translation,offset);
    } // end translate model
    
	
    function rotateModel(axis,direction) {
        if (handleKeyDown.modelOn != null) {
            var newRotation = mat4.create();

            mat4.fromRotation(newRotation,direction*rotateTheta,axis); // get a rotation matrix around passed axis
            vec3.transformMat4(handleKeyDown.modelOn.xAxis,handleKeyDown.modelOn.xAxis,newRotation); // rotate model x axis tip
            vec3.transformMat4(handleKeyDown.modelOn.yAxis,handleKeyDown.modelOn.yAxis,newRotation); // rotate model y axis tip
        } // end if there is a highlighted model
    } // end rotate model
	
    // set up needed view params
    var lookAt = vec3.create(), viewRight = vec3.create(), temp = vec3.create(); // lookat, right & temp vectors
    lookAt = vec3.normalize(lookAt,vec3.subtract(temp,Center,Eye)); // get lookat vector
    viewRight = vec3.normalize(viewRight,vec3.cross(temp,lookAt,Up)); // get view right vector
	
	//Move Enemies
	var move = Math.random();
	
	//Enemy 1
	if (move < .01 && boundingBoxes[1].rendered) {
		var dir = Math.floor(10 * Math.random());
		
		handleKeyDown.whichOn = inputTriangles[5];
		handleKeyDown.modelOn = inputTriangles[5];
		handleKeyDown.modelOn.on = true;
		
		if (dir <= 1 ) {
			directionEn1 = 0;
			boundingBoxes[1].xl += .025;
			boundingBoxes[1].xr += .025;
			
			if (moving(1)) {
				translateModel(vec3.scale(temp,viewRight,-.025));
			} else {
				boundingBoxes[1].xl -= .025;
				boundingBoxes[1].xr -= .025;
			}
		} else if (dir <= 3 && dir > 1) {
			directionEn1 = 2;
			boundingBoxes[1].yt += .025;
			boundingBoxes[1].yb += .025;
			
			if (moving(1)) {
				translateModel(vec3.scale(temp,Up,.025));
			} else {
				boundingBoxes[1].yt -= .025;
				boundingBoxes[1].yb -= .025;
			}			
		} else if (dir >= 4 && dir <= 6) {
			directionEn1 = 1;
			boundingBoxes[1].xl -= .025;
			boundingBoxes[1].xr -= .025;
			
			if (moving(1)) {
				translateModel(vec3.scale(temp,viewRight,.025));
			} else {
				boundingBoxes[1].xl += .025;
				boundingBoxes[1].xr += .025;
			}
		} else {
			directionEn1 = 3;
			boundingBoxes[1].yt -= .025;
			boundingBoxes[1].yb -= .025;
			
			if (moving(1)) {
				translateModel(vec3.scale(temp,Up,-.025));
			} else {
				boundingBoxes[1].yt += .025;
				boundingBoxes[1].yb += .025;
			}
		}
		
		if(!boundingBoxes[6].rendered) {
			vec3.set(inputTriangles[10].translation,0,0,0);
			
			boundingBoxes[6].rendered = true;
			boundingBoxes[6].direction = directionEn1;
			fire(1,6,directionEn1);
		}
	}
	
	//Enemy 2
	move = Math.random();
	
	if (move < .01 && boundingBoxes[2].rendered) {
		var dir = Math.floor(4 * Math.random());
		
		handleKeyDown.whichOn = inputTriangles[6];
		handleKeyDown.modelOn = inputTriangles[6];
		handleKeyDown.modelOn.on = true;
		
		if (dir == 0) {
			directionEn2 = 0;
			boundingBoxes[2].xl += .025;
			boundingBoxes[2].xr += .025;
			
			if (moving(2)) {
				translateModel(vec3.scale(temp,viewRight,-.025));
			} else {
				boundingBoxes[2].xl -= .025;
				boundingBoxes[2].xr -= .025;
			}
		} else if (dir == 1) {
			directionEn2 = 2;
			boundingBoxes[2].yt += .025;
			boundingBoxes[2].yb += .025;
			
			if (moving(2)) {
				translateModel(vec3.scale(temp,Up,.025));
			} else {
				boundingBoxes[2].yt -= .025;
				boundingBoxes[2].yb -= .025;
			}			
		} else if (dir == 2 ) {
			directionEn2 = 1;
			boundingBoxes[2].xl -= .025;
			boundingBoxes[2].xr -= .025;
			
			if (moving(2)) {
				translateModel(vec3.scale(temp,viewRight,.025));
			} else {
				boundingBoxes[2].xl += .025;
				boundingBoxes[2].xr += .025;
			}
		} else {
			directionEn2 = 3;
			boundingBoxes[2].yt -= .025;
			boundingBoxes[2].yb -= .025;
			
			if (moving(2)) {
				translateModel(vec3.scale(temp,Up,-.025));
			} else {
				boundingBoxes[2].yt += .025;
				boundingBoxes[2].yb += .025;
			}
		}
		
		if(!boundingBoxes[6].rendered) {
			vec3.set(inputTriangles[10].translation,0,0,0);
			
			boundingBoxes[6].rendered = true;
			boundingBoxes[6].direction = directionEn1;
			fire(2,6,directionEn1);
		}
	}
	
	// Missile
	if (boundingBoxes[5].rendered) {
		
		handleKeyDown.whichOn = inputTriangles[9];
		handleKeyDown.modelOn = inputTriangles[9];
		handleKeyDown.modelOn.on = true;
		
		if (boundingBoxes[5].direction == 0) {
			translateModel(vec3.scale(temp,viewRight,-.005));
			boundingBoxes[5].xl += .005;
			boundingBoxes[5].xr += .005;
			projectileCollisions(5);
		} else if (boundingBoxes[5].direction == 1) {
			translateModel(vec3.scale(temp,viewRight,.005));
			boundingBoxes[5].xl -= .005;
			boundingBoxes[5].xr -= .005;
			projectileCollisions(5);
		} else if (boundingBoxes[5].direction == 2) {
			translateModel(vec3.scale(temp,Up,.005));
			boundingBoxes[5].yt += .005;
			boundingBoxes[5].yb += .005;
			projectileCollisions(5);
		} else {
			translateModel(vec3.scale(temp,Up,-.005));
			boundingBoxes[5].yt -= .005;
			boundingBoxes[5].yb -= .005;
			projectileCollisions(5);
		}
	}
	
	if (boundingBoxes[6].rendered) {
		
		handleKeyDown.whichOn = inputTriangles[10];
		handleKeyDown.modelOn = inputTriangles[10];
		handleKeyDown.modelOn.on = true;
		
		if (boundingBoxes[6].direction == 0) {
			translateModel(vec3.scale(temp,viewRight,-.005));
			boundingBoxes[6].xl += .005;
			boundingBoxes[6].xr += .005;
			projectileCollisions(6);
		} else if (boundingBoxes[6].direction == 1) {
			translateModel(vec3.scale(temp,viewRight,.005));
			boundingBoxes[6].xl -= .005;
			boundingBoxes[6].xr -= .005;
			projectileCollisions(6);
		} else if (boundingBoxes[6].direction == 2) {
			translateModel(vec3.scale(temp,Up,.005));
			boundingBoxes[6].yt += .005;
			boundingBoxes[6].yb += .005;
			projectileCollisions(6);
		} else {
			translateModel(vec3.scale(temp,Up,-.005));
			boundingBoxes[6].yt -= .005;
			boundingBoxes[6].yb -= .005;
			projectileCollisions(6);
		}
		
	}
}

// render the loaded model
function renderModels() {
    
	updateGame();
	
    // construct the model transform matrix, based on model state
    function makeModelTransform(currModel) {
        var zAxis = vec3.create(), sumRotation = mat4.create(), temp = mat4.create(), negCtr = vec3.create();

        // move the model to the origin
        mat4.fromTranslation(mMatrix,vec3.negate(negCtr,currModel.center)); 
        
        // rotate the model to current interactive orientation
        vec3.normalize(zAxis,vec3.cross(zAxis,currModel.xAxis,currModel.yAxis)); // get the new model z axis
        mat4.set(sumRotation, // get the composite rotation
            currModel.xAxis[0], currModel.yAxis[0], zAxis[0], 0,
            currModel.xAxis[1], currModel.yAxis[1], zAxis[1], 0,
            currModel.xAxis[2], currModel.yAxis[2], zAxis[2], 0,
            0, 0,  0, 1);
        mat4.multiply(mMatrix,sumRotation,mMatrix); // R(ax) * S(1.2) * T(-ctr)
        
        // translate back to model center
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.center),mMatrix); // T(ctr) * R(ax) * S(1.2) * T(-ctr)

        // translate model to current interactive orientation
        mat4.multiply(mMatrix,mat4.fromTranslation(temp,currModel.translation),mMatrix); // T(pos)*T(ctr)*R(ax)*S(1.2)*T(-ctr)
        
    } // end make model transform
    
    // var hMatrix = mat4.create(); // handedness matrix
    var pMatrix = mat4.create(); // projection matrix
    var vMatrix = mat4.create(); // view matrix
    var mMatrix = mat4.create(); // model matrix
    var pvMatrix = mat4.create(); // hand * proj * view matrices
    var pvmMatrix = mat4.create(); // hand * proj * view * model matrices
    
    window.requestAnimationFrame(renderModels); // set up frame render callback
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
    
    // set up projection and view
    // mat4.fromScaling(hMatrix,vec3.fromValues(-1,1,1)); // create handedness matrix
   	if (isPerspectiveProjection)
    	mat4.perspective(pMatrix,0.5*Math.PI,1,0.1,10); // create projection matrix
    else 
    	mat4.ortho(pMatrix, -0.5, .50, -0.50, 0.50, 0.1, 10);
    mat4.lookAt(vMatrix,Eye,Center,Up); // create view matrix
    mat4.multiply(pvMatrix,pvMatrix,pMatrix); // projection
    mat4.multiply(pvMatrix,pvMatrix,vMatrix); // projection * view

    // render each triangle set
    var currSet; // the tri set and its material properties
    for (var whichTriSet=0; whichTriSet<numTriangleSets; whichTriSet++) {
        if (whichTriSet < 4 || boundingBoxes[whichTriSet - 4].rendered) {
			currSet = inputTriangles[whichTriSet];
        
			// make model transform, add to view project
			makeModelTransform(currSet);
			mat4.multiply(pvmMatrix,pvMatrix,mMatrix); // project * view * model
			gl.uniformMatrix4fv(mMatrixULoc, false, mMatrix); // pass in the m matrix
			gl.uniformMatrix4fv(pvmMatrixULoc, false, pvmMatrix); // pass in the hpvm matrix
        
			// reflectivity: feed to the fragment shader
			gl.uniform3fv(ambientULoc,currSet.material.ambient); // pass in the ambient reflectivity
			gl.uniform3fv(diffuseULoc,currSet.material.diffuse); // pass in the diffuse reflectivity
			gl.uniform3fv(specularULoc,currSet.material.specular); // pass in the specular reflectivity
			gl.uniform1f(shininessULoc,currSet.material.n); // pass in the specular exponent
			// vertex buffer: activate and feed into vertex shader
			gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffers[whichTriSet]); // activate
			gl.vertexAttribPointer(vPosAttribLoc,3,gl.FLOAT,false,0,0); // feed
			gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffers[whichTriSet]); // activate
			gl.vertexAttribPointer(vNormAttribLoc,3,gl.FLOAT,false,0,0); // feed

			// triangle buffer: activate and render
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffers[whichTriSet]); // activate
			gl.drawElements(gl.TRIANGLES,3*triSetSizes[whichTriSet],gl.UNSIGNED_SHORT,0); // render
        }
    } // end for each triangle set
} // end render model


/* MAIN -- HERE is where execution begins after window load */

function main() {
  
  setupWebGL(); // set up the webGL environment
  loadModels(); // load in the models from tri file
  setupShaders(); // setup the webGL shaders
  renderModels(); // draw the triangles using webGL
  
} // end main