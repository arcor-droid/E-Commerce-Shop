import { Observable } from 'rxjs';

/**
 * Interface for components that need to confirm navigation away
 * when they have unsaved changes
 */
export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}
