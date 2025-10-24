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

const { renameSync, copyFileSync, unlinkSync } = require('node:fs');
const { execSync } = require('node:child_process');
const { verbose } = require('./config.cjs');

function execNoOutput(command, params) {
  if (verbose) console.log(command);

  try {
    const stdout = execSync(
      command,
      Object.assign({
        stdio: 'pipe',
        encoding: 'utf8',
      }, params)
    );

    return stdout;
  } catch (err) {

    if (err.code) {
      if (verbose) console.error(err.code);
    } else {
      const { stdout, stderr } = err;
      if (verbose) console.error({ stdout, stderr });
    }

    if (verbose) console.error(err.stack);

    throw err;
  }
}

function exec(command, params) {
  const output = execNoOutput(command, params);
  if (verbose) console.log(output.trim());
  return output;
}

function moveSync(from, to) {
  try {
    renameSync(from, to);
  } catch (err) {
    if (err.code === 'EXDEV') {
      copyFileSync(from, to);
      unlinkSync(from);
    } else {
      throw err;
    }
  }
}

exports.exec = exec;
exports.execNoOutput = execNoOutput;
exports.moveSync = moveSync;
