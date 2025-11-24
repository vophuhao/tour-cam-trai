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

  // set module instance
  ioInstance = io;

  // authentication middleware (should set socket.userId / socket.userRole)
  io.use(socketAuthMiddleware);

  io.on("connection", (socket: Socket & { userId?: string; userRole?: string }) => {
    const uid = socket.userId ?? "anonymous";
    console.log(`[SOCKET] connected: socket=${socket.id} user=${uid} role=${socket.userRole || "?"}`);

    // join personal room so server can target user/admin directly
    socket.join(`user:${uid}`);
    console.log(`[SOCKET] user:${uid} joined personal room`);

    // Support: join / leave conversation room
    socket.on("join_support_room", (conversationId: string) => {
      if (!conversationId) return;
      const room = `support:${conversationId}`;
      socket.join(room);
      console.log(`[SOCKET] ${uid} joined ${room}`);
    });

    socket.on("leave_support_room", (conversationId: string) => {
      if (!conversationId) return;
      const room = `support:${conversationId}`;
      socket.leave(room);
      console.log(`[SOCKET] ${uid} left ${room}`);
    });

    // When server receives support_send_message from a trusted source (server-side services should emit),
    // or if you want to allow clients to emit, server must validate sender identity.
    // Here we accept a message payload and broadcast to the support room and assigned admin (if any).
    socket.on("support_send_message", (payload: any) => {
      try {
        const { conversationId, sellerId } = payload || {};
        if (!conversationId) {
          console.warn("[SOCKET] support_send_message missing conversationId", payload);
          return;
        }

        const room = `support:${conversationId}`;
        // broadcast to conversation room (user + admin in room)
        io.to(room).emit("support_new_message", payload);
        // also notify assigned admin directly (if assigned)
        if (sellerId) {
          io.to(`user:${String(sellerId)}`).emit("support_new_message", payload);
        }

        console.log(`[SOCKET] support_new_message emitted to ${room} (admin:${sellerId ?? "none"})`);
      } catch (err) {
        console.error("[SOCKET] error in support_send_message", err);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`[SOCKET] disconnected: socket=${socket.id} user=${uid} reason=${reason}`);
    });

    socket.on("error", (err) => {
      console.error(`[SOCKET] error: socket=${socket.id} user=${uid}`, err);
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