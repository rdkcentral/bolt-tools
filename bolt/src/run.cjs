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

const { Remote } = require('./Remote.cjs');
const { makeTemplate } = require('./runtime-config.cjs');
const config = require('./config.cjs');

function getConfigPath(remote, packageDir) {
  const index = remote.parseJSONFile(packageDir + "/index.json");
  const [algo, digest] = index.config.digest.split(":");
  return packageDir + "/blobs/" + algo + "/" + digest;
}

function getLayerInfo(remote, packageDir) {
  const layer = remote.parseJSONFile(packageDir + "/index.json").layers[0];
  const [algo, digest] = layer.digest.split(":");

  if (layer.mediaType === "application/vnd.rdk.package.content.layer.v1.erofs+dmverity") {
    return {
      path: packageDir + "/blobs/" + algo + "/" + digest,
      size: layer.size,
      digest,
      roothash: layer.annotations["org.rdk.package.content.dmverity.roothash"],
      offset: layer.annotations["org.rdk.package.content.dmverity.offset"],
    };
  }

  return null;
}

function mountIfNeeded(remote, pkg) {
  const mountDir = remote.getPkgMountDir(pkg);
  if (!remote.isMounted(mountDir)) {
    remote.mkdir(mountDir);
    const packageDir = remote.getPkgDir(pkg);
    const layerInfo = getLayerInfo(remote, packageDir);
    if (layerInfo) {
      if (layerInfo.roothash) {
        if (remote.fileExists("/usr/sbin/veritysetup") && remote.fileExists("/usr/sbin/dmsetup")) {
          remote.mountWithDMVerity(pkg, layerInfo, mountDir);
        } else {
          console.warn('\n\n\x1b[31mFile /usr/sbin/veritysetup and/or /usr/sbin/dmsetup not found! Cannot enable dm-verity!\x1b[0m\n\n');
          remote.mount(layerInfo.path, mountDir);
        }
      } else {
        remote.mount(layerInfo.path, mountDir);
      }
    }
  }
  return mountDir;
}

function getWaylandSocketName(pkg) {
  return pkg + "-wayland";
}

function getWaylandSocketPath(pkg) {
  return "/tmp/" + getWaylandSocketName(pkg);
}

function getRialtoSocketName(pkg) {
  return pkg + "-rialto";
}

function getRialtoSocketPath(pkg) {
  return "/tmp/" + getRialtoSocketName(pkg);
}

function setupResources(remote, pkg) {
  if (!remote.socketExists(getWaylandSocketPath(pkg))) {
    const createDisplay = {
      jsonrpc: "2.0",
      id: 4,
      method: "org.rdk.RDKShell.1.createDisplay",
      params: {
        client: pkg,
        displayName: getWaylandSocketName(pkg),
        rialtoSocket: getRialtoSocketName(pkg),
      }
    };
    remote.makeThunderRequest(createDisplay);

    const setFocus = {
      jsonrpc: "2.0",
      id: 4,
      method: "org.rdk.RDKShell.1.setFocus",
      params: {
        client: pkg
      }
    };
    remote.makeThunderRequest(setFocus);
  }
}

function prepareBundle(remote, pkg, bundleConfig, layers) {
  const bundleDir = remote.getPkgBundleDir(pkg);
  const bundleRootfsDir = bundleDir + "/rootfs";
  if (!remote.isMounted(bundleRootfsDir)) {
    remote.mkdir(`${bundleRootfsDir} ${bundleDir}/rw/{upper,work}`);
    remote.exec(`mount -t overlay overlay -o lowerdir=${layers.join(":")},upperdir=${bundleDir}/rw/upper,workdir=${bundleDir}/rw/work ${bundleRootfsDir}`);
  }
  remote.storeObject(`${bundleDir}/config.json`, bundleConfig);
}

function start(remote, pkg) {
  remote.exec(`crun run --bundle=${remote.getPkgBundleDir(pkg)} ${pkg}`, { stdio: 'inherit' });
}

function getConfig(remote, pkg) {
  const configPath = getConfigPath(remote, remote.getPkgDir(pkg));
  return remote.parseJSONFile(configPath);
}

function getPlatform(remote) {
  try {
    const imageNameTab = remote.getTextFile("/version.txt").split("\n")[0].split("-");
    return imageNameTab[imageNameTab.length - 2];
  } catch (err) {
    return "";
  }
}

function makePkgName(id, version) {
  return id + "+" + version;
}

