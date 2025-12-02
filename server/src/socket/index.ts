import { APP_ORIGIN } from "@/constants/env";
import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { socketAuthMiddleware } from "./middleware/socketAuth";

let ioInstance: Server | null = null;

export function initializeSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: APP_ORIGIN,
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    path: "/socket.io",
  });

  ioInstance = io;
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket & { userId?: string; userRole?: string }) => {
    const uid = socket.userId ?? "anonymous";
    console.log(`[SOCKET] ✅ connected: socket=${socket.id} user=${uid} role=${socket.userRole || "?"}`);

    // ✅ Join personal room
    socket.join(`user:${uid}`);
    console.log(`[SOCKET] 🚪 user:${uid} joined personal room`);

    // ✅ JOIN USER ROOM - for direct messages
    socket.on("join_user_room", (userId: string, callback?: Function) => {
      const room = `user:${userId}`;
      socket.join(room);
      console.log(`[SOCKET] 🚪 ${uid} joined ${room}`);
      if (callback) callback({ success: true, room });
    });

    // ✅ JOIN CONVERSATION - for chat window
    socket.on("join_conversation", (conversationId: string, callback?: Function) => {
      if (!conversationId) return;
      const room = `conversation:${conversationId}`;
      socket.join(room);
      console.log(`[SOCKET] 🚪 ${uid} joined ${room}`);
      if (callback) callback({ success: true, room });
    });

    // ✅ LEAVE CONVERSATION
    socket.on("leave_conversation", (conversationId: string) => {
      if (!conversationId) return;
      const room = `conversation:${conversationId}`;
      socket.leave(room);
      console.log(`[SOCKET] 🚪 ${uid} left ${room}`);
    });

    // Support rooms (existing)
    socket.on("join_support_room", (conversationId: string) => {
      if (!conversationId) return;
      const room = `support:${conversationId}`;
      socket.join(room);
      console.log(`[SOCKET] 🚪 ${uid} joined ${room}`);
    });

    socket.on("leave_support_room", (conversationId: string) => {
      if (!conversationId) return;
      const room = `support:${conversationId}`;
      socket.leave(room);
      console.log(`[SOCKET] 🚪 ${uid} left ${room}`);
    });

    socket.on("support_send_message", (payload: any) => {
      try {
        const { conversationId, sellerId } = payload || {};
        if (!conversationId) {
          console.warn("[SOCKET] support_send_message missing conversationId", payload);
          return;
        }

        const room = `support:${conversationId}`;
        io.to(room).emit("support_new_message", payload);
        if (sellerId) {
          io.to(`user:${String(sellerId)}`).emit("support_new_message", payload);
        }

        console.log(`[SOCKET] 📨 support_new_message emitted to ${room} (admin:${sellerId ?? "none"})`);
      } catch (err) {
        console.error("[SOCKET] ❌ error in support_send_message", err);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[SOCKET] ❌ disconnected: socket=${socket.id} user=${uid} reason=${reason}`);
    });

    socket.on("error", (err) => {
      console.error(`[SOCKET] 🚨 error: socket=${socket.id} user=${uid}`, err);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized");
  }
  return ioInstance;
}