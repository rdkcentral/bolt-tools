# bolt

This tool allows to generate **bolt** packages and run them on a compatible device.

The purpose of this tool is to demonstrate and test the concept of using **bolt** packages.
Future versions may introduce incompatible changes as the concept evolves and implementations
mature on compatible devices.

## Installation

Bolt is a Node.js script and requires no installation. To fully utilize it, you'll need to install the following command-line tools:
* node
* tar
* rsync
* umoci
* mkfs.erofs
* veritysetup
* zip
* ssh
* scp

To use the tool from anywhere on your system, add the [bin](bin) directory to your `PATH` environment variable.

## Usage

Run `bolt` with one of the commands described below:

```
Usage:
bolt diff <bottom-oci-image.tar> <top-oci-image.tar> <layer.tgz>    generate a layer that, when combined with the bottom
                                                                    image layer, will create the top image layer
bolt extract <oci-image.tar> <layer.tgz>                            extract the top layer from the image
bolt pack <config.json> <layer.tgz>                                 pack the configuration file and layer into a package
bolt push <remote> <package-name>                                   push the package to the remote device
bolt run <remote> <package-name>                                    run the package on the remote device

Where:
oci-image.tar - an image compliant with the "OCI Image Format Specification" packaged as a tarball
layer.tgz     - a rootfs layer packed as a gzip compressed tarball file
config.json   - a configuration file compliant with https://github.com/rdkcentral/oci-package-spec/blob/main/metadata.md
remote        - name of the device accessible via SSH in non-interactive mode
package-name  - name of the package that was generated using the pack command
```

## Example

```
$ bolt diff base-oci.tar wpe-oci.tar wpe-diff.tgz
Generated diff layer wpe-diff.tgz from base-oci.tar wpe-oci.tar

$ bolt extract base-oci.tar base.tgz
Extracted base.tgz from base-oci.tar

$ bolt pack com.rdkcentral.base.json base.tgz
Prepared com.rdkcentral.base+0.0.1.bolt package from com.rdkcentral.base.json and base.tgz

$ bolt pack com.rdkcentral.wpe.json wpe-diff.tgz
Prepared com.rdkcentral.wpe+0.0.1.bolt package from com.rdkcentral.wpe.json and wpe-diff.tgz

$ bolt pack com.rdkcentral.myapp.json myapp.tgz
Prepared com.rdkcentral.myapp+0.0.1.bolt package from com.rdkcentral.myapp.json and myapp.tgz

$ bolt push aml com.rdkcentral.base+0.0.1
Pushed com.rdkcentral.base+0.0.1.bolt to aml

$ bolt push aml com.rdkcentral.wpe+0.0.1
Pushed com.rdkcentral.wpe+0.0.1.bolt to aml

$ bolt push aml com.rdkcentral.myapp+0.0.1
Pushed com.rdkcentral.myapp+0.0.1.bolt to aml

$ bolt run aml com.rdkcentral.myapp+0.0.1
Running com.rdkcentral.myapp+0.0.1 using:
(...)
```
