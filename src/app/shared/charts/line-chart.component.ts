import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';
@Component({
  selector: 'app-line-chart',
  standalone: true,
  template: `<div class="flex items-center justify-center p-6 pt-3">
    <svg #lineChart></svg>
  </div>`,
})
export class LineChartComponent {
  @ViewChild('lineChart') lineChart!: ElementRef<SVGElement>;
  @Input() data?:
    | { year: string; name: string; percent: number; value: number }[]
    | null;
  @Input() width: number = 600;
  @Input() height: number = 200;

  ngAfterViewInit(): void {
    this.createBarChart();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.createBarChart();
    }
  }
  createBarChart() {
    if (!this.data || !this.lineChart) return;
    console.log('data', this.data);
    this.lineChart.nativeElement.innerHTML = '';
    const marginTop = 30;
    const marginRight = 50;
    const marginBottom = 30;
    const marginLeft = 30;

    // Create the horizontal, vertical and color scales.
    const x = d3
      .scaleTime()
      .domain([+this.data[0]?.year, +this.data[this.data.length - 1]?.year])
      .range([marginLeft, this.width - marginRight]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.percent) as number])
      .range([this.height - marginBottom, marginTop]);

    const color = d3
      .scaleOrdinal()
      .domain(this.data.map((d) => d.name))
      .range(['#8082FF', '#F4A76F', '#57D2A9']);

    // Create the SVG container.
    const svg = d3
      .select(this.lineChart.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [0, 0, this.width, this.height])
      .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

    svg
      .append('g')
      .attr('transform', `translate(0,${this.height - marginBottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(this.width / 80)
          .tickSizeOuter(0),
      );

    // Add a container for each series.
    const serie = svg
      .append('g')
      .selectAll()
      .data(d3.group(this.data, (d) => d.name))
      .join('g');

    // Draw the lines.
    serie
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d) => color(d[0]) as string)
      .attr('stroke-width', 1.5)
      .attr('d', (d) =>
        d3
          .line()
          .x((d: any) => x(d.year))
          .y((d: any) => y(d.percent))(d[1] as any),
      );

    serie
      .append('g')
      .selectAll()
      .data((d) => d[1])
      .join('circle')
      .attr('r', '3')
      .attr('cx', (d) => x(+d.year))
      .attr('cy', (d) => y(d.percent))
      .attr('fill', (d) => color(d.name) as string);
  }
}
