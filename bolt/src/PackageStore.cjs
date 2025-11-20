/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2025 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

const { statSync } = require('node:fs');
const { resolve } = require('path');
const { Package } = require('./Package.cjs');

const PACKAGE_STORE_DIR = 'bolts';
const MAX_DEPTH = 100;

class PackageStore {
  constructor(initDir, workDir) {
    this.path = "";
    this.workDir = workDir;

    let base = initDir;
    for (let i = 0; i < MAX_DEPTH; ++i) {
      const path = resolve(base + '/' + PACKAGE_STORE_DIR);

      if (statSync(path, { throwIfNoEntry: false })?.isDirectory()) {
        this.path = path;
        break;
      } else if (path !== '/' + PACKAGE_STORE_DIR) {
        base += '/..';
      } else {
        break;
      }
    }
  }

  getPackage(packageFullName) {
    return Package.fromPath(`${this.path}/${packageFullName}.bolt`, packageFullName, this.workDir);
  }

  getPath() {
    return this.path;
  }
}

exports.PackageStore = PackageStore;
