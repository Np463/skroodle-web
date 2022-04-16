import { createSlice } from "@reduxjs/toolkit";

export const gameSlice = createSlice({
	name: "game",
	initialState: {
		gameState: -1,
		word: "",
		round: 1,
		maxRounds: 4,
		drawer: null,
		wordChoices: [],
		chatMessages: [],
		turnScores: [],
		scoreboard: [],
	},
	reducers: {
		setGameState: (state, action) => {
			state.gameState = action.payload;
		},
		setWord: (state, action) => {
			state.word = action.payload;
		},
		setRound: (state, action) => {
			state.round = action.payload;
		},
		setMaxRound: (state, action) => {
			state.maxRounds = action.payload;
		},
		setDrawer: (state, action) => {
			state.drawer = action.payload;
		},
		setWordChoices: (state, action) => {
			state.wordChoices = action.payload;
		},
		addChatMessage: (state, action) => {
			state.chatMessages.push(action.payload);
		},
		setTurnScores: (state, action) => {
			state.turnScores = action.payload;
		},
		setScoreboard: (state, action) => {
			state.scoreboard = action.payload;
		},
	},
});

export const {
	setGameState,
	setWord,
	setRound,
	setMaxRound,
	setDrawer,
	setWordChoices,
	addChatMessage,
	setTurnScores,
	setScoreboard,
} = gameSlice.actions;

export default gameSlice.reducer;
