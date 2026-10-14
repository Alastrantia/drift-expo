import { Redirect } from 'expo-router';
import { useDrift } from '../src/lib/store';

export default function Index() {
  const onboarded = useDrift((s) => s.onboarded);
  return <Redirect href={onboarded ? '/listen' : '/welcome'} />;
}
