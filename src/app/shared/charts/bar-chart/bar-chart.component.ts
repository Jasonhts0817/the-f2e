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
  template: `<svg #barChart></svg> `,
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements AfterViewInit {
  @ViewChild('barChart') barChart!: ElementRef<SVGElement>;
  @Input() data?: { year: string; name: string; value: number }[];
  @Input() width: number = 600;
  @Input() height: number = 18;

  ngAfterViewInit(): void {
    this.createBarChart();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.createBarChart();
    }
  }
  createBarChart() {
    if (!this.data) return;

    const fx = d3
      .scaleBand()
      .domain(new Set(this.data.map((d) => d.year)))
      .rangeRound([0, this.width])
      .paddingInner(0.1);

    const names = new Set(this.data.map((d) => d.name));

    const x = d3
      .scaleBand()
      .domain(names)
      .rangeRound([0, fx.bandwidth()])
      .padding(0.05);

    const color = d3
      .scaleOrdinal()
      .domain(names)
      .range(d3.schemeSpectral[names.size])
      .unknown('#ccc');

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.value) as number])
      .nice()
      .rangeRound([this.height, 0]);

    const formatValue = (x: number) =>
      isNaN(x) ? 'N/A' : x.toLocaleString('en');

    // Create the SVG container.
    const svg = d3
      .select(this.barChart.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('viewBox', [0, 0, this.width, this.height])
      .attr('style', 'max-width: 100%; height: auto;');

    svg
      .append('g')
      .selectAll()
      .data(d3.group(this.data, (d) => d.year))
      .join('g')
      .attr('transform', ([state]) => `translate(${fx(state)},0)`)
      .selectAll()
      .data(([, d]) => d)
      .join('rect')
      .attr('x', (d) => x(d.name) as number)
      .attr('y', (d) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d) => y(0) - y(d.value))
      .attr('fill', (d) => color(d.name) as string);

    svg
      .append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(fx).tickSizeOuter(0))
      .call((g) => g.selectAll('.domain').remove());

    svg
      .append('g')
      .attr('transform', `translate(0,0)`)
      .call(d3.axisLeft(y).ticks(null, 's'))
      .call((g) => g.selectAll('.domain').remove());
  }
}
