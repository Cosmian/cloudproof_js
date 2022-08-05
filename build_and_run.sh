#!/bin/sh
set -exE

if [ -z "$1" ]; then
  JSLIB_DIR=$(pwd)
else
  JSLIB_DIR=$1
fi

if [ -z "$2" ]; then
  # set the parent dir as default
  WASM_LIBS_DIR=$(dirname "$JSLIB_DIR")
else
  WASM_LIBS_DIR=$2
fi

build_wasm_bindgen() {
  SRC_DIR=$1
  DEST_DIR=$2
  GIT_TAG=$3

  cd $SRC_DIR
  git checkout $GIT_TAG
  rm -rf pkg
  wasm-pack build --release --features wasm_bindgen
  rm -rf ${DEST_DIR}
  mkdir -p "$(dirname "${DEST_DIR}")"
  cp -r pkg ${DEST_DIR}
}

rm -rf ${JSLIB_DIR}/wasm_lib
build_wasm_bindgen ${WASM_LIBS_DIR}/abe_gpsw ${JSLIB_DIR}/wasm_lib/abe/gpsw v0.8.0
build_wasm_bindgen ${WASM_LIBS_DIR}/cover_crypt ${JSLIB_DIR}/wasm_lib/abe/cover_crypt v3.0.1

cd ${JSLIB_DIR}
npm install
npx webpack serve
