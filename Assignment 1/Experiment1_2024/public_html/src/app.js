"use strict";

main();

function main() {
    const canvas = document.querySelector("#glCanvas");
    
    /** @type {WebGL2RenderingContext} */
    const gl = canvas.getContext("webgl2");
    
    drawUmbrella(gl);
    
}