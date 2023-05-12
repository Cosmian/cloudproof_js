# -*- coding: utf-8 -*-
import urllib.request
import shutil
import ssl
import zipfile

from os import path, remove, getenv


def files_to_be_copied(name: str):
    """List of files to be copied"""
    source_dir = f'tmp/wasm32-unknown-unknown/{name}'
    return {
        f'{source_dir}/cloudproof_{name}.d.ts': f'src/pkg/{name}/cloudproof_{name}.d.ts',
        f'{source_dir}/cloudproof_{name}_bg.wasm': f'src/pkg/{name}/cloudproof_{name}_bg.wasm',
        f'{source_dir}/cloudproof_{name}.js': f'src/pkg/{name}/cloudproof_{name}.js',
        f'{source_dir}/cloudproof_{name}_bg.wasm.d.ts': f'src/pkg/{name}/cloudproof_{name}_bg.wasm.d.ts',
    }


def download_wasm(version: str) -> bool:
    """Download and extract wasm"""
    print(f"Download WASM {version}")

    ssl._create_default_https_context = ssl._create_unverified_context

    to_be_copied = files_to_be_copied('findex')
    to_be_copied.update(files_to_be_copied('cover_crypt'))
    to_be_copied.update(files_to_be_copied('fpe'))

    missing_files = False
    for key, value in to_be_copied.items():
        if not path.exists(value):
            missing_files = True
            break

    if not missing_files:
        print("Files are present, skip.")
        return True

    url = f'https://package.cosmian.com/cloudproof_rust/{version}/wasm.zip'
    try:
        r = urllib.request.urlopen(url)
        if r.getcode() != 200:
            print(f'Cannot get cloudproof_rust {version} ({r.getcode()})')
        else:
            if path.exists('tmp'):
                shutil.rmtree('tmp')
            if path.exists('wasm.zip'):
                remove('wasm.zip')

            open('wasm.zip', 'wb').write(r.read())
            with zipfile.ZipFile('wasm.zip', 'r') as zip_ref:
                zip_ref.extractall('tmp')
                for key, value in to_be_copied.items():
                    print(f'OK: copy {key} to {value}...')

                    shutil.copyfile(key, value)

                shutil.rmtree('tmp')
            remove('wasm.zip')

        return True
    # pylint: disable=broad-except
    except Exception as exception:
        print(f'Cannot get cloudproof_rust {version} ({exception})')
        return False

if __name__ == '__main__':
    ret = download_wasm('v2.0.0')
    if ret is False and getenv('GITHUB_ACTIONS'):
        download_wasm('last_build/fix/update_findex')
