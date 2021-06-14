import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { client } from "../api/client";

export const createLobby = createAsyncThunk("lobby/createLobby", async () => {
	const response = await client.post("/lobby");
	return response.data;
});

export const lobbySlice = createSlice({
	name: "lobby",
	initialState: {
		lobbyId: null,
		status: "idle",
		error: "",
	},
	reducers: {
		setLobbyId: (state, action) => {
			state.lobbyId = action.payload;
		},
	},
	extraReducers: {
		[createLobby.pending]: (state, action) => {
			state.status = "loading";
		},
		[createLobby.fulfilled]: (state, action) => {
			state.status = "succeeded";
			state.lobbyId = action.payload.lobbyId;
		},
		[createLobby.rejected]: (state, action) => {
			state.status = "failed";
			state.error = action.error.message;
		},
	},
});

export const { setLobbyId } = lobbySlice.actions;

export default lobbySlice.reducer;
