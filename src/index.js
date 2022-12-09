import React from 'react'
import DOM from 'react-dom'

import HangGraphic from './HangGraphic'
import Word from './Word'
import * as UI from './UI'

import './style/index.css'
import WordIndex from './word-index'

let page = {
   main: {
      live: {
         sliderSelect: -1,
         hintSelect: false
      }
   },
   game: {
      options: {
         hints: null,
         difficulty: null,
         chances: null
      },
      live: {
         hints: {
            indexed: [],
            remaining: null
         },
         word: null,
         guesses: {
            correct: [],
            incorrect: [],
            history: []
         },
         outcome: null
      }
   },
   stage: 0,
   input: {
      allow: true,
      reason: null,
      priority: null
   },
   setInput: (obj,reset=false) => {
      if (page.input.allow !== true && page.input.reason !== null && page.input.priority !== null){
         if (obj.priority > page.input.priority) console.log(`Input Controller Set Overridden: `,page.input,obj);
         else {
            if (reset)page.input = {allow: true, reason: null, priority: null};
            else page.input = obj;
         }
      } else page.input = obj;
   }
}

const fadeCover = {
   el: document.getElementById('fadeCover'),
   run: (animation = {},coveredCallback) => new Promise((resolve) => {
      let el = fadeCover.el
      let {duration,delay} = animation;
      let cls = null;
      switch (page.stage){
         case 0: cls = 'main'; break;
         case 1: cls = 'game'; break;
         case 2: cls = 'end'; break;
         default: break;
      }
      if (typeof duration == 'number') el.style.animationDuration = `${duration}s`;
      if (typeof delay == 'number') el.style.animationDelay = `${delay}s`;
      el.className = `${cls} fadeIn`;
      page.setInput({allow: false, reason: 'Fade Animation', priority: 2});
      const listen = async () => {
         el.removeEventListener('animationend',listen);
         await coveredCallback();
         el.className = `${cls} fadeOut`;
         const listen2 = () => {
            el.removeEventListener('animationend',listen2);
            el.removeAttribute('style');
            page.setInput({priority: 2},true);
            resolve();
         }
         el.addEventListener('animationend',listen2);
      }
      el.addEventListener('animationend',listen);
   }),
   fadeOut: (animation = {}) => new Promise((resolve) => {
      let el = fadeCover.el;
      let {duration,delay} = animation;
      let cls = null;
      switch (page.stage){
         case 0: cls = 'main'; break;
         case 1: cls = 'game'; break;
         case 2: cls = 'end'; break;
         default: break;
      }
      if (typeof duration == 'number') el.style.animationDuration = `${duration}s`;
      if (typeof delay == 'number') el.style.animationDelay = `${delay}s`;
      el.className = `${cls} fadeOut`;
      page.setInput({allow: false, reason: 'Fade Out', priority: 1});
      const listen = async () => {
         el.removeEventListener('animationend',listen);
         el.removeAttribute('style');
         page.setInput({priority: 1},true);
         resolve();
      }
      el.addEventListener('animationend',listen);
   })
}

