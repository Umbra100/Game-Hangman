import React from "react";

export const Model = new (class {
   constructor (){
      this.stand = ['M', 23, 0, 'c -5 0 -6 1 -6 6 l 0 19 l 3 3 l 3 -3 l 0 -16 c 0 -2 1 -3 3 -3 l 38 0 c 2 0 3 1 3 3 l 0 75 l 3 3 l 3 -3 l 0 -78 c 0 -5 -1 -6 -6 -6 l -44 0 z'];
      this.man = [
         ['M', 20, 32, 'a 1.5 1.5 90 0 0 0 18 a 1.5 1.5 90 0 0 0 -18 z'],
         ['M', 21.5, 53.5, 'a 1.5 1.5 90 0 0 -3 0 l 0 27 a 1.5 1.5 90 0 0 3 0 l 0 -27 z'],
         ['M', 14, 54.5, 'c 1.5 -1.5 3 0 1.5 1.5 l -10.5 10.5 c -1.5 1.5 -3 0 -1.5 -1.5 l 10.5 -10.5 z'],
         ['M', 26, 54.5, 'l 0 0 c -1.5 -1.5 -3 0 -1.5 1.5 l 10.5 10.5 c 1.5 1.5 3 0 1.5 -1.5 l -10.5 -10.5 z'],
         ['M', 14, 82.5, 'c 1.5 -1.5 3 0 1.5 1.5 l -12 18 c -1.5 1.5 -3 0 -1.5 -1.5 l 12 -18 z'],
         ['M', 26, 82.5, 'c -1.5 -1.5 -3 0 -1.5 1.5 l 12 18 c 1.5 1.5 3 0 1.5 -1.5 l -12 -18 z'],
         ['M', 31, 38, 'a 1 1 0 0 0 -22 3 l -6 2 a 1 1 0 0 0 1 3 l 27 -8 Z'],
         ['M', 16, 50, 'c 2 2 6 2 8 0 l 7 7 c 0.5 0.5 0.5 0.5 0 1 l -3 3 c -0.5 0.5 -0.5 0.5 -1 0 l -3 -3 l 0 12 c 0 1 0 1 -1 1 l -6 0 c -1 0 -1 0 -1 -1 l 0 -12 l -3 3 c -0.5 0.5 -0.5 0.5 -1 0 l -3 -3 c -0.5 -0.5 -0.5 -0.5 0 -1 l 7 -7 Z'],
         ['M', 16, 71, 'l 8 0 l 0 4 c 0 0.4 0.3 2 1 3 l 13 19 c 0.7 1 0.9 1 0 2 l -2 2 c -1.1 1 -1.3 1 -2 0 l -14 -20 l -14 20 c -0.8 1 -1 1 -2 0 l -2 -2 c -0.9 -1 -0.7 -1 0 -2 l 13 -19 c 0.7 -1 1 -2.6 1 -3 l 0 -4 Z'],
      ]
      this.style = {
         man: {
            fill: 'rgb(104, 89, 133)',
            stroke: 'white'
         },
         stand: {
            fill: 'rgb(45, 33, 48)'
         }
      }
   }
   get color(){
      return {
         man: this.style.man.fill,
         stand: this.style.stand.fill
      }
   }
   offset(x=0,y=0){
      let count = -1;
      let arg = [x,y];
      let ret = {stand: '', man: []};
      for (let i of this.stand) ret.stand += (typeof i == 'number' ? (
         count++,
         i + arg[count % 2]
      ) : i) + ' '
      for (let i of this.man){
         let push = '';
         for (let j of i) push += (typeof j == 'number' ? (
            count++,
            j + arg[count % 2]
         ) : j) + ' '
         ret.man.push(push);
      }
      return ret
   }
})()

const HangGraphic = ({id,options = {},className}) => {
   let index = 0;
   let {
      scale = 1,
      manColor = Model.color.man,
      standColor = Model.color.stand,
      stage = 8,
      standID,
      manID,
      modelOffset = [0,0],
      dimOffset = [0,0]
   } = options;
   let liveModel = Model.offset(modelOffset[0] / scale,modelOffset[1] / scale);
   let liveStyle = JSON.parse(JSON.stringify(Model.style));
   liveStyle.man.fill = manColor;
   liveStyle.man.transform = `scale(${scale})`;
   liveStyle.stand.fill = standColor;
   liveStyle.stand.transform = `scale(${scale})`;

   let stroke = liveStyle.man.stroke + '';
   delete liveStyle.man.stroke;

   return (
      <svg id = {id} className = {`hang-graphic${typeof className !== 'undefined' ? ' ' + className : ''}`} style = {{width: `${(73 * scale) + dimOffset[0]}px`, height: `${(104.639 * scale) + dimOffset[1]}px`}}>
         <path d = {liveModel.stand} style = {liveStyle.stand} id = {standID}/>
         <g id = {manID}>
            <path d = {(index < stage ? (index++,liveModel.man[index-1] ?? '') : '')} style = {liveStyle.man}/>
            <path d = {(index < stage ? (index++,liveModel.man[index-1] ?? '') : '')} style = {liveStyle.man}/>
            <path d = {(index < stage ? (index++,liveModel.man[index-1] ?? '') : '')} style = {liveStyle.man}/>
            <path d = {(index < stage ? (index++,liveModel.man[index-1] ?? '') : '')} style = {liveStyle.man}/>
            <path d = {(index < stage ? (index++,liveModel.man[index-1] ?? '') : '')} style = {liveStyle.man}/>
            <path d = {(index < stage ? (index++,liveModel.man[index-1] ?? '') : '')} style = {liveStyle.man}/>

            <path d = {(index < stage ? (index++,liveModel.man[index-1] ?? '') : '')} style = {{...liveStyle.man,stroke}}/>
            <path d = {(index < stage ? (liveModel.man[index] ?? '') : '')} style = {{...liveStyle.man,stroke}}/>
            <path d = {(index < stage ? (index+=2,liveModel.man[index-1] ?? '') : '')} style = {{...liveStyle.man,stroke}}/>
         </g>
      </svg>
   )
}

export default HangGraphic
