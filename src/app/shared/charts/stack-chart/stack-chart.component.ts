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
  selector: 'app-stack-chart',
  standalone: true,
  imports: [CommonModule],
  template: `<svg
    #stackChart
    class="max-w-full overflow-hidden rounded-full"
  ></svg>`,
  styleUrls: ['./stack-chart.component.scss'],
})
export class StackChartComponent implements OnChanges {
  @ViewChild('stackChart') stackChart!: ElementRef<SVGElement>;
  @Input() data?: { name: string; value: number }[] | null;
  @Input() width: number = 600;
  @Input() height: number = 18;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.createStackChart();
    }
  }
  createStackChart() {
    if (!this.data || !this.stackChart) return;
    this.stackChart.nativeElement.innerHTML = '';
    const series = d3
      .stack()
      .keys(d3.union(this.data.map((d) => d.name)))
      .value(([, D]: any, key) => D.get(key).value)
      .offset(d3.stackOffsetExpand)(
      d3.index(
        this.data,
        () => {},
        (d) => d.name,
      ) as any,
    );

    const x = d3.scaleLinear().domain([0, 1]).range([0, this.width]);

    const color = d3
      .scaleOrdinal()
      .domain(series.map((d) => d.key))
      .range(['#8082FF', '#F4A76F', '#57D2A9'])
      .unknown('#ccc');

    const svg = d3
      .select(this.stackChart?.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [0, 0, this.width, this.height]);

    const g = svg
      .append('g')
      .selectAll()
      .data(series)
      .join('g')
      .attr('fill', (d) => color(d.key) as any);
    g.selectAll('rect')
      .data((D) => D.map((d: any) => ((d.key = D.key), d)))
      .join('rect')
      .attr('x', (d) => x(d[0]))
      .attr('y', (d) => 0)
      .attr('height', this.height)
      .transition()
      .attr('width', (d) => x(d[1]) - x(d[0]));
    g.selectAll('text')
      .data((D) => D.map((d: any) => ((d.key = D.key), d)))
      .join('text')
      .attr('x', (d) => (x(d[1]) - x(d[0])) * 0.45 + x(d[0]))
      .attr('y', this.height * 0.75)
      .attr('class', 'text-small')
      .attr('fill', 'white')
      .text((d) => `${Math.round((d[1] - d[0]) * 100)}%`);
  }
}
