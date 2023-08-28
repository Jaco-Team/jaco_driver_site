import NextAuth from 'next-auth';
import { authConfig } from '@/components/authConfig';

export default NextAuth(authConfig);