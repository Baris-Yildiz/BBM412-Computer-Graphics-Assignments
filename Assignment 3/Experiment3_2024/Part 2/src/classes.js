function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

function Vector2Addition(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
}

function flattenVector2Array(data) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
        result.push(data[i].x, data[i].y);
    }
    return result;
}

function Vector4(x, y, z, w) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
}