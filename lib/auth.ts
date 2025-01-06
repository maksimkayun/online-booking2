import { PrismaClient, UserRole } from '@prisma/client'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { compare } from "bcryptjs";
import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
    interface User {
        role: UserRole;
    }

    interface Session {
        user: {
            role: UserRole;
        } & DefaultSession["user"]
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: UserRole;
    }
}

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });

                if (!user || !user.password) {
                    throw new Error("Invalid credentials");
                }

                const isCorrectPassword = await compare(
                    credentials.password,
                    user.password
                );

                if (!isCorrectPassword) {
                    throw new Error("Invalid credentials");
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                };
            }
        })
    ],
    pages: {
        signIn: '/auth/signin'
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (trigger === "update" && session?.user) {
                return { ...token, ...session.user };
            }

            if (user) {
                token.role = user.role;
                token.name = user.name;
                token.email = user.email;
            }

            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.name = token.name;
                session.user.email = token.email as string;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};