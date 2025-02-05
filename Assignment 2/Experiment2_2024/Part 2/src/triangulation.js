// Method that returns an array of triangle vertices that make up the polygon whose corners are represented by vertices in input data.
// data is the input data of corner vertices, trianglePoints is the output data of triangle vertices.
function triangulate(data, trianglePoints) {
    // Input data cannot be triangulated if it has less than 3 vertices.
    if (data.length < 3) {
        return [];
    }

    // Base case: 3 points need to be triangulated.
    if (data.length === 3) {
        for (let i = 0; i < data.length; i++) {
            trianglePoints.push(data[i]);
        }
        return trianglePoints;
    }

    // if no "ear" can be formed, the polygon cannot be triangulated, and we must stop the recursion.
    let stopExecution = true;

    // Find 3 valid consecutive corner points that form a triangle inside the remaining polygon.
    for (let i = 0; i < data.length; i++) {
        let prev = i-1;
        if (prev < 0) {prev = data.length-1;} // clamp prev index to array range.
        let next = i+1;
        if (next > data.length-1) {next = 0;}   // clamp next index to array range.

        // Check if vertices form an "ear". If so, remove the ith vertex and exit from current function.
        // If no 3 vertices make an ear, the input index is invalid and a polygon cannot be formed.
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
// Check if p1, p2 and p3 form an ear in data. Ears are triangles that are fully inside the polygon.
function isEar(p1, p2, p3, data) {
    return isTriangleInside(p1, p2, p3) && isTriangleFullyInside(p1, p2, p3, data);
}

// Utility function used to round floats to a predefined precision p.
function roundFloat(f1) {
    const p = 4;
    return Math.round(f1 * Math.pow(10,p));
}

// Checks if p1, p2 and p3 form a triangle inside the polygon.
function isTriangleInside(p1, p2, p3) {
    const v1 = new Vector2(p2.x - p1.x, p2.y - p1.y);
    let lineY = (x) => ((x-p1.x) * v1.y) / (v1.x) + p1.y;

    const pointY = roundFloat(p3.y);
    const linearPointY = roundFloat(lineY(p3.x));

    return (v1.x > 0 && pointY < linearPointY) ||
        ((v1.x < 0) && pointY > linearPointY);
}

// Checks if any point inside the triangle formed by p1, p2 and p3 are outside the polygon.
function isTriangleFullyInside(p1, p2, p3, data) {
    // Utility function to calculate triangle area.
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