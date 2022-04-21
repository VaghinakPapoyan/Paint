//
// Create Canvas Start
//
function createCanvas(width, height, color) 
{
	let canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	canvas.style.backgroundColor = color;
	document.getElementById("canvas").appendChild(canvas)
	let ctx = canvas.getContext("2d");
	return { canvas, ctx };
}
//
// Create Canvas End
//

// Get Canvas And Ctx
var { canvas, ctx } = createCanvas(window.innerWidth, window.innerHeight, "#eee")
// for getting mouse click 
var mouseDown = false;
// Tool Type
let toolType = "pen";
// First Line Post
let lineStartX = null;
let lineStartY = null;
// Canvas div
const canvasDiv = document.getElementById("canvas");

//
// Paint Settings Start
//
// line Width
ctx.lineWidth = document.getElementById("lineWidthSelect").value * (document.getElementById("lineWidthSelect").value * 0.1);;
// line Cap
ctx.lineCap = "round";
// fill Color
ctx.fillStyle = document.getElementById("color").value;
// line Color
ctx.strokeStyle = document.getElementById("color").value;
//
// Paint Settings End
//

// Change Color
function ChangeColor() 
{
	ctx.fillStyle = document.getElementById("color").value;
	ctx.strokeStyle = document.getElementById("color").value;
}
document.getElementById("color").addEventListener("change", ChangeColor)

// Change Width
document.getElementById("lineWidthSelect").addEventListener("change", () => 
{
	ctx.lineWidth = document.getElementById("lineWidthSelect").value * (document.getElementById("lineWidthSelect").value * 0.1);
})

// Add Active Class
function addActiveClass(element)
{
	element.classList.toggle("active")
}

// Clear Canvas
function clearCanvas()
{
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if(Array.from(document.getElementsByClassName("text-input")))
	{
		Array.from(document.getElementsByClassName("text-input")).forEach(() => 
		{
			document.getElementsByClassName("text-input")[0].remove();
		})
	}
}

// Changing tools 
function changeTool(tool) 
{
	cancelActiveTools();
	tool.classList.add("active")
	toolType = tool.id;

	// change Cursor type 
	if(toolType === "text")
	{
		setCursor("text")
	}
	else
	{
		setCursor("auto")
	}
	// set Drag on objects 
	if(toolType === "move")
	{
		addDrag();
	}
	else{
		removeDrag();
	}
}

// Delete all active classes
function cancelActiveTools()
{
	tools = document.querySelectorAll(".tool");
	tools.forEach( tool => 
	{
		tool.classList.remove("active")
	})
}

function setCursor(cursor)
{
	canvasDiv.style.cursor = cursor;
}

// Resize Canvas
window.onresize = () => 
{
	var temp_cnvs = document.createElement('canvas');
	var temp_cntx = temp_cnvs.getContext('2d');
	temp_cnvs.width = canvas.width; 
	temp_cnvs.height = canvas.height;
	temp_cntx.fillStyle = "#eee";  // the original canvas's background color
	temp_cntx.fillRect(0, 0, canvas.width, canvas.height);
	temp_cntx.drawImage(canvas, 0, 0);
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx.drawImage(temp_cnvs, 0, 0);
	ctx.lineCap = "round";
	ctx.lineWidth = document.getElementById("lineWidthSelect").value * (document.getElementById("lineWidthSelect").value * 0.1);
	ctx.fillStyle = document.getElementById("color").value;
	ctx.strokeStyle = document.getElementById("color").value;
}

