import { useState, useRef, useEffect } from "react";
import { Redirect } from "react-router";
import { CirclePicker } from "react-color";
import { useSelector, useDispatch } from "react-redux";
import {
	setGameState,
	setWord,
	setRound,
	setMaxRound,
	setDrawer,
	setWordChoices,
	addChatMessage,
	setTurnScores,
	setScoreboard,
} from "reducers/gameSlice";
import { setPlayers, addPlayer, removePlayer } from "reducers/lobbySlice";
import socket from "api/socketClient";
import SizePicker from "./SizePicker";
import Loader from "components/Loader/Loader";
import { poly_simplify } from "util/simplify";
import { colors } from "util/colors";
import "./Game.css";

export default function Game() {
	const [lineWidth, setLineWidth] = useState(2);
	const [color, setColor] = useState("#000");
	const [timer, setTimer] = useState(0);
	const [chatInput, setChatInput] = useState("");

	const game = useSelector((state) => state.game);
	const lobby = useSelector((state) => state.lobby);
	const user = useSelector((state) => state.user);

	const dispatch = useDispatch();

	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const points = useRef([]);
	const index = useRef(-1);
	const isDrawing = useRef(false);
	const startPoint = useRef(null);
	const canDraw = useRef(false);
	const countdownInterval = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		contextRef.current = canvas?.getContext("2d");
	});

	useEffect(() => {
		socket.emit("game:getState", lobby.lobbyId, (res) => {
			dispatch(setWord(res.word));
			dispatch(setDrawer(res.drawer));
			dispatch(setMaxRound(res.rounds));
			dispatch(setRound(res.currentRound));
			dispatch(setPlayers(res.players));
			dispatch(setGameState(res.gameState));
			dispatch(setScoreboard(res.scoreboard));
			if (res.drawer?.userId === user.userId) {
				canDraw.current = true;
			}
			if (res.canvasPoints.length > 0) {
				points.current = points.current.concat(res.canvasPoints);
				redraw();
			}
			countdownTimer(res.dueDate);
		});
		socket.on("game:choosingWord", ({ drawer, dueDate, round, gameState }) => {
			countdownTimer(dueDate);
			dispatch(setGameState(gameState));
			dispatch(setDrawer(drawer));
			dispatch(setRound(round));
			dispatch(setWord(""));
		});
		socket.on("game:wordChoices", (wordChoices) => {
			dispatch(setWordChoices(wordChoices));
		});
		socket.on("game:turnStart", ({ word, dueDate, gameState }) => {
			clearCanvas();
			dispatch(setWord(word));
			dispatch(setGameState(gameState));
			countdownTimer(dueDate);
		});
		socket.on("game:selectedWord", (word) => {
			canDraw.current = true;
			dispatch(setWord(word));
		});
		socket.on(
			"game:turnEnd",
			({ word, dueDate, gameState, turnScores, scoreboard }) => {
				canDraw.current = false;
				dispatch(setWord(word));
				dispatch(setGameState(gameState));
				dispatch(setTurnScores(turnScores));
				dispatch(setScoreboard(scoreboard));
				countdownTimer(dueDate);
			}
		);
		socket.on("game:roundEnd", ({ dueDate, gameState }) => {
			dispatch(setGameState(gameState));
			countdownTimer(dueDate);
		});
		socket.on("game:gameEnd", ({ dueDate, gameState }) => {
			dispatch(setGameState(gameState));
			countdownTimer(dueDate);
		});
		socket.on("game:addPoint", ({ existingStroke, newPoints }) => {
			if (existingStroke.length > 0) {
				if (points.current.length === 0) {
					points.current.push([existingStroke]);
				} else {
					points.current[points.current.length - 1] =
						points.current[points.current.length - 1].concat(existingStroke);
				}
			}
			if (newPoints.length > 0) {
				if (points.current.length === 0) {
					points.current = [];
				}
				for (const pointArr of newPoints) {
					points.current.push(pointArr);
				}
			}
			redraw();
		});
		socket.on("game:clearCanvas", () => {
			clearCanvas();
		});
		socket.on("game:undo", () => {
			undo();
		});
		socket.on("game:sendChatMessage", (message) => {
			dispatch(addChatMessage(message));
		});
		return () => {
			clearInterval(countdownInterval.current);
			socket.off("game:choosingWord");
			socket.off("game:wordChoices");
			socket.off("game:turnStart");
			socket.off("game:turnEnd");
			socket.off("game:roundEnd");
			socket.off("game:gameEnd");
			socket.off("game:addPoint");
			socket.off("game:clearCanvas");
			socket.off("game:undo");
			socket.off("game:sendChatMessage");
		};
	}, [dispatch, lobby.lobbyId]);

	function countdownTimer(dueDate) {
		clearInterval(countdownInterval.current);
		countdownInterval.current = setInterval(
			(dueDate) => {
				let remainingTime = dueDate - Date.now();
				if (remainingTime <= 0) {
					setTimer(0);
					clearInterval(countdownInterval.current);
					return;
				}
				setTimer(remainingTime);
			},
			250,
			dueDate
		);
	}

	function handlePointerDown(e) {
		if (!canDraw.current) return;
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
		socket.emit("game:canvasDraw", {
			roomId: lobby.lobbyId,
			index: index.current,
			point: point,
		});
	}

	function handleTouchDown(e) {
		e.clientX = e.touches[0].clientX;
		e.clientY = e.touches[0].clientY;
		handlePointerDown(e);
	}

	function handlePointerUp(e) {
		if (!canDraw.current) return;
		// if (isDrawing.current) {
		// 	points.current[points.current.length - 1] = poly_simplify(
		// 		points.current[points.current.length - 1],
		// 		1.5
		// 	);
		// 	redraw();
		// }
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
			}
			ctx.stroke();
		}
		// console.log("Draw time: " + (Date.now() - start) / 1000);
	}

	function handlePointerMove(e) {
		if (!canDraw.current) return;
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
			socket.emit("game:canvasDraw", {
				roomId: lobby.lobbyId,
				index: index.current,
				point: point,
			});
		}
	}

	function handleTouchMove(e) {
		e.clientX = e.touches[0].clientX;
		e.clientY = e.touches[0].clientY;
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
		contextRef.current.clearRect(0, 0, 1000, 600);
	}

	function handleClearCanvas() {
		socket.emit("game:clearCanvas", lobby.lobbyId);
	}

	async function simplify() {
		contextRef.current.clearRect(0, 0, 1000, 600);
		const ctx = getContext();
		ctx.strokeStyle = "#F60";
		let simplifiedPoints = points.map((p) => poly_simplify(p, 1.5));
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

	function undo() {
		points.current.pop();
		if (index.current >= 0) {
			index.current--;
		}
		redraw();
	}

	function handleUndo() {
		if (points.current?.length === 0) return;
		socket.emit("game:undo", lobby.lobbyId);
	}

	function onWordClick(e, i) {
		e.stopPropagation();
		e.preventDefault();
		socket.emit("game:chooseWord", lobby.lobbyId, i);
	}

	function handleChatInput(e) {
		if (e.key === "Enter") {
			if (chatInput.trim() !== "") {
				socket.emit("game:sendChatMessage", lobby.lobbyId, chatInput);
				setChatInput("");
			}
		}
	}

	if (!socket.connected) {
		return <Redirect to={{ pathname: "/" }} />;
	}

	if (lobby.lobbyState === "loading") {
		return (
			<div className="game-container">
				<Loader />
				Loading...
			</div>
		);
	}

	return (
		<div>
			{game.gameState === 2 && game.drawer?.userId === user.userId && (
				<div className="modal-overlay">
					<div className="modal-content">
						{game.wordChoices.map((w, i) => (
							<div
								key={i}
								onClick={(e) => onWordClick(e, i)}
								className="modal-button"
							>
								{w}
							</div>
						))}
					</div>
				</div>
			)}
			{game.gameState === 4 && (
				<div className="modal-overlay">
					<div className="canvas-overlay">
						<div style={{ fontWeight: "normal" }}>
							The word was:{" "}
							<span style={{ fontWeight: "bold" }}>{game.word}</span>
						</div>
						{game.turnScores.map((t, i) => (
							<div key={i}>
								{t[0]}
								{": "}
								<span className={t[1] > 0 ? "text-green" : "text-red"}>
									{`+${t[1]}`}
								</span>
							</div>
						))}
					</div>
				</div>
			)}
			{game.gameState === 6 && (
				<div className="modal-overlay">
					<div className="canvas-overlay">
						<div style={{ fontWeight: "normal" }}>Game Over</div>
						{game.scoreboard
							.slice()
							.sort((a, b) => {
								if (a[1] > b[1]) return -1;
								else if (a[1] < b[1]) return 1;
								else return 0;
							})
							.map((s, i) => (
								<div key={i}>{`${i + 1}. ${s[0]} (${s[1]})`}</div>
							))}
					</div>
				</div>
			)}
			<div className="game-container">
				<div className="game-top game-box">
					<div className="timer">{Math.ceil(timer / 1000)}</div>
					{game.gameState === 0 ? (
						<div>Waiting for game to start</div>
					) : game.gameState === 1 ? (
						<div>Starting next round</div>
					) : game.gameState === 2 ? (
						<div>{`${game.drawer?.username} is choosing a word`}</div>
					) : game.gameState === 5 ? (
						<div>{`End of Round ${game.round}`}</div>
					) : game.gameState === 6 ? (
						<div>Game Over</div>
					) : (
						<div className="word">
							{game.word.split("").map((l, i) =>
								l === "_" ? (
									<span className={"letter letter-underscore"} key={i}>
										{" "}
									</span>
								) : (
									<span className={"letter"} key={i}>
										{l}
									</span>
								)
							)}
						</div>
					)}
					<div></div>
				</div>
				<div className="game-row">
					<div className="game-box side-column">
						<h3>{`Round ${game.round} / ${game.maxRounds}`}</h3>
						<div className="player-list">
							{game.scoreboard.map((s, i) => (
								<div key={i}>
									<div className="player-name">{s[0]}</div>
									<div className="player-score">{s[1]}</div>
								</div>
							))}
						</div>
					</div>
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
						<div className="chat-log">
							{game.chatMessages
								.slice()
								.reverse()
								.map((m, i) => (
									<div key={i}>
										{m.username && (
											<span className="chat-username">{`${m.username}: `}</span>
										)}
										<span
											className={
												m.type === "correct_guess"
													? "chat-message text-green"
													: m.type === "server"
													? "chat-message text-yellow"
													: "chat-message"
											}
										>
											{m.message}
										</span>
									</div>
								))}
						</div>
						<input
							onChange={(e) => setChatInput(e.target.value)}
							onKeyDown={handleChatInput}
							value={chatInput}
							placeholder="Type your guess here"
							disabled={game.drawer?.userId === user.userId}
						></input>
					</div>
				</div>
				{game.gameState === 3 && game.drawer?.userId === user.userId && (
					<div className="game-bottom game-box">
						<CirclePicker
							color={color}
							onChangeComplete={(c) => setColor(c.hex)}
							colors={colors}
							width={530}
						/>
						<SizePicker lineWidth={lineWidth} onChange={setLineWidth} />
						<div className="tool-buttons">
							<button
								className="tool-button button-white-green"
								onClick={handleClearCanvas}
							>
								Clear
							</button>
							<button
								className="tool-button button-white-green"
								onClick={handleUndo}
							>
								Undo
							</button>
						</div>
					</div>
				)}
				{process.env.NODE_ENV === "development" && (
					<button onClick={() => console.log(points.current)}>Points</button>
				)}
			</div>
		</div>
	);
}
