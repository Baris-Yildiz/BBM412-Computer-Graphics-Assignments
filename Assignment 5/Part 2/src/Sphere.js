class Sphere extends Object3D{
    constructor(gl, program, radius) {
        super(gl, program);
        this.radius = radius;
        this.tangentData = [];

        this.createPoints();

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(this.positionData)), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(this.texCoordsData)), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(this.normalData)), gl.STATIC_DRAW);

        this.tangentBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(this.tangentData)), gl.STATIC_DRAW);


        this.tangentLoc = gl.getAttribLocation(program, "vTangent");
        this.textureMetallicLoc = gl.getUniformLocation(program, "metallicTexture");
        this.textureRoughnessLoc = gl.getUniformLocation(program, "roughnessTexture");
        this.textureAOLoc = gl.getUniformLocation(program, "aoTexture");

    }

    createPoints() {
        let allPoints = [];
        let allTexCoords = [];
        let allNormals = [];
        let allTangents = [];

        let detail = 100.0;

        for (let j= 0; j <= detail; j++) {
            let points = [];
            let texCoords = [];
            let normals = [];
            let tangents = [];
            for (let i = 0; i <= detail;i++) {
                let theta = i * Math.PI / detail; //lat
                let phi = j * 2.0 * Math.PI / detail; //lon
                let x = this.radius * Math.cos(phi) * Math.sin(theta);
                let y = this.radius * Math.sin(theta) * Math.sin(phi);
                let z = this.radius * Math.cos(theta);

                let u = x / this.radius;
                let v = y / this.radius;

                texCoords.push(vec2(u, v));
                points.push(vec4(x, y, z, 1.0));
                normals.push(vec4(x, y, z, 0.0));

                tangents.push(vec4(
                    -this.radius * Math.cos(theta) * Math.sin(phi),
                    0,
                    this.radius * Math.cos(theta) * Math.cos(phi),
                    0
                ));
            }

            allPoints.push(points);
            allTexCoords.push(texCoords);
            allNormals.push(normals);
            allTangents.push(tangents);
        }

        for (let i = 0; i < allPoints.length-1; i++) {
            for (let j = 0; j < allPoints[i].length-1; j++) {

                this.positionData.push(allPoints[i][j]);
                this.texCoordsData.push(allTexCoords[i][j]);
                this.normalData.push(allNormals[i][j]);
                this.tangentData.push(allTangents[i][j]);

                this.positionData.push(allPoints[i][j+1]);
                this.texCoordsData.push(allTexCoords[i][j+1]);
                this.normalData.push(allNormals[i][j+1]);
                this.tangentData.push(allTangents[i][j+1]);

                this.positionData.push(allPoints[i+1][j+1]);
                this.texCoordsData.push(allTexCoords[i+1][j+1]);
                this.normalData.push(allNormals[i+1][j]);
                this.tangentData.push(allTangents[i+1][j]);

                this.positionData.push(allPoints[i][j]);
                this.texCoordsData.push(allTexCoords[i][j]);
                this.normalData.push(allNormals[i][j]);
                this.tangentData.push(allTangents[i][j]);

                this.positionData.push(allPoints[i+1][j]);
                this.texCoordsData.push(allTexCoords[i+1][j]);
                this.normalData.push(allNormals[i+1][j]);
                this.tangentData.push(allTangents[i+1][j]);

                this.positionData.push(allPoints[i+1][j+1]);
                this.texCoordsData.push(allTexCoords[i+1][j+1]);
                this.normalData.push(allNormals[i+1][j+1]);
                this.tangentData.push(allTangents[i+1][j+1]);
            }
        }
    }

    draw(gl, camera) {
        super.draw(gl, camera);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.vertexAttribPointer(this.positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(this.positionLoc);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordsBuffer);
        gl.enableVertexAttribArray(this.texCoordsLoc);
        gl.vertexAttribPointer(this.texCoordsLoc, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.enableVertexAttribArray(this.normalLoc);
        gl.vertexAttribPointer(this.normalLoc, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.tangentBuffer);
        gl.enableVertexAttribArray(this.tangentLoc);
        gl.vertexAttribPointer(this.tangentLoc, 4, gl.FLOAT, false, 0, 0);

        this.setTransformationMatrices(gl, camera);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.textureAlbedo);
        gl.uniform1i(this.textureAlbedoLoc, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.textureNormal);
        gl.uniform1i(this.textureNormalLoc, 1);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.textureMetallic);
        gl.uniform1i(this.textureMetallicLoc, 2);

        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.textureRoughness);
        gl.uniform1i(this.textureRoughnessLoc, 3);

        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this.textureAO);
        gl.uniform1i(this.textureAOLoc, 4);

        gl.drawArrays(gl.TRIANGLES,0,this.positionData.length );
    }

    async applyTexture(gl,files) {
        this.textureAlbedo = await this.loadTexture(gl, files[0]);
        this.textureNormal = await this.loadTexture(gl, files[1]);
        this.textureMetallic = await this.loadTexture(gl, files[2]);
        this.textureRoughness = await this.loadTexture(gl, files[3]);
        this.textureAO = await this.loadTexture(gl, files[4]);
    }
}

