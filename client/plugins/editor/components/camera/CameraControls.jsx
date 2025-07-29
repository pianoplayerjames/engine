import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Euler } from 'three';
import { useSnapshot } from 'valtio';
import { inputState } from '@/plugins/input/store.js';
import { editorState, editorActions } from '@/plugins/editor/store.js';

export default function CameraControls() {
  const { camera } = useThree();
  const input = useSnapshot(inputState);
  const { camera: cameraState } = useSnapshot(editorState);
  
  const velocity = useRef(new Vector3());
  const euler = useRef(new Euler(0, 0, 0, 'YXZ'));
  const isPointerLocked = useRef(false);
  const mouseMovement = useRef({ x: 0, y: 0 });
  
  // Camera settings
  const moveSpeed = cameraState.speed || 5;
  const mouseSensitivity = cameraState.mouseSensitivity || 0.002;
  const fastMultiplier = 3;
  const slowMultiplier = 0.3;
  
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!isPointerLocked.current) return;
      
      mouseMovement.current.x = event.movementX * mouseSensitivity;
      mouseMovement.current.y = event.movementY * mouseSensitivity;
    };
    
    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement !== null;
    };
    
    const handleKeyDown = (event) => {
      // Right mouse button for camera control
      if (event.button === 2) {
        event.preventDefault();
        document.body.requestPointerLock();
      }
    };
    
    const handleMouseUp = (event) => {
      if (event.button === 2) {
        document.exitPointerLock();
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousedown', handleKeyDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousedown', handleKeyDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseSensitivity]);
  
  useFrame((state, delta) => {
    if (!isPointerLocked.current) return;
    
    // Get current camera rotation
    euler.current.setFromQuaternion(camera.quaternion);
    
    // Apply mouse movement to rotation
    euler.current.y -= mouseMovement.current.x;
    euler.current.x -= mouseMovement.current.y;
    
    // Clamp vertical rotation
    euler.current.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.current.x));
    
    // Apply rotation to camera
    camera.quaternion.setFromEuler(euler.current);
    
    // Reset mouse movement
    mouseMovement.current.x = 0;
    mouseMovement.current.y = 0;
    
    // Calculate movement
    const direction = new Vector3();
    const right = new Vector3();
    const up = new Vector3(0, 1, 0);
    
    // Get camera forward and right vectors
    camera.getWorldDirection(direction);
    right.crossVectors(direction, up).normalize();
    
    // Reset velocity
    velocity.current.set(0, 0, 0);
    
    // WASD movement
    if (input.keys.KeyW) {
      velocity.current.add(direction.clone().multiplyScalar(moveSpeed));
    }
    if (input.keys.KeyS) {
      velocity.current.add(direction.clone().multiplyScalar(-moveSpeed));
    }
    if (input.keys.KeyA) {
      velocity.current.add(right.clone().multiplyScalar(-moveSpeed));
    }
    if (input.keys.KeyD) {
      velocity.current.add(right.clone().multiplyScalar(moveSpeed));
    }
    
    // Vertical movement (Q/E keys)
    if (input.keys.KeyQ) {
      velocity.current.y -= moveSpeed;
    }
    if (input.keys.KeyE) {
      velocity.current.y += moveSpeed;
    }
    
    // Speed modifiers
    let speedMultiplier = 1;
    if (input.keys.ShiftLeft || input.keys.ShiftRight) {
      speedMultiplier = fastMultiplier;
    }
    if (input.keys.AltLeft || input.keys.AltRight) {
      speedMultiplier = slowMultiplier;
    }
    
    // Apply movement
    velocity.current.multiplyScalar(speedMultiplier * delta);
    camera.position.add(velocity.current);
  });
  
  return null;
}