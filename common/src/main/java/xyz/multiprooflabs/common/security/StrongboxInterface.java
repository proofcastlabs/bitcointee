package xyz.multiprooflabs.common.security;

import java.io.IOException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;

public interface StrongboxInterface {
    boolean keystoreIsInitialized() throws CertificateException, IOException, NoSuchAlgorithmException, KeyStoreException;
    void initializeKeystore();
    String getCertificateAttestation();
    byte[] signWithAttestationKey(byte[] data);
    byte[] encrypt(byte[] data);
    byte[] decrypt(byte[] data);
}