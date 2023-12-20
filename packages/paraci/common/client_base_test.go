package common

import (
	"testing"
)

func TestSignRequest(t *testing.T) {
	key := []byte("test")
	now := int64(1234567890)
	method := "GET"
	endpoint := "/api/v1/test"
	expected := "d202964900000000A+4O9kYhSl0+PsvDrF5QKQTBijmS1v75r3R8yUax3QY="
	if actual := signRequest(key, now, method, endpoint); actual != expected {
		t.Errorf("expected %v, got %v", expected, actual)
	}
}

func TestSignRequest2(t *testing.T) {
	key := []byte("")
	now := int64(0)
	method := "GET"
	endpoint := "/api/v1/test"
	expected := "00000000000000009dHPhwHVUBaSwaISRAO9BUYE9oVMPhORXIqcB1hS4yA="
	if actual := signRequest(key, now, method, endpoint); actual != expected {
		t.Errorf("expected %v, got %v", expected, actual)
	}
}
