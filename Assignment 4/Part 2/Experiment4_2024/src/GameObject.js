class GameObject {
    constructor(objFile, gl, program) {
        this.objFile = objFile;
        this.positionsInFile = [];
        this.vertexCoordsInFile = [];
        this.vertexNormalsInFile = [];

        this.triangleData = [];
        this.normalData = [];

        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);


        this.positionLoc = gl.getAttribLocation(program, "a_position");
        gl.vertexAttribPointer(this.positionLoc, 4, gl.FLOAT, false,0, 0);

        this.positionLoc = gl.getUniformLocation(program, "u_translation");
        this.position = vec4(0.0, 0.0, 0.0, 1.0);

        this.centerLoc = gl.getUniformLocation(program, "u_center");

        this.projectionMatrixLoc = gl.getUniformLocation(program, "u_projectionMatrix");
        this.viewMatrixLoc = gl.getUniformLocation(program, "u_viewMatrix");

        this.rotation = 0.0;
        this.rotationLoc = gl.getUniformLocation(program, "u_rotationAngle");

        let promise = this.readObjectFile()
            .then(() => {
                this.center = this.calculateCenter()
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.triangleData), gl.STATIC_DRAW);
            });
    }

    calculateCenter() {
        let posData = this.positionsInFile;
        let x_max = posData[0][0];
        let x_min = x_max;

        let y_max = posData[0][1];
        let y_min = y_max;

        let z_max = posData[0][2];
        let z_min = z_max;

        for (let i = 0; i < posData.length; i++) {
            let x = posData[i][0];
            let y = posData[i][1];
            let z = posData[i][2];

            x_min = Math.min(x_min, x);
            y_min = Math.min(y_min, y);
            z_min = Math.min(z_min, z);

            x_max = Math.max(x_max, x);
            y_max = Math.max(y_max, y);
            z_max = Math.max(z_max, z);
        }
        return vec4((x_min + x_max) / 2, (y_max + y_min) / 2, (z_min + z_max) / 2, 1.0);
    }

    setPosition(x, y, z) {
        this.position[0] = x;
        this.position[1] = y;
        this.position[2] = z;
    }

    setRotation(angle) {
        this.rotation = angle;
    }

    drawObject(camera, gl) {
        if (this.triangleData.length === 0) return; //if object is not loaded.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.enableVertexAttribArray(this.positionLoc);

        gl.uniform3f(this.positionLoc, this.position[0], this.position[1], this.position[2]);
        gl.uniform3f(this.centerLoc, this.center[0], this.center[1], this.center[2]);
        gl.uniform1f(this.rotationLoc, this.rotation);

        gl.uniformMatrix4fv(this.projectionMatrixLoc, false, flatten(camera.projection));
        gl.uniformMatrix4fv(this.viewMatrixLoc, false, flatten(camera.view));

        gl.drawArrays(gl.TRIANGLES, 0, this.triangleData.length / 4.0);
    }

    async readObjectFile() {
        const response = await fetch(this.objFile);
        let objData = (await response.text()).split("\n");

        for (let i = 0; i < objData.length; i++) {

            let coordinates = [];

            if (objData[i].startsWith("v")) { //get vertex data

                coordinates = objData[i].split(" ");
                coordinates.forEach((value, index,coordinates) => {
                    if (index === 0 ) return;
                    coordinates[index] = Number.parseFloat(value);
                });

                if (objData[i].startsWith("vt")) {
                    this.vertexCoordsInFile.push(vec2(coordinates[1], coordinates[2]));
                } else if (objData[i].startsWith("vn")) {
                    this.vertexNormalsInFile.push(vec4(coordinates[1], coordinates[2], coordinates[3], 0.0));
                } else {
                    this.positionsInFile.push(vec4(coordinates[1], coordinates[2], coordinates[3], 1.0));
                }
            }  else if (objData[i].startsWith("f")) {

                coordinates = objData[i].split(" ");
                let trianglePoints = [];
                for (let i = 1; i < coordinates.length; i++) {
                    trianglePoints = coordinates[i].split("//");
                    this.triangleData.push(this.positionsInFile[Number.parseInt(trianglePoints[0]) - 1]);
                    this.normalData.push(this.vertexNormalsInFile[Number.parseInt(trianglePoints[1]) - 1]);
                }
            }
        }

        this.triangleData = flatten(this.triangleData);
        this.normalData = flatten(this.normalData);
    }
}