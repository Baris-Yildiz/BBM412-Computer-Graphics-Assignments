const sphereVertexShader = `#version 300 es
            precision mediump float;
            in vec4 vPosition;
            in vec2 vTexCoords;
            in vec4 vNormal;
            in vec4 vTangent;
            
            uniform mat4 modelView;
            uniform mat4 projection;
            uniform mat4 normalMatrix;
            
            out vec4 fPosition;
            out vec2 fTexCoords;
            out vec4 fNormal;
            out mat3 fTBN;
            
            void main() {
                vec3 N = normalize(normalMatrix * vNormal).xyz;
                vec3 T = normalize(normalMatrix * vTangent).xyz;
                vec3 B = normalize(cross(N, T));
                fTBN = mat3(T,B,N);
            
                fPosition = modelView * vPosition;
                fTexCoords = vTexCoords;
                fNormal = normalMatrix * vNormal;
                gl_Position = projection * modelView * vPosition;
            }
        `

const sphereFragmentShader = `#version 300 es
            precision mediump float;
            in vec2 fTexCoords;
            in vec4 fPosition;
            in vec4 fNormal;
            in mat3 fTBN;
            
            uniform sampler2D albedoTexture;
            uniform sampler2D normalTexture;
            uniform sampler2D metallicTexture;
            uniform sampler2D roughnessTexture;
            uniform sampler2D aoTexture;
            
            uniform vec4 lightPosition;
            uniform float lightIntensity;
            
            out vec4 oColor;
            
            const float PI = 3.14159265359;
           
            vec3 F_Schlick(vec3 h, vec3 v, vec3 F0) {
                float HDotVProduct = 1.0 - max(dot(h, v), 0.0);
                float clamped = clamp(HDotVProduct, 0.0, 1.0);
                return F0 + (1.0 - F0) * pow(clamped, 5.0);
            }
            
            float NDF(vec3 n, vec3 h, float roughness) {
                float alphaSquared = pow(roughness, 4.0);
                float dotProduct = pow( max(dot(n,h), 0.0) , 2.0);
                float denominator = PI * pow(dotProduct * (alphaSquared - 1.0) + 1.0, 2.0);
                return alphaSquared / denominator;
            }
            
            float G_Schlick(vec3 n, vec3 v, float roughness) {
                float k = pow(roughness + 1.0, 2.0) / 8.0;
                float dotProduct = max(dot(n, v), 0.0000001);
                float denominator = dotProduct * (1.0 - k) + k;
                return dotProduct / denominator; 
            }
            
            float G_Smith(vec3 n, vec3 v, vec3 l, float roughness) {
                return G_Schlick(n, v, roughness) * G_Schlick(n, l, roughness);
            }
            
            void main() {
                vec3 albedo = pow(texture(albedoTexture, fTexCoords).rgb, vec3(2.2));
               
                vec3 N = texture(normalTexture, fTexCoords).rgb * 2.0 - 1.0;
                N = normalize(fTBN * N);
                
                float metallic  = texture(metallicTexture, fTexCoords).r;
                float roughness = texture(roughnessTexture, fTexCoords).r;
                float ao = texture(aoTexture, fTexCoords).r;
                
                vec3 L = normalize(lightPosition.xyz - fPosition.xyz);
                vec3 V = normalize(-fPosition.xyz);
                vec3 H = normalize(V + L);
                
                vec3 F_0 = mix(vec3(0.04), albedo, metallic);
                
                float dist = length(lightPosition - fPosition);
                float attenuation = 1.0 / pow(dist, 2.0);
                vec3 radiance = vec3(1.0, 1.0, 1.0) * attenuation;
                
                vec3 F = F_Schlick(H, V, F_0);
                vec3 specular = (NDF(N, H, roughness) * G_Smith(N, V, L, roughness) * F) / 
                (4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001);
                
                vec3 kD = (vec3(1.0) - F) * (1.0 - metallic);
                
                vec3 specularPlusDiffuse = lightIntensity * (kD * albedo / PI + specular) * radiance * max(dot(N, L), 0.0);
                vec3 ambient = vec3(0.03) * albedo * ao;
                
                vec3 color = ambient + specularPlusDiffuse;
                
                color = color / (color + vec3(1.0));
                color = pow(color, vec3(1.0/2.2));
                
                oColor = vec4(color, 1.0);
                
            }
        `

const plantVertexShader = `#version 300 es
            precision mediump float;
            in vec4 vPosition;
            in vec2 vTexCoords;
            in vec4 vNormal;
            
            in float v_ns;
            in vec3 v_ka;
            in vec3 v_kd;
            in vec3 v_ks;
            
            uniform mat4 modelView;
            uniform mat4 projection;
            uniform mat4 normalMatrix;
            
            out vec4 fPosition;
            out vec2 fTexCoords;
            out vec4 fNormal;
            
            out float f_ns;
            out vec3 f_ka;
            out vec3 f_kd;
            out vec3 f_ks;
            
            void main() {
                fPosition = modelView * vPosition;
                fTexCoords = vTexCoords;
                fNormal = normalMatrix * vNormal;
                f_ns = v_ns;
                f_ka = v_ka;
                f_kd = v_kd;
                f_ks = v_ks;
                gl_Position = projection * modelView * vPosition;
            }
        `

const plantFragmentShader = `#version 300 es
            precision mediump float;
            in vec2 fTexCoords;
            in vec4 fPosition;
            in vec4 fNormal;
            
            in float f_ns;
            in vec3 f_ka;
            in vec3 f_kd;
            in vec3 f_ks;
            
            uniform sampler2D albedoTexture;
            uniform sampler2D normalTexture;
            
            uniform vec4 lightPosition;
            uniform float lightIntensity;
            
            out vec4 oColor;
            
            const float PI = 3.14159265359;
            
            vec3 normalFromTexture()
            {
                vec3 normal = texture(normalTexture, fTexCoords).xyz * 2.0 - 1.0;
            
                vec3 x1  = dFdx(fPosition).xyz;
                vec2 uv1 = dFdx(fTexCoords).xy;
                
                vec3 x2  = dFdy(fPosition).xyz;
                vec2 uv2 = dFdy(fTexCoords).xy;
            
                vec3 N  = normalize(fNormal).xyz;
                vec3 T  = normalize(x1 * uv2.y - x2 * uv1.y);
                vec3 B  = -normalize(cross(N, T));
            
                return normalize(mat3(T, B, N) * normal);
            }
            
            void main() {
                vec3 albedo = texture(albedoTexture, fTexCoords).rgb;
                vec3 N = normalFromTexture();

                vec3 L = normalize(lightPosition.xyz - fPosition.xyz);
                vec3 V = -normalize(fPosition.xyz);
                vec3 H = normalize(V + L);
                
                float dist = length(lightPosition - fPosition);
                float attenuation = 1.0 / pow(dist, 2.0);
                
                vec3 ambient = f_ka;
                vec3 diffuse = f_kd * max(dot(L, N), 0.0);
                
                vec3 specular = f_ks * pow( max(dot (N, H), 0.0 ), f_ns );
                
                vec3 color = (ambient + specular + diffuse) * attenuation * lightIntensity;
                color *= albedo;

                oColor = vec4(color, 1.0);
            }
        `

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