const BackGraphicData = new (class {
   constructor (){
      this.model = [
         ['M',0,' ',0,' l ',700,' ', 0,' l ',-700,' ',175,' l ',0,' ',-175,' z'],
         ['M',0,' ',0,' l ',500,' ', 0,' l ',-500,' ',200,' l ',0,' ',-200,' z'],
         ['M',0,' ',0,' l ',500,' ', 0,' l ',-500,' ',200,' l ',0,' ',-200,' z'],
         ['M',1920,' ',979,' l ',-700,' ',0,' l ',700,' ',-175,' l ',0,' ', 175,' z'],
         ['M',1920,' ',979,' l ',-500,' ',0,' l ',500,' ',-200,' l ',0,' ', 200,' z'],
         ['M',1920,' ',979,' l ',-500,' ',0,' l ',500,' ',-200,' l ',0,' ', 200,' z']
      ]
      this.style = {fill: [
         'rgb(142, 134, 255)',
         'rgb(255, 255, 255)',
         'rgb(94, 82, 255)',
         'rgb(142, 134, 255)',
         'rgb(255, 255, 255)',
         'rgb(94, 82, 255)'
      ]}
   }
   get color(){
      return [...this.style.fill];
   }
   offsetModel(off1=[0,0],off2=[0,0]){
      let mod = JSON.parse(JSON.stringify(this.model));
      for (let i = 0; i < mod.length; i++){
         if (i < 3){
            mod[i][1] += off1[0];
            mod[i][3] += off1[1];
         } else {
            mod[i][1] += off2[0];
            mod[i][3] += off2[1];
         }
      }
      return mod;
   }
   scaleModel(by1=1,by2){
      let factor = [by1,(typeof by2 == 'undefined' ? by1 : by2)];
      let mod = JSON.parse(JSON.stringify(this.model));
      for (let i of mod){
         for (let j = 1; j < i.length+1; j++){
            switch (j % 4){
               case 0:
                  i[j-1] = i[j-1] * factor[1];
                  break;
               case 2:
                  i[j-1] = i[j-1] * factor[0];
                  break;
               default: break;
            }
         }
      }
      return mod;
   }
})();
const BackGraphic = ({options={},className}) => {
   let {offset1,offset2} = options;
   let model = BackGraphicData.offsetModel(offset1,offset2);
   let color = BackGraphicData.color;
   let htm = [];
   for (let i = 0; i < model.length; i++) htm.push(<path d = {''.concat(...model[i])} fill = {color[i]} key = {i}/>);
   return (
      <div id = 'back-graphic' className = {className}>
         <svg>
            {htm}
         </svg>
      </div>
   )
}

