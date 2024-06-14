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

// https://webglfundamentals.org/webgl/lessons/ru/webgl-fundamentals.html

const vertex_shader_2d: string = `
  // атрибут, который будет получать данные из буфера
  attribute vec4 a_position;
 
  // все шейдеры имеют функцию main
  void main() {
 
    // gl_Position - специальная переменная вершинного шейдера,
    // которая отвечает за установку положения
    gl_Position = a_position;
  }
`;

const fragment_shader_2d: string =`
  // фрагментные шейдеры не имеют точности по умолчанию, поэтому нам необходимо её
  // указать. mediump подойдёт для большинства случаев. Он означает "средняя точность"
  precision mediump float;
 
  void main() {
    // gl_FragColor - специальная переменная фрагментного шейдера.
    // Она отвечает за установку цвета.
    gl_FragColor = vec4(1, 0, 0.5, 1); // вернёт красновато-фиолетовый
  }
`;

function createShader(gl: WebGL2RenderingContext, type:number, source: string):WebGLShader | null {
  var shader:WebGLShader | null = gl.createShader(type);   // создание шейдера
  if (shader) {
    gl.shaderSource(shader, source);      // устанавливаем шейдеру его программный код
    gl.compileShader(shader);             // компилируем шейдер
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {                        // если компиляция прошла успешно - возвращаем шейдер
      return shader;
    }
  }
  console.log(shader? gl.getShaderInfoLog(shader) : "WebGL шейдер не создался");
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl:WebGL2RenderingContext, vertexShader:WebGLShader, fragmentShader:WebGLShader): WebGLProgram | null {
  var program: WebGLProgram | null = gl.createProgram();
  if (program) {
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
  }
  console.log(program? gl.getProgramInfoLog(program) : "WebGL программа не создалась");
  gl.deleteProgram(program);
  return null;
}

function clearScreen(gl: WebGL2RenderingContext) {
  gl.clearColor(0.8, 0.8, 0.8, 1.0); // установить в качестве цвета очистки буфера цвета СЕРЫЙ, полная непрозрачность
  gl.enable(gl.DEPTH_TEST); // включает использование буфера глубины
  gl.depthFunc(gl.LEQUAL); // определяет работу буфера глубины: более ближние объекты перекрывают дальние
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // очистить буфер цвета и буфер глубины.
}

export default class Canvas extends Component <IDrawCanvasProps, {}>{
  private ctx: any;
  private backbitmap: any = undefined;
  constructor(props: IDrawCanvasProps) {
    super(props);
  }

  saveContext(element: any) {
    this.ctx = element.getContext('webgl', {preserveDrawingBuffer: true});
    const gl:WebGL2RenderingContext = this.ctx;
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex_shader_2d);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment_shader_2d);
    if (vertexShader && fragmentShader) {
      var program: WebGLProgram | null = createProgram(gl, vertexShader, fragmentShader);
      if (program) {
        var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
        var positionBuffer: WebGLBuffer | null = gl.createBuffer();
        if (positionBuffer) {
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          // три двумерных точки
          var positions = [
            0, 0,      //0я-точка начало
            0.25, 0.25,//0я-точка конец
            0.25, 0.25,//1я-точка начало
            0.75, -0.5   //1я-точка конец
          ];
          gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
          gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
          clearScreen(gl);
          gl.useProgram(program);// говорим использовать нашу программу (пару шейдеров)
          gl.enableVertexAttribArray(positionAttributeLocation);
          // Привязываем буфер положений
          gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
          // Указываем атрибуту, как получать данные от positionBuffer (ARRAY_BUFFER)
          var size = 2;          // 2 компоненты на итерацию
          var type = gl.FLOAT;   // наши данные - 32-битные числа с плавающей точкой
          var normalize = false; // не нормализовать данные
          var stride = 0;        // 0 = перемещаться на size * sizeof(type) каждую итерацию для получения следующего положения
          var offset = 0;        // начинать с начала буфера
          gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

          var primitiveType: number = gl.LINES;//gl.TRIANGLES;
          var offset: number = 0;
          var count: number = 4;
          gl.drawArrays(primitiveType, offset, count);
        }
      }
    }
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
    },0)//TODO тут надо задавать как часто обновляется график тредов
  }
  
  private drawSelectingPointer(left: number) {
    /*
    const canvas = this.props.viewBoxModel.Context; 
    canvas.strokeStyle = "gray";
    canvas.moveTo(left, 0);
    canvas.lineTo(left, canvas.canvas.height);
    canvas.stroke();
    */
  }

  /*РИСОВАНИЕ НАЧИНАЕТСЯ ТУТ*/
  private draw() {
    const start = performance.now();
    this.props.viewBoxModel.draw();
    if (this.props.isMeasure)
      {this.drawSelectingPointer(this.props.Selected.Left)}
    this.backbitmap = this.props.viewBoxModel.Canvas.transferToImageBitmap();
    /*TODO отрисовка */
    //this.ctx.transferFromImageBitmap(this.backbitmap);
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