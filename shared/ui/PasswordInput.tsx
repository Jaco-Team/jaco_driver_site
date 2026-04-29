import { useState } from 'react';

import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import MyTextInput from '@/shared/ui/MyTextInput';
import type { ComponentProps } from 'react';

type PasswordInputProps = Omit<ComponentProps<typeof MyTextInput>, 'type' | 'endAdornment'>;

export default function PasswordInput(props: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <MyTextInput
      {...props}
      type={isVisible ? 'text' : 'password'}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            aria-label={isVisible ? 'Скрыть пароль' : 'Показать пароль'}
            edge="end"
            onClick={() => setIsVisible((value) => !value)}
            onMouseDown={(event) => event.preventDefault()}
          >
            {isVisible ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
          </IconButton>
        </InputAdornment>
      }
    />
  );
}