function getConfigs(remote, pkg) {
  const configs = [];
  const pkgs = new Map();

  function gatherConfigs(name) {
    try {
      const config = getConfig(remote, name);
      const pkgName = makePkgName(config.id, config.version);

      if (name === pkgName) {
        const foundPkgVersion = pkgs.get(config.id);

        if (foundPkgVersion === undefined) {
          pkgs.set(config.id, config.version);

          for (const dependency in config.dependencies) {
            const depPkgName = makePkgName(dependency, config.dependencies[dependency]);
            gatherConfigs(depPkgName);
          }

          configs.push({ pkg: name, config });
        } else if (foundPkgVersion === config.version) {
          console.warn(`Multiple packages depend on the same package ${config.id} ${foundPkgVersion}!`);
        } else {
          throw new Error(`Multiple packages depend on different versions of the same package ${config.id} ${foundPkgVersion} vs ${config.version}!`);
        }
      } else {
        throw new Error(`Package name does not match package config ${name} vs ${pkgName}`);
      }
    } catch (e) {
      console.error(`${e}`);
      process.exit(-1);
    }
  }

  gatherConfigs(pkg);

  return configs;
}

function setupGPULayer(remote, bundleConfig) {
  if (!remote.isMounted(config.REMOTE_GPU_LAYER_MOUNT_DIR)) {
    if (remote.fileExists(config.REMOTE_GPU_LAYER)) {
      remote.mkdir(config.REMOTE_GPU_LAYER_MOUNT_DIR);
      remote.mount(config.REMOTE_GPU_LAYER, config.REMOTE_GPU_LAYER_MOUNT_DIR);
    }
  }

  if (remote.fileExists(config.REMOTE_GPU_CONFIG_SCRIPT)) {
    const concatIfNotEmpty = (to, from) => {
      if (from) {
        to = to.concat(from);
      }
      return to;
    };

    const gpuConfig = JSON.parse(remote.exec(config.REMOTE_GPU_CONFIG_SCRIPT));

    bundleConfig.mounts = concatIfNotEmpty(bundleConfig.mounts, gpuConfig?.mounts);
    bundleConfig.linux.devices = concatIfNotEmpty(bundleConfig.linux.devices,
      gpuConfig?.linux?.devices);
    bundleConfig.linux.resources.devices = concatIfNotEmpty(bundleConfig.linux.resources.devices,
      gpuConfig?.linux?.resources?.devices);
  }
}

function run(remoteName, pkg) {
  const remote = new Remote(remoteName);

  const configs = getConfigs(remote, pkg);
  const layerDirs = [];

  console.log(`Running ${pkg} using:`);
  console.log(`${JSON.stringify(configs, null, 2)}`);

  const bundleConfig = makeTemplate();
  for (const { pkg, config } of configs) {
    if (config.entryPoint) {
      bundleConfig.process.args.push(config.entryPoint);
    }
    layerDirs.push(mountIfNeeded(remote, pkg));
  }

  setupGPULayer(remote, bundleConfig);

  if (remote.isMounted(config.REMOTE_GPU_LAYER_MOUNT_DIR)) {
    layerDirs.push(config.REMOTE_GPU_LAYER_MOUNT_DIR);
  } else {
    const platform = getPlatform(remote);
    try {
      require(`./platform-${platform}.cjs`).updateBundleConfig(remote, bundleConfig);
    } catch (err) {
      if (platform) {
        console.error(`Platform ${platform} is not supported`);
      } else {
        console.error(`Cannot detect platform type`);
      }
      process.exit(-1);
    }
  }

  setupResources(remote, pkg);

  const waylandSocketPath = getWaylandSocketPath(pkg);
  if (remote.socketExists(waylandSocketPath)) {
    bundleConfig.mounts.push({
      source: waylandSocketPath,
      destination: waylandSocketPath,
      type: "bind",
      options: [
        "rbind",
        "rw"
      ]
    });
    const pathArray = waylandSocketPath.split("/");
    bundleConfig.process.env.push(`WAYLAND_DISPLAY=${pathArray.pop()}`);
    bundleConfig.process.env.push(`XDG_RUNTIME_DIR=${pathArray.join("/")}`);
  }

  const rialtoSocketPath = getRialtoSocketPath(pkg);
  if (remote.socketExists(rialtoSocketPath)) {
    bundleConfig.mounts.push({
      source: rialtoSocketPath,
      destination: rialtoSocketPath,
      type: "bind",
      options: [
        "rbind",
        "rw"
      ]
    });
    bundleConfig.process.env.push(`RIALTO_SOCKET_PATH=${rialtoSocketPath}`);
  }

  layerDirs.reverse();
  prepareBundle(remote, pkg, bundleConfig, layerDirs);

  if (!remote.socketExists(rialtoSocketPath)) {
    console.warn('\n\n\x1b[31mRialto socket not available! Playback not supported!\x1b[0m\n\n');
  }

  if (!remote.socketExists(waylandSocketPath)) {
    console.warn('\n\n\x1b[31mWayland socket not available! Graphics rendering not available!\x1b[0m\n\n');
  }

  start(remote, pkg);
}

exports.run = run;
