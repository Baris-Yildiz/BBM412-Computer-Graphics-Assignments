class Object3D {
    constructor(gl, program) {
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        this.positionData = [];

        this.texCoordsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
        this.texCoordsData = [];

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        this.normalData = [];

        this.positionLoc = gl.getAttribLocation(program, "vPosition");
        this.texCoordsLoc = gl.getAttribLocation(program, "vTexCoords");
        this.normalLoc = gl.getAttribLocation(program, "vNormal");

        this.modelViewLoc = gl.getUniformLocation(program, "modelView");
        this.projectionLoc = gl.getUniformLocation(program, "projection");
        this.normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

        this.textureAlbedoLoc = gl.getUniformLocation(program, "albedoTexture");
        this.textureNormalLoc = gl.getUniformLocation(program, "normalTexture");

        this.lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
        this.lightIntensityLoc = gl.getUniformLocation(program, "lightIntensity");

        this.rotationMatrix = mat4();
        this.scaleMatrix = mat4();
        this.translationMatrix = mat4();

        this.lightTransformation = mat4();
        this.lightPos = vec4(0.0, 10.0, -20.0, 1.0);
        this.lightIntensity = 40.0;

        gl.uniform1f(this.lightIntensityLoc, this.lightIntensity);

        this.textureAlbedo = 0;
        this.textureNormal = 0;
        this.textureMetallic = 0;
        this.textureRoughness = 0;
        this.textureAO = 0;

        this.program = program;
    }

    rotateAroundY(totalAngle) {
        this.rotationMatrix[0][0] = Math.cos(totalAngle);
        this.rotationMatrix[2][0] = -Math.sin(totalAngle);
        this.rotationMatrix[0][2] = Math.sin(totalAngle);
        this.rotationMatrix[2][2] = Math.cos(totalAngle);
    }

    translate(dx, dy, dz) {
        this.translationMatrix[0][3] = dx;
        this.translationMatrix[1][3] = dy;
        this.translationMatrix[2][3] = dz;
    }

    loadImage(gl, filepath) {
        return new Promise(resolve => {
            let image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.src = filepath;
        })
    }

    async loadTexture(gl, filepath) {
        let tex= gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);

        let image = await this.loadImage(gl, filepath);

        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);


        gl.texImage2D(gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);

        return tex;
    }


    setTransformationMatrices(gl, camera) {
        gl.uniformMatrix4fv(this.projectionLoc, false, flatten(camera.GetProjectionMatrix()));

        let modelMatrix = mult(this.translationMatrix,mult(this.scaleMatrix, this.rotationMatrix));
        let modelView = mult(camera.GetViewMatrix(), modelMatrix);
        gl.uniformMatrix4fv(this.normalMatrixLoc, true, flatten(inverse(modelView)));
        gl.uniformMatrix4fv(this.modelViewLoc, false, flatten(modelView));

        gl.uniform4fv(this.lightPositionLoc, flatten(mult(camera.GetViewMatrix(), mult(this.lightTransformation,this.lightPos))));
    }

    draw(gl, camera) {
        gl.useProgram(this.program)
    }

    rotateLight(angle) {
        this.lightTransformation[0][0] = Math.cos(angle);
        this.lightTransformation[0][1] = -Math.sin(angle);
        this.lightTransformation[1][0] = Math.sin(angle);
        this.lightTransformation[1][1] = Math.cos(angle);
    }
}