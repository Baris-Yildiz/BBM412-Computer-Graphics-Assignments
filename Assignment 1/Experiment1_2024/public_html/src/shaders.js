//Source code for vertex shader
const vertexShader = `#version 300 es
    precision mediump float;
    in vec4 a_position;
    in vec4 a_color;

    out vec4 v_color;
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }
`;

//Source code for fragment shader.
const fragmentShader = `#version 300 es
    precision mediump float;
    in vec4 v_color;
    out vec4 color;

    void main() {
        color = v_color;
    }
`;