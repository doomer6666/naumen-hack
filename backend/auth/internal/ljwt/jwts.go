package ljwt

import (
	"crypto/rsa"
	"encoding/json"
	"fmt"

	"github.com/lestrrat-go/jwx/v2/jwk"
)

func PublicKeyToJWKS(pubKey *rsa.PublicKey) ([]byte, error) {
	key, err := jwk.FromRaw(pubKey)
	if err != nil {
		return nil, err
	}

	if err := key.Set("kid", "auth-service-key"); err != nil {
		return []byte(""), fmt.Errorf("unable to set kid: %w", err)
	} // идентификатор ключа

	if err := key.Set("use", "sig"); err != nil {
		return []byte(""), fmt.Errorf("unable to set use: sig: %w", err)
	}

	if err := key.Set("alg", "RS256"); err != nil {
		return []byte(""), fmt.Errorf("unable to set alg: %w", err)
	}

	set := jwk.NewSet()

	if err := set.AddKey(key); err != nil {
		return []byte(""), fmt.Errorf("unable to add key to set: %w", err)
	}

	return json.Marshal(set)
}
