import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { SectionTitle } from '@/shared/ui/SectionTitle/SectionTitle';
import { SxProps, Theme } from '@mui/material/styles';

interface SettingsSectionProps {
  children: React.ReactNode;
  marginTop?: number;
  padding?: number;
  className?: string;
  sx?: SxProps<Theme>;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  children,
  marginTop = 10,
  padding = 20,
  className,
  sx,
}) => {
  //sx={{ mt: `${marginTop}px` }}
  return (
    <Grid size={12}>
      <Paper
        className={className ?? 'settingsCard'}
        elevation={0}
        sx={{
          p: `${padding}px`,
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, #1b2833 0%, #18232d 100%)'
              : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 14px 30px rgba(0, 0, 0, 0.28)'
              : '0 14px 30px rgba(31, 43, 54, 0.08)',
          ...sx,
        }}
      >
        {children}
      </Paper>
    </Grid>
  );
};

interface SettingsSectionWithPreviewProps {
  title: string;
  previewContent?: React.ReactNode;
  previewHeight?: number;
  previewClassName?: string;
  children?: React.ReactNode;
  fontSize?: number;
}

export const SettingsSectionWithPreview: React.FC<SettingsSectionWithPreviewProps> = ({
  title,
  previewContent,
  previewHeight = 400,
  previewClassName,
  children,
  fontSize = 14,
}) => {
  //sx={{ mt: '10px' }}
  return (
    <Grid size={12}>
      <Paper
        className="settingsCard"
        elevation={0}
        sx={{
          p: '20px',
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, #1b2833 0%, #18232d 100%)'
              : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 14px 30px rgba(0, 0, 0, 0.28)'
              : '0 14px 30px rgba(31, 43, 54, 0.08)',
          position: 'relative',
        }}
      >
        <SectionTitle title={title} fontSize={fontSize} />
        {previewContent ? (
          previewContent
        ) : (
          <div className="settingsPreviewLayer" style={{ height: previewHeight }}>
            <div
              className={`settingsPreviewSurface ${previewClassName ?? ''}`.trim()}
              style={{ width: '100%', height: '100%' }}
              role="img"
              aria-label="Пример карты"
            />
            {children}
          </div>
        )}
        {previewContent ? children : null}
      </Paper>
    </Grid>
  );
};