const event = {
   windowResize: {
      main: () => {
         let factor = [window.innerWidth / 1920, window.innerHeight / 979];
         let el = [
            document.getElementById('title-graphic-container'),
            document.getElementById('back-graphic').children[0]
         ];
         el[0].setAttribute('style',`transform: scale(${factor[1]}) translate(0,-50%);`);
         let mod = BackGraphicData.scaleModel(factor[0],factor[1]);
         for (let i = 0; i < mod.length; i++){
            el[1].children[i].setAttribute('d',''.concat(...mod[i]));
         }
      },
      game: () => {
         let factor = [window.innerWidth / 1920, window.innerHeight / 979];
         let el = [
            document.getElementById('hangman-container'),
            document.getElementById('back-graphic').children[0],
            document.getElementById('hangman'),
            document.getElementById('strikes')
         ];
         el[0].setAttribute('style',`
         transform: 
            scale(${factor[1]}) 
            translate(-50%,-50%);
         left: ${50-((((el[2].clientWidth - (el[2].clientWidth * factor[1]))/2)/window.innerWidth)*100)}%;
         top: ${36.5-((((el[2].clientHeight - (el[2].clientHeight * factor[1]))/2)/window.innerHeight)*100)}%;`//36.5
         );

         let mod = BackGraphicData.scaleModel(factor[0],factor[1]);
         for (let i = 0; i < mod.length; i++){
            el[1].children[i].setAttribute('d',''.concat(...mod[i]));
         }
      },
      end: () => {
         let factor = [window.innerWidth / 1920, window.innerHeight / 979];
         let el = [document.getElementById('end-graphic')];
         el[0].children[0].setAttribute('style',`transform: scale(${factor[1]});`);
      }
   },
   keyPress: (e) => {
      if (page.input.allow){
         switch (page.stage){
            case 0:
               switch (e.key){
                  case 'Enter':
                     event.main.start();
                     break;
                  default: break;
               }
               break;
            case 1:
               if ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(e.key.toUpperCase()) !== -1){
                  let el = document.getElementById('entryField');
                  el.value = e.key;
                  el.focus();
               } else {
                  switch (e.key){
                     case 'Enter':
                        event.game.characterEnter(e);
                        break;
                     case '/':
                        let el = document.getElementById('hintButton');
                        if (page.main.live.hintSelect){
                           if (page.game.live.hints.remaining === 0){
                              el = document.getElementById('hintButton').children[2];
                              el.className = 'game alertFont';
                              const listen = () => {
                                 el.removeEventListener('animationend',listen);
                                 el.className = 'game';
                                 document.getElementById('hintButton').className = 'button game';
                                 page.main.live.hintSelect = false;
                              }
                              el.addEventListener('animationend',listen);
                           } else {
                              el.className = 'button game';
                              page.main.live.hintSelect = false;
                              event.game.hintButtonClick(e);
                           }
                        } else {
                           el.className = 'button game hover';
                           page.main.live.hintSelect = true;
                        }
                        break;
                     default: break;
                  }
               }
               break;
            case 2:
               switch (e.key){
                  case 'Enter':
                     event.end.playAgainButtonClick(e);
                     break;
                  default: break;
               }
               break;
            default: break;
         }
      }
   },
   keyDown: (e) => {
      if (page.input.allow){
         let el = null;
         let vls = null;
         let index = null;
         switch (page.stage){
            case 0:
               el = document.getElementsByClassName('slider main');
               index = page.main.live.sliderSelect;
               let data = null, range = null;
               for (let i of el) if (i.matches(':hover')) index = 'break';
               if (index === 'break') break;
               switch (e.key){
                  case 'ArrowUp':
                     index--;
                     if (index < 0) index = 2;
                     for (let i of el) if (i.className === 'slider main hover') i.className = 'slider main';
                     el[index].className = 'slider main hover';
                     page.main.live.sliderSelect = index;
                     break;
                  case 'ArrowDown':
                     index++;
                     if (index > 2) index = 0;
                     for (let i of el) if (i.className === 'slider main hover') i.className = 'slider main';
                     el[index].className = 'slider main hover';
                     page.main.live.sliderSelect = index;
                     break;
                  case 'ArrowLeft':
                     if (page.main.live.sliderSelect === -1) break;
                     data = UI.UIData[el[index].children[0].id];
                     range = 1000 / (data.notchCount+1);
                     if (data.value < range) break;
                     el[index].children[0].value = ((data.notchValue-1) * range) + (range / 2);
                     data.value = ((data.notchValue-1) * range) + (range / 2);
                     data.notchValue--;
                     data.labelValue = data.labels[data.notchValue];
                     if (page.main.live.sliderSelect === 2) event.main.onChanceChange(data);
                     break;
                  case 'ArrowRight':
                     if (page.main.live.sliderSelect === -1) break;
                     data = UI.UIData[el[index].children[0].id];
                     range = 1000 / (data.notchCount+1);
                     if (data.value > range * data.notchCount) break;
                     el[index].children[0].value = ((data.notchValue+1) * range) + (range / 2);
                     data.value = ((data.notchValue+1) * range) + (range / 2);
                     data.notchValue++;
                     data.labelValue = data.labels[data.notchValue];
                     if (page.main.live.sliderSelect === 2) event.main.onChanceChange(data);
                     break;
                  case 'Escape':
                     for (let i of el) if (i.className === 'slider main hover') i.className = 'slider main';
                     page.main.live.sliderSelect = -1;
                     break;
                  default: break;
               }
               break;
            case 1:
               el = document.getElementById('entryField');
               vls = 'ABCDEFGHIJKLMNOPQRSTUVWXYZA';
               index = vls.indexOf(el.value.toUpperCase());
               switch (e.key){
                  case 'Backspace':
                     el.value = '';
                     el.blur();
                     break;
                  case 'ArrowUp':
                     if (index-1 < 0) el.value = 'z';
                     else el.value = vls[index-1];
                     break;
                  case 'ArrowDown':
                     el.value = vls[index+1];
                     break;
                  case 'Escape':
                     el = [document.getElementById('hintButton'), document.getElementById('entryField')];
                     if (el[0].className === 'button game hover'){
                        el[0].className = 'button game';
                        page.main.live.hintSelect = false;
                     } else {
                        el[1].blur();
                     }
                     break;
                  default: break;
               }
               break;
            case 2:
               break;
            default: break;
         }
      }
   },
   main: {
      onChanceChange: (data) => {
         let par = document.getElementsByTagName('g')[0];
         if (data.labelValue === '6'){
            for (let i = 0; i < par.children.length; i++){
               if (i >= 6) par.children[i].style.opacity = '0';
            }
         } else {
            for (let i = 0; i < par.children.length; i++){
               if (i >= 6) par.children[i].style.opacity = '1';
            }
         }
      },
      start: () => new Promise(async (resolve) => {
         page.game.options.hints = UI.UIData.hintSlider.labelValue;
         page.game.options.difficulty = UI.UIData.difficultySlider.labelValue;
         page.game.options.chances = UI.UIData.chancesSlider.labelValue;

         page.game.live.hints.remaining = page.game.options.hints;
         const entries = WordIndex[page.game.options.difficulty];
         page.game.live.word = Object.keys(entries)[Math.round(Math.random() * (Object.keys(entries).length-1))];
         page.game.live.hints.indexed = entries[page.game.live.word];
         page.setInput({allow: false, reason: 'Game Starting', priority: 0});

         console.log(`Starting Game With Parameters: `,page.game);

         await fadeCover.run(undefined,() => {
            return new Promise(async (resolve) => {
               await pages.game.render(page.game.live.word,page.game.live.hints.indexed);
               resolve();
            })
         })
         setTimeout(async () => {
            await pages.game.updateHangman();
            page.setInput({priority: 0},true);
            resolve();
         },1000)
      })
   },
   game: {
      characterEnter: (e) => {
         let el = document.getElementById('entryField');
         let char = el.value.toUpperCase();
         let word = page.game.live.word.toUpperCase();
         if (char === ''){
            el.focus();
         } else {
            if (page.game.live.guesses.history.indexOf(char) !== -1){
               const listen = () => {
                  el.removeEventListener('animationend',listen);
                  el.className = 'textfield game';
               }
               el.className = 'textfield game alertFont';
               el.addEventListener('animationend',listen);
            } else {
               page.game.live.guesses.history.push(char);
               if (word.indexOf(char) !== -1){
                  let pass = true;
                  page.game.live.guesses.correct.push(char);
                  pages.game.updateWord();
                  for (let i of page.game.live.word) if (page.game.live.guesses.correct.indexOf(i.toUpperCase()) === -1) pass = false;
                  if (pass){
                     page.game.live.outcome = 'win';
                     console.log('Ending Game With Result: ',{
                        word: '' + page.game.live.word,
                        difficulty: '' + page.game.options.difficulty,
                        result: 'win'
                     });
                     setTimeout(() => {
                        let hangword = document.getElementById('hangword');
                        for (let i = 0; i < hangword.children.length; i++){
                           hangword.children[i].className = 'game winChar';
                           if (i === 0){
                              hangword.children[i].addEventListener('animationend',() => {
                                 setTimeout(() => {
                                    pages.end.render('win');
                                 },1000);
                              })
                           }
                        }
                     },400)
                  }
               } else {
                  page.game.live.guesses.incorrect.push(char);
                  pages.game.updateStrikes();
                  pages.game.updateHangman();
                  document.getElementById('strikes').children[page.game.options.chances-1].addEventListener('animationend',() => {
                     if (page.game.live.outcome == null){
                        page.game.live.outcome = 'loss';
                        console.log('Ending Game With Result: ',{
                           word: '' + page.game.live.word,
                           difficulty: '' + page.game.options.difficulty,
                           result: 'loss'
                        });
                        let el = document.getElementById('strikes');
                        let el2 = document.getElementById('hangword');
                        el.className = 'game lossChar';
                        for (let i of el2.children) {
                           i.className = 'game lossChar';
                           i.children[0].style = 'margin-bottom: -0.9611vw;';
                        }
                        const listen = () => {
                           el.removeEventListener('animationend',listen);
                           setTimeout(() => {
                              pages.end.render('loss');
                           },2000);
                        }
                        el.addEventListener('animationend',listen)
                     }
                  })
               }
            }
         }
      },
      hintButtonClick: (e) => {
         if (page.input.allow){
            if (page.game.live.hints.remaining !== 0){
               page.game.live.hints.remaining--;
               pages.game.updateHints();
            } else {
               let el = document.getElementById('hintButton').children[2];
               el.className = 'game alertFont';
               const listen = () => {
                  el.removeEventListener('animationend',listen);
                  el.className = 'game';
               }
               el.addEventListener('animationend',listen);
            }
         }
      },
      entryFieldScroll: (e) => {
         if (page.input.allow){
            e.target.focus();
            let vls = 'ABCDEFGHIJKLMNOPQRSTUVWXYZA';
            let index = vls.indexOf(e.target.value.toUpperCase());
            if (e.deltaY < 0){
               if (index-1 < 0) e.target.value = 'z';
               else e.target.value = vls[index-1];
            } else {
               e.target.value = vls[index+1];
            }
         }
      }
   },
   end: {
      playAgainButtonClick: (e) => {
         if (page.input.allow){
            UI.clear_UIData();
            fadeCover.run(undefined,() => new Promise(async (resolve) => {
               await pages.main.render();
               resolve();
            }))
         }
      }
   }
}

