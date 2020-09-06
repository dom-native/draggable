import { CodeDoc, SpecView } from '@dom-native/demo-infra';
import { all, append, BaseHTMLElement, closest, customElement, on, style } from 'dom-native';
import { activateDrag, capture } from '../../src';
import { code_flip } from './_codes';


@customElement('spec-flip')
export class SpecFlipView extends SpecView {
	name = 'spec_flip'
	doc = spec_doc
}

//#region    ---------- code: flip ---------- 
@customElement('c-panel')
export class PanelElement extends BaseHTMLElement {
	get col() { return this.parentElement as ColElement }
}

@customElement('c-col')
export class ColElement extends BaseHTMLElement {

	isBefore(cpanel: HTMLElement, ref: HTMLElement) {
		const cpanels = all(this, 'c-panel');
		for (const cp of cpanels) {
			if (cp === cpanel) {
				return true;
			}
			if (cp === ref) {
				return false;
			}
		}
		return false;
	}
}

function enableDrag(rootEl: HTMLElement) {

	// on pointerdown on a c-panel we start the drag action
	on(rootEl, 'pointerdown', 'c-panel', (pointerDownEvt) => {
		const panel = pointerDownEvt.selectTarget as PanelElement;

		let currentOver: HTMLElement | undefined;
		let currentOverPanel: PanelElement | undefined;
		let animationHappening = false;

		activateDrag(panel, pointerDownEvt, {
			// NOTE - the pointerCapture cannot be source (the default) since it will be re-attached causing a cancel
			//        @dom-native/draggable allows to set a custom pointerCapture
			pointerCapture: rootEl,

			// we will still drag the ghost (here could be 'none' as well)
			drag: 'ghost',

			// only used here to customize the ghost a little
			onDragStart: (evt) => {
				const { ghost } = evt.detail;

				style(ghost!, {
					opacity: '.5',
					background: 'red'
				});
			}, // /onDragStart

			onDrag: async (evt) => {
				const { over } = evt.detail;
				let overPanel: PanelElement | undefined;

				// work further only if over changed (and the over is not self)
				if (over != panel && over != currentOver) {
					// get the c-panel from the over
					overPanel = closest(over, 'c-panel') as PanelElement ?? undefined;

					// only perform next animation if no animation and the overPanel has changed
					if (!animationHappening && overPanel != null && overPanel != currentOverPanel) {
						animationHappening = true;

						//// not-so-magic FLIP
						// 1) capture the panel positions
						const inv = capture(all(rootEl, 'c-panel'));

						// 2) move the panel
						const pos = panel.col.isBefore(panel, overPanel) ? 'after' : 'before';
						append(overPanel, panel, pos);

						// 3) inver the position (pretend nothing happen)
						const play = inv();

						// 4) play the animation (got to love closure state capture)
						await play();

						// Now we are done (play return a promise when the animation is done - approximation -)
						animationHappening = false;
					}

					// update state for the next onDrag
					currentOverPanel = overPanel;
					currentOver = over;
				}
			}// /onDrag
		}); // /activateDrag


	});

}

//#endregion ---------- /code: flip ---------- 



const spec_doc: CodeDoc = {
	title: 'FLIP animation',
	tsPrefix: `
import { all, append, BaseHTMLElement, closest, customElement, on, style } from 'dom-native';
import { activateDrag, capture } from '@dom-native/draggable';
	`,
	groups: [
		{
			items: [
				{
					title: 'Simple Flip example (still some corner cases not handled)',
					html: `
<div class="root">					
	<c-col>
		<c-panel class="">ONE</c-panel>
		<c-panel class="">TWO</c-panel>
		<c-panel class="">THREE</c-panel>
	</c-col>
</div>			
			`,
					ts: code_flip,
					run: enableDrag
				}
			]
		}
	]

}