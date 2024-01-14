const editorWindow = document.querySelector('.editor-container')
const draggableItems = document.querySelectorAll('.draggable-item')
const selectBox = document.getElementById('selectBox')
const grid = document.getElementById('gridOverlay')
const gridToggleBox = document.getElementById('gridToggleBox')
const gridSnapToggleBox = document.getElementById('gridSnapToggleBox')
const selectedItem = document.getElementById('selectedItemSettings')
const selectedItemContainer = document.getElementById('selectedItemSettingsContainer')
const selectedItemPos = document.getElementById('selectedItemPos')
const selectedItemOpacity = document.getElementById('selectedItemOpacity')
const opacitySlider = document.getElementById('opacitySlider')
const textColor = document.getElementById('textColor')
const textColorTop = document.getElementById('topTextColor')
const textColorBottom = document.getElementById('bottomTextColor')
const sampleText = document.getElementById('sampleText')

let mouseDragging;
let ctrlPressed;
let gridToggled;
let gridSnapping = false;

let selectedItems;
let mouseMovement = [];
let initialPos = {};

let fineFactor = 1;

let snappingIncrement = 27.85;
let snappingFactor = 0;




document.addEventListener('mousedown', MouseEvent => {

  if (!(MouseEvent.target.classList.contains('grid-overlay')) && !(MouseEvent.target.classList.contains('draggable-item')))  {return}

  clickedItem = MouseEvent.target.classList[1]
  selectItems(MouseEvent, clickedItem)

  mouseDragging = true;
  mouseMovement = [MouseEvent.clientX, MouseEvent.clientY]

  updateSelectedItems()

  if(MouseEvent.target.classList.contains('draggable-item')) document.addEventListener('mousemove', dragItems)

  if(!MouseEvent.target.classList.contains('grid-overlay')) return
  mouseMovement = [MouseEvent.clientX, MouseEvent.clientY]
  document.addEventListener('mousemove', dragSelectBox)

  
})

document.addEventListener('mouseup', MouseEvent => {
  mouseDragging = false;

  if(parseInt(selectBox.style.opacity) == 1) {
  draggableItems.forEach(item => {
    const elementRect = item.getBoundingClientRect();
    if (
      elementRect.left < Math.max(mouseMovement[0], mouseMovement[2]) &&
      elementRect.right > Math.min(mouseMovement[0], mouseMovement[2]) &&
      elementRect.top < Math.max(mouseMovement[1], mouseMovement[3]) &&
      elementRect.bottom > Math.min(mouseMovement[1], mouseMovement[3])
    ) { 
      item.classList.add('selected');
    updateSelectedItems()
  }
  });

}

  selectBox.style.width='0'
  selectBox.style.height='0'
  selectBox.style.top='0'
  selectBox.style.left='0'
  selectBox.style.opacity='0'

  document.removeEventListener('mousemove', dragItems)
  document.removeEventListener('mousemove', dragSelectBox)

  updateSelectedItemConfig()

})

document.addEventListener('keydown', key => {
  if (['ControlLeft','ControlRight'].includes(key.code)) {ctrlPressed = true; fineFactor = 55;return}
  if (['ShiftLeft','ShiftRight'].includes(key.code)) {shiftPressed = true; fineFactor = 28;return}
  if (['KeyG'].includes(key.code)) {toggleGrid()}
  if (['KeyC'].includes(key.code)) {toggleGridSnapping()}

  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(key.code)) {
    switch(key.code) {
      case 'ArrowUp': 
        selectedItems.forEach(item => {item.style.top = `${parseInt((item.style.top) || 0) - fineFactor}px`})
        break;
      case 'ArrowDown': 
        selectedItems.forEach(item => {item.style.top = `${parseInt((item.style.top) || 0) + fineFactor}px`})
        break;
      case 'ArrowLeft': 
        selectedItems.forEach(item => {item.style.left = `${parseInt((item.style.left) || 0) - fineFactor}px`})
        break;
      case 'ArrowRight': 
        selectedItems.forEach(item => {item.style.left = `${parseInt((item.style.left) || 0) + fineFactor}px`})
        break;
    }
    updateSelectedItemConfig()
  }
})

