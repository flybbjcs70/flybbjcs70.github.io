const WIDTH = 10;

const HEIGHT = 15;

const SPACE:number = 30;

const GAP = 2

const GAP_HEIGHT = ( HEIGHT - 2 ) * GAP
const GAP_WIDTH = (WIDTH - 2) * GAP

const TOTAL_WIDTH =  WIDTH * SPACE + ( WIDTH - 2 ) * GAP
const TOTAL_HEIGHT = HEIGHT * SPACE + (HEIGHT - 2) * GAP
// function setTempStyle(ctxt:CanvasRenderingContext2D){
//     return function(){

//     }
// }
const STYLE_GRID = '#294' // grid style

const SHAPES = {
    'L': {
        datas:[
            [[0,0],[0,1],[0,2],[1,2]],// L
            [[0,1],[1,1],[2,1],[2,0]], // __|
            [[0,0],[1,0],[1,1],[1,2]],     // 7
            [[0,0],[0,1],[1,0],[2,0]] // |==
        ],
        fillStyle: '#f00'
    },
    'O':{
        datas:[
            [[0,0],[0,1],[1,0],[1,1]]
        ],
        fillStyle:'#f00'
    },
    'I':{
        datas:[
            [[0,0],[0,1],[0,2],[0,3]],
            [[0,0],[1,0],[2,0],[3,0]]
        ]
    },
    'Z':{
        datas:[
            [[0,0],[1,0],[1,1],[2,1]],
            [[1,0],[1,1],[0,1],[0,2]]
        ]
    },
    'T':{
        datas:[
            [[1,0],[1,1],[0,1],[2,1]]
        ]
    }
}
type shape_type = typeof SHAPES['L'] | null
type shape_types = {
    [index:number]:keyof typeof SHAPES
} & Array<string>

const SHAPES_MAP:shape_types = ['L','O','I','Z','T']
const SHAPE_INIT_LOCATION:[number,number] = [5,0]
export default class Teris {
  context: CanvasRenderingContext2D
  data:Array<Array<number>> = [[0]]

  shape_location:[number,number] = SHAPE_INIT_LOCATION
  shape:shape_type = null
  shape_index:number = 0 // 当前形状的第几形态
  
  speed:number = 1000

  constructor(oCanvas: HTMLCanvasElement) {

    this.context = <CanvasRenderingContext2D>oCanvas.getContext("2d");

    this.init_structure(oCanvas);
    this.init_data()
    this.init_event()
    
    // this.draw_data()
    // this.draw_shape()
    this.run()
  }

