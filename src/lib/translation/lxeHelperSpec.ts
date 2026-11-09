/**
 * The SE63 translation helper as an RfcHelperSpec (function group ZMCP_LXE).
 * Sources and version: lxeHelperAbap.ts.
 */

import type { RfcHelperSpec } from '../rfcHelper/rfcHelper';
import {
  LXE_HELPER_GROUP,
  LXE_HELPER_GROUP_DESCRIPTION,
  LXE_HELPER_READ,
  LXE_HELPER_READ_DESCRIPTION,
  LXE_HELPER_READ_SOURCE,
  LXE_HELPER_RECORD,
  LXE_HELPER_RECORD_DESCRIPTION,
  LXE_HELPER_RECORD_SOURCE,
  LXE_HELPER_VERSION,
  LXE_HELPER_WRITE,
  LXE_HELPER_WRITE_DESCRIPTION,
  LXE_HELPER_WRITE_SOURCE,
} from './lxeHelperAbap';

export const LXE_HELPER_SPEC: RfcHelperSpec = {
  label: 'SE63 translation helper',
  group: LXE_HELPER_GROUP,
  groupDescription: LXE_HELPER_GROUP_DESCRIPTION,
  version: LXE_HELPER_VERSION,
  setupTool: 'SetupTranslationHelper',
  usedBy: 'Translation tools',
  modules: [
    {
      name: LXE_HELPER_READ,
      description: LXE_HELPER_READ_DESCRIPTION,
      source: LXE_HELPER_READ_SOURCE,
      probeParams: {
        IV_OBJTYPE: 'DTEL',
        IV_OBJNAME: 'MANDT',
        IV_TARGET_LANG: 'enUS',
      },
    },
    {
      name: LXE_HELPER_WRITE,
      description: LXE_HELPER_WRITE_DESCRIPTION,
      source: LXE_HELPER_WRITE_SOURCE,
      // An empty IT_TEXTS is refused before anything is read or written.
      probeParams: {
        IV_OBJTYPE: 'DTEL',
        IV_OBJNAME: 'MANDT',
        IV_TARGET_LANG: 'enUS',
        IT_TEXTS: [],
      },
    },
    {
      name: LXE_HELPER_RECORD,
      description: LXE_HELPER_RECORD_DESCRIPTION,
      source: LXE_HELPER_RECORD_SOURCE,
      // An empty IT_OBJECTS is refused before the request is even looked at.
      probeParams: {
        IV_TARGET_LANG: 'enUS',
        IV_REQUEST: '',
        IT_OBJECTS: [],
      },
    },
  ],
};