document.addEventListener('keyup', key => {
  if (['ControlLeft','ControlRight'].includes(key.code)) {ctrlPressed = false; fineFactor = 1; return}
  if (['ShiftLeft','ShiftRight'].includes(key.code)) {shiftPressed = false; fineFactor = 1; return}
})

const handleTextColorChange = (index) => (c) => {
  const itemId = selectedItems[0].id;
  const targets = [Mario, Luigi, YellowToad, BlueToad, CoinCounter, StarCoins, ScoreCounter, Timer];

  switch (itemId) {
    case "layout-p1-lives": targets[0].textColor[index] = c.target.value; break;
    case "layout-p2-lives": targets[1].textColor[index] = c.target.value; break;
    case "layout-p3-lives": targets[2].textColor[index] = c.target.value; break;
    case "layout-p4-lives": targets[3].textColor[index] = c.target.value; break;
    case "layout-coins": targets[4].textColor[index] = c.target.value; break;
    case "layout-starcoins": targets[5].textColor[index] = c.target.value; break;
    case "layout-score": targets[6].textColor[index] = c.target.value; break;
    case "layout-timer": targets[7].textColor[index] = c.target.value; break;
  }
  sampleText.style.backgroundImage = `linear-gradient(to bottom, ${textColorTop.value} 20%, ${textColorBottom.value} 100%)`;
};

textColorTop.addEventListener('change', handleTextColorChange(0));
textColorBottom.addEventListener('change', handleTextColorChange(1));



/*
 Linear Mapping:
  [L, R, T, B]
*/

const Mario = {
  position: ['0px', '0px'],
  element: 'layout-p1-lives',
  xmlPath: 'tag[name=P_marioIcon_00]',
  textColor: ['#ffffff', '#ffffff'],
  opacity: '100',
  editorMapping: {left: -86, right: 1126, top: -53, bottom: 639},
  ingameMapping: {left: -48, right: 741, top: 38, bottom: -399},
}

const Luigi = {
  position: ['0px', '0px'],
  element: 'layout-p2-lives',
  xmlPath: 'tag[name=P_luijiIcon_00]',
  textColor: ['#ffffff', '#ffffff'],
  opacity: '100',
  editorMapping: {left: -203, right: 1009, top: -53, bottom: 639},
  ingameMapping: {left: -48, right: 741, top: 38, bottom: -399},
}

const YellowToad = {
  position: ['0px', '0px'],
  element: 'layout-p3-lives',
  xmlPath: 'tag[name=P_kinoB_00]',
  textColor: ['#ffffff', '#ffffff'],
  opacity: '100',
  editorMapping: {left: -323, right: 889, top: -53, bottom: 639},
  ingameMapping: {left: -48, right: 741, top: 38, bottom: -399},
}

const BlueToad = {
  position: ['0px', '0px'],
  element: 'layout-p4-lives',
  xmlPath: 'tag[name=P_kinoY_00]',
  textColor: ['#ffffff', '#ffffff'],
  opacity: '100',
  editorMapping: {left: -443, right: 769, top: -53, bottom: 639},
  ingameMapping: {left: -48, right: 741, top: 38, bottom: -399},
}

const CoinCounter = {
  position: ['0px', '0px'],
  element: 'layout-coins',
  xmlPath: 'tag[name=N_coin_00]',
  textColor: ['#f6ff00', '#ff7b00'],
  opacity: '100',
  editorMapping: {left: -54, right: 1189, top: -96, bottom: 580},
  ingameMapping: {left: 26, right: 598, top: 55, bottom: -371},
}

const StarCoins = {
  position: ['0px', '0px'],
  element: 'layout-starcoins',
  xmlPath: 'tag[name=N_collection_00]',
  textColor: ['#ffffff', '#ffffff'],
  opacity: '100',
  editorMapping: {left: -53, right: 1081, top: -146, bottom: 528},
  ingameMapping: {left: 25, right: 564, top: 57, bottom: -369},
}

const ScoreCounter = {
  position: ['0px', '0px'],
  element: 'layout-score',
  xmlPath: 'tag[name=N_score_00]',
  textColor: ['#ffffff', '#ffffff'],
  opacity: '100',
  editorMapping: {left: -810, right: 252, top: -53, bottom: 639},
  ingameMapping: {left: -430.5, right: 77.5, top: 38, bottom: -401.5},
}

