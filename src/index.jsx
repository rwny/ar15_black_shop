import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'

import App from './component/App.jsx'

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
    <Canvas
        shadows
        camera={ {
            fov: 45,
            near: 0.1,
            far: 200,
            position: [ - 20, 20, 20 ]
        } }
    >
        <App />
    </Canvas>
)