

export const code_flip	= `
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

`;

		

export const code_positionSimple	= `
function positionSimple(rootEl: HTMLElement) {


	on(rootEl, 'pointerup', '.clickable', async (evt) => {

		// NOTE: here we do some cleanup, but the problem with SpecView not fully resolved becase of dom-native aliased 
		//       prevents to do the disconnectedCallback on SpecPositionView
		first("#popup-pos")?.remove();

		// Note: Position assume the element to be positioned is absolute
		const [popupEl] = append(document.body, \`
			<div id="popup-pos" 
						style="position: absolute; top: 0; left: 0; width: 8rem; height: 8rem; background: blue; opacity: .9">
			</div>\`);//

		const clickableEl = evt.selectTarget;
		popupEl.style.visibility = 'visible';
		if (clickableEl.matches('.right')) {
			position(popupEl, evt.selectTarget, 'right');
		} else if (clickableEl.matches('.top')) {
			position(popupEl, evt.selectTarget, 'top');
		} else if (clickableEl.matches('.left')) {
			position(popupEl, evt.selectTarget, 'left');
		} else if (clickableEl.matches('.bottom')) {
			position(popupEl, evt.selectTarget, 'bottom');
		} else if (clickableEl.matches('.bottom-center')) {
			position(popupEl, evt.selectTarget, { at: 'bottom', align: 'center' });
		} else if (clickableEl.matches('.right-bottom')) {
			position(popupEl, evt.selectTarget, { at: 'right', align: 'bottom' });
		} else if (clickableEl.matches('.right-center')) {
			position(popupEl, evt.selectTarget, { at: 'right', align: 'center' });
		} else if (clickableEl.matches('.left-center')) {
			position(popupEl, evt.selectTarget, { at: 'left', align: 'center' });
		}

		// Cleanup
		await wait(1000);
		popupEl.remove();

	});
}
`;

		