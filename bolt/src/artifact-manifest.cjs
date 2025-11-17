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

const assert = require('node:assert');

// see https://github.com/rdkcentral/oci-package-spec/blob/main/format.md
function makeArtifactManifest(spec) {
  let imageTitle;

  switch (spec.type) {
    case 'application':
      imageTitle = 'package.tar.gz';
      break;
    case 'runtime':
      imageTitle = 'runtime.tar.gz';
      break;
    case 'base':
      imageTitle = 'base.tar.gz';
      break;
  }

  assert(imageTitle);

  return {
    "schemaVersion": 2,
    "mediaType": "application/vnd.oci.image.manifest.v1+json",
    "artifactType": "application/vnd.rdk.package+type",
    "config": {
      "mediaType": "application/vnd.rdk.package.config.v1+json",
      "digest": spec.configDigest,
      "size": spec.configSize,
      "annotations": {
        "org.opencontainers.image.title": "package.json"
      }
    },
    "layers": [
      {
        "mediaType": "application/vnd.rdk.package.content.layer.v1.tar+gzip",
        "digest": spec.contentDigest,
        "size": spec.contentSize,
        "annotations": {
          "org.opencontainers.image.title": imageTitle
        }
      }
    ]
  };
}

exports.makeArtifactManifest = makeArtifactManifest;
