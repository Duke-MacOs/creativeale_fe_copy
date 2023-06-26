/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo } from 'react';
import { Project, Component, History, Model, PanoramaData } from './headers';
import { useProject } from '@editor/aStore';
import useSaving, { useAutoSaving } from './hooks/useSaving';
import { useStore } from 'react-redux';
import { isVRCaseAndInEdit } from '@editor/Template/Panorama/utils';
import { useSavingInVRCase } from '@editor/Template/Panorama/hooks';

export { default as Previewer } from './headers/Project/Preview/Previewer';

export default memo(() => {
  const { getState } = useStore();
  const type = useProject('type');
  const { onSaving } = useSaving();
  const { onSaving: onSavingInVRCase } = useSavingInVRCase();
  const editPanoramaDataInVRCase = isVRCaseAndInEdit(getState().project);
  useAutoSaving(editPanoramaDataInVRCase ? onSavingInVRCase : onSaving);

  if (editPanoramaDataInVRCase) return <Project onSaving={onSavingInVRCase} />;

  switch (type) {
    case 'Project':
      return <Project onSaving={onSaving} />;
    case 'Component':
      return <Component />;
    case 'PanoramaData':
      return <PanoramaData />;
    case 'Model':
    case 'Particle3D':
      return <Model />;
    default:
      return <History />;
  }
});
