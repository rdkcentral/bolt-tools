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

const { diff } = require('./diff.cjs');
const { extract } = require('./extract.cjs');
const { pack } = require('./pack.cjs');
const { push } = require('./push.cjs');
const { run } = require('./run.cjs');
const { make } = require('./make.cjs');

function help() {
  console.log('Usage:');
  console.log('bolt diff <bottom-oci-image.tar> <top-oci-image.tar> <layer.tgz>    generate a layer that, when combined with the bottom');
  console.log('                                                                    image layer, will create the top image layer');
  console.log('bolt extract <oci-image.tar> <layer.tgz>                            extract the top layer from the image');
  console.log('bolt pack <config.json> <layer.tgz>                                 pack the configuration file and layer into a package');
  console.log('bolt push <remote> <package-name>                                   push the package to the remote device');
  console.log('bolt run <remote> <package-name>                                    run the package on the remote device');
  console.log();
  console.log('Where:');
  console.log('oci-image.tar - an image compliant with the "OCI Image Format Specification" packaged as a tarball');
  console.log('layer.tgz     - a rootfs layer packed as a gzip compressed tarball file');
  console.log('config.json   - a configuration file compliant with https://github.com/rdkcentral/oci-package-spec/blob/main/metadata.md');
  console.log('remote        - name of the device accessible via SSH in non-interactive mode');
  console.log('package-name  - name of the package that was generated using the pack command');

  process.exit(-1);
}

if (process.argv.length < 3) {
  help();
}

const commands = {
  diff: { args: 3, handler: diff },
  extract: { args: 2, handler: extract },
  pack: { args: 2, handler: pack },
  push: { args: 2, handler: push },
  run: { args: 2, handler: run },
  make: { args: 1, handler: make },
};

const command = commands[process.argv[2]];
if (command && (!command.args || command.args === process.argv.length - 3)) {
  command.handler(...process.argv.slice(3));
} else {
  help();
}