// start drag 
let startPositionX = 0, startPositionY = 0;
function startDrag(e)
{
	startPositionX = e.clientX
	startPositionY = e.clientY
}
// end drag 
function endDrag(e)
{
	extractX = Number(e.path[0].style.left.slice(0, -2)) + e.clientX - startPositionX;
	extractY = Number(e.path[0].style.top.slice(0, -2)) + e.clientY - startPositionY;
	e.path[0].style = e.path[0].style.cssText + `left: ${extractX}px; top: ${extractY}px;`;
}
// function for adding drag for objects
function addDrag()
{
	const array = [...document.getElementsByClassName("text-input")]
	array.forEach(input => {
		const element = document.getElementById(input.id);
		element.disabled = true;
		element.style.cursor = "grabbing";
		element.draggable = true;
		element.ondragstart = startDrag;
		element.ondragend = endDrag;
	})
}
function removeDrag()
{
	const array = [...document.getElementsByClassName("text-input")]
	array.forEach(input => {
		const element = document.getElementById(input.id);
		element.disabled = false;
		element.style.cursor = "default";
		element.draggable = false;
		element.ondragstart = null;
		element.ondragend = null;
	})
}
// Create input when chosen text tool type 
let inputCount = 0;
function createInput(e) 
{
	const input = document.createElement("input");
	input.classList.add("text-input");
	input.style = `top: ${e.clientY}px; left: ${e.clientX}px; font-size: ${document.getElementById("lineWidthSelect").value}mm; color: ${document.getElementById("color").value};`;
	document.getElementById("canvas").appendChild(input);
	inputCount++;
	input.id = "input" + inputCount;
}

// On mouse up input 
function focusInput() 
{
	document.getElementById("input" + inputCount).focus();
	document.getElementById("input" + inputCount).addEventListener("input", e => changeInput(e)(document.getElementById("input" + inputCount)));
	cancelActiveTools();
	toolType = '';
	document.body.style = "cursor: auto;"
}

// On type input
function changeInput(e)
{
	return thisInput => 
	{
		if(thisInput){
			if(e.target.value.length === 0)
				thisInput.remove();
			thisInput.style.width = (e.target.value.length || 1) + "ch";
		}
	}
}

// End Lasso
function endLasso()
{
	document.getElementById("bottomPopup").classList.remove("active")
	document.getElementById("bottomPopup").classList.add("close")
	lineStartX = null;
	lineStartY = null;
	setCursor("auto")
}

// Mouse Down
canvasDiv.onmousedown = e => 
{
	mouseDown = true;

	// Pen
	if(toolType === "pen")
	{
		ctx.moveTo(e.clientX, e.clientY)
		ctx.lineTo(e.clientX, e.clientY)
		ctx.stroke();
	}
	
	// Line
	else if(toolType === "line")
	{
		lineStartX = e.clientX;
		lineStartY = e.clientY;
		ctx.moveTo(e.clientX, e.clientY)
		setCursor("crosshair")
	}

	// Rect
	else if(toolType === "rect" || toolType === "circle")
	{
		lineStartX = e.clientX;
		lineStartY = e.clientY;
		setCursor("crosshair")
	}

	// Eraser
	else if(toolType === "eraser")
	{
		ctx.moveTo(e.clientX, e.clientY)
		ctx.strokeStyle = canvas.style.backgroundColor;
		ctx.moveTo(e.clientX, e.clientY)
		ctx.lineTo(e.clientX, e.clientY)
		ctx.stroke();
	}

	// Text 
	else if(toolType === "text")
	{
		createInput(e)
	}
	
	// lasso
	else if(toolType === "lasso")
	{
		if(lineStartX === null || lineStartY === null)
		{
			ctx.moveTo(e.clientX, e.clientY);
			lineStartX = e.clientX;
			document.getElementById("bottomPopup").classList.add("active")
			setCursor("crosshair")
			return lineStartY = e.clientY;
		}
		ctx.beginPath(); 
		ctx.moveTo(lineStartX, lineStartY);
		ctx.lineTo(e.clientX, e.clientY);
		lineStartX = e.clientX;
		lineStartY = e.clientY;
		ctx.stroke(); 
	}

	// Arrow
	else if(toolType === "arrow")
	{
		lineStartX = e.clientX;
		lineStartY = e.clientY;
		ctx.moveTo(e.clientX, e.clientY)
		setCursor("crosshair")
	}
}

