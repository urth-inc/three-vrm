import * as THREE from 'three';
import { VRMFirstPerson } from '../firstperson/VRMFirstPerson';
import { getWorldQuaternionLite } from '../utils/math';
import { VRMLookAtApplyer } from './VRMLookAtApplyer';

const VECTOR3_FRONT = Object.freeze(new THREE.Vector3(0.0, 0.0, -1.0));

const _v3A = new THREE.Vector3();
const _v3B = new THREE.Vector3();
const _v3C = new THREE.Vector3();
const _quat = new THREE.Quaternion();

/**
 * A class represents look at of a VRM.
 */
export class VRMLookAtHead {
  public static readonly EULER_ORDER = 'YXZ'; // yaw-pitch-roll

  /**
   * Associated [[VRMFirstPerson]], will be used for direction calculation.
   */
  public readonly firstPerson: VRMFirstPerson;

  /**
   * Associated [[VRMLookAtApplyer]], its look at direction will be applied to the model using this applier.
   */
  public readonly applyer?: VRMLookAtApplyer;

  /**
   * If this is true, its look at direction will be updated automatically by calling [[VRMLookAtHead.update]] (which is called from [[VRM.update]]).
   *
   * See also: [[VRMLookAtHead.setTarget]]
   */
  public autoUpdate = true;

  private _target?: THREE.Object3D;
  private _euler: THREE.Euler = new THREE.Euler(0.0, 0.0, 0.0, VRMLookAtHead.EULER_ORDER);

  /**
   * Create a new VRMLookAtHead.
   *
   * @param firstPerson A [[VRMFirstPerson]] that will be associated with this new VRMLookAtHead
   * @param applyer A [[VRMLookAtApplyer]] that will be associated with this new VRMLookAtHead
   */
  constructor(firstPerson: VRMFirstPerson, applyer?: VRMLookAtApplyer) {
    this.firstPerson = firstPerson;
    this.applyer = applyer;
  }

  public getTarget(): THREE.Object3D | undefined {
    return this._target;
  }

  public setTarget(target: THREE.Object3D): void {
    this._target = target;
  }

  /**
   * Get its look at direction in world coordinate.
   *
   * @param target A target `THREE.Vector3`
   */
  public getLookAtWorldDirection(target: THREE.Vector3): THREE.Vector3 {
    const rot = getWorldQuaternionLite(this.firstPerson.firstPersonBone, _quat);
    return target
      .copy(VECTOR3_FRONT)
      .applyEuler(this._euler)
      .applyQuaternion(rot);
  }

  /**
   * Set its look at position.
   * Note that its result will be instantly overwritten if [[VRMLookAtHead.autoUpdate]] is enabled.
   *
   * @param position A target position
   */
  public lookAt(position: THREE.Vector3): void {
    if (!this.applyer) {
      return;
    }

    const headPosition = this.firstPerson.getFirstPersonWorldPosition(_v3B);

    // Look at direction in world coordinate
    const lookAtDir = _v3C
      .copy(position)
      .sub(headPosition)
      .normalize();

    // Transform the direction into local coordinate from the first person bone
    lookAtDir.applyQuaternion(getWorldQuaternionLite(this.firstPerson.firstPersonBone, _quat).inverse());

    // convert the direction into euler
    this._euler.x = Math.atan2(lookAtDir.y, Math.sqrt(lookAtDir.x * lookAtDir.x + lookAtDir.z * lookAtDir.z));
    this._euler.y = Math.atan2(-lookAtDir.x, -lookAtDir.z);

    this.applyer.lookAt(this._euler);
  }

  /**
   * Update the VRMLookAtHead.
   * If [[VRMLookAtHead.autoUpdate]] is disabled, it will do nothing.
   */
  public update(): void {
    if (this._target && this.autoUpdate) {
      this.lookAt(this._target.getWorldPosition(_v3A));
    }
  }
}
