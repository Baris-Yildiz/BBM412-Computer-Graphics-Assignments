"use strict";

var canvas;
var gl;

var theta = 0.0;
var thetaLoc;

var thetaChange = 0.1;

var colors = [
    getRandomVector4(),
    getRandomVector4(),
    getRandomVector4(),
    getRandomVector4()
];

function getRandomVector4() {
    return vec4(Math.random(), Math.random(),Math.random(),1);
}
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    document.getElementById("toggleButton").addEventListener("click",
        () => {
            thetaChange *= -1;
        }
    );
    document.getElementById("speedUpButton").addEventListener("click",
        () => {
            if (thetaChange < 0) {
                thetaChange -= 0.01;
            } else {
                thetaChange += 0.01;
            }
        }
        );

    document.getElementById("slowDownButton").addEventListener("click",
        () => {
            if (thetaChange < 0) {
                thetaChange += 0.01;
                thetaChange = Math.min(-0.01, thetaChange);
            } else if (thetaChange > 0){
                thetaChange -= 0.01;
                thetaChange = Math.max(0.01, thetaChange);
            }

        }
    );

    document.getElementById("colorButton").addEventListener("click",
        () => {
            colors[0] = getRandomVector4();
            colors[1] = getRandomVector4();
            colors[2] = getRandomVector4();
            colors[3] = getRandomVector4();
        }
    );
    gl = canvas.getContext("webgl2");
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var vertices = [
        vec2(  0,  1 ),
        vec2(  -1,  0 ),
        vec2( 1,  0 ),
        vec2(  0, -1 )
    ];


    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );



    thetaLoc = gl.getUniformLocation( program, "theta" );

    render();

    function render() {

        gl.clear( gl.COLOR_BUFFER_BIT );

        theta += thetaChange;
        gl.uniform1f( thetaLoc, theta );

        var colorBufferID = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBufferID);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.DYNAMIC_DRAW);

        var colorPosition = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(colorPosition, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorPosition);

        gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

        requestAnimationFrame(render);
    }
};

