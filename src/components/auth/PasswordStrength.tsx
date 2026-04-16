interface Props {
  password: string;
}

function getStrength(pw: string): { level: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-zA-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;

  if (score <= 1) return { level: 1, label: "Fraca", color: "bg-destructive" };
  if (score === 2) return { level: 2, label: "Razoável", color: "bg-gold" };
  if (score === 3) return { level: 3, label: "Boa", color: "bg-gold" };
  return { level: 4, label: "Forte", color: "bg-green-500" };
}

const PasswordStrength = ({ password }: Props) => {
  if (!password) return null;
  const { level, label, color } = getStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= level ? color : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-1">Força: {label}</p>
    </div>
  );
};

export default PasswordStrength;
