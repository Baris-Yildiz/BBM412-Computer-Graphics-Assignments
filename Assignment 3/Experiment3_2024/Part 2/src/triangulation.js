function triangulate(data, trianglePoints) {
    if (data.length < 3) {
        return [];
    }

    if (data.length === 3) {
        for (let i = 0; i < data.length; i++) {
            trianglePoints.push(data[i]);
        }
        return trianglePoints;
    }

    let stopExecution = true;

    for (let i = 0; i < data.length; i++) {
        let prev = i-1;
        if (prev < 0) {prev = data.length-1;}
        let next = i+1;
        if (next > data.length-1) {next = 0;}

        if (isEar(data[prev], data[i], data[next], data)) {
            trianglePoints.push(data[prev], data[i], data[next]);
            data.splice(i, 1);
            stopExecution = false;
            break;
        }
    }

    if (stopExecution) {
        return [];
    }
    return triangulate(data, trianglePoints);
}

function isEar(p1, p2, p3, data) {
    return isTriangleInside(p1, p2, p3) && isTriangleFullyInside(p1, p2, p3, data);
}

function roundFloat(f1) {
    const p = 6;
    return Math.round(f1 * Math.pow(10,p));
}

function isTriangleInside(p1, p2, p3) {
    const v1 = new Vector2(p2.x - p1.x, p2.y - p1.y);
    let lineY = (x) => ((x-p1.x) * v1.y) / (v1.x) + p1.y;

    const pointY = roundFloat(p3.y);
    const linearPointY = roundFloat(lineY(p3.x));

    return (v1.x > 0 && pointY < linearPointY) ||
        ((v1.x < 0) && pointY > linearPointY);
}

function isTriangleFullyInside(p1, p2, p3, data) {

    function areaOfTriangle(p1, p2, p3) {
        return 0.5 * Math.abs((p1.x*p2.y + p2.x*p3.y + p3.x*p1.y) -
            (p2.x*p1.y + p3.x*p2.y + p1.x*p3.y));
    }

    const area = areaOfTriangle(p1, p2, p3);
    for (let i = 0; i < data.length; i++) {
        let point = data[i];
        if (point !== p1 && point !== p2 && point !== p3) {
            let combinedArea = areaOfTriangle(point, p2, p3) + areaOfTriangle(point, p1, p3) + areaOfTriangle(point, p1, p2);
            if (roundFloat(combinedArea) === roundFloat(area)) {
                return false;
            }
        }
    }

    return true;
}