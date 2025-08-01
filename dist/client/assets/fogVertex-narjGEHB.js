import{b as e}from"./shaderStore-e8RCqiF-.js";const t=`fogVertex`,n=`#ifdef FOG
vFogDistance=(view*worldPos).xyz;
#endif
`;e.IncludesShadersStore[t]||(e.IncludesShadersStore[t]=n);