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

const { REMOTE_PACKAGES_DIR } = require('./config.cjs');
const { Remote } = require('./Remote.cjs');

function push(remoteName, pkg) {
  const remote = new Remote(remoteName);

  remote.unmountPkgWithDeps(pkg);
  remote.mkdir(`${REMOTE_PACKAGES_DIR}`);
  remote.rmdir(`${REMOTE_PACKAGES_DIR}/${pkg}`);
  remote.copyFile(`${pkg}.bolt`, REMOTE_PACKAGES_DIR);
  remote.exec(`cd ${REMOTE_PACKAGES_DIR} && rm -rf ${pkg} && unzip -o ${pkg}.bolt -d ${pkg} && rm -f ${pkg}.bolt`);

  console.log(`Pushed ${pkg}.bolt to ${remoteName}`);
}

exports.push = push;
