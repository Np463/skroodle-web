import io from "socket.io-client";

const socket = io(process.env.REACT_APP_BASE_URL, { autoConnect: false });

socket.onAny((event, ...args) => {
	console.log(event, args);
});

socket.on("connect_error", (err) => {
	console.log(err.message);
});

export default socket;
