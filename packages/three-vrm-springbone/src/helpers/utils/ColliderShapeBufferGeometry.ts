import * as THREE from 'three-r148';

export interface ColliderShapeBufferGeometry extends THREE.BufferGeometry {
  update: () => void;
}