const Timer = {
  position: ['0px', '0px'],
  element: 'layout-timer',
  xmlPath: 'tag[name=N_time_00]',
  textColor: ['#ffffff', '#ffffff'],
  opacity: '100',
  editorMapping: {left: -1083, right: 84, top: -55, bottom: 639},
  ingameMapping: {left: -535, right: 21, top: 215, bottom: -224},
}

const ingameElements = [Mario, Luigi, YellowToad, BlueToad, CoinCounter, StarCoins, ScoreCounter, Timer]



opacitySlider.addEventListener('input', event => {
  if (selectedItems[0].classList[1] !== 'draggable-item') return

  selectedItems[0].style.opacity = `${opacitySlider.value}%`
  selectedItemOpacity.innerText = `Opacity: ${opacitySlider.value}%`


  switch(selectedItems[0].classList[0]) {
    case "layout-p1-lives": Mario.opacity = opacitySlider.value; break
    case "layout-p2-lives": Luigi.opacity = opacitySlider.value; break
    case "layout-p3-lives": YellowToad.opacity = opacitySlider.value; break
    case "layout-p4-lives": BlueToad.opacity = opacitySlider.value; break
    case "layout-coins": CoinCounter.opacity = opacitySlider.value; break
    case "layout-starcoins": StarCoins.opacity = opacitySlider.value; break
    case "layout-score": ScoreCounter.opacity = opacitySlider.value; break
    case "layout-timer": Timer.opacity = opacitySlider.value; break
    }
})

function downloadFile(e,o){const t=new Blob([o],{type:"text/plain"}),d=URL.createObjectURL(t),n=document.createElement("a");n.href=d,n.download=e,document.body.appendChild(n),n.click(),document.body.removeChild(n),URL.revokeObjectURL(d)}

function generate() {  
  updateItemPositions()
  // console.clear();

  fetch("../../meta/data/NSMBW/ingame-layout-original.xmlyt")
    .then((response) => response.text())
    .then((xmlString) => {

      // const brlytBinary = writeBrlytFromXML(xmlString)
      // downloadFile('gameScene_37.brlyt', brlytBinary)
      // console.log(brlytBinary)
      
      const xmlDocument = new DOMParser().parseFromString(xmlString, "text/xml");

      ingameElements.forEach((element) => {

          let translateXMLPath = xmlDocument.querySelector(`${element.xmlPath} > translate`);

          // Translations
          const mappedPosition = translateOffsets(element);
          translateXMLPath.querySelector("x").textContent = mappedPosition[0].toString();
          translateXMLPath.querySelector("y").textContent = mappedPosition[1].toString();

          // Opacity
          const translatedOpacity = translateOpacity((document.getElementById(element.element).style.opacity || 1) * 100);
          setOpacity(element, xmlDocument, translatedOpacity)

          // Text Color
          setColors(element, xmlDocument);
      });

      // Logging the updated XML document
      // console.log(xmlDocument);

      loadConverter(xmlDocument, function(newDoc) {
        downloadFile('gameScene_37.xmlyt', newDoc);
      });
    });
}



/* More functions */


function updateSelectedItems() {
  selectedItems = document.querySelectorAll('.selected')
  selectedItems.forEach(item => {
    let computedStyle = window.getComputedStyle(item);
    let x = computedStyle.getPropertyValue('left');
    let y = computedStyle.getPropertyValue('top');
    initialPos[item.classList[0]] = { x , y }
  })
}

function selectItems(MouseEvent, clickedItem) {
  if(clickedItem == 'draggable-item') {
    if(!ctrlPressed) {
    switch(clickedItem) {
      case "draggable-item": 
        
      if(MouseEvent.target.classList[2] == 'selected') break

        clearSelectedItems()
        MouseEvent.target.classList.add('selected')
        break
    }}

    if(ctrlPressed) {
    switch(clickedItem) {
      case "draggable-item":
      if(MouseEvent.target.classList[2] == 'selected') {MouseEvent.target.classList.remove('selected'); break}
      MouseEvent.target.classList.add('selected')
      break
    }}
  } 
  
  else clearSelectedItems()
}

function clearSelectedItems() {
  if(ctrlPressed) return
  updateSelectedItems()
  selectedItems.forEach(item => {item.classList.remove('selected')})
  selectedItemContainer.style.display = "none" 
}

