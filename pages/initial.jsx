import dynamic from 'next/dynamic';

const DynamicHomePage = dynamic(() => import('@/modules/initial'));

export default function Initial() {
  return <DynamicHomePage />;
}
