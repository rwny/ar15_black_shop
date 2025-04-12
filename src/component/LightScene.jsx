import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'

export default function LightScene() {

    console.log('Experience.jsx loaded')
    const shadowArea = 100
    const shadowMapSize = 2048 * 4

    return <>

        <Perf position="top-left" />

        <OrbitControls makeDefault />

        <directionalLight 
            position={ [ 20, 40, 30 ] } 
            intensity={ 4 } 
            castShadow 
            shadow-normalBias={ 0.01 }
            shadow-bias={ -0.001 }

            shadow-camera-far={100}
            shadow-mapSize-width={ shadowMapSize }
            shadow-mapSize-height={ shadowMapSize }
            shadow-camera-left={-shadowArea}
            shadow-camera-right={shadowArea}
            shadow-camera-top={shadowArea}
            shadow-camera-bottom={-shadowArea}
        />

        <directionalLight position={ [ -10, 20, -30 ] } intensity={ 2 } shadow-normalBias={ 0.04 } />

        <ambientLight intensity={ 2 } />

        <mesh receiveShadow position-y={ - 0.1 } rotation-x={ - Math.PI * 0.5 } scale={ 50 }>
            <planeGeometry />
            <meshStandardMaterial color="greenyellow" />
        </mesh>

    </>
}