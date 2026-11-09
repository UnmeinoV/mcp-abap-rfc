/**
 * The SE93 transaction helper as an RfcHelperSpec (function group ZMCP_TRAN).
 * Sources and version: tranHelperAbap.ts.
 */

import type { RfcHelperSpec } from '../rfcHelper/rfcHelper';
import {
  TRAN_HELPER_CREATE,
  TRAN_HELPER_CREATE_DESCRIPTION,
  TRAN_HELPER_CREATE_SOURCE,
  TRAN_HELPER_DELETE,
  TRAN_HELPER_DELETE_DESCRIPTION,
  TRAN_HELPER_DELETE_SOURCE,
  TRAN_HELPER_GROUP,
  TRAN_HELPER_GROUP_DESCRIPTION,
  TRAN_HELPER_VERSION,
} from './tranHelperAbap';

export const TRAN_HELPER_SPEC: RfcHelperSpec = {
  label: 'SE93 transaction helper',
  group: TRAN_HELPER_GROUP,
  groupDescription: TRAN_HELPER_GROUP_DESCRIPTION,
  version: TRAN_HELPER_VERSION,
  setupTool: 'SetupTransactionHelper',
  usedBy: 'Transaction tools',
  modules: [
    {
      name: TRAN_HELPER_CREATE,
      description: TRAN_HELPER_CREATE_DESCRIPTION,
      source: TRAN_HELPER_CREATE_SOURCE,
      // An empty code is refused by the namespace check before anything else.
      probeParams: {
        IV_TCODE: '',
        IV_PROGRAM: '',
        IV_TEXT: '',
        IV_PACKAGE: '',
      },
    },
    {
      name: TRAN_HELPER_DELETE,
      description: TRAN_HELPER_DELETE_DESCRIPTION,
      source: TRAN_HELPER_DELETE_SOURCE,
      probeParams: { IV_TCODE: '' },
    },
  ],
};
