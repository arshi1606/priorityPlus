"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Cookies from "js-cookie";
import "./globals.css";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const httpLink = createHttpLink({
  uri: "http://localhost:4000/graphql", 
});

const authLink = setContext((_, { headers }) => {
  const token =
    typeof window !== "undefined" ? Cookies.get("token") : null;

  return {
    headers: {
      ...headers,
      authorization: token ? token : "",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
            <ApolloProvider client={client}>
               {children}
            </ApolloProvider>
        </body>
    </html>
  );
}