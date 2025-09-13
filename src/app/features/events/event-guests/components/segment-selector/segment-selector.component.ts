import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { StandAloneModules } from 'src/app/shared/stand-alone-module';

@Component({
  selector: 'app-segment-selector',
  templateUrl: './segment-selector.component.html',
  styleUrls: ['./segment-selector.component.scss'],
  standalone: true,
  imports: [...StandAloneModules]
})
export class SegmentSelectorComponent implements OnInit {
  @Input() segments: { label: string; count?: number }[] = [];
  @Output() segmentClick = new EventEmitter<string>();
  @Input() isIos: boolean = false;

  selectedSegment = signal<string>('Todos');
  
  selectSegment(label: string) {
    this.selectedSegment.set(label);
    this.segmentClick.emit(label);
  }
  ngOnInit(): void {
    this.selectedSegment.set(this.segments[0].label)
  }

}
