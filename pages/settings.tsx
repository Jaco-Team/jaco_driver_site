import React, { useEffect } from 'react';

import dynamic from 'next/dynamic';
import {SettingsForm} from "../widgets/settings-form/ui/SettingsForm";
import Meta from "@/components/meta";

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'))

export default function Settings() {
  return (
    <Meta title="Настройки">
      <DynamicHeader />
      <SettingsForm />
    </Meta>
  )
}
