import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SettingsSectionWithPreview } from './SettingsSection';

describe('SettingsSectionWithPreview', () => {
  it('passes the selected font size to preview labels', () => {
    render(
      <SettingsSectionWithPreview title="Оформление" fontSize={26}>
        <span className="settingsToken">21:46 (53 мин.)</span>
      </SettingsSectionWithPreview>
    );

    expect(screen.getByRole('radiogroup', { name: 'Оформление' })).toHaveStyle({
      '--settings-token-font-size': '26px',
    });
  });
});
