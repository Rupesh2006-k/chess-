const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
let dragged = null;
let fromSquare = null;
let playerRole = null;
const files = "abcdefgh";
const unicode = {
  p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
  P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔",
};

function getPiece(piece) {
  const key = piece.color === "w"
    ? piece.type.toUpperCase()
    : piece.type;
  return unicode[key];
}

function renderBoard() {
  boardElement.innerHTML = "";
  const board = chess.board();

  board.forEach((row, r) => {
    row.forEach((square, c) => {
      const el = document.createElement("div");
      el.className = `square ${(r + c) % 2 === 0 ? "light" : "dark"}`;
      el.dataset.r = r;
      el.dataset.c = c;

      if (square) {
        const p = document.createElement("div");
        p.className = `piece ${square.color === "w" ? "white" : "black"}`;
        p.textContent = getPiece(square);
        p.draggable = playerRole === square.color;

        if (p.draggable) p.classList.add("draggable");

        p.addEventListener("dragstart", () => {
          dragged = p;
          fromSquare = { r, c };
        });

        p.addEventListener("dragend", () => {
          dragged = null;
          fromSquare = null;
        });

        el.appendChild(p);
      }

      el.addEventListener("dragover", e => e.preventDefault());

      el.addEventListener("drop", () => {
        if (!dragged) return;

        const move = {
          from: files[fromSquare.c] + (8 - fromSquare.r),
          to: files[c] + (8 - r),
          promotion: "q",
        };

        socket.emit("move", move);
      });

      boardElement.appendChild(el);
    });
  });

  if (playerRole === "b") {
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }
}

socket.on("playerRole", role => {
  playerRole = role;
  renderBoard();
});

socket.on("spectatorRole", () => {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", fen => {
  chess.load(fen);
  renderBoard();
});

socket.on("invalidMove", renderBoard);

renderBoard();
