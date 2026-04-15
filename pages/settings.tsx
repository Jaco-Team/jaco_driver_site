import React, { useEffect } from 'react';

import dynamic from 'next/dynamic';
import {SettingsForm} from "../widgets/settings-form/ui/SettingsForm";

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'))

export default function Settings(props) {
  return (
    <>
      <DynamicHeader />
      <SettingsForm />
    </>
  )
}
