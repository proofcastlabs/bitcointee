import { secp256k1 } from '@noble/curves/secp256k1';
const priv = secp256k1.utils.randomPrivateKey();
const pub = secp256k1.getPublicKey(priv);
const msg = new Uint8Array(32).fill(1); // message hash (not message) in ecdsa
const sig = secp256k1.sign(msg, priv); // `{prehash: true}` option is available
const isValid = secp256k1.verify(sig, msg, pub) === true;

// hex strings are also supported besides Uint8Arrays:
const privHex = '46c930bc7bb4db7f55da20798697421b98c4175a52c630294d75a84b9c126236';
const pub2 = secp256k1.getPublicKey(privHex);
