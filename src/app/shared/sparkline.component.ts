import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-sparkline',
  standalone: true,
  template: `<canvas #canvas class="sparkline" [style.height.px]="height"></canvas>`,
})
export class SparklineComponent implements OnChanges {
  @Input({ required: true }) values: number[] = [];
  @Input() color = '#0e7490';
  @Input() height = 56;
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ngOnChanges(): void {
    queueMicrotask(() => this.draw());
  }

  private draw() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas || this.values.length < 2) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 300;
    canvas.width = width * dpr;
    canvas.height = this.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, this.height);

    const min = Math.min(...this.values);
    const max = Math.max(...this.values);
    const range = Math.max(1, max - min);
    const pad = 4;

    ctx.beginPath();
    this.values.forEach((v, i) => {
      const x = (i / (this.values.length - 1)) * width;
      const y = this.height - pad - ((v - min) / range) * (this.height - pad * 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.lineTo(width, this.height);
    ctx.lineTo(0, this.height);
    ctx.closePath();
    ctx.fillStyle = 'rgb(14 116 144 / 0.12)';
    ctx.fill();
  }
}
