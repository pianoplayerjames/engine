import{b as e}from"./shaderStore-e8RCqiF-.js";const t=`meshUboDeclaration`,n=`#ifdef WEBGL2
uniform mat4 world;uniform float visibility;
#else
layout(std140,column_major) uniform;uniform Mesh
{mat4 world;float visibility;};
#endif
#define WORLD_UBO
`;e.IncludesShadersStore[t]||(e.IncludesShadersStore[t]=n);