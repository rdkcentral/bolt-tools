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

module.exports = {
  "vendorGpuSupport": {
    "devNodes": [
      "/dev/mali0",
      "/dev/ion",
      "/dev/dma_heap/heap-gfx",
      "/dev/dma_heap/system-uncached"
    ],
    "files": [
      {
        "source": "/usr/lib/libdrm.so.2",
        "destination": "/usr/lib/libdrm.so.2",
        "type": "bind"
      },
      {
        "source": "/usr/lib/libwayland-egl.so",
        "destination": "/usr/lib/libwayland-egl.so",
        "type": "bind"
      },
      {
        "target": "/usr/lib/libwayland-egl.so",
        "linkPath": "/usr/lib/libwayland-egl.so.0",
        "type": "symlink"
      },
      {
        "target": "/usr/lib/libwayland-egl.so",
        "linkPath": "/usr/lib/libwayland-egl.so.1",
        "type": "symlink"
      },
      {
        "source": "/usr/lib/libEGL.so",
        "destination": "/usr/lib/libEGL.so",
        "type": "bind"
      },
      {
        "target": "/usr/lib/libEGL.so",
        "linkPath": "/usr/lib/libEGL.so.1",
        "type": "symlink"
      },
      {
        "source": "/usr/lib/libGLESv2.so",
        "destination": "/usr/lib/libGLESv2.so",
        "type": "bind"
      },
      {
        "target": "/usr/lib/libGLESv2.so",
        "linkPath": "/usr/lib/libGLESv2.so.2",
        "type": "symlink"
      },
      {
        "source": "/usr/lib/libMali.so",
        "destination": "/usr/lib/libMali.so",
        "type": "bind"
      },
      {
        "source": "/usr/lib/libwesteros_gl.so.0",
        "destination": "/usr/lib/libwesteros_gl.so.0",
        "type": "bind"
      },
      {
        "source": "/usr/lib/libamlavsync.so",
        "destination": "/usr/lib/libamlavsync.so",
        "type": "bind"
      }
    ]
  }
};
