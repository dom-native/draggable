import { style } from 'dom-native';

const DEFAULT_GAP = 8;

type HLoc = 'left' | 'right';
type HAlign = 'top' | 'bottom' | 'center';

type VLoc = 'top' | 'bottom';
type VAlign = 'left' | 'right' | 'center';

// TODO: for later, will add all 
interface HPos { at: HLoc, align?: HAlign }
interface VPos { at: VLoc, align?: VAlign }

type Pos = HPos | VPos;

export type PositionOptions = HLoc | VLoc | Pos & { gap?: number }


export function position(elToPosition: HTMLElement, refEl: HTMLElement, opts: PositionOptions) {

	const { type, pos, gap } = parseOptions(opts);

	const top_left: { top: number, left: number } = { top: -1, left: -1 };

	const { width: elWidth, height: elHeight } = elToPosition.getBoundingClientRect();

	const { top: refTop, left: refLeft, right: refRight, bottom: refBottom, width: refWidth, height: refHeight } = refEl.getBoundingClientRect();


	//// Horizontal Positioning
	if (type === 'h') {

		//// calculate the left (location)
		const leftOnRight = refRight + gap;
		const leftOnLeft = refLeft - gap - elWidth;
		const windowWidth = window.innerWidth;

		// if left of left is out of window, then, display to the right anything (at least can be scrolled)
		if (leftOnLeft < 0) {
			top_left.left = leftOnRight;
		} else if (leftOnRight + elWidth > windowWidth) {
			top_left.left = leftOnLeft;
		} else if (pos.at === 'right') {
			top_left.left = leftOnRight;
		} else if (pos.at === 'left') {
			top_left.left = leftOnLeft;
		}

		//// calculate the top (alignment)
		if (pos.align === 'top') {
			top_left.top = refTop;
		} else if (pos.align === 'bottom') {
			top_left.top = refBottom;
		} else if (pos.align === 'center') {
			top_left.top = refTop + (refHeight / 2) - (elHeight / 2);
		}


	}

	//// Vertical Positioning
	else if (type === 'v') {

		//// calculate the top (location)
		// TODO: When top, need to check if enough room, otherwise bottom
		if (pos.at === 'bottom') {
			top_left.top = refBottom + gap;
		} else if (pos.at === 'top') {
			top_left.top = refTop - gap - elHeight;
		}

		//// calculate the left (alignement)
		if (pos.align === 'left') {
			top_left.left = refLeft;
		} else if (pos.align === 'right') {
			top_left.left = refRight - elWidth;
		} else if (pos.align === 'center') {
			top_left.left = refLeft + (refWidth / 2) - elWidth / 2;
		}

	}

	// if the rect.height + wanted_top > window.innherHeight, we should move up to offset
	// and have a .5rem bottom margin
	if (top_left.top + elHeight + 8 > window.innerHeight && top_left.top > top_left.top + elHeight + 8 - window.innerHeight) {
		top_left.top -= (top_left.top + elHeight + 8 - window.innerHeight);
	}

	style(elToPosition, { top: (top_left.top + scrollY) + 'px', left: (top_left.left + scrollX) + 'px' });
}



function parseOptions(opts: PositionOptions): { type: 'h', pos: HPos, gap: number } | { type: 'v', pos: VPos, gap: number } {
	let loc: HLoc | VLoc;
	let align: HAlign | VAlign | undefined;
	let gap: number = DEFAULT_GAP;

	if (typeof opts === 'string') {
		loc = opts;
	} else {
		loc = opts.at;
		align = opts.align;
		gap = opts.gap ?? DEFAULT_GAP;
	}
	//const loc: HLoc | VLoc = (typeof opts === 'string') ? opts : opts.loc;

	if (loc === 'left' || loc === 'right') {
		const align = (typeof opts !== 'string') ? opts.align as HAlign : 'top'; // by default align top
		return { type: 'h', pos: { at: loc, align }, gap };
	} else if (loc === 'top' || loc === 'bottom') {
		const align = (typeof opts !== 'string') ? opts.align as VAlign : 'left'; // by default align top
		return { type: 'v', pos: { at: loc, align }, gap };
	} else {
		throw new Error(`Can't getPos from ${opts}`);
	}
}