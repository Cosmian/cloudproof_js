# -*- coding: utf-8 -*-
import urllib.request
import shutil
import ssl
import zipfile

from os import path, remove, getenv


def download_wasm(name: str, version: str, destination: str) -> bool:
    ssl._create_default_https_context = ssl._create_unverified_context

    to_be_copied = {
        f'tmp/wasm32-unknown-unknown/cosmian_{name}.d.ts': f'{destination}/{name}/cosmian_{name}.d.ts',
        f'tmp/wasm32-unknown-unknown/cosmian_{name}_bg.wasm': f'{destination}/{name}/cosmian_{name}_bg.wasm',
        'tmp/wasm32-unknown-unknown/LICENSE.md': f'{destination}/{name}/LICENSE.md',
        'tmp/wasm32-unknown-unknown/README.md': f'{destination}/{name}/README.md',
        f'tmp/wasm32-unknown-unknown/cosmian_{name}.js': f'{destination}/{name}/cosmian_{name}.js',
        f'tmp/wasm32-unknown-unknown/cosmian_{name}_bg.wasm.d.ts': f'{destination}/{name}/cosmian_{name}_bg.wasm.d.ts',
    }

    missing_files = False
    for key in to_be_copied:
        if not path.exists(to_be_copied[key]):
            missing_files = True
            break

    if missing_files:
        print(f'Missing {name} WASM. Copy {name} {version} to {destination}...')

        url = f'https://package.cosmian.com/{name}/{version}/all.zip'
        try:
            r = urllib.request.urlopen(url)
            if r.getcode() != 200:
                print(f'Cannot get {name} {version} at {url} ({r.getcode()})')
            else:
                if path.exists('tmp'):
                    shutil.rmtree('tmp')
                if path.exists('all.zip'):
                    remove('all.zip')

                open('all.zip', 'wb').write(r.read())
                with zipfile.ZipFile('all.zip', 'r') as zip_ref:
                    zip_ref.extractall('tmp')
                    for key in to_be_copied:
                        shutil.copyfile(key, to_be_copied[key])

                    shutil.rmtree('tmp')
                remove('all.zip')
        except Exception as e:
            print(f'Cannot get {name} {version} ({e})')
            return False
    return True


if __name__ == '__main__':
    ret = download_wasm('findex', 'v2.0.2', 'src/pkg')
    if ret is False and getenv('GITHUB_ACTIONS'):
        download_wasm('findex', 'last_build', 'src/pkg')

    ret = download_wasm('cover_crypt', 'v10.0.0', 'src/pkg')
    if ret is False and getenv('GITHUB_ACTIONS'):
        download_wasm('cover_crypt', 'last_build', 'src/pkg')
