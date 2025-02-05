// Umbrella size properties.
const unit = 0.04;

const handleRectPos = new Vector2(0, 0);
const handleRectWidth = unit;
const handleRectHeight = 24*unit;

const handleTopHeight = handleRectHeight / 48;
const handleTopPos = Vector2Addition(handleRectPos, new Vector2(0, handleRectHeight/2 + handleTopHeight));

const handleBottomHeight = 3*handleRectWidth;
const handleBottomDiameter = 6*handleRectWidth;

const smallerHandleBottomDiameter = handleBottomDiameter / 1.5;
const smallerHandleBottomHeight = handleBottomHeight / 2;

const handleBottomPos = Vector2Addition(handleRectPos, new Vector2(-handleRectWidth/2-smallerHandleBottomDiameter/2, -handleRectHeight/2 - handleBottomHeight));
const smallerHandleBottomPos = Vector2Addition(handleBottomPos, new Vector2(0, smallerHandleBottomHeight));

const fabricPos = Vector2Addition(handleTopPos, new Vector2(0, -unit));
const fabricDiameter = handleRectHeight;
const fabricHeight = handleRectHeight / 3;

let handleData = [];
let fabricData = [];

let handleTriangles = [];
let fabricTriangles = [];

let gl;
let program;
let mode = "r";
let rotationAngle = 0;
let rotationChange = 0;

let startTime;

const Part = {
    HANDLE: 0,
    FABRIC: 1
}

// Adds Bézier curve point data. This function is similar to the one provided in Experiment 1, but now
// only adds points and not also the color.
function addBezierCurveData(pos, diameter, height, partID) {
    const x = pos.x;
    const y = pos.y;

    // linear interpolation lambda function.
    let lerp = (t, p0, p1) => new Vector2(p0.x + t * (p1.x - p0.x), p0.y + t * (p1.y - p0.y));

    // p0, p1, p2 are three control points of the curve.
    const p0 = new Vector2(x - diameter/2, y - height);
    const p1 = new Vector2(x + diameter/2, y - height);
    const p2 = new Vector2(x, y + height);

    // indicates how smooth the curve should be.
    const precision = 20;

    let t,q0;
    for (let i = 0; i <= precision; i++) {
        t = i/precision;
        q0 = lerp(t, lerp(t, p0, p2), lerp(t, p2, p1));

        if (partID === Part.HANDLE) { //handle
            handleData.push(q0);
        } else if (partID === Part.FABRIC){ //fabric: skip the first point for ease of implementation.
            if (q0.x === p0.x && q0.y === p0.y) {continue;}
            fabricData.push(q0);
        }
    }
}

// Populates data for handle. Adds the points formed by the three Bézier curves.
function populateHandleData() {
    addBezierCurveData(smallerHandleBottomPos, smallerHandleBottomDiameter, -smallerHandleBottomHeight,
        Part.HANDLE);
    addBezierCurveData(handleTopPos, handleRectWidth, handleTopHeight,Part.HANDLE);
    addBezierCurveData(handleBottomPos, -handleBottomDiameter, -handleBottomHeight,Part.HANDLE);
}
// Populates data for the fabric part. Adds the points formed by the four Bézier curves.
function populateFabricData() {

    addBezierCurveData(fabricPos, fabricDiameter, fabricHeight, Part.FABRIC);

    for (let i = 2; i >= 0; i--) {
        const smallerFabricPos = Vector2Addition(fabricPos, new Vector2((i-1) * fabricDiameter / 3, -fabricHeight*0.80));
        addBezierCurveData(smallerFabricPos, -fabricDiameter/3  , fabricHeight / 6, Part.FABRIC);
    }
}
// Function the resize the canvas when user resizes the window.
function resize( canvas ) {
    if(canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
}

let handleBuffer;
let fabricBuffer;

let positionLocation;
let colorLocation;
let angleLocation;

function render()
{
    // determine rotation angle, compute deltaTime and apply it.
    rotationAngle += rotationChange * (Date.now() - startTime) * 0.1;
    startTime = Date.now();

    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw handle
    gl.bindBuffer(gl.ARRAY_BUFFER, handleBuffer);
    gl.uniform4f(colorLocation, 0.0, 0.0, 1.0, 1.0);
    gl.uniform1f(angleLocation, rotationAngle);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, handleTriangles.length);

    // Draw fabric
    gl.bindBuffer(gl.ARRAY_BUFFER, fabricBuffer);

    // Color the fabric randomly if the mode is 'c'
    mode === "c" ?
        gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1.0)
        : gl.uniform4f(colorLocation, 1.0, 1.0, 0.0, 1.0);

    gl.uniform1f(angleLocation, rotationAngle);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, fabricTriangles.length);

    requestAnimationFrame(render);
}

//Draws an umbrella to the screen.
function drawUmbrella() {

    let canvas = document.querySelector("#glCanvas");
    gl = canvas.getContext("webgl2");
    document.addEventListener("keyup", switchMode);
    document.addEventListener("mousemove", setRotationAngle)

    function switchMode(e) {
        // record the key pressed, switch mode if it is 'r', 'm' or 'c'.
        let key = e.key.toLowerCase();
        switch (key) {
            case "r":
                rotationAngle = 0;
                rotationChange = 0;
            case "m":
            case "c":
                mode = key;
        }
    }

    function setRotationAngle(e) {
        if (mode !== "r") {
            // e.movementX is the position change of the mouse cursor.
            rotationChange = e.movementX * Math.PI / 180;
        }
    }

    //set background to white
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    resize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    program = createShaderProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    // arrange handle data
    populateHandleData();
    handleTriangles = flattenVector2Array(triangulate(handleData,[]));

    // arrange fabric data
    populateFabricData();
    fabricTriangles = flattenVector2Array(triangulate(fabricData,[]));

    startTime = Date.now();

    // create buffers
    handleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, handleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(handleTriangles), gl.STATIC_DRAW);

    fabricBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, fabricBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fabricTriangles), gl.STATIC_DRAW);

    positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);

    colorLocation = gl.getUniformLocation(program, "u_color");
    angleLocation = gl.getUniformLocation(program, "u_angle");

    render();
}