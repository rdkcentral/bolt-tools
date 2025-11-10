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

const { digestFile } = require('./digest.cjs');
const { makeArtifactManifest } = require('./artifact-manifest.cjs');
const { exec } = require('./utils.cjs');
const { statSync, mkdirSync, copyFileSync, renameSync, writeFileSync, rmSync, readFileSync } = require('node:fs');

function validateConfig(config) {
  if ((config.packageType === "base" || config.packageType === "runtime" || config.packageType === "application") &&
    typeof config.id === "string" &&
    typeof config.version === "string" &&
    typeof config.versionName === "string" &&
    typeof config.name === "string") {
    return;
  } else {
    throw new Error(`Invalid config:\n ${JSON.stringify(config, null, 2)}`);
  }
}

async function pack(configFile, content) {
  const configStat = statSync(configFile);
  statSync(content);
  const config = JSON.parse(readFileSync(configFile));
  validateConfig(config);
  const output = `${config.id}+${config.version}`;

  if (exec(`which ralfpack >/dev/null; echo $?`).trim() === "0") {
    exec(`ralfpack create --config ${configFile} --content ${content} --image-format erofs.lz4 ${output}.bolt`);
  } else {
    await packInternal(configFile, content, configStat, config, output);
  }
}

async function packInternal(configFile, content, configStat, config, output) {
  rmSync(output, { recursive: true, force: true });
  rmSync(output + ".bolt", { recursive: true, force: true });
  const blobs = output + '/blobs/sha256';
  const erofsTmpFile = output + '/erofs';
  mkdirSync(blobs, { recursive: true });
  exec(`mkfs.erofs -zlz4 --all-root --tar --gzip ${erofsTmpFile} ${content}`);
  const erofsTmpFileStat = statSync(erofsTmpFile);
  const rootHash = exec(`veritysetup format ${erofsTmpFile} ${erofsTmpFile} --hash-offset=${erofsTmpFileStat.size} | grep "Root hash:" | awk {'print $3'}`).trim();
  const contentStat = statSync(erofsTmpFile);
  const contentDigest = await digestFile(erofsTmpFile);
  renameSync(erofsTmpFile, blobs + '/' + contentDigest);
  const configDigest = await digestFile(configFile);
  copyFileSync(configFile, output + '/blobs/sha256/' + configDigest);

  const manifest = makeArtifactManifest({
    type: config.packageType,
    configSize: configStat.size,
    configDigest,
    contentSize: contentStat.size,
    contentDigest
  });

  Object.assign(manifest.layers[0], {
    mediaType: "application/vnd.rdk.package.content.layer.v1.erofs+dmverity",
    annotations: {
      "org.rdk.package.content.dmverity.roothash": rootHash,
      "org.rdk.package.content.dmverity.offset": erofsTmpFileStat.size
    }
  });

  writeFileSync(output + '/index.json', JSON.stringify(manifest, null, 2));
  writeFileSync(output + '/oci-layout', '{"imageLayoutVersion": "1.0.0"}');
  exec(`cd ${output} && zip -r ../${output}.bolt .`);

  console.log(`Prepared ${output}.bolt package from ${configFile} and ${content}`);
}

exports.pack = pack;
