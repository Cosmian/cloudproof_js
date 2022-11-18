# curl --location --output artifacts.zip --header "JOB-TOKEN: $CI_JOB_TOKEN" "http://gitlab.cosmian.com/api/v4/projects/core%2Fcover_crypt/jobs/artifacts/v0.10.0/download?job=build_wasm"
curl --location --output artifacts.zip --header "JOB-TOKEN: $CI_JOB_TOKEN" "http://gitlab.cosmian.com/api/v4/projects/core%2Ffindex/jobs/86101/artifacts"
unzip -o -j artifacts.zip "pkg/bundler/*" -d src/pkg/findex

curl --location --output artifacts.zip --header "JOB-TOKEN: $CI_JOB_TOKEN" "http://gitlab.cosmian.com/api/v4/projects/core%2Fcover_crypt/jobs/86074/artifacts"
unzip -o -j artifacts.zip "pkg/bundler/*" -d src/pkg/cover_crypt