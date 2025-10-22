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

const settings = {
  mounts: [{
    "source": "/usr/lib/libdrm.so.2",
    "destination": "/usr/lib/libdrm.so.2",
    "type": "bind",
    "options": [
      "rbind",
      "nosuid",
      "nodev",
      "ro"
    ]
  },
  {
    "source": "/usr/lib/libwayland-egl.so",
    "destination": "/usr/lib/libwayland-egl.so",
    "type": "bind",
    "options": [
      "rbind",
      "nosuid",
      "nodev",
      "ro"
    ]
  },
  {
    "source": "/usr/lib/libwayland-egl.so",
    "destination": "/usr/lib/libwayland-egl.so.0",
    "type": "bind",
    "options": [
      "rbind",
      "nosuid",
      "nodev",
      "ro"
    ]
  },
  {
    "source": "/usr/lib/libwayland-egl.so",
    "destination": "/usr/lib/libwayland-egl.so.1",
    "type": "bind",
    "options": [
      "rbind",
      "nosuid",
      "nodev",
      "ro"
    ]
  },
  {
    "source": "/usr/lib/libEGL.so",
    "destination": "/usr/lib/libEGL.so",
    "type": "bind",
    "options": [
      "rbind",
      "nosuid",
      "nodev",
      "ro"
    ]
  },
  {
    "source": "/usr/lib/libEGL.so",
    "destination": "/usr/lib/libEGL.so.1",
    "type": "bind",
    "options": [
      "rbind",
      "nosuid",
      "nodev",
      "ro"
    ]
  },
  {
    "source": "/usr/lib/libGLESv2.so",
    "destination": "/usr/lib/libGLESv2.so",
    "type": "bind",
    "options": [
      "rbind",
      "nosuid",
      "nodev",
      "ro"
    ]
  },
  {
    "source": "/usr/lib/libGLESv2.so",
    "destination": "/usr/lib/libGLESv2.so.2",
    "type": "bind",
    "options": [
      "rbind",
      "nosuid",
      "nodev",
      "ro"
    ]
  },
  {
    "source": "/usr/lib/libMali.so",
    "destination": "/usr/lib/libMali.so",
    "type": "bind",
    "options": [
      "rbind",
      "nosuid",
      "nodev",
      "ro"
    ]
  },
  {
    "source": "/usr/lib/libwesteros_gl.so.0",
    "destination": "/usr/lib/libwesteros_gl.so.0",
    "type": "bind",
    "options": [
      "rbind",
      "nosuid",
      "nodev",
      "ro"
    ]
  },
  {
    "source": "/usr/lib/libamlavsync.so",
    "destination": "/usr/lib/libamlavsync.so",
    "type": "bind",
    "options": [
      "rbind",
      "nosuid",
      "nodev",
      "ro"
    ]
  }],
  linux: {
    resources: {
      devices: [
      ]
    },
    devices: [
    ]
  }
};

function addDevice(path, type, major, minor) {
  settings.linux.devices.push({
    path,
    type,
    major,
    minor
  });

  settings.linux.resources.devices.push({
    allow: true,
    type,
    major,
    minor,
    access: "rw"
  });
}

function updateBundleConfig(remote, bundleConfig) {
  const devices = [
    { path: "/dev/mali0", type: "c", major: 10 },
    { path: "/dev/ion", type: "c", major: 10 },
    { path: "/dev/dma_heap/heap-gfx", type: "c", major: 248 },
    { path: "/dev/dma_heap/system-uncached", type: "c", major: 248 },
  ];

  for (let device of devices) {
    const minor = +remote.exec(`echo $((16#$(stat -c '%T' ${device.path})))`).trim();
    addDevice(device.path, device.type, device.major, minor);
  }

  bundleConfig.mounts = bundleConfig.mounts.concat(settings.mounts);
  bundleConfig.linux.devices = bundleConfig.linux.devices.concat(settings.linux.devices);
  bundleConfig.linux.resources.devices = bundleConfig.linux.resources.devices.concat(settings.linux.resources.devices);
}

exports.updateBundleConfig = updateBundleConfig;
