import { Fr, Point } from '@aztec/foundation/fields';
import { Grumpkin, pedersenPlookupCommitInputs } from '@aztec/circuits.js/barretenberg';
import { CircuitsWasm } from '@aztec/circuits.js';

/**
 * A point in the format that noir uses.
 */
export type NoirPoint = {
  /** The x coordinate. */
  x: bigint;
  /** The y coordinate. */
  y: bigint;
};

/**
 * Computes the resulting storage slot for an entry in a mapping.
 * @param mappingSlot - The slot of the mapping within state.
 * @param owner - The key of the mapping.
 * @param bbWasm - Wasm module for computing.
 * @returns The slot in the contract storage where the value is stored.
 */
export function computeSlotForMapping(mappingSlot: Fr, owner: NoirPoint | Fr, bbWasm: CircuitsWasm) {
  const isFr = (owner: NoirPoint | Fr): owner is Fr => typeof (owner as Fr).value === 'bigint';
  const ownerField = isFr(owner) ? owner : new Fr(owner.x);

  return Fr.fromBuffer(
    pedersenPlookupCommitInputs(
      bbWasm,
      [mappingSlot, ownerField].map(f => f.toBuffer()),
    ),
  );
}

/**
 * Computes the public key for a private key.
 * @param privateKey - The private key.
 * @param grumpkin - The grumpkin instance.
 * @returns The public key.
 */
export function toPublicKey(privateKey: Buffer, grumpkin: Grumpkin): NoirPoint {
  const buf = grumpkin.mul(Grumpkin.generator, privateKey);
  const point = Point.fromBuffer(buf);
  return {
    x: point.x.toBigInt(),
    y: point.y.toBigInt(),
  };
}
