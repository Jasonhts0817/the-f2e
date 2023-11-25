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
  @Input() themes?: string[] | null;
  @Input() width: number = 600;
  @Input() height: number = 200;

  ngAfterViewInit(): void {
    this.createBarChart();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['themes']) {
      this.createBarChart();
    }
  }
  createBarChart() {
    if (!this.data || !this.lineChart || !this.themes) return;
    console.log('data', this.data);
    this.lineChart.nativeElement.innerHTML = '';
    const marginTop = 10;
    const marginBottom = 20;
    const marginRight = 10;
    const marginLeft = 50;

    const x = d3
      .scaleBand()
      .domain(new Set(this.data.map((d) => d.year)))
      .range([marginLeft, this.width - marginRight])
      .paddingInner(1)
      .paddingOuter(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.percent) as number])
      .range([this.height - marginBottom, marginTop]);

    const color = d3
      .scaleOrdinal()
      .domain(this.data.map((d) => d.name))
      .range(this.themes);

    const svg = d3
      .select(this.lineChart.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [0, 0, this.width, this.height])
      .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;');

    const xAxis = d3.axisBottom(x).tickSizeInner(0);

    xAxis.tickFormat((value) => `${value.valueOf()}`);
    svg
      .append('g')
      .attr('transform', `translate(0,${this.height - marginBottom + 10})`)
      .call(xAxis)
      .call((g) => g.selectAll('.domain').remove());

    const yAxis = d3.axisLeft(y).tickSizeInner(0).ticks(5);
    yAxis.tickFormat((value) => `${value.valueOf()}%`);
    svg
      .append('g')
      .attr('transform', `translate(${marginLeft - 15},0)`)
      .call(yAxis)
      .call((g) => g.selectAll('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .attr('x1', 15)
          .attr('x2', this.width - marginLeft)
          .attr('stroke-opacity', 0.1),
      );

    const serie = svg
      .append('g')
      .selectAll()
      .data(d3.group(this.data, (d) => d.name))
      .join('g');

    serie
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d) => color(d[0]) as string)
      .attr('stroke-width', 1.5)
      .attr('d', (d) =>
        d3
          .line()
          .x((d: any) => x(d.year) as number)
          .y((d: any) => y(d.percent))(d[1] as any),
      );

    serie
      .append('g')
      .selectAll()
      .data((d) => d[1])
      .join('circle')
      .attr('r', '3')
      .attr('cx', (d) => x(d.year) as number)
      .attr('cy', (d) => y(d.percent))
      .attr('fill', (d) => color(d.name) as string);
  }
}
