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
  padding = 16,
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
          borderColor: 'var(--settings-card-border)',
          background: 'var(--settings-card-surface)',
          boxShadow: '0 14px 30px var(--settings-card-shadow)',
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
          p: '16px',
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'var(--settings-card-border)',
          background: 'var(--settings-card-surface)',
          boxShadow: '0 14px 30px var(--settings-card-shadow)',
          position: 'relative',
        }}
      >
        <SectionTitle title={title} fontSize={fontSize} />
        {previewContent ? (
          previewContent
        ) : (
          <div
            className={`settingsPreviewSurface ${previewClassName ?? ''}`.trim()}
            style={{ minHeight: previewHeight }}
            role="radiogroup"
            aria-label={title}
          >
            {children}
          </div>
        )}
        {previewContent ? children : null}
      </Paper>
    </Grid>
  );
};