function toggleGrid() {

  if(gridToggled) {grid.style.opacity = '0%'} else {grid.style.opacity = '100%'}; gridToggled = !gridToggled
  if(!gridToggleBox.classList.contains('active')) {gridToggleBox.classList.add('active')} else {gridToggleBox.classList.remove('active')}
  if(gridSnapToggleBox.classList.contains('active')) gridSnapToggleBox.classList.remove('active')

  if(snappingFactor > 0) {
    gridSnapToggleBox.textContent = 'Snapping [OFF]'
    snappingFactor = 0
    gridSnapToggleBox.classList.remove('active')
  }

}

function toggleGridSnapping() {
  if(!gridToggled) toggleGrid()

  switch(snappingFactor) {
    case 0:
      gridSnapToggleBox.classList.add('active')
      gridSnapToggleBox.textContent = 'Snapping [1x]'
      snappingFactor = 1
      break
    case 1:
      gridSnapToggleBox.textContent = 'Snapping [1/2x]'
      snappingFactor = 2
      break
    case 2:
      gridSnapToggleBox.textContent = 'Snapping [1/4x]'
      snappingFactor = 4
      break
    case 4:
      gridSnapToggleBox.textContent = 'Snapping [OFF]'
      snappingFactor = 0
      gridSnapToggleBox.classList.remove('active')
      break
  }
  gridSnapping = !gridSnapping
}

function dragItems(MouseEvent) {
  if (!mouseDragging) return;

  if(snappingFactor > 0) {
    snappingIncrement = (27.85 / snappingFactor)
  } else {
    snappingIncrement = 1
  }

  mouseMovement[2] = MouseEvent.clientX
  mouseMovement[3] = MouseEvent.clientY
  
  selectedItems.forEach(item => {
    // Calculate the new position based on the initial position and mouse movement
    let deltaX = parseInt(initialPos[item.classList[0]].x) + mouseMovement[2] -  mouseMovement[0];
    let deltaY = parseInt(initialPos[item.classList[0]].y) + mouseMovement[3] - mouseMovement[1];

  // Snap to the nearest multiple of snappingIncrement
  deltaX = Math.round(deltaX / snappingIncrement) * snappingIncrement;
  deltaY = Math.round(deltaY / snappingIncrement) * snappingIncrement;

  // Set the new position
  item.style.left = `${deltaX}px`;
  item.style.top = `${deltaY}px`;
  });



}

function dragSelectBox(MouseEvent) {
  mouseMovement[2] = MouseEvent.clientX
  mouseMovement[3] = MouseEvent.clientY

  selectBox.style.opacity = '1'

  selectBox.style.left = `${Math.min(mouseMovement[0], mouseMovement[2])}px`;
  selectBox.style.width = `${Math.abs(mouseMovement[2] - mouseMovement[0])}px`;

  // Calculate top and height dynamically based on mouse coordinates
  selectBox.style.top = `${Math.min(mouseMovement[1], mouseMovement[3])}px`;
  selectBox.style.height = `${Math.abs(mouseMovement[3] - mouseMovement[1])}px`;
}

