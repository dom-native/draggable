
**@dom-native/draggable** is a minimalist API for expressive in-page drag and drop based on PointerEvent. 

**Why:**  
  - Native HTML5 drag and drop API is great for in/out of browser drag and drop, but can be sub-optimal for in polished drag and drop. 
  - Dragging element with raw PointerEvent is possible but requires quite a bit of boilerplate code for polished behaviors.

[DEMO](https://demo.dom-native.org/draggable/index.html)

## Concepts

- Based on modern [PointerEvent](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent) (see [PointerEvent introduction](https://javascript.info/pointer-events))
- Follow the standard drag and drop event names 'DRAGSTART' | 'DRAG' | 'DRAGEND' ... but all uppercase to avoid native name polluting and does not attempt to mimic the native HTML5 APIs beyond the event naming.
- Fully delegatable, meaning the API does not need to bind each individual draggable element, but bind to the container with a selector for the elements (e.g., `draggable(rootEl, '.drag-me')`)
- No `evt.dataTransfer` but a `evt.detail` with all usefull context such as `.source, .ghost, .droppable, .over, .pointerEvent, .data, .originX, originY, ...` to build simple to advanced behavior.
- Common behavior such as moving the draggable with `position` or `translate` and ghost/clone builtin. 
- Implement a global drag and drop with one line 
  - `draggable(document, '.draggable', { drag: 'ghost' })`;
- Can be bound at the top level with `draggable(rootEl, selector, controller?)` 
- or activated on `pointerdown` with `activateDrag(sourceEl, pointerEvent, controller?)` for finer activation control.


## Install

```sh
# dom-native is a peer dependency
npm install dom-native @dom-native/draggable
```

## Quick Intro

```html
<div class="root-el">     
  <h4>Drag this and drop anywhere</h4>      
  <div class="box drag-me">Drag Me</div>
  <h4>Clone will show here</h4>
  <div class="zone show-zone"></div>
</div>
```

```ts
import { draggable } from '@dom-native/draggable';

// Makes all '.drag-me' element from rootEl draggable and droppable anywhere in the rootEl
// Note: O(1) binding - The selector '.drag-me' is 'live', meaning that the drag will get activated 
//                      when a roolEl's matching '.drag-me' element will be recieve pointerdown
draggable(rootEl, '.drag-me');

rootEl.addEventListener('DROP', (evt: any) => {
	const clone = evt.detail.source.cloneNode(true);

	// No matter where it is dropped, add it to the show-zone for this example
	first(rootEl, '.show-zone')!.append(clone);
});
```  


See more on [DEMO](https://demo.dom-native.org/draggable/index.html)