  init_structure(oCanvas: HTMLCanvasElement) {
    oCanvas.width = TOTAL_WIDTH;
    oCanvas.height = TOTAL_HEIGHT;
  }
  init_data(){
      let data:Array<Array<number>> = [[]]
      for(let row = 0; row < HEIGHT; row++) {
          data[row] = []
          for(let col = 0; col < WIDTH; col++) {
              data[row].push(0)
          }
      }
      this.data = data

  }
  init_event(){
      let maps:{[key:number]:string} = {
          38:'UP',
          40:'DOWN',
          37:'LEFT',
          39:'RIGHT'
      }
      document.addEventListener('keyup',({keyCode})=>{
         if(maps[keyCode]) {
            this.event_handle(maps[keyCode])
         }
      })
  }
  event_handle(direction:string){
    if(direction == 'UP'){
        this.rotate_shape()
    }
    if(direction == 'LEFT') {
        this.move_shape_horizen(-1)
    }
    if(direction == 'RIGHT') {
        this.move_shape_horizen(1)
    }
    if(direction == 'DOWN'){
        this.speed = 30
        // pass
    }
  }
  rotate_shape(){
     if(!this.shape) return

     this.shape_index = ( this.shape_index + 1 ) % this.shape.datas.length

  }
  move_shape_horizen(step:number){
    this.shape_location = [
        this.shape_location[0] + step,
        this.shape_location[1]
    ]
  }
  run(){
      // 生成block
      // 每秒向下移动一格
      // 接受左右健移动
      // 判断是否触底 ？ 合并数据，是否能够消除，生成新block
      // 
      let ctx = this.context

      let drop = ()=>{
        if(!this.shape){
            this.shape = this.init_shape()
        }
        if(!this.drop_bottom()){
            this.drop_shape()
        }else{
            this.drop_bottom_action()
        }
        setTimeout(drop,this.speed)
      }
      drop()

      setInterval(()=>{
        ctx.clearRect(0,0,TOTAL_WIDTH,TOTAL_HEIGHT)
        this.draw_grid()
        this.draw_data()
        this.draw_shape()

      },1000 / 30)

  }
  drop_bottom(){
      let shape = this.shape
      let shape_index = this.shape_index
      let data = shape['datas'][shape_index] //[[0,1],[2,1]]
      let [x,y] = this.shape_location
      let datas = this.data

      for(let i = 0; i < data.length; i++) {
        let next_y = data[i][1] + y + 1
        let next_x = data[i][0] + x
        
        if(next_y >= HEIGHT) { // 多移一格看是否触底
            
          //  this.drop_bottom_action()
            return true
        }
        if(datas[next_y][next_x]) {
            
          //  this.drop_bottom_action()
            return true
        }
      }
      return false
  }
  drop_bottom_action(){
      let shape = this.shape 
      let datas = this.data
      let shape_index = this.shape_index
      let location = this.shape_location
      let shape_data = shape['datas'][shape_index]
      
      for(let i = 0; i < shape_data.length; i++) {
            let row = shape_data[i][1] + location[1]
            let col = shape_data[i][0] + location[0]
            datas[row][col] = 1
      }
     this.shape = null
     this.erase_action()

  }
  erase_action(){
    let datas = this.data


    for(let len = datas.length - 1; len > 0 ; len--) {

        if(datas[len].every(v=>v==1)){
            // datas[len] = datas[len-1]
            for(let pre = len; pre > 0 ; pre--) {
                datas[pre] = datas[pre - 1]
            }
        }
    }
  }
  draw_by_points(points:Array<Array<number>>){
    let ctx = this.context

    for(let i = 0; i < points.length; i++) {
        this.draw_point(points[i])
    }
  }
  draw_by_relative_points(points:Array<Array<number>>,origin:Array<number>){
    let ctx = this.context

    for(let i = 0; i < points.length; i++) {
        this.draw_relative_point(points[i],origin)
    }
  }
  draw_point(point:Array<number>){
    let ctx = this.context
    let [x,y] = point
    let x_len = this.calc_pixels_len(x)
    let y_len = this.calc_pixels_len(y)

    ctx.rect(x_len,y_len,SPACE,SPACE)
  }
  draw_relative_point(point:Array<number>,origin:Array<number>){
      this.draw_point([point[0]+origin[0],point[1]+origin[1]])
  }
  calc_pixels_len(x:number){
    return x * (SPACE + GAP)
  }
  draw_shape(){
      
      let shape = this.shape
      if(!shape) return
      let ctx = this.context
      
      ctx.beginPath()
      ctx.fillStyle = shape['fillStyle']
      this.draw_by_relative_points(shape['datas'][this.shape_index],this.shape_location)
      ctx.fill()

  }
  draw_data(){
      let ctx = this.context
      let data = this.data

      ctx.beginPath()
      ctx.fillStyle = '#0af'
      for(let row = 0; row < data.length;row++) {
          for(let col = 0; col < data[row].length; col++) {
            if(data[row][col]) {
                this.draw_point([col,row])
            }
          }
      }
      ctx.fill()
      ctx.closePath()

  }
  draw_grid(){
      let context = this.context
      let line_width_restore = context.lineWidth

      context.lineWidth = GAP
      
      let restoreStrokeStyle = this.set_strokeStyle(STYLE_GRID)
      context.beginPath()

      for(let i = 1; i < WIDTH; i++){
          context.moveTo(i * SPACE + (i-1) * GAP, 0)
          context.lineTo(i * SPACE + (i-1) * GAP, HEIGHT * SPACE + GAP_HEIGHT)
      }
      for(let j = 1; j < HEIGHT; j++){
        context.moveTo(0,                         j * SPACE + (j-1) * GAP)
        context.lineTo(WIDTH * SPACE + GAP_WIDTH, j * SPACE + (j-1) * GAP)           
      }

      context.closePath()
      context.stroke()
      restoreStrokeStyle()
  }
  init_shape(){
      this.shape_location = SHAPE_INIT_LOCATION
      this.shape_index = 0
      this.speed = 1000

      return SHAPES[SHAPES_MAP[Math.floor(Math.random() * SHAPES_MAP.length)]]
  }
  drop_shape(){
      this.shape_location = [
          this.shape_location[0],
          this.shape_location[1]+ 1
      ]
  }
  set_strokeStyle(style:string){
    let strokeStyle = this.context.strokeStyle

    this.context.strokeStyle = style

    return ()=>{
        this.context.strokeStyle = strokeStyle
    }
  }
}