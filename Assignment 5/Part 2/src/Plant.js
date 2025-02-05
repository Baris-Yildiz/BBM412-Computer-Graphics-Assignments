class Plant extends Object3D{
    constructor(gl, program, data){
        super(gl, program);

        this.data = data;

        this.positionData = this.data.triangleData;
        this.normalData = this.data.normalData;
        this.texCoordsData = this.data.texCoordsData;

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positionData), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoordsData), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalData), gl.STATIC_DRAW);

        this.NsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.NsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data.NsData), gl.STATIC_DRAW);

        this.NsLoc = gl.getAttribLocation(program, "v_ns");

        this.KaBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.KaBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data.KaData), gl.STATIC_DRAW);

        this.KaLoc = gl.getAttribLocation(program, "v_ka");

        this.KsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.KsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data.KsData), gl.STATIC_DRAW);
        this.KsLoc = gl.getAttribLocation(program, "v_ks");

        this.KdBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.KdBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data.KdData), gl.STATIC_DRAW);
        this.KdLoc = gl.getAttribLocation(program, "v_kd");
    }

    draw(gl, camera) {
        super.draw(gl, camera);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

        gl.enableVertexAttribArray(this.positionLoc);
        gl.vertexAttribPointer(this.positionLoc, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);

        gl.enableVertexAttribArray(this.texCoordsLoc);
        gl.vertexAttribPointer(this.texCoordsLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.enableVertexAttribArray(this.normalLoc);
        gl.vertexAttribPointer(this.normalLoc, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.NsBuffer);
        gl.enableVertexAttribArray(this.NsLoc);
        gl.vertexAttribPointer(this.NsLoc, 1, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.KsBuffer);
        gl.enableVertexAttribArray(this.KsLoc);
        gl.vertexAttribPointer(this.KsLoc, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.KdBuffer);
        gl.enableVertexAttribArray(this.KdLoc);
        gl.vertexAttribPointer(this.KdLoc, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.KaBuffer);
        gl.enableVertexAttribArray(this.KaLoc);
        gl.vertexAttribPointer(this.KaLoc, 3, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textureAlbedo);
        gl.uniform1i(this.textureAlbedoLoc, 0);

        this.setTransformationMatrices(gl, camera);
        gl.drawArrays(gl.TRIANGLES, 0, this.data.triangleData.length / 4.0);
    }

    async applyTexture(gl,files) {
        this.textureAlbedo = await this.loadTexture(gl, files[0]);
        this.textureNormal = await this.loadTexture(gl, files[1]);
    }
}