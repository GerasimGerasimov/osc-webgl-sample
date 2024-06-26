import React, {Component} from 'react'
import './Trands.css'
import OutCanvas from './TOutCanvas';
import TViewBoxModel from './TViewBoxModel';

export enum ELegendViewMode {
  EndIndex,
  SelectedIndex
}

export interface ISelected {
  Index: number;
  Left: number;
}

export interface IDrawCanvasProps {
  viewBoxModel: TViewBoxModel;
  width: number;
  Selected: ISelected;
  ViewMode: ELegendViewMode;
  isMeasure: boolean;
}

export default class Canvas extends Component <IDrawCanvasProps, {}>{
  private ctx: any;
  private backbitmap: any = undefined;
  constructor(props: IDrawCanvasProps) {
    super(props);
  }

  saveContext(element: any) {
    this.ctx = element.getContext('bitmaprenderer', { alpha: false });
    const width: number = element.clientWidth;
    const height: number = element.clientHeight;
    this.props.viewBoxModel.resize(width, height);
  }

  componentDidMount() {
    this.draw();
  }

  componentDidUpdate() {
    setTimeout(()=>{
      this.draw();
    },0)
  }
  
  private drawSelectingPointer(left: number) {
    const canvas = this.props.viewBoxModel.Context; 
    canvas.strokeStyle = "gray";
    canvas.moveTo(left, 0);
    canvas.lineTo(left, canvas.canvas.height);
    canvas.stroke();
  }

  /*РИСОВАНИЕ НАЧИНАЕТСЯ ТУТ*/
  private draw() {
    const start = performance.now();
    this.props.viewBoxModel.draw();
    if (this.props.isMeasure)
      {this.drawSelectingPointer(this.props.Selected.Left)}
    this.backbitmap = this.props.viewBoxModel.Canvas.transferToImageBitmap();
    this.ctx.transferFromImageBitmap(this.backbitmap);
    const end = performance.now();
    const time = end - start;
    console.log(time);
  }

  render() {
    return (
      <>
        <OutCanvas width={this.props.width} contextRef={this.saveContext.bind(this)} />
      </>
    )
  }
}