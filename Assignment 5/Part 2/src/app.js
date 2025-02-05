"use strict";

let CAMERA_MOVEMENT = {
    NONE: 0,
    TRANSLATE: 1,
    ROTATE: 2
}

let canvas;
let gl;

let time = 0;
let dt = 0;
let previousTime;

let camera = null;
let cameraMoveMode = CAMERA_MOVEMENT.NONE;

function resize( canvas ) {
    if(canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
}

let sphere = null;
let plant = null;

async function main() {

    canvas = document.querySelector("#glCanvas");
    gl = canvas.getContext("webgl2");

    gl.enable(gl.DEPTH_TEST);


    camera = new Camera(70.0, canvas.width/canvas.height, 0.5, 50.0);
    document.addEventListener("mousedown", (e) => {
        canvas.requestPointerLock();

       switch (e.button) {
           case 0:
                cameraMoveMode = CAMERA_MOVEMENT.ROTATE;
                break;
           case 2:
               cameraMoveMode = CAMERA_MOVEMENT.TRANSLATE;
               break;

       }
    });
    document.addEventListener("mouseup", () => {
       cameraMoveMode = CAMERA_MOVEMENT.NONE;
    });
    document.addEventListener("wheel", (e) => {

        if (e.deltaY > 0) {
            camera.Zoom(-dt);
        } else if (e.deltaY < 0) {
            camera.Zoom(dt);
        }
    })
    document.addEventListener("mousemove", (e) => {
        let movementDt = dt;

        let xDt = 0;
        if (e.movementX > 0) {
            xDt = movementDt;
        } else if (e.movementX < 0) {
            xDt = -movementDt;
        }

        let yDt = 0;
        if (e.movementY > 0) {
            yDt = movementDt;
        } else if (e.movementY < 0) {
            yDt = -movementDt;
        }

       switch (cameraMoveMode) {
           case CAMERA_MOVEMENT.TRANSLATE:
               camera.Translate(xDt, yDt);
               break;
           case CAMERA_MOVEMENT.ROTATE:
               camera.Rotate(xDt, yDt);
               break;
       }
    });


    let plantProgram = createShaderProgram(gl, plantVertexShader, plantFragmentShader);
    gl.useProgram(plantProgram);
    let plantMTLData = await readMtlFile("resources/bitki.mtl");
    let plantData = await readObjFile("resources/bitki.obj", plantMTLData);
    plant = new Plant(gl, plantProgram, plantData);
    await plant.applyTexture(gl, [
        "textures/indoor plant_2_COL.jpg",
        "textures/indoor plant_2_NOR.jpg",
    ]);
    plant.translate(0.0, 5.0, -30);


    let sphereProgram = createShaderProgram(gl, sphereVertexShader, sphereFragmentShader);
    gl.useProgram(sphereProgram);
    sphere = new Sphere(gl,sphereProgram,15);
    await sphere.applyTexture(gl,[
        "textures/sand-dunes1_albedo.png",
        "textures/sand-dunes1_normal-dx.png",
        "textures/sand-dunes1_metallic.png",
        "textures/sand-dunes1_roughness.png",
        "textures/sand-dunes1_ao.png",
        "textures/sand-dunes1_height.png"
    ]);
    sphere.translate(0.0, -10.0, -30);

    previousTime = Date.now();
    render();
}

function render() {
    dt = (Date.now() - previousTime) / 1000.0;
    time += dt;
    previousTime = Date.now();

    resize(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    camera.SetProjectionMatrix(canvas);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    sphere.draw(gl,camera);
    sphere.rotateAroundY(time);
    sphere.rotateLight(time);

    plant.rotateAroundY(time);
    plant.draw(gl,camera);
    plant.rotateLight(time);

    requestAnimationFrame(render);
}

main();