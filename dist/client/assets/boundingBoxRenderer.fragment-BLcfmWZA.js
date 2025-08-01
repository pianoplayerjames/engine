import{b as e}from"./shaderStore-e8RCqiF-.js";const t=`boundingBoxRendererFragmentDeclaration`,n=`uniform vec4 color;
`;e.IncludesShadersStore[t]||(e.IncludesShadersStore[t]=n);const r=`boundingBoxRendererPixelShader`,i=`#include<__decl__boundingBoxRendererFragment>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
gl_FragColor=color;
#define CUSTOM_FRAGMENT_MAIN_END
}`;e.ShadersStore[r]||(e.ShadersStore[r]=i);const a={name:r,shader:i};export{a as b};