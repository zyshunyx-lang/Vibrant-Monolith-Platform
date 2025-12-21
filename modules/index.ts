import { DutyModule } from './duty/definition';
import { MenuModule } from './menu/definition';

/**
 * AllModules Registry
 * This is the only place where the Platform imports code from the Modules directory.
 */
export const AllModules = [
  DutyModule,
  MenuModule,
];