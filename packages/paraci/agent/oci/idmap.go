package oci

import (
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"syscall"
)

// IDRemap provides UID & GID remapping for OCI bundles
func IDRemap(uidMap map[int]int, gidMap map[int]int, fsPath string) error {
	return filepath.Walk(fsPath, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}
		fStat, ok := info.Sys().(*syscall.Stat_t)
		if !ok || fStat == nil {
			return fmt.Errorf("failed to get file stat for %s", path)
		}
		newUid := fStat.Uid
		newGid := fStat.Gid
		if id, ok := uidMap[int(fStat.Uid)]; ok {
			newUid = uint32(id)
		}
		if id, ok := gidMap[int(fStat.Gid)]; ok {
			newGid = uint32(id)
		}
		err = os.Chown(path, int(newUid), int(newGid))
		if err != nil {
			return err
		}
		return nil
	})
}
