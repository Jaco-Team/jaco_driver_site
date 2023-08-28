import CredentialsProvider from "next-auth/providers/credentials"

import { api } from './api.js';

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        login: { label: "Username", type: "text", placeholder: "Login" },
        password: { label: "Password", type: "password", placeholder: "Password" }
      },
      async authorize(credentials, req) {
        
        const data = {
          type: 'login',
          
          login: credentials.login,
          pwd: credentials.password
        };
    
        const json = await api('auth', data);

        if( json.st === true ){

          return {
            id: json.token,
            name: json.name,
            email: "",
            image: "",
          }
        }

        return false;
      }
    })
  ], 
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {

      if( account.provider == 'credentials' ){
        return true;
      }


      return false
    },
    
    async session({ session, user, token }) {

      session.user.token = token?.user?.token ?? token.sub;

      return session;
    },
    
    async jwt({ token, user, account, profile, isNewUser }) {
      if (profile) {
        token.user = profile;
      }
      return token
    }
  },
  session: {
    jwt: true, 
    // Seconds - How long until an idle session expires and is no longer valid.
    //maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET
};
