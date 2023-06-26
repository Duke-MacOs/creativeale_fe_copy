import { ICaseState, useHasUserPermission } from '@editor/aStore';
import { useHasFeature } from '@shared/userInfo';
import ReviewTemplate from './ReviewTemplate';
import ExportProject from './ExportProject';
import SyncProduct from './SyncProduct';
import { amIHere } from '@shared/utils';
export interface SubmitProps {
  disabled: boolean;
  skinning?: boolean;
  getState(): EditorState;
  onSaving(action?: string): Promise<void>;
}
interface Props extends SubmitProps {
  sceneMode: ICaseState['editor']['sceneMode'];
}
export default function SubmitProject({ getState, disabled, sceneMode, skinning, onSaving }: Props) {
  const exportProject = useHasUserPermission('exportProject');
  const bool = useHasFeature('<export_project>');
  switch (sceneMode) {
    case 'Template':
      return (
        <>
          {(!amIHere({ release: true }) || exportProject) && (
            <ExportProject disabled={disabled} getState={getState} onSaving={onSaving} />
          )}
          {amIHere({ release: true }) && <ReviewTemplate disabled={disabled} getState={getState} onSaving={onSaving} />}
        </>
      );
    case 'Project':
    case 'Product':
      return (
        <>
          {(exportProject || bool) && <ExportProject disabled={disabled} getState={getState} onSaving={onSaving} />}
          {skinning ? (
            <ReviewTemplate skinning disabled={disabled} getState={getState} onSaving={onSaving} />
          ) : (
            <SyncProduct disabled={disabled} getState={getState} onSaving={onSaving} />
          )}
        </>
      );
  }
}
