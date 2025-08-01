import{b as e}from"./shaderStore-e8RCqiF-.js";const t=`logDepthFragment`,n=`#ifdef LOGARITHMICDEPTH
gl_FragDepthEXT=log2(vFragmentDepth)*logarithmicDepthConstant*0.5;
#endif
`;e.IncludesShadersStore[t]||(e.IncludesShadersStore[t]=n);