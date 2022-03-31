import { useState, useRef, useEffect } from "react";
import SizePicker from "./SizePicker";
import { CirclePicker } from "react-color";
import { poly_simplify } from "../../util/simplify";
import { colors } from "../../util/colors";
import "./Game.css";

export default function Game() {
	const [lineWidth, setLineWidth] = useState(2);
	const [color, setColor] = useState("#000");

	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const points = useRef([]);
	const index = useRef(-1);
	const simplifyIndex = useRef(0);
	const isDrawing = useRef(false);
	const startPoint = useRef(null);
	const canDraw = useRef(true);

	// let points = [];
	// let index = -1;
	// let simplifyIndex = 0;

	useEffect(() => {
		const canvas = canvasRef.current;
		contextRef.current = canvas.getContext("2d");
	}, []);

	function handlePointerDown(e) {
		if (!canDraw.current) return;
		// console.log("DOWN: " + e);
		isDrawing.current = true;
		const point = getPoint(e);
		startPoint.current = point;
		const ctx = getContext();
		ctx.strokeStyle = point[2];
		ctx.lineWidth = point[3];
		ctx.beginPath();
		ctx.moveTo(point[0], point[1]);
		ctx.lineTo(point[0], point[1]);
		ctx.stroke();
		index.current++;
		points.current[index.current] = [point];
	}

	function handleTouchDown(e) {
		e.clientX = e.touches[0].clientX;
		e.clientY = e.touches[0].clientY;
		// console.log("TOUCH DOWN: " + e);
		handlePointerDown(e);
	}

	function handlePointerUp(e) {
		if (!canDraw.current) return;
		// console.log("UP: " + e);
		// simplify the last stroke
		// if (simplifyIndex.current < points.current.length) {
		// 	points.current[simplifyIndex.current] = poly_simplify(
		// 		points.current[simplifyIndex.current],
		// 		1.5
		// 	);
		// 	redraw();
		// 	simplifyIndex.current++;
		// }
		if (isDrawing.current) {
			points.current[points.current.length - 1] = poly_simplify(
				points.current[points.current.length - 1],
				1.5
			);
			redraw();
		}
		isDrawing.current = false;
	}

	function redraw() {
		// const start = Date.now();
		contextRef.current.clearRect(0, 0, 1000, 600);
		const ctx = getContext();
		for (let stroke of points.current) {
			ctx.beginPath();
			ctx.moveTo(stroke[0][0], stroke[0][1]);
			for (let point of stroke) {
				ctx.strokeStyle = point[2];
				ctx.lineWidth = point[3];
				ctx.lineTo(point[0], point[1]);
				ctx.stroke();
			}
		}
		// console.log("Draw time: " + (Date.now() - start) / 1000);
	}

	function handlePointerMove(e) {
		if (!canDraw.current) return;
		// console.log("MOVE: " + e);
		if (isDrawing.current) {
			const ctx = getContext();
			const point = getPoint(e);
			ctx.strokeStyle = point[2];
			ctx.lineWidth = point[3];
			ctx.beginPath();
			ctx.moveTo(startPoint.current[0], startPoint.current[1]);
			ctx.lineTo(point[0], point[1]);
			ctx.stroke();
			points.current[index.current].push(point);
			startPoint.current = point;
		}
	}

	function handleTouchMove(e) {
		e.clientX = e.touches[0].clientX;
		e.clientY = e.touches[0].clientY;
		console.log("TOUCH MOVE: " + e);
		handlePointerMove(e);
	}

	function getPoint(touch) {
		const rect = canvasRef.current.getBoundingClientRect();
		return [
			touch.clientX - rect.left,
			touch.clientY - rect.top,
			color,
			lineWidth,
		];
	}

	function getContext() {
		let ctx = contextRef.current;
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = color;
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		return ctx;
	}

	function clearCanvas() {
		points.current = [];
		index.current = -1;
		simplifyIndex.current = 0;
		contextRef.current.clearRect(0, 0, 1000, 600);
	}

	async function simplify() {
		contextRef.current.clearRect(0, 0, 1000, 600);
		const ctx = getContext();
		ctx.strokeStyle = "#F60";
		let simplifiedPoints = points.map((p) => poly_simplify(p, 1.5));
		console.log(simplifiedPoints);
		for (let i = 0; i < simplifiedPoints.length; i++) {
			ctx.beginPath();
			ctx.moveTo(simplifiedPoints[i][0][0], simplifiedPoints[i][0][1]);
			for (let j = 0; j < simplifiedPoints[i].length; j++) {
				ctx.lineTo(simplifiedPoints[i][j][0], simplifiedPoints[i][j][1]);
				ctx.stroke();
				await new Promise((r) => setTimeout(r, 10));
			}
		}
	}

	function logPoints() {
		console.log(points.current);
	}

	function undo() {
		points.current.pop();
		if (index.current >= 0) {
			index.current--;
		}
		redraw();
	}

	return (
		<div id="game" className="game-container">
			<div className="game-top game-box">Top Bar</div>
			<div className="game-row">
				<div className="player-list game-box">Players</div>
				<canvas
					height={600}
					width={1000}
					ref={canvasRef}
					onMouseDown={handlePointerDown}
					onMouseUp={handlePointerUp}
					onMouseLeave={handlePointerUp}
					onMouseOut={handlePointerUp}
					onMouseMove={handlePointerMove}
					onTouchMove={handleTouchMove}
					onTouchStart={handleTouchDown}
					onTouchEnd={handlePointerUp}
				></canvas>
				<div className="chat-container game-box">
					<div className="chat-log">Chat</div>
					<input></input>
				</div>
			</div>
			<div className="game-bottom game-box">
				<CirclePicker
					color={color}
					onChangeComplete={(c) => setColor(c.hex)}
					colors={colors}
					width={530}
				/>
				<SizePicker lineWidth={lineWidth} onChange={setLineWidth} />
				<div>
					<button>Erase</button>
					<button onClick={clearCanvas}>Clear</button>
					<button onClick={logPoints}>log points</button>
					<button onClick={redraw}>redraw</button>
					<button onClick={undo}>Undo</button>
				</div>
			</div>
		</div>
	);
}
