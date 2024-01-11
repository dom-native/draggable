
import { router } from 'cmdrouter';
import { saferRemove } from 'fs-extra-plus';
import { spawn } from 'p-spawn';
import { buildDemoCode, uploadSite } from './helpers.js';


router({ build, watch, site }).route();

async function build() {
	await saferRemove('./dist');

	// build the tsc
	await spawn('./node_modules/.bin/tsc');
}

async function watch() {
	await saferRemove('./demo/dist');

	// generate first to have the ts able to compile
	await buildDemoCode(false);
	spawn('npm', ['run', 'build-demo-js', '--', '-w']);
	spawn('npm', ['run', 'pcss', '--', '-w']);

	await buildDemoCode(true);
}


async function site() {
	uploadSite('demo/', 'dom-native/demo/draggable/')
}

