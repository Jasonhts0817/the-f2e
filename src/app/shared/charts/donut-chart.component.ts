import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<svg #donutChart class="max-w-full"></svg>`,
})
export class DonutChartComponent implements OnChanges {
  @ViewChild('donutChart') donutChart!: ElementRef<SVGElement>;
  @Input() data?: number[] | null;
  @Input() width: number = 124;

  ngAfterViewInit(): void {
    this.createDonutChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.createDonutChart();
    }
  }
  createDonutChart() {
    if (!this.data || !this.donutChart) return;
    this.donutChart.nativeElement.innerHTML = '';
    const height = Math.min(this.width, 500);
    const radius = Math.min(this.width, height) / 2;

    const arc = d3
      .arc()
      .innerRadius(radius * 0.8)
      .outerRadius(radius - 1);

    const pie = d3
      .pie()
      .padAngle(1 / radius)
      .value((d: any) => d);

    const color = d3.scaleOrdinal().range(['#D4009B', '#E2E8F0']);

    const svg = d3
      .select(this.donutChart?.nativeElement)
      .attr('width', this.width)
      .attr('height', height)
      .attr('viewBox', [-this.width / 2, -height / 2, this.width, height]);

    svg
      .append('g')
      .selectAll()
      .data(pie(this.data))
      .join('path')
      .attr('fill', (d) => color(d as any) as any)
      .transition()
      .delay((d, i) => {
        return i * 500;
      })
      .duration(500)
      .attrTween('d', (d) => {
        const i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
        return (t) => {
          d.endAngle = i(t);
          return arc(d as any) as any;
        };
      });

    svg
      .append('text')
      .attr('y', -10)
      .attr('class', 'text-body-2')
      .attr('text-anchor', 'middle')
      .text(`投票率`);
    svg
      .append('text')
      .attr('y', 20)
      .attr('class', 'text-h5')
      .attr('fill', '#D4009B')
      .attr('text-anchor', 'middle')
      .text(`${this.data[0]}%`);
  }
}