function updateSelectedItemConfig() { 
  if(!selectedItems[0]) return
  let selectedItemPosition = [(selectedItems[0].style.left || `0px`), (selectedItems[0].style.top || `0px`)]

  switch(selectedItems[0].classList[0]) {
    case "layout-p1-lives":
      Mario.position = selectedItemPosition
      opacitySlider.value = Mario.opacity
      textColorTop.value = Mario.textColor[0]
      textColorBottom.value = Mario.textColor[1]
      break

    case "layout-p2-lives":
      Luigi.position = selectedItemPosition
      opacitySlider.value = Luigi.opacity
      textColorTop.value = Luigi.textColor[0]
      textColorBottom.value = Luigi.textColor[1]
      break
      
    case "layout-p3-lives":
    YellowToad.position = selectedItemPosition
    opacitySlider.value = YellowToad.opacity
    textColorTop.value = YellowToad.textColor[0]
    textColorBottom.value = YellowToad.textColor[1]
      break

    case "layout-p4-lives":
      BlueToad.position = selectedItemPosition
      opacitySlider.value = BlueToad.opacity
      textColorTop.value = BlueToad.textColor[0]
      textColorBottom.value = BlueToad.textColor[1]
      break

    case "layout-coins":
      CoinCounter.position = selectedItemPosition
      opacitySlider.value = CoinCounter.opacity
      textColorTop.value = CoinCounter.textColor[0]
      textColorBottom.value = CoinCounter.textColor[1]
      break

    case "layout-starcoins":
      StarCoins.position = selectedItemPosition
      opacitySlider.value = StarCoins.opacity
      textColorTop.value = StarCoins.textColor[0]
      textColorBottom.value = StarCoins.textColor[1]
      break

    case "layout-score":
      ScoreCounter.position = selectedItemPosition
      opacitySlider.value = ScoreCounter.opacity
      textColorTop.value = ScoreCounter.textColor[0]
      textColorBottom.value = ScoreCounter.textColor[1]
      break

    case "layout-timer":
      Timer.position = selectedItemPosition
      opacitySlider.value = Timer.opacity
      textColorTop.value = Timer.textColor[0]
      textColorBottom.value = Timer.textColor[1]
      break

    }

    selectedItemPos.innerText = `(${selectedItemPosition[0]}, ${selectedItemPosition[1]})`
    selectedItemOpacity.innerText = `Opacity: ${opacitySlider.value}%`
    
  
    if (selectedItems.length === 1) { 
      selectedItemContainer.style.display = "grid" 
      selectedItem.src = selectedItems[0].src
      sampleText.style.backgroundImage = `linear-gradient(to bottom, ${textColorTop.value} 20%, ${textColorBottom.value} 100%)`;


      if(selectedItems[0].id === 'layout-starcoins') {
        sampleText.style.display = `none`
        textColor.style.display = `none`
        textColorTop.style.display = `none`
        textColorBottom.style.display = `none`
      } else {
        sampleText.style.display = `block`
        textColor.style.display = `block`
        textColorTop.style.display = `block`
        textColorBottom.style.display = `block`
      }
    } 


    else { 
      selectedItemContainer.style.display = "none" 
    }
  }
  
function updateItemPositions() {
  ingameElements.forEach(item => {
    const itemElement = document.getElementById(item.element)
    item.position = [itemElement.style.left, itemElement.style.top]
  })
}
  
function translateOffsets(element) {

  const editorLeft = element.editorMapping.left;
  const editorRight = element.editorMapping.right;
  const editorTop = element.editorMapping.top;
  const editorBottom = element.editorMapping.bottom;

  const ingameLeft = element.ingameMapping.left;
  const ingameRight = element.ingameMapping.right;
  const ingameTop = element.ingameMapping.top;
  const ingameBottom = element.ingameMapping.bottom;

  const x = element.position[0].split('px')[0];
  const y = element.position[1].split('px')[0];

  // Mapping xy values using linear mapping
  const mappedX = ((x - editorLeft) / (editorRight - editorLeft)) * (ingameRight - ingameLeft) + ingameLeft;
  const mappedY = ((y - editorTop) / (editorBottom - editorTop)) * (ingameBottom - ingameTop) + ingameTop;

  return [mappedX, mappedY];
}

function translateOpacity(decimal) {
  const clampedValue = Math.min(100, Math.max(0, decimal));
  const hexValue = Math.round((clampedValue / 100) * 255).toString(16).toUpperCase();
  const paddedHexValue = hexValue.length === 1 ? `0${hexValue}` : hexValue;
    
  return paddedHexValue;
}

function setColors(element, xmlDocument) {
  switch(element.element) {
    case "layout-p1-lives":
      updateColorAttributes(xmlDocument, `T_x_01`, element.textColor)
      updateColorAttributes(xmlDocument, `T_left_00`, element.textColor)
      break;
    case "layout-p2-lives":
      updateColorAttributes(xmlDocument, `T_x_02`, element.textColor)
      updateColorAttributes(xmlDocument, `T_left_01`, element.textColor)
      break;
    case "layout-p3-lives":
      updateColorAttributes(xmlDocument, `T_x_04`, element.textColor)
      updateColorAttributes(xmlDocument, `T_left_03`, element.textColor)
      break;
    case "layout-p4-lives":
      updateColorAttributes(xmlDocument, `T_x_03`, element.textColor)
      updateColorAttributes(xmlDocument, `T_left_02`, element.textColor)
      break;
    case "layout-coins":
      updateColorAttributes(xmlDocument, `T_coin_00`, element.textColor)
      break;
    case "layout-score":
      updateColorAttributes(xmlDocument, `T_score_00`, element.textColor)
      break;
    case "layout-timer":
      updateColorAttributes(xmlDocument, `T_time_00`, element.textColor)
      break;
  }
}

