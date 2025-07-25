import { pusherServer } from "@/lib/pusher";
import { Message, ChatUser, User } from "@/payload-types";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import z from "zod";
import { FullConversationType, FullMessageType } from "../types";

export const conversationsRouter = createTRPCRouter({
  // Get current chat user or create if not exists
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.session?.user?.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const currentUserData = await ctx.db.find({
        collection: "chat-users",
        where: {
          user: {
            equals: ctx.session.user.id,
          },
        },
        limit: 1,
      });

      if (currentUserData.docs.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat user not found",
        });
      }

      return currentUserData.docs[0];
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get current user",
      });
    }
  }),

  // Create or update chat user profile
  createChatUser: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.session?.user?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        // Check if chat user already exists
        const existingUserData = await ctx.db.find({
          collection: "chat-users",
          where: {
            user: {
              equals: ctx.session.user.id,
            },
          },
          limit: 1,
        });

        if (existingUserData.docs.length > 0) {
          // Update existing user
          const existingUser = existingUserData.docs[0] as ChatUser;
          const updatedUser = await ctx.db.update({
            collection: "chat-users",
            id: existingUser.id,
            data: {
              name: input.name || existingUser.name,
              image: input.image || existingUser.image,
            },
          });
          return updatedUser;
        }

        // Create new chat user
        const chatUser = await ctx.db.create({
          collection: "chat-users",
          data: {
            user: ctx.session.user.id,
            email: ctx.session.user.email,
            name: input.name,
            image: input.image,
          },
        });

        return chatUser;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create/update chat user",
        });
      }
    }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        image: z.string().optional(), // ID của media document
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const currentUserData = await ctx.db.find({
          collection: "chat-users",
          where: {
            user: {
              equals: ctx.session.user.id,
            },
          },
          limit: 1,
        });

        if (currentUserData.docs.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat user not found",
          });
        }

        const chatUser = currentUserData.docs[0] as ChatUser;

        const updatedUser = await ctx.db.update({
          collection: "chat-users",
          id: chatUser.id,
          data: {
            name: input.name,
            image: input.image, // ID của media document
          },
        });

        return updatedUser;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  // Get all users except current user
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.session?.user?.email) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not authenticated",
        });
      }

      const usersData = await ctx.db.find({
        collection: "chat-users",
        depth: 1, // Populate user relationship
        where: {
          user: {
            not_equals: ctx.session.user.id,
          },
        },
        sort: "-createdAt",
      });

      return usersData.docs;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get users",
      });
    }
  }),

  // Get user's conversations
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get current chat user
      const currentUserData = await ctx.db.find({
        collection: "chat-users",
        where: {
          user: {
            equals: ctx.session.user.id,
          },
        },
        limit: 1,
      });

      if (currentUserData.docs.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat user not found",
        });
      }

      const currentChatUser = currentUserData.docs[0] as ChatUser;

      // Get conversations where current user is a participant
      const conversationsData = await ctx.db.find({
        collection: "conversations",
        depth: 2, // Populate users only
        where: {
          users: {
            in: [currentChatUser.id],
          },
        },
        sort: "-lastMessageAt",
      });

      // Get messages for each conversation
      const conversationsWithMessages = await Promise.all(
        conversationsData.docs.map(async (conversation) => {
          const messagesData = await ctx.db.find({
            collection: "messages",
            depth: 2,
            where: {
              conversation: {
                equals: conversation.id,
              },
            },
            sort: "-createdAt",
            limit: 1, // Only get the last message
          });

          return {
            ...conversation,
            messages: messagesData.docs,
          };
        })
      );

      return conversationsWithMessages as FullConversationType[];
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get conversations",
      });
    }
  }),

  // Get conversation by ID
  getConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const conversation = await ctx.db.findByID({
          collection: "conversations",
          id: input.conversationId,
          depth: 2, // Populate users
        });

        if (!conversation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversation not found",
          });
        }

        return conversation as FullConversationType;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get conversation",
        });
      }
    }),

  // Get messages for a conversation
  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const messagesData = await ctx.db.find({
          collection: "messages",
          depth: 2, // Populate sender and seen
          where: {
            conversation: {
              equals: input.conversationId,
            },
          },
          sort: "createdAt",
          pagination: false,
        });

        return messagesData.docs as FullMessageType[];
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get messages",
        });
      }
    }),

  // Create new conversation
  createConversation: protectedProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        isGroup: z.boolean().default(false),
        members: z.array(z.object({ value: z.string() })).optional(),
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current chat user
        const currentUserData = await ctx.db.find({
          collection: "chat-users",
          where: {
            user: {
              equals: ctx.session.user.id,
            },
          },
          limit: 1,
        });

        if (currentUserData.docs.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat user not found",
          });
        }

        const currentChatUser = currentUserData.docs[0] as ChatUser;

        // Validate group data
        if (
          input.isGroup &&
          (!input.members || input.members.length < 2 || !input.name)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid group data",
          });
        }

        // Handle group conversation
        if (input.isGroup && input.members) {
          const userIds = [
            ...input.members.map((member) => member.value),
            currentChatUser.id,
          ];

          const newConversation = await ctx.db.create({
            collection: "conversations",
            data: {
              name: input.name,
              isGroup: input.isGroup,
              users: userIds,
            },
            depth: 2,
          });

          // Send realtime notifications
          const users = newConversation.users as any[];
          users.forEach((user) => {
            if (user.user?.email) {
              pusherServer.trigger(
                user.user.email,
                "conversation:new",
                newConversation
              );
            }
          });

          return newConversation;
        }

        // Handle 1-on-1 conversation
        if (!input.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "UserId is required for 1-on-1 conversation",
          });
        }

        // Check if conversation already exists
        const existingConversationsData = await ctx.db.find({
          collection: "conversations",
          where: {
            and: [
              {
                isGroup: {
                  not_equals: true,
                },
              },
              {
                users: {
                  in: [currentChatUser.id],
                },
              },
              {
                users: {
                  in: [input.userId],
                },
              },
            ],
          },
        });

        // Check if any existing conversation has exactly these 2 users
        const exactMatch = existingConversationsData.docs.find((conv) => {
          const userIds = conv.users as string[];
          return (
            userIds.length === 2 &&
            userIds.includes(currentChatUser.id) &&
            userIds.includes(input.userId!)
          );
        });

        if (exactMatch) {
          return exactMatch;
        }

        // Create new 1-on-1 conversation
        const newConversation = await ctx.db.create({
          collection: "conversations",
          data: {
            users: [currentChatUser.id, input.userId],
          },
          depth: 2,
        });

        // Send realtime notifications
        const users = newConversation.users as any[];
        users.forEach((user) => {
          if (user.user?.email) {
            pusherServer.trigger(
              user.user.email,
              "conversation:new",
              newConversation
            );
          }
        });

        return newConversation;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create conversation",
        });
      }
    }),

  // Delete conversation
  deleteConversation: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current chat user
        const currentUserData = await ctx.db.find({
          collection: "chat-users",
          where: {
            user: {
              equals: ctx.session.user.id,
            },
          },
          limit: 1,
        });

        if (currentUserData.docs.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat user not found",
          });
        }

        const currentChatUser = currentUserData.docs[0] as ChatUser;

        // Check if conversation exists and user is a participant
        const conversation = await ctx.db.findByID({
          collection: "conversations",
          id: input.conversationId,
          depth: 2,
        });

        if (!conversation) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversation not found",
          });
        }

        const userIds = (conversation.users as ChatUser[]).map((user) => user.id);
        if (!userIds.includes(currentChatUser.id)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You are not a participant in this conversation",
          });
        }

        // Delete conversation
        await ctx.db.delete({
          collection: "conversations",
          id: input.conversationId,
        });

        // Send realtime notifications
        const users = conversation.users as any[];
        users.forEach((user) => {
          if (user.user?.email) {
            pusherServer.trigger(
              user.user.email,
              "conversation:delete",
              conversation
            );
          }
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete conversation",
        });
      }
    }),

  // Send message
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        message: z.string().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!input.message && !input.image) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Message must have text or image",
          });
        }

        // Get current chat user
        const currentUserData = await ctx.db.find({
          collection: "chat-users",
          where: {
            user: {
              equals: ctx.session.user.id,
            },
          },
          limit: 1,
        });

        if (currentUserData.docs.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat user not found",
          });
        }

        const currentChatUser = currentUserData.docs[0] as ChatUser;

        // Create message
        const newMessage = await ctx.db.create({
          collection: "messages",
          data: {
            body: input.message,
            image: input.image,
            conversation: input.conversationId,
            sender: currentChatUser.id,
            seen: [currentChatUser.id], // Sender sees their own message
          },
          depth: 2,
        });

        // Update conversation's lastMessageAt
        await ctx.db.update({
          collection: "conversations",
          id: input.conversationId,
          data: {
            lastMessageAt: new Date().toISOString(),
          },
        });

        // Send realtime event to conversation channel
        await pusherServer.trigger(
          input.conversationId,
          "messages:new",
          newMessage
        );

        // Get conversation users for notifications
        const conversation = await ctx.db.findByID({
          collection: "conversations",
          id: input.conversationId,
          depth: 2,
        });

        // Send realtime event to each user
        const users = conversation.users as any[];
        users.forEach((user) => {
          if (user.user?.email) {
            pusherServer.trigger(user.user.email, "conversation:update", {
              id: input.conversationId,
              messages: [newMessage],
            });
          }
        });

        return newMessage;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message",
        });
      }
    }),

  // Mark message as seen
  markMessageSeen: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current chat user
        const currentUserData = await ctx.db.find({
          collection: "chat-users",
          where: {
            user: {
              equals: ctx.session.user.id,
            },
          },
          limit: 1,
        });

        if (currentUserData.docs.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat user not found",
          });
        }

        const currentChatUser = currentUserData.docs[0] as ChatUser;

        // Get latest message in conversation
        const messagesData = await ctx.db.find({
          collection: "messages",
          where: {
            conversation: {
              equals: input.conversationId,
            },
          },
          sort: "-createdAt",
          limit: 1,
        });

        if (messagesData.docs.length === 0) {
          return { success: true };
        }

        const lastMessage = messagesData.docs[0] as Message;
        const currentSeenIds =
          (lastMessage.seen as ChatUser[]).map((user) => user.id) || [];

        // Add current user to seen list if not already there
        if (!currentSeenIds.includes(currentChatUser.id)) {
          const updatedMessage = await ctx.db.update({
            collection: "messages",
            id: lastMessage.id,
            data: {
              seen: [...currentSeenIds, currentChatUser.id],
            },
            depth: 2,
          });

          // Send realtime event to current user
          await pusherServer.trigger(
            ctx.session.user.email!,
            "conversation:update",
            {
              id: input.conversationId,
              messages: [updatedMessage],
            }
          );

          // Send realtime event to conversation
          await pusherServer.trigger(
            input.conversationId,
            "message:update",
            updatedMessage
          );

          return updatedMessage;
        }

        return lastMessage;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark message as seen",
        });
      }
    }),

  // Send typing notification
  sendTyping: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        user: z.object({
          id: z.string(),
          name: z.string().optional(),
          email: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await pusherServer.trigger(input.conversationId, "typing", {
          conversationId: input.conversationId,
          user: input.user,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send typing notification",
        });
      }
    }),

  // Stop typing notification
  stopTyping: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        user: z.object({
          id: z.string(),
          name: z.string().optional(),
          email: z.string(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await pusherServer.trigger(input.conversationId, "stop_typing", {
          user: input.user,
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to stop typing notification",
        });
      }
    }),

  uploadMedia: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // Base64 encoded file
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(input.fileData, "base64");

        // Create media document
        const media = await ctx.db.create({
          collection: "media",
          data: {
            filename: input.fileName,
            mimeType: input.mimeType,
            filesize: buffer.length,
            alt: `Avatar of ${
              ctx.session.user.username || ctx.session.user.email
            }`,
          },
          file: {
            data: buffer,
            mimetype: input.mimeType,
            name: input.fileName,
            size: buffer.length,
          },
        });

        return media;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload avatar",
        });
      }
    }),

  // Pusher authentication (for presence channels)
  pusherAuth: protectedProcedure
    .input(
      z.object({
        socketId: z.string(),
        channel: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.session?.user?.email) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          });
        }

        const data = {
          user_id: ctx.session.user.email,
        };

        const authResponse = pusherServer.authorizeChannel(
          input.socketId,
          input.channel,
          data
        );

        return authResponse;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to authenticate Pusher",
        });
      }
    }),
});
