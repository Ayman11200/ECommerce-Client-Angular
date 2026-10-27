import { Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appImageZoom]',
  host: {
    '(pointerenter)': 'zoomIn($event)',
    '(pointermove)': 'move($event)',
    '(pointerleave)': 'zoomOut()',
  },
})
export class ImageZoom {
  zoom = input<number>(2);
  private img: HTMLImageElement = inject<ElementRef<HTMLImageElement>>(ElementRef).nativeElement;

  zoomIn(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    this.img.style.transform = `scale(${this.zoom()})`;
  }

  move(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    const box = this.img.parentElement!.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * 100;
    const y = ((event.clientY - box.top) / box.height) * 100;
    this.img.style.transformOrigin = `${x}% ${y}%`;
  }

  zoomOut() {
    this.img.style.transform = 'scale(1)';
  }
}
