// Vector2 class.
function Vector2(x, y) {
    this.x = x;
    this.y = y;
}

// Method for adding two Vector2 objects. Returns a + b.
function Vector2Addition(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
}

// Method for flattening an array of Vector2 data. Returns an array of floats.
function flattenVector2Array(data) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
        result.push(data[i].x, data[i].y);
    }
    return result;
}