/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

//Array containing color data.
const colors = [
    0.0, 0.0, 1.0, 1.0, 
    1.0, 1.0, 0.0, 1.0, 
    1.0, 1.0, 1.0, 1.0,
    0.0, 0.0, 0.0, 1.0
];

//Enum for referencing colors by name in the height level instead of index.
const Colors = {
    BLUE:   0,
    YELLOW:  1,
    WHITE: 2,
    BLACK: 3
};

//Data for the umbrella object to be filled by the program.
var bufferData = [];

//Vec2 class definition.
function vec2(x, y) {
    this.x = x;
    this.y = y;
}

//A method for adding two vec2 objects together.
function vec2Add(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
}

//Adds 4 floats to bufferData which in total represent a color.
function addColor(colorID) {
    var offset = colorID * 4;
    for (var i = 0; i < 4; i++) {
        bufferData.push(colors[offset + i]);
    }
};

//Adds the data needed to bufferData to create a quad at position "pos", with a certain width and height on the screen.
function addQuadPosition(pos, width, height, colorID) {
    var x = pos.x;
    var y = pos.y;
    
    bufferData.push(x - width / 2, y + height / 2);
    addColor(colorID);
    
    bufferData.push(x + width / 2, y + height / 2);
    addColor(colorID);
    
    bufferData.push(x - width / 2, y - height / 2);
    addColor(colorID);
    
    bufferData.push(x + width / 2, y + height / 2);
    addColor(colorID);
    
    bufferData.push(x + width / 2, y - height / 2);
    addColor(colorID);
    
    bufferData.push(x - width / 2, y - height / 2);
    addColor(colorID);
}

//Adds data to bufferData to draw a semicircle-like object on the screen at position "pos" with a certain diameter
//and height (implemented using bezier curves)
function addBezierCurveData(pos, diameter, height, colorID) {
    var x = pos.x;
    var y = pos.y;
    
    // linear interpolation lambda function.
    let lerp = (t, p0, p1) => new vec2(p0.x + t * (p1.x - p0.x), p0.y + t * (p1.y - p0.y));
    
    // p0, p1, p2 are three control points used to draw the semicircle-like object. c is the midpoint of p0 and p1.
    const p0 = new vec2(x - diameter/2, y - height);
    const p1 = new vec2(x + diameter/2, y - height);
    const c = new vec2((p0.x + p1.x) / 2, (p0.y + p0.y) / 2);
    const p2 = new vec2(c.x, y + height);
    
    // precision is the number of triangles to fill the semicircle. The more this value is, the smoother the curve gets
    const precision = 20;
    
    // q0 and q1 represent points in the bezier curve.
    var q0 = new vec2(p0.x, p0.y);
    for (var i = 1; i <= precision; i++) {
        var t = i/precision;
        var q1 = lerp(t, lerp(t, p0, p2), lerp(t, p2, p1));
        
        bufferData.push(q0.x, q0.y); 
        addColor(colorID);
        
        bufferData.push(c.x, c.y); 
        addColor(colorID);
        
        bufferData.push(q1.x, q1.y);
        addColor(colorID);
        
        q0 = q1;
    }
}

//Adds all needed vertices to bufferData to create an umbrella on the screen.
function populateData() {
    // using a constant "unit" for ease of implementation.
    const unit = 0.10;
    
    //draw the handle body
    const handleRectPos = new vec2(0, 0);
    const handleRectWidth = unit;
    const handleRectHeight = 15*unit;
    
    addQuadPosition(handleRectPos, unit, 15*unit, Colors.BLUE);
    
    //draw the top of the handle
    const handleTopHeight = unit / 3;
    const handleTopPos = vec2Add(handleRectPos, new vec2(0, handleRectHeight/2 + handleTopHeight));
    
    addBezierCurveData(handleTopPos, handleRectWidth, handleTopHeight, Colors.BLUE); 
    
    // draw the bottom of the handle
    const handleBottomHeight = 1.5*unit;
    const handleBottomPos = vec2Add(handleRectPos, new vec2(-1.48*unit, -handleRectHeight/2 - handleBottomHeight));
    const handleBottomDiameter = 4*unit;
    
    addBezierCurveData(handleBottomPos, handleBottomDiameter, -handleBottomHeight, Colors.BLUE); 
    
    const smallerSemicirclePos = vec2Add(handleBottomPos, new vec2(0, +unit/1.25));
    addBezierCurveData(smallerSemicirclePos, handleBottomDiameter / 2, -handleBottomHeight / 2, Colors.WHITE); 
    
    // draw the fabric
    const fabricPos = vec2Add(handleTopPos, new vec2(0, -1.5*unit));
    addBezierCurveData(fabricPos, 15*unit, 3*unit, Colors.YELLOW);
    
    for (var i = 0; i < 3; i++) {
        const smallerFabricPos = vec2Add(fabricPos, new vec2(-5*unit + i * 5 * unit, -2.5*unit));
        addBezierCurveData(smallerFabricPos, 5*unit, unit/2, Colors.WHITE); 
    }
    
    // redraw a small portion of the handle that gets cut off because of the fabric.
    const smallRectPos = vec2Add(fabricPos, new vec2(0, -2.76*unit));
    addQuadPosition(smallRectPos, unit, unit/2, Colors.BLUE);
    
};

//Function to create a shader program from given shader source codes.
function createShaderProgram(/** @param {WebGLRenderingContext} gl  */gl, vsSource, fsSource) {

    //Function to compile a shader
    function compileShader(/** @param {WebGLRenderingContext} gl  */gl, type, source)  {
        const shader = gl.createShader(type); //mark "shader" as a shader of type

        gl.shaderSource(shader, source);    //load source code to "shader"
        gl.compileShader(shader);   //compile shader

        return shader;  //return shader id.
    }
    
    //compile two shader types
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

    //mark "shaderProgram" as a webgl program
    const shaderProgram = gl.createProgram();

    //attach shaders to program
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    //load program to GPU
    gl.linkProgram(shaderProgram);

    return shaderProgram; //return program id
}

//Function to create a VBO.
function createBuffer(/** @param {WebGLRenderingContext} gl  */gl, positions) {
    const positionBuffer = gl.createBuffer(); //mark "positionBuffer" as buffer

    //create and populate buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    
    return positionBuffer;
}

//Draws an umbrella to the screen.
function drawUmbrella(/** @param {WebGLRenderingContext} gl */gl) {
    //set background to white
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    //gather vertices that in total represent an umbrella
    populateData();
    
    //initialize webgl structures to process vertices and draw the umbrella object
    const program = createShaderProgram(gl, vertexShader, fragmentShader);
    const buffer = createBuffer(gl, bufferData);

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    
    //configurate so that the vertex shader gets the correct position data.
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 6*4, 0);
    
    //configurate so that the vertex shader gets the correct color data.
    const colorLocation = gl.getAttribLocation(program, "a_color");
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 4, gl.FLOAT, false, 6*4, 2*4);
    
    gl.drawArrays(gl.TRIANGLES, 0, bufferData.length);   
}

