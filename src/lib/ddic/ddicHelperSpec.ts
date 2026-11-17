/**
 * The DDIC deploy helper as an RfcHelperSpec (function group ZMCP_DDIC).
 * Source and version: ddicHelperAbap.ts.
 */

import type { RfcHelperSpec } from '../rfcHelper/rfcHelper';
import {
  DDIC_HELPER_DEPLOY,
  DDIC_HELPER_DEPLOY_DESCRIPTION,
  DDIC_HELPER_DEPLOY_SOURCE,
  DDIC_HELPER_GROUP,
  DDIC_HELPER_GROUP_DESCRIPTION,
  DDIC_HELPER_VERSION,
} from './ddicHelperAbap';

export const DDIC_HELPER_SPEC: RfcHelperSpec = {
  label: 'DDIC deploy helper',
  group: DDIC_HELPER_GROUP,
  groupDescription: DDIC_HELPER_GROUP_DESCRIPTION,
  version: DDIC_HELPER_VERSION,
  setupTool: 'SetupDdicHelper',
  usedBy: 'DeployDdic',
  modules: [
    {
      name: DDIC_HELPER_DEPLOY,
      description: DDIC_HELPER_DEPLOY_DESCRIPTION,
      source: DDIC_HELPER_DEPLOY_SOURCE,
      // An empty spec is refused before anything is read or written; EV_VERSION is set first.
      probeParams: { IV_SPEC: '', IV_PACKAGE: '' },
    },
  ],
};
