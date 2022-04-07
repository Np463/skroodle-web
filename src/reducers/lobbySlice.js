import { createSlice } from "@reduxjs/toolkit";

export const lobbySlice = createSlice({
	name: "lobby",
	initialState: {
		lobbyState: "loading",
		lobbyId: null,
		owner: null,
		players: [],
		rounds: 4,
		secondsPerRound: 90,
	},
	reducers: {
		setLobbyState: (state, action) => {
			state.lobbyState = action.payload;
		},
		setLobbyId: (state, action) => {
			state.lobbyId = action.payload;
		},
		setOwner: (state, action) => {
			state.owner = action.payload;
		},
		setPlayers: (state, action) => {
			state.players = action.payload;
		},
		addPlayer: (state, action) => {
			if (!state.players.find((p) => p.userId === action.payload.userId))
				state.players.push(action.payload);
		},
		removePlayer: (state, action) => {
			state.players = state.players.filter(
				(p) => p.userId !== action.payload.userId
			);
		},
		setRounds: (state, action) => {
			state.rounds = action.payload;
		},
		setSecondsPerRound: (state, action) => {
			state.secondsPerRound = action.payload;
		},
	},
});

export const {
	setLobbyState,
	setLobbyId,
	setOwner,
	setPlayers,
	addPlayer,
	removePlayer,
	setRounds,
	setSecondsPerRound,
} = lobbySlice.actions;

export default lobbySlice.reducer;