function updateColorAttributes(xmlDocument, tagName, textColor) {
  const topcolor = xmlDocument.querySelector(`tag[name=${tagName}] > topcolor`);
  const bottomcolor = xmlDocument.querySelector(`tag[name=${tagName}] > bottomcolor`);

  topcolor.setAttribute('r', textColor[0].substring(1, 3));
  topcolor.setAttribute('g', textColor[0].substring(3, 5));
  topcolor.setAttribute('b', textColor[0].substring(5, 7));

  bottomcolor.setAttribute('r', textColor[1].substring(1, 3));
  bottomcolor.setAttribute('g', textColor[1].substring(3, 5));
  bottomcolor.setAttribute('b', textColor[1].substring(5, 7));
}

function setOpacity(element, xmlDocument, opacity) {
  switch(element.element) {
    case "layout-p1-lives": 
      xmlDocument.querySelector(`tag[name=P_marioIcon_00] > alpha`).textContent = opacity; 
      xmlDocument.querySelector(`tag[name=T_left_00] > alpha`).textContent = opacity;
      xmlDocument.querySelector(`tag[name=T_x_01] > alpha`).textContent = opacity;
      break
    case "layout-p2-lives": 
      xmlDocument.querySelector(`tag[name=P_luijiIcon_00] > alpha`).textContent = opacity; 
      xmlDocument.querySelector(`tag[name=T_left_01] > alpha`).textContent = opacity;
      xmlDocument.querySelector(`tag[name=T_x_02] > alpha`).textContent = opacity;
      break
    case "layout-p3-lives": 
      xmlDocument.querySelector(`tag[name=P_kinoY_00] > alpha`).textContent = opacity; 
      xmlDocument.querySelector(`tag[name=T_left_03] > alpha`).textContent = opacity;
      xmlDocument.querySelector(`tag[name=T_x_04] > alpha`).textContent = opacity;
      break
    case "layout-p4-lives": 
      xmlDocument.querySelector(`tag[name=P_kinoB_00] > alpha`).textContent = opacity; 
      xmlDocument.querySelector(`tag[name=T_left_02] > alpha`).textContent = opacity;
      xmlDocument.querySelector(`tag[name=T_x_03] > alpha`).textContent = opacity;
      break
    case "layout-coins":
      xmlDocument.querySelector(`tag[name=T_coin_00] > alpha`).textContent = opacity;
      xmlDocument.querySelector(`tag[name=P_coin_00] > alpha`).textContent = opacity;
      break
    case "layout-starcoins":
      xmlDocument.querySelector(`tag[name=P_collectOff_00] > alpha`).textContent = opacity;
      xmlDocument.querySelector(`tag[name=P_collectOff_01] > alpha`).textContent = opacity;
      xmlDocument.querySelector(`tag[name=P_collectOff_02] > alpha`).textContent = opacity;
      xmlDocument.querySelector(`tag[name=P_collection_00] > alpha`).textContent = opacity;
      xmlDocument.querySelector(`tag[name=P_collection_01] > alpha`).textContent = opacity;
      xmlDocument.querySelector(`tag[name=P_collection_02] > alpha`).textContent = opacity;
      break
    case "layout-score": 
      xmlDocument.querySelector(`tag[name=T_score_00] > alpha`).textContent = opacity;
      break
    case "layout-timer":
      xmlDocument.querySelector(`tag[name=T_time_00] > alpha`).textContent = opacity;
      xmlDocument.querySelector(`tag[name=P_timer_00] > alpha`).textContent = opacity;
      break



  }   
}

function setTextColor(element, xmlDocument, color) {
  const textColor = ([color[0] || color, color[1] || color])
  console.log(textColor)
}

function loadConverter(xmlDocument, callback) {
  const script = document.createElement('script');
  script.src = '../../meta/lib/convert-to-brlyt.js';
  document.head.appendChild(script);
  
  script.onload = function() {
    const newDoc = convertToBRLYT(xmlDocument);
    callback(newDoc);
  };
}