import React from 'react'
import './style/word.css'

export const Letter = ({children: txt}) => {
   return (txt !== ' ' ?
      <article>
         <p className = 'letter'>{txt}</p>
         <div className = 'letter-underline'/>
      </article> :
      <br/>
   )
}

const Word = ({children: text,id,className}) => {
   const htm = Array.prototype.map.call(text,(char,index) => <Letter key = {index}>{char.toUpperCase()}</Letter>);
   return <div className = {`word${typeof className !== 'undefined' ? ' ' + className : ''}`} id = {id}>{htm}</div>
}

export default Word
