import { getPasswordRequirements } from '@/shared/lib/passwordRequirements';

interface PasswordRequirementsListProps {
  password: string;
}

export default function PasswordRequirementsList({ password }: PasswordRequirementsListProps) {
  const requirements = getPasswordRequirements(password);

  return (
    <div className="auth__requirements">
      <div className="auth__requirementsTitle">Пароль должен содержать:</div>
      <div className="auth__requirementsGrid">
        {requirements.map((requirement) => (
          <div
            key={requirement.label}
            className={
              requirement.met ? 'auth__requirement auth__requirement--met' : 'auth__requirement'
            }
          >
            <span className="auth__requirementMark">{requirement.met ? '✓' : ''}</span>
            <span>{requirement.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
