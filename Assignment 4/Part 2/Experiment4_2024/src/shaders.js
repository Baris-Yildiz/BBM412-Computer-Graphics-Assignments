const vertexShader = `#version 300 es
    precision mediump float;
    in vec4 a_position;
    in vec3 a_normal;
    
    uniform float u_rotationAngle;
    uniform vec3 u_translation;
    uniform vec3 u_center;
    uniform mat4 u_projectionMatrix;
    uniform mat4 u_viewMatrix;
    
    out vec4 v_color;
    
    void main() {
        float cos_angle = cos(u_rotationAngle);
        float sin_angle = sin(u_rotationAngle);
        
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
            u_center.x + u_translation.x, u_center.y + u_translation.y, u_center.z + u_translation.z, 1.0   
        );
            
        mat4 rotationMatrix = mat4(cos_angle, 0.0, -sin_angle, 0.0,
            0.0, 1.0, 0.0, 0.0,
            sin_angle, 0.0, cos_angle, 0.0,
            0.0, 0.0, 0.0, 1.0
        );
       
        
        gl_Position = u_projectionMatrix * u_viewMatrix 
        * translationMatrix * rotationMatrix * inverseTranslationMatrix * a_position;
    }
`;

const fragmentShader = `#version 300 es
    precision mediump float;
    out vec4 color;
    void main() {
        color = vec4(1.0, 1.0, 1.0, 1.0);
    }
`;

function createShaderProgram(gl, vsSource, fsSource) {

    function compileShader(gl, type, source)  {
        const shader = gl.createShader(type);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

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