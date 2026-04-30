import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { SectionTitle } from '@/shared/ui/SectionTitle/SectionTitle';

interface SettingsSectionProps {
  children: React.ReactNode;
  marginTop?: number;
  padding?: number;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  children,
  marginTop = 10,
  padding = 20,
}) => {
  return (
    <Grid size={12} style={{ marginTop }}>
      <Paper style={{ padding }} elevation={5}>
        {children}
      </Paper>
    </Grid>
  );
};

interface SettingsSectionWithPreviewProps {
  title: string;
  previewContent?: React.ReactNode;
  previewHeight?: number;
  previewBackground?: string;
  previewClassName?: string;
  children?: React.ReactNode;
  fontSize?: number;
}

export const SettingsSectionWithPreview: React.FC<SettingsSectionWithPreviewProps> = ({
  title,
  previewContent,
  previewHeight = 400,
  previewBackground = 'rgba(252,232,131,0.5)',
  previewClassName,
  children,
  fontSize = 14,
}) => {
  return (
    <Grid size={12} style={{ marginTop: 10 }}>
      <Paper className="container_paper" elevation={5}>
        <SectionTitle title={title} fontSize={fontSize} />
        {previewContent ? (
          previewContent
        ) : (
          <div
            className={previewClassName}
            style={{ width: '100%', height: previewHeight, backgroundColor: previewBackground }}
            role="img"
            aria-label="Пример карты"
          />
        )}
        {children}
      </Paper>
    </Grid>
  );
};
