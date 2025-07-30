// Component for rendering 3D model objects in the scene
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { GLTFLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { FBXLoader } from 'three-stdlib';
import { projectManager } from '@/plugins/projects/projectManager.js';
import { SimpleEdgeOutline } from '@/components/SelectionOutline.jsx';
import * as THREE from 'three';

function ModelObject({ sceneObj, isSelected, onClick }) {
  const groupRef = useRef();
  const [model, setModel] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupRef.current && sceneObj.id) {
      groupRef.current.userData.sceneObjectId = sceneObj.id;
    }
  }, [sceneObj.id]);

  useEffect(() => {
    if (sceneObj.assetPath) {
      loadModel();
    }
  }, [sceneObj.assetPath]);

  const loadModel = async () => {
    if (!sceneObj.assetPath) return;

    try {
      setLoading(true);
      setError(null);

      const currentProject = projectManager.getCurrentProject();
      const url = `/api/projects/${currentProject.name}/assets/file/${sceneObj.assetPath}`;
      
      // Determine file extension
      const extension = sceneObj.assetPath.split('.').pop().toLowerCase();
      
      let loader;
      switch (extension) {
        case 'gltf':
        case 'glb':
          loader = new GLTFLoader();
          break;
        case 'obj':
          loader = new OBJLoader();
          break;
        case 'fbx':
          loader = new FBXLoader();
          break;
        default:
          throw new Error(`Unsupported model format: ${extension}`);
      }

      // Load the model
      loader.load(
        url,
        (result) => {
          const loadedModel = result.scene || result;
          
          // Center and scale the model
          const box = new THREE.Box3().setFromObject(loadedModel);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          
          // Normalize size - make the largest dimension 1 unit
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = maxDim > 0 ? 1 / maxDim : 1;
          
          loadedModel.scale.setScalar(scale);
          loadedModel.position.sub(center.multiplyScalar(scale));
          
          // Store original materials for outline system
          loadedModel.traverse((child) => {
            if (child.isMesh && !child.userData.originalMaterial) {
              child.userData.originalMaterial = child.material;
            }
          });
          
          setModel(loadedModel);
          setLoading(false);
        },
        undefined, // onProgress
        (error) => {
          console.error('Error loading model:', error);
          setError(error.message);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Model loading error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Get all mesh objects for outline rendering
  const meshObjects = useMemo(() => {
    if (!model) return [];
    
    const meshes = [];
    model.traverse((child) => {
      if (child.isMesh) {
        meshes.push(child);
      }
    });
    return meshes;
  }, [model]);

  if (!sceneObj.visible) return null;

  return (
    <group
      ref={groupRef}
      position={sceneObj.position}
      rotation={sceneObj.rotation}
      scale={sceneObj.scale}
      onClick={onClick}
      userData={{ sceneObjectId: sceneObj.id }}
    >
      {loading && (
        // Loading placeholder - a wireframe box
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial wireframe color="#666666" />
        </mesh>
      )}
      
      {error && (
        // Error placeholder - red box with X
        <group>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ff4444" />
          </mesh>
          <lineSegments>
            <bufferGeometry attach="geometry">
              <bufferAttribute
                attach="attributes-position"
                count={4}
                array={new Float32Array([
                  -0.5, -0.5, 0.51, 0.5, 0.5, 0.51,
                  0.5, -0.5, 0.51, -0.5, 0.5, 0.51
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffffff" linewidth={2} />
          </lineSegments>
        </group>
      )}
      
      {model && !loading && !error && (
        <>
          <primitive object={model} />
          {/* Render outlines for each mesh when selected */}
          {isSelected && meshObjects.map((mesh, index) => (
            <SimpleEdgeOutline 
              key={`outline-${index}`} 
              object={mesh} 
              isSelected={true} 
            />
          ))}
        </>
      )}
    </group>
  );
}

export default ModelObject;