class Camera {
    constructor(fovy, aspect, zNear, zFar) {
        this.eye = vec3(0.0, 0.0, 0.0);
        this.at = vec3(0.0, 0.0, -1.0);
        this.up = vec3(0.0, 1.0, 0.0);

        this.fovy = fovy;
        this.aspect = aspect;
        this.zNear = zNear;
        this.zFar = zFar;

        this.horizontalRotation = 0;
        this.verticalRotation = 0;
        this.projection = null;
    }

    GetLookDirection() {
        return subtract(this.at, this.eye);
    }

    SetProjectionMatrix(canvas) {
        this.aspect = canvas.width/canvas.height;
        this.projection = perspective(this.fovy, this.aspect, this.zNear, this.zFar);
    }

    GetProjectionMatrix() {
        return this.projection;
    }

    GetViewMatrix() {
        return lookAt(this.eye, this.at, this.up);
    }

    Zoom(dt) {
        let lookDir = normalize(this.GetLookDirection());

        let offset = vec3(
            lookDir[0] * dt * 100,
            lookDir[1] * dt * 100,
            lookDir[2] * dt * 100);

        this.eye = add(this.eye, offset);
        this.at = add(this.at, offset);
    }

    Translate(Xdt, Ydt) {
        let lookDir = this.GetLookDirection();
        let relativeLeft = normalize( cross(this.up, lookDir));

        let hChange = Xdt * 50;
        let vChange = Ydt * 50;

        let offset = vec3(
            relativeLeft[0] * hChange,
            relativeLeft[1] * hChange + vChange,
            relativeLeft[2] * hChange);

        this.eye = subtract(this.eye, offset);
        this.at = subtract(this.at, offset);

    }

    Rotate(Xdt, Ydt) {
        this.horizontalRotation += Xdt * 50 * (Math.PI / 180.0) * 5;
        this.verticalRotation -= Ydt * 50 * (Math.PI / 180.0) * 5;
        this.verticalRotation = Math.min(Math.max(-Math.PI/3.0, this.verticalRotation), Math.PI/3.0);

        this.at = add(this.eye, vec3(
            Math.sin(this.horizontalRotation),
            Math.sin(this.verticalRotation),
            -Math.cos(this.horizontalRotation)
        ));

    }

}