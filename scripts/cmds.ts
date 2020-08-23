import { router } from 'cmdrouter';
import * as fs from 'fs-extra-plus';
import { spawn } from 'p-spawn';


router({ build, watch }).route();

async function build() {
	await fs.saferRemove('./dist');

	// build the tsc (vdev assume rollup on webBundles, which we do not need for this build)
	await spawn('./node_modules/.bin/tsc');
}

async function watch() {
	await fs.saferRemove('./demo/dist');

	spawn('./node_modules/.bin/vdev', ['watch', 'demo']);
}





