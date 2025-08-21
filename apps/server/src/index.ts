import "dotenv/config";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import cors from "cors";
import express from "express";
import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "./lib/auth";
import { toNodeHandler } from "better-auth/node";
import { createServer } from "http";
import { Server } from "socket.io";
import { aiMemory } from "./lib/redis";
import { db } from "./db";
import { message, consultation, user } from "./db/schema";
import { eq } from "drizzle-orm";
import { createId } from '@paralleldrive/cuid2';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.all("/api/auth{/*path}", toNodeHandler(auth));

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);


app.use(express.json());

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join consultation room
  socket.on("join-consultation", (consultationId: string) => {
    socket.join(consultationId);
    console.log(`User ${socket.id} joined consultation ${consultationId}`);
  });

  // Handle new messages
  socket.on("send-message", async (data: {
    consultationId: string;
    content: string;
    senderId: string;
    senderName: string;
    senderRole: string;
  }) => {
    try {
      // Store message in database
      const messageId = createId();
      const newMessage = await db
        .insert(message)
        .values({
          id: messageId,
          consultationId: data.consultationId,
          senderId: data.senderId,
          content: data.content,
          messageType: "user",
          createdAt: new Date(),
        })
        .returning();

      // Add to AI context
      await aiMemory.addToContext(data.consultationId, `${data.senderRole}: ${data.content}`);

      // Broadcast to all users in the consultation
      io.to(data.consultationId).emit("new-message", {
        id: messageId,
        consultationId: data.consultationId,
        senderId: data.senderId,
        content: data.content,
        messageType: "user",
        createdAt: new Date(),
        senderName: data.senderName,
        senderRole: data.senderRole,
      });

      // Check if message contains @ai trigger
      if (data.content.includes("@ai")) {
        await handleAIResponse(data.consultationId, data.content, data.senderRole);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      socket.emit("error", "Failed to send message");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// AI response handler
async function handleAIResponse(consultationId: string, userMessage: string, senderRole: string) {
  try {
    // Get conversation context and memories
    const context = await aiMemory.getContext(consultationId);
    const memories = await aiMemory.getAllMemories(consultationId);

    // Create AI prompt with context
    const systemPrompt = `You are a medical AI assistant helping in a healthcare consultation. 
    
Memories from this consultation:
${Object.entries(memories).map(([key, value]) => `${key}: ${value}`).join('\n')}

Recent conversation context:
${context.slice(0, 10).reverse().join('\n')}

Guidelines:
- Provide helpful medical information but always recommend consulting healthcare professionals
- If a doctor makes a statement with @ai, create a memory entry and respond
- For questions, use existing memories as context
- Be concise and professional`;

    const messages: UIMessage[] = [
      { id: "system", role: "system", parts: [{ type: "text", text: systemPrompt }] },
      { id: "user", role: "user", parts: [{ type: "text", text: userMessage }] }
    ];

    // Generate AI response
    const result = streamText({
      model: google("gemini-2.5-flash"),
      messages: convertToModelMessages(messages),
    });

    let aiResponse = "";
    for await (const chunk of result.textStream) {
      aiResponse += chunk;
    }

    // If doctor made a statement, create memory
    if (senderRole === "doctor" && userMessage.includes("@ai")) {
      const memoryKey = `advice_${Date.now()}`;
      await aiMemory.setMemory(consultationId, memoryKey, userMessage.replace("@ai", "").trim());
    }

    // Store AI message in database
    const aiMessageId = createId();
    await db.insert(message).values({
      id: aiMessageId,
      consultationId: consultationId,
      senderId: null, // AI messages don't have a user senderId
      content: aiResponse,
      messageType: "ai",
      createdAt: new Date(),
    });

    // Add AI response to context
    await aiMemory.addToContext(consultationId, `AI: ${aiResponse}`);

    // Broadcast AI response
    io.to(consultationId).emit("new-message", {
      id: aiMessageId,
      consultationId: consultationId,
      senderId: "ai-assistant",
      content: aiResponse,
      messageType: "ai",
      createdAt: new Date(),
      senderName: "AI Assistant",
      senderRole: "ai",
    });
  } catch (error) {
    console.error("Error generating AI response:", error);
  }
}

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});