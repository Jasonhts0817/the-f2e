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
  selector: 'app-bar-chart',
  standalone: true,
  template: `<div class="flex items-center justify-center p-6 pt-3">
    <svg #barChart></svg>
  </div>`,
})
export class BarChartComponent implements AfterViewInit {
  @ViewChild('barChart') barChart!: ElementRef<SVGElement>;
  @Input() data?: { year: string; name: string; value: number }[] | null;
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
    if (!this.data || !this.barChart) return;
    this.barChart.nativeElement.innerHTML = '';
    const marginTop = 10;
    const marginBottom = 20;
    const marginRight = 10;
    const marginLeft = 50;

    const fx = d3
      .scaleBand()
      .domain(new Set(this.data.map((d) => d.year)))
      .rangeRound([marginLeft + 10, this.width - marginRight - 10])
      .paddingInner(0.2);

    const names = new Set(this.data.map((d) => d.name));

    const x = d3
      .scaleBand()
      .domain(names)
      .rangeRound([0, fx.bandwidth()])
      .padding(0.05);

    const color = d3
      .scaleOrdinal()
      .domain(names)
      .range(['#8082FF', '#F4A76F', '#57D2A9'])
      .unknown('#ccc');

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.value) as number])
      .nice()
      .rangeRound([this.height - marginBottom, marginTop]);

    const formatValue = (x: number) =>
      isNaN(x) ? 'N/A' : x.toLocaleString('en');

    const svg = d3
      .select(this.barChart.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [0, 0, this.width, this.height])
      .attr('style', 'max-width: 100%; height: auto;');

    const xAxis = d3.axisBottom(fx).tickSizeInner(0);
    svg
      .append('g')
      .attr('transform', `translate(-10,${this.height - marginBottom + 10})`)
      .call(xAxis)
      .call((g) => g.selectAll('.domain').remove());

    const yAxis = d3.axisLeft(y).tickSizeInner(0).ticks(5);
    yAxis.tickFormat((value) => `${(value.valueOf() / 10000).toString()}萬`);
    svg
      .append('g')
      .attr('transform', `translate(${marginLeft - 14},0)`)
      .call(yAxis)
      .call((g) => g.selectAll('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .attr('x1', 15)
          .attr('x2', this.width - marginLeft - marginRight)
          .attr('stroke-opacity', 0.1),
      );

    svg
      .append('g')
      .selectAll()
      .data(d3.group(this.data, (d) => d.year))
      .join('g')
      .attr('transform', ([name]) => `translate(${fx(name)},0)`)
      .selectAll()
      .data(([, d]) => d)
      .join('rect')
      .attr('x', (d) => x(d.name) as any)
      .attr('y', (d) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d) => y(0) - y(d.value))
      .attr('fill', (d) => color(d.name) as string);
  }
}
