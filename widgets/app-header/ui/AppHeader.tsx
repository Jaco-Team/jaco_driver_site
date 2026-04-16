import dynamic from 'next/dynamic';

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'));

export function AppHeader() {
  return <DynamicHeader />;
}
