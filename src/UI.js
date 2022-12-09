import React from "react"
import './style/ui.css'

const unitToNum = (val,getUnit) => {
   if (typeof val !== 'string') throw new TypeError(`Cannot acquire unit number from value of not type String:  ${val}`);
   let index = -1;
   for (let i of val) if (isNaN(parseFloat(i)) && i !== '.') {index = val.indexOf(i); break;}
   if (getUnit) return [parseFloat(val),val.slice(index,val.length)];
   else return parseFloat(val);
}

export const Slider = ({id,options,onChange,onNotchChange,onMouseOver,style,children,className}) => {
   let {notchCount, containerID, labels, width = '50rem'} = options || {};
   width = unitToNum(width,true);
   if (typeof id == 'undefined') throw new TypeError(`UI components require an assigned id property`);
   if (typeof UIData[id] !== 'undefined') throw new Error(`UI component with ID '${id}' is already in use`);
   else UIData[id] = {
      value: 0,
      notchValue: 0,
      notchCount,
      type: 'Slider',
      labels,
      labelValue: (labels && labels[0]) || [],
      containerID,
   };
   let htm = [];
   for (var i = 0; i < notchCount; i++) htm.push(
      <div key = {i} className = 'slider-notch' style = {{
         marginLeft: `${(100 / (notchCount+1)) - 0.47}%`
      }}/>
   )

   htm.push(<br key = {i+1}/>);
   if (typeof labels !== 'undefined'){
      for (let j = i; j < notchCount+i+1; j++) htm.push(
         <div key = {j+2} className = 'slider-label' style = {{
            marginLeft: `${((((width[0] / (notchCount+1)) - (width[0] * 0.025 * labels[j-i].length))/2) - (width[0] * 0.0037))}${width[1]}`,
            marginRight: `${((((width[0] / (notchCount+1)) - (width[0] * 0.025 * labels[j-i].length))/2) - (width[0] * 0.0037))}${width[1]}`
         }}>{labels[j-i]}</div>
      )
   }
   return (
      <div className = {`slider${typeof className !== 'undefined' ? ' ' + className : ''}`} id = {containerID} style = {{width: `${width[0]}${width[1]}`,...style}} onMouseOver = {typeof onMouseOver == 'function' ? onMouseOver : undefined}>
         <input type = 'range' min = {0} max = {1000} style = {{width: `${width[0]}${width[1]}`}} id = {id} onChange = {(e) => {event.slider.onChange(e,onNotchChange,onChange)}}/>
         {htm}
         {children}
      </div>
   )
}

export const Button = (props) => {
   let {children: txt, id, style, onClick, onMouseOver, className} = props;
   if (typeof id == 'undefined') throw new TypeError(`UI components require an assigned id property`);
   if (typeof UIData[id] !== 'undefined') throw new Error(`UI component with ID '${id}' is already in use`);
   UIData[id] = {
      type: 'Button',
      label: txt
   }
   return (<div className = {`button${typeof className !== 'undefined' ? ' ' + className : ''}`} id = {id} style = {style} 
      onClick = {(e) => {event.button.onClick(e,onClick)}}
      onMouseOver = {typeof onMouseOver == 'function' ? onMouseOver : undefined}
      >
         {txt}
      </div>
   );
}

export const TextField = ({style,id,onFocus,onBlur,onWheel,className}) => {
   if (typeof id == 'undefined') throw new TypeError(`UI components require an assigned id property`);
   if (typeof UIData[id] !== 'undefined') throw new Error(`UI component with ID '${id}' is already in use`);
   UIData[id] = {
      type: 'TextField',
      focus: false
   }
   return (
      <textarea readOnly className = {`textfield${typeof className !== 'undefined' ? ' ' + className : ''}`} id = {id} maxLength = {1} style = {style}
         onFocus = {(e) => {event.textfield.onFocus(e,onFocus)}} 
         onBlur = {(e) => {event.textfield.onBlur(e,onBlur)}}
         onWheel = {(e) => {onWheel(e)}}
      ></textarea>
   )
}

export let UIData = {}
export const clear_UIData = () => {
   for (let i of Object.keys(UIData)) delete UIData[i];
}

const event = {
   slider: {
      onChange: (e,notchChangeCall,valueChangeCall) => {
         let dataTarget = UIData[e.target.id];
         const before = Object.assign({},dataTarget);
         dataTarget.value = e.target.value;
         dataTarget.notchValue = Math.floor(e.target.value / (1000 / (dataTarget.notchCount+1)));
         dataTarget.labelValue = dataTarget.labels[dataTarget.notchValue];
         if (dataTarget.notchValue !== before.notchValue && typeof notchChangeCall == 'function') notchChangeCall(dataTarget);
         if (typeof valueChangeCall == 'function') valueChangeCall(dataTarget);
      },
   },
   button: {
      onClick: (e,extra) => {
         if (typeof extra == 'function') extra(e);
      }
   },
   textfield: {
      onFocus: (e,extra) => {
         UIData[e.target.id].focus = true;
         if (typeof extra == 'function') extra(e);
      },
      onBlur: (e,extra) => {
         UIData[e.target.id].focus = false;
         if (typeof extra == 'function') extra(e);
      }
   }
}
