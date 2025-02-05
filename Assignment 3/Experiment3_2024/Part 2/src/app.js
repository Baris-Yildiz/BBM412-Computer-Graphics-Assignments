"use strict";

const MODE = {
    CLEAR : 0,
    DRAW : 1,
    FILL: 2
}

const ROTATION = {
    CLOCKWISE : 0,
    COUNTERCLOCKWISE : 1
}

const DISPLACEMENT = {
    LEFT : new Vector2(-0.1, 0),
    RIGHT : new Vector2(0.1, 0),
    UP : new Vector2(0, 0.1),
    DOWN : new Vector2(0, -0.1),
}

let gl;
let program;
let canvas;

let mode = MODE.CLEAR;

let vertices = [];

let center;

let positionChange = new Vector2(0, 0);
let scale = new Vector2(1, 1);
let angleChange = 0;
const angleChangeDelta = 15.0 //change in degrees
let color = new Vector4(0.0, 1.0, 0.0, 1.0);

let angleLoc;
let displacementVectorLoc;
let scaleLoc;
let centerLoc;
let colorLoc;

let vertexBuffer;

function setMode(modeToSet) {
    if (mode === MODE.FILL && modeToSet === MODE.DRAW) return;
    mode = modeToSet;
}

function setAngleChange(direction) {
    let changeAmount = Math.PI * angleChangeDelta / 180.0
    angleChange += (direction === ROTATION.CLOCKWISE) ? -changeAmount : changeAmount;
}

function displaceObject(displacement) {
    positionChange = Vector2Addition(positionChange, displacement);
}

function setScale(value) {
    scale.x = value;
    scale.y = value;
}

function setColor(value) {
    let valueStr = value.toString();
    function convertToColorNumber(start, end) {
        return Number("0x" + valueStr.substring(start, end)) / 255.0;
    }

    color = new Vector4(
        convertToColorNumber(1,3),
        convertToColorNumber(3,5),
        convertToColorNumber(5,7),
        1.0);
}

function addVertex(event) {
    if (mode === MODE.DRAW) {
        let vertexPosition = new Vector2((event.offsetX - canvas.width/2.0) / (canvas.width/2.0),
            -(event.offsetY - canvas.height/2.0) / (canvas.height/2.0));
        vertices.push(vertexPosition);
    }
}

function resize( canvas ) {
    if(canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
}

function setUniformLocations() {
    angleLoc = gl.getUniformLocation(program, "u_angle");
    displacementVectorLoc = gl.getUniformLocation(program, "u_dv");
    scaleLoc = gl.getUniformLocation(program, "u_scale");
    centerLoc = gl.getUniformLocation(program, "u_center");
    colorLoc = gl.getUniformLocation(program, "u_color");
}

function setUniforms() {
    if (vertices.length === 0) return;
    gl.uniform1f(angleLoc, angleChange);
    gl.uniform2f(displacementVectorLoc, positionChange.x , positionChange.y);
    gl.uniform2f(scaleLoc, scale.x, scale.y);
    gl.uniform2f(centerLoc, center.x, center.y);
    gl.uniform4f(colorLoc, color.x, color.y, color.z, color.w);
}

function calculateCenter() {
    if (vertices.length === 0) return;
    let x_max = vertices[0].x;
    let x_min = x_max;
    let y_max = vertices[0].y;
    let y_min = y_max;
    for (let i = 0; i < vertices.length; i++) {
        let x = vertices[i].x;
        let y = vertices[i].y;

        x_min = Math.min(x_min, x);
        y_min = Math.min(y_min, y);

        x_max = Math.max(x_max, x);
        y_max = Math.max(y_max, y);
    }
    center = new Vector2((x_min + x_max) / 2, (y_max + y_min) / 2);
}

function resetSettings() {
    angleChange = 0;
    positionChange = new Vector2(0, 0);
    scale = new Vector2(1, 1);

    let slider = document.getElementById("scaleSlider");
    slider.value = slider.max/2;
}

function main() {
    canvas = document.querySelector("#glCanvas");
    canvas.addEventListener("mousedown", addVertex);
    gl = canvas.getContext("webgl2");

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    resize(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flattenVector2Array(vertices)), gl.DYNAMIC_DRAW);
    calculateCenter();

    program = createShaderProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    setUniformLocations();

    let position = gl.getAttribLocation(program, "a_position");
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false,0, 0);
    gl.enableVertexAttribArray(position);


    render();
}

function render() {
    resize(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let data;
    let drawMode;

    switch (mode) {
        case MODE.DRAW:

            drawMode = gl.LINE_STRIP;
            data = vertices;
            break;
        case MODE.FILL:
            drawMode = gl.TRIANGLES;
            data = triangulate([...vertices], []);
            if (data.length === 0) { //failed to fill
                data = triangulate([...vertices.toReversed()], []);
                if (data.length === 0) { //failed again
                    mode = MODE.DRAW;
                    drawMode = gl.LINE_STRIP;
                    data = vertices;
                }
            }

            break;
        case MODE.CLEAR:

            if (vertices.length !== 0) vertices = [];
            data = [];
            resetSettings();
            break;
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flattenVector2Array(data)), gl.DYNAMIC_DRAW);
    calculateCenter();

    setUniforms();
    gl.drawArrays( drawMode, 0, data.length );

    requestAnimationFrame(render);
}

main();