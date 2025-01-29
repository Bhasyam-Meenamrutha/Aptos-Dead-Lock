var bip39 = require("bip39");
var hdkey = require("hdkey");
var createHash = require("create-hash");
var bs58check = require("bs58check");

// For mainnet: 00 / testnet: 6f version byte
var versionByte = '6f'; // Testnet version byte

// Enter your mnemonic
const mnemonic = "crazy horse battery bakery stapled fresh dolittle height"; // Generates string
const seed = bip39.mnemonicToSeed(mnemonic); // Creates seed buffer

seed.then(seedValue => {
    console.log('Seed value:', seedValue.toString('hex'));

    // Derive the root HD key from the seed
    const root = hdkey.fromMasterSeed(seedValue);
    console.log('Root:', root);

    // Get the master private key
    const masterPrivateKey = root.privateKey.toString('hex');
    console.log('Master private key:', masterPrivateKey);

    // Derive the address at path m/44'/0'/0'/0/10
    const addrnode = root.derive("m/44'/0'/0'/0/10");

    // Get the derived public key
    const publicKey = addrnode._publicKey;
    console.log('Public key derived:', publicKey.toString('hex'));

    // Get the derived private key
    const privateKey = addrnode._privateKey;
    console.log('Private key derived:', privateKey.toString('hex'));

    // Step 1: SHA-256 hash of the public key
    const step2 = createHash('sha256').update(publicKey).digest();
    console.log('Step 2 (SHA-256 of public key):', step2.toString('hex'));

    // Step 2: RIPEMD-160 hash of the SHA-256 hash
    const step3 = createHash('rmd160').update(step2).digest();
    console.log('Step 3 (RIPEMD-160 of SHA-256):', step3.toString('hex'));

    // Step 3: Add version byte (testnet: 0x6f)
    const step4 = Buffer.concat([Buffer.from(versionByte, 'hex'), step3]);
    console.log('Step 4 (Version byte + RIPEMD-160):', step4.toString('hex'));

    // Step 4: Base58Check encoding
    // const address = bs58check.encode(step4);
    // console.log('Final Bitcoin address:', address);
});