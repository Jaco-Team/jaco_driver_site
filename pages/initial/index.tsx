import dynamic from 'next/dynamic';

const DynamicHomePage = dynamic(() => import('@/widgets/initial-screen/ui/InitialScreen'));

export default function Initial() {
  return <DynamicHomePage />;
}
