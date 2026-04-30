import Typography from '@mui/material/Typography';

interface SectionTitleProps {
  title: string;
  fontSize?: number;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title, fontSize = 14 }) => (
  <Typography variant="subtitle1" color="textPrimary" fontSize={fontSize} gutterBottom>
    {title}
  </Typography>
);
