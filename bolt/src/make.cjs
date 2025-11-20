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

const { statSync, rmSync, readFileSync } = require('node:fs');
const { assert } = require('node:console');
const { exec, printError, makeWorkDir } = require('./utils.cjs');
const { pack } = require('./pack.cjs');
const { extract } = require('./extract.cjs');
const { PackageStore } = require('./PackageStore.cjs');
const { PackageConfigStore } = require('./PackageConfigStore.cjs');
const { PackageBuilder } = require('./PackageBuilder.cjs');
const { PackageDependencyResolver } = require('./PackageDependencyResolver.cjs');

class PackageProvider {
  constructor(packageStore, configStore) {
    this.packageStore = packageStore;
    this.configStore = configStore;
  }

  getPackage(fullPackageName) {
    if (fullPackageName === this.configStore.getTopPackageFullName()) {
      return this.configStore.getTopConfig();
    }
    return this.packageStore.getPackage(fullPackageName);
  }
}

function detectBitbakeEnvironment() {
  if (exec(`which bitbake >/dev/null; echo $?`).trim() !== "0" || !process.env.BUILDDIR) {
    throw new Error('Instructions to make package require bitbake environment.\n' +
      'Please source setup-environment script.');
  }
}

function detectMainLayerDir() {
  if (process.env.BUILDDIR) {
    const setupDonePath = process.env.BUILDDIR + "/conf/setup.done";
    if (statSync(setupDonePath, { throwIfNoEntry: false })?.isFile()) {
      const setupDone = readFileSync(setupDonePath, 'utf8').trim().split('\n');
      if (setupDone.length) {
        return setupDone.at(-1);
      }
    }
  }

  return null;
}

function validateFilePath(path) {
  if (statSync(path, { throwIfNoEntry: false })?.isFile()) {
    return path;
  }
  return null;
}

function bitbakeMakeOCIImage(config) {
  detectBitbakeEnvironment();
  exec(`bitbake ${config.image}`, { stdio: 'inherit' });
  const defaultImage = `${process.env.BUILDDIR}/tmp-glibc/deploy/images/arm/${config.image}.tar`;
  let result = validateFilePath(defaultImage) ??
    validateFilePath(`${process.env.BUILDDIR}/tmp-glibc/deploy/images/arm64/${config.image}.tar`) ??
    validateFilePath(`${process.env.BUILDDIR}/tmp-glibc/deploy/images/amd64/${config.image}.tar`);

  if (result) {
    return result;
  }

  throw new Error(`Image not found: ${defaultImage}`);
}

async function make(packageAlias) {
  let workDir = makeWorkDir();
  try {
    await makeCommand(packageAlias, workDir);
  } catch (e) {
    printError(e);
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

async function makeCommand(packageAlias, workDir) {
  const packageConfigStore = new PackageConfigStore(detectMainLayerDir() ?? process.cwd(), packageAlias);
  const packageConfig = packageConfigStore.getTopConfig();
  const packageBoltConfig = packageConfigStore.getTopBoltConfig();

  if (!packageConfig) {
    throw new Error(`Package config for ${packageAlias} not found!`);
  }

  let contentFile;

  if (packageBoltConfig?.bitbake?.image) {
    const packageStore = new PackageStore(process.env.BUILDDIR ?? process.cwd(), workDir);
    const packageRootfsDir = `${workDir}/${packageConfig.getFullName()}-rootfs`;
    const packageLayerArchive = `${workDir}/${packageConfig.getFullName()}-layer.tgz`;
    const packages = PackageDependencyResolver.getDependencies(
      packageConfig.getFullName(),
      new PackageProvider(packageStore, packageConfigStore)
    );
    const last = packages.pop();

    assert(last.getFullName() === packageConfig.getFullName());

    if (packages.length) {
      const packageBuilder = new PackageBuilder(`${workDir}/${packageConfig.getFullName()}`);

      for (const pkg of packages) {
        packageBuilder.merge(pkg.getLayerDir());
      }

      const packageRootfsArchive = packageRootfsDir + ".tgz";
      extract(bitbakeMakeOCIImage(packageBoltConfig.bitbake), packageRootfsArchive);
      exec(`mkdir -p ${packageRootfsDir}`);
      exec(`tar xf ${packageRootfsArchive} -C ${packageRootfsDir}`);

      packageBuilder.merge(packageRootfsDir);
      packageBuilder.finish(packageLayerArchive);
      contentFile = packageLayerArchive;
    } else {
      contentFile = packageRootfsDir + ".tgz";
      extract(bitbakeMakeOCIImage(packageBoltConfig.bitbake), contentFile);
    }
  } else if (packageBoltConfig?.direct?.empty) {
    contentFile = workDir + '/empty.tar';
    exec(`tar -cf ${contentFile} --files-from /dev/null`);
  }

  if (contentFile) {
    await pack(packageConfig.getPath(), contentFile);
  } else {
    throw new Error(`No instructions to make ${packageAlias}!`);
  }
}

exports.make = make;
