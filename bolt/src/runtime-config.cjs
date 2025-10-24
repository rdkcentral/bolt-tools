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

const template = {
  "ociVersion": "1.0.2",
  "process": {
    "terminal": true,
    "user": {
      "uid": 0,
      "gid": 0
    },
    "args": [
    ],
    "env": [
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      "TERM=xterm",
      "HOME=/home/root",
      "LD_PRELOAD=/usr/lib/libwayland-client.so.0:/usr/lib/libwayland-egl.so.0",
    ],
    "cwd": "/",
    "capabilities": {
      "bounding": [
        "CAP_SETPCAP",
        "CAP_FSETID",
        "CAP_KILL",
        "CAP_AUDIT_WRITE",
        "CAP_NET_BIND_SERVICE",
        "CAP_SETUID",
        "CAP_NET_RAW",
        "CAP_SETGID",
        "CAP_CHOWN"
      ],
      "effective": [
        "CAP_SETPCAP",
        "CAP_FSETID",
        "CAP_KILL",
        "CAP_AUDIT_WRITE",
        "CAP_NET_BIND_SERVICE",
        "CAP_SETUID",
        "CAP_NET_RAW",
        "CAP_SETGID",
        "CAP_CHOWN"
      ],
      "inheritable": [
        "CAP_SETPCAP",
        "CAP_FSETID",
        "CAP_KILL",
        "CAP_AUDIT_WRITE",
        "CAP_NET_BIND_SERVICE",
        "CAP_SETUID",
        "CAP_NET_RAW",
        "CAP_SETGID",
        "CAP_CHOWN"
      ],
      "permitted": [
        "CAP_SETPCAP",
        "CAP_FSETID",
        "CAP_KILL",
        "CAP_AUDIT_WRITE",
        "CAP_NET_BIND_SERVICE",
        "CAP_SETUID",
        "CAP_NET_RAW",
        "CAP_SETGID",
        "CAP_CHOWN"
      ],
      "ambient": [
        "CAP_SETPCAP",
        "CAP_FSETID",
        "CAP_KILL",
        "CAP_AUDIT_WRITE",
        "CAP_NET_BIND_SERVICE",
        "CAP_SETUID",
        "CAP_NET_RAW",
        "CAP_SETGID",
        "CAP_CHOWN"
      ]
    },
    "rlimits": [
      {
        "type": "RLIMIT_NOFILE",
        "hard": 1024,
        "soft": 1024
      },
      {
        "type": "RLIMIT_NPROC",
        "hard": 300,
        "soft": 300
      },
      {
        "type": "RLIMIT_RTPRIO",
        "hard": 6,
        "soft": 6
      }
    ],
    "noNewPrivileges": true
  },
  "root": {
    "path": "rootfs"
  },
  "hostname": "default",
  "mounts": [
    {
      "destination": "/proc",
      "type": "proc",
      "source": "proc"
    },
    {
      "destination": "/dev",
      "type": "tmpfs",
      "source": "tmpfs",
      "options": [
        "nosuid",
        "strictatime",
        "mode=755",
        "size=65536k"
      ]
    },
    {
      "destination": "/dev/pts",
      "type": "devpts",
      "source": "devpts",
      "options": [
        "nosuid",
        "noexec",
        "newinstance",
        "ptmxmode=0666",
        "mode=0620"
      ]
    },
    {
      "destination": "/dev/shm",
      "type": "tmpfs",
      "source": "shm",
      "options": [
        "nosuid",
        "noexec",
        "nodev",
        "mode=1777",
        "size=65536k"
      ]
    },
    {
      "destination": "/dev/mqueue",
      "type": "mqueue",
      "source": "mqueue",
      "options": [
        "nosuid",
        "noexec",
        "nodev"
      ]
    },
    {
      "destination": "/sys",
      "type": "bind",
      "source": "/sys",
      "options": [
        "rbind",
        "nosuid",
        "noexec",
        "nodev",
        "ro"
      ]
    },
  ],
  "annotations": {
    "org.opencontainers.image.architecture": "arm",
    "org.opencontainers.image.exposedPorts": "",
    "org.opencontainers.image.os": "linux",
    "org.opencontainers.image.stopSignal": "",
    "run.oci.hooks.stderr": "/dev/stderr",
    "run.oci.hooks.stdout": "/dev/stdout"
  },
  "linux": {
    "uidMappings": [
      {
        "containerID": 0,
        "hostID": 1000,
        "size": 1
      }
    ],
    "gidMappings": [
      {
        "containerID": 0,
        "hostID": 1000,
        "size": 1
      }
    ],
    "namespaces": [
      {
        "type": "pid"
      },
      {
        "type": "ipc"
      },
      {
        "type": "uts"
      },
      {
        "type": "mount"
      }
    ],
    "maskedPaths": [
      "/proc/kcore",
      "/proc/latency_stats",
      "/proc/timer_list",
      "/proc/timer_stats",
      "/proc/sched_debug",
      "/sys/firmware",
      "/proc/scsi"
    ],
    "readonlyPaths": [
      "/proc/asound",
      "/proc/bus",
      "/proc/fs",
      "/proc/irq",
      "/proc/sys",
      "/proc/sysrq-trigger"
    ],
    "resources": {
      "devices": [
        {
          "allow": false,
          "access": "rwm"
        },
      ]
    },
    "devices": [
    ]
  }
};


function makeTemplate() {
  return template;
}

exports.makeTemplate = makeTemplate;
