/**
 * The SE41 GUI status helper as an RfcHelperSpec (function group ZMCP_CUA).
 * Source and version: cuaHelperAbap.ts.
 */

import type { RfcHelperSpec } from '../rfcHelper/rfcHelper';
import {
  CUA_HELPER_ADD_BUTTON,
  CUA_HELPER_ADD_BUTTON_DESCRIPTION,
  CUA_HELPER_ADD_BUTTON_SOURCE,
  CUA_HELPER_COPY_STATUS,
  CUA_HELPER_COPY_STATUS_DESCRIPTION,
  CUA_HELPER_COPY_STATUS_SOURCE,
  CUA_HELPER_DELETE_STATUS,
  CUA_HELPER_DELETE_STATUS_DESCRIPTION,
  CUA_HELPER_DELETE_STATUS_SOURCE,
  CUA_HELPER_GROUP,
  CUA_HELPER_GROUP_DESCRIPTION,
  CUA_HELPER_REMOVE_BUTTON,
  CUA_HELPER_REMOVE_BUTTON_DESCRIPTION,
  CUA_HELPER_REMOVE_BUTTON_SOURCE,
  CUA_HELPER_VERSION,
} from './cuaHelperAbap';

export const CUA_HELPER_SPEC: RfcHelperSpec = {
  label: 'SE41 GUI status helper',
  group: CUA_HELPER_GROUP,
  groupDescription: CUA_HELPER_GROUP_DESCRIPTION,
  version: CUA_HELPER_VERSION,
  setupTool: 'SetupGuiStatusHelper',
  usedBy:
    'AddGuiStatusButton / CopyGuiStatus / DeleteGuiStatus / RemoveGuiStatusButton',
  modules: [
    {
      name: CUA_HELPER_ADD_BUTTON,
      description: CUA_HELPER_ADD_BUTTON_DESCRIPTION,
      source: CUA_HELPER_ADD_BUTTON_SOURCE,
      // An empty program is refused by the namespace check before anything else.
      probeParams: {
        IV_PROGRAM: '',
        IV_STATUS: '',
        IV_FUNCTION: '',
        IV_TEXT: '',
      },
    },
    {
      name: CUA_HELPER_COPY_STATUS,
      description: CUA_HELPER_COPY_STATUS_DESCRIPTION,
      source: CUA_HELPER_COPY_STATUS_SOURCE,
      // An empty target program is refused by the namespace check first.
      probeParams: {
        IV_SOURCE_PROGRAM: '',
        IV_SOURCE_STATUS: '',
        IV_TARGET_PROGRAM: '',
        IV_TARGET_STATUS: '',
      },
    },
    {
      name: CUA_HELPER_DELETE_STATUS,
      description: CUA_HELPER_DELETE_STATUS_DESCRIPTION,
      source: CUA_HELPER_DELETE_STATUS_SOURCE,
      // An empty program is refused by the namespace check first.
      probeParams: { IV_PROGRAM: '', IV_STATUS: '' },
    },
    {
      name: CUA_HELPER_REMOVE_BUTTON,
      description: CUA_HELPER_REMOVE_BUTTON_DESCRIPTION,
      source: CUA_HELPER_REMOVE_BUTTON_SOURCE,
      // An empty program is refused by the namespace check first.
      probeParams: { IV_PROGRAM: '', IV_STATUS: '', IV_FUNCTION: '' },
    },
  ],
};
