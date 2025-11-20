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

const { PackageConfig } = require('./PackageConfig.cjs');

class PackageDependencyResolver {
  static getDependencies(basePackageFullName, packageProvider) {
    const packages = [];
    const pkgs = new Map();

    function gatherPackages(fullName) {
      const pkg = packageProvider.getPackage(fullName);

      if (!pkg) {
        throw new Error(`Required ${fullName}.bolt package not found!\n` +
          'Please deliver it in the "bolts" directory.'
        );
      }
      if (fullName === pkg.getFullName()) {
        const foundPkgVersion = pkgs.get(pkg.getId());

        if (foundPkgVersion === undefined) {
          pkgs.set(pkg.getId(), pkg.getVersion());

          const dependencies = pkg.getDependencies();

          for (const dependency in dependencies) {
            const depPkgName = PackageConfig.makeFullName(dependency, dependencies[dependency]);
            gatherPackages(depPkgName);
          }

          packages.push(pkg);
        } else if (foundPkgVersion === pkg.getVersion()) {
          console.warn(`Multiple packages depend on the same package ${pkg.getVersion()} ${foundPkgVersion}!`);
        } else {
          throw new Error(`Multiple packages depend on different versions of the same package ${pkg.getId()} ${foundPkgVersion} vs ${pkg.getVersion()}!`);
        }
      } else {
        throw new Error(`Package name does not match package config ${fullName} vs ${pkg.getFullName()}`);
      }
    }

    gatherPackages(basePackageFullName);

    return packages;
  }
}

exports.PackageDependencyResolver = PackageDependencyResolver;
