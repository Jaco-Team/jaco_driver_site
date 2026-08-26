import Typography from '@mui/material/Typography';

interface SectionTitleProps {
  title: string;
  fontSize?: number;
}

function clampSize(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, fontSize = 14 }) => {
  const baseSize = Number.isFinite(fontSize) && fontSize > 0 ? fontSize : 14;
  const titleSize = clampSize(baseSize + 2, 16, 28);

  return (
    <Typography
      component="h2"
      sx={{
        color: 'text.primary',
        fontSize: titleSize,
        fontWeight: 700,
        lineHeight: 1.2,
        mb: 1.4,
      }}
    >
      {title}
    </Typography>
  );
};
