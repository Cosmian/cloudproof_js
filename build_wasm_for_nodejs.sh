#!/bin/sh
set -exEu

CUR_DIR=$(pwd)
WASM_DIR=$(pwd)/tests/wasm_lib

build_wasm_bindgen() {
  REPO=$1
  CRATE_NAME=$2
  WASM_EXTENDED_PATH=$3
  GIT_TAG=v$(grep -r "${CRATE_NAME}" package.json|cut -d"^" -f2|cut -d"\"" -f1)

  pushd /tmp
  rm -rf "$CRATE_NAME"
  git clone "$REPO"
  cd "$CRATE_NAME"
  git checkout "${GIT_TAG}"
  wasm-pack build --target nodejs --release --features wasm_bindgen
  DEST_DIR="${WASM_DIR}/${WASM_EXTENDED_PATH}"
  rm -rf "${DEST_DIR}"
  mkdir -p "${DEST_DIR}"
  cp pkg/* "${DEST_DIR}/"
  popd
}

rm -rf "${WASM_DIR}"
build_wasm_bindgen git@github.com:Cosmian/abe_gpsw.git abe_gpsw abe/gpsw
build_wasm_bindgen git@github.com:Cosmian/cover_crypt.git cover_crypt abe/cover_crypt
build_wasm_bindgen git@gitlab.cosmian.com:core/findex.git findex findex

cd "${CUR_DIR}"
npm install
