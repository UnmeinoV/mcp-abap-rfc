/**
 * ABAP source of the DDIC deploy helper (function group ZMCP_DDIC) that
 * DeployDdic calls over RFC, installed by SetupDdicHelper.
 *
 * WHY A Z HELPER: a deeply nested interface structure is a tree of 10+ DDIC
 * objects (row structure -> table type -> parent -> top), each of which must be
 * active before the next can reference it. Through ADT that is 2-3 requests per
 * object, strictly serial, and an agent has to get the DDL annotations and the
 * order right object by object. DDIF_TABL_PUT / DDIF_TTYP_PUT and the
 * DDIF_*_ACTIVATE modules are not RFC-enabled, so one RFC-enabled wrapper takes
 * the whole tree as one spec and creates it in one call.
 *
 * It does NOT replace CreateStructure / CreateTableType / UpdateStructure: they
 * stay the tools for one or two objects and for changing existing ones. The two
 * routes coexist; the caller picks by the shape of the job.
 *
 * Measured 2026-11-12 (DM2, $TMP; the module run in-system through a classrun
 * probe, not yet over RFC): a 14-object, 7-level spec created and read back in
 * one call. The same spec built object by object by an agent through the ADT
 * tools stopped at 8 of 14 (a QUAN field referencing T006-MSEHI).
 *
 * Bump DDIC_HELPER_VERSION on ANY source change (comments included).
 */

/**
 * 1 = create structures and table types from a ddic-deploy/1 spec.
 * 2 = an .INCLUDE of something other than a structure is refused before writing;
 *     a failure names the step and never reports a message left over from an
 *     earlier call (review of MR !1).
 */
export const DDIC_HELPER_VERSION = '2';
export const DDIC_HELPER_GROUP = 'ZMCP_DDIC';
export const DDIC_HELPER_DEPLOY = 'Z_MCP_DDIC_DEPLOY';

export const DDIC_HELPER_GROUP_DESCRIPTION = 'MCP: DDIC objects from a spec';
export const DDIC_HELPER_DEPLOY_DESCRIPTION =
  'MCP: create nested DDIC structures and table types from a spec';

