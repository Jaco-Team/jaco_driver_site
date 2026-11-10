import { authIconPaths, type AuthIconName } from './authIconPaths';

interface AuthIconProps {
  name: AuthIconName;
  className?: string;
  dataEye?: 'on' | 'off';
}

export default function AuthIcon({ name, className, dataEye }: AuthIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      data-eye={dataEye}
    >
      <path d={authIconPaths[name]} />
    </svg>
  );
}
