const vertexShader = `#version 300 es
    precision mediump float;
    in vec4 a_position;
    
    uniform float u_angle;
    uniform vec2 u_dv;
    uniform vec2 u_scale;
    uniform vec2 u_center;
    uniform vec4 u_color;
    
    out vec4 v_color;
    
    void main() {
       
        float cos_angle = cos(u_angle);
        float sin_angle = sin(u_angle);
        
        mat4 inverseTranslationMatrix = mat4(
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            -u_center.x, -u_center.y, 0.0, 1.0   
        );
            
        mat4 translationMatrix = mat4(
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            u_center.x + u_dv.x, u_center.y + u_dv.y, 0.0, 1.0   
        );
        
        mat4 scaleMatrix = mat4(
            u_scale.x, 0.0, 0.0, 0.0,
            0.0, u_scale.y, 0.0, 0.0,
            0.0, 0.0, 0.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        );
        
        mat4 rotationMatrix = mat4(
            cos_angle, sin_angle, 0.0, 0.0,
            -sin_angle, cos_angle, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        );
        
        gl_Position = translationMatrix * rotationMatrix * scaleMatrix * inverseTranslationMatrix * a_position;
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

function createShaderProgram(gl, vsSource, fsSource) {

    function compileShader(gl, type, source)  {
        const shader = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        return shader;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);

    gl.linkProgram(shaderProgram);

    return shaderProgram;
}