// Mouse Up
canvasDiv.onmouseup = e => 
{
	if (mouseDown) 
	{
		mouseDown = false;
	
		// Pen
		if (toolType === "pen")
			ctx.beginPath();
	
		// Line
		else if(toolType === "line")
		{
			ctx.lineTo(e.clientX, e.clientY)
			ctx.stroke();
			ctx.beginPath();
			lineStartX = null;
			lineStartY = null;
			setCursor("auto")
		}
	
		// Rect
		else if (toolType === "rect")
		{
			const isFill = document.getElementById("bordered").classList[1] ? true : false;
			ctx.beginPath();
			ctx.rect(Math.min(lineStartX, e.clientX), Math.min(lineStartY, e.clientY), Math.max(e.clientX - lineStartX, lineStartX - e.clientX), Math.max(e.clientY - lineStartY, lineStartY - e.clientY))
			isFill ? ctx.fill() : ctx.stroke();
			lineStartX = null;
			lineStartY = null;
			setCursor("auto")
		}
	
		// Circle
		else if (toolType === "circle")
		{
			const isFill = document.getElementById("bordered").classList[1] ? true : false;
			ctx.beginPath();
			ctx.ellipse((e.clientX + lineStartX) / 2, (e.clientY + lineStartY) / 2, Math.max(e.clientX - lineStartX, lineStartX - e.clientX) / 2, Math.max(e.clientY - lineStartY, lineStartY - e.clientY) / 2, 0, 0*Math.PI, 2*Math.PI)
			isFill ? ctx.fill() : ctx.stroke();
			lineStartX = null;
			lineStartY = null;
			setCursor("auto")
		}

		// Eraser
		else if (toolType === "eraser")
		{
			ChangeColor();
		}

		// Text 
		else if(toolType === "text")
		{
			focusInput()
		}

		// Arrow
		else if(toolType === "arrow")
		{
			let headlen = 4 * document.getElementById("lineWidthSelect").value;
			if(ctx.lineWidth > 20)
			{
				ctx.lineWidth = 20
				headlen = 80;
			}
			const angle = getAngle({ x: lineStartX, y: lineStartY }, { x: e.clientX, y: e.clientY });
			ctx.lineTo(e.clientX, e.clientY);
			ctx.moveTo(e.clientX - headlen * Math.cos(angle - Math.PI / 6), e.clientY - headlen * Math.sin(angle - Math.PI / 6));
			ctx.lineTo(e.clientX, e.clientY);
			ctx.moveTo(e.clientX - headlen * Math.cos(angle + Math.PI / 6), e.clientY - headlen * Math.sin(angle + Math.PI / 6));
			ctx.lineTo(e.clientX, e.clientY);
			ctx.stroke();
			ctx.beginPath();
			lineStartX = null;
			lineStartY = null;
			setCursor("auto");
			ctx.lineWidth = document.getElementById("lineWidthSelect").value * (document.getElementById("lineWidthSelect").value * 0.1);
		}	
	}
}

// Mouse Over ( Drawing )
canvasDiv.onmousemove = e => 
{
	if (mouseDown) 
	{
		// Pen
		if(toolType === "pen")
		{
			ctx.lineTo(e.clientX, e.clientY)
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(e.clientX, e.clientY)
		}

		// Eraser
		if(toolType === "eraser")
		{
			ctx.lineTo(e.clientX, e.clientY)
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(e.clientX, e.clientY)
		}
	}
}

// Scroll setting 
var scrollEventHandler = function()
{
  window.scroll(0, window.pageYOffset)
}
window.addEventListener("scroll", scrollEventHandler, false);

// Get line angle 
const Rad2Deg = 180.0 / Math.PI;
const Deg2Rad = Math.PI / 180.0;
function getAngle(start, end)
{
	const atan2 = Math.atan2(end.y - start.y, end.x - start.x) 
   	return atan2
}