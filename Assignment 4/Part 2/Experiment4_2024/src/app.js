"use strict";

let MOVEMENT = {
    Z_AXIS:0,
    Y_AXIS:1
}

let CAMERA_MOVEMENT = {
    NONE: 0,
    TRANSLATE: 1,
    ROTATE: 2
}

let gl;
let program;
let canvas;

let monkeyHeadFile = '/resources/monkey_head.obj';

let monkey1;
let monkey2;
let monkey3;

let time = 0;
let dt = 0;
let previousTime;

let fovy = 70;
let aspect;
let zNear = 0.5;
let zFar = 50;

let cameraHorizontalRotation = 0;
let cameraVerticalRotation = 0;
let cameraOffset = vec3(0.0,0.0,0.0);

let camera = {
    view: 0,
    projection: 0,
    eye: vec3(0.0, 0.0, 0.0),
    up: vec3(0.0, 1.0, 0.0),
    at: vec3(0.0, 0.0, -1.0)
}

let cameraMoveMode = CAMERA_MOVEMENT.NONE;

function resize( canvas ) {
    if(canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
}

function main() {
    canvas = document.querySelector("#glCanvas");
    gl = canvas.getContext("webgl2");

    document.addEventListener("mousedown", (e) => {
        canvas.requestPointerLock();

       switch (e.button) {
           case 0: //left
                cameraMoveMode = CAMERA_MOVEMENT.ROTATE;
                break;
           case 2: //right
               cameraMoveMode = CAMERA_MOVEMENT.TRANSLATE;
               break;

       }
    });
    document.addEventListener("mouseup", () => {
       cameraMoveMode = CAMERA_MOVEMENT.NONE;
    });

    document.addEventListener("wheel", (e) => {
        let relativeAt = normalize(subtract(camera.at ,camera.eye));

        let zChange = 0;
        let zoomAmount = -dt*100;

        if (e.deltaY > 0) {
            zChange = zoomAmount;
        } else if (e.deltaY < 0) {
            zChange = -zoomAmount;
        }

        cameraOffset[0] += relativeAt[0] * zChange;
        cameraOffset[1] += relativeAt[1] * zChange;
        cameraOffset[2] += relativeAt[2] * zChange;
    })

    document.addEventListener("mousemove", (e) => {
        let movementChange = dt * 100;

        let hChange = 0;
        if (e.movementX > 0) {
            hChange = movementChange;
        } else if (e.movementX < 0) {
            hChange = -movementChange;
        }

        let vChange = 0;
        if (e.movementY > 0) {
            vChange = movementChange;
        } else if (e.movementY < 0) {
            vChange = -movementChange;
        }

       switch (cameraMoveMode) {
           case CAMERA_MOVEMENT.TRANSLATE:
               let relativeLeft = normalize( cross(camera.up, subtract(camera.at, camera.eye)));

               cameraOffset[0] -= relativeLeft[0] * hChange;
               cameraOffset[1] -= relativeLeft[1] * hChange + vChange;
               cameraOffset[2] -= relativeLeft[2] * hChange;
               break;
           case CAMERA_MOVEMENT.ROTATE:
               cameraHorizontalRotation += hChange * (Math.PI / 180.0) * 5;
               cameraVerticalRotation -= vChange * (Math.PI / 180.0) * 5;
               cameraVerticalRotation = Math.min(Math.max(-Math.PI/3.0, cameraVerticalRotation), Math.PI/3.0);
               break;
       }
    });

    program = createShaderProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);

    monkey1 = new GameObject(monkeyHeadFile, gl, program);
    monkey1.setPosition(-5, 0, -10);

    monkey2 = new GameObject(monkeyHeadFile, gl, program);
    monkey2.setPosition(0, 0, -10);

    monkey3 = new GameObject(monkeyHeadFile, gl, program);
    monkey3.setPosition(5, 0, -10);

    previousTime = Date.now();
    render();
}

function movementAnimation(axis, gameObject, t, duration, center, radius) {
    t = t % (2*duration);
    let func;
    let start = center - radius;
    let end = center + radius;
    if (t <= duration) {
        func = (x) => (x * (end - start) + duration*start)/duration;
    } else {
        func = (x) => ((start-end)*(x-duration) + end* duration)/duration;
    }

    if (axis === MOVEMENT.Y_AXIS) {
        gameObject.setPosition(gameObject.position[0], func(t), gameObject.position[2]);
    } else if (axis === MOVEMENT.Z_AXIS) {
        gameObject.setPosition(gameObject.position[0], gameObject.position[1], func(t));
    }
}

function render() {
    dt = (Date.now() - previousTime) / 1000.0;
    time += dt;
    previousTime = Date.now();

    resize(canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    aspect = canvas.width/canvas.height;

    camera.at = vec3(
        Math.sin(cameraHorizontalRotation) + cameraOffset[0],
        Math.sin(cameraVerticalRotation) + cameraOffset[1],
        -Math.cos(cameraHorizontalRotation) + cameraOffset[2]
    );

    camera.eye = cameraOffset;

    camera.projection = perspective(fovy, aspect, zNear, zFar);
    camera.view = lookAt(camera.eye, camera.at, camera.up);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    movementAnimation(MOVEMENT.Z_AXIS, monkey1, time, 1, -10 ,4);
    monkey1.drawObject(camera, gl);

    monkey2.setRotation(time);
    monkey2.drawObject(camera, gl);

    movementAnimation(MOVEMENT.Y_AXIS, monkey3, time, 1, 0, 2);
    monkey3.drawObject(camera, gl);

    requestAnimationFrame(render);
}

main();