const pages = {
   main: {
      render: () => new Promise((resolve) => {
         DOM.render((
            <section>
               <div id = 'title-graphic-container' className = 'main'>
                  <div id = 'title-graphic' className = 'main'>
                     <HangGraphic options = {{
                        stage: 8,
                        scale: 6,
                        dimOffset: [100,100],
                        modelOffset: [54,102],
                        manID: 'HangGraphic-man'
                     }} className = 'main' />
                  </div><br /><br />
                  <UI.Button id = 'startButton' className = 'main' onClick = {(e) => {event.main.start(e);}}>Start</UI.Button>
               </div>
               <Word id = 'title' className = 'main'>Hangman</Word>
               <div id = 'ui-container' className = 'main'>
                  <UI.Slider id = 'difficultySlider' className = 'main' options = {{
                     notchCount: 2,
                     containerID: 'difficultySliderContainer',
                     width: '33.333vw',
                     labels: ['E','M','H']
                  }} onMouseOver = {(e) => {pages.main.sliderOnHover(e)}}><span>Difficulty</span></UI.Slider>
                  <br /><br />
                  <UI.Slider id = 'hintSlider' className = 'main' options = {{
                     notchCount: 2,
                     containerID: 'hintSliderContainer',
                     width: '33.333vw',
                     labels: ['1','2','3']
                  }} onMouseOver = {(e) => {pages.main.sliderOnHover(e)}}><span>Hints</span></UI.Slider>
                  <br /><br />
                  <UI.Slider id = 'chancesSlider' className = 'main' onNotchChange={event.main.onChanceChange} options = {{
                     notchCount: 1,
                     containerID: 'chancesSliderContainer',
                     width: '33.333vw',
                     labels: ['6','8']
                  }} onMouseOver = {(e) => {pages.main.sliderOnHover(e)}}><span>Chances</span></UI.Slider>
               </div>
               <BackGraphic className = 'main'/>
            </section>
         ),document.getElementById('root'),async () => {
            await pages.main.renderCallback();
            page.stage = 0;
            resolve();
         })
      }),
      renderCallback: () => new Promise(async (resolve) => {
         let el = document.getElementById('HangGraphic-man');
         el.children[6].style.opacity = '0';
         el.children[7].style.opacity = '0';
         el.children[8].style.opacity = '0';

         page.game = {
            options: {
               hints: null,
               difficulty: null,
               chances: null
            },
            live: {
               hints: {
                  indexed: [],
                  remaining: null
               },
               word: null,
               guesses: {
                  correct: [],
                  incorrect: [],
                  history: []
               },
               started: false,
               outcome: null
            }
         }
         window.onresize = event.windowResize.main;
         event.windowResize.main();
         await fadeCover.fadeOut({duration: 3, delay: 1});
         resolve();
      }),
      cssPath: './style/main_page.css',
      sliderOnHover: (e) => {
         if (page.input.allow){
            let el = document.getElementById('ui-container');
            for (let i of el.children) {
               if (i.className === 'slider main hover') i.className = 'slider main';
            }
            page.main.live.sliderSelect = -1;
         }
      }
   },
   game: {
      render: (word,hints) => new Promise((resolve) => {
         DOM.render((
            <section>
               <div id = 'hangman-container' className = 'game'>
                  <HangGraphic id = 'hangman' className = 'game' options = {{
                     scale: 5.9,
                     stage: parseInt(page.game.options.chances),
                     dimOffset: [0,30]
                     }}
                  />
                  <ul id = 'strikes' className = 'game'>
                     <li></li>
                     <li></li>
                     <li></li>
                     <li></li>
                     <li></li>
                     <li></li>
                     <li></li>
                     <li></li>
                  </ul>
               </div>
               <div id = 'hangword-container' className = 'game'>
                  <Word id = 'hangword' className = 'game'>{word || 'A'}</Word>
               </div>
               <div id = 'ui-container' className = 'game'>
                  <UI.Button id = 'enterButtonA' className = 'game' onClick = {(e) => {event.game.characterEnter(e);}}/>
                  <UI.TextField id = 'entryField' className = 'game' onWheel = {(e) => {event.game.entryFieldScroll(e);}}/>
                  <UI.Button id = 'enterButtonB' className = 'game' onClick = {(e) => {event.game.characterEnter(e);}}/>
               </div>
               <UI.Button id = 'hintButton' className = 'game' onClick = {(e) => {event.game.hintButtonClick(e);}} onMouseOver = {(e) => {pages.game.hintOnHover(e)}}>
                  <span>?</span>
                  <p>Use A Hint?</p>
                  <p id = 'hintsLeft-container'>(<span id = 'hintsLeft'>{page.game.options.hints}</span> Left)</p>
               </UI.Button>
               <ol id = 'hints' className = 'game'>
                  <span>Hints</span>
                  <li><span>{(hints && hints[0]) || ''}</span></li>
                  <li><span>{(hints && hints[1]) || ''}</span></li>
                  <li><span>{(hints && hints[2]) || ''}</span></li>
               </ol>
               <BackGraphic className = 'game'/>
            </section>
         ),document.getElementById('root'),async () => {
            window.onresize = event.windowResize.game;
            event.windowResize.game();
            page.stage = 1;
            resolve();
         })
      }),
      cssPath: './style/game_page.css',
      hintOnHover: (e) => {
         if (page.input.allow){
            let el = document.getElementById('hintButton');
            if (el.className === 'button game hover'){
               el.className = 'button game';
               page.main.live.hintSelect = false;
            }
         }
      },
      updateStrikes: () => {
         let el = document.getElementById('strikes');
         for (let i = 0; i < page.game.live.guesses.incorrect.length; i++){
            el.children[i].innerHTML = page.game.live.guesses.incorrect[i];
            el.children[i].className = 'appear game';
            el.children[i].addEventListener('animationend',(e) => {
               e.target.className = 'game';
            })
         }
      },
      updateHangman: () => new Promise((resolve) => {
         let el = document.getElementById('hangman').children[1];
         el.style.opacity = 0;
         const listen = () => {
            let pants = false;
            el.removeEventListener('transitionend',listen);
            for (let i = 0; i < el.children.length; i++){
               if (i < page.game.live.guesses.incorrect.length){
                  el.children[i].setAttribute('class','game');
                  pants = i === 7;
               } else {
                  el.children[i].setAttribute('class','hangHidden game');
                  if (pants) el.children[i].setAttribute('class','game');
               }
            }
            el.style.opacity = 1;

            const listen2 = () => {
               el.removeEventListener('transitionend',listen2);
               el.removeAttribute('style');
               resolve();
            }
            el.addEventListener('transitionend',listen2);
         }
         el.addEventListener('transitionend',listen);
      }),
      updateHints: () => {
         let el = document.getElementById('hints');
         el.children[0].style.opacity = 1;
         for (let i = 1; i < el.children.length; i++){
            if (i < parseInt(page.game.options.hints) - page.game.live.hints.remaining+1){
               const listen = (e) => {
                  e.target.removeEventListener('animationend',listen);
                  e.target.style = 'visibility: visible;'
                  e.target.className = 'game';
               }
               el.children[i].className = 'appear game';
               el.children[i].addEventListener('animationend',listen);
            }
         }
         el = document.getElementById('hintsLeft');
         el.innerHTML = page.game.live.hints.remaining;
      },
      updateWord: () => {
         let el = document.getElementById('hangword');
         for (let i of page.game.live.guesses.correct){
            for (let j of el.children){
               if (j.children[0].innerHTML === i) {
                  j.children[0].className = 'letter appear game';
                  j.children[0].style = 'margin-bottom: -0.9611vw;';
               }
            }
         }
      }
   },
   end: {
      render: (outcome = 'win') => fadeCover.run(undefined,() => new Promise((resolve) => {
         let color = (outcome === 'win' ? 'blue' : 'red');
         DOM.render((
            <section style = {{height: '100vh'}}>
               <svg id = 'end-graphic' className = 'end'>
                  <pages.end.TriGrid color = {color}/>
               </svg>
               <div id = 'end-title' className = 'end'>{(outcome === 'win' ? 'Great Job!' : 'So Close!')}</div>
               <UI.Button id = 'playAgain' className = {(outcome === 'win' ? 'red end' : 'blue end')} onClick = {(e) => {event.end.playAgainButtonClick(e)}}>Play Again</UI.Button>
            </section>
         ),document.getElementById('root'),() => {
            window.onresize = event.windowResize.end;
            event.windowResize.end();
            page.stage = 2;
            setTimeout(() => {
               resolve();
            },500);
         })
      })),
      Triangle: ({x = 0,y = 0,options = {}}) => {
         let {scale = 1,flipped = false} = options;
         let {animation,color = 'blue'} = options;
         let {active,delay} = animation || {};
         let model = [
            `M ${x} ${y} `,
            `m 0 ${6.6 * scale * (flipped ? -1 : 1)} `,
            `m ${-20 * scale} ${13.4 * scale * (flipped ? -1 : 1)} `,
            `l ${40 * scale} 0`,
            `l ${-20 * scale} ${-40 * scale * (flipped ? -1 : 1)} `,
            `l ${-20 * scale} ${40 * scale * (flipped ? -1 : 1)} `,
            'z'
         ]
         return (
            <path d = {''.concat(...model)} className = {`end-graphic-triangle end t${Math.round((Math.random() * 4)) + (color === 'blue' ? 1 : 6)}`} style = {{
               animation: (active ? 'triangle-breathe var(--triangle-breathe-time) ease-in-out infinite forwards' : undefined),
               animationDelay: `${delay}s`
            }}/>
         )
      },
      TriGrid: ({color = 'blue'}) => {
         let initialScale = 1.7, scale = 1.7, windowDim = [1920,979];
         let pos = [0 - (initialScale * 40),13.4 * initialScale], posRep = 0;
         let htm = [];
         while (pos[1] < windowDim[1] * 0.85){
            while (pos[0] < windowDim[0] + (initialScale * 40)){
               htm.push(<pages.end.Triangle x = {pos[0] + (initialScale * 40)} y = {pos[1]} key = {pos[0] + (initialScale * 40) + posRep} options = {{
                  scale: scale - (Math.round(Math.random() * 3) - 1.5) * 0.1,
                  flipped: (posRep % 2) === 0,
                  animation: {
                     active: true,
                     delay: Math.round(Math.random() * 5)
                  },
                  color
               }}/>);
               pos[0] += (initialScale * 40);
            }
            posRep++;
            if ((posRep % 2) === 0){
               pos[0] = 0 - (initialScale * 40);
               pos[1] += (initialScale * 40);
            } else {
               pos[0] = 0 - (initialScale * 20);
            }
            scale -= 0.065;
         }
         return (<g>{htm}</g>)
      }
   }
}

document.addEventListener('keypress',(e) => {event.keyPress(e)});
document.addEventListener('keydown',(e) => {event.keyDown(e)});

pages.main.render();
