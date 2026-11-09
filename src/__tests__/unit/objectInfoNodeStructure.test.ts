/**
 * GetObjectInfo — the node-structure contract.
 *
 * Every XML fixture here is a REAL response captured from S/4HANA 2023 FPS02
 * (trimmed to the elements under test). The point of the round-2 rewrite is that
 * "no children" must be distinguishable from "could not answer", so the tests
 * pin exactly that.
 */

import {
  groupSignature,
  isContainerType,
  parseNodeDoc,
} from '../../handlers/system/readonly/handleGetObjectInfo';

const ROOT_PACKAGE = `<?xml version="1.0" encoding="utf-8"?><asx:abap version="1.0" xmlns:asx="http://www.sap.com/abapxml"><asx:values><DATA><TREE_CONTENT/><CATEGORIES><SEU_ADT_OBJECT_CATEGORY_INFO><CATEGORY>source_library</CATEGORY><CATEGORY_LABEL>Source Code Library</CATEGORY_LABEL></SEU_ADT_OBJECT_CATEGORY_INFO></CATEGORIES><OBJECT_TYPES><SEU_ADT_OBJECT_TYPE_INFO><OBJECT_TYPE>CLAS/OC</OBJECT_TYPE><CATEGORY_TAG>source_library</CATEGORY_TAG><OBJECT_TYPE_LABEL>Classes</OBJECT_TYPE_LABEL><NODE_ID>000009</NODE_ID></SEU_ADT_OBJECT_TYPE_INFO><SEU_ADT_OBJECT_TYPE_INFO><OBJECT_TYPE>INTF/OI</OBJECT_TYPE><CATEGORY_TAG>source_library</CATEGORY_TAG><OBJECT_TYPE_LABEL>Interfaces</OBJECT_TYPE_LABEL><NODE_ID>000014</NODE_ID></SEU_ADT_OBJECT_TYPE_INFO><SEU_ADT_OBJECT_TYPE_INFO><OBJECT_TYPE>TABL/DS</OBJECT_TYPE><CATEGORY_TAG>dictionary</CATEGORY_TAG><OBJECT_TYPE_LABEL>Structures</OBJECT_TYPE_LABEL><NODE_ID>000003</NODE_ID></SEU_ADT_OBJECT_TYPE_INFO></OBJECT_TYPES></DATA></asx:values></asx:abap>`;

const PHASE_TWO = `<?xml version="1.0" encoding="utf-8"?><asx:abap version="1.0" xmlns:asx="http://www.sap.com/abapxml"><asx:values><DATA><TREE_CONTENT><SEU_ADT_REPOSITORY_OBJ_NODE><OBJECT_TYPE>INTF/OI</OBJECT_TYPE><OBJECT_NAME>ZMY_IF_ONE</OBJECT_NAME><TECH_NAME>ZMY_IF_ONE</TECH_NAME><OBJECT_URI>/sap/bc/adt/oo/interfaces/zmy_if_one</OBJECT_URI><EXPANDABLE/><NODE_ID/><PARENT_NAME/><DESCRIPTION>First interface</DESCRIPTION><DESCRIPTION_TYPE>OI</DESCRIPTION_TYPE></SEU_ADT_REPOSITORY_OBJ_NODE><SEU_ADT_REPOSITORY_OBJ_NODE><OBJECT_TYPE>INTF/OI</OBJECT_TYPE><OBJECT_NAME>ZMY_IF_TWO</OBJECT_NAME><TECH_NAME>ZMY_IF_TWO</TECH_NAME><OBJECT_URI>/sap/bc/adt/oo/interfaces/zmy_if_two</OBJECT_URI><EXPANDABLE/><NODE_ID/><PARENT_NAME/><DESCRIPTION/><DESCRIPTION_TYPE>OI</DESCRIPTION_TYPE></SEU_ADT_REPOSITORY_OBJ_NODE></TREE_CONTENT><CATEGORIES/><OBJECT_TYPES/></DATA></asx:values></asx:abap>`;

describe('GetObjectInfo node-structure parsing', () => {
  it('reports an EMPTY BODY as unresolved, not as an empty tree', () => {
    // SAP answers HTTP 200 with a zero-length body both for a name it cannot
    // resolve and for the node_id='0000' the old code sent on every root call.
    // Returning `{leaves: [], groups: []}` for this is exactly the defect: it is
    // indistinguishable from a real object with no members.
    for (const body of ['', '   ', '\n']) {
      const doc = parseNodeDoc(body);
      expect(doc.unresolved).toBe(true);
    }
  });

  it('reads the member TYPE GROUPS off the root response', () => {
    // TREE_CONTENT is empty at the root; the members are reachable only through
    // the OBJECT_TYPES NODE_IDs. The old parser read TREE_CONTENT only, so the
    // tree was unreachable by construction.
    const doc = parseNodeDoc(ROOT_PACKAGE);
    expect(doc.unresolved).toBe(false);
    expect(doc.leaves).toHaveLength(0);
    expect(doc.groups.map((group) => group.objectType)).toEqual([
      'CLAS/OC',
      'INTF/OI',
      'TABL/DS',
    ]);
    expect(doc.groups.map((group) => group.nodeId)).toEqual([
      '000009',
      '000014',
      '000003',
    ]);
  });

  it('reads the leaves of a phase-two response, keeping a blank description blank', () => {
    const doc = parseNodeDoc(PHASE_TWO);
    expect(doc.unresolved).toBe(false);
    expect(doc.leaves).toHaveLength(2);
    expect(doc.leaves[0].OBJECT_NAME).toBe('ZMY_IF_ONE');
    expect(doc.leaves[0].DESCRIPTION).toBe('First interface');
    expect(doc.leaves[0].OBJECT_URI).toBe(
      '/sap/bc/adt/oo/interfaces/zmy_if_one',
    );
    // A self-closing <DESCRIPTION/> is an empty string, never the string
    // 'undefined' and never the previous row's text.
    expect(doc.leaves[1].DESCRIPTION).toBe('');
  });

  it('gives two documents with the same type nodes the same signature', () => {
    // This is how the package fallback is caught: for a non-container parent SAP
    // returns the object's PACKAGE tree byte-identically, so the signatures match.
    expect(groupSignature(parseNodeDoc(ROOT_PACKAGE))).toBe(
      groupSignature(parseNodeDoc(ROOT_PACKAGE)),
    );
    expect(groupSignature(parseNodeDoc(ROOT_PACKAGE))).not.toBe(
      groupSignature(parseNodeDoc(PHASE_TWO)),
    );
  });
});

describe('GetObjectInfo container-type guard', () => {
  it('accepts the measured container types', () => {
    for (const type of [
      'DEVC/K',
      'CLAS/OC',
      'INTF/OI',
      'PROG/P',
      'FUGR/F',
      'clas/oc',
    ]) {
      expect(isContainerType(type)).toBe(true);
    }
  });

  it('refuses types whose node structure is really their package tree', () => {
    // Measured live: DTEL/DE ZMY_DATA_ELEMENT returns a document byte-identical to
    // DEVC/K ZMY_DDIC_PKG, and TABL/DS ZMY_STRUCTURE to DEVC/K ZMY_API_PKG.
    // Answering those would report a package's objects as the object's members.
    for (const type of [
      'DTEL/DE',
      'DOMA/DD',
      'TABL/DS',
      'TABL/DT',
      'TTYP/DA',
    ]) {
      expect(isContainerType(type)).toBe(false);
    }
  });
});
