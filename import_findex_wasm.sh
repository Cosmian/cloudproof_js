#!/bin/sh
set -exE

rm -rf ./wasm_lib/findex ./wasm_lib/pkg
cp -R ../../findex/pkg ./wasm_lib/
mv ./wasm_lib/pkg ./wasm_lib/findex
