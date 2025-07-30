// Selection outline system for 3D objects
import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { EffectComposer, RenderPass, OutlinePass } from 'three-stdlib';
import * as THREE from 'three';

// Extend for JSX usage
extend({ EffectComposer, RenderPass, OutlinePass });

function SelectionOutline({ selectedObjects = [] }) {
  const { scene, camera, gl, size } = useThree();
  const composerRef = useRef();
  const outlinePassRef = useRef();

  // Create effect composer
  const [composer, _renderPass, outlinePass] = useMemo(() => {
    const composer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    const outlinePass = new OutlinePass(
      new THREE.Vector2(size.width, size.height),
      scene,
      camera
    );

    // Configure outline appearance
    outlinePass.edgeStrength = 3.0;
    outlinePass.edgeGlow = 0.5;
    outlinePass.edgeThickness = 2.0;
    outlinePass.pulsePeriod = 0;
    outlinePass.visibleEdgeColor = new THREE.Color('#ffff00'); // Yellow
    outlinePass.hiddenEdgeColor = new THREE.Color('#ffff00');

    composer.addPass(renderPass);
    composer.addPass(outlinePass);

    return [composer, renderPass, outlinePass];
  }, [gl, scene, camera, size]);

  // Update composer references
  useEffect(() => {
    composerRef.current = composer;
    outlinePassRef.current = outlinePass;
  }, [composer, outlinePass]);

  // Update selected objects
  useEffect(() => {
    if (outlinePass && selectedObjects.length > 0) {
      // Filter out null/undefined objects
      const validObjects = selectedObjects.filter(obj => obj && obj.type);
      outlinePass.selectedObjects = validObjects;
    } else if (outlinePass) {
      outlinePass.selectedObjects = [];
    }
  }, [selectedObjects, outlinePass]);

  // Handle resize
  useEffect(() => {
    if (composer && outlinePass) {
      composer.setSize(size.width, size.height);
      outlinePass.setSize(size.width, size.height);
    }
  }, [size, composer, outlinePass]);

  // Render on every frame
  useFrame(() => {
    if (composer) {
      composer.render();
    }
  }, 1); // Low priority to render after main scene

  return null;
}

// Alternative: Simple Edge Outline Component (fallback if OutlinePass has issues)
function SimpleEdgeOutline({ object, isSelected }) {
  const edgesRef = useRef();
  const materialRef = useRef();

  // Cache the edges geometry to avoid recreation
  const edges = useMemo(() => {
    if (!object || !object.geometry) return null;
    
    try {
      const geometry = object.geometry;
      // Create edges with a higher threshold for cleaner lines
      const edges = new THREE.EdgesGeometry(geometry, 1);
      return edges;
    } catch (error) {
      console.warn('Failed to create edges for object:', error);
      return null;
    }
  }, [object?.geometry]); // Only recalculate if geometry changes

  // Create material once and reuse
  const material = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: '#ffff00',
      linewidth: 3, // Increased for better visibility
      transparent: true,
      opacity: 0.9,
      depthTest: false,
      toneMapped: false // Prevent tone mapping for consistent colors
    });
  }, []);

  useEffect(() => {
    if (edgesRef.current) {
      edgesRef.current.visible = isSelected;
    }
  }, [isSelected]);

  // Cleanup geometry on unmount
  useEffect(() => {
    return () => {
      if (edges) {
        edges.dispose();
      }
      if (material) {
        material.dispose();
      }
    };
  }, [edges, material]);

  if (!edges || !isSelected) return null;

  return (
    <lineSegments ref={edgesRef} geometry={edges} material={material} />
  );
}

// Glow outline using scale and transparency
function GlowOutline({ children, isSelected, glowColor = '#ffff00', glowIntensity = 0.3 }) {
  if (!isSelected) return children;

  return (
    <group>
      {children}
      {/* Glow effect - slightly larger transparent version */}
      <group scale={[1.02, 1.02, 1.02]}>
        {React.cloneElement(children, {
          children: [
            React.cloneElement(children.props.children[0]), // geometry
            <meshBasicMaterial
              key="glow-material"
              color={glowColor}
              transparent={true}
              opacity={glowIntensity}
              side={THREE.BackSide}
            />
          ]
        })}
      </group>
    </group>
  );
}

export { SelectionOutline, SimpleEdgeOutline, GlowOutline };
export default SelectionOutline;