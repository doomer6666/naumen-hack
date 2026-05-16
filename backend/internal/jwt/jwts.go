package jwt

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
		return []byte(""), fmt.Errorf("unable to set key")
	} // идентификатор ключа
	key.Set("use", "sig")
	key.Set("alg", "RS256")
	set := jwk.NewSet()
	set.AddKey(key)
	return json.Marshal(set)
}
