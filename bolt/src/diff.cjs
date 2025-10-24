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

const { exec } = require('./utils.cjs');
const { readFileSync, rmSync } = require('node:fs');

function diff(bottom, top, layer) {
  const dir = exec(`mktemp -d -p .`).trim();

  exec(`mkdir -p ${dir}/bottom/oci ${dir}/top/oci`);
  exec(`tar xf ${bottom} -C ${dir}/bottom/oci`);
  exec(`tar xf ${top} -C ${dir}/top/oci`);
  exec(`umoci unpack --rootless --image ${dir}/bottom/oci ${dir}/bottom/bundle`);
  exec(`umoci unpack --rootless --image ${dir}/top/oci ${dir}/top/bundle`);

  exec(`rsync -crlpgoDX ${dir}/top/bundle/rootfs/ ${dir}/bottom/bundle/rootfs`);
  exec(`umoci repack --refresh-bundle --image ${dir}/bottom/oci ${dir}/bottom/bundle`);

  exec(`umoci gc --layout=${dir}/bottom/oci`);

  /*
  {
     "manifests" : [
        {
           "annotations" : {
              "org.opencontainers.image.ref.name" : "latest"
           },
           "digest" : "sha256:16af25fd44db44c08ad45c56179e5be678f0d092d3244fb6a4d31b20c0255982",
           "mediaType" : "application/vnd.oci.image.manifest.v1+json",
           "size" : 508
        }
     ],
     "schemaVersion" : 2
  }
  */

  const index = JSON.parse(readFileSync(`${dir}/bottom/oci/index.json`));
  const [manifestAlgo, manifestDigest] = index.manifests[0].digest.split(':');

  /*
  {
     "config" : {
        "digest" : "sha256:207c208a976933e1e790184a0341e8bfa3360d365a56e11b8c2197af4423e9c7",
        "mediaType" : "application/vnd.oci.image.config.v1+json",
        "size" : 826
     },
     "layers" : [
        {
           "digest" : "sha256:a960cdcfd4726b64a934c3185de5fc2e72ab4c48271ef705c21f5bde3fba55fc",
           "mediaType" : "application/vnd.oci.image.layer.v1.tar+gzip",
           "size" : 6096352
        },
        {
           "digest" : "sha256:0de5969b7daada6832f50874d37209b0b5704d5a99b1809834a75852934646ac",
           "mediaType" : "application/vnd.oci.image.layer.v1.tar+gzip",
           "size" : 23765391
        }
     ],
     "schemaVersion" : 2
  }
  */

  const manifest = JSON.parse(readFileSync(`${dir}/bottom/oci/blobs/${manifestAlgo}/${manifestDigest}`));
  const [layerAlgo, layerDigest] = manifest.layers.findLast(() => true).digest.split(':');

  exec(`cp ${dir}/bottom/oci/blobs/${layerAlgo}/${layerDigest} ${layer}`);

  rmSync(dir, { recursive: true, force: true });

  console.log(`Generated diff layer ${layer} from ${bottom} ${top}`);
}

exports.diff = diff;
