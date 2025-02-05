async function readObjFile(objFile, mtlMap) {
    const response = await fetch(objFile);
    let objData = (await response.text()).split("\n");

    let texCoordsInFile = [];
    let normalsInFile = [];
    let positionsInFile = [];

    let triangleData = [];
    let normalData = [];
    let texCoordsData = [];

    let NsData = [];
    let KaData = [];
    let KdData = [];
    let KsData = [];

    let currentMatProperties = [];

    for (let i = 0; i < objData.length; i++) {
        let coordinates = [];

        if (objData[i].startsWith("v")) {
            coordinates = objData[i].split(" ");
            coordinates.forEach((value, index,coordinates) => {
                if (index === 0 ) return;
                coordinates[index] = Number.parseFloat(value);
            });

            if (objData[i].startsWith("vt")) {
                texCoordsInFile.push(vec2(coordinates[1], coordinates[2]));
            } else if (objData[i].startsWith("vn")) {
                normalsInFile.push(vec4(coordinates[1], coordinates[2], coordinates[3], 0.0));
            } else {
                positionsInFile.push(vec4(coordinates[1], coordinates[2], coordinates[3], 1.0));
            }
        }  else if (objData[i].startsWith("f")) {

            coordinates = objData[i].split(" ");
            let trianglePoints = [];
            for (let j = 0; j < 2; j++) {
                for (let i = 1; i <= 3 + j; i++) {
                    if (j !== 0 && i === 2) continue;
                    trianglePoints = coordinates[i].split("/");
                    triangleData.push(positionsInFile[Number.parseInt(trianglePoints[0]) - 1]);
                    texCoordsData.push(texCoordsInFile[Number.parseInt(trianglePoints[1]) - 1]);
                    normalData.push(normalsInFile[Number.parseInt(trianglePoints[2]) - 1]);

                    NsData.push(currentMatProperties[0]);
                    KaData.push(currentMatProperties[1]);
                    KsData.push(currentMatProperties[2]);
                    KdData.push(currentMatProperties[3]);
                }
            }

        } else if (objData[i].startsWith("usemtl")) {
            let mtlName = objData[i].split(" ")[1];
            currentMatProperties = mtlMap.get(mtlName);
        }
    }

    return {triangleData: flatten(triangleData),
        texCoordsData: flatten(texCoordsData), normalData: flatten(normalData),
        NsData: NsData, KaData: flatten(KaData), KsData: flatten(KsData), KdData: flatten(KdData)};
}

async function readMtlFile(objFile) {
    const response = await fetch(objFile);
    let mtlData = (await response.text()).split("\n");
    let mtlMap = new Map();

    for (let i = 0; i < mtlData.length; i++) {

        if (mtlData[i].startsWith("newmtl")) { //get vertex data
            let mtlName = mtlData[i].split(" ")[1];
            let mtlProperties = [];
            i++;
            mtlProperties.push(parseFloat(mtlData[i].split(" ")[1]));
            i++;

            for (let j = 0; j < 3; j++) {
                let propertyValues = mtlData[i].split(" ");
                mtlProperties.push(
                    vec3(parseFloat(propertyValues[1]),
                        parseFloat(propertyValues[2]),
                        parseFloat(propertyValues[3])));
                i++;
            }

            mtlMap.set(mtlName, mtlProperties);
        }
    }

    return mtlMap;
}