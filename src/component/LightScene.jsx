import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'

export default function LightScene()
{
    console.log('Experience.jsx loaded')
    return <>

        <Perf position="top-left" />

        <OrbitControls makeDefault />

        <directionalLight castShadow position={ [ 1, 2, 3 ] } intensity={ 4.5 } shadow-normalBias={ 0.04 } />
        <ambientLight intensity={ 1.5 } />

        <mesh receiveShadow position-y={ - 1 } rotation-x={ - Math.PI * 0.5 } scale={ 10 }>
            <planeGeometry />
            <meshStandardMaterial color="greenyellow" />
        </mesh>

    </>
}