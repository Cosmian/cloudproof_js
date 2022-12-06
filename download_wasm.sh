#!/usr/bin/env bash

set -euxo pipefail

FINDEX_VERSION=v0.11.1
COVER_CRYPT_VERSION=v8.0.0

rm -rf src/pkg/findex
rm -rf src/pkg/cover_crypt

SOURCE=${BASH_SOURCE[0]}
DIR=$(cd -P "$(dirname "$SOURCE")" >/dev/null 2>&1 && pwd)

if [[ -z "${CI_JOB_TOKEN}" ]]; then
    if [[ -d "../findex" ]]; then
        pushd ../findex || exit
    else
        git clone git@gitlab.cosmian.com:core/findex.git /tmp/findex
        pushd /tmp/findex || exit
    fi

    git checkout $FINDEX_VERSION
    wasm-pack build --target web -d "$DIR/src/pkg/findex" --release --features wasm_bindgen
    popd || exit

    if [[ -d "../cover_crypt" ]]; then
        pushd ../cover_crypt || exit
    else
        git clone https://github.com/Cosmian/cover_crypt.git /tmp/cover_crypt
        pushd /tmp/cover_crypt || exit
    fi

    git checkout $COVER_CRYPT_VERSION
    wasm-pack build --target web -d "$DIR/src/pkg/cover_crypt" --release --features wasm_bindgen
    popd || exit
else
    curl --location --output artifacts.zip --header "JOB-TOKEN: $CI_JOB_TOKEN" "http://gitlab.cosmian.com/api/v4/projects/core%2Ffindex/jobs/artifacts/$FINDEX_VERSION/download?job=build_wasm"
    unzip -o -j artifacts.zip "pkg/bundler/*" -d src/pkg/findex

    curl --location --output artifacts.zip --header "JOB-TOKEN: $CI_JOB_TOKEN" "http://gitlab.cosmian.com/api/v4/projects/core%2Fcover_crypt/jobs/artifacts/$COVER_CRYPT_VERSION/download?job=build_wasm"
    unzip -o -j artifacts.zip "pkg/bundler/*" -d src/pkg/cover_crypt
fi
