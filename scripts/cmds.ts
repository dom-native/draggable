import chokidar from 'chokidar';
import { router } from 'cmdrouter';
import { glob, readFile, saferRemove, writeFile } from 'fs-extra-plus';
import debounce from 'lodash.debounce';
import { spawn } from 'p-spawn';


router({ build, watch }).route();

async function build() {
	await saferRemove('./dist');

	// build the tsc (vdev assume rollup on webBundles, which we do not need for this build)
	await spawn('./node_modules/.bin/tsc');
}

async function watch() {
	await saferRemove('./demo/dist');

	spawn('npm', ['run', 'build-demo-js', '--', '-w']);
	spawn('npm', ['run', 'build-demo-css', '--', '-w', '--verbose']);
	buildDemoCode(true);

}


async function buildDemoCode(watch = false) {
	if (watch) {
		const codeWatch = chokidar.watch('demo/src/spec-*.ts', { depth: 99, ignoreInitial: true, persistent: true });
		const generateDemoCodesFileDebounced = debounce(_generateDemoCodesFile, 200);
		codeWatch.on('change', generateDemoCodesFileDebounced);
		codeWatch.on('add', generateDemoCodesFileDebounced);
	}
}



type CodeItem = { name: string, code: string };

async function _generateDemoCodesFile() {
	const srcFiles = await glob('demo/src/spec*.ts');
	const codeItems: CodeItem[] = [];

	for (const file of srcFiles) {
		const content = await readFile(file, 'utf-8');
		// '//#region    ---------- code: '
		const CODE_BLOCK_RG = /\/\/#region.*code:\s+(\w+).*[\s\S]([\s\S]*?)\/\/#endregion/gm
		const m = content.matchAll(CODE_BLOCK_RG);
		for (const item of m) {
			const [fullSelection, name, code] = item;
			codeItems.push({ name, code });
		}
	}

	let codeContent = '';
	for (let { name, code } of codeItems) {
		code = code.replace(/\`/g, '\\\`'); //
		code = code.replace(/\$/g, '\\$');
		codeContent += `

export const code_${name}	= \`
${code}\`;

		`
	}

	await writeFile('demo/src/_codes.ts', codeContent, 'utf-8');

}