export const DDIC_HELPER_DEPLOY_SOURCE = `FUNCTION z_mcp_ddic_deploy
  IMPORTING
    VALUE(iv_spec) TYPE string
    VALUE(iv_package) TYPE devclass
    VALUE(iv_request) TYPE trkorr OPTIONAL
    VALUE(iv_language) TYPE spras OPTIONAL
    VALUE(iv_test) TYPE flag DEFAULT space
  EXPORTING
    VALUE(ev_version) TYPE char10
    VALUE(ev_status) TYPE flag
    VALUE(ev_message) TYPE bapi_msg
    VALUE(ev_warning) TYPE bapi_msg
    VALUE(ev_log) TYPE string.

* Installed by the mcp-abap-adt tool SetupDdicHelper - do not edit here,
* the tool overwrites this source. Helper version ${DDIC_HELPER_VERSION}.
*
* Creates a set of DDIC structures and table types - nested ones included -
* from ONE JSON spec (schema ddic-deploy/1) in a single call. Meant for deep
* nesting / many objects; the ADT tools (CreateStructure, CreateTableType) stay
* the way for one or two objects. Every check runs BEFORE anything is written;
* iv_test = 'X' stops after them. Then, object by object in dependency order
* (computed here - the order in the spec does not matter): RS_CORR_INSERT
* (TADIR + transport), DDIF_TABL_PUT / DDIF_TTYP_PUT, DDIF_TABL_ACTIVATE /
* DDIF_TTYP_ACTIVATE. Last, everything is read back from DD02L / DD40L / DD03L.
* Create only: if any object of the spec already exists, nothing is written.
* ev_status: S = all created and read back as specified, F = refused or failed
* (objects created before the failing one are kept). ev_log: one line per step.
*
* Measured 2026-11-12 ($TMP, run in-system): one .INCLUDE row in DD03P is
* expanded by the activation; a component typed by a structure / table type
* needs only ROLLNAME + COMPTYPE (S / L); RS_CORR_INSERT with object class DICT
* and object = type (4) + name registers TADIR; activation RC 0. A 14-object,
* 7-level spec (includes, structure and table-type fields, row types of a
* structure / standard structure / data element, CURR and QUAN references) was
* created and read back in one call. NOT measured: a transportable package
* with a request, a failure in the middle.

  TYPES:
    BEGIN OF ty_field,
      name      TYPE fieldname,
      type      TYPE rollname,
      data_type TYPE datatype_d,
      length    TYPE ddleng,
      decimals  TYPE decimals,
      label     TYPE as4text,
      ref_table TYPE reftable,
      ref_field TYPE reffield,
    END OF ty_field,
    tt_field TYPE STANDARD TABLE OF ty_field WITH EMPTY KEY,
    BEGIN OF ty_object,
      kind     TYPE string,
      name     TYPE ddobjname,
      label    TYPE as4text,
      fields   TYPE tt_field,
      row_type TYPE ttrowtype,
    END OF ty_object,
    tt_object TYPE STANDARD TABLE OF ty_object WITH EMPTY KEY,
    BEGIN OF ty_spec,
      schema  TYPE string,
      objects TYPE tt_object,
    END OF ty_spec,
    BEGIN OF ty_kind,
      name     TYPE ddobjname,
      comptype TYPE comptype,
    END OF ty_kind.

  DATA: ls_spec  TYPE ty_spec,
        lt_order TYPE tt_object,
        lt_left  TYPE tt_object,
        lt_kind  TYPE HASHED TABLE OF ty_kind WITH UNIQUE KEY name,
        lt_refs  TYPE SORTED TABLE OF ddobjname WITH UNIQUE KEY table_line,
        lt_dd03p TYPE STANDARD TABLE OF dd03p,
        lt_state TYPE STANDARD TABLE OF as4local WITH EMPTY KEY,
        ls_dd02v TYPE dd02v,
        ls_dd40v TYPE dd40v,
        lv_lang  TYPE spras,
        lv_moved TYPE abap_bool,
        lv_ready TYPE abap_bool,
        lv_pos   TYPE tabfdpos,
        lv_rc    TYPE sy-subrc,
        lv_x     TYPE c LENGTH 30,
        lv_msg   TYPE bapi_msg,
        lv_step  TYPE string,
        lv_sym   TYPE string.

  ev_version = '${DDIC_HELPER_VERSION}'.
  ev_status = 'F'.
  CLEAR: ev_message, ev_warning, ev_log.
  lv_lang = COND #( WHEN iv_language IS INITIAL THEN sy-langu ELSE iv_language ).

* ---- 1. Spec ---------------------------------------------------------
  TRY.
      /ui2/cl_json=>deserialize( EXPORTING json        = iv_spec
                                           pretty_name = /ui2/cl_json=>pretty_mode-camel_case
                                 CHANGING  data        = ls_spec ).
    CATCH cx_root INTO DATA(lx_json).
      ev_message = |The spec is not valid JSON: { lx_json->get_text( ) }|.
      RETURN.
  ENDTRY.
  IF ls_spec-schema <> 'ddic-deploy/1' OR ls_spec-objects IS INITIAL.
    ev_message = |The spec must have schema ddic-deploy/1 and at least one object|.
    RETURN.
  ENDIF.
  LOOP AT ls_spec-objects REFERENCE INTO DATA(lr_obj).
    lr_obj->name = to_upper( lr_obj->name ).
    lr_obj->row_type = to_upper( lr_obj->row_type ).
    LOOP AT lr_obj->fields REFERENCE INTO DATA(lr_fld).
      lr_fld->name = to_upper( lr_fld->name ).
      lr_fld->type = to_upper( lr_fld->type ).
      lr_fld->data_type = to_upper( lr_fld->data_type ).
      lr_fld->ref_table = to_upper( lr_fld->ref_table ).
      lr_fld->ref_field = to_upper( lr_fld->ref_field ).
    ENDLOOP.
  ENDLOOP.

* ---- 2. Package and transport (same checks as Z_MCP_TRAN_CREATE) -----
  SELECT SINGLE devclass FROM tdevc WHERE devclass = @iv_package INTO @lv_x.
  IF sy-subrc <> 0.
    ev_message = |Package { iv_package } does not exist|.
    RETURN.
  ENDIF.
  IF iv_package(1) <> '$'.
    IF iv_request IS INITIAL.
      ev_message = |Package { iv_package } is transportable: a transport request is required|.
      RETURN.
    ENDIF.
    SELECT SINGLE trfunction, trstatus FROM e070 WHERE trkorr = @iv_request
      INTO (@DATA(lv_trfunction), @DATA(lv_trstatus)).
    IF sy-subrc <> 0.
      ev_message = |Transport request { iv_request } does not exist|.
      RETURN.
    ENDIF.
    IF lv_trstatus <> 'D'.
      ev_message = |Transport request { iv_request } is not modifiable (status { lv_trstatus })|.
      RETURN.
    ENDIF.
    IF lv_trfunction <> 'K' AND lv_trfunction <> 'S'.
      ev_message = |Transport request { iv_request } has type { lv_trfunction }; DDIC objects need a | &&
                   |workbench request (K) or one of its tasks|.
      RETURN.
    ENDIF.
  ENDIF.

* ---- 3. Objects ------------------------------------------------------
  LOOP AT ls_spec-objects INTO DATA(ls_obj).
    IF ls_obj-name IS INITIAL OR NOT ( ls_obj-name(1) = 'Z' OR ls_obj-name(1) = 'Y' ).
      ev_message = |{ ls_obj-name } is not in the customer namespace (Z*, Y*) - refused|.
      RETURN.
    ENDIF.
    IF REDUCE i( INIT n = 0 FOR o IN ls_spec-objects WHERE ( name = ls_obj-name ) NEXT n = n + 1 ) > 1.
      ev_message = |{ ls_obj-name } appears more than once in the spec|.
      RETURN.
    ENDIF.
    IF ls_obj-label IS INITIAL.
      ev_message = |{ ls_obj-name } has no label (description)|.
      RETURN.
    ENDIF.
    CASE ls_obj-kind.
      WHEN 'structure'.
        IF ls_obj-fields IS INITIAL.
          ev_message = |Structure { ls_obj-name } has no fields|.
          RETURN.
        ENDIF.
        INSERT VALUE #( name = ls_obj-name comptype = 'S' ) INTO TABLE lt_kind.
      WHEN 'tableType'.
        IF ls_obj-row_type IS INITIAL.
          ev_message = |Table type { ls_obj-name } has no rowType|.
          RETURN.
        ENDIF.
        INSERT VALUE #( name = ls_obj-name comptype = 'L' ) INTO TABLE lt_kind.
      WHEN OTHERS.
        ev_message = |{ ls_obj-name }: kind must be structure or tableType, not "{ ls_obj-kind }"|.
        RETURN.
    ENDCASE.
    " Any version, inactive included: create only.
    SELECT SINGLE tabname FROM dd02l WHERE tabname = @ls_obj-name INTO @lv_x.
    IF sy-subrc <> 0.
      SELECT SINGLE typename FROM dd40l WHERE typename = @ls_obj-name INTO @lv_x.
    ENDIF.
    IF sy-subrc = 0.
      ev_message = |{ ls_obj-name } already exists - this helper only creates; nothing was written|.
      RETURN.
    ENDIF.
    LOOP AT ls_obj-fields INTO DATA(ls_f).
      IF ls_f-name IS INITIAL OR ( ls_f-type IS INITIAL AND ls_f-data_type IS INITIAL ).
        ev_message = |{ ls_obj-name }: every field needs a name and either type or dataType|.
        RETURN.
      ENDIF.
      IF ls_f-type IS NOT INITIAL AND ls_f-data_type IS NOT INITIAL.
        ev_message = |{ ls_obj-name }-{ ls_f-name }: give type or dataType, not both|.
        RETURN.
      ENDIF.
      IF ( ls_f-data_type = 'CURR' OR ls_f-data_type = 'QUAN' ) AND ( ls_f-ref_table IS INITIAL OR ls_f-ref_field IS INITIAL ).
        ev_message = |{ ls_obj-name }-{ ls_f-name }: a { ls_f-data_type } field needs refTable and refField|.
        RETURN.
      ENDIF.
      IF ls_f-type IS NOT INITIAL.
        INSERT ls_f-type INTO TABLE lt_refs.
      ENDIF.
    ENDLOOP.
    IF ls_obj-row_type IS NOT INITIAL.
      INSERT ls_obj-row_type INTO TABLE lt_refs.
    ENDIF.
  ENDLOOP.

* ---- 4. References outside the spec must exist and be active ---------
  LOOP AT lt_refs INTO DATA(lv_ref).
    CHECK NOT line_exists( lt_kind[ name = lv_ref ] ).
    SELECT SINGLE rollname FROM dd04l WHERE rollname = @lv_ref AND as4local = 'A' INTO @lv_x.
    IF sy-subrc = 0.
      INSERT VALUE #( name = lv_ref comptype = 'E' ) INTO TABLE lt_kind.
      CONTINUE.
    ENDIF.
    SELECT SINGLE tabname FROM dd02l WHERE tabname = @lv_ref AND as4local = 'A' INTO @lv_x.
    IF sy-subrc = 0.
      INSERT VALUE #( name = lv_ref comptype = 'S' ) INTO TABLE lt_kind.
      CONTINUE.
    ENDIF.
    SELECT SINGLE typename FROM dd40l WHERE typename = @lv_ref AND as4local = 'A' INTO @lv_x.
    IF sy-subrc = 0.
      INSERT VALUE #( name = lv_ref comptype = 'L' ) INTO TABLE lt_kind.
      CONTINUE.
    ENDIF.
    ev_message = |{ lv_ref } is referenced but is neither in the spec nor an active data element, structure or table type|.
    RETURN.
  ENDLOOP.

* ---- 4b. An .INCLUDE must name a structure ----------------------------
  " Otherwise the checks above pass and only DDIF_TABL_PUT fails, after objects were written.
  LOOP AT ls_spec-objects INTO ls_obj.
    LOOP AT ls_obj-fields INTO ls_f WHERE name = '.INCLUDE'.
      IF lt_kind[ name = ls_f-type ]-comptype <> 'S'.
        ev_message = |{ ls_obj-name }: .INCLUDE { ls_f-type } is not a structure - nothing was written|.
        RETURN.
      ENDIF.
    ENDLOOP.
  ENDLOOP.

* ---- 5. Dependency order: what is referenced comes first --------------
  lt_left = ls_spec-objects.
  WHILE lt_left IS NOT INITIAL.
    lv_moved = abap_false.
    LOOP AT lt_left INTO ls_obj.
      DATA(lv_idx) = sy-tabix.
      lv_ready = xsdbool( ls_obj-row_type IS INITIAL OR NOT line_exists( lt_left[ name = ls_obj-row_type ] ) ).
      LOOP AT ls_obj-fields INTO ls_f WHERE type IS NOT INITIAL.
        IF line_exists( lt_left[ name = ls_f-type ] ).
          lv_ready = abap_false.
        ENDIF.
      ENDLOOP.
      IF lv_ready = abap_true.
        APPEND ls_obj TO lt_order.
        DELETE lt_left INDEX lv_idx.
        lv_moved = abap_true.
        EXIT.
      ENDIF.
    ENDLOOP.
    IF lv_moved = abap_false.
      ev_message = |Circular reference among: { REDUCE string( INIT s = \`\` FOR o IN lt_left NEXT s = |{ s } { o-name }| ) }|.
      RETURN.
    ENDIF.
  ENDWHILE.
  ev_log = |ORDER{ REDUCE string( INIT s = \`\` FOR o IN lt_order NEXT s = |{ s } { o-name }| ) }|.

  IF iv_test = 'X'.
    ev_status = 'S'.
    ev_message = 'TEST MODE: every check passed, nothing was created.'.
    RETURN.
  ENDIF.

* ---- 6. Write: transport entry, DDIC source, activation; stop at the first failure
  LOOP AT lt_order INTO ls_obj.
    DATA(lv_type) = COND trobjtype( WHEN ls_obj-kind = 'structure' THEN 'TABL' ELSE 'TTYP' ).

    " Object class DICT: object = object type (4) + name (measured; abapGit does the same).
    " Before each call the sy-msg* fields are noted, so a failure reports only a message raised by that call.
    lv_step = 'RS_CORR_INSERT'.
    lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
    CALL FUNCTION 'RS_CORR_INSERT'
      EXPORTING
        object              = |{ lv_type }{ ls_obj-name }|
        object_class        = 'DICT'
        mode                = 'I'
        global_lock         = 'X'
        devclass            = iv_package
        korrnum             = iv_request
        master_language     = lv_lang
        suppress_dialog     = 'X'
      EXCEPTIONS
        cancelled           = 1
        permission_failure  = 2
        unknown_objectclass = 3
        OTHERS              = 4.
    lv_rc = sy-subrc.
    ev_log = |{ ev_log }\\n{ ls_obj-name } CORR RC={ lv_rc }|.

    IF lv_rc = 0 AND ls_obj-kind = 'structure'.
      CLEAR: lt_dd03p, lv_pos.
      ls_dd02v = VALUE #( tabname = ls_obj-name ddlanguage = lv_lang tabclass = 'INTTAB'
                          ddtext = ls_obj-label exclass = '1' ).
      LOOP AT ls_obj-fields INTO ls_f.
        lv_pos = lv_pos + 1.
        APPEND VALUE #( tabname = ls_obj-name fieldname = ls_f-name position = lv_pos ddlanguage = lv_lang
                        reftable = ls_f-ref_table reffield = ls_f-ref_field ) TO lt_dd03p ASSIGNING FIELD-SYMBOL(<p>).
        IF ls_f-name = '.INCLUDE'.
          <p>-precfield = ls_f-type.
          <p>-comptype = 'S'.
        ELSEIF ls_f-type IS NOT INITIAL.
          <p>-rollname = ls_f-type.
          <p>-comptype = lt_kind[ name = ls_f-type ]-comptype.
        ELSE.
          <p>-datatype = ls_f-data_type.
          <p>-leng = ls_f-length.
          <p>-decimals = ls_f-decimals.
          <p>-ddtext = ls_f-label.
        ENDIF.
      ENDLOOP.
      lv_step = 'DDIF_TABL_PUT'.
      lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
      CALL FUNCTION 'DDIF_TABL_PUT'
        EXPORTING
          name              = ls_obj-name
          dd02v_wa          = ls_dd02v
        TABLES
          dd03p_tab         = lt_dd03p
        EXCEPTIONS
          tabl_not_found    = 1
          name_inconsistent = 2
          tabl_inconsistent = 3
          put_failure       = 4
          put_refused       = 5
          OTHERS            = 6.
      lv_rc = sy-subrc.
      ev_log = |{ ev_log }\\n{ ls_obj-name } PUT RC={ lv_rc }|.
    ELSEIF lv_rc = 0.
      ls_dd40v = VALUE #( typename = ls_obj-name ddlanguage = lv_lang rowtype = ls_obj-row_type
                          rowkind = lt_kind[ name = ls_obj-row_type ]-comptype
                          accessmode = 'T' keydef = 'D' keykind = 'N' ddtext = ls_obj-label ).
      lv_step = 'DDIF_TTYP_PUT'.
      lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
      CALL FUNCTION 'DDIF_TTYP_PUT'
        EXPORTING
          name              = ls_obj-name
          dd40v_wa          = ls_dd40v
        EXCEPTIONS
          ttyp_not_found    = 1
          name_inconsistent = 2
          ttyp_inconsistent = 3
          put_failure       = 4
          put_refused       = 5
          OTHERS            = 6.
      lv_rc = sy-subrc.
      ev_log = |{ ev_log }\\n{ ls_obj-name } PUT RC={ lv_rc }|.
    ENDIF.

    IF lv_rc = 0.
      DATA(lv_act_rc) = 0.
      lv_sym = |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }|.
      IF ls_obj-kind = 'structure'.
        lv_step = 'DDIF_TABL_ACTIVATE'.
        CALL FUNCTION 'DDIF_TABL_ACTIVATE'
          EXPORTING
            name        = ls_obj-name
            auth_chk    = 'X'
          IMPORTING
            rc          = lv_act_rc
          EXCEPTIONS
            not_found   = 1
            put_failure = 2
            OTHERS      = 3.
      ELSE.
        lv_step = 'DDIF_TTYP_ACTIVATE'.
        CALL FUNCTION 'DDIF_TTYP_ACTIVATE'
          EXPORTING
            name        = ls_obj-name
          IMPORTING
            rc          = lv_act_rc
          EXCEPTIONS
            not_found   = 1
            put_failure = 2
            OTHERS      = 3.
      ENDIF.
      lv_rc = sy-subrc.
      ev_log = |{ ev_log }\\n{ ls_obj-name } ACTIVATE SUBRC={ lv_rc } RC={ lv_act_rc }|.
      " RC 0 = active, 4 = active with warnings, above 4 = not active.
      IF lv_rc = 0 AND lv_act_rc > 4.
        lv_rc = lv_act_rc.
      ENDIF.
    ENDIF.

    IF lv_rc <> 0.
      " Only a message raised by the failing call: sy-msg* unchanged since before it is a leftover.
      CLEAR lv_msg.
      IF sy-msgid IS NOT INITIAL
         AND |{ sy-msgid }/{ sy-msgno }/{ sy-msgv1 }/{ sy-msgv2 }/{ sy-msgv3 }/{ sy-msgv4 }| <> lv_sym.
        MESSAGE ID sy-msgid TYPE 'S' NUMBER sy-msgno
          WITH sy-msgv1 sy-msgv2 sy-msgv3 sy-msgv4 INTO lv_msg.
      ENDIF.
      IF lv_msg IS INITIAL.
        lv_msg = |{ lv_step } returned { lv_rc } without a message|.
      ENDIF.
      ROLLBACK WORK.
      ev_message = |{ ls_obj-name } failed (see ev_log): { lv_msg } - objects before it were kept|.
      RETURN.
    ENDIF.
    COMMIT WORK.
  ENDLOOP.

* ---- 7. Read back what was stored ------------------------------------
  LOOP AT lt_order INTO ls_obj.
    IF ls_obj-kind = 'structure'.
      SELECT as4local FROM dd02l WHERE tabname = @ls_obj-name INTO TABLE @lt_state.
    ELSE.
      SELECT as4local FROM dd40l WHERE typename = @ls_obj-name INTO TABLE @lt_state.
    ENDIF.
    IF NOT line_exists( lt_state[ table_line = 'A' ] ) OR lines( lt_state ) > 1.
      ev_message = |{ ls_obj-name } has no active version, or an inactive version is left|.
      RETURN.
    ENDIF.
    IF ls_obj-kind = 'tableType'.
      SELECT SINGLE typename FROM dd40l
        WHERE typename = @ls_obj-name AND as4local = 'A' AND rowtype = @ls_obj-row_type INTO @lv_x.
      IF sy-subrc <> 0.
        ev_message = |{ ls_obj-name } reads back with another row type than { ls_obj-row_type }|.
        RETURN.
      ENDIF.
    ENDIF.
    LOOP AT ls_obj-fields INTO ls_f.
      IF ls_f-name = '.INCLUDE'.
        SELECT SINGLE fieldname FROM dd03l
          WHERE tabname = @ls_obj-name AND as4local = 'A' AND fieldname = '.INCLUDE' AND precfield = @ls_f-type INTO @lv_x.
      ELSEIF ls_f-type IS NOT INITIAL.
        SELECT SINGLE fieldname FROM dd03l
          WHERE tabname = @ls_obj-name AND as4local = 'A' AND fieldname = @ls_f-name AND rollname = @ls_f-type INTO @lv_x.
      ELSE.
        SELECT SINGLE fieldname FROM dd03l
          WHERE tabname = @ls_obj-name AND as4local = 'A' AND fieldname = @ls_f-name AND datatype = @ls_f-data_type INTO @lv_x.
      ENDIF.
      IF sy-subrc <> 0.
        ev_message = |{ ls_obj-name }-{ ls_f-name } does not read back as specified|.
        RETURN.
      ENDIF.
    ENDLOOP.
    ev_log = |{ ev_log }\\n{ ls_obj-name } READBACK OK|.
  ENDLOOP.

  ev_status = 'S'.
  ev_message = |{ lines( lt_order ) } DDIC objects created and read back as specified in { iv_package }|.

ENDFUNCTION.`;
