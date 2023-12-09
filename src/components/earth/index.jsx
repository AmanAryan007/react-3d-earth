import React, { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import EarthDayMap from "../../assets/textures/8k_earth_daymap.jpg";
import EarthNormalMap from "../../assets/textures/8k_earth_normal_map.jpg";
import EarthSpecularMap from "../../assets/textures/8k_earth_specular_map.jpg";
import EarthCloudsMap from "../../assets/textures/8k_earth_clouds.jpg";
import SatelliteTexture from "../../assets/textures/Full Moon 8k Wallpapers _ hdqwalls_com.jpeg";
import { TextureLoader } from "three";

export function Earth(props) {
  const [colorMap, normalMap, specularMap, cloudsMap, satelliteTexture] =
    useLoader(TextureLoader, [
      EarthDayMap,
      EarthNormalMap,
      EarthSpecularMap,
      EarthCloudsMap,
      SatelliteTexture,
    ]);

  const earthRef = useRef();
  const cloudsRef = useRef();
  const satelliteRef = useRef();
  const orbitPathRef = useRef();

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();

    // Earth rotation
    earthRef.current.rotation.y = elapsedTime / 6;
    cloudsRef.current.rotation.y = elapsedTime / 6;

    // Satellite orbit around Earth
    const orbitRadiusX = 5;
    const orbitRadiusY = 3;
    const orbitSpeed = 0.3;

    const satelliteX = Math.cos(elapsedTime * orbitSpeed) * orbitRadiusX;
    const satelliteZ = Math.sin(elapsedTime * orbitSpeed) * orbitRadiusY;

    satelliteRef.current.position.set(satelliteX, 0.5, satelliteZ);

    // Update the elliptical path points
    const points = [];
    const segments = 64;

    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * 2 * Math.PI;
      const x = Math.cos(theta) * orbitRadiusX;
      const z = Math.sin(theta) * orbitRadiusY;

      points.push(new THREE.Vector3(x, 0.5, z));
    }

    // Close the elliptical path
    points.push(points[0]);

    orbitPathRef.current.geometry.setFromPoints(points);
  });

  return (
    <>
      <pointLight color="#f6f3ea" position={[2, 0, 5]} intensity={1.2} castShadow={false} />
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade={true} />

      {/* Elliptical Path */}
      <line ref={orbitPathRef} position={[0, 0.5, 0]}>
        {/* Adjusted initial position */}
        <bufferGeometry />
        <lineBasicMaterial color={0xffffff} />
      </line>

      {/* Earth */}
      <mesh ref={earthRef} position={[0, 0.5, 0]} castShadow receiveShadow={false}>
        {/* Adjusted initial position */}
        <sphereGeometry args={[1, 32, 32]} />
        <meshPhongMaterial specularMap={specularMap} />
        <meshStandardMaterial map={colorMap} normalMap={normalMap} metalness={0.4} roughness={0.7} />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef} position={[0, 0.5, 0]} castShadow receiveShadow={false}>
        <sphereGeometry args={[1.005, 32, 32]} />
        <meshPhongMaterial map={cloudsMap} opacity={0.4} depthWrite={true} transparent={true} side={THREE.DoubleSide} />
      </mesh>

      {/* Satellite */}
      <mesh ref={satelliteRef} position={[0, 0.5, 0]} castShadow receiveShadow={false}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial map={satelliteTexture} />
      </mesh>

      <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} zoomSpeed={0.6} panSpeed={0.5} rotateSpeed={0.4} />
    </>
  );
}
