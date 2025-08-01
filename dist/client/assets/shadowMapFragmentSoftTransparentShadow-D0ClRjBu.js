import{b as e}from"./shaderStore-e8RCqiF-.js";const t=`shadowMapFragmentSoftTransparentShadow`,n=`#if SM_SOFTTRANSPARENTSHADOW==1
if ((bayerDither8(floor(((fragmentInputs.position.xy)%(8.0)))))/64.0>=uniforms.softTransparentShadowSM.x*alpha) {discard;}
#endif
`;e.IncludesShadersStoreWGSL[t]||(e.IncludesShadersStoreWGSL[t]=n);const r={name:t,shader:n};export{r as b};