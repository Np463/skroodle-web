import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { poly_simplify } from "../../util/simplify";
import "./Game.css";

const Canvas = forwardRef(
	({ canDraw = true, color = "#000", lineWidth = 2 }, ref) => {
		const canvasRef = useRef(null);
		const contextRef = useRef(null);

		let isDrawing = false;
		let startPoint = null;
		let points = [];
		let index = -1;
		let simplifyIndex = 0;

		useImperativeHandle(ref, () => ({
			clearCanvas() {
				_clearCanvas();
			},
			logPoints() {
				_logPoints();
			},
		}));

		useEffect(() => {
			const canvas = canvasRef.current;
			contextRef.current = canvas.getContext("2d");
		}, []);

		function handlePointerDown(e) {
			if (!canDraw) return;
			// console.log("DOWN: " + e);
			isDrawing = true;
			const point = getPoint(e);
			startPoint = point;
			const ctx = getContext();
			ctx.beginPath();
			ctx.moveTo(point[0], point[1]);
			ctx.lineTo(point[0], point[1]);
			ctx.stroke();
			index++;
			points[index] = [point];
		}

		function handleTouchDown(e) {
			e.clientX = e.touches[0].clientX;
			e.clientY = e.touches[0].clientY;
			// console.log("TOUCH DOWN: " + e);
			handlePointerDown(e);
		}

		function handlePointerUp(e) {
			if (!canDraw) return;
			// console.log("UP: " + e);
			isDrawing = false;
			// simplify the last stroke
			_logPoints();
			if (simplifyIndex < points.length) {
				contextRef.current.clearRect(0, 0, 1000, 600);
				const ctx = getContext();
				points[simplifyIndex] = poly_simplify(points[simplifyIndex], 1.5);
				console.log(points[simplifyIndex]);
				for (let i = 0; i < points.length; i++) {
					ctx.beginPath();
					ctx.moveTo(points[i][0][0], points[i][0][1]);
					for (let j = 0; j < points[i].length; j++) {
						ctx.lineTo(points[i][j][0], points[i][j][1]);
						ctx.stroke();
					}
				}
				simplifyIndex++;
			}
		}

		function handlePointerMove(e) {
			if (!canDraw) return;
			// console.log("MOVE: " + e);
			if (isDrawing) {
				const ctx = getContext();
				const point = getPoint(e);
				ctx.beginPath();
				ctx.moveTo(startPoint[0], startPoint[1]);
				ctx.lineTo(point[0], point[1]);
				ctx.stroke();
				points[index].push(point);
				startPoint = point;
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
			return [touch.clientX - rect.left, touch.clientY - rect.top];
		}

		function getContext() {
			let ctx = contextRef.current;
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = color;
			ctx.lineJoin = "round";
			ctx.lineCap = "round";
			return ctx;
		}

		function _clearCanvas() {
			points = [];
			index = -1;
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

		async function redraw() {
			contextRef.current.clearRect(0, 0, 1000, 600);
			const ctx = getContext();
			let simplifiedPoints = points;
			console.log(simplifiedPoints);
			for (let i = 0; i < simplifiedPoints.length; i++) {
				ctx.beginPath();
				ctx.moveTo(simplifiedPoints[i][0][0], simplifiedPoints[i][0][1]);
				for (let j = 0; j < simplifiedPoints[i].length; j++) {
					ctx.lineTo(simplifiedPoints[i][j][0], simplifiedPoints[i][j][1]);
					ctx.stroke();
					await new Promise((r) => setTimeout(r, 2));
				}
			}
		}

		function _logPoints() {
			console.log(points);
		}

		return (
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
		);
	}
);

export default Canvas;
