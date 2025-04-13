import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, ContactShadows } from "@react-three/drei";
import AR15 from "./component/AR15";
import Sidebar from "./component/Sidebar";
import { useState } from "react";
import * as THREE from "three";
import "./styles.css";

function App() {
  const [selectedObjectInfo, setSelectedObjectInfo] = useState(null);
  const [ifcData, setIfcData] = useState(null);

  const handleObjectClick = (objectInfo, ifc = null) => {
    setSelectedObjectInfo(objectInfo);
    setIfcData(ifc);
  };

  return (
    <div className="app-container">
      <div className="canvas-container">
        <Canvas 
         shadows 
         camera={{ position: [-25,10,25], fov: 50 }}
         gl={{ 
           antialias: true,
           shadowMap: true,
           shadowMapType: THREE.PCFSoftShadowMap
         }}
         >

          <color attach="background" args={["steelblue"]} />

          <ambientLight intensity={0.4} />
          
          {/* Remove the shadows prop from Stage as it's causing the error */}
          <Stage 
            environment="city" 
            intensity={0.5} 
            adjustCamera={false}
            preset="rembrandt"
          >
            <AR15 onObjectClick={handleObjectClick} />
          </Stage>
          
          {/* Add a directional light with shadows for better control */}
          <directionalLight
            position={[5, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          
          <ContactShadows 
            position={[0, -0.01, 0]} 
            opacity={0.6} 
            scale={40} 
            blur={2} 
            far={4} 
            resolution={256}
          />

          <OrbitControls 
            makeDefault
            minPolarAngle={Math.PI/4} // Less restrictive minimum angle
            maxPolarAngle={Math.PI/1.845} // Less restrictive maximum angle
            enableZoom={true}
            zoomSpeed={1.2}
            enablePan={true}
            panSpeed={1.0}
            rotateSpeed={0.8}
            dampingFactor={0.1}
            enableDamping={true} // Add damping for smoother controls
            target={[0, 0, 0]} // Set the target point to look at
          />

        </Canvas>
      </div>
      <Sidebar objectInfo={selectedObjectInfo} ifcData={ifcData} />
    </div>
  );
}

// Make sure to add this default export
export default App;

