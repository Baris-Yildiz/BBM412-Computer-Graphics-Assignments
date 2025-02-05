const vertexShader = `#version 300 es
    precision mediump float;
    in vec4 a_position;

    uniform vec4 u_color;
    out vec4 v_color;
    
    uniform float u_angle;
     
    void main() {
       
        float cos_angle = cos(u_angle);
        float sin_angle = sin(u_angle);
            
        mat4 rotationMatrix = mat4(
            cos_angle, sin_angle, 0.0, 0.0,
            -sin_angle, cos_angle, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        );
        
        gl_Position = rotationMatrix * a_position;
        v_color = u_color;
    }
`;

const fragmentShader = `#version 300 es
    precision mediump float;
    in vec4 v_color;
    
    out vec4 color;
    void main() {
        color = v_color;
    }
`;

// Function to create a shader program from given shader source codes.
function createShaderProgram(/** @param {WebGLRenderingContext} gl  */gl, vsSource, fsSource) {

    // Function to compile a shader
    function compileShader(/** @param {WebGLRenderingContext} gl  */gl, type, source)  {
        const shader = gl.createShader(type); // Create shader of type "type"

        gl.shaderSource(shader, source);    // Load source code to "shader"
        gl.compileShader(shader);   // Compile shader

        return shader;  // Return shader id.
    }

    // Compile two shader types
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create shader program
    const shaderProgram = gl.createProgram();

    // Attach shaders to program
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    // Load program to GPU
    gl.linkProgram(shaderProgram);

    return shaderProgram; // Return program